import { useState, useEffect, useReducer, useRef } from "react";
import "./Spot.css";

// ---------- Config ----------
const MARKETS = [
  { id: "R_10", name: "Volatility 10 Index", base: 4968, vol: 0.18 },
  { id: "R_25", name: "Volatility 25 Index", base: 2410, vol: 0.35 },
  { id: "R_50", name: "Volatility 50 Index", base: 262, vol: 0.09 },
  { id: "R_75", name: "Volatility 75 Index", base: 48210, vol: 4.5 },
  { id: "R_100", name: "Volatility 100 Index", base: 812, vol: 0.55 },
];

const HISTORY = 1000; // ticks used for the digit stats
const VISIBLE = 60; // ticks drawn on the chart
const PAYOUT = 1.95; // total return multiplier on a win
const TICK_MS = 1000;
const W = 1000;
const H = 500;
const RING = 2 * Math.PI * 19;

// ---------- Simulated tick feed ----------
function gauss() {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function nextPrice(m, prev) {
  const pull = (m.base - prev) * 0.002;
  return Math.round((prev + pull + gauss() * m.vol) * 100) / 100;
}

function seed(m) {
  const arr = [m.base];
  for (let i = 1; i < HISTORY; i++) arr.push(nextPrice(m, arr[i - 1]));
  return arr;
}

const lastDigit = (price) => Math.round(price * 100) % 10;
const money = (n) => `$${n.toFixed(2)}`;

// ---------- Small icons ----------
function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className="ds-chevron">
      <path
        d="M2 4l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Dice() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <rect className="ds-dice-body" x="1.5" y="1.5" width="13" height="13" rx="3" />
      <circle className="ds-dice-dot" cx="5" cy="5" r="1.2" />
      <circle className="ds-dice-dot" cx="8" cy="8" r="1.2" />
      <circle className="ds-dice-dot" cx="11" cy="11" r="1.2" />
    </svg>
  );
}

