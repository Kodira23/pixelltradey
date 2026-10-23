import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

/* ------------------------------------------------------------------
   EDIT THIS: put your real receiving addresses here.
------------------------------------------------------------------- */
const ASSETS = [
  { id: "USDT", name: "Tether", network: "TRC20", address: "YOUR_USDT_TRC20_ADDRESS", min: 10 },
  { id: "BTC", name: "Bitcoin", network: "Bitcoin", address: "YOUR_BTC_ADDRESS", min: 10 },
  { id: "ETH", name: "Ethereum", network: "ERC20", address: "YOUR_ETH_ADDRESS", min: 10 },
];

const css = `
.dep {
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
.dep *, .dep *::before, .dep *::after { box-sizing: border-box; }
.dep h1 { margin: 0 0 6px; font-size: 26px; font-weight: 700; color: var(--strong); }
.dep__sub { margin: 0 0 24px; font-size: 14px; }
.dep__grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; align-items: start; }
.dep__card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.dep__card h2 { margin: 0 0 14px; font-size: 15px; font-weight: 600; color: var(--strong); }
.dep__label { display: block; margin: 16px 0 8px; font-size: 12px; font-weight: 500; }
.dep__label:first-of-type { margin-top: 0; }
.dep__assets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.dep__asset {
  padding: 10px 12px; text-align: left; font-family: inherit;
  background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
  color: var(--text); cursor: pointer; transition: border-color .15s, color .15s;
}
.dep__asset strong { display: block; font-size: 14px; color: var(--strong); }
.dep__asset span { font-size: 11px; }
.dep__asset:hover { border-color: #2f3a5c; }
.dep__asset.is-on { border-color: var(--blue-border); background: var(--blue-bg); }
.dep__asset.is-on strong { color: var(--blue); }
.dep__addr {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
}
.dep__addr code {
  flex: 1; min-width: 0; overflow-wrap: anywhere; font-size: 13px; color: var(--strong);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.dep__btn {
  height: 36px; padding: 0 14px; border-radius: 8px; font-family: inherit;
  font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid var(--border);
  background: var(--surface); color: var(--strong); transition: border-color .15s, opacity .15s;
}
.dep__btn:hover { border-color: #2f3a5c; }
.dep__btn--primary { width: 100%; height: 42px; margin-top: 18px; background: var(--blue); border-color: var(--blue); color: #fff; }
.dep__btn--primary:hover { opacity: .9; border-color: var(--blue); }
.dep__btn:disabled { opacity: .5; cursor: not-allowed; }
.dep__input {
  width: 100%; height: 42px; padding: 0 14px; font-family: inherit; font-size: 14px;
  background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
  color: var(--strong); outline: none; transition: border-color .15s;
}
.dep__input:focus { border-color: var(--blue-border); }
.dep__input::placeholder { color: var(--text); }
.dep__note { margin: 14px 0 0; padding: 10px 12px; font-size: 12px; line-height: 1.5; border-radius: 8px; background: var(--blue-bg); border: 1px solid var(--blue-border); }
.dep__msg { margin-top: 14px; padding: 10px 12px; font-size: 13px; border-radius: 8px; border: 1px solid; }
.dep__msg--ok { color: var(--green); border-color: color-mix(in srgb, var(--green) 35%, transparent); background: color-mix(in srgb, var(--green) 10%, transparent); }
.dep__msg--err { color: var(--red); border-color: color-mix(in srgb, var(--red) 35%, transparent); background: color-mix(in srgb, var(--red) 10%, transparent); }
.dep__hist { margin-top: 20px; }
.dep__row {
  display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: center;
  padding: 12px 0; border-top: 1px solid var(--border); font-size: 13px;
}
.dep__row:first-of-type { border-top: 0; }
.dep__row b { display: block; color: var(--strong); font-weight: 600; }
.dep__row small { font-size: 11px; }
.dep__amt { color: var(--strong); font-weight: 600; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.dep__pill { padding: 3px 10px; font-size: 11px; font-weight: 600; border-radius: 999px; text-transform: capitalize; }
.dep__pill--pending { color: var(--amber); background: color-mix(in srgb, var(--amber) 14%, transparent); }
.dep__pill--confirmed, .dep__pill--approved, .dep__pill--completed { color: var(--green); background: color-mix(in srgb, var(--green) 14%, transparent); }
.dep__pill--rejected, .dep__pill--failed { color: var(--red); background: color-mix(in srgb, var(--red) 14%, transparent); }
.dep__empty { padding: 20px 0 6px; font-size: 13px; text-align: center; }
@media (max-width: 860px) {
  .dep { padding: 76px 14px 32px; }
  .dep__grid { grid-template-columns: 1fr; }
}
@media (max-width: 420px) {
  .dep__assets { grid-template-columns: 1fr; }
  .dep__row { grid-template-columns: 1fr auto; }
  .dep__row .dep__pill { grid-column: 2; grid-row: 1; }
  .dep__row .dep__amt { grid-column: 1; }
}
`;

