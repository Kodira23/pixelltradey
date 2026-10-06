import { createClient } from "npm:@supabase/supabase-js@2";

const MODEL = "claude-haiku-4-5-20251001";
const PAUSE_MINUTES = 10; // AI stays quiet this long after a human reply

// Edit this so it matches what VantyxTrade really offers.
const SYSTEM_PROMPT = `You are the VantyxTrade support assistant, chatting inside the app's support widget.

About VantyxTrade (a crypto trading platform):
- Dashboard: overview of the user's account and balance.
- Markets: live crypto prices and market overview.
- Spot: buy and sell crypto at current market prices.
- Bots: automated trading bots users can set up and run.
- Settings: account and profile settings.
- Withdrawals: users submit a withdrawal request with a method and wallet address. The VantyxTrade team reviews each request and approves or rejects it, and the balance is updated on approval.
- Support: users can chat here, and a human team member can join the conversation at any time.

Rules:
- Reply in ONE or TWO short sentences, plain text only. Never use lists or long explanations.
- Only describe features listed above. Never invent fees, limits, processing times, supported coins, or returns.
- Never give financial advice or promise profits.
- For anything account-specific (balance, a pending withdrawal, an account problem), say a team member will follow up in this chat.
- If the user asks for a human, say a team member will reply here shortly.
- If you don't know something, say so and offer to have the team follow up.`;

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const msg = payload.record;
    if (payload.type !== "INSERT" || !msg || msg.sender !== "user") {
      return new Response("ignored");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // true when AI is switched off, or a human replied recently
    async function aiBlocked() {
      const { data: convo } = await supabase
        .from("conversations")
        .select("ai_enabled, last_human_reply_at")
        .eq("id", msg.conversation_id)
        .single();
      if (!convo || convo.ai_enabled === false) return true;
      if (convo.last_human_reply_at) {
        const mins =
          (Date.now() - new Date(convo.last_human_reply_at).getTime()) / 60000;
        if (mins < PAUSE_MINUTES) return true;
      }
      return false;
    }

    if (await aiBlocked()) return new Response("human active");

    // recent history for context
    const { data: rows } = await supabase
      .from("messages")
      .select("sender, text")
      .eq("conversation_id", msg.conversation_id)
      .order("created_at", { ascending: false })
      .limit(12);

    const history = (rows ?? []).reverse().map((r) => ({
      role: r.sender === "user" ? "user" : "assistant",
      content: r.text,
    }));
    while (history.length && history[0].role !== "user") history.shift();
    if (!history.length) return new Response("no history");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 150,
        system: SYSTEM_PROMPT,
        messages: history,
      }),
    });
    const data = await res.json();
    const reply = data?.content
      ?.find((b: any) => b.type === "text")
      ?.text?.trim();
    if (!reply) {
      console.error("No reply from model", JSON.stringify(data));
      return new Response("no reply", { status: 500 });
    }

    // a human may have jumped in while we were generating
    if (await aiBlocked()) return new Response("human took over");

    await supabase.from("messages").insert({
      conversation_id: msg.conversation_id,
      sender: "ai",
      text: reply,
    });

    return new Response("ok");
  } catch (e) {
    console.error(e);
    return new Response("error", { status: 500 });
  }
});
