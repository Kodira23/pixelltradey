import { useState, useEffect, useMemo } from "react";
import { useBots } from "../context/BotsContext";

const BOT_META = {
  btc_accumulation: {
    label: "Bitcoin Accumulation",
    symbol: "BTCUSDT",
    base: "BTC",
    icon: "₿",
    cadence: "Weekly • DCA",
    description: "Dollar-cost averaging into Bitcoin on a weekly basis.",
    risk: "Low",
  },
  eth_dca_pro: {
    label: "ETH DCA Pro",
    symbol: "ETHUSDT",
    base: "ETH",
    icon: "Ξ",
    cadence: "Daily • DCA",
    description: "Dynamic DCA based on RSI and volume indicators.",
    risk: "Medium",
  },
};

const RISK_CLASS = { Low: "risk-low", Medium: "risk-medium", High: "risk-high" };
const MIN_CONFIGURE_BALANCE = 5;
const MIN_AMOUNT = 50;
const LOG_LINES_SHOWN = 8;
const COMMENT_INTERVAL_MS = 3000;
const COMMENT_COLOR = "#3b82f6";
const BASE_PRICES = { BTC: 97500, ETH: 3400 };

function fmtUsd(n) {
  const v = Number(n) || 0;
  const sign = v > 0 ? "+" : v < 0 ? "-" : "+";
  return `${sign}$${Math.abs(v).toFixed(2)}`;
}

function fmtTradeUsd(v) {
  return v >= 0 ? `+$${v.toFixed(2)}` : `$-${Math.abs(v).toFixed(2)}`;
}

