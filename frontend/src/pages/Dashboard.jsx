// src/pages/Dashboard.jsx

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTicker, CRYPTO_DATA } from "../tickerData";
import { supabase } from "../supabaseClient";

// ---------- Helpers & Constants ----------
const WATCHLIST_BASES = ["BTC", "ETH", "XRP"];

const COIN_META = {
  BTC: { color: "#f7931a" },
  ETH: { color: "#8fa5c9" },
  SOL: { color: "#14f195" },
  BNB: { color: "#f3ba2f" },
  XRP: { color: "#ffffff" },
  ADA: { color: "#3468d1" },
  DOGE: { color: "#c9a227" },
  AVAX: { color: "#e84142" },
  USDT: { color: "#26a17b" },
};

// Mock wallet addresses, replace with real generation from backend
const WALLETS = {
  BTC: "121HaiJWC24Na5kSgcUrYFhGTKqAvSvx2U",
  USDT_TRC20: "TPJjgnPuhg3GzQdGhJUwFYsAKg6W8pkTdk",
};

// Withdrawal method options (icon + display label)
const WITHDRAW_METHODS = [
  { key: "Bitcoin", base: "BTC" },
  { key: "USDT", base: "USDT" },
  { key: "Ethereum", base: "ETH" },
];

const pct = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
const usd = (n) => `$${n.toLocaleString()}`;

function compact(n) {
  if (!n) return "-";
  const units = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [v, u] of units) if (n >= v) return `$${(n / v).toFixed(2)} ${u}`;
  return `$${n.toFixed(2)}`;
}

