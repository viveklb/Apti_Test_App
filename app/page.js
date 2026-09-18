"use client";

<<<<<<< HEAD
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase";
import MathText from "./components/MathText";
import ExamGuard from "./components/ExamGuard";
=======
import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase";
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952

const starterQuestions = [
  { question: "What is 15% of 200?", options: ["20", "25", "30", "35"], answer: 2 },
  { question: "Choose the next number: 2, 6, 12, 20, ?", options: ["24", "28", "30", "32"], answer: 2 },
  { question: "A book costs Rs. 240 after a 20% discount. What was its original price?", options: ["Rs. 280", "Rs. 288", "Rs. 300", "Rs. 320"], answer: 2 },
  { question: "Which word is closest in meaning to rapid?", options: ["Slow", "Quick", "Quiet", "Weak"], answer: 1 },
  { question: "If 3 workers finish a task in 6 days, how many worker-days are needed?", options: ["9", "12", "15", "18"], answer: 3 }
];

<<<<<<< HEAD
function googleSignInError(error) {
  if (error?.code === "auth/popup-closed-by-user") return "Google sign-in was cancelled.";
  if (error?.code === "auth/popup-blocked") return "Allow pop-ups for this site, then try Google sign-in again.";
  if (error?.code === "auth/network-request-failed") return "Google sign-in could not reach Firebase. Check your connection and try again.";
  if (error?.code === "auth/unauthorized-domain") return "This website domain is not authorized for Google sign-in.";
  if (/database is closing\/hidden/i.test(error?.message || "")) return "Google sign-in was interrupted. Keep this tab open and try again.";
  return "Google sign-in failed. Please try again.";
}

=======
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
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
<<<<<<< HEAD
      console.error("Google sign-in failed", err);
      setError(googleSignInError(err));
=======
      setError(err.code === "auth/popup-closed-by-user" ? "Google sign-in was cancelled." : err.message || "Google sign-in failed.");
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
    } finally { setLoading(false); }
  }

  function switchMode(nextMode) { setMode(nextMode); setError(""); setNotice(""); setResetUrl(""); }
<<<<<<< HEAD
  return <main className="auth-shell"><section className="hero"><div className="institution-block"><div className="institution-heading"><Image className="institution-logo" src="/spspm-logo.png" alt="Savitribai Phule Shikshan Prasarak Mandal logo" width={142} height={142} priority /><div className="institution-copy"><h2 className="cell-title">Training &amp; Placement Cell</h2><h1 className="college-name">N. B. Navale Sinhgad College of Engineering</h1><p className="campus-name">Kegaon–Solapur</p></div></div><h3 className="portal-title">Placement Practice Portal</h3></div><p>Short aptitude practice designed to help you learn your strengths.</p><div className="hero-points"><span>AI practice topics</span><span>Instant results</span><span>Progress saved</span></div></section><section className="auth-card"><div><h2>{forgot ? "Forgot password?" : mode === "login" ? "Welcome back" : "Create your account"}</h2><p>{forgot ? "Enter your email to create a password-reset link." : mode === "login" ? "Log in to continue your practice." : "Start your aptitude practice today."}</p></div>{!forgot && <><button className="google-button" type="button" onClick={signInWithGoogle} disabled={loading}><span aria-hidden="true">G</span>{loading ? "Please wait..." : "Continue with Google"}</button><div className="auth-divider"><span>or</span></div></>}<form onSubmit={submit}>{mode === "signup" && <label>Student name<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Your full name" /></label>}<label>Email address<input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>{!forgot && <label>Password<input required minLength="6" type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" /></label>}{error && <p className="error">{error}</p>}{notice && <p className="reset-notice">{notice}</p>}{resetUrl && <a className="reset-link" href={resetUrl}>Reset password now</a>}<button className="primary" disabled={loading}>{loading ? "Please wait..." : forgot ? "Create reset link" : mode === "login" ? "Log in" : "Create account"}</button></form>{mode === "login" ? <div className="auth-links"><button className="text-button" onClick={() => switchMode("signup")}>New student? Create an account</button><button className="text-button" onClick={() => switchMode("forgot")}>Forgot password?</button></div> : <button className="text-button" onClick={() => switchMode("login")}>Back to login</button>}</section></main>;