function fmtPercent(p) {
  return p >= 0 ? `+${p.toFixed(2)}%` : `-${Math.abs(p).toFixed(2)}%`;
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

// Win rate as a whole percent, or null when there are no closed trades yet
function calcWinRate(wins, losses) {
  const total = (wins || 0) + (losses || 0);
  return total > 0 ? Math.round((wins / total) * 100) : null;
}

// How much the user put into a bot. Reads the first field that exists on the
// bot record, so adjust this if your context stores it under another name.
function getAllocation(bot) {
  if (!bot) return 0;
  return (
    Number(bot.amount ?? bot.amount_usdt ?? bot.allocation ?? bot.buy_amount ?? 0) || 0
  );
}

// Blue "bot is thinking" lines shown in the activity log while a bot runs
function randomComment(base, price) {
  const p = price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const templates = [
    `Buy ${base} @ $${p}`,
    `Sell ${base} @ $${p}`,
    `Scanning ${base}/USDT order book`,
    `RSI signal confirmed on ${base}`,
    `Rebalancing ${base} allocation`,
    `Volume spike detected on ${base}`,
    `Executing DCA order for ${base}`,
    `Market trend: ${base} consolidating`,
    `Spread tightening on ${base}/USDT`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// ---------- Bot picker: choose which bot to configure ----------
function BotPicker({ bots, onSelect, onClose }) {
  return (
    <div className="panel" style={{ marginBottom: 24 }}>
      <div className="panel-header-row">
        <h3>Choose a Bot</h3>
        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
      <div className="bot-grid">
        {Object.entries(BOT_META).map(([botType, meta]) => {
          const alreadyExists = !!bots[botType];
          return (
            <button
              key={botType}
              type="button"
              className="bot-card"
              style={{
                textAlign: "left",
                cursor: alreadyExists ? "not-allowed" : "pointer",
                opacity: alreadyExists ? 0.5 : 1,
              }}
              disabled={alreadyExists}
              onClick={() => onSelect(botType)}
            >
              <div className="bot-head">
                <h3>
                  {meta.icon} {meta.label}
                </h3>
                {alreadyExists && <span className="status-pill off">already configured</span>}
              </div>
              <div className="bot-symbol">{meta.cadence}</div>
              <p className="bot-card-desc">{meta.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Config form ----------
function CreateBotForm({ meta, balance, onCreate, onCancel }) {
  const [amount, setAmount] = useState(100);

  const numAmount = Number(amount);
  const tooLow = !numAmount || numAmount < MIN_AMOUNT;
  const tooHigh = numAmount > Number(balance || 0);
  const invalid = tooLow || tooHigh;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (invalid) return;
    onCreate(numAmount);
  };

  return (
    <form className="bot-card" onSubmit={handleSubmit}>
      <div className="bot-head">
        <h3>{meta.icon} {meta.label}</h3>
        <span className="status-pill off">not active</span>
      </div>
      <div className="bot-symbol">{meta.symbol}</div>

      <div className="field">
        <label>Allocation size (USDT)</label>
        <input
          type="number"
          min={MIN_AMOUNT}
          max={Number(balance || 0)}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
        <p className="bot-min-balance-note" style={{ textAlign: "left", marginTop: 6 }}>
          Min amount: ${MIN_AMOUNT} &middot; Available balance: ${Number(balance || 0).toFixed(2)}
        </p>
        {tooHigh && (
          <p className="error-text" style={{ marginTop: 6 }}>
            Allocation exceeds your available balance.
          </p>
        )}
      </div>

      <div className="bot-card-buttons">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          style={{ flex: 1, justifyContent: "center" }}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: "center" }}
          disabled={invalid}
        >
          Save Configuration
        </button>
      </div>
    </form>
  );
}

// ---------- Activity log: real trades + blue bot commentary ----------
function ActivityLog({ trades, active, base }) {
  const [comments, setComments] = useState([]);

  // While the bot is running, add a blue commentary line every few seconds
  useEffect(() => {
    if (!active) return;
    let price = BASE_PRICES[base] || 100;
    const iv = setInterval(() => {
      price = price * (1 + (Math.random() - 0.5) * 0.004);
      setComments((prev) =>
        [
          { id: `c-${Date.now()}`, ts: Date.now(), msg: randomComment(base, price) },
          ...prev,
        ].slice(0, LOG_LINES_SHOWN)
      );
    }, COMMENT_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [active, base]);

  // Merge real trades and commentary, newest first
  const lines = useMemo(() => {
    const tradeLines = (trades || []).slice(0, LOG_LINES_SHOWN).map((t) => ({
      kind: "trade",
      id: `t-${t.id}`,
      ts: new Date(t.when).getTime(),
      trade: t,
    }));
    const commentLines = comments.map((c) => ({ kind: "comment", ...c }));
    return [...tradeLines, ...commentLines]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, LOG_LINES_SHOWN);
  }, [trades, comments]);

  return (
    <div className="activity-log">
      <div className="activity-log-title">Activity Log</div>
      {lines.length === 0 ? (
        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 13 }}>
          {active
            ? "Bot is running — activity will appear here."
            : "No trades yet — start the bot to see activity."}
        </p>
      ) : (
        lines.map((line) =>
          line.kind === "comment" ? (
            <div className="activity-log-row" key={line.id}>
              <span className="activity-log-time mono">{fmtTime(line.ts)}</span>
              <span className="activity-log-label" style={{ color: COMMENT_COLOR }}>
                {line.msg}
              </span>
            </div>
          ) : (
            <div className="activity-log-row" key={line.id}>
              <span className="activity-log-time mono">{fmtTime(line.trade.when)}</span>
              <span className={`activity-log-arrow ${line.trade.isWin ? "up" : "down"}`}>
                {line.trade.isWin ? "↑" : "↓"}
              </span>
              <span className="activity-log-label">Trade</span>
              <span className={`activity-log-amount mono ${line.trade.isWin ? "up" : "down"}`}>
                {fmtTradeUsd(line.trade.usdt)}
              </span>
              <span className={`activity-log-percent mono ${line.trade.isWin ? "up" : "down"}`}>
                ({fmtPercent(line.trade.percent)})
              </span>
            </div>
          )
        )
      )}
    </div>
  );
}

// ---------- Bot Card ----------
function BotCard({
  botType,
  bot,
  balance,
  error,
  configuring,
  onConfigureStart,
  onConfigureCancel,
  onCreated,
  onStart,
  onStop,
  onRemove,
}) {
  const meta = BOT_META[botType];

  if (!bot && configuring) {
    return (
      <CreateBotForm
        meta={meta}
        balance={balance}
        onCreate={(amount) => {
          onCreated(botType, amount);
          onConfigureCancel();
        }}
        onCancel={onConfigureCancel}
      />
    );
  }

  const isActive = !!bot?.active;
  const badgeText = !bot ? "Not Configured" : isActive ? "active" : "Not Started";
  const badgeClass = !bot ? "off" : isActive ? "on" : "off";
  const meetsMinBalance = Number(balance) >= MIN_CONFIGURE_BALANCE;
  const canConfigure = !!bot || meetsMinBalance;

  const pnl = bot?.pnl_usdt ?? 0;
  const wins = bot?.wins ?? 0;
  const losses = bot?.losses ?? 0;
  const trades = bot?.trades ?? [];
  const winRate = calcWinRate(wins, losses);
  const allocation = getAllocation(bot);

  return (
    <div className="bot-card">
      <div className="bot-head">
        <h3>{meta.label}</h3>
        <span className={`status-pill ${badgeClass}`}>{badgeText}</span>
      </div>
      <div className="bot-symbol">{meta.cadence}</div>
      <p className="bot-card-desc">{meta.description}</p>

      <div className="bot-stats-row">
        <div className="bot-stat-col">
          <div className="bot-stat-label">Risk</div>
          <div className={`bot-stat-value ${RISK_CLASS[meta.risk] || ""}`}>{meta.risk}</div>
        </div>
        <div className="bot-stat-col">
          <div className="bot-stat-label">P&amp;L</div>
          <div className={`bot-stat-value mono ${pnl >= 0 ? "up" : "down"}`}>{fmtUsd(pnl)}</div>
        </div>
        <div className="bot-stat-col">
          <div className="bot-stat-label">Wins</div>
          <div className="bot-stat-value mono up">{wins}</div>
        </div>
        <div className="bot-stat-col">
          <div className="bot-stat-label">Losses</div>
          <div className="bot-stat-value mono down">{losses}</div>
        </div>
      </div>

      <div className="bot-stats-row">
        <div className="bot-stat-col">
          <div className="bot-stat-label">Win Rate</div>
          <div className="bot-stat-value mono">{winRate !== null ? `${winRate}%` : "—"}</div>
        </div>
        <div className="bot-stat-col">
          <div className="bot-stat-label">Allocated</div>
          <div className="bot-stat-value mono">{bot ? `$${allocation.toFixed(2)}` : "—"}</div>
        </div>
      </div>

      {error && (
        <p className="error-text" style={{ marginTop: 0 }}>
          {error}
        </p>
      )}

      {!bot ? (
        <>
          <div className="bot-card-buttons">
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: "center" }}
              disabled={!canConfigure}
              onClick={onConfigureStart}
            >
              Configure
            </button>
            <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} disabled>
              Start Bot
            </button>
          </div>
          {!canConfigure && (
            <p className="bot-min-balance-note">
              Requires a balance of at least ${MIN_CONFIGURE_BALANCE} to configure.
            </p>
          )}
        </>
      ) : !isActive ? (
        <div className="bot-card-buttons">
          <button
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => onStart(botType)}
          >
            Start Bot
          </button>
          <button
            className="btn btn-outline"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => onRemove(botType)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="bot-card-buttons">
          <button
            className="btn btn-outline"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => onStop(botType)}
          >
            Stop
          </button>
          <button
            className="btn btn-ghost"
            style={{ color: "var(--loss)" }}
            onClick={() => onRemove(botType)}
          >
            Delete
          </button>
        </div>
      )}

      {/* Activity log shows automatically once a bot exists */}
      {bot && <ActivityLog trades={trades} active={isActive} base={meta.base} />}
    </div>
  );
}

export default function Bots() {
  const { balance, balanceLoading, balanceError, bots, botErrors, createBot, startBot, stopBot, removeBot } =
    useBots();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [configuringType, setConfiguringType] = useState(null);

  const totalBots = Object.keys(BOT_META).length;
  const meetsMinBalance = Number(balance) >= MIN_CONFIGURE_BALANCE;
  const statusLabel = meetsMinBalance ? "Ready" : "Locked";

  // Totals across every configured bot
  const totals = useMemo(() => {
    const all = Object.values(bots || {}).filter(Boolean);
    const pnl = all.reduce((s, b) => s + (b.pnl_usdt || 0), 0);
    const wins = all.reduce((s, b) => s + (b.wins || 0), 0);
    const losses = all.reduce((s, b) => s + (b.losses || 0), 0);
    const allocated = all.reduce((s, b) => s + getAllocation(b), 0);
    return { pnl, trades: wins + losses, winRate: calcWinRate(wins, losses), allocated };
  }, [bots]);

  const handlePickBot = (botType) => {
    setConfiguringType(botType);
    setPickerOpen(false);
  };

  return (
    <>
      <div className="bots-hero">
        <div className="bots-hero-content">
          <h2>Automated Trading</h2>
          <p>Create and manage algorithmic trading strategies</p>
          <div className="bots-hero-stats">
            <div className="bots-hero-stat">
              <div className="bots-hero-stat-value mono">{totalBots}</div>
              <div className="bots-hero-stat-label">Total Bots</div>
            </div>
            <div className="bots-hero-stat">
              <div className="bots-hero-stat-value mono">
                {balanceLoading ? "…" : `$${Number(balance).toFixed(2)}`}
              </div>
              <div className="bots-hero-stat-label">Available Balance</div>
            </div>
            <div className="bots-hero-stat">
              <div className={`bots-hero-stat-value mono ${totals.pnl >= 0 ? "up" : "down"}`}>
                {fmtUsd(totals.pnl)}
              </div>
              <div className="bots-hero-stat-label">P&amp;L</div>
            </div>
            <div className="bots-hero-stat">
              <div className="bots-hero-stat-value mono">
                {totals.winRate !== null ? `${totals.winRate}%` : "—"}
              </div>
              <div className="bots-hero-stat-label">Win Rate</div>
            </div>
            <div className="bots-hero-stat">
              <div className="bots-hero-stat-value mono">{totals.trades}</div>
              <div className="bots-hero-stat-label">Trades</div>
            </div>
            <div className="bots-hero-stat">
              <div className="bots-hero-stat-value mono">${totals.allocated.toFixed(0)}</div>
              <div className="bots-hero-stat-label">Allocated</div>
            </div>
            <div className="bots-hero-stat">
              <div className={`bots-hero-stat-value mono ${meetsMinBalance ? "up" : "down"}`}>
                {statusLabel}
              </div>
              <div className="bots-hero-stat-label">Bot Status</div>
            </div>
          </div>
        </div>
      </div>

      {balanceError && <p className="error-text">{balanceError}</p>}

      <div className="dca-section-header">
        <div>
          <h3>Dollar-Cost Averaging Bots</h3>
          <p>Regular purchases of assets regardless of price</p>
        </div>
        <button className="btn btn-primary" onClick={() => setPickerOpen(true)}>
          Create New Bot
        </button>
      </div>

      {pickerOpen && (
        <BotPicker bots={bots} onSelect={handlePickBot} onClose={() => setPickerOpen(false)} />
      )}

      <div className="bot-grid">
        <BotCard
          botType="btc_accumulation"
          bot={bots.btc_accumulation}
          balance={balance}
          error={botErrors.btc_accumulation}
          configuring={configuringType === "btc_accumulation"}
          onConfigureStart={() => setConfiguringType("btc_accumulation")}
          onConfigureCancel={() => setConfiguringType(null)}
          onCreated={createBot}
          onStart={startBot}
          onStop={stopBot}
          onRemove={removeBot}
        />
        <BotCard
          botType="eth_dca_pro"
          bot={bots.eth_dca_pro}
          balance={balance}
          error={botErrors.eth_dca_pro}
          configuring={configuringType === "eth_dca_pro"}
          onConfigureStart={() => setConfiguringType("eth_dca_pro")}
          onConfigureCancel={() => setConfiguringType(null)}
          onCreated={createBot}
          onStart={startBot}
          onStop={stopBot}
          onRemove={removeBot}
        />
      </div>

      <p className="bot-min-balance-note" style={{ marginTop: 16 }}>
        Automated bots trade based on your configuration and market conditions. Past performance
        does not guarantee future results. Only allocate funds you can afford to have at risk.
      </p>
    </>
  );
}