function Sparkle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M10 4l1.6 4.4L16 10l-4.4 1.6L10 16l-1.6-4.4L4 10l4.4-1.6L10 4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M18 3v4M16 5h4M18 15v4M16 17h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------- Page ----------
export default function Spot() {
  const [marketId, setMarketId] = useState(MARKETS[0].id);
  const [mode, setMode] = useState("manual");
  const [stake, setStake] = useState(700);
  const [ticks, setTicks] = useState(1);
  const [session, setSession] = useState({
    trades: 0,
    wins: 0,
    losses: 0,
    pnl: 0,
  });
  const [scanNote, setScanNote] = useState("");
  const [, rerender] = useReducer((n) => n + 1, 0);

  const store = useRef(null);
  if (!store.current) {
    store.current = Object.fromEntries(MARKETS.map((m) => [m.id, seed(m)]));
  }
  const open = useRef([]);
  const idRef = useRef(0);
  const scanTimer = useRef(null);
  const cfg = useRef({});
  cfg.current = { mode, stake, ticks, marketId };

  // One clock drives every market, settles trades and runs auto mode
  useEffect(() => {
    const timer = setInterval(() => {
      MARKETS.forEach((m) => {
        const arr = store.current[m.id];
        arr.push(nextPrice(m, arr[arr.length - 1]));
        if (arr.length > HISTORY) arr.shift();
      });

      const delta = { trades: 0, wins: 0, losses: 0, pnl: 0 };
      open.current = open.current.filter((t) => {
        t.left -= 1;
        if (t.left > 0) return true;
        const arr = store.current[t.marketId];
        const isEven = lastDigit(arr[arr.length - 1]) % 2 === 0;
        const won = isEven === (t.side === "even");
        delta.trades += 1;
        if (won) delta.wins += 1;
        else delta.losses += 1;
        delta.pnl += won ? t.stake * (PAYOUT - 1) : -t.stake;
        return false;
      });
      if (delta.trades) {
        setSession((s) => ({
          trades: s.trades + delta.trades,
          wins: s.wins + delta.wins,
          losses: s.losses + delta.losses,
          pnl: s.pnl + delta.pnl,
        }));
      }

      const c = cfg.current;
      if (c.mode === "auto" && c.stake >= 1 && open.current.length === 0) {
        const recent = store.current[c.marketId].slice(-100);
        const evens = recent.filter((p) => lastDigit(p) % 2 === 0).length;
        open.current.push({
          id: ++idRef.current,
          marketId: c.marketId,
          side: evens >= recent.length / 2 ? "even" : "odd",
          stake: c.stake,
          left: c.ticks,
        });
      }

      rerender();
    }, TICK_MS);

    return () => {
      clearInterval(timer);
      clearTimeout(scanTimer.current);
    };
  }, []);

  // ---------- Derived data ----------
  const market = MARKETS.find((m) => m.id === marketId);
  const history = store.current[marketId];
  const visible = history.slice(-VISIBLE);
  const last = visible[visible.length - 1];
  const change = ((last - visible[0]) / visible[0]) * 100;
  const digit = lastDigit(last);

  const counts = Array(10).fill(0);
  history.forEach((p) => (counts[lastDigit(p)] += 1));
  const pcts = counts.map((c) => (c / history.length) * 100);
  const maxP = Math.max(...pcts);
  const minP = Math.min(...pcts);

  const lo = Math.min(...visible);
  const hi = Math.max(...visible);
  const pad = (hi - lo) * 0.12 || 1;
  const yMin = lo - pad;
  const yMax = hi + pad;
  const X = (i) => (i / (visible.length - 1)) * W;
  const Y = (v) => (1 - (v - yMin) / (yMax - yMin)) * H;

  const line = visible
    .map((p, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)} ${Y(p).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const yLabels = Array.from({ length: 9 }, (_, k) => ({
    pct: (k / 8) * 100,
    value: yMax - (k * (yMax - yMin)) / 8,
  }));

  const payout = stake * PAYOUT;
  const canTrade = mode === "manual" && stake >= 1;
  const pnl = session.pnl;

  // ---------- Actions ----------
  const place = (side) => {
    if (!canTrade) return;
    open.current.push({
      id: ++idRef.current,
      marketId,
      side,
      stake,
      left: ticks,
    });
    rerender();
  };

  const scan = () => {
    let best = null;
    MARKETS.forEach((m) => {
      const arr = store.current[m.id];
      const evenShare =
        arr.filter((p) => lastDigit(p) % 2 === 0).length / arr.length;
      const edge = Math.abs(evenShare - 0.5);
      if (!best || edge > best.edge) best = { m, edge, evenShare };
    });
    setMarketId(best.m.id);
    const side = best.evenShare >= 0.5 ? "Even" : "Odd";
    const share = Math.max(best.evenShare, 1 - best.evenShare) * 100;
    setScanNote(`${best.m.name.replace(" Index", "")}: ${side} ${share.toFixed(1)}%`);
    clearTimeout(scanTimer.current);
    scanTimer.current = setTimeout(() => setScanNote(""), 6000);
  };

  const bumpStake = (amount) => setStake((s) => Math.max(1, s + amount));

  // ---------- Render ----------
  return (
    <div className="ds-page">
      {/* ===== Left: chart + digit strip ===== */}
      <div className="ds-left">
        <div className="ds-chart">
          <div className="ds-topbar">
            <div className="ds-pill">
              <div className="ds-pill-title">{market.name}</div>
              <div className="ds-pill-sub">
                <span>{last.toFixed(2)}</span>
                <span className={change >= 0 ? "up" : "down"}>
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)}%
                </span>
              </div>
              <Chevron />
              <select
                aria-label="Market"
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
              >
                {MARKETS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ds-pill ds-pill-contract">
              <div className="ds-pill-title">
                <Dice />
                <span>Even / Odd</span>
              </div>
              <div className="ds-pill-sub">Contract Type</div>
              <Chevron />
            </div>
          </div>

          <div className="ds-plot">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="dsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop className="ds-fill-stop" offset="0%" stopOpacity="0.16" />
                  <stop className="ds-fill-stop" offset="100%" stopOpacity="0" />
                </linearGradient>
              </defs>
              {yLabels.map((l) => (
                <line
                  key={l.pct}
                  x1="0"
                  x2={W}
                  y1={(l.pct / 100) * H}
                  y2={(l.pct / 100) * H}
                  className="ds-grid"
                />
              ))}
              {[1, 2, 3, 4, 5].map((k) => (
                <line
                  key={k}
                  x1={(k / 6) * W}
                  x2={(k / 6) * W}
                  y1="0"
                  y2={H}
                  className="ds-grid"
                />
              ))}
              <path d={area} fill="url(#dsFill)" />
              <path d={line} className="ds-line" />
            </svg>
          </div>

          <div className="ds-yaxis">
            {yLabels.map((l) => (
              <span key={l.pct} className="ds-ylabel" style={{ top: `${l.pct}%` }}>
                {l.value.toFixed(2)}
              </span>
            ))}
            <span
              className="ds-pricetag"
              style={{ top: `${(Y(last) / H) * 100}%` }}
            >
              {last.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="ds-digits">
          {pcts.map((p, d) => {
            const tone = p === maxP ? "hi" : p === minP ? "lo" : "mid";
            const frac = Math.min(p / 20, 1);
            const current = d === digit;
            return (
              <div
                key={d}
                className={`ds-digit tone-${tone} ${current ? "current" : ""}`}
              >
                <svg viewBox="0 0 44 44">
                  <circle className="track" cx="22" cy="22" r="19" />
                  <circle
                    className="arc"
                    cx="22"
                    cy="22"
                    r="19"
                    strokeDasharray={`${frac * RING} ${RING}`}
                    transform="rotate(-90 22 22)"
                  />
                </svg>
                <span className="num">{d}</span>
                <span className="pct">{p.toFixed(1)}%</span>
                {current && <span className="ptr" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Right: trade panel ===== */}
      <div className="ds-panel">
        <div className="ds-modes">
          <button
            className={`ds-mode ${mode === "auto" ? "active" : ""}`}
            onClick={() => setMode("auto")}
          >
            <i /> AUTO
          </button>
          <button
            className={`ds-mode ${mode === "manual" ? "active" : ""}`}
            onClick={() => setMode("manual")}
          >
            <i /> MANUAL
          </button>
        </div>

        <div className="ds-stake-row">
          <button
            className="ds-step"
            onClick={() => bumpStake(-10)}
            aria-label="Decrease stake"
          >
            &minus;
          </button>
          <div className="ds-stake">
            <span className="label">STAKE</span>
            <div className="value">
              <span>$</span>
              <input
                type="number"
                min="1"
                value={stake}
                onChange={(e) => setStake(Math.max(0, Number(e.target.value) || 0))}
                aria-label="Stake"
              />
            </div>
          </div>
          <button
            className="ds-step"
            onClick={() => bumpStake(10)}
            aria-label="Increase stake"
          >
            +
          </button>
          <button className="ds-scanner" onClick={scan}>
            <span className="title">
              <Sparkle /> AI Scanner
            </span>
            <span className="sub">{scanNote || "Find best market"}</span>
          </button>
        </div>

        <div className="ds-ticks">
          <div className="ds-ticks-head">
            <span>TICKS</span>
            <span className="badge">{ticks}</span>
          </div>
          <div className="ds-ticks-row">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`ds-tick ${ticks === n ? "active" : ""}`}
                onClick={() => setTicks(n)}
                aria-label={`${n} tick${n > 1 ? "s" : ""}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="ds-session">
          <span className="dot" />
          <span className="name">Session</span>
          <span className="meta">
            {session.trades}t &middot; {session.wins}W/{session.losses}L
            {open.current.length > 0 && ` \u00b7 ${open.current.length} open`}
          </span>
          <span className={`pnl ${pnl < 0 ? "down" : "up"}`}>
            {pnl >= 0 ? "+" : "-"}
            {Math.abs(pnl).toFixed(2)}
          </span>
        </div>

        <div className="ds-actions">
          <button
            className="ds-trade even"
            disabled={!canTrade}
            onClick={() => place("even")}
          >
            <span className="name">Even</span>
            <span className="pay">{money(payout)}</span>
          </button>
          <button
            className="ds-trade odd"
            disabled={!canTrade}
            onClick={() => place("odd")}
          >
            <span className="name">Odd</span>
            <span className="pay">{money(payout)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