=======
  return <main className="auth-shell"><section className="hero"><span className="eyebrow">STUDENT PRACTICE PORTAL</span><h1>Build confidence,<br /><i>one question at a time.</i></h1><p>Short aptitude practice designed to help you learn your strengths.</p><div className="hero-points"><span>AI practice topics</span><span>Instant results</span><span>Progress saved</span></div></section><section className="auth-card"><div><h2>{forgot ? "Forgot password?" : mode === "login" ? "Welcome back" : "Create your account"}</h2><p>{forgot ? "Enter your email to create a password-reset link." : mode === "login" ? "Log in to continue your practice." : "Start your aptitude practice today."}</p></div>{!forgot && <><button className="google-button" type="button" onClick={signInWithGoogle} disabled={loading}><span aria-hidden="true">G</span>{loading ? "Please wait..." : "Continue with Google"}</button><div className="auth-divider"><span>or</span></div></>}<form onSubmit={submit}>{mode === "signup" && <label>Student name<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Your full name" /></label>}<label>Email address<input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>{!forgot && <label>Password<input required minLength="6" type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" /></label>}{error && <p className="error">{error}</p>}{notice && <p className="reset-notice">{notice}</p>}{resetUrl && <a className="reset-link" href={resetUrl}>Reset password now</a>}<button className="primary" disabled={loading}>{loading ? "Please wait..." : forgot ? "Create reset link" : mode === "login" ? "Log in" : "Create account"}</button></form>{mode === "login" ? <div className="auth-links"><button className="text-button" onClick={() => switchMode("signup")}>New student? Create an account</button><button className="text-button" onClick={() => switchMode("forgot")}>Forgot password?</button></div> : <button className="text-button" onClick={() => switchMode("login")}>Back to login</button>}</section></main>;
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
}

function localDateAndTime() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString();
  return { date: local.slice(0, 10), time: local.slice(11, 16) };
}

