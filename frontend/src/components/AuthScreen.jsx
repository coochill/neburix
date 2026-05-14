import { useState } from "react";
import { login, mapAuthError, register } from "../lib/auth";
import logo from "../assets/logo.png";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, username);
      }
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0faf5;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          overflow: hidden;
          padding: 24px 16px;
        }

        /* Animated background blobs */
        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.45;
          pointer-events: none;
          animation: blobFloat 8s ease-in-out infinite;
        }
        .auth-blob-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, #4dd9ac 0%, #19c2e6 100%);
          top: -160px; left: -120px;
          animation-delay: 0s;
        }
        .auth-blob-2 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, #56e89a 0%, #17d1c4 100%);
          bottom: -100px; right: -80px;
          animation-delay: -3s;
        }
        .auth-blob-3 {
          width: 260px; height: 260px;
          background: radial-gradient(circle, #a3f0d0 0%, #38c7df 100%);
          top: 45%; left: 60%;
          animation-delay: -5s;
        }

        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -25px) scale(1.04); }
          66% { transform: translate(-15px, 18px) scale(0.97); }
        }

        /* Wave decoration */
        .auth-wave {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 120px;
          background: linear-gradient(180deg, transparent 0%, rgba(29, 195, 175, 0.12) 100%);
          clip-path: ellipse(60% 100% at 50% 100%);
          pointer-events: none;
        }

        /* Card */
        .auth-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1.5px solid rgba(255,255,255,0.9);
          border-radius: 28px;
          padding: 36px 36px 32px;
          box-shadow:
            0 8px 40px rgba(29,195,175,0.13),
            0 2px 8px rgba(0,0,0,0.06),
            inset 0 1px 0 rgba(255,255,255,0.95);
        }

        /* Logo area */
        .auth-logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
          .auth-logo-icon {
            width: 64px; height: 64px;
            border-radius: 18px;
            padding: 0;  /* remove any implicit padding */
            overflow: hidden;
          }
       
        .auth-logo-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;  /* fills the box completely */
        }
        .auth-logo-text {
          display: flex; flex-direction: column; gap: 1px;
        }
        .auth-logo-name {
          font-family: 'Outfit', sans-serif;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 0.04em;
          background: linear-gradient(90deg, #0ea5a0 0%, #0ea5c9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
        }
        .auth-logo-tagline {
          font-size: 10.5px;
          font-weight: 500;
          color: #64b5b0;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* Heading */
        .auth-heading {
          font-family: 'Outfit', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #0d3d3b;
          margin: 0 0 4px;
          line-height: 1.2;
        }
        .auth-subheading {
          font-size: 13px;
          color: #6b9e9b;
          margin: 0 0 26px;
          line-height: 1.5;
        }

        /* Mode tabs */
        .auth-tabs {
          display: flex;
          background: rgba(29,195,175,0.08);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
          gap: 4px;
        }
        .auth-tab {
          flex: 1;
          padding: 9px 0;
          border: none;
          border-radius: 9px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          background: transparent;
          color: #6b9e9b;
        }
        .auth-tab.active {
          background: #1aacaa;
          color: #fff;
          box-shadow: 0 3px 12px rgba(26,172,170,0.3);
        }
        .auth-tab:not(.active):hover {
          background: rgba(29,195,175,0.12);
          color: #0ea5a0;
        }

        /* Form */
        .auth-form { display: flex; flex-direction: column; gap: 16px; }

        .auth-field { display: flex; flex-direction: column; gap: 5px; }

        .auth-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #4a8e8a;
        }

        .auth-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .auth-input-icon {
          position: absolute;
          left: 13px;
          color: #9ecfcc;
          width: 16px; height: 16px;
          transition: color 0.2s;
          pointer-events: none;
          flex-shrink: 0;
        }
        .auth-input-wrap.focused .auth-input-icon {
          color: #1dc3af;
        }

        .auth-input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 14px 11px 38px;
          border: 1.5px solid rgba(29,195,175,0.22);
          border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px;
          color: #0d3d3b;
          background: rgba(255,255,255,0.7);
          outline: none;
          transition: all 0.22s ease;
        }
        .auth-input::placeholder { color: #aad0ce; }
        .auth-input:focus {
          border-color: #1dc3af;
          background: #fff;
          box-shadow: 0 0 0 3.5px rgba(29,195,175,0.14);
        }

        /* Error */
        .auth-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: rgba(255, 80, 80, 0.06);
          border: 1.5px solid rgba(255, 80, 80, 0.18);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 12px;
          color: #c0392b;
          line-height: 1.45;
        }
        .auth-error svg { flex-shrink: 0; margin-top: 1px; }

        /* Submit button */
        .auth-btn {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 13px;
          background: #1aacaa;
          background-size: unset;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 18px rgba(26,172,170,0.38);
          position: relative;
          overflow: hidden;
          margin-top: 4px;
        }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-1.5px);
          background: #179897;
          box-shadow: 0 7px 24px rgba(26,172,170,0.45);
          background-position: right center;
        }
        .auth-btn:active:not(:disabled) {
          transform: translateY(0);
          background: rgba(26,172,170,0.12);
          color: #1aacaa;
          box-shadow: 0 3px 12px rgba(29,195,175,0.3);
        }
        .auth-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .auth-btn-loader {
          display: inline-flex; gap: 4px; align-items: center; justify-content: center;
        }
        .auth-btn-dot {
          width: 6px; height: 6px;
          background: rgba(255,255,255,0.85);
          border-radius: 50%;
          animation: dotBounce 1.2s infinite ease-in-out;
        }
        .auth-btn-dot:nth-child(2) { animation-delay: 0.18s; }
        .auth-btn-dot:nth-child(3) { animation-delay: 0.36s; }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1.1); opacity: 1; }
        }

        /* Divider */
        .auth-divider {
          display: flex; align-items: center; gap: 10px;
          margin: 4px 0 0;
        }
        .auth-divider-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(29,195,175,0.2), transparent);
        }
        .auth-divider-text {
          font-size: 11px;
          color: #9ecfcc;
          font-weight: 500;
        }

        /* Footer note */
        .auth-footer-note {
          font-size: 11px;
          color: #9ecfcc;
          text-align: center;
          margin-top: 18px;
          line-height: 1.5;
        }
        .auth-footer-note span {
          color: #0ea5a0;
          font-weight: 600;
        }

        /* Leaf accent top-right */
        .auth-leaf-accent {
          position: absolute;
          top: -18px; right: 22px;
          font-size: 32px;
          opacity: 0.22;
          pointer-events: none;
          transform: rotate(20deg);
        }
      `}</style>

      <div className="auth-root">
        {/* Background blobs */}
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
        <div className="auth-wave" />

        <div className="auth-card">
          <div className="auth-leaf-accent">🌿</div>

          {/* Logo */}
          <div className="auth-logo-wrap">
            <div className="auth-logo-icon">
              <img src={logo} alt="Neburix logo" />
            </div>
            <div className="auth-logo-text">
              <span className="auth-logo-name">NEBURIX</span>
              <span className="auth-logo-tagline">Secure Health Access</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="auth-heading">
            {mode === "login" ? "Welcome back" : "Join Neburix"}
          </h1>
          <p className="auth-subheading">
            {mode === "login"
              ? "Sign in to your secure health dashboard."
              : "Create your account to get started."}
          </p>

          {/* Mode tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => { setError(""); setMode("login"); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => { setError(""); setMode("register"); }}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="auth-form">
            {mode === "register" && (
              <div className="auth-field">
                <label className="auth-label">Username</label>
                <div className={`auth-input-wrap ${focused === "username" ? "focused" : ""}`}>
                  <svg className="auth-input-icon" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2.5 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocused("username")}
                    onBlur={() => setFocused("")}
                    placeholder="e.g. nebuser25"
                    className="auth-input"
                    minLength={2}
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <div className={`auth-input-wrap ${focused === "email" ? "focused" : ""}`}>
                <svg className="auth-input-icon" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="3.5" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M1.5 6l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  placeholder="name@example.com"
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className={`auth-input-wrap ${focused === "password" ? "focused" : ""}`}>
                <svg className="auth-input-icon" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="10.5" r="1" fill="currentColor"/>
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  placeholder="Minimum 6 characters"
                  className="auth-input"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#c0392b" strokeWidth="1.5"/>
                  <path d="M7 4v3.5" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="7" cy="10" r="0.75" fill="#c0392b"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={busy} className="auth-btn">
              {busy ? (
                <span className="auth-btn-loader">
                  <span className="auth-btn-dot" />
                  <span className="auth-btn-dot" />
                  <span className="auth-btn-dot" />
                </span>
              ) : (
                mode === "login" ? "Sign In →" : "Create Account →"
              )}
            </button>
          </form>

          <p className="auth-footer-note">
            {mode === "login"
              ? <>Don't have an account? <span style={{cursor:"pointer"}} onClick={() => { setError(""); setMode("register"); }}>Register here</span></>
              : <>Already have an account? <span style={{cursor:"pointer"}} onClick={() => { setError(""); setMode("login"); }}>Sign in</span></>
            }
          </p>
        </div>
      </div>
    </>
  );
}
