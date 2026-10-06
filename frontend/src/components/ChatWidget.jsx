import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

// =====================================================================
// EDIT THIS SECTION: the bot's wording and knowledge
// =====================================================================
const OPENING_BUTTONS = ["Hello", "I have a question"];

const WELCOME =
  "Yes, welcome to VantyxTrade! Here we deal with high successful wins using manual and AI trades.";
const CHOICE_PROMPT =
  "Sure! Would you like to continue with our AI assistant or chat with a live agent?";
const CHOICES = ["Continue with AI", "Chat with a live agent"];
const ASK_NOW = "Great! Go ahead and ask your question.";
const AGENT_NOW =
  "Connecting you to a live agent now. A team member will reply here shortly.";
const AI_CANT =
  "I'm not able to answer that one, so I'm connecting you with a live agent. A team member will reply here shortly.";

// keywords: if the user's message contains any of these, that answer is used.
// The entry with the most matching keywords wins.
const FAQ = [
  {
    keywords: ["manual", "ai trad", "how do you trade", "how does trading work"],
    answer:
      "VantyxTrade lets you trade manually or with AI-powered trading, so you can choose the approach that suits you.",
  },
  {
    keywords: ["bot", "automated", "automatic"],
    answer:
      "Bots are automated trading tools you can set up and run from the Bots page.",
  },
  {
    keywords: ["spot", "buy", "sell"],
    answer:
      "On the Spot page you can buy and sell crypto at current market prices.",
  },
  {
    keywords: ["market", "price", "prices", "coins", "crypto list"],
    answer:
      "The Markets page shows live crypto prices and an overview of the market.",
  },
  {
    keywords: ["dashboard", "overview", "account summary"],
    answer:
      "Your Dashboard gives you an overview of your account and balance.",
  },
  {
    keywords: ["withdraw", "cash out", "payout"],
    answer:
      "To withdraw, submit a withdrawal request with your method and wallet address. Our team reviews each request and approves or rejects it.",
  },
  {
    keywords: ["settings", "profile", "password", "change name", "change email"],
    answer: "You can manage your account and profile on the Settings page.",
  },
  {
    keywords: ["what is vantyx", "about", "who are you", "what do you do", "what is this"],
    answer:
      "VantyxTrade is a crypto trading platform where you can trade manually or with AI trades.",
  },
];

// Anything with these words goes straight to a live agent
const HANDOFF_WORDS = [
  "human",
  "agent",
  "real person",
  "refund",
  "pending",
  "not received",
  "stuck",
  "problem",
  "issue",
  "complaint",
  "scam",
  "my balance",
  "my money",
  "my funds",
];
// =====================================================================

