// Navbar.jsx
import { Link } from "react-router-dom";
import logo from "../vanlogo.png";

export default function Navbar() {
  return (
    <>
      <style>{`
        .vtx-nav {
          --vtx-blue: #5b6ef5;
          --vtx-blue-hover: #7384f7;
          --vtx-bar-h: 56px;
          /* logo height: width follows the image. It overflows the bar downward
             instead of making the bar taller (same approach as the landing header). */
          --vtx-logo-h: 72px;
          --vtx-logo-top: 4px;

          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: var(--vtx-bar-h);
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px 0 12px;
          background: rgba(10, 14, 26, 0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid #262f4a;
        }

        /* logo box: bar height, aligned to the top, so a taller logo overflows downward only */
        .vtx-nav-logo {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          height: var(--vtx-bar-h);
          text-decoration: none;
          flex-shrink: 0;
          overflow: visible;
        }
        .vtx-nav-logo img {
          display: block;
          height: var(--vtx-logo-h);
          width: auto;
          max-width: 100%;
          flex-shrink: 0;
          margin-top: var(--vtx-logo-top);
        }
        .vtx-nav-logo-text {
          align-self: center;
          font-family: "Poppins", sans-serif;
          font-weight: 800;
          font-size: 22px;
          color: var(--vtx-blue);
          line-height: 1;
          white-space: nowrap;
        }

        .vtx-nav-actions {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        /* Sign in: plain text link, turns blue on hover */
        .vtx-nav-signin {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          text-decoration: none;
          white-space: nowrap;
          transition: color 0.15s;
        }
        .vtx-nav-signin:hover {
          color: var(--vtx-blue);
        }

        /* Get started: solid blue button */
        .vtx-nav-start {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 9px 22px;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.2;
          color: #ffffff;
          text-decoration: none;
          white-space: nowrap;
          border-radius: 7px;
          background: var(--vtx-blue);
          border: 1px solid var(--vtx-blue);
          transition: background 0.15s, border-color 0.15s;
        }
        .vtx-nav-start:hover {
          background: var(--vtx-blue-hover);
          border-color: var(--vtx-blue-hover);
        }

        /* Tablet / phone */
        @media (max-width: 900px) {
          .vtx-nav {
            --vtx-bar-h: 54px;
            padding: 0 14px 0 6px;
          }
          .vtx-nav-actions { gap: 16px; }
        }

        /* Phone */
        @media (max-width: 600px) {
          .vtx-nav {
            --vtx-logo-h: 60px;
            --vtx-logo-top: 3px;
            padding-top: env(safe-area-inset-top);
            height: calc(var(--vtx-bar-h) + env(safe-area-inset-top));
          }
          .vtx-nav-logo { gap: 6px; }
          .vtx-nav-logo-text { font-size: 17px; }
          .vtx-nav-actions { gap: 12px; }
          .vtx-nav-signin { font-size: 13px; }
          .vtx-nav-start { padding: 8px 14px; font-size: 13px; }
        }

        /* Very narrow phones (~360px wide): hide the wordmark, keep the logo */
        @media (max-width: 380px) {
          .vtx-nav-logo-text { display: none; }
        }
      `}</style>

      <nav className="vtx-nav">
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
      </nav>
    </>
  );
}
