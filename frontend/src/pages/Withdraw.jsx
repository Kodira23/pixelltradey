import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const ASSETS = [
  { id: "USDT", network: "TRC20", min: 20, fee: 1 },
  { id: "BTC", network: "Bitcoin", min: 50, fee: 5 },
  { id: "ETH", network: "ERC20", min: 30, fee: 3 },
];

const css = `
.wd {
  --bg: #0a0e1a;
  --surface: #121a2e;
  --border: #1f2842;
  --text: #8a93b3;
  --strong: #f2f4ff;
  --blue: var(--accent, #5b6ef5);
  --blue-bg: color-mix(in srgb, var(--blue) 12%, transparent);
  --blue-border: color-mix(in srgb, var(--blue) 28%, transparent);
  --green: #1fd18b;
  --red: #ff3b4e;
  --amber: #f5b13d;
  max-width: 1040px;
  margin: 0 auto;
  padding: 88px 24px 48px;
  color: var(--text);
  box-sizing: border-box;
}
.wd *, .wd *::before, .wd *::after { box-sizing: border-box; }
.wd h1 { margin: 0 0 6px; font-size: 26px; font-weight: 700; color: var(--strong); }
.wd__sub { margin: 0 0 24px; font-size: 14px; }
.wd__grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; align-items: start; }
.wd__card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.wd__card h2 { margin: 0 0 14px; font-size: 15px; font-weight: 600; color: var(--strong); }
.wd__label { display: block; margin: 16px 0 8px; font-size: 12px; font-weight: 500; }
.wd__label:first-of-type { margin-top: 0; }
.wd__assets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.wd__asset {
  padding: 10px 12px; text-align: left; font-family: inherit;
  background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
  color: var(--text); cursor: pointer; transition: border-color .15s;
}
.wd__asset strong { display: block; font-size: 14px; color: var(--strong); }
.wd__asset span { font-size: 11px; }
.wd__asset:hover { border-color: #2f3a5c; }
.wd__asset.is-on { border-color: var(--blue-border); background: var(--blue-bg); }
.wd__asset.is-on strong { color: var(--blue); }
.wd__input {
  width: 100%; height: 42px; padding: 0 14px; font-family: inherit; font-size: 14px;
  background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
  color: var(--strong); outline: none; transition: border-color .15s;
}
.wd__input:focus { border-color: var(--blue-border); }
.wd__input::placeholder { color: var(--text); }
.wd__amount { position: relative; }
.wd__amount .wd__input { padding-right: 64px; }
.wd__max {
  position: absolute; top: 5px; right: 5px; height: 32px; padding: 0 12px;
  font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
  color: var(--blue); background: var(--blue-bg); border: 1px solid var(--blue-border); border-radius: 6px;
}
.wd__btn {
  width: 100%; height: 42px; margin-top: 18px; font-family: inherit; font-size: 14px; font-weight: 600;
  color: #fff; background: var(--blue); border: 1px solid var(--blue); border-radius: 8px;
  cursor: pointer; transition: opacity .15s;
}
.wd__btn:hover { opacity: .9; }
.wd__btn:disabled { opacity: .5; cursor: not-allowed; }
.wd__bal { font-size: 28px; font-weight: 700; color: var(--strong); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.wd__line { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; font-size: 13px; border-top: 1px solid var(--border); }
.wd__line:first-of-type { border-top: 0; }
.wd__line b { color: var(--strong); font-weight: 600; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.wd__note { margin: 14px 0 0; padding: 10px 12px; font-size: 12px; line-height: 1.5; border-radius: 8px; background: var(--blue-bg); border: 1px solid var(--blue-border); }
.wd__msg { margin-top: 14px; padding: 10px 12px; font-size: 13px; border-radius: 8px; border: 1px solid; }
.wd__msg--ok { color: var(--green); border-color: color-mix(in srgb, var(--green) 35%, transparent); background: color-mix(in srgb, var(--green) 10%, transparent); }
.wd__msg--err { color: var(--red); border-color: color-mix(in srgb, var(--red) 35%, transparent); background: color-mix(in srgb, var(--red) 10%, transparent); }
.wd__hist { margin-top: 20px; }
.wd__row { display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: center; padding: 12px 0; border-top: 1px solid var(--border); font-size: 13px; }
.wd__row:first-of-type { border-top: 0; }
.wd__row b { display: block; color: var(--strong); font-weight: 600; }
.wd__row small { font-size: 11px; overflow-wrap: anywhere; }
.wd__amt { color: var(--strong); font-weight: 600; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.wd__pill { padding: 3px 10px; font-size: 11px; font-weight: 600; border-radius: 999px; text-transform: capitalize; }
.wd__pill--pending { color: var(--amber); background: color-mix(in srgb, var(--amber) 14%, transparent); }
.wd__pill--approved, .wd__pill--completed, .wd__pill--confirmed { color: var(--green); background: color-mix(in srgb, var(--green) 14%, transparent); }
.wd__pill--rejected, .wd__pill--failed { color: var(--red); background: color-mix(in srgb, var(--red) 14%, transparent); }
.wd__empty { padding: 20px 0 6px; font-size: 13px; text-align: center; }
@media (max-width: 860px) {
  .wd { padding: 76px 14px 32px; }
  .wd__grid { grid-template-columns: 1fr; }
}
@media (max-width: 420px) {
  .wd__assets { grid-template-columns: 1fr; }
  .wd__row { grid-template-columns: 1fr auto; }
  .wd__row .wd__pill { grid-column: 2; grid-row: 1; }
  .wd__row .wd__amt { grid-column: 1; }
}
`;

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) =>
  new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function Withdraw() {
  const [asset, setAsset] = useState(ASSETS[0]);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function load() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: prof }, { data: list, error }] = await Promise.all([
        supabase.from("profiles").select("balance").eq("id", user.id).single(),
        supabase
          .from("withdrawals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      if (error) throw error;
      setBalance(Number(prof?.balance) || 0);
      setHistory(list || []);
    } catch (e) {
      console.error("Failed to load withdrawals:", e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // pending requests are held against the balance so they can't be requested twice
  const pending = history
    .filter((w) => w.status === "pending")
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);
  const available = Math.max((balance || 0) - pending, 0);
  const value = Number(amount) || 0;
  const receive = Math.max(value - asset.fee, 0);

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    if (address.trim().length < 20) {
      setMsg({ type: "err", text: "Enter a valid wallet address." });
      return;
    }
    if (value < asset.min) {
      setMsg({ type: "err", text: `The minimum withdrawal is ${money(asset.min)}.` });
      return;
    }
    if (value > available) {
      setMsg({ type: "err", text: `You can withdraw up to ${money(available)}.` });
      return;
    }
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You need to be signed in.");
      const { error } = await supabase.from("withdrawals").insert({
        user_id: user.id,
        asset: asset.id,
        network: asset.network,
        address: address.trim(),
        amount: value,
        fee: asset.fee,
        status: "pending",
      });
      if (error) throw error;
      setAmount("");
      setAddress("");
      setMsg({ type: "ok", text: "Withdrawal requested. We'll notify you when it's processed." });
      load();
    } catch (err) {
      setMsg({ type: "err", text: err.message || "Could not submit the withdrawal." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="wd">
        <h1>Withdraw</h1>
        <p className="wd__sub">Send funds from your balance to your own wallet.</p>

        <div className="wd__grid">
          <form className="wd__card" onSubmit={submit}>
            <h2>Withdrawal details</h2>
            <span className="wd__label">Asset</span>
            <div className="wd__assets">
              {ASSETS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`wd__asset ${a.id === asset.id ? "is-on" : ""}`}
                  onClick={() => setAsset(a)}
                >
                  <strong>{a.id}</strong>
                  <span>{a.network}</span>
                </button>
              ))}
            </div>

            <label className="wd__label" htmlFor="wd-address">
              Wallet address ({asset.network})
            </label>
            <input
              id="wd-address"
              className="wd__input"
              type="text"
              placeholder={`Your ${asset.id} address`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="off"
              spellCheck="false"
            />

            <label className="wd__label" htmlFor="wd-amount">
              Amount (USD)
            </label>
            <div className="wd__amount">
              <input
                id="wd-amount"
                className="wd__input"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder={`Minimum ${money(asset.min)}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                type="button"
                className="wd__max"
                onClick={() => setAmount(available ? available.toFixed(2) : "")}
              >
                Max
              </button>
            </div>

            <button className="wd__btn" type="submit" disabled={busy || loading}>
              {busy ? "Submitting..." : "Request withdrawal"}
            </button>
            {msg && <div className={`wd__msg wd__msg--${msg.type}`}>{msg.text}</div>}
          </form>

          <div className="wd__card">
            <h2>Available to withdraw</h2>
            <div className="wd__bal">{balance === null ? "…" : money(available)}</div>
            <div style={{ marginTop: 14 }}>
              <div className="wd__line">
                <span>Balance</span>
                <b>{balance === null ? "…" : money(balance)}</b>
              </div>
              <div className="wd__line">
                <span>Held in pending requests</span>
                <b>{money(pending)}</b>
              </div>
              <div className="wd__line">
                <span>Network fee</span>
                <b>{money(asset.fee)}</b>
              </div>
              <div className="wd__line">
                <span>You receive</span>
                <b>{money(receive)}</b>
              </div>
            </div>
            <p className="wd__note">
              Double-check the address and network. Withdrawals to the wrong network can't be
              reversed.
            </p>
          </div>
        </div>

        <div className="wd__card wd__hist">
          <h2>Withdrawal history</h2>
          {loading ? (
            <div className="wd__empty">Loading...</div>
          ) : history.length === 0 ? (
            <div className="wd__empty">No withdrawals yet. Your requests will show up here.</div>
          ) : (
            history.map((w) => (
              <div className="wd__row" key={w.id}>
                <div>
                  <b>
                    {w.asset} {w.network ? `· ${w.network}` : ""}
                  </b>
                  <small>
                    {fmtDate(w.created_at)}
                    {w.address ? ` · ${w.address.slice(0, 8)}…${w.address.slice(-6)}` : ""}
                  </small>
                </div>
                <span className="wd__amt">{money(w.amount)}</span>
                <span className={`wd__pill wd__pill--${w.status}`}>{w.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