function fmtDate(d) {
  return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function Deposit() {
  const [asset, setAsset] = useState(ASSETS[0]);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setHistory(data || []);
    } catch (e) {
      console.error("Failed to load deposits:", e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(asset.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setMsg({ type: "err", text: "Could not copy. Select the address and copy it manually." });
    }
  }

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    const value = Number(amount);
    if (!value || value < asset.min) {
      setMsg({ type: "err", text: `The minimum deposit is $${asset.min}.` });
      return;
    }
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You need to be signed in.");
      const { error } = await supabase.from("deposits").insert({
        user_id: user.id,
        asset: asset.id,
        network: asset.network,
        amount: value,
        tx_hash: txHash.trim() || null,
        status: "pending",
      });
      if (error) throw error;
      setAmount("");
      setTxHash("");
      setMsg({ type: "ok", text: "Deposit submitted. It will be credited once it is confirmed." });
      loadHistory();
    } catch (err) {
      setMsg({ type: "err", text: err.message || "Could not submit the deposit." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="dep">
        <h1>Deposit</h1>
        <p className="dep__sub">Send crypto to the address below, then tell us what you sent.</p>

        <div className="dep__grid">
          <div className="dep__card">
            <h2>1. Send funds</h2>
            <span className="dep__label">Asset</span>
            <div className="dep__assets">
              {ASSETS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`dep__asset ${a.id === asset.id ? "is-on" : ""}`}
                  onClick={() => setAsset(a)}
                >
                  <strong>{a.id}</strong>
                  <span>{a.network}</span>
                </button>
              ))}
            </div>

            <span className="dep__label">
              {asset.name} deposit address ({asset.network})
            </span>
            <div className="dep__addr">
              <code>{asset.address}</code>
              <button type="button" className="dep__btn" onClick={copyAddress}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <p className="dep__note">
              Only send {asset.id} on the {asset.network} network to this address. Funds sent on
              another network can't be recovered.
            </p>
          </div>

          <form className="dep__card" onSubmit={submit}>
            <h2>2. Confirm your deposit</h2>
            <label className="dep__label" htmlFor="dep-amount">
              Amount sent (USD value)
            </label>
            <input
              id="dep-amount"
              className="dep__input"
              type="number"
              inputMode="decimal"
              min={asset.min}
              step="any"
              placeholder={`Minimum $${asset.min}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <label className="dep__label" htmlFor="dep-hash">
              Transaction hash (optional)
            </label>
            <input
              id="dep-hash"
              className="dep__input"
              type="text"
              placeholder="Paste the transaction ID"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
            />

            <button className="dep__btn dep__btn--primary" type="submit" disabled={busy}>
              {busy ? "Submitting..." : "I've sent the funds"}
            </button>
            {msg && <div className={`dep__msg dep__msg--${msg.type}`}>{msg.text}</div>}
          </form>
        </div>

        <div className="dep__card dep__hist">
          <h2>Deposit history</h2>
          {loading ? (
            <div className="dep__empty">Loading...</div>
          ) : history.length === 0 ? (
            <div className="dep__empty">No deposits yet. Your deposits will show up here.</div>
          ) : (
            history.map((d) => (
              <div className="dep__row" key={d.id}>
                <div>
                  <b>
                    {d.asset} {d.network ? `· ${d.network}` : ""}
                  </b>
                  <small>{fmtDate(d.created_at)}</small>
                </div>
                <span className="dep__amt">${Number(d.amount).toFixed(2)}</span>
                <span className={`dep__pill dep__pill--${d.status}`}>{d.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
