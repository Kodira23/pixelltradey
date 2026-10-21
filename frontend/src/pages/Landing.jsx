// Landing.jsx — VantyxTrade
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import heroTradeImage from "../tradex.png.webp";
import phoneImage from "../phone.jpg";

/* ---------------- DATA ---------------- */

const FEATURE_CARDS = [
  {
    icon: "₿",
    title: "Bitcoin Accumulation",
    desc: "Recurring BTC buys on your schedule, with an optional extra buy triggered when price dips below your set threshold from its recent high.",
  },
  {
    icon: "Ξ",
    title: "ETH DCA Pro",
    desc: "Dollar-cost averages into ETH on a custom interval, with an optional RSI filter so buys lean into oversold conditions instead of ignoring them.",
  },
  {
    icon: "⇄",
    title: "Full custody stays with you",
    desc: "Orders execute on your own Binance account via a trade-only API key. Deposits, withdrawals, and balances are always managed directly on Binance.",
  },
];

const TICKER = [
  { s: "BTC/USDT", p: "64,210.55", c: "+1.12%", up: true },
  { s: "ETH/USDT", p: "2,458.70", c: "+0.68%", up: true },
  { s: "BNB/USDT", p: "731.24", c: "+0.22%", up: true },
  { s: "SOL/USDT", p: "106.41", c: "-0.92%", up: false },
  { s: "XRP/USDT", p: "1.3414", c: "+0.49%", up: true },
  { s: "ADA/USDT", p: "0.2310", c: "-0.31%", up: false },
];

const SNAPSHOT = [
  { s: "BTC/USDT", sym: "₿", bg: "#F7931A", p: "$64,210.55", ch: "+4.18%", up: true },
  { s: "ETH/USDT", sym: "Ξ", bg: "#627EEA", p: "$2,458.70", ch: "+2.07%", up: true },
  { s: "BNB/USDT", sym: "B", bg: "#F3BA2F", p: "$731.24", ch: "+1.35%", up: true },
  { s: "SOL/USDT", sym: "S", bg: "#66F9A1", p: "$106.41", ch: "-0.92%", up: false },
  { s: "XRP/USDT", sym: "X", bg: "#23292F", p: "$1.34", ch: "+0.49%", up: true },
];

const PERKS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-6" />
      </svg>
    ),
    title: "Rules you can read",
    body: "Every trigger — scheduled, dip-based, or RSI-based — is written out in plain English in your dashboard. No black-box logic.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h4l3-8 6 16 3-8h4" />
      </svg>
    ),
    title: "Trade-only API keys",
    body: "We connect read + trade only. Withdrawal permissions are never requested, so your Binance account can't be drained by us.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
      </svg>
    ),
    title: "Fast execution",
    body: "Orders fire straight to Binance through a low-latency link, so your fills match the market price you planned for.",
  },
];

const REASONS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
      </svg>
    ),
    title: "Custody is never ours",
    body: "We never hold a cent. Funds stay in your own Binance account at all times — we only send the orders you've authorised.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 18a8.5 8.5 0 1115 0" /><path d="M12 18l4-6" />
      </svg>
    ),
    title: "Transparent triggers",
    body: "Each buy shows exactly which rule fired and the data behind it, so you always understand why a trade happened.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />
      </svg>
    ),
    title: "No hidden fees",
    body: "A single flat subscription. You only ever pay Binance's own trading fee on top, which is charged directly by them.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="14" r="7" /><path d="M12 14V10M9 3h6" />
      </svg>
    ),
    title: "Schedules that survive",
    body: "Bots run on VantyxTrade's side, not your browser. They keep buying on schedule even if your laptop is closed.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14v-2a8 8 0 0116 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" />
      </svg>
    ),
    title: "Support that answers",
    body: "Real humans on chat and email. No scripted bots replying to your bot questions.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
      </svg>
    ),
    title: "Instant kill switch",
    body: "Pause every bot with one tap. Any open position stays on Binance — the bot simply stops buying until you resume.",
  },
];

