import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import logo from "../Vanlogo.png";

const links = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    to: "/markets",
    label: "Markets",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M18 9l-5 5-4-4-4 4" />
      </svg>
    ),
  },
  {
    to: "/spot",
    label: "Spot",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 3 21 7l-4 4" />
        <path d="M3 11V9a2 2 0 0 1 2-2h16" />
        <path d="M7 21 3 17l4-4" />
        <path d="M21 13v2a2 2 0 0 1-2 2H3" />
      </svg>
    ),
  },
  {
    to: "/bots",
    label: "Bots",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="8" width="16" height="12" rx="2" />
        <path d="M12 8V4" />
        <circle cx="12" cy="4" r="1" />
        <path d="M9 13v2" />
        <path d="M15 13v2" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Same balance the Dashboard shows (profiles.balance), kept live via realtime
  const [balance, setBalance] = useState(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    let cancelled = false;
    let channel = null;

    async function loadBalance() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("balance, name")
          .eq("id", user.id)
          .single();
        if (error) throw error;
        if (!cancelled) {
          setBalance(Number(data?.balance) || 0);
          setDisplayName(
            data?.name ||
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "",
          );
        }

        channel = supabase
          .channel("header-balance-changes")
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "profiles" },
            (payload) => {
              if (payload.new.id === user.id) {
                setBalance(Number(payload.new.balance) || 0);
                if (payload.new.name) setDisplayName(payload.new.name);
              }
            },
          )
          .subscribe();
      } catch (e) {
        console.error("Failed to load header balance:", e.message);
      }
    }

    loadBalance();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="app-header">
      <div className="container app-header-inner">
        <div className="app-header-actions">
          {/* Notifications */}
          <button
            type="button"
            className="app-header-user app-header-bell"
            aria-label="Notifications"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "inherit",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          {/* Balance, sits just before the user icon */}
          <span
            className="app-header-balance mono"
            title="Available balance"
            style={{
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid var(--border, rgba(255,255,255,0.12))",
            }}
          >
            {balance === null ? "…" : `$${balance.toFixed(2)}`}
          </span>

          <span className="app-header-user" aria-label="Account">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          {displayName && (
            <span
              className="app-header-name"
              title={displayName}
              style={{
                fontSize: 13,
                fontWeight: 600,
                maxWidth: 140,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </span>
          )}
          <button
            className="btn btn-ghost desktop-signout"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="logo">
          <img
            src={logo}
            alt="VantyxTrade"
            style={{ height: 28, width: "auto", borderRadius: 6 }}
          />
          VantyxTrade
        </div>

        <nav className="app-header-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {l.icon}
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {displayName && (
            <div
              className="mobile-menu-name"
              style={{ padding: "8px 16px", fontWeight: 600 }}
            >
              {displayName}
            </div>
          )}
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {l.icon}
              {l.label}
            </NavLink>
          ))}
          <button
            className="btn btn-ghost mobile-signout"
            onClick={() => {
              closeMenu();
              handleSignOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
