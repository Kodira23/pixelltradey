// src/pages/Spot.jsx

import { useState, useEffect, useReducer, useRef } from "react";
import { supabase } from "../supabaseClient";
import "./Spot.css";

// ---------- Config ----------
const MARKETS = [
  { id: "R_10", name: "Volatility 10 Index", base: 4968, vol: 0.18 },
  { id: "R_25", name: "Volatility 25 Index", base: 2410, vol: 0.35 },
  { id: "R_50", name: "Volatility 50 Index", base: 262, vol: 0.09 },
  { id: "R_75", name: "Volatility 75 Index", base: 48210, vol: 4.5 },
  { id: "R_100", name: "Volatility 100 Index", base: 812, vol: 0.55 },
];

// Each contract type has two mutually exclusive sides. `settle` decides a
// win given the finished trade (marketId, side, stake, entryPrice) and the
// price the market landed on when the trade's ticks ran out.
const CONTRACT_TYPES = [
  {
    id: "evenodd",
    label: "Even/Odd",
    options: [
      { key: "even", label: "Even" },
      { key: "odd", label: "Odd" },
    ],
    settle: (trade, finalPrice) => {
      const isEven = lastDigit(finalPrice) % 2 === 0;
      return isEven === (trade.side === "even");
    },
  },
  {
    id: "risefall",
    label: "Rise/Fall",
    options: [
      { key: "rise", label: "Rise" },
      { key: "fall", label: "Fall" },
    ],
    settle: (trade, finalPrice) => {
      const rose = finalPrice > trade.entryPrice;
      return rose === (trade.side === "rise");
    },
  },
  {
    id: "overunder",
    label: "Over/Under 5",
    options: [
      { key: "over", label: "Over 5" },
      { key: "under", label: "Under 5" },
    ],
    settle: (trade, finalPrice) => {
      const digit = lastDigit(finalPrice);
      return trade.side === "over" ? digit > 5 : digit < 5;
    },
  },
];

const HISTORY = 1000; // ticks kept in memory per market
const VISIBLE = 60; // ticks drawn on the chart
const PAYOUT = 1.95; // total return multiplier on a win
const TICK_MS = 1000;
const DEFAULT_STAKE = 50;
const W = 1000;
const H = 400;

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

function lastDigit(price) {
  return Math.round(price * 100) % 10;
}
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

