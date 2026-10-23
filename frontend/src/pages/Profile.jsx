import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const css = `
.pf {
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
  max-width: 1040px;
  margin: 0 auto;
  padding: 88px 24px 48px;
  color: var(--text);
  box-sizing: border-box;
}
.pf *, .pf *::before, .pf *::after { box-sizing: border-box; }
.pf h1 { margin: 0 0 24px; font-size: 26px; font-weight: 700; color: var(--strong); }
.pf__top { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
.pf__avatar {
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  width: 56px; height: 56px; border-radius: 50%; font-size: 22px; font-weight: 700;
  color: var(--blue); background: var(--blue-bg); border: 1px solid var(--blue-border);
}
.pf__who { min-width: 0; flex: 1; }
.pf__who b { display: block; font-size: 17px; color: var(--strong); overflow-wrap: anywhere; }
.pf__who span { font-size: 13px; overflow-wrap: anywhere; }
.pf__bal { text-align: right; }
.pf__bal small { display: block; font-size: 11px; }
.pf__bal b { font-size: 20px; color: var(--strong); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.pf__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
.pf__card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.pf__card h2 { margin: 0 0 14px; font-size: 15px; font-weight: 600; color: var(--strong); }
.pf__label { display: block; margin: 16px 0 8px; font-size: 12px; font-weight: 500; }
.pf__card h2 + .pf__label { margin-top: 0; }
.pf__input {
  width: 100%; height: 42px; padding: 0 14px; font-family: inherit; font-size: 14px;
  background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
  color: var(--strong); outline: none; transition: border-color .15s;
}
.pf__input:focus { border-color: var(--blue-border); }
.pf__input:disabled { opacity: .6; cursor: not-allowed; }
.pf__input::placeholder { color: var(--text); }
.pf__btn {
  width: 100%; height: 42px; margin-top: 18px; font-family: inherit; font-size: 14px; font-weight: 600;
  color: #fff; background: var(--blue); border: 1px solid var(--blue); border-radius: 8px;
  cursor: pointer; transition: opacity .15s;
}
.pf__btn:hover { opacity: .9; }
.pf__btn:disabled { opacity: .5; cursor: not-allowed; }
.pf__msg { margin-top: 14px; padding: 10px 12px; font-size: 13px; border-radius: 8px; border: 1px solid; }
.pf__msg--ok { color: var(--green); border-color: color-mix(in srgb, var(--green) 35%, transparent); background: color-mix(in srgb, var(--green) 10%, transparent); }
.pf__msg--err { color: var(--red); border-color: color-mix(in srgb, var(--red) 35%, transparent); background: color-mix(in srgb, var(--red) 10%, transparent); }
.pf__line { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; font-size: 13px; border-top: 1px solid var(--border); }
.pf__line:first-of-type { border-top: 0; }
.pf__line b { color: var(--strong); font-weight: 600; text-align: right; overflow-wrap: anywhere; }
.pf__links { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
.pf__link {
  display: inline-flex; align-items: center; height: 36px; padding: 0 14px; font-size: 13px; font-weight: 500;
  color: var(--strong); text-decoration: none; background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
  transition: border-color .15s;
}
.pf__link:hover { border-color: #2f3a5c; }
.pf__link--red { color: var(--red); font-family: inherit; cursor: pointer; }
@media (max-width: 860px) {
  .pf { padding: 76px 14px 32px; }
  .pf__grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .pf__top { flex-wrap: wrap; }
  .pf__bal { width: 100%; text-align: left; }
}
`;