// ---------- Subcomponents ----------
function Svg({ size = 16, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS = {
  wallet: (
    <>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </>
  ),
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  up: (
    <>
      <path d="M22 7l-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </>
  ),
  down: (
    <>
      <path d="M22 17l-8.5-8.5-5 5L2 7" />
      <path d="M16 17h6v-6" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
};

function CoinIcon({ base }) {
  const [imgError, setImgError] = useState(false);
  const color = COIN_META[base]?.color || "#5b6ef5";

  if (imgError || !base) {
    return (
      <span className="coin-icon" style={{ background: color }}>
        {(base || "?").slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      className="coin-icon-img"
      src={`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${base.toLowerCase()}.svg`}
      alt={base}
      onError={() => setImgError(true)}
    />
  );
}

function Sparkline({ up }) {
  const color = up ? "var(--gain)" : "var(--loss)";
  const points = up
    ? "0,16 25,15 50,12 75,9 100,4"
    : "0,4 25,7 50,9 75,13 100,16";
  return (
    <svg
      className="crypto-sparkline"
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
    >
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

// ---------- Styles ----------
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.vdash {
  --bg: #0a0e1a;
  --panel: #121a2e;
  --panel-alt: #171f38;
  --border: #262f4a;
  --accent: #5b6ef5;
  --accent-soft: rgba(91, 110, 245, 0.14);
  --gain: #35d0ba;
  --loss: #ff6b6b;
  --text: #e7ecfb;
  --muted: #8a93b3;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--text);
  min-width: 0;
}
.vdash *, .vdash *::before, .vdash *::after { box-sizing: border-box; }
.vdash a { color: inherit; text-decoration: none; }
.vdash h1, .vdash h2, .vdash h3 { margin: 0; font-family: inherit; }
.vdash .mono { font-variant-numeric: tabular-nums; }
.vdash .up { color: var(--gain); }
.vdash .down { color: var(--loss); }
.vdash .error-text { color: var(--loss); font-size: 13px; margin: 10px 0; }

/* full-bleed: break out of the layout's side padding and max-width */
.vdash--bleed { width: 100vw; max-width: 100vw; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); }
body:has(.vdash--bleed) { overflow-x: hidden; }

/* ---------- buttons ---------- */
.vdash .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 20px; border-radius: 8px; border: 1px solid transparent; font-family: inherit; font-weight: 600; font-size: 14px; cursor: pointer; transition: filter 0.15s, border-color 0.15s; }
.vdash .btn:active { transform: scale(0.98); }
.vdash .btn-primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.vdash .btn-primary:hover { filter: brightness(1.1); }
.vdash .btn-outline { background: transparent; border-color: var(--border); color: var(--text); }
.vdash .btn-outline:hover { border-color: var(--accent); }
.vdash .full-width { width: 100%; justify-content: center; }

/* ---------- hero band ---------- */
.vdash__hero { padding: 32px 28px 28px; border-bottom: 1px solid var(--border); background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 10%, var(--bg)) 0%, var(--bg) 100%); }
.vdash__inner { max-width: 1500px; margin: 0 auto; }
.vdash__hero-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
.vdash__hero h1 { font-size: 34px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 6px; }
.vdash__sub { margin: 0; color: var(--muted); font-size: 16px; }
.vdash__hero-btns { display: flex; gap: 12px; }
.vdash__hero-btns .btn { height: 40px; padding: 0 22px; }

.vdash__stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-top: 28px; }
.vdash__stat { min-width: 0; padding: 18px 20px; background: var(--panel); border: 1px solid var(--border); border-radius: 14px; }
.vdash__stat-label { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 14px; }
.vdash__stat-label.up, .vdash__stat-label.down { color: var(--muted); }
.vdash__stat-label.up svg { color: var(--gain); }
.vdash__stat-label.down svg { color: var(--loss); }
.vdash__stat-val { margin-top: 12px; font-size: 28px; font-weight: 700; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.vdash__stat-sub { margin-top: 6px; font-size: 13px; font-weight: 600; }
.vdash__stat-pair { display: flex; align-items: baseline; gap: 10px; margin-top: 14px; }
.vdash__stat-pair strong { font-size: 22px; font-weight: 700; }
.vdash__stat-pair span { font-size: 16px; font-weight: 600; }

/* ---------- body sections ---------- */
.vdash__body { max-width: 1500px; margin: 0 auto; padding: 28px 28px 48px; }

.vdash .panel { border: 1px solid var(--border); border-radius: 14px; background: var(--panel); padding: 24px; margin-bottom: 24px; }
.vdash .panel h3 { font-size: 16px; font-weight: 700; margin-bottom: 0; }
.vdash .panel-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.vdash .see-all-link { display: inline-flex; align-items: center; gap: 6px; color: var(--accent); font-size: 13px; font-weight: 600; }
.vdash .see-all-link:hover { opacity: 0.85; }
.vdash .your-crypto-col .panel-header-row h3 { font-size: 16px; font-weight: 700; }

.vdash .markets-layout { display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start; margin-bottom: 24px; }
.vdash .watchlist-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 20px; }
.vdash .watchlist-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 4px; border-bottom: 1px solid var(--border); }
.vdash .watchlist-item:last-child { border-bottom: none; }
.vdash .watchlist-item-left { display: flex; align-items: center; gap: 10px; }
.vdash .watchlist-item-right { text-align: right; }
.vdash .coin-name { font-size: 14px; font-weight: 600; color: var(--text); }
.vdash .coin-ticker { font-size: 12px; color: var(--muted); }
.vdash .coin-price { font-size: 14px; color: var(--text); }
.vdash .coin-change { font-size: 12px; margin-top: 2px; }
.vdash .watchlist-footer { border-top: 1px solid var(--border); padding-top: 16px; }
.vdash .using-exchange { color: var(--muted); font-size: 13px; margin: 0 0 12px; }

.vdash .coin-icon { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: #0a0e1a; flex-shrink: 0; }
.vdash .coin-icon-img { width: 34px; height: 34px; border-radius: 50%; background: var(--panel-alt); flex-shrink: 0; object-fit: contain; padding: 3px; }

.vdash .crypto-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.vdash .crypto-card { border: 1px solid var(--border); border-radius: 14px; background: var(--panel); padding: 22px; }
.vdash .crypto-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.vdash .crypto-card-title { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 15px; }
.vdash .change-pill { font-size: 12px; padding: 4px 10px; border-radius: 999px; font-weight: 600; }
.vdash .change-pill.up { background: rgba(53, 208, 186, 0.14); }
.vdash .change-pill.down { background: rgba(255, 107, 107, 0.14); }
.vdash .crypto-price { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 10px; }
.vdash .crypto-meta { color: var(--muted); font-size: 13px; line-height: 1.6; margin-bottom: 14px; }
.vdash .crypto-meta b { color: var(--text); font-weight: 600; }
.vdash .crypto-sparkline { width: 100%; height: 24px; display: block; margin-bottom: 16px; }
.vdash .crypto-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.vdash .trade-btn { padding: 9px 16px; font-size: 13px; }
.vdash .last-updated { color: var(--muted); font-size: 12px; }

/* ---------- movers ---------- */
.vdash__movers { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.vdash__panel { min-width: 0; padding: 22px 24px 14px; background: var(--panel); border: 1px solid var(--border); border-radius: 14px; }
.vdash__panel-title { display: flex; align-items: center; gap: 10px; margin: 0 0 8px; font-size: 18px; font-weight: 700; }
.vdash__panel-title.up { color: var(--gain); }
.vdash__panel-title.down { color: var(--loss); }
.vdash__panel-title span { color: #fff; }
.vdash__mover { display: flex; align-items: center; gap: 16px; padding: 14px 4px; border-top: 1px solid var(--border); }
.vdash__mover:first-of-type { border-top: 0; }
.vdash__rank { width: 18px; text-align: center; color: var(--muted); font-size: 14px; }
.vdash__sym { flex: 1; display: grid; gap: 2px; min-width: 0; }
.vdash__sym strong { font-size: 17px; font-weight: 600; }
.vdash__sym span { color: var(--muted); font-size: 13px; font-variant-numeric: tabular-nums; }
.vdash__pct { font-size: 17px; font-weight: 600; white-space: nowrap; }
.vdash__empty { margin: 0; padding: 14px 4px; color: var(--muted); font-size: 14px; }

/* ---------- deposit and withdraw views ---------- */
.vdash .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
.vdash .page-header h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.01em; }
.vdash .page-header p { color: var(--muted); margin: 6px 0 0; font-size: 14px; }
.vdash .deposit-container { max-width: 760px; margin: 0 auto; padding: 24px; }
.vdash .panel.deposit-panel, .vdash .panel.withdraw-panel, .vdash .pending-withdrawals-panel { background: var(--bg); border: none; }

.vdash .method-selector { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; padding-bottom: 16px; }
.vdash .method-banner { display: flex; align-items: center; justify-content: center; gap: 10px; background: var(--accent); color: #fff; font-weight: 700; font-size: 18px; padding: 16px; border-radius: 8px; }
.vdash .method-banner-icon { font-size: 20px; line-height: 1; }
.vdash .method-options { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.vdash .method-options-3 { grid-template-columns: repeat(3, 1fr); }
.vdash .method-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; background: #1a2140; border: 1px solid var(--border); border-radius: 8px; padding: 20px 16px; font-family: inherit; font-weight: 600; font-size: 16px; color: var(--text); cursor: pointer; transition: all 0.2s; }
.vdash .method-card .coin-icon-img, .vdash .method-card .coin-icon { width: 56px; height: 56px; }
.vdash .method-card.active { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
.vdash .method-card:hover:not(.active) { border-color: var(--muted); }

.vdash .amount-section { margin-bottom: 24px; }
.vdash .amount-section label { display: block; font-weight: 600; margin-bottom: 4px; color: var(--muted); }
.vdash .amount-input { width: 100%; padding: 12px; font-size: 1.5rem; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); font-family: inherit; }
.vdash .amount-input:focus { outline: none; border-color: var(--accent); }
.vdash .wallet-input { font-size: 0.95rem; text-align: left; }

.vdash .wallet-section { background: linear-gradient(135deg, var(--accent), #3a4bc4); padding: 24px 32px; border-radius: 20px; text-align: center; margin-bottom: 24px; min-height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.vdash .wallet-label { font-weight: 700; font-size: 20px; color: #fff; margin-bottom: 20px; }
.vdash .wallet-address { font-size: 1rem; word-break: break-all; overflow-wrap: break-word; background: rgba(0, 0, 0, 0.3); padding: 14px 20px; border-radius: 12px; margin-bottom: 20px; color: #fff; width: 100%; text-align: center; line-height: 1.5; }
.vdash .copy-btn { margin: 0 0 20px; display: flex; width: 100%; justify-content: center; background: #22c55e; border: none; color: #0a0e1a; font-weight: 700; font-size: 16px; padding: 14px; border-radius: 12px; }
.vdash .copy-btn:hover { background: #1eaf52; filter: none; }
.vdash .wallet-hint { font-size: 0.9rem; color: rgba(255, 255, 255, 0.85); line-height: 1.5; max-width: 420px; margin: 0; }

.vdash .withdraw-balance-panel { background: linear-gradient(135deg, var(--accent), #3a4bc4); border-radius: 20px; padding: 22px 32px; text-align: center; margin-bottom: 24px; }
.vdash .withdraw-balance-value { font-size: 32px; font-weight: 700; color: var(--gain); margin-bottom: 8px; }
.vdash .withdraw-balance-label { color: #fff; opacity: 0.85; font-size: 14px; }
.vdash .withdraw-btn { width: 100%; padding: 14px; margin-top: 8px; border-radius: 8px; background: var(--panel-alt); border: 1px solid var(--border); color: var(--muted); font-family: inherit; font-weight: 700; font-size: 15px; cursor: pointer; }
.vdash .withdraw-btn:not(:disabled):hover { border-color: var(--accent); color: var(--text); }
.vdash .withdraw-btn:disabled { cursor: not-allowed; opacity: 0.7; }

.vdash .pending-withdrawals-title { font-size: 22px; font-weight: 800; text-align: center; margin: 32px 0 16px; }
.vdash .pending-withdrawals-panel { text-align: center; padding: 28px 24px; }
.vdash .pending-empty-icon { font-size: 40px; margin-bottom: 12px; }
.vdash .pending-empty-text { color: var(--muted); margin: 0; }
.vdash .pending-withdrawals-list { text-align: left; }
.vdash .pending-withdrawal-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 4px; border-bottom: 1px solid var(--border); gap: 12px; }
.vdash .pending-withdrawal-item:last-child { border-bottom: none; }
.vdash .pending-withdrawal-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.vdash .pending-withdrawal-amount { font-size: 14px; color: var(--text); font-weight: 600; margin-bottom: 2px; }
.vdash .pending-withdrawal-address { font-size: 12px; color: var(--muted); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vdash .pending-status-pill { font-size: 12px; padding: 4px 10px; border-radius: 999px; background: rgba(245, 197, 66, 0.13); color: #f5c542; flex-shrink: 0; }
.vdash .pending-status-pill.approved { background: rgba(53, 208, 186, 0.14); color: var(--gain); }
.vdash .pending-status-pill.rejected { background: rgba(255, 107, 107, 0.14); color: var(--loss); }

/* ---------- responsive ---------- */
@media (max-width: 1100px) {
  .vdash__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 1000px) {
  .vdash__movers { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 900px) {
  .vdash .markets-layout { grid-template-columns: 1fr; }
  .vdash .crypto-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .vdash__hero { padding: 20px 16px; }
  .vdash__hero h1 { font-size: 26px; }
  .vdash__hero-btns { width: 100%; }
  .vdash__hero-btns .btn { flex: 1; }
  .vdash__stats { grid-template-columns: minmax(0, 1fr); }
  .vdash__stat-val { font-size: 24px; }
  .vdash__body { padding: 20px 16px 40px; }
  .vdash .deposit-container { max-width: 100%; padding: 16px; }
  .vdash .panel.deposit-panel, .vdash .panel.withdraw-panel, .vdash .pending-withdrawals-panel, .vdash .withdraw-balance-panel { border-radius: 0; margin-left: -16px; margin-right: -16px; width: calc(100% + 32px); }
  .vdash .wallet-section { margin-left: -24px; margin-right: -24px; width: calc(100% + 48px); border-radius: 0; }
  .vdash .wallet-address { font-size: 0.85rem; padding: 12px 14px; }
}
`;

// ---------- Main Dashboard ----------
export default function Dashboard() {
  const pairs = useTicker();
  const [lastUpdated] = useState(new Date());
  const location = useLocation();

  // Real balance, pulled from Supabase (profiles.balance), same field the admin panel edits
  const [totalValue, setTotalValue] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState("");
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState("");

  // TODO: portfolio % change still needs real P&L calculation once Binance API is wired in
  const portfolioChange = 0;
  const portfolioUp = true;

  // Deposit state
  const [showDeposit, setShowDeposit] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("Bitcoin");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  // Withdraw state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] =
    useState("Bitcoin");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  // Reset to the main dashboard whenever the Dashboard link is clicked
  // in the header, even if we're already on /dashboard
  useEffect(() => {
    setShowDeposit(false);
    setShowWithdraw(false);
  }, [location.key]);

  // ---------- Fetch real balance from Supabase ----------
  useEffect(() => {
    async function loadBalance() {
      setBalanceLoading(true);
      setBalanceError("");
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("No logged-in user found.");

        setUserId(user.id);
        setDisplayName(
          user.user_metadata?.username ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "",
        );

        const { data, error } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", user.id)
          .single();
        if (error) throw error;

        setTotalValue(Number(data?.balance) || 0);
      } catch (e) {
        setBalanceError(e.message);
      } finally {
        setBalanceLoading(false);
      }
    }

    loadBalance();

    // Keep the dashboard in sync if the admin panel updates this user's balance
    // while they're on the page.
    const channel = supabase
      .channel("profile-balance-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && payload.new.id === user.id) {
              setTotalValue(Number(payload.new.balance) || 0);
            }
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ---------- Load this user's real withdrawals + keep status in sync ----------
  useEffect(() => {
    if (!userId) return;

    async function loadWithdrawals() {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load withdrawals:", error.message);
        return;
      }
      setPendingWithdrawals(data || []);
    }

    loadWithdrawals();

    // Realtime: reflect admin approve/reject instantly, and pick up
    // any new request inserted from elsewhere.
    const channel = supabase
      .channel(`withdrawals:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "withdrawals",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPendingWithdrawals((prev) => {
              if (prev.some((w) => w.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            setPendingWithdrawals((prev) =>
              prev.map((w) => (w.id === payload.new.id ? payload.new : w)),
            );
          } else if (payload.eventType === "DELETE") {
            setPendingWithdrawals((prev) =>
              prev.filter((w) => w.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // ---------- Market data derived from the live ticker ----------
  const watchlist = WATCHLIST_BASES.map((base) => {
    const p = pairs.find((pair) => pair.symbol === `${base}/USDT`);
    return {
      base,
      price: p?.price ?? null,
      change: p?.change ?? null,
    };
  });

  const rows = pairs
    .filter((p) => typeof p.change === "number")
    .map((p) => ({
      base: String(p.symbol).split("/")[0],
      price: p.price ?? null,
      change: p.change,
    }));
  const gainers = [...rows].sort((a, b) => b.change - a.change).slice(0, 4);
  const losers = [...rows].sort((a, b) => a.change - b.change).slice(0, 4);
  const gainer = gainers[0];
  const loser = losers[0];
  const volume = pairs.reduce((s, p) => s + (Number(p.volume) || 0), 0);

  const updatedLabel = lastUpdated.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // ---------- Deposit logic ----------
  const getWalletAddress = () => {
    return selectedMethod === "Bitcoin" ? WALLETS.BTC : WALLETS.USDT_TRC20;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getWalletAddress());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    setCopied(false);
  };

  // ---------- Withdraw logic ----------
  const handleWithdrawMethodChange = (method) => {
    setSelectedWithdrawMethod(method);
  };

  const canSubmitWithdrawal =
    withdrawAmount.trim() !== "" &&
    Number(withdrawAmount) > 0 &&
    Number(withdrawAmount) <= totalValue &&
    withdrawAddress.trim() !== "" &&
    !withdrawSubmitting;

  const handleWithdrawSubmit = async () => {
    if (!canSubmitWithdrawal || !userId) return;

    setWithdrawSubmitting(true);
    setWithdrawError("");

    const { data, error } = await supabase
      .from("withdrawals")
      .insert({
        user_id: userId,
        method: selectedWithdrawMethod,
        amount: Number(withdrawAmount),
        address: withdrawAddress.trim(),
        status: "pending",
      })
      .select()
      .single();

    setWithdrawSubmitting(false);

    if (error) {
      console.error("Failed to submit withdrawal:", error.message);
      setWithdrawError(error.message);
      return;
    }

    // Realtime subscription above will also deliver this INSERT, the
    // de-dupe check there prevents it from being added twice.
    setPendingWithdrawals((prev) => [data, ...prev]);
    setWithdrawAmount("");
    setWithdrawAddress("");
  };

  // ---------- Deposit View Renderer ----------
  const renderDeposit = () => (
    <div className="deposit-container">
      <div className="page-header">
        <div>
          <h1>Fund Your Account</h1>
          <p>Choose your preferred deposit method below.</p>
        </div>
      </div>

      <div className="panel deposit-panel">
        <div className="method-selector">
          <div className="method-banner">
            <span className="method-banner-icon">🪙</span>
            Crypto
          </div>
          <div className="method-options">
            <button
              className={`method-card ${selectedMethod === "Bitcoin" ? "active" : ""}`}
              onClick={() => handleMethodChange("Bitcoin")}
            >
              <CoinIcon base="BTC" />
              <span>Bitcoin</span>
            </button>
            <button
              className={`method-card ${selectedMethod === "USDT" ? "active" : ""}`}
              onClick={() => handleMethodChange("USDT")}
            >
              <CoinIcon base="USDT" />
              <span>USDT</span>
            </button>
          </div>
        </div>

        <div className="amount-section">
          <label>Amount (USD)</label>
          <input
            type="number"
            className="amount-input mono"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>

        <div className="wallet-section">
          <div className="wallet-label">
            {selectedMethod === "Bitcoin"
              ? "Bitcoin Wallet Address"
              : "USDT (TRC20) Wallet Address"}
          </div>
          <div className="wallet-address mono">{getWalletAddress()}</div>
          <button onClick={copyToClipboard} className="btn copy-btn">
            {copied ? "✅ Copied!" : "Copy Address"}
          </button>
          <p className="wallet-hint">
            Send the exact amount to this address and your account will be
            credited automatically.
          </p>
        </div>
      </div>
    </div>
  );

  // ---------- Withdraw View Renderer ----------
  const renderWithdraw = () => (
    <div className="deposit-container">
      <div className="page-header">
        <div>
          <h1>Withdraw Funds</h1>
          <p>Choose your preferred withdrawal method below</p>
        </div>
      </div>

      <div className="withdraw-balance-panel">
        <div className="withdraw-balance-value mono">
          ${totalValue.toFixed(2)}
        </div>
        <div className="withdraw-balance-label">Available Balance</div>
      </div>

      <div className="panel withdraw-panel">
        <div className="method-selector">
          <div className="method-banner">
            <span className="method-banner-icon">🪙</span>
            Crypto
          </div>
          <div className="method-options method-options-3">
            {WITHDRAW_METHODS.map(({ key, base }) => (
              <button
                key={key}
                className={`method-card ${selectedWithdrawMethod === key ? "active" : ""}`}
                onClick={() => handleWithdrawMethodChange(key)}
              >
                <CoinIcon base={base} />
                <span>{key}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="amount-section">
          <label>Amount (USD)</label>
          <input
            type="number"
            className="amount-input mono"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>

        <div className="amount-section">
          <label>Your Wallet Address</label>
          <input
            type="text"
            className="amount-input mono wallet-input"
            value={withdrawAddress}
            onChange={(e) => setWithdrawAddress(e.target.value)}
            placeholder="Enter your wallet address"
          />
        </div>

        <button
          className="withdraw-btn"
          onClick={handleWithdrawSubmit}
          disabled={!canSubmitWithdrawal}
        >
          {withdrawSubmitting ? "Submitting…" : "Withdraw"}
        </button>
        {withdrawError && (
          <p className="error-text" style={{ marginTop: 8 }}>
            {withdrawError}
          </p>
        )}
        {Number(withdrawAmount) > totalValue &&
          withdrawAmount.trim() !== "" && (
            <p className="error-text" style={{ marginTop: 8 }}>
              Amount exceeds your available balance.
            </p>
          )}
      </div>

      <h2 className="pending-withdrawals-title">Pending Withdrawals</h2>
      <div className="panel pending-withdrawals-panel">
        {pendingWithdrawals.length === 0 ? (
          <>
            <div className="pending-empty-icon">📪</div>
            <p className="pending-empty-text">No pending withdrawals found.</p>
          </>
        ) : (
          <div className="pending-withdrawals-list">
            {pendingWithdrawals.map((w) => {
              const base = WITHDRAW_METHODS.find(
                (m) => m.key === w.method,
              )?.base;
              return (
                <div className="pending-withdrawal-item" key={w.id}>
                  <div className="pending-withdrawal-left">
                    <CoinIcon base={base} />
                    <div>
                      <div className="pending-withdrawal-amount mono">
                        ${Number(w.amount).toFixed(2)} · {w.method}
                      </div>
                      <div className="pending-withdrawal-address">
                        {w.address}
                      </div>
                    </div>
                  </div>
                  <span className={`pending-status-pill ${w.status}`}>
                    {w.status === "pending"
                      ? "Pending"
                      : w.status === "approved"
                        ? "Approved"
                        : "Rejected"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ---------- Main render ----------
  if (showDeposit) {
    return (
      <div className="vdash dashboard-wrapper">
        <style>{css}</style>
        {renderDeposit()}
      </div>
    );
  }

  if (showWithdraw) {
    return (
      <div className="vdash dashboard-wrapper">
        <style>{css}</style>
        {renderWithdraw()}
      </div>
    );
  }

  // Normal Dashboard
  return (
    <div className="vdash vdash--bleed">
      <style>{css}</style>

      {/* ---------- 1. Hero + stats ---------- */}
      <section className="vdash__hero">
        <div className="vdash__inner">
          <div className="vdash__hero-top">
            <div>
              <h1>Welcome back, {displayName || "trader"}</h1>
              <p className="vdash__sub">
                Here's your portfolio and the latest market overview.
              </p>
            </div>
            <div className="vdash__hero-btns">
              <button
                className="btn btn-primary"
                onClick={() => setShowDeposit(true)}
              >
                Deposit
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShowWithdraw(true)}
              >
                Withdraw
              </button>
            </div>
          </div>

          <div className="vdash__stats">
            <div className="vdash__stat">
              <div className="vdash__stat-label">
                <Svg size={16}>{ICONS.wallet}</Svg> Portfolio Value
              </div>
              <div className="vdash__stat-val">
                {balanceLoading ? "…" : `$${totalValue.toFixed(2)}`}
              </div>
              <div
                className={`vdash__stat-sub mono ${portfolioUp ? "up" : "down"}`}
              >
                {portfolioUp ? "↑ " : "↓ "}
                {pct(portfolioChange)}
              </div>
            </div>

            <div className="vdash__stat">
              <div className="vdash__stat-label">
                <Svg size={16}>{ICONS.activity}</Svg> 24h Volume
              </div>
              <div className="vdash__stat-val">{compact(volume)}</div>
            </div>

            <div className="vdash__stat">
              <div className="vdash__stat-label up">
                <Svg size={16}>{ICONS.up}</Svg> <span>Top Gainer</span>
              </div>
              <div className="vdash__stat-pair">
                <strong>{gainer?.base || "-"}</strong>
                {gainer && <span className="up">{pct(gainer.change)}</span>}
              </div>
            </div>

            <div className="vdash__stat">
              <div className="vdash__stat-label down">
                <Svg size={16}>{ICONS.down}</Svg> <span>Top Loser</span>
              </div>
              <div className="vdash__stat-pair">
                <strong>{loser?.base || "-"}</strong>
                {loser && <span className="down">{pct(loser.change)}</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="vdash__body">
        {balanceError && <p className="error-text">{balanceError}</p>}

        {/* ---------- 2. Watchlist + holdings ---------- */}
        <div className="markets-layout">
          <div className="panel watchlist-panel">
            <div className="panel-header-row">
              <h3>Watchlist</h3>
              <Link to="/markets" className="see-all-link">
                View All <Svg size={14}>{ICONS.arrow}</Svg>
              </Link>
            </div>
            <div className="watchlist-list">
              {watchlist.map(({ base, price, change }) => {
                const up = change !== null ? change >= 0 : true;
                return (
                  <div className="watchlist-item" key={base}>
                    <div className="watchlist-item-left">
                      <CoinIcon base={base} />
                      <div>
                        <div className="coin-name">{base}</div>
                        <div className="coin-ticker mono">{base}</div>
                      </div>
                    </div>
                    <div className="watchlist-item-right">
                      <div className="coin-price mono">
                        {price !== null ? usd(price) : "-"}
                      </div>
                      <div className={`coin-change mono ${up ? "up" : "down"}`}>
                        {change !== null ? pct(change) : "-"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="watchlist-footer">
              <p className="using-exchange">Prices from Binance</p>
              <Link to="/markets" className="btn btn-outline full-width">
                Open Markets
              </Link>
            </div>
          </div>

          <div className="your-crypto-col">
            <div className="panel-header-row">
              <h3>Your Assets</h3>
              <Link to="/markets" className="see-all-link">
                View All <Svg size={14}>{ICONS.arrow}</Svg>
              </Link>
            </div>
            <div className="crypto-grid">
              {CRYPTO_DATA.map((h) => {
                const up = h.change >= 0;
                const value = h.amount * h.price;
                return (
                  <div className="crypto-card" key={h.id}>
                    <div className="crypto-card-head">
                      <div className="crypto-card-title">
                        <CoinIcon base={h.symbol} />
                        <span>{h.symbol}</span>
                      </div>
                      <span className={`change-pill ${up ? "up" : "down"}`}>
                        {pct(h.change)}
                      </span>
                    </div>

                    <div className="crypto-price mono">{usd(h.price)}</div>

                    <div className="crypto-meta mono">
                      <div>
                        Holding:{" "}
                        <b>
                          {h.amount} {h.symbol}
                        </b>
                      </div>
                      <div>
                        Value: <b>${value.toFixed(2)}</b>
                      </div>
                    </div>

                    <Sparkline up={up} />

                    <div className="crypto-card-footer">
                      <Link to="/spot" className="btn btn-primary trade-btn">
                        Trade
                      </Link>
                      <span className="last-updated mono">
                        Updated {updatedLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---------- 3. Top gainers and losers ---------- */}
        <div className="vdash__movers">
          {[
            { title: "Top Gainers (24h)", list: gainers, up: true, icon: "up" },
            { title: "Top Losers (24h)", list: losers, up: false, icon: "down" },
          ].map(({ title, list, up, icon }) => (
            <section className="vdash__panel" key={title}>
              <h2 className={`vdash__panel-title ${up ? "up" : "down"}`}>
                <Svg size={20}>{ICONS[icon]}</Svg> <span>{title}</span>
              </h2>
              {list.length === 0 && (
                <p className="vdash__empty">Waiting for market data...</p>
              )}
              {list.map((t, i) => (
                <div className="vdash__mover" key={t.base}>
                  <span className="vdash__rank">{i + 1}</span>
                  <CoinIcon base={t.base} />
                  <div className="vdash__sym">
                    <strong>{t.base}</strong>
                    <span>{t.price !== null ? usd(t.price) : "-"}</span>
                  </div>
                  <span
                    className={`vdash__pct ${t.change >= 0 ? "up" : "down"}`}
                  >
                    {pct(t.change)}
                  </span>
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