function getBotReply(text, mode) {
  const t = text.trim().toLowerCase();

  if (t === "hello") {
    return { text: WELCOME, options: ["I have a question"], nextMode: mode };
  }
  if (t === "i have a question") {
    return { text: CHOICE_PROMPT, options: CHOICES, nextMode: "menu" };
  }
  if (t === "continue with ai") {
    return { text: ASK_NOW, nextMode: "ai" };
  }
  if (t === "chat with a live agent") {
    return { text: AGENT_NOW, handoff: true, nextMode: "human" };
  }

  // Typed something before choosing AI or agent
  if (mode !== "ai") {
    return { text: CHOICE_PROMPT, options: CHOICES, nextMode: "menu" };
  }

  // AI mode: escalate sensitive topics, otherwise try to answer
  if (HANDOFF_WORDS.some((w) => t.includes(w))) {
    return { text: AI_CANT, handoff: true, nextMode: "human" };
  }

  let best = null;
  let bestScore = 0;
  for (const item of FAQ) {
    const score = item.keywords.filter((k) => t.includes(k)).length;
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  if (best) {
    return {
      text: best.answer,
      options: ["Chat with a live agent"],
      nextMode: "ai",
    };
  }

  return { text: AI_CANT, handoff: true, nextMode: "human" };
}

// Messages from the database (user + live agent replies)
const fromDb = (m) => ({
  id: m.id,
  from: m.sender === "user" ? "user" : "bot",
  sender: m.sender,
  text: m.text,
  options: null,
  ts: new Date(m.created_at).getTime(),
  local: false,
});

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [ready, setReady] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  // start | menu | ai | human
  const [mode, setMode] = useState("start");
  const channelRef = useRef(null);

  const storageKey = userId ? `vt_support_${userId}` : null;

  // Save the bot part of the chat so it survives a page reload
  useEffect(() => {
    if (!ready || !storageKey) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ mode, msgs: messages.filter((m) => m.local) }),
      );
    } catch {
      /* storage unavailable: ignore */
    }
  }, [messages, mode, ready, storageKey]);

  // Bootstrap: find the user's conversation, load history, listen for agent replies
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setReady(true);
        return;
      }
      if (cancelled) return;
      setUserId(user.id);

      // Restore the bot part of the chat
      let saved = { mode: "start", msgs: [] };
      try {
        const raw = localStorage.getItem(`vt_support_${user.id}`);
        if (raw) saved = JSON.parse(raw);
      } catch {
        /* ignore */
      }

      let convoId = null;
      const { data: existing, error: findErr } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (findErr) console.error("Failed to look up conversation:", findErr.message);

      if (existing) {
        convoId = existing.id;
      } else {
        const { data: created, error: createErr } = await supabase
          .from("conversations")
          .insert({ user_id: user.id })
          .select()
          .single();
        if (createErr) {
          console.error("Failed to create conversation:", createErr.message);
        } else {
          convoId = created.id;
        }
      }

      if (cancelled) return;
      if (!convoId) {
        setMessages(saved.msgs || []);
        setMode(saved.mode || "start");
        setReady(true);
        return;
      }
      setConversationId(convoId);

      const { data: history, error: msgErr } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convoId)
        .order("created_at", { ascending: true });

      if (msgErr) console.error("Failed to load messages:", msgErr.message);

      const dbMsgs = (history || []).map(fromDb);
      const merged = [...dbMsgs, ...(saved.msgs || [])].sort((a, b) => a.ts - b.ts);

      if (!cancelled) {
        setMessages(merged);
        // If a live agent has ever replied, the chat stays in live-agent mode
        setMode(
          dbMsgs.some((m) => m.sender === "admin") ? "human" : saved.mode || "start",
        );
      }

      // Realtime: live agent replies appear instantly
      const channel = supabase
        .channel(`messages:${convoId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${convoId}`,
          },
          (payload) => {
            const m = payload.new;
            if (m.sender === "admin") {
              setMode("human");
              setBotTyping(false);
            }
            setMessages((prev) =>
              prev.some((x) => x.id === m.id) ? prev : [...prev, fromDb(m)],
            );
          },
        )
        .subscribe();

      channelRef.current = channel;
      if (!cancelled) setReady(true);
    }

    bootstrap();

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  function addLocal(msg) {
    setMessages((prev) => [
      ...prev,
      {
        id: `l-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ts: Date.now(),
        local: true,
        options: null,
        ...msg,
      },
    ]);
  }

  // Send a message to the live agent (saved in Supabase, shows in Admin → Chats)
  async function sendToAdmin(text) {
    if (!conversationId) return;
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender: "user", text })
      .select()
      .single();
    if (error) {
      console.error("Failed to send message:", error.message);
      return;
    }
    setMessages((prev) =>
      prev.some((x) => x.id === data.id) ? prev : [...prev, fromDb(data)],
    );
  }

  function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");

    // Live agent mode: straight to the admin, no bot
    if (mode === "human") {
      sendToAdmin(trimmed);
      return;
    }

    const reply = getBotReply(trimmed, mode);

    if (reply.handoff) {
      sendToAdmin(trimmed); // admin sees the question or the live-agent request
    } else {
      addLocal({ from: "user", sender: "user", text: trimmed });
    }

    setBotTyping(true);
    setTimeout(() => {
      setBotTyping(false);
      setMode(reply.nextMode);
      addLocal({
        from: "bot",
        sender: "ai",
        text: reply.text,
        options: reply.options || null,
      });
    }, 700);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") sendMessage(input);
  }

  const showGreeting = messages.length === 0;
  const last = messages[messages.length - 1];
  const lastOptions =
    mode !== "human" && !botTyping && last && last.sender === "ai" && last.options
      ? last.options
      : [];

  return (
    <>
      {/* Floating launcher button */}
      {!open && (
        <button
          className="chat-launcher"
          onClick={() => setOpen(true)}
          aria-label="Open customer support chat"
        >
          💬
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="chat-widget">
          <div className="chat-widget-header">
            <button
              className="chat-back-btn"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ‹
            </button>
            <span>Customer Support</span>
            <div className="chat-menu-wrap">
              <button
                className="chat-menu-btn"
                onClick={() => setMenuOpen((m) => !m)}
                aria-label="Menu"
              >
                ☰
              </button>
              {menuOpen && (
                <>
                  <div
                    className="chat-menu-overlay"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="chat-dropdown-menu">
                    <button className="chat-dropdown-item" disabled>
                      <span className="chat-dropdown-icon">✏️</span>
                      <span className="chat-dropdown-text">
                        Change Name
                        <span className="chat-dropdown-soon">Coming soon</span>
                      </span>
                    </button>
                    <button className="chat-dropdown-item" disabled>
                      <span className="chat-dropdown-icon">✉️</span>
                      <span className="chat-dropdown-text">
                        Email transcript
                        <span className="chat-dropdown-soon">Coming soon</span>
                      </span>
                    </button>
                    <button
                      className="chat-dropdown-item"
                      onClick={() => setSoundOn((s) => !s)}
                    >
                      <span className="chat-dropdown-icon">
                        {soundOn ? "🔊" : "🔇"}
                      </span>
                      <span className="chat-dropdown-text">
                        Sound {soundOn ? "On" : "Off"}
                      </span>
                    </button>
                    <button className="chat-dropdown-item" disabled>
                      <span className="chat-dropdown-icon">⬡</span>
                      <span className="chat-dropdown-text">
                        Pop out widget
                        <span className="chat-dropdown-soon">Coming soon</span>
                      </span>
                    </button>
                    <button className="chat-dropdown-item" disabled>
                      <span className="chat-dropdown-icon">+</span>
                      <span className="chat-dropdown-text">
                        Add Chat to your website
                        <span className="chat-dropdown-soon">Coming soon</span>
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="chat-widget-body">
            {!ready && (
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading…</p>
            )}

            {ready && showGreeting && (
              <div className="chat-bubble-row bot">
                <div className="chat-avatar">🎧</div>
                <div className="chat-bubble bot">👋 Hi! How can we help?</div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-bubble-row ${m.from === "user" ? "user" : "bot"}`}
              >
                {m.from === "bot" && (
                  <div className="chat-avatar">
                    {m.sender === "ai" ? "🤖" : "🎧"}
                  </div>
                )}
                <div className={`chat-bubble ${m.from}`}>
                  {m.text}
                  {m.sender === "ai" && (
                    <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>
                      AI assistant
                    </div>
                  )}
                  {m.sender === "admin" && (
                    <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>
                      Live agent
                    </div>
                  )}
                </div>
              </div>
            ))}

            {botTyping && (
              <div className="chat-bubble-row bot">
                <div className="chat-avatar">🤖</div>
                <div className="chat-bubble bot" style={{ opacity: 0.7 }}>
                  Typing…
                </div>
              </div>
            )}

            {/* Opening choices */}
            {ready && showGreeting && (
              <div className="chat-quick-replies">
                {OPENING_BUTTONS.map((qr) => (
                  <button
                    key={qr}
                    className="chat-quick-reply-btn"
                    onClick={() => sendMessage(qr)}
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Choices offered by the bot */}
            {lastOptions.length > 0 && (
              <div className="chat-quick-replies">
                {lastOptions.map((opt) => (
                  <button
                    key={opt}
                    className="chat-quick-reply-btn"
                    onClick={() => sendMessage(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="chat-widget-input-row">
            <input
              type="text"
              placeholder="Type here and press enter..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!ready}
            />
            <button
              className="chat-send-btn"
              onClick={() => sendMessage(input)}
              aria-label="Send message"
              disabled={!ready}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
