"use client";

import { useEffect, useRef, useState } from "react";

export default function ExamGuard({ active, started, seconds, onStart, onCameraChange, onScreenBlocked, onWarningLimit }) {
  const video = useRef(null);
  const stream = useRef(null);
  const mounted = useRef(true);
  const [camera, setCamera] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [count, setCount] = useState(0);
  const warningCount = useRef(0);
  const awayIncident = useRef(false);
  const lastCopyWarning = useRef(0);
  const [accepted, setAccepted] = useState(false);
  const [fullscreenRequired, setFullscreenRequired] = useState(false);
  const [screenBlocked, setScreenBlocked] = useState(false);
  const limitCallback = useRef(onWarningLimit);
  limitCallback.current = onWarningLimit;

  useEffect(() => {
    setFullscreenRequired(Boolean(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen));
  }, []);
  useEffect(() => { onScreenBlocked(screenBlocked); }, [screenBlocked, onScreenBlocked]);

  useEffect(() => { onCameraChange(camera); }, [camera, onCameraChange]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; stream.current?.getTracks().forEach(track => track.stop()); };
  }, []);

  useEffect(() => {
    if (!active) stream.current?.getTracks().forEach(track => track.stop());
  }, [active]);

  useEffect(() => {
    if (!active || !started) return;
    const warn = message => {
      if (warningCount.current >= 3) return;
      setWarning(message);
      warningCount.current += 1;
      setCount(warningCount.current);
      if (warningCount.current === 3) limitCallback.current();
    };
    const isFullscreen = () => Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    const away = message => {
      if (awayIncident.current) return;
      awayIncident.current = true;
      warn(message);
    };
    const restored = () => {
      if (!document.hidden && document.hasFocus() && (!fullscreenRequired || isFullscreen())) awayIncident.current = false;
    };
    const hidden = () => { if (document.hidden) away("You left the exam screen. The timer continues running."); else restored(); };
    const blur = () => away("The exam lost focus. Return to the exam and avoid other apps or windows.");
    const fullscreen = () => {
      const blocked = fullscreenRequired && !isFullscreen();
      setScreenBlocked(blocked);
      if (blocked) away("Fullscreen was exited. Answering is locked until you return to fullscreen.");
      else restored();
    };
    const block = event => {
      event.preventDefault();
      if (Date.now() - lastCopyWarning.current < 1000) return;
      lastCopyWarning.current = Date.now();
      warn("Copying, cutting, pasting, printing, saving, and the context menu are disabled during the exam.");
    };
    const keys = event => { if ((event.ctrlKey || event.metaKey) && ["c", "x", "v", "p", "s"].includes(event.key.toLowerCase())) block(event); };
    const leave = event => { event.preventDefault(); event.returnValue = ""; };
    const cameraLost = () => { setCamera(false); warn("Camera interrupted. Restore your camera to continue answering; the timer keeps running."); };
    const cameraBack = () => setCamera(true);
    const tracks = stream.current?.getVideoTracks() || [];
    tracks.forEach(track => { track.addEventListener("ended", cameraLost); track.addEventListener("mute", cameraLost); track.addEventListener("unmute", cameraBack); });
    document.body.classList.add("exam-locked");
    document.addEventListener("visibilitychange", hidden);
    document.addEventListener("fullscreenchange", fullscreen);
    document.addEventListener("webkitfullscreenchange", fullscreen);
    document.addEventListener("keydown", keys);
    ["copy", "cut", "paste", "contextmenu", "dragstart"].forEach(type => document.addEventListener(type, block));
    window.addEventListener("blur", blur);
    window.addEventListener("focus", restored);
    window.addEventListener("beforeunload", leave);
    fullscreen();
    return () => {
      document.body.classList.remove("exam-locked");
      tracks.forEach(track => { track.removeEventListener("ended", cameraLost); track.removeEventListener("mute", cameraLost); track.removeEventListener("unmute", cameraBack); });
      document.removeEventListener("visibilitychange", hidden);
      document.removeEventListener("fullscreenchange", fullscreen);
      document.removeEventListener("webkitfullscreenchange", fullscreen);
      document.removeEventListener("keydown", keys);
      ["copy", "cut", "paste", "contextmenu", "dragstart"].forEach(type => document.removeEventListener(type, block));
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", restored);
      window.removeEventListener("beforeunload", leave);
    };
  }, [active, started, camera, fullscreenRequired]);

  async function enableCamera() {
    setBusy(true); setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera requires HTTPS and a browser with camera support. Open this page in Safari or Chrome over HTTPS.");
      stream.current?.getTracks().forEach(track => track.stop());
      const next = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      if (!mounted.current) { next.getTracks().forEach(track => track.stop()); return; }
      stream.current = next;
      video.current.srcObject = next;
      await video.current.play();
      setCamera(true);
    } catch (err) {
      stream.current?.getTracks().forEach(track => track.stop());
      setCamera(false);
      setError(err.name === "NotAllowedError" ? "Camera permission was denied. Allow camera access in your browser settings, then retry." : err.message || "Camera unavailable. Close other camera apps and retry.");
    } finally { if (mounted.current) setBusy(false); }
  }

  async function enterFullscreen() {
    const element = document.documentElement;
    const request = element.requestFullscreen || element.webkitRequestFullscreen;
    if (!request) return true;
    try {
      await request.call(element);
      const entered = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      if (!entered) throw new Error("Fullscreen unavailable");
      setScreenBlocked(false); setError("");
      return true;
    } catch { setError("Fullscreen could not be enabled. Tap the fullscreen button to retry; answering remains locked."); return false; }
  }

  if (!active) return null;
  return <section className="exam-guard">
    <div className="exam-status"><strong role="timer" aria-label="Time remaining">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} remaining</strong><span>Activity warnings: {count} / 3</span></div>
    <video ref={video} autoPlay muted playsInline disablePictureInPicture aria-label="Your camera preview" />
    <p>{camera ? "Camera active · Preview stays on your device; no recording is uploaded." : "Camera access is required to take this exam."}</p>
    {!started && <div className="exam-rules"><h2>Exam rules</h2><ol><li>Keep your camera enabled throughout the exam.</li><li>Stay in fullscreen. Exiting fullscreen locks answering until you restore it.</li><li>Do not switch tabs, minimize the window, or open other apps.</li><li>Do not copy, cut, paste, print, save, drag text, or use the context menu.</li><li>Each detected activity triggers a warning. The third warning automatically submits your exam, including unanswered questions.</li><li>The timer continues during warnings and screen locks. When time expires, your exam is submitted automatically.</li></ol>{!fullscreenRequired && <p>Fullscreen is unavailable on this browser. You may take the exam in this tab; activity monitoring and the three-warning limit still apply.</p>}<label className="exam-accept"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} />I have read and understood the exam rules, including automatic submission after 3 warnings.</label></div>}
    {!camera && <button className="secondary" disabled={busy} onClick={enableCamera}>{busy ? "Opening camera…" : "Enable camera"}</button>}
    {!started && <button className="primary" disabled={!accepted || !camera || busy} onClick={async () => { if (await enterFullscreen()) onStart(); }}>Start exam</button>}
    {started && fullscreenRequired && <button className="text-button" onClick={enterFullscreen}>Return to fullscreen</button>}
    {error && <p className="error" role="alert">{error}</p>}
    {warning && <div className="exam-warning" role="alert"><strong>Activity warning {count} of 3</strong><p>{warning}</p><p>{3 - count} warning(s) remaining before automatic submission.</p><button className="secondary" onClick={() => setWarning("")}>I understand</button></div>}
    {started && screenBlocked && <div className="camera-block fullscreen-block" role="alertdialog" aria-modal="true" aria-label="Fullscreen required"><h2>Return to fullscreen to continue</h2><p>Warning {count} of 3. Your answers are locked. The timer continues running.</p><button autoFocus className="primary" onClick={enterFullscreen}>Return to fullscreen</button>{error && <p role="alert">{error}</p>}</div>}
    {started && !camera && <div className="camera-block" role="alert"><p>Camera interrupted. Restore camera access to continue. The timer is still running.</p><button className="primary" disabled={busy} onClick={enableCamera}>{busy ? "Opening camera…" : "Restore camera"}</button>{error && <p>{error}</p>}</div>}
  </section>;
}
