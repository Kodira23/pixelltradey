// Landing.jsx — VantyxTrade
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import heroTradeImage from "../tradex.png.webp";
import phoneImage from "../phone.jpg";

/* ---------------- DATA ---------------- */

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
    icon: <><path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-6" /></>,
    title: "Rules you can read",
    body: "Every trigger — scheduled, dip-based, or RSI-based — is written out in plain English in your dashboard. No black-box logic.",
  },
  {
    icon: <path d="M2 12h4l3-8 6 16 3-8h4" />,
    title: "Trade-only API keys",
    body: "We connect read + trade only. Withdrawal permissions are never requested, so your Binance account can't be drained by us.",
  },
  {
    icon: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
    title: "Fast execution",
    body: "Orders fire straight to Binance through a low-latency link, so your fills match the market price you planned for.",
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
  { v: "35,000+", l: "Active accumulators",
    i: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.5a3.5 3.5 0 010 7M18 14.3c2 .7 3.5 2.6 3.5 5.7" /></> },
  { v: "$180M+", l: "Volume processed",
    i: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /> },
  { v: "99.95%", l: "Bot uptime",
    i: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></> },
  { v: "4.9/5", l: "Avg. user rating",
    i: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /> },
];

/* ---------------- COMPONENT ---------------- */

export default function Landing() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .vtx-landing {
          --bg: #0a0e1a;
          --panel: #0e1424;
          --panel-alt: #121a2e;
          --border: #1f2842;
          --accent: #5b6ef5;
          --accent-soft: rgba(91,110,245,0.14);
          --accent-mid: rgba(91,110,245,0.24);
          --accent-line: rgba(91,110,245,0.22);
          --up: #35d0ba;
          --down: #ff6b6b;
          --muted: #8a93b3;
          --nav-h: 80px;
          --font: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
          --mono: ui-monospace, SFMono-Regular, Menlo, monospace;

          min-height: 100vh;
          padding-top: var(--nav-h);
          overflow-x: hidden;
          font-family: var(--font);
          color: #fff;
          background:
            radial-gradient(700px 420px at 82% 55%, rgba(91,110,245,0.16), transparent 65%),
            radial-gradient(500px 360px at 62% 20%, rgba(91,110,245,0.07), transparent 70%),
            var(--bg);
        }
        .vtx-landing a { color: inherit; text-decoration: none; }
        .vtx-landing h1, .vtx-landing h2, .vtx-landing h3 { margin: 0; font-family: inherit; }
        .vtx-up { color: var(--up); }
        .vtx-down { color: var(--down); }

        /* buttons (1px border on all so primary and ghost match in height) */
        .vtx-btn { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; padding: 12px 26px; border: 1px solid transparent; border-radius: 6px; font-family: inherit; font-weight: 600; font-size: 15px; line-height: 1.2; white-space: nowrap; cursor: pointer; transition: filter 0.15s, border-color 0.15s, background 0.15s; }
        .vtx-btn-primary { background: var(--accent); border-color: var(--accent); color: #fff; }
        .vtx-btn-primary:hover { filter: brightness(1.1); }
        .vtx-btn-ghost { background: #060a14; border-color: var(--border); color: #fff; }
        .vtx-btn-ghost:hover { border-color: var(--accent); }

        /* shared eyebrow (subheading above each h2) */
        .vtx-kicker { display: block; margin-bottom: 12px; color: var(--accent); font-size: 16px; font-weight: 600; }
        .vtx-center { text-align: center; }
        .vtx-center .vtx-kicker { margin-bottom: 8px; font-size: 15px; font-weight: 500; }

        /* ticker */
        .vtx-tape { overflow: hidden; border-bottom: 1px solid #111a2e; background: #050912; }
        .vtx-tape-track { display: flex; width: max-content; animation: vtx-scroll 40s linear infinite; }
        .vtx-tape-item { padding: 14px 28px; font-size: 14px; color: #e8ebf5; white-space: nowrap; border-right: 1px solid var(--border); }
        .vtx-tape-item b { font-weight: 700; margin-right: 6px; }
        .vtx-tape-item em { font-style: normal; margin-left: 4px; }
        @keyframes vtx-scroll { to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .vtx-tape-track { animation: none; } }

        /* hero: full-width image background, text left */
        .vtx-hero {
          display: grid; grid-template-columns: 1fr; align-items: center; min-height: 680px;
          padding: 100px max(52px, calc((100% - 1500px) / 2 + 52px)) 90px;
          background-image:
            linear-gradient(90deg, rgba(10,14,26,0.9) 0%, rgba(10,14,26,0.6) 45%, rgba(10,14,26,0.1) 100%),
            linear-gradient(180deg, rgba(10,14,26,0) 70%, var(--bg) 100%),
            var(--hero-img);
          background-size: cover; background-position: center right; background-repeat: no-repeat;
        }
        .vtx-hero-eyebrow { display: block; margin-bottom: 18px; color: var(--accent); font-size: 17px; font-weight: 500; }
        .vtx-hero h1 { font-size: clamp(42px, 5.8vw, 76px); line-height: 1.08; letter-spacing: -0.035em; font-weight: 700; color: #fff; max-width: 12em; }
        .vtx-hero p { margin: 22px 0 0; color: #b3b9d1; font-size: 19px; line-height: 1.65; max-width: 32em; }
        .vtx-hero-cta { display: flex; gap: 14px; margin-top: 34px; flex-wrap: wrap; }

        /* about + market snapshot */
        .vtx-about { display: grid; grid-template-columns: 1.15fr 1fr; gap: 56px; align-items: center; max-width: 1500px; margin: 0 auto; padding: 70px 52px 90px; }
        .vtx-about-copy h2 { font-size: clamp(32px, 4vw, 52px); line-height: 1.12; letter-spacing: -0.03em; font-weight: 700; max-width: 15ch; }
        .vtx-about-copy > p { margin: 20px 0 0; color: var(--muted); font-size: 18px; line-height: 1.6; max-width: 32em; }
        .vtx-about-feats { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 34px; }
        .vtx-about-feat { display: flex; gap: 14px; align-items: flex-start; }
        .vtx-about-feat h3 { font-size: 16px; font-weight: 700; }
        .vtx-about-feat p { margin: 6px 0 0; font-size: 14px; line-height: 1.5; color: var(--muted); }
        .vtx-icon-sm { flex: none; display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; background: var(--accent-soft); color: var(--accent); }
        .vtx-about-btn { margin-top: 34px; padding: 11px 24px; font-size: 14px; }
        .vtx-about-stat { display: flex; align-items: center; gap: 12px; margin-top: 28px; color: var(--accent); }
        .vtx-about-stat strong { font-size: 26px; font-weight: 700; color: #fff; }
        .vtx-about-stat span { color: var(--muted); font-size: 16px; }

        .vtx-snapshot { padding: 22px 18px 18px; border: 1px solid var(--accent-line); border-radius: 14px; background: #0b1120; box-shadow: 0 0 80px rgba(91,110,245,0.14); }
        .vtx-snapshot-title { display: flex; align-items: center; gap: 10px; padding: 0 6px 16px; font-size: 16px; font-weight: 600; color: #fff; }
        .vtx-snapshot-title svg { color: var(--accent); }
        .vtx-snapshot-rows { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
        .vtx-snapshot-row { display: flex; align-items: center; gap: 14px; padding: 18px 16px; border-radius: 10px; background: var(--panel-alt); }
        .vtx-coin { flex: none; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; color: #fff; font-weight: 800; font-size: 14px; }
        .vtx-snapshot-pair { font-weight: 600; color: #fff; }
        .vtx-snapshot-quote { margin-left: auto; display: grid; text-align: right; font-size: 14px; }
        .vtx-snapshot-quote b { font-weight: 600; color: #fff; font-family: var(--mono); font-size: 15px; }
        .vtx-snapshot-quote em { font-style: normal; font-weight: 600; }

        /* perks */
        .vtx-perks { max-width: 1500px; margin: 0 auto; padding: 40px 52px 100px; }
        .vtx-perks-head { max-width: 640px; margin: 0 auto; }
        .vtx-perks-head h2 { font-size: clamp(32px, 4.4vw, 52px); line-height: 1.1; letter-spacing: -0.03em; font-weight: 700; }
        .vtx-perks-head p { margin: 16px 0 0; color: var(--muted); font-size: 17px; line-height: 1.6; }
        .vtx-perks-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 56px; }
        .vtx-perk { padding: 24px; border: 1px solid var(--border); border-radius: 14px; background: var(--panel); }
        .vtx-perk-icon { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 14px; background: linear-gradient(135deg, var(--accent-mid), rgba(91,110,245,0.05)); color: var(--accent); }
        .vtx-perk h3 { margin: 28px 0 0; font-size: 19px; font-weight: 700; }
        .vtx-perk p { margin: 12px 0 0; font-size: 15px; line-height: 1.7; color: var(--muted); }

        /* transparency: text left, phone right */
        .vtx-split { display: grid; grid-template-columns: 1.1fr 1fr; gap: 56px; align-items: center; max-width: 1500px; margin: 0 auto; padding: 40px 52px 100px; background: radial-gradient(520px 380px at 80% 50%, rgba(91,110,245,0.08), transparent 70%); }
        .vtx-split h2 { font-size: clamp(32px, 4.2vw, 52px); line-height: 1.1; letter-spacing: -0.03em; font-weight: 700; max-width: 14em; }
        .vtx-split p { margin: 20px 0 0; color: var(--muted); font-size: 18px; line-height: 1.6; max-width: 30em; }
        .vtx-split-art { display: flex; justify-content: center; }
        .vtx-split-img { display: block; width: 100%; height: auto; box-sizing: border-box; border: 1px solid var(--accent-line); border-radius: 18px; background: #000; box-shadow: 0 30px 90px rgba(91,110,245,0.22); }

        /* prices */
        .vtx-prices { max-width: 1500px; margin: 0 auto; padding: 30px 52px 110px; }
        .vtx-prices-head { margin-bottom: 48px; }
        .vtx-prices-head h2 { font-size: clamp(30px, 4vw, 44px); letter-spacing: -0.03em; font-weight: 700; }
        .vtx-prices-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .vtx-prices-table { width: 100%; min-width: 720px; border-collapse: collapse; }
        .vtx-prices-table th { padding: 16px; text-align: right; font-size: 15px; font-weight: 500; color: var(--muted); border-bottom: 1px solid #182036; white-space: nowrap; }
        .vtx-prices-table th:first-child, .vtx-prices-table td:first-child { text-align: left; }
        .vtx-prices-table td { padding: 18px 16px; text-align: right; border-bottom: 1px solid #111829; font-size: 15px; white-space: nowrap; }
        .vtx-prices-table tbody tr { transition: background 0.15s; }
        .vtx-prices-table tbody tr:hover { background: #0c1222; }
        .vtx-prices-asset { display: flex; align-items: center; gap: 14px; }
        .vtx-prices-asset strong { display: block; font-size: 16px; font-weight: 700; color: #fff; }
        .vtx-prices-asset small { display: block; margin-top: 2px; font-size: 13px; color: var(--muted); }
        .vtx-prices-num { font-family: var(--mono); color: #939cbd; }
        .vtx-prices-num-main { color: #fff; font-weight: 700; }
        .vtx-prices-chg { font-weight: 600; }

        /* closing: figures + cta */
        .vtx-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; max-width: 1500px; margin: 0 auto; padding: 56px 120px; border-top: 1px solid var(--accent-line); border-bottom: 1px solid var(--accent-line); background: linear-gradient(180deg, rgba(91,110,245,0.08), rgba(91,110,245,0.02)); }
        .vtx-stat { display: flex; flex-direction: column; align-items: center; text-align: center; color: var(--accent); }
        .vtx-stat strong { margin-top: 14px; font-size: 36px; font-weight: 700; letter-spacing: -0.02em; color: #fff; }
        .vtx-stat span { margin-top: 6px; font-size: 15px; color: var(--muted); }
        .vtx-cta { max-width: 620px; margin: 0 auto; padding: 80px 20px 90px; text-align: center; }
        .vtx-cta h2 { font-size: clamp(30px, 4vw, 46px); line-height: 1.12; letter-spacing: -0.03em; font-weight: 700; }
        .vtx-cta p { margin: 18px 0 0; color: var(--muted); font-size: 17px; line-height: 1.6; }
        .vtx-cta-buttons { display: flex; justify-content: center; gap: 14px; margin-top: 32px; flex-wrap: wrap; }
        .vtx-cta-buttons .vtx-btn { padding: 16px 36px; font-size: 16px; }

        /* legal */
        .vtx-legal { background: radial-gradient(600px 300px at 100% 100%, rgba(91,110,245,0.06), transparent 70%); border-top: 1px solid #0f1526; }
        .vtx-legal-inner { max-width: 800px; margin: 0 auto; padding: 56px 20px 70px; }
        .vtx-legal-inner p { margin: 0 0 22px; font-size: 13px; line-height: 1.65; color: #7a82a0; }
        .vtx-legal-inner strong { color: #bcc3dc; font-weight: 600; }
        .vtx-legal-risk { color: #e8a317 !important; }
        .vtx-legal-risk strong { color: #f5b73a; }

        /* footer */
        .vtx-foot { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; padding: 40px 96px; border-top: 1px solid var(--border); background: #050912; }
        .vtx-foot-nav { display: flex; gap: 30px; }
        .vtx-foot-nav a { font-size: 14px; color: #9aa3c0; transition: color 0.15s; }
        .vtx-foot-nav a:hover { color: var(--accent); }
        .vtx-foot-copy { font-size: 14px; color: #9aa3c0; }

        /* ===== tablet / phone ===== */
        @media (max-width: 900px) {
          .vtx-tape-item { padding: 11px 20px; font-size: 13px; }
          .vtx-hero { min-height: 520px; padding: 60px 20px 50px; background-image: linear-gradient(180deg, rgba(10,14,26,0.7) 0%, rgba(10,14,26,0.8) 100%), var(--hero-img); background-position: 70% center; }
          .vtx-hero h1 { max-width: none; }
          .vtx-hero p { font-size: 17px; }
          .vtx-about { grid-template-columns: 1fr; padding: 40px 20px 60px; gap: 36px; }
          .vtx-about-feats { grid-template-columns: 1fr; }
          .vtx-about-copy h2 { max-width: none; }
          .vtx-perks { padding: 30px 20px 60px; }
          .vtx-perks-grid { grid-template-columns: 1fr; margin-top: 36px; }
          .vtx-split { grid-template-columns: 1fr; padding: 30px 20px 60px; gap: 36px; }
          .vtx-prices { padding: 30px 20px 70px; }
          .vtx-prices-head { margin-bottom: 32px; }
          .vtx-stats { grid-template-columns: repeat(2, 1fr); padding: 40px 20px; gap: 36px 12px; }
          .vtx-cta { padding: 56px 20px 70px; }
          .vtx-foot { flex-direction: column; padding: 32px 20px; text-align: center; }
          .vtx-foot-nav { flex-wrap: wrap; justify-content: center; gap: 18px 24px; }
        }
        @media (max-width: 640px) {
          .vtx-landing { --nav-h: 56px; }
          .vtx-hero-eyebrow { font-size: 15px; margin-bottom: 14px; }
          .vtx-hero h1 { font-size: 38px; }
          .vtx-hero p { font-size: 16px; margin-top: 16px; }
          .vtx-hero-cta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 26px; }
          .vtx-hero-cta .vtx-btn { width: 100%; min-height: 50px; padding: 0 12px; }
          .vtx-about-copy > p, .vtx-perks-head p, .vtx-split p, .vtx-cta p { font-size: 16px; }
          .vtx-snapshot { padding: 18px 12px 12px; }
          .vtx-snapshot-row { padding: 14px 12px; gap: 10px; }
          .vtx-snapshot-quote b { font-size: 14px; }
          .vtx-perk { padding: 20px; }
          .vtx-perk h3 { margin-top: 20px; }
          .vtx-split-img { border-radius: 14px; }
          .vtx-prices-table { min-width: 620px; }
          .vtx-prices-table th { padding: 12px 10px; font-size: 13px; }
          .vtx-prices-table td { padding: 14px 10px; font-size: 14px; }
          .vtx-prices-asset { gap: 10px; }
          .vtx-stat strong { font-size: 28px; }
          .vtx-stat span { font-size: 13px; }
          .vtx-cta-buttons { flex-direction: column; }
          .vtx-cta-buttons .vtx-btn { width: 100%; padding: 14px 20px; }
          .vtx-legal-inner { padding: 40px 20px 50px; }
          .vtx-foot-nav { gap: 14px 20px; }
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
        <section className="vtx-hero" id="platform" style={{ "--hero-img": `url(${heroTradeImage})` }}>
          <div>
            <span className="vtx-hero-eyebrow">Non-custodial accumulation bots</span>
            <h1>Accumulate Your Wealth, Become A Smart Trader.</h1>
            <p>
              VantyxTrade runs disciplined, rule-based buying strategies
              directly on your own Binance account. We never hold your money —
              you connect a trade-only API key, set your schedule, and the bot
              does the rest.
            </p>
            <div className="vtx-hero-cta">
              <Link to="/signup" className="vtx-btn vtx-btn-primary">Create an account</Link>
              <Link to="/login" className="vtx-btn vtx-btn-ghost">Login</Link>
            </div>
          </div>
        </section>

        {/* ── ABOUT + MARKET SNAPSHOT ── */}
        <section className="vtx-about">
          <div className="vtx-about-copy">
            <span className="vtx-kicker">Why VantyxTrade</span>
            <h2>Everything You Need To Accumulate With Clarity</h2>
            <p>
              Follow the market as it moves and act with tools built for
              disciplined DCA. One workspace brings your schedules, dip
              triggers, and RSI rules together — and every order runs on
              your own Binance account.
            </p>

            <div className="vtx-about-feats">
              <div className="vtx-about-feat">
                <span className="vtx-icon-sm" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>
                </span>
                <div>
                  <h3>Instant Execution</h3>
                  <p>Orders fill in moments, priced from the live order book.</p>
                </div>
              </div>
              <div className="vtx-about-feat">
                <span className="vtx-icon-sm" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
                </span>
                <div>
                  <h3>Protected Funds</h3>
                  <p>Layered safeguards keep your balance and account locked down.</p>
                </div>
              </div>
            </div>

            <Link to="/signup" className="vtx-btn vtx-btn-primary vtx-about-btn">Explore Features</Link>

            <div className="vtx-about-stat">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.5a3.5 3.5 0 010 7M18 14.3c2 .7 3.5 2.6 3.5 5.7" /></svg>
              <strong>20,000+</strong>
              <span>Registered traders</span>
            </div>
          </div>

          <div className="vtx-snapshot">
            <h3 className="vtx-snapshot-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M5 20V10M12 20V4M19 20v-7" /></svg>
              Market Snapshot
            </h3>
            <ul className="vtx-snapshot-rows">
              {SNAPSHOT.map((r) => (
                <li key={r.s} className="vtx-snapshot-row">
                  <span className="vtx-coin" style={{ background: r.bg }}>{r.sym}</span>
                  <span className="vtx-snapshot-pair">{r.s}</span>
                  <span className="vtx-snapshot-quote">
                    <b>{r.p}</b>
                    <em className={r.up ? "vtx-up" : "vtx-down"}>{r.ch}</em>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── PERKS ── */}
        <section className="vtx-perks">
          <div className="vtx-perks-head vtx-center">
            <span className="vtx-kicker">Built For Traders</span>
            <h2>Tools That Keep You Ahead</h2>
            <p>
              Live prices and dependable features give you a clear view of
              every move and the speed to act on it.
            </p>
          </div>
          <div className="vtx-perks-grid">
            {PERKS.map((p) => (
              <article key={p.title} className="vtx-perk">
                <span className="vtx-perk-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{p.icon}</svg>
                </span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── TRANSPARENCY ── */}
        <section className="vtx-split" id="markets">
          <div>
            <span className="vtx-kicker">Transparency</span>
            <h2>Every Order Is Logged, Every Trigger Is Explained</h2>
            <p>
              Your dashboard shows exactly why each buy happened — scheduled
              interval, dip trigger, or RSI trigger — pulled straight from
              your real Binance order history.
            </p>
          </div>
          <div className="vtx-split-art">
            <img className="vtx-split-img" src={phoneImage} alt="VantyxTrade mobile app" loading="lazy" />
          </div>
        </section>

        {/* ── PRICES ── */}
        <section className="vtx-prices">
          <div className="vtx-prices-head vtx-center">
            <span className="vtx-kicker">Market Pulse</span>
            <h2>Live Crypto Rates</h2>
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
                        <span className="vtx-coin" style={{ background: m.bg }}>{m.sym}</span>
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

        {/* ── CLOSING STATS + CTA ── */}
        <section>
          <div className="vtx-stats">
            {FIGURES.map((f) => (
              <div key={f.l} className="vtx-stat">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{f.i}</svg>
                <strong>{f.v}</strong>
                <span>{f.l}</span>
              </div>
            ))}
          </div>

          <div className="vtx-cta">
            <h2>Ready To Automate Your Accumulation?</h2>
            <p>
              Become part of a growing community of disciplined accumulators.
              Register in minutes, connect your Binance API key, and let the bot
              work while you get on with your day.
            </p>
            <div className="vtx-cta-buttons">
              <Link to="/signup" className="vtx-btn vtx-btn-primary">Get started free</Link>
              <Link to="/login" className="vtx-btn vtx-btn-ghost">Login</Link>
            </div>
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
