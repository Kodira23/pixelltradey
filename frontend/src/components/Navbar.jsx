// Navbar.jsx
import { Link } from "react-router-dom";
import logo from "../vt.png";

export default function Navbar() {
  return (
    <>
      <style>{`
        .vtx-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(10, 14, 26, 0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid #262f4a;
          padding: 18px 0;
        }
        .vtx-nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .vtx-nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .vtx-nav-logo img {
          height: 32px;
          width: auto;
          display: block;
        }
        .vtx-nav-logo-text {
          font-family: "Poppins", sans-serif;
          font-weight: 800;
          font-size: 26px;
          color: #5b6ef5;
          line-height: 1;
          white-space: nowrap;
        }
        .vtx-nav-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .vtx-nav-signin {
          font-size: 14px;
          font-weight: 600;
          color: #e7ecfb;
          text-decoration: none;
          padding: 11px 20px;
          border-radius: 8px;
          border: 1px solid #262f4a;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          transition: border-color 0.15s, color 0.15s;
        }
        .vtx-nav-signin:hover {
          border-color: #5b6ef5;
          color: #5b6ef5;
        }
        .vtx-nav-start {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          text-decoration: none;
          padding: 11px 20px;
          border-radius: 8px;
          background: #5b6ef5;
          border: 1px solid #5b6ef5;
          line-height: 1;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          transition: opacity 0.15s;
        }
        .vtx-nav-start:hover {
          opacity: 0.92;
        }

        /* Phone: slimmer bar, tighter spacing, quieter Sign-in link */
        @media (max-width: 640px) {
          .vtx-nav {
            padding: 10px 0;
            padding-top: calc(10px + env(safe-area-inset-top));
          }
          .vtx-nav-inner {
            padding: 0 16px;
            gap: 8px;
          }
          .vtx-nav-logo { gap: 8px; }
          .vtx-nav-logo img { height: 28px; }
          .vtx-nav-logo-text { font-size: 18px; }
          .vtx-nav-actions { gap: 6px; }
          .vtx-nav-signin {
            padding: 8px 12px;
            font-size: 13px;
            border-color: transparent;
          }
          .vtx-nav-start {
            padding: 9px 14px;
            font-size: 13px;
          }
        }

        /* Very narrow phones (~360px wide) */
        @media (max-width: 380px) {
          .vtx-nav-logo-text { font-size: 15px; }
          .vtx-nav-logo img { height: 24px; }
          .vtx-nav-signin,
          .vtx-nav-start {
            padding: 7px 10px;
            font-size: 12px;
          }
        }
      `}</style>

      <nav className="vtx-nav">
        <div className="vtx-nav-inner">
          <Link to="/" className="vtx-nav-logo" aria-label="VantyxTrade home">
            <img src={logo} alt="VantyxTrade" />
            <span className="vtx-nav-logo-text">VantyxTrade</span>
          </Link>

          <div className="vtx-nav-actions">
            <Link to="/login" className="vtx-nav-signin">
              Sign in
            </Link>
            <Link to="/signup" className="vtx-nav-start">
              Get started
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
