"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./admin.module.css";

const columns = ["Test Name", "Topic", "Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer", "Test Date", "Test Time"];

function groupResultsByTest(results) {
  return Object.values(results.reduce((groups, result) => {
    const scheduledAt = result.scheduledFor ? new Date(result.scheduledFor) : null;
    const testName = result.topic || "Practice set";
    const key = `${testName}|${scheduledAt?.toISOString() || ""}`;
    if (!groups[key]) groups[key] = { key, testName, scheduledAt, results: [] };
    groups[key].results.push(result);
    return groups;
  }, {}));
}

export default function AdminPanel({ name }) {
  const [file, setFile] = useState(null);
  const [tests, setTests] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState("");
  const [resultDate, setResultDate] = useState("");
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(true);

  async function loadTests() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/questions");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load tests.");
      setTests(data.tests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTests(); }, []);

  useEffect(() => {
    let active = true;
    setResultsLoading(true);
    const query = resultDate ? `?date=${encodeURIComponent(resultDate)}` : "";
    fetch(`/api/admin/results${query}`)
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!response.ok) throw new Error(data.error || "Could not load results.");
        if (active) setResults(data.results);
      })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setResultsLoading(false); });
    return () => { active = false; };
  }, [resultDate]);

  async function upload(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = event.currentTarget;
    if (!file) { setError("Choose an Excel .xlsx file first."); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/questions", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not import questions.");
      setMessage(`${data.imported} question${data.imported === 1 ? "" : "s"} imported successfully.`);
      setFile(null);
      form.reset();
      await loadTests();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function removeTest(test) {
    const label = `${test.testName} on ${test.testDate} at ${test.testTime}`;
    if (!window.confirm(`Remove ${label}? This permanently deletes all ${test.questionCount} questions in this test.`)) return;
    const id = `${test.testName}|${test.testDate}|${test.testTime}`;
    setError("");
    setMessage("");
    setRemoving(id);
    try {
      const response = await fetch("/api/admin/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(test),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not remove test.");
      setMessage(`${label} was removed with ${data.removed} question${data.removed === 1 ? "" : "s"}.`);
      await loadTests();
    } catch (err) {
      setError(err.message);
    } finally {
      setRemoving("");
    }
  }

  const groupedResults = useMemo(() => groupResultsByTest(results), [results]);
  const resultsDownloadUrl = `/api/admin/results?format=csv${resultDate ? `&date=${encodeURIComponent(resultDate)}` : ""}`;

  return <main className={styles.page}>
    <header className={styles.header}><a className="brand" href="/">apptitude<span>.</span></a><span>Admin: {name}</span></header>
    <section className={styles.content}>
      <span className="eyebrow">QUESTION LIBRARY</span>
      <h1>Schedule student tests</h1>
      <p className={styles.intro}>Upload one Excel workbook at a time. Students see and start every test scheduled for today.</p>

      <div className={styles.card}>
        <h2>Excel format</h2>
        <p>Use the first worksheet and put these exact headers in row 1:</p>
        <div className={styles.columns}>{columns.map((column) => <code key={column}>{column}</code>)}</div>
<<<<<<< HEAD
        <p>Use <b>A, B, C, D</b> or <b>1, 2, 3, 4</b> in Correct Answer. Use <b>YYYY-MM-DD</b> in Test Date and <b>HH:MM</b> (24-hour) in Test Time. Put mathematical expressions between dollar signs using LaTeX, for example <code>$2^2 \times 3^2 \times 5$</code>. Simple expressions such as <code>2^2 × 3^2 × 5</code> are also recognized. Repeat the same <b>Test Name</b>, date, and time for every question in one test; Topic can vary by question. You can import up to 200 rows in a file.</p>
=======
        <p>Use <b>A, B, C, D</b> or <b>1, 2, 3, 4</b> in Correct Answer. Use <b>YYYY-MM-DD</b> in Test Date and <b>HH:MM</b> (24-hour) in Test Time. Repeat the same <b>Test Name</b>, date, and time for every question in one test; Topic can vary by question. You can import up to 200 rows in a file.</p>
>>>>>>> ef788fe01a1d17d8bcc59fe0fa60605201f93952
        <a className={styles.templateButton} href="/admin-question-template.csv" download>Download Excel template</a>
        <form onSubmit={upload} className={styles.upload}>
          <input type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <button className="primary" disabled={uploading}>{uploading ? "Importing..." : "Import questions"}</button>
        </form>
        {error && <p className="error">{error}</p>}
        {message && <p className={styles.success}>{message}</p>}
      </div>

      <section className={styles.library}>
        <h2>Created tests</h2>
        {loading ? <p>Loading tests...</p> : tests.length ? <div className={styles.testGrid}>{tests.map((test) => {
          const id = `${test.testName}|${test.testDate}|${test.testTime}`;
          return <article className={styles.testCard} key={id}>
            <span className="eyebrow">{test.testDate} - {test.testTime}</span>
            <h3>{test.testName}</h3>
            <p>{test.questionCount} question{test.questionCount === 1 ? "" : "s"}</p>
            <button className={styles.removeButton} onClick={() => removeTest(test)} disabled={removing === id}>{removing === id ? "Removing..." : "Remove test"}</button>
          </article>;
        })}</div> : <p>No created tests yet.</p>}
      </section>

      <section className={styles.library}>
        <div className={styles.resultsHeading}>
          <div><h2>Student results</h2><p>Each card combines every student result for one test.</p></div>
          <a className={styles.templateButton} href={resultsDownloadUrl}>Download results for Excel</a>
        </div>
        <label className={styles.dateFilter}>Result date<input type="date" value={resultDate} onChange={(event) => setResultDate(event.target.value)} /></label>
        {resultsLoading ? <p>Loading results...</p> : groupedResults.length ? <div className={styles.resultsGrid}>{groupedResults.map((group) => {
          const completedCount = group.results.length;
          const totalScore = group.results.reduce((sum, result) => sum + result.score, 0);
          const totalQuestions = group.results.reduce((sum, result) => sum + result.total, 0);
          const averageScore = totalQuestions ? Math.round((totalScore / totalQuestions) * 100) : 0;
          return <article className={styles.resultCard} key={group.key}>
            <span className="eyebrow">{group.scheduledAt ? `Scheduled ${group.scheduledAt.toLocaleDateString()} - ${group.scheduledAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Practice results"}</span>
            <h3>{group.testName}</h3>
            <div className={styles.resultSummary}><span><b>{completedCount}</b> student{completedCount === 1 ? "" : "s"}</span><span><b>{averageScore}%</b> average score</span></div>
            <div className={styles.studentResults}>{group.results.map((result, index) => {
              const percentage = result.total ? Math.round((result.score / result.total) * 100) : 0;
              return <div className={styles.studentResult} key={`${result.studentEmail}-${result.completedAt}-${index}`}>
                <div><b>{result.studentName}</b><small>{result.studentEmail}</small></div>
                <strong>{result.score}/{result.total}<small>{percentage}%</small></strong>
              </div>;
            })}</div>
          </article>;
        })}</div> : <p>No results found for this date.</p>}
      </section>
    </section>
  </main>;
}