const fmt = (d) =>
  d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState(null);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!u || cancelled) return;
        setUser(u);
        const { data, error } = await supabase.from("profiles").select("*").eq("id", u.id).single();
        if (error) throw error;
        if (cancelled) return;
        setProfile(data);
        setName(data?.name || u.user_metadata?.full_name || "");
        setPhone(data?.phone || "");
      } catch (e) {
        console.error("Failed to load profile:", e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveInfo(e) {
    e.preventDefault();
    if (!user) return;
    setInfoMsg(null);
    setSavingInfo(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: name.trim(), phone: phone.trim() })
        .eq("id", user.id);
      if (error) throw error;
      setInfoMsg({ type: "ok", text: "Profile saved." });
    } catch (err) {
      setInfoMsg({ type: "err", text: err.message || "Could not save your profile." });
    } finally {
      setSavingInfo(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.length < 8) {
      setPwMsg({ type: "err", text: "Use at least 8 characters." });
      return;
    }
    if (pw !== pw2) {
      setPwMsg({ type: "err", text: "The two passwords don't match." });
      return;
    }
    setSavingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      setPw("");
      setPw2("");
      setPwMsg({ type: "ok", text: "Password updated." });
    } catch (err) {
      setPwMsg({ type: "err", text: err.message || "Could not update your password." });
    } finally {
      setSavingPw(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  const shownName = name || user?.email?.split("@")[0] || "Your account";
  const balance = Number(profile?.balance) || 0;

  return (
    <>
      <style>{css}</style>
      <div className="pf">
        <h1>Profile</h1>

        <div className="pf__top">
          <div className="pf__avatar">{shownName.charAt(0).toUpperCase()}</div>
          <div className="pf__who">
            <b>{shownName}</b>
            <span>{user?.email || (loading ? "Loading..." : "")}</span>
          </div>
          <div className="pf__bal">
            <small>Balance</small>
            <b>{loading ? "…" : `$${balance.toFixed(2)}`}</b>
          </div>
        </div>

        <div className="pf__grid">
          <form className="pf__card" onSubmit={saveInfo}>
            <h2>Personal details</h2>
            <label className="pf__label" htmlFor="pf-name">Full name</label>
            <input id="pf-name" className="pf__input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <label className="pf__label" htmlFor="pf-email">Email</label>
            <input id="pf-email" className="pf__input" value={user?.email || ""} disabled readOnly />
            <label className="pf__label" htmlFor="pf-phone">Phone</label>
            <input id="pf-phone" className="pf__input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 000 000" />
            <button className="pf__btn" type="submit" disabled={savingInfo || loading}>
              {savingInfo ? "Saving..." : "Save changes"}
            </button>
            {infoMsg && <div className={`pf__msg pf__msg--${infoMsg.type}`}>{infoMsg.text}</div>}
          </form>

          <form className="pf__card" onSubmit={changePassword}>
            <h2>Change password</h2>
            <label className="pf__label" htmlFor="pf-pw">New password</label>
            <input id="pf-pw" className="pf__input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
            <label className="pf__label" htmlFor="pf-pw2">Confirm new password</label>
            <input id="pf-pw2" className="pf__input" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            <button className="pf__btn" type="submit" disabled={savingPw}>
              {savingPw ? "Updating..." : "Update password"}
            </button>
            {pwMsg && <div className={`pf__msg pf__msg--${pwMsg.type}`}>{pwMsg.text}</div>}
          </form>

          <div className="pf__card">
            <h2>Account</h2>
            <div className="pf__line"><span>Member since</span><b>{fmt(user?.created_at)}</b></div>
            <div className="pf__line"><span>Last sign in</span><b>{fmt(profile?.last_login || user?.last_sign_in_at)}</b></div>
            <div className="pf__line"><span>Email confirmed</span><b>{user?.email_confirmed_at ? "Yes" : "No"}</b></div>
          </div>

          <div className="pf__card">
            <h2>Shortcuts</h2>
            <div className="pf__links">
              <Link className="pf__link" to="/deposit">Deposit</Link>
              <Link className="pf__link" to="/withdraw">Withdraw</Link>
              <Link className="pf__link" to="/notifications">Notifications</Link>
              <Link className="pf__link" to="/verify">Verify identity</Link>
              <button className="pf__link pf__link--red" type="button" onClick={signOut}>Sign out</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