// ---------- Page ----------
export default function Spot() {
  const [marketId, setMarketId] = useState(MARKETS[0].id);
  const [contractTypeId, setContractTypeId] = useState(CONTRACT_TYPES[0].id);
  const [mode, setMode] = useState("manual");
  const [stakeInput, setStakeInput] = useState(""); // empty = show placeholder
  const [ticks, setTicks] = useState(1);
  const [session, setSession] = useState({
    trades: 0,
    wins: 0,
    losses: 0,
    pnl: 0,
  });
  const [, rerender] = useReducer((n) => n + 1, 0);

  // ---------- Real balance (Supabase profiles.balance) ----------
  const [userId, setUserId] = useState(null);
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState("");

  const userIdRef = useRef(null);
  const balanceRef = useRef(0);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);
  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

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

        const { data, error } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", user.id)
          .single();
        if (error) throw error;

        setBalance(Number(data?.balance) || 0);
      } catch (e) {
        setBalanceError(e.message);
      } finally {
        setBalanceLoading(false);
      }
    }

    loadBalance();

    // Stay in sync with balance changes made elsewhere (admin panel, or the
    // Dashboard's own deposit/withdraw flows) while this page is open.
    const channel = supabase
      .channel("spot-profile-balance-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          if (userIdRef.current && payload.new.id === userIdRef.current) {
            setBalance(Number(payload.new.balance) || 0);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Apply a balance change locally and persist it, so this trading page and
  // the Dashboard's balance always agree.
  const applyBalanceDelta = async (delta) => {
    const next = Math.max(0, balanceRef.current + delta);
    balanceRef.current = next;
    setBalance(next);
    if (!userIdRef.current) return;
    const { error } = await supabase
      .from("profiles")
      .update({ balance: next })
      .eq("id", userIdRef.current);
    if (error) console.error("Failed to update balance:", error.message);
  };

  const stake = stakeInput === "" ? DEFAULT_STAKE : Number(stakeInput) || 0;

  const store = useRef(null);
  if (!store.current) {
    store.current = Object.fromEntries(MARKETS.map((m) => [m.id, seed(m)]));
  }
  const open = useRef([]);
  const idRef = useRef(0);
  const cfg = useRef({});
  cfg.current = { mode, stake, ticks, marketId, contractTypeId };

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
        const finalPrice = arr[arr.length - 1];
        const contract = CONTRACT_TYPES.find((c) => c.id === t.contractTypeId);
        const won = contract ? contract.settle(t, finalPrice) : false;
        delta.trades += 1;
        if (won) {
          delta.wins += 1;
          applyBalanceDelta(t.stake * PAYOUT);
        } else {
          delta.losses += 1;
        }
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
      if (
        c.mode === "auto" &&
        c.stake >= 1 &&
        c.stake <= balanceRef.current &&
        open.current.length === 0
      ) {
        const arr = store.current[c.marketId];
        const recent = arr.slice(-100);
        const entryPrice = arr[arr.length - 1];
        let side;
        if (c.contractTypeId === "risefall") {
          side = recent[recent.length - 1] >= recent[0] ? "rise" : "fall";
        } else if (c.contractTypeId === "overunder") {
          const overs = recent.filter((p) => lastDigit(p) > 5).length;
          side = overs >= recent.length / 2 ? "over" : "under";
        } else {
          const evens = recent.filter((p) => lastDigit(p) % 2 === 0).length;
          side = evens >= recent.length / 2 ? "even" : "odd";
        }
        open.current.push({
          id: ++idRef.current,
          marketId: c.marketId,
          contractTypeId: c.contractTypeId,
          side,
          stake: c.stake,
          left: c.ticks,
          entryPrice,
        });
        applyBalanceDelta(-c.stake);
      }

      rerender();
    }, TICK_MS);

    return () => clearInterval(timer);
  }, []);

  // ---------- Derived data ----------
  const market = MARKETS.find((m) => m.id === marketId);
  const contract = CONTRACT_TYPES.find((c) => c.id === contractTypeId);
  const history = store.current[marketId];
  const visible = history.slice(-VISIBLE);
  const last = visible[visible.length - 1];
  const change = ((last - visible[0]) / visible[0]) * 100;

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
  const yLabels = Array.from({ length: 7 }, (_, k) => ({
    pct: (k / 6) * 100,
    value: yMax - (k * (yMax - yMin)) / 6,
  }));

  const payout = stake * PAYOUT;
  const canTrade =
    !balanceLoading && mode === "manual" && stake >= 1 && stake <= balance;
  const pnl = session.pnl;

  // ---------- Actions ----------
  const place = (side) => {
    if (!canTrade) return;
    open.current.push({
      id: ++idRef.current,
      marketId,
      contractTypeId,
      side,
      stake,
      left: ticks,
      entryPrice: last,
    });
    applyBalanceDelta(-stake);
    rerender();
  };

  const bumpStake = (amount) =>
    setStakeInput(String(Math.max(1, stake + amount)));

  // ---------- Render ----------
  return (
    <div className="ds-page">
      {/* ===== Left: chart ===== */}
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
                <span>{contract.label}</span>
              </div>
              <div className="ds-pill-sub">Contract Type</div>
              <Chevron />
              <select
                aria-label="Contract type"
                value={contractTypeId}
                onChange={(e) => setContractTypeId(e.target.value)}
              >
                {CONTRACT_TYPES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
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
      </div>

      {/* ===== Right: trade panel ===== */}
      <div className="ds-panel">
        <div className="ds-balance-row">
          <span>Balance</span>
          <span className="value mono">
            {balanceLoading ? "…" : money(balance)}
          </span>
        </div>

        <div className="ds-modes">
          <button
            className={`btn ${mode === "auto" ? "btn-primary" : "btn-outline"} ds-mode`}
            onClick={() => setMode("auto")}
          >
            <i /> Auto
          </button>
          <button
            className={`btn ${mode === "manual" ? "btn-primary" : "btn-outline"} ds-mode`}
            onClick={() => setMode("manual")}
          >
            <i /> Manual
          </button>
        </div>

        <div className="ds-stake-row">
          <button
            className="btn btn-outline ds-step"
            onClick={() => bumpStake(-10)}
            aria-label="Decrease stake"
          >
            &minus;
          </button>
          <div className="ds-stake">
            <span className="label">Stake</span>
            <div className="value">
              <span>$</span>
              <input
                type="number"
                min="1"
                placeholder={String(DEFAULT_STAKE)}
                value={stakeInput}
                onChange={(e) => setStakeInput(e.target.value)}
                aria-label="Stake"
              />
            </div>
          </div>
          <button
            className="btn btn-outline ds-step"
            onClick={() => bumpStake(10)}
            aria-label="Increase stake"
          >
            +
          </button>
        </div>
        {!balanceLoading && stake > balance && (
          <p className="ds-insufficient">Insufficient balance</p>
        )}
        {balanceError && <p className="ds-insufficient">{balanceError}</p>}

        <div className="ds-ticks">
          <div className="ds-ticks-head">
            <span>Ticks</span>
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
          {contract.options.map((opt, i) => (
            <button
              key={opt.key}
              className={`btn ds-trade ${i === 0 ? "option-a" : "option-b"}`}
              disabled={!canTrade}
              onClick={() => place(opt.key)}
            >
              <span className="name">{opt.label}</span>
              <span className="pay">{money(payout)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