const MARKET = [
  { k: "BTC", n: "Bitcoin", sym: "₿", bg: "#F7931A", p: "$64,210.55", ch: "+2.41%", h: "$64,880.00", l: "$62,540.10", up: true },
  { k: "ETH", n: "Ethereum", sym: "Ξ", bg: "#627EEA", p: "$2,458.70", ch: "+1.18%", h: "$2,491.30", l: "$2,376.45", up: true },
  { k: "BNB", n: "BNB", sym: "B", bg: "#F3BA2F", p: "$731.24", ch: "+0.64%", h: "$738.90", l: "$719.15", up: true },
  { k: "SOL", n: "Solana", sym: "S", bg: "#66F9A1", p: "$106.41", ch: "-0.92%", h: "$109.20", l: "$103.85", up: false },
  { k: "XRP", n: "Ripple", sym: "X", bg: "#23292F", p: "$1.3414", ch: "+0.49%", h: "$1.3620", l: "$1.2990", up: true },
  { k: "DOGE", n: "Dogecoin", sym: "Ð", bg: "#C3A634", p: "$0.082300", ch: "+0.37%", h: "$0.084100", l: "$0.079800", up: true },
  { k: "ADA", n: "Cardano", sym: "A", bg: "#0D1E30", p: "$0.231000", ch: "-0.31%", h: "$0.236400", l: "$0.224900", up: false },
  { k: "TRX", n: "TRON", sym: "T", bg: "#EF0027", p: "$0.336000", ch: "+0.12%", h: "$0.338700", l: "$0.331200", up: true },
];

const FIGURES = [
  { v: "35,000+", l: "Active accumulators" },
  { v: "$180M+", l: "Volume processed" },
  { v: "99.95%", l: "Bot uptime" },
  { v: "4.9/5", l: "Avg. user rating" },
];

/* ---------------- COMPONENT ---------------- */