function QuizSetup({ user, onLogout, onGenerated }) {
  const initialSchedule = localDateAndTime();
  const [topic, setTopic] = useState("General aptitude");
  const [count, setCount] = useState(10);
  const [date, setDate] = useState(initialSchedule.date);
  const [time, setTime] = useState(initialSchedule.time);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [todayTests, setTodayTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const today = localDateAndTime().date;
    fetch(`/api/tests/today?date=${today}`).then(response => response.ok ? response.json() : { tests: [] }).then(data => {
      if (active) setTodayTests(data.tests || []);
    }).finally(() => { if (active) setTestsLoading(false); });
    return () => { active = false; };
  }, []);

  function sessionDetails(questionCount) {
    const scheduledFor = new Date(`${date}T${time}`);
    if (!date || !time || Number.isNaN(scheduledFor.getTime())) throw new Error("Choose a valid date and time.");
    return { topic: topic.trim() || "General aptitude", questionCount, scheduledFor: scheduledFor.toISOString() };
  }

  async function generateQuiz(event) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const details = sessionDetails(count);
      const response = await fetch("/api/questions/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: details.topic, count }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate questions.");
      onGenerated({ questions: data.questions, details });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  function useSampleQuestions() {
    try { onGenerated({ questions: starterQuestions, details: sessionDetails(starterQuestions.length) }); }
    catch (err) { setError(err.message); }
  }

  function startTodayTest(test) {
    const scheduledFor = new Date(`${test.testDate}T${test.testTime}`);
<<<<<<< HEAD
    onGenerated({ questions: test.questions, details: { topic: test.testName, questionCount: test.questions.length, scheduledFor: scheduledFor.toISOString(), testName: test.testName, testDate: test.testDate, testTime: test.testTime } });
  }

  return <main className="quiz-page"><header><a className="brand">apptitude<span>.</span></a><div className="student">{user.isAdmin && <a className="admin-link" href="/admin">Admin</a>}<span>{user.name}</span><button className="text-button" onClick={onLogout}>Log out</button></div></header><section className="setup-wrap"><span className="eyebrow">STUDENT DASHBOARD</span><h1>Ready to practise?</h1><section className="today-tests"><div className="today-tests-heading"><div><span className="eyebrow">TODAY'S TEST</span><h2>Start your scheduled test</h2></div><span>{localDateAndTime().date}</span></div>{testsLoading ? <p>Checking today’s tests...</p> : todayTests.length ? <div className="today-test-list">{todayTests.map(test => <article className="today-test-card" key={`${test.testName}-${test.testTime}`}><div><strong>{test.testName}</strong><p>{test.questions.length} questions · {test.testTime}</p></div><button className="primary" onClick={() => startTodayTest(test)}>Start test →</button></article>)}</div> : <p className="no-tests">No pending tests for today.{!user.isAdmin && " Please check again later."}</p>}</section>{user.isAdmin && <><span className="eyebrow">AI PRACTICE SET</span><h2 className="practice-heading">Create your own practice set</h2><p>Choose a topic, question count, date, and time for your practice session.</p><form className="setup-card" onSubmit={generateQuiz}><label>Topic<input required value={topic} onChange={event => setTopic(event.target.value)} maxLength="120" placeholder="For example: percentages or logical reasoning" /></label><fieldset><legend>Number of questions</legend><div className="count-options">{[10, 20, 50].map(number => <button type="button" className={count === number ? "count-choice selected" : "count-choice"} key={number} onClick={() => setCount(number)}>{number}</button>)}</div></fieldset><div className="schedule-inputs"><label>Date<input required type="date" value={date} onChange={event => setDate(event.target.value)} /></label><label>Time<input required type="time" value={time} onChange={event => setTime(event.target.value)} /></label></div>{error && <p className="error">{error}</p>}<button className="primary" disabled={loading}>{loading ? "Creating your questions..." : `Generate ${count} questions ->`}</button></form><button className="text-button starter-link" onClick={useSampleQuestions}>Use the 5 sample questions instead</button></>}</section></main>;
=======
    onGenerated({ questions: test.questions, details: { topic: test.testName, questionCount: test.questions.length, scheduledFor: scheduledFor.toISOString() } });
  }

  return <main className="quiz-page"><header><a className="brand">apptitude<span>.</span></a><div className="student">{user.isAdmin && <a className="admin-link" href="/admin">Admin</a>}<span>{user.name}</span><button className="text-button" onClick={onLogout}>Log out</button></div></header><section className="setup-wrap"><span className="eyebrow">STUDENT DASHBOARD</span><h1>Ready to practise?</h1><section className="today-tests"><div className="today-tests-heading"><div><span className="eyebrow">TODAY'S TEST</span><h2>Start your scheduled test</h2></div><span>{localDateAndTime().date}</span></div>{testsLoading ? <p>Checking today’s tests...</p> : todayTests.length ? <div className="today-test-list">{todayTests.map(test => <article className="today-test-card" key={`${test.testName}-${test.testTime}`}><div><strong>{test.testName}</strong><p>{test.questions.length} questions · {test.testTime}</p></div><button className="primary" onClick={() => startTodayTest(test)}>Start test →</button></article>)}</div> : <p className="no-tests">No test is scheduled for today. You can create a practice set below.</p>}</section><span className="eyebrow">AI PRACTICE SET</span><h2 className="practice-heading">Create your own practice set</h2><p>Choose a topic, question count, date, and time for your practice session.</p><form className="setup-card" onSubmit={generateQuiz}><label>Topic<input required value={topic} onChange={event => setTopic(event.target.value)} maxLength="120" placeholder="For example: percentages or logical reasoning" /></label><fieldset><legend>Number of questions</legend><div className="count-options">{[10, 20, 50].map(number => <button type="button" className={count === number ? "count-choice selected" : "count-choice"} key={number} onClick={() => setCount(number)}>{number}</button>)}</div></fieldset><div className="schedule-inputs"><label>Date<input required type="date" value={date} onChange={event => setDate(event.target.value)} /></label><label>Time<input required type="time" value={time} onChange={event => setTime(event.target.value)} /></label></div>{error && <p className="error">{error}</p>}<button className="primary" disabled={loading}>{loading ? "Creating your questions..." : `Generate ${count} questions ->`}</button></form><button className="text-button starter-link" onClick={useSampleQuestions}>Use the 5 sample questions instead</button></section></main>;
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
}

