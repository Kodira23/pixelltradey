// Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import logo from "../vanlogo.png";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (data.session) {
      navigate("/dashboard");
    } else {
      setInfo("Check your email to confirm your account before logging in.");
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        /* Full-screen layer so nothing from the app layout (navbar, banners) shows above the card */
        .auth {
          --a-page: #0a0e1a;
          --a-card: #0e1424;
          --a-card-border: #1f2842;
          --a-input: #121a2e;
          --a-input-border: #262f4a;
          --a-text: #ffffff;
          --a-sub: #b3b9d1;
          --a-muted: #8a93b3;
          --a-accent: #5b6ef5;
          --a-err: #ff6b6b;
          --a-err-soft: rgba(255, 107, 107, 0.12);
          --a-ok: #35d0ba;
          --a-ok-soft: rgba(53, 208, 186, 0.12);

          position: fixed;
          inset: 0;
          z-index: 50;
          overflow-y: auto;
          display: flex;
          padding: 16px;
          background:
            radial-gradient(700px 420px at 82% 55%, rgba(91, 110, 245, 0.16), transparent 65%),
            radial-gradient(500px 360px at 20% 15%, rgba(91, 110, 245, 0.07), transparent 70%),
            var(--a-page);
          color: var(--a-text);
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
        }

        /* Back link, top-left of the page */
        .auth__back {
          position: absolute;
          top: 12px;
          left: 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          line-height: 20px;
          color: var(--a-sub);
          text-decoration: none;
          z-index: 1;
        }
        .auth__back svg { width: 16px; height: 16px; }
        .auth__back:hover { color: var(--a-text); }
        .auth__back:focus-visible { outline: 2px solid var(--a-accent); outline-offset: 3px; border-radius: 4px; }

        /* Card: same size on sign in and sign up */
        .auth__card {
          width: 100%;
          max-width: 448px;
          margin: auto;
          flex-shrink: 0;
          display: grid;
          gap: 20px;
          background: var(--a-card);
          border: 1px solid var(--a-card-border);
          border-radius: 16px;
          padding: 24px;
        }

        .auth__logo { justify-self: center; display: block; }
        .auth__logo img {
          display: block;
          height: 90px;
          width: auto;
          max-width: 100%;
          object-fit: contain;
          mix-blend-mode: lighten; /* hides the logo's black background on the dark card */
        }

        .auth__head { text-align: center; display: grid; gap: 8px; margin: 8px 0 6px; }
        .auth__head h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.03em; line-height: 1.2; color: var(--a-text); }
        .auth__head p { margin: 0; font-size: 14px; line-height: 20px; color: var(--a-sub); }

        /* Labels + inputs */
        .auth__field { display: grid; gap: 8px; }
        .auth__card label {
          display: grid;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          line-height: 20px;
          color: var(--a-text);
        }
        .auth__card input {
          width: 100%;
          height: 40px;
          box-sizing: border-box;
          padding: 0 12px;
          background: var(--a-input);
          border: 1px solid var(--a-input-border);
          border-radius: 6px;
          color: var(--a-text);
          font-size: 14px;
          font-weight: 400;
          font-family: inherit;
        }
        .auth__card input::placeholder { color: var(--a-muted); }
        .auth__card input:focus { border-color: var(--a-accent); outline: none; }

        /* Password field with show/hide toggle */
        .auth__pw { position: relative; }
        .auth__pw input { padding-right: 42px; }
        .auth__toggle {
          position: absolute;
          top: 0;
          right: 0;
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          padding: 0;
          background: none;
          border: 0;
          color: var(--a-muted);
          cursor: pointer;
        }
        .auth__toggle:hover { color: var(--a-text); }
        .auth__toggle:focus-visible { outline: 2px solid var(--a-accent); outline-offset: -2px; border-radius: 6px; }

        /* Submit */
        .auth__submit {
          background: var(--a-accent);
          color: #fff;
          font-family: inherit;
          font-weight: 500;
          font-size: 14px;
          height: 40px;
          border: 0;
          border-radius: 6px;
          margin-top: 4px;
          cursor: pointer;
        }
        .auth__submit:hover { filter: brightness(1.1); }
        .auth__submit:focus-visible { outline: 2px solid var(--a-text); outline-offset: 2px; }
        .auth__submit:disabled { opacity: 0.6; cursor: wait; }

        /* Messages */
        .auth__msg { padding: 10px 12px; border-radius: 6px; font-size: 13px; }
        .auth__msg--err { background: var(--a-err-soft); color: var(--a-err); }
        .auth__msg--ok { background: var(--a-ok-soft); color: var(--a-ok); }

        .auth__switch { text-align: center; color: var(--a-sub); font-size: 14px; margin-top: -4px; }
        .auth__switch a { color: var(--a-accent); font-weight: 500; text-decoration: none; }
        .auth__switch a:hover { text-decoration: underline; }

        /* Small screens: keep the card clear of the Back link */
        @media (max-width: 560px) {
          .auth { padding: 52px 12px 16px; }
          .auth__logo img { height: 80px; }
        }
      `}</style>

    <div className="auth">
      <Link to="/" className="auth__back">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <form className="auth__card" onSubmit={handleSubmit}>
        <Link to="/" className="auth__logo">
          <img src={logo} alt="VantyxTrade" />
        </Link>

        <div className="auth__head">
          <h1>Create an account</h1>
          <p>Start accumulating with VantyxTrade</p>
        </div>

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            autoComplete="username"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <div className="auth__field">
          <label htmlFor="password">Password</label>
          <div className="auth__pw">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="auth__toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <path d="m2 2 20 20" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && <div className="auth__msg auth__msg--err" role="alert">{error}</div>}
        {info && <div className="auth__msg auth__msg--ok">{info}</div>}

        <button className="auth__submit" disabled={loading}>
          {loading ? "Creating account…" : "Register"}
        </button>

        <div className="auth__switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
    </>
  );
}