export default function Landing() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .vtx-landing {
          --bg: #0a0e1a;
          --panel: #121a2e;
          --panel-alt: #171f38;
          --border: #262f4a;
          --accent: #5b6ef5;
          --accent-soft: #5b6ef522;
          --accent-mid: rgba(91,110,245,0.22);
          --accent-line: rgba(91,110,245,0.22);
          --gain: #35d0ba;
          --loss: #ff6b6b;
          --text: #e7ecfb;
          --text-muted: #8a93b3;
          --font-display: "Poppins", system-ui, -apple-system, sans-serif;
          --font-body: "Inter", system-ui, -apple-system, sans-serif;
          --font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
          --radius: 14px;
          --radius-sm: 8px;
          --nav-h: 80px;

          min-height: 100vh;
          padding-top: var(--nav-h);
          background:
            radial-gradient(700px 420px at 82% 15%, rgba(91,110,245,0.14), transparent 65%),
            radial-gradient(500px 360px at 12% 55%, rgba(91,110,245,0.06), transparent 70%),
            var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          overflow-x: hidden;
        }
        .vtx-landing a { color: inherit; text-decoration: none; }
        .vtx-landing h1,
        .vtx-landing h2,
        .vtx-landing h3 { font-family: var(--font-display); font-weight: 800; margin: 0; letter-spacing: -0.02em; }
        .vtx-container { max-width: 1400px; margin: 0 auto; padding: 0 32px; }

        /* Buttons */
        .vtx-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 24px; border-radius: var(--radius-sm);
          border: 1px solid transparent; font-family: inherit; font-weight: 600; font-size: 14px;
          line-height: 1.2; text-decoration: none; white-space: nowrap; cursor: pointer;
          transition: transform 0.12s, opacity 0.12s, border-color 0.15s;
        }
        .vtx-btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
        .vtx-btn-primary:hover { opacity: 0.92; }
        .vtx-btn-ghost { background: transparent; color: var(--text); border-color: var(--border); }
        .vtx-btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
        .vtx-btn:active { transform: scale(0.98); }

        /* Ticker */
        .vtx-tape { overflow: hidden; border-bottom: 1px solid var(--border); background: #050912; }
        .vtx-tape-track { display: flex; width: max-content; animation: vtx-scroll 40s linear infinite; }
        .vtx-tape-item {
          padding: 12px 24px; font-size: 13px; color: #cfd6ee; white-space: nowrap;
          border-right: 1px solid var(--border); font-family: var(--font-mono);
        }
        .vtx-tape-item b { font-weight: 600; margin-right: 6px; color: var(--text); }
        .vtx-tape-item em { font-style: normal; margin-left: 6px; }
        .vtx-up { color: var(--gain); }
        .vtx-down { color: var(--loss); }
        @keyframes vtx-scroll { to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .vtx-tape-track { animation: none; } }

        /* Hero */
        .vtx-hero {
          display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px;
          align-items: center; max-width: 1400px; margin: 0 auto;
          padding: 72px 32px 40px;
        }
        .vtx-hero-copy { position: relative; z-index: 1; }
        .vtx-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          color: var(--gain); font-family: var(--font-mono); font-size: 12px;
          border: 1px solid var(--border); border-radius: 999px;
          padding: 6px 14px; margin-bottom: 22px;
        }
        .vtx-eyebrow .vtx-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--gain); box-shadow: 0 0 8px var(--gain);
        }
        .vtx-hero h1 {
          font-size: clamp(38px, 5vw, 58px);
          line-height: 1.06; font-weight: 700; letter-spacing: -0.03em;
          background: linear-gradient(180deg, #fff, #b9c2e8);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .vtx-hero p {
          color: var(--text-muted); font-size: 17px; line-height: 1.65;
          max-width: 520px; margin: 20px 0 28px;
        }
        .vtx-cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .vtx-hero-image { display: flex; align-items: center; justify-content: center; }
        .vtx-hero-image img { width: 100%; height: auto; display: block; }
        .vtx-hero-mobile-img { display: none; }

        /* Section base */
        .vtx-section { padding: 44px 32px; max-width: 1400px; margin: 0 auto; }
        .vtx-kicker {
          color: var(--accent); font-family: var(--font-mono); font-size: 12px;
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;
        }
        .vtx-section h2 {
          font-size: clamp(26px, 3.4vw, 40px); font-weight: 700;
          margin-bottom: 14px; max-width: 720px; line-height: 1.15;
        }
        .vtx-section-lede { color: var(--text-muted); max-width: 620px; line-height: 1.65; font-size: 16px; }

        /* Strategy cards */
        .vtx-strategy-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 20px; margin-top: 32px;
        }
        .vtx-strategy-card {
          border: 1px solid var(--border); border-radius: var(--radius);
          background: var(--panel); overflow: hidden;
        }
        .vtx-strategy-img-wrap { position: relative; height: 180px; overflow: hidden; background: var(--panel-alt); }
        .vtx-strategy-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; filter: brightness(0.55); }
        .vtx-strategy-badge {
          position: absolute; bottom: 16px; left: 16px;
          width: 40px; height: 40px; border-radius: 10px;
          background: var(--accent); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 700;
        }
        .vtx-strategy-body { padding: 22px; }
        .vtx-strategy-body h3 { font-size: 17px; margin-bottom: 8px; }
        .vtx-strategy-body p { color: var(--text-muted); font-size: 14px; line-height: 1.55; margin: 0; }

        /* About / Market snapshot */
        .vtx-about {
          display: grid; grid-template-columns: 1.15fr 1fr;
          gap: 48px; align-items: center;
        }
        .vtx-about h2 { margin-bottom: 14px; }
        .vtx-about > div > p { color: var(--text-muted); font-size: 16px; line-height: 1.65; margin: 0; }
        .vtx-about-feats { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 28px; }
        .vtx-about-feat { display: flex; gap: 14px; align-items: flex-start; }
        .vtx-about-feat-icon {
          flex: none; display: grid; place-items: center;
          width: 44px; height: 44px; border-radius: 10px;
          background: var(--accent-soft); color: var(--accent);
        }
        .vtx-about-feat h3 { font-size: 15px; margin: 0 0 6px; font-weight: 700; }
        .vtx-about-feat p { font-size: 13px; line-height: 1.5; color: var(--text-muted); margin: 0; }
        .vtx-about-stat {
          display: flex; align-items: center; gap: 12px; margin-top: 26px;
          color: var(--accent); font-size: 26px; font-weight: 700;
        }
        .vtx-about-stat span { color: var(--text-muted); font-size: 15px; font-weight: 500; }

        .vtx-snapshot {
          border: 1px solid var(--accent-line); border-radius: 14px;
          background: #0b1120; box-shadow: 0 0 80px rgba(91,110,245,0.14);
          padding: 22px 18px 18px;
        }
        .vtx-snapshot-title {
          display: flex; align-items: center; gap: 10px;
          margin: 0 0 16px; padding: 0 6px 6px;
          font-size: 15px; font-weight: 700; color: #fff;
        }
        .vtx-snapshot-title svg { color: var(--accent); }
        .vtx-snapshot-rows { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
        .vtx-snapshot-row {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 14px; border-radius: 10px; background: var(--panel-alt);
        }
        .vtx-coin-badge {
          flex: none; width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-weight: 800; font-size: 13px;
        }
        .vtx-snapshot-pair { font-weight: 600; color: var(--text); font-size: 14px; }
        .vtx-snapshot-quote {
          margin-left: auto; display: grid; text-align: right;
          font-family: var(--font-mono); font-size: 13px;
        }
        .vtx-snapshot-quote b { font-weight: 600; color: var(--text); font-size: 14px; }
        .vtx-snapshot-quote em { font-style: normal; font-weight: 600; }

        /* Perks */
        .vtx-perks-head { text-align: center; max-width: 620px; margin: 0 auto; }
        .vtx-perks-head h2 { margin: 0 auto; }
        .vtx-perks-head p { color: var(--text-muted); font-size: 16px; line-height: 1.65; margin: 16px 0 0; }
        .vtx-perks-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 24px; margin-top: 44px;
        }
        .vtx-perk-card {
          padding: 26px; border: 1px solid var(--border);
          border-radius: 14px; background: var(--panel);
        }
        .vtx-perk-icon {
          display: grid; place-items: center;
          width: 56px; height: 56px; border-radius: 14px;
          background: linear-gradient(135deg, var(--accent-mid), rgba(91,110,245,0.05));
          color: var(--accent);
        }
        .vtx-perk-card h3 { margin: 22px 0 10px; font-size: 18px; font-weight: 700; color: #fff; }
        .vtx-perk-card p { margin: 0; font-size: 14px; line-height: 1.65; color: var(--text-muted); }

        /* Why */
        .vtx-why {
          display: grid; grid-template-columns: 1.1fr 1fr; gap: 48px;
          align-items: center;
        }
        .vtx-why h2 { margin-bottom: 14px; }
        .vtx-why-list { list-style: none; margin: 28px 0 0; padding: 0; display: grid; gap: 16px; max-width: 560px; }
        .vtx-why-item { display: flex; gap: 14px; align-items: flex-start; }
        .vtx-why-item-icon {
          flex: none; display: grid; place-items: center;
          width: 44px; height: 44px; border-radius: 10px;
          background: var(--accent-soft); color: var(--accent);
        }
        .vtx-why-item h3 { font-size: 15px; font-weight: 700; margin: 0 0 4px; color: var(--text); }
        .vtx-why-item p { margin: 0; font-size: 13px; line-height: 1.55; color: var(--text-muted); }
        .vtx-why-art { display: flex; justify-content: center; }
        .vtx-why-img {
          display: block; width: min(100%, 320px); height: auto;
          box-sizing: border-box; border: 10px solid #111;
          border-radius: 46px; background: #000;
          box-shadow: 0 0 0 2px #2c2c2c, 0 0 0 5px #0a0a0a, 0 30px 90px rgba(91,110,245,0.22);
        }

        /* Live chart panel */
        .vtx-chart-panel {
          border: 1px solid var(--border); border-radius: var(--radius);
          background: var(--panel); padding: 4px; overflow: hidden;
        }
        .vtx-chart-panel iframe {
          width: 100%; height: 500px; border: none; display: block;
          border-radius: var(--radius-sm);
        }

        /* Transparency */
        .vtx-transparency {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 40px; align-items: center;
        }
        .vtx-transparency-img {
          background-size: cover; background-position: center;
          min-height: 380px; border-radius: var(--radius);
          border: 1px solid var(--border);
        }

        /* Prices table */
        .vtx-prices-head { text-align: center; margin-bottom: 32px; }
        .vtx-prices-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .vtx-prices-table { width: 100%; min-width: 720px; border-collapse: collapse; }
        .vtx-prices-table th {
          padding: 14px 16px; text-align: right; font-size: 13px;
          font-weight: 500; color: var(--text-muted);
          border-bottom: 1px solid var(--border); white-space: nowrap;
        }
        .vtx-prices-table th:first-child,
        .vtx-prices-table td:first-child { text-align: left; }
        .vtx-prices-table td {
          padding: 16px; text-align: right;
          border-bottom: 1px solid var(--border);
          font-size: 14px; white-space: nowrap;
        }
        .vtx-prices-table tbody tr { transition: background 0.15s; }
        .vtx-prices-table tbody tr:hover { background: var(--panel-alt); }
        .vtx-prices-asset { display: flex; align-items: center; gap: 12px; }
        .vtx-prices-asset strong { display: block; font-size: 15px; font-weight: 700; color: #fff; }
        .vtx-prices-asset small { display: block; margin-top: 2px; font-size: 12px; color: var(--text-muted); }
        .vtx-prices-num { font-family: var(--font-mono); color: var(--text-muted); }
        .vtx-prices-num-main { color: #fff; font-weight: 700; }
        .vtx-prices-chg { font-weight: 600; font-family: var(--font-mono); }

        /* Closing stats */
        .vtx-closing-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 24px; max-width: 1400px; margin: 0 auto;
          padding: 48px 32px;
          border-top: 1px solid var(--accent-line);
          border-bottom: 1px solid var(--accent-line);
          background: linear-gradient(180deg, rgba(91,110,245,0.08), rgba(91,110,245,0.02));
        }
        .vtx-closing-stat {
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
        }
        .vtx-closing-stat strong {
          font-size: 34px; font-weight: 700;
          letter-spacing: -0.02em; color: #fff;
          font-family: var(--font-display);
        }
        .vtx-closing-stat span {
          margin-top: 6px; font-size: 14px; color: var(--text-muted);
        }

        /* CTA */
        .vtx-cta {
          max-width: 640px; margin: 0 auto;
          padding: 72px 32px; text-align: center;
        }
        .vtx-cta h2 {
          margin: 0 auto; font-size: clamp(28px, 3.5vw, 42px);
          line-height: 1.15; color: #fff;
        }
        .vtx-cta p { margin: 16px 0 0; color: var(--text-muted); font-size: 16px; line-height: 1.65; }
        .vtx-cta-buttons { display: flex; justify-content: center; gap: 14px; margin-top: 28px; flex-wrap: wrap; }
        .vtx-cta-buttons .vtx-btn { padding: 14px 32px; font-size: 15px; }

        /* Legal */
        .vtx-legal {
          background: radial-gradient(600px 300px at 100% 100%, rgba(91,110,245,0.06), transparent 70%);
          border-top: 1px solid var(--border);
        }
        .vtx-legal-inner { max-width: 820px; margin: 0 auto; padding: 48px 32px 56px; }
        .vtx-legal-inner p {
          margin: 0 0 20px; font-size: 13px; line-height: 1.7; color: #7d84a0;
        }
        .vtx-legal-inner strong { color: #b0b8d4; font-weight: 600; }
        .vtx-legal-risk { color: #e8a317 !important; }
        .vtx-legal-risk strong { color: #f5b73a; }

        /* Footer */
        .vtx-foot {
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px; flex-wrap: wrap; padding: 32px 32px;
          border-top: 1px solid var(--border); background: #050912;
          max-width: 1400px; margin: 0 auto;
        }
        .vtx-foot-nav { display: flex; gap: 28px; flex-wrap: wrap; }
        .vtx-foot-nav a { font-size: 13px; color: var(--text-muted); transition: color 0.15s; }
        .vtx-foot-nav a:hover { color: var(--accent); }
        .vtx-foot-copy { font-size: 13px; color: var(--text-muted); }

        /* ---------- Responsive ---------- */
        @media (max-width: 1024px) {
          .vtx-hero { grid-template-columns: 1fr; padding: 48px 24px 24px; gap: 28px; }
          .vtx-hero-image { display: none; }
          .vtx-hero-mobile-img {
            display: block; order: 99; width: 100%; margin: 24px 0 0;
          }
          .vtx-hero-mobile-img img { width: 100%; height: auto; display: block; border-radius: var(--radius); }
          .vtx-about { grid-template-columns: 1fr; gap: 36px; }
          .vtx-why { grid-template-columns: 1fr; gap: 32px; }
          .vtx-transparency { grid-template-columns: 1fr; gap: 24px; }
          .vtx-perks-grid { grid-template-columns: 1fr; margin-top: 32px; }
          .vtx-strategy-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 900px) {
          .vtx-section { padding: 32px 24px; }
          .vtx-container { padding: 0 24px; }
          .vtx-about-feats { grid-template-columns: 1fr; }
          .vtx-closing-stats { grid-template-columns: repeat(2, 1fr); padding: 36px 24px; row-gap: 28px; }
          .vtx-cta { padding: 56px 24px; }
          .vtx-foot { flex-direction: column; text-align: center; padding: 28px 24px; }
          .vtx-foot-nav { justify-content: center; gap: 16px 24px; }
        }
        @media (max-width: 640px) {
          .vtx-landing { --nav-h: 56px; }
          .vtx-hero h1 { font-size: 34px; }
          .vtx-hero p { font-size: 15px; }
          .vtx-chart-panel iframe { height: 340px; }
          .vtx-transparency-img { min-height: 280px; }
          .vtx-prices-table { min-width: 620px; }
          .vtx-prices-table th { padding: 12px 10px; font-size: 12px; }
          .vtx-prices-table td { padding: 12px 10px; font-size: 13px; }
          .vtx-closing-stat strong { font-size: 26px; }
          .vtx-closing-stat span { font-size: 12px; }
          .vtx-cta-buttons { flex-direction: column; }
          .vtx-cta-buttons .vtx-btn { width: 100%; }
          .vtx-why-img { width: min(100%, 240px); border-width: 8px; border-radius: 36px; }
          .vtx-legal-inner { padding: 36px 24px 44px; }
        }
      `}</style>

      <Navbar />

      <div className="vtx-landing">
        {/* ── TICKER ── */}
        <div className="vtx-tape" aria-hidden="true">
          <div className="vtx-tape-track">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="vtx-tape-item">
                <b>{t.s}</b> {t.p}{" "}
                <em className={t.up ? "vtx-up" : "vtx-down"}>{t.c}</em>
              </span>
            ))}
          </div>
        </div>

        {/* ── HERO ── */}
        <section className="vtx-hero" id="platform">
          <div className="vtx-hero-copy">
            <span className="vtx-eyebrow">
              <span className="vtx-dot" /> Non-custodial accumulation bots
            </span>
            <h1>Accumulate Your Wealth, Become A Smart Trader.</h1>

            <div className="vtx-hero-mobile-img">
              <img src={heroTradeImage} alt="VantyxTrade trading dashboard preview" />
            </div>

            <p>
              VantyxTrade runs disciplined, rule-based buying strategies
              directly on your own Binance account. We never hold your money —
              you connect a trade-only API key, set your schedule, and the bot
              does the rest.
            </p>
            <div className="vtx-cta-row">
              <Link to="/signup" className="vtx-btn vtx-btn-primary">Create an account</Link>
              <Link to="/login" className="vtx-btn vtx-btn-ghost">Login</Link>
            </div>
          </div>

          <div className="vtx-hero-image">
            <img src={heroTradeImage} alt="VantyxTrade trading dashboard preview" />
          </div>
        </section>

        {/* ── STRATEGY ── */}
        <section className="vtx-section" id="bots">
          <div className="vtx-kicker">Strategy</div>
          <h2>Two focused strategies. No noise, no guesswork.</h2>
          <p className="vtx-section-lede">
            Rather than a wall of preset bots, VantyxTrade ships two strategies
            we actually stand behind — each with dip and RSI-aware buying
            layered on top of a fixed schedule.
          </p>
          <div className="vtx-strategy-grid">
            {FEATURE_CARDS.map((c) => (
              <div key={c.title} className="vtx-strategy-card">
                <div className="vtx-strategy-img-wrap">
                  <div className="vtx-strategy-badge">{c.icon}</div>
                </div>
                <div className="vtx-strategy-body">
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ABOUT + MARKET SNAPSHOT ── */}
        <section className="vtx-section">
          <div className="vtx-about">
            <div>
              <div className="vtx-kicker">Why VantyxTrade</div>
              <h2>Everything you need to accumulate with clarity.</h2>
              <p>
                Follow the market as it moves and act with tools built for
                disciplined DCA. One workspace brings your schedules, dip
                triggers, and RSI rules together — and every order runs on
                your own Binance account.
              </p>

              <div className="vtx-about-feats">
                <div className="vtx-about-feat">
                  <span className="vtx-about-feat-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
                    </svg>
                  </span>
                  <div>
                    <h3>Instant execution</h3>
                    <p>Orders fill in moments, priced from the live order book.</p>
                  </div>
                </div>
                <div className="vtx-about-feat">
                  <span className="vtx-about-feat-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
                    </svg>
                  </span>
                  <div>
                    <h3>Protected funds</h3>
                    <p>Layered safeguards keep your balance and account locked down.</p>
                  </div>
                </div>
              </div>

              <div className="vtx-about-stat">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.5a3.5 3.5 0 010 7M18 14.3c2 .7 3.5 2.6 3.5 5.7" />
                </svg>
                20,000+
                <span>Registered traders</span>
              </div>
            </div>

            <div className="vtx-snapshot">
              <h3 className="vtx-snapshot-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 20V10M12 20V4M19 20v-7" />
                </svg>
                Market Snapshot
              </h3>
              <ul className="vtx-snapshot-rows">
                {SNAPSHOT.map((r) => (
                  <li key={r.s} className="vtx-snapshot-row">
                    <span className="vtx-coin-badge" style={{ background: r.bg, color: "#fff" }}>{r.sym}</span>
                    <span className="vtx-snapshot-pair">{r.s}</span>
                    <span className="vtx-snapshot-quote">
                      <b>{r.p}</b>
                      <em className={r.up ? "vtx-up" : "vtx-down"}>{r.ch}</em>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── PERKS ── */}
        <section className="vtx-section">
          <div className="vtx-perks-head">
            <div className="vtx-kicker">Built for traders</div>
            <h2>Tools that keep you ahead.</h2>
            <p>
              Live prices and dependable features give you a clear view of
              every move and the speed to act on it.
            </p>
          </div>
          <div className="vtx-perks-grid">
            {PERKS.map((p) => (
              <article key={p.title} className="vtx-perk-card">
                <span className="vtx-perk-icon">{p.icon}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── WHY / ADVANTAGES ── */}
        <section className="vtx-section">
          <div className="vtx-why">
            <div>
              <div className="vtx-kicker">Our advantages</div>
              <h2>Built to earn your trust.</h2>
              <ul className="vtx-why-list">
                {REASONS.map((r) => (
                  <li key={r.title} className="vtx-why-item">
                    <span className="vtx-why-item-icon">{r.icon}</span>
                    <div>
                      <h3>{r.title}</h3>
                      <p>{r.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="vtx-why-art">
              <img className="vtx-why-img" src={phoneImage} alt="VantyxTrade mobile app" loading="lazy" />
            </div>
          </div>
        </section>

        {/* ── LIVE CHART ── */}
        <section className="vtx-section" id="live-chart">
          <div className="vtx-kicker">Live market data</div>
          <h2>Watch the market in real time.</h2>
          <p className="vtx-section-lede" style={{ marginBottom: 24 }}>
            No need to leave the page — track live BTC/USDT price action right
            here before you connect your account.
          </p>
          <div className="vtx-chart-panel">
            <iframe
              src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_live_chart&symbol=BINANCE%3ABTCUSDT&interval=60&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=121A2E&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=1&studies=[]&studies_overrides={}&overrides={%22paneProperties.background%22%3A%22%230A0E1A%22%2C%22paneProperties.vertGridProperties.color%22%3A%22%23262F4A%22%2C%22paneProperties.horzGridProperties.color%22%3A%22%23262F4A%22%2C%22scalesProperties.textColor%22%3A%22%238A93B3%22}&enabled_features=[]&disabled_features=[]&locale=en"
              allowTransparency="true"
              allowFullScreen
              title="Live BTC/USDT Chart"
            />
          </div>
        </section>

        {/* ── TRANSPARENCY ── */}
        <section className="vtx-section" id="markets">
          <div className="vtx-transparency">
            <div>
              <div className="vtx-kicker">Transparency</div>
              <h2>Every order is logged, every trigger is explained.</h2>
              <p className="vtx-section-lede">
                Your dashboard shows exactly why each buy happened — scheduled
                interval, dip trigger, or RSI trigger — pulled straight from
                your real Binance order history.
              </p>
            </div>
            <div
              className="vtx-transparency-img"
              style={{ backgroundImage: `url(${phoneImage})` }}
            />
          </div>
        </section>

        {/* ── PRICES ── */}
        <section className="vtx-section">
          <div className="vtx-prices-head">
            <div className="vtx-kicker">Market pulse</div>
            <h2>Live crypto rates.</h2>
          </div>
          <div className="vtx-prices-scroll">
            <table className="vtx-prices-table">
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Last price</th>
                  <th>Change (24h)</th>
                  <th>Peak (24h)</th>
                  <th>Floor (24h)</th>
                </tr>
              </thead>
              <tbody>
                {MARKET.map((m) => (
                  <tr key={m.k}>
                    <td>
                      <div className="vtx-prices-asset">
                        <span className="vtx-coin-badge" style={{ background: m.bg, color: "#fff" }}>{m.sym}</span>
                        <div>
                          <strong>{m.k}</strong>
                          <small>{m.n}</small>
                        </div>
                      </div>
                    </td>
                    <td className="vtx-prices-num vtx-prices-num-main">{m.p}</td>
                    <td className={`vtx-prices-chg ${m.up ? "vtx-up" : "vtx-down"}`}>{m.ch}</td>
                    <td className="vtx-prices-num">{m.h}</td>
                    <td className="vtx-prices-num">{m.l}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── CLOSING STATS ── */}
        <section className="vtx-closing-stats">
          {FIGURES.map((f) => (
            <div key={f.l} className="vtx-closing-stat">
              <strong>{f.v}</strong>
              <span>{f.l}</span>
            </div>
          ))}
        </section>

        {/* ── CTA ── */}
        <section className="vtx-cta">
          <h2>Ready to automate your accumulation?</h2>
          <p>
            Become part of a growing community of disciplined accumulators.
            Register in minutes, connect your Binance API key, and let the bot
            work while you get on with your day.
          </p>
          <div className="vtx-cta-buttons">
            <Link to="/signup" className="vtx-btn vtx-btn-primary">Get started free</Link>
            <Link to="/login" className="vtx-btn vtx-btn-ghost">Login</Link>
          </div>
        </section>

        {/* ── LEGAL ── */}
        <section className="vtx-legal">
          <div className="vtx-legal-inner">
            <p>
              <strong>VantyxTrade LLC</strong> is a limited liability company
              organised under the laws of the <strong>State of Arizona, United
              States</strong>, entity ID <strong>L23817405</strong>, and is
              registered with the <strong>Arizona Corporation Commission</strong>{" "}
              as a software provider for digital asset trading automation. Its
              registered address is{" "}
              <strong>2555 E Camelback Road, Suite 700, Phoenix, AZ 85016, United States</strong>.
            </p>
            <p>
              VantyxTrade is a <strong>software tool</strong>, not a broker, exchange,
              custodian, or investment adviser. All trades execute through the
              Binance account you connect, under the terms of your own agreement
              with Binance. VantyxTrade never holds, touches, or has the ability
              to withdraw your funds.
            </p>
            <p className="vtx-legal-risk">
              <strong>Risk notice:</strong> Digital asset prices are highly volatile
              and can fall sharply. Automated strategies do not remove market risk,
              and past performance is no guarantee of future results. Only deploy
              capital you can afford to lose. You are solely responsible for the
              configuration of your bots and the outcomes they produce.
            </p>
            <p>
              Nothing on this website is investment advice, a personal
              recommendation, or an offer to buy or sell any asset. Any action
              you take after visiting the site is your own, voluntary choice.
              The content should not be read as an invitation to enter into, or
              acquire, any financial product.
            </p>
            <p>
              Services are not available to residents of sanctioned or restricted
              regions, including but not limited to{" "}
              <strong>
                North Korea, Iran, Syria, Cuba, the Crimea region, Sudan,
                Afghanistan, and any jurisdiction identified by the U.S. Office
                of Foreign Assets Control (OFAC) as subject to comprehensive
                sanctions
              </strong>. Access from the United States is limited to spot-only
              automation and is subject to local law in your state.
            </p>
            <p>
              Site content may only be reproduced with written consent from
              VantyxTrade. We follow the Payment Card Industry Data Security
              Standard (PCI DSS) and run regular vulnerability checks and
              penetration tests as our business model requires.
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="vtx-foot">
          <nav className="vtx-foot-nav" aria-label="Footer">
            <Link to="/markets">Markets</Link>
            <Link to="/trade">Spot trading</Link>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Register</Link>
          </nav>
          <span className="vtx-foot-copy">
            © {new Date().getFullYear()} VantyxTrade. Not financial advice. Trading involves risk.
          </span>
        </footer>
      </div>
    </>
  );
}