function Quiz({ user, onLogout, practiceSet, newSet }) {
  const { questions, details } = practiceSet;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
<<<<<<< HEAD
  const [started, setStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [screenBlocked, setScreenBlocked] = useState(false);
  const [submissionReason, setSubmissionReason] = useState("");
  const duration = questions.length * 60;
  const [remaining, setRemaining] = useState(duration);
  const deadline = useRef(null);
  const submitted = useRef(false);
  const submitLatest = useRef(null);
  const [saveError, setSaveError] = useState("");
  const question = questions[current];
  const answered = Object.keys(answers).length;
  useEffect(() => {
    if (!started || result !== null) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0 && !submitted.current) submitLatest.current();
    };
    tick();
    const interval = window.setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", tick); };
  }, [started, result]);
  async function submit() {
    if (submitted.current) return;
    submitted.current = true;
    setSaving(true); setSaveError("");
    const score = questions.reduce((total, item, index) => total + (answers[index] === item.answer ? 1 : 0), 0);
    try {
      const response = await fetch("/api/results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score, total: questions.length, ...details }) });
      if (!response.ok) throw new Error("Could not save your result.");
      setResult(score);
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (document.fullscreenElement || document.webkitFullscreenElement) Promise.resolve(exit?.call(document)).catch(() => {});
    } catch { setSaveError("Your result could not be saved. Keep this page open and retry."); }
    finally { setSaving(false); }
  }
  submitLatest.current = submit;
  if (result !== null) return <main className="result-page"><div className="result-card"><span className="eyebrow">QUIZ COMPLETE</span><h1>Exam complete, {user.name.split(" ")[0]}</h1>{submissionReason && <p role="status">{submissionReason}</p>}<div className="score">{result}<small> / {questions.length}</small></div><p>You answered {result} out of {questions.length} questions correctly.</p><button className="primary" onClick={newSet}>Back to dashboard</button><button className="text-button" onClick={onLogout}>Log out</button></div></main>;
  return <main className="quiz-page"><header><a className="brand">apptitude<span>.</span></a><div className="student"><span>{user.name}</span><button className="text-button" onClick={onLogout}>Log out</button></div></header><section className="quiz-wrap"><ExamGuard onScreenBlocked={setScreenBlocked} onWarningLimit={() => { setSubmissionReason("Your exam was automatically submitted after 3 activity warnings."); submitLatest.current(); }} onCameraChange={setCameraReady} active={result === null && !submitted.current} started={started} seconds={remaining} onStart={() => { deadline.current = Date.now() + duration * 1000; setStarted(true); }} />{saveError && <div role="alert" className="exam-warning"><p>{saveError}</p><button className="primary" disabled={saving} onClick={() => { submitted.current = false; submit(); }}>Retry saving result</button></div>}{saving && <p role="status">{submissionReason} Saving your result…</p>}{started && <fieldset className="exam-questions" disabled={screenBlocked || !cameraReady || saving || submitted.current || remaining === 0}><p className="session-details">{details.topic} · {details.questionCount} questions · {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(details.scheduledFor))}</p><div className="quiz-top"><div><span className="eyebrow">QUESTION {current + 1} OF {questions.length}</span><div className="progress"><i style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div></div><span className="answered">{answered} answered</span></div><article className="question-card"><MathText as="h1">{question.question}</MathText><div className="options">{question.options.map((option, index) => <button key={option} className={`option ${answers[current] === index ? "selected" : ""}`} onClick={() => setAnswers({ ...answers, [current]: index })}><b>{String.fromCharCode(65 + index)}</b><MathText>{option}</MathText></button>)}</div></article><nav className="quiz-nav"><button className="secondary" disabled={current === 0} onClick={() => setCurrent(current - 1)}>Previous</button>{current === questions.length - 1 ? <button className="primary" disabled={answered !== questions.length || saving} onClick={submit}>{saving ? "Saving..." : "Submit quiz"}</button> : <button className="primary" onClick={() => setCurrent(current + 1)}>Next</button>}</nav>{current === questions.length - 1 && answered !== questions.length && <p className="hint">Answer all questions before submitting.</p>}</fieldset>}</section></main>;
