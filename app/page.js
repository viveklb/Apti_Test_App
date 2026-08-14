"use client";

import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase";

const starterQuestions = [
  { question: "What is 15% of 200?", options: ["20", "25", "30", "35"], answer: 2 },
  { question: "Choose the next number: 2, 6, 12, 20, ?", options: ["24", "28", "30", "32"], answer: 2 },
  { question: "A book costs Rs. 240 after a 20% discount. What was its original price?", options: ["Rs. 280", "Rs. 288", "Rs. 300", "Rs. 320"], answer: 2 },
  { question: "Which word is closest in meaning to rapid?", options: ["Slow", "Quick", "Quiet", "Weak"], answer: 1 },
  { question: "If 3 workers finish a task in 6 days, how many worker-days are needed?", options: ["9", "12", "15", "18"], answer: 3 }
];

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const forgot = mode === "forgot";

  async function submit(event) {
    event.preventDefault(); setError(""); setNotice(""); setResetUrl(""); setLoading(true);
    try {
      const endpoint = forgot ? "forgot-password" : mode;
      const response = await fetch(`/api/auth/${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");
      if (forgot) { setNotice(data.message); setResetUrl(data.resetUrl || ""); return; }
      onLogin(data.user);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  async function signInWithGoogle() {
    setError(""); setNotice(""); setResetUrl(""); setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(getFirebaseAuth(), provider);
      const idToken = await result.user.getIdToken();
      const response = await fetch("/api/auth/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Google sign-in failed.");
      onLogin(data.user);
    } catch (err) {
      setError(err.code === "auth/popup-closed-by-user" ? "Google sign-in was cancelled." : err.message || "Google sign-in failed.");
    } finally { setLoading(false); }
  }

  function switchMode(nextMode) { setMode(nextMode); setError(""); setNotice(""); setResetUrl(""); }
  return <main className="auth-shell"><section className="hero"><span className="eyebrow">STUDENT PRACTICE PORTAL</span><h1>Build confidence,<br /><i>one question at a time.</i></h1><p>Short aptitude practice designed to help you learn your strengths.</p><div className="hero-points"><span>AI practice topics</span><span>Instant results</span><span>Progress saved</span></div></section><section className="auth-card"><div><h2>{forgot ? "Forgot password?" : mode === "login" ? "Welcome back" : "Create your account"}</h2><p>{forgot ? "Enter your email to create a password-reset link." : mode === "login" ? "Log in to continue your practice." : "Start your aptitude practice today."}</p></div>{!forgot && <><button className="google-button" type="button" onClick={signInWithGoogle} disabled={loading}><span aria-hidden="true">G</span>{loading ? "Please wait..." : "Continue with Google"}</button><div className="auth-divider"><span>or</span></div></>}<form onSubmit={submit}>{mode === "signup" && <label>Student name<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Your full name" /></label>}<label>Email address<input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>{!forgot && <label>Password<input required minLength="6" type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" /></label>}{error && <p className="error">{error}</p>}{notice && <p className="reset-notice">{notice}</p>}{resetUrl && <a className="reset-link" href={resetUrl}>Reset password now</a>}<button className="primary" disabled={loading}>{loading ? "Please wait..." : forgot ? "Create reset link" : mode === "login" ? "Log in" : "Create account"}</button></form>{mode === "login" ? <div className="auth-links"><button className="text-button" onClick={() => switchMode("signup")}>New student? Create an account</button><button className="text-button" onClick={() => switchMode("forgot")}>Forgot password?</button></div> : <button className="text-button" onClick={() => switchMode("login")}>Back to login</button>}</section></main>;
}

function QuizSetup({ user, onLogout, onGenerated }) {
  const [topic, setTopic] = useState("General aptitude");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function generateQuiz(event) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch("/api/questions/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, count }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate questions.");
      onGenerated(data.questions);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  return <main className="quiz-page"><header><a className="brand">apptitude<span>.</span></a><div className="student"><span>{user.name}</span><button className="text-button" onClick={onLogout}>Log out</button></div></header><section className="setup-wrap"><span className="eyebrow">AI PRACTICE SET</span><h1>What would you like to practise?</h1><p>Nemotron will create a fresh set of accessible questions for your topic.</p><form className="setup-card" onSubmit={generateQuiz}><label>Topic<input value={topic} onChange={event => setTopic(event.target.value)} maxLength="120" placeholder="For example: percentages or logical reasoning" /></label><fieldset><legend>Number of questions</legend><div className="count-options">{[10, 20, 50].map(number => <button type="button" className={count === number ? "count-choice selected" : "count-choice"} key={number} onClick={() => setCount(number)}>{number}</button>)}</div></fieldset>{error && <p className="error">{error}</p>}<button className="primary" disabled={loading}>{loading ? "Creating your questions..." : `Generate ${count} questions ->`}</button></form><button className="text-button starter-link" onClick={() => onGenerated(starterQuestions)}>Use the 5 sample questions instead</button></section></main>;
}

function Quiz({ user, onLogout, questions, newSet }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const question = questions[current];
  const answered = Object.keys(answers).length;
  async function submit() {
    setSaving(true);
    const score = questions.reduce((total, item, index) => total + (answers[index] === item.answer ? 1 : 0), 0);
    try { await fetch("/api/results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score, total: questions.length }) }); } finally { setSaving(false); setResult(score); }
  }
  if (result !== null) return <main className="result-page"><div className="result-card"><span className="eyebrow">QUIZ COMPLETE</span><h1>Great work, {user.name.split(" ")[0]}!</h1><div className="score">{result}<small> / {questions.length}</small></div><p>You answered {result} out of {questions.length} questions correctly.</p><button className="primary" onClick={() => { setCurrent(0); setAnswers({}); setResult(null); }}>Try again</button><button className="text-button" onClick={newSet}>Create a new practice set</button><button className="text-button" onClick={onLogout}>Log out</button></div></main>;
  return <main className="quiz-page"><header><a className="brand">apptitude<span>.</span></a><div className="student"><span>{user.name}</span><button className="text-button" onClick={onLogout}>Log out</button></div></header><section className="quiz-wrap"><div className="quiz-top"><div><span className="eyebrow">QUESTION {current + 1} OF {questions.length}</span><div className="progress"><i style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div></div><span className="answered">{answered} answered</span></div><article className="question-card"><h1>{question.question}</h1><div className="options">{question.options.map((option, index) => <button key={option} className={`option ${answers[current] === index ? "selected" : ""}`} onClick={() => setAnswers({ ...answers, [current]: index })}><b>{String.fromCharCode(65 + index)}</b>{option}</button>)}</div></article><nav className="quiz-nav"><button className="secondary" disabled={current === 0} onClick={() => setCurrent(current - 1)}>Previous</button>{current === questions.length - 1 ? <button className="primary" disabled={answered !== questions.length || saving} onClick={submit}>{saving ? "Saving..." : "Submit quiz"}</button> : <button className="primary" onClick={() => setCurrent(current + 1)}>Next</button>}</nav>{current === questions.length - 1 && answered !== questions.length && <p className="hint">Answer all questions before submitting.</p>}</section></main>;
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [questions, setQuestions] = useState(null);
  useEffect(() => { fetch("/api/auth/me").then(response => response.ok ? response.json() : null).then(data => data?.user && setUser(data.user)).finally(() => setReady(true)); }, []);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); setQuestions(null); setUser(null); }
  if (!ready) return <main className="loading">Loading Apptitude...</main>;
  if (!user) return <Auth onLogin={setUser} />;
  return questions ? <Quiz user={user} onLogout={logout} questions={questions} newSet={() => setQuestions(null)} /> : <QuizSetup user={user} onLogout={logout} onGenerated={setQuestions} />;
}
