"use client";

import { useEffect, useState } from "react";
import "./reset.css";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { setToken(new URLSearchParams(window.location.search).get("token") || ""); }, []);
  async function submit(event) {
    event.preventDefault(); setError(""); setMessage("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not reset password.");
      setMessage(data.message);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  return <main className="reset-page"><section className="reset-card"><span>ACCOUNT RECOVERY</span><h1>Reset your password</h1><p>Choose a new password for your student account.</p>{message ? <><p className="success">{message}</p><a className="reset-primary" href="/">Go to login</a></> : <form onSubmit={submit}><label>New password<input required minLength="6" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 6 characters" /></label><label>Confirm new password<input required minLength="6" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Repeat new password" /></label>{error && <p className="error">{error}</p>}<button disabled={loading || !token}>{loading ? "Updating password..." : "Reset password"}</button></form>}<a className="back-link" href="/">Back to login</a></section></main>;
}