=======
  const question = questions[current];
  const answered = Object.keys(answers).length;
  async function submit() {
    setSaving(true);
    const score = questions.reduce((total, item, index) => total + (answers[index] === item.answer ? 1 : 0), 0);
    try { await fetch("/api/results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score, total: questions.length, ...details }) }); } finally { setSaving(false); setResult(score); }
  }
  if (result !== null) return <main className="result-page"><div className="result-card"><span className="eyebrow">QUIZ COMPLETE</span><h1>Great work, {user.name.split(" ")[0]}!</h1><div className="score">{result}<small> / {questions.length}</small></div><p>You answered {result} out of {questions.length} questions correctly.</p><button className="primary" onClick={() => { setCurrent(0); setAnswers({}); setResult(null); }}>Try again</button><button className="text-button" onClick={newSet}>Create a new practice set</button><button className="text-button" onClick={onLogout}>Log out</button></div></main>;
  return <main className="quiz-page"><header><a className="brand">apptitude<span>.</span></a><div className="student"><span>{user.name}</span><button className="text-button" onClick={onLogout}>Log out</button></div></header><section className="quiz-wrap"><p className="session-details">{details.topic} · {details.questionCount} questions · {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(details.scheduledFor))}</p><div className="quiz-top"><div><span className="eyebrow">QUESTION {current + 1} OF {questions.length}</span><div className="progress"><i style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div></div><span className="answered">{answered} answered</span></div><article className="question-card"><h1>{question.question}</h1><div className="options">{question.options.map((option, index) => <button key={option} className={`option ${answers[current] === index ? "selected" : ""}`} onClick={() => setAnswers({ ...answers, [current]: index })}><b>{String.fromCharCode(65 + index)}</b>{option}</button>)}</div></article><nav className="quiz-nav"><button className="secondary" disabled={current === 0} onClick={() => setCurrent(current - 1)}>Previous</button>{current === questions.length - 1 ? <button className="primary" disabled={answered !== questions.length || saving} onClick={submit}>{saving ? "Saving..." : "Submit quiz"}</button> : <button className="primary" onClick={() => setCurrent(current + 1)}>Next</button>}</nav>{current === questions.length - 1 && answered !== questions.length && <p className="hint">Answer all questions before submitting.</p>}</section></main>;
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [questions, setQuestions] = useState(null);
  useEffect(() => { fetch("/api/auth/me").then(response => response.ok ? response.json() : null).then(data => data?.user && setUser(data.user)).finally(() => setReady(true)); }, []);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); setQuestions(null); setUser(null); }
  if (!ready) return <main className="loading">Loading Apptitude...</main>;
  if (!user) return <Auth onLogin={setUser} />;
  return questions ? <Quiz user={user} onLogout={logout} practiceSet={questions} newSet={() => setQuestions(null)} /> : <QuizSetup user={user} onLogout={logout} onGenerated={setQuestions} />;
}
