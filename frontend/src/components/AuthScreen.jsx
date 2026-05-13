import { useState } from "react";
import { login, mapAuthError, register } from "../lib/auth";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <div className="w-full rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Neburix Secure Access</p>
        <h1 className="mt-1 text-xl font-semibold text-stone-900">{mode === "login" ? "Sign in" : "Create account"}</h1>
        <p className="mt-1 text-xs text-stone-500">Use your Firebase auth credentials to continue.</p>
        <p className="mt-1 text-[11px] text-stone-400">
          If sign-in fails, enable Email/Password provider and authorize localhost in Firebase Console.
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-stone-500">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. nebuser25"
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
                minLength={2}
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-stone-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-stone-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-stone-900 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError("");
            setUsername("");
            setMode((prev) => (prev === "login" ? "register" : "login"));
          }}
          className="mt-3 w-full text-center text-xs font-medium text-stone-600 underline"
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
