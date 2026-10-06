import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

// Only this Supabase user can open the admin panel
const ADMIN_UID = "935b6c78-7da2-4111-bdd5-f4d4a4826699";

const NAV_ITEMS = [
  { key: "Users", label: "Users", icon: "👥" },
  { key: "Chats", label: "Chats", icon: "💬" },
  { key: "Balances", label: "Balances", icon: "💰" },
  { key: "Withdrawals", label: "Withdrawals", icon: "🏦" },
];

function formatLastLogin(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Admin() {
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("Users");
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [editingBalanceId, setEditingBalanceId] = useState(null);
  const [balanceDraft, setBalanceDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lets the realtime handler see the latest conversations without re-subscribing
  const convosRef = useRef([]);
  convosRef.current = conversations;

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    setUsers(data || []);
  }

  async function loadWithdrawals() {
    const { data, error } = await supabase
      .from("withdrawals")
      .select("*, profiles(email)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    setWithdrawals(data || []);
  }

  async function loadConversations() {
    const { data, error } = await supabase
      .from("conversations")
      .select("*, profiles(email), messages(*)")
      .order("created_at", { ascending: false })
      .order("created_at", { referencedTable: "messages", ascending: true });
    if (error) throw error;
    setConversations(data || []);
  }

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      // Block everyone except the admin user before loading any data
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user || user.id !== ADMIN_UID) {
        setAuthorized(false);
        return;
      }
      setAuthorized(true);

      await Promise.all([loadUsers(), loadWithdrawals(), loadConversations()]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Live updates: user messages and AI replies show up without a refresh
  useEffect(() => {
    if (!authorized) return;
    const channel = supabase
      .channel("admin-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new;
          // Brand-new conversation we haven't loaded yet
          if (!convosRef.current.some((c) => c.id === m.conversation_id)) {
            loadConversations().catch((e) => setError(e.message));
            return;
          }
          setConversations((prev) =>
            prev.map((c) =>
              c.id === m.conversation_id
                ? c.messages.some((x) => x.id === m.id)
                  ? c
                  : { ...c, messages: [...c.messages, m] }
                : c,
            ),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [authorized]);

  // ---------- Users ----------
  async function toggleUserActive(user) {
    const { error } = await supabase
      .from("profiles")
      .update({ active: !user.active })
      .eq("id", user.id);
    if (error) return setError(error.message);
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u)),
    );
  }

  function startEditBalance(user) {
    setEditingBalanceId(user.id);
    setBalanceDraft(user.balance.toString());
  }

  async function saveBalance(id) {
    const value = Number(balanceDraft);
    if (isNaN(value) || value < 0) return;
    const { error } = await supabase
      .from("profiles")
      .update({ balance: value })
      .eq("id", id);
    if (error) return setError(error.message);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, balance: value } : u)),
    );
    setEditingBalanceId(null);
  }

  // ---------- Withdrawals ----------
  async function updateWithdrawalStatus(w, status) {
    const { error } = await supabase
      .from("withdrawals")
      .update({ status })
      .eq("id", w.id);
    if (error) return setError(error.message);

    if (status === "approved") {
      const profile = users.find((u) => u.id === w.user_id);
      if (profile) {
        const newBalance = Number(profile.balance) - Number(w.amount);
        await supabase
          .from("profiles")
          .update({ balance: newBalance })
          .eq("id", w.user_id);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === w.user_id ? { ...u, balance: newBalance } : u,
          ),
        );
      }
    }

    setWithdrawals((prev) =>
      prev.map((x) => (x.id === w.id ? { ...x, status } : x)),
    );
  }

  // ---------- Messages ----------
  async function sendReply() {
    if (!selectedConvo || !replyText.trim()) return;
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: selectedConvo,
        sender: "admin",
        text: replyText.trim(),
      })
      .select()
      .single();
    if (error) return setError(error.message);

    // Realtime may deliver the same row, so de-dupe by id
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvo
          ? c.messages.some((x) => x.id === data.id)
            ? c
            : {
                ...c,
                messages: [...c.messages, data],
                last_human_reply_at: new Date().toISOString(),
              }
          : c,
      ),
    );
    setReplyText("");
  }

  // Turn AI auto-reply on/off for one conversation.
  // Turning it back on also clears the 10-minute human pause.
  async function toggleAi(convo) {
    const next = convo.ai_enabled === false;
    const patch = next
      ? { ai_enabled: true, last_human_reply_at: null }
      : { ai_enabled: false };
    const { error } = await supabase
      .from("conversations")
      .update(patch)
      .eq("id", convo.id);
    if (error) return setError(error.message);
    setConversations((prev) =>
      prev.map((c) => (c.id === convo.id ? { ...c, ...patch } : c)),
    );
  }

  const activeConvo = conversations.find((c) => c.id === selectedConvo);
  const pendingCount = withdrawals.filter((w) => w.status === "pending").length;

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="admin-layout">
        <p style={{ color: "var(--text-muted)", padding: 24 }}>Loading…</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="admin-layout">
        <div style={{ padding: 24 }}>
          <h1>Access denied</h1>
          <p style={{ color: "var(--text-muted)" }}>
            You don't have permission to view the admin panel.
          </p>
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <span className="admin-logo-dot" />
          Admin Panel
        </div>
        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`admin-nav-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
              {item.key === "Withdrawals" && pendingCount > 0 && (
                <span className="admin-nav-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="admin-main">
        {error && <p className="error-text">{error}</p>}

        {activeTab === "Users" && (
          <>
            <div className="admin-content-header">
              <h1>All Users</h1>
              <span className="admin-registered-badge">
                {users.length} registered
              </span>
            </div>

            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={u.id}>
                    <td data-label="#">{i + 1}</td>
                    <td data-label="Name">{u.name || "—"}</td>
                    <td data-label="Email" className="mono">
                      {u.email}
                    </td>
                    <td data-label="Registered" className="mono">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td data-label="Last Login" className="mono">
                      {formatLastLogin(u.last_login)}
                    </td>
                    <td data-label="Status">
                      <span
                        className={`admin-status-pill ${u.active ? "active" : "inactive"}`}
                      >
                        {u.active ? "ACTIVE" : "DEACTIVATED"}
                      </span>
                    </td>
                    <td data-label="Action">
                      <button
                        className={`admin-action-btn ${u.active ? "deactivate" : "reactivate"}`}
                        onClick={() => toggleUserActive(u)}
                      >
                        {u.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "Balances" && (
          <>
            <div className="admin-content-header">
              <h1>User Balances</h1>
            </div>
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Balance (USD)</th>
                  <th>Last Login</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td data-label="Email" className="mono">
                      {u.email}
                    </td>
                    <td data-label="Balance (USD)" className="mono">
                      {editingBalanceId === u.id ? (
                        <div className="admin-balance-edit">
                          <input
                            type="number"
                            className="admin-inline-input mono"
                            value={balanceDraft}
                            onChange={(e) => setBalanceDraft(e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      ) : (
                        <>${Number(u.balance).toFixed(2)}</>
                      )}
                    </td>
                    <td data-label="Last Login" className="mono">
                      {formatLastLogin(u.last_login)}
                    </td>
                    <td>
                      {editingBalanceId === u.id ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="admin-action-btn reactivate"
                            onClick={() => saveBalance(u.id)}
                          >
                            Save
                          </button>
                          <button
                            className="admin-action-btn deactivate"
                            onClick={() => setEditingBalanceId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="admin-action-btn reactivate"
                          onClick={() => startEditBalance(u)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "Withdrawals" && (
          <>
            <div className="admin-content-header">
              <h1>Withdrawal Requests</h1>
            </div>
            {withdrawals.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>
                No withdrawal requests.
              </p>
            ) : (
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id}>
                      <td className="mono">{w.profiles?.email}</td>
                      <td className="mono">{w.method}</td>
                      <td className="mono">${Number(w.amount).toFixed(2)}</td>
                      <td
                        className="mono"
                        style={{
                          maxWidth: 160,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={w.address}
                      >
                        {w.address}
                      </td>
                      <td>
                        <span
                          className={`admin-status-pill ${
                            w.status === "approved"
                              ? "active"
                              : w.status === "rejected"
                                ? "inactive"
                                : "pending"
                          }`}
                        >
                          {w.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {w.status === "pending" ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="admin-action-btn reactivate"
                              onClick={() =>
                                updateWithdrawalStatus(w, "approved")
                              }
                            >
                              Approve
                            </button>
                            <button
                              className="admin-action-btn deactivate"
                              onClick={() =>
                                updateWithdrawalStatus(w, "rejected")
                              }
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeTab === "Chats" && (
          <>
            <div className="admin-content-header">
              <h1>Support Chats</h1>
            </div>
            <div className="admin-messages-layout">
              <div className="admin-convo-list">
                {conversations.length === 0 && (
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    No conversations yet.
                  </p>
                )}
                {conversations.map((c) => {
                  const lastMsg = c.messages[c.messages.length - 1];
                  return (
                    <button
                      key={c.id}
                      className={`admin-convo-item ${selectedConvo === c.id ? "active" : ""}`}
                      onClick={() => setSelectedConvo(c.id)}
                    >
                      <div className="admin-convo-email">
                        {c.profiles?.email}
                      </div>
                      <div className="admin-convo-preview">
                        {lastMsg
                          ? `${lastMsg.sender === "ai" ? "🤖 " : ""}${lastMsg.text}`
                          : "No messages yet"}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="admin-convo-thread">
                {!activeConvo ? (
                  <p style={{ color: "var(--text-muted)" }}>
                    Select a conversation to view messages.
                  </p>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <h3>{activeConvo.profiles?.email}</h3>
                      <button
                        className={`admin-action-btn ${activeConvo.ai_enabled === false ? "deactivate" : "reactivate"}`}
                        onClick={() => toggleAi(activeConvo)}
                        title="AI also pauses itself for 10 minutes after you reply"
                      >
                        🤖 AI auto-reply:{" "}
                        {activeConvo.ai_enabled === false ? "OFF" : "ON"}
                      </button>
                    </div>
                    <div className="admin-thread-messages">
                      {activeConvo.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`admin-thread-row ${m.sender === "user" ? "user" : "admin"}`}
                        >
                          <div className={`admin-thread-bubble ${m.sender}`}>
                            {m.text}
                          </div>
                          <div className="admin-thread-time">
                            {m.sender === "ai"
                              ? "🤖 AI · "
                              : m.sender === "admin"
                                ? "You · "
                                : ""}
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="admin-reply-row">
                      <input
                        type="text"
                        placeholder="Type a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendReply()}
                      />
                      <button className="btn btn-primary" onClick={sendReply}>
                        Send
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
