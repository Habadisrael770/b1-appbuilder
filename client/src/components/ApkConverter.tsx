/**
 * APK Converter Component
 * FRONTEND INTEGRATION – PRODUCTION-FIRST (ONE FILE)
 * ==================================================
 * Drop-in React component:
 * - Form: Website URL
 * - Button: Convert to APK
 * - Polling: /api/builds/status
 * - Download when COMPLETED
 *
 * Assumptions:
 * - Backend endpoints already live:
 *   POST /api/builds/start
 *   GET  /api/builds/status?buildId=
 *   GET  /api/builds/download?buildId=
 *
 * Usage:
 * <ApkConverter appId={1} userId={1} />
 */

import React, { useEffect, useRef, useState } from "react";

type BuildStatus =
  | "PENDING"
  | "RUNNING"
  | "BUILDING"
  | "COMPLETED"
  | "FAILED";

interface BuildResponse {
  id: string;
  status: BuildStatus;
  progress: number;
  androidUrl?: string;
  error?: string;
}

export default function ApkConverter({
  appId,
  userId,
}: {
  appId: number;
  userId: number;
}) {
  const API_BASE = "";
  const [url, setUrl] = useState("");
  const [buildId, setBuildId] = useState<string | null>(null);
  const [status, setStatus] = useState<BuildStatus | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pollRef = useRef<number | null>(null);

  // --------- helpers ----------
  function isValidUrl(v: string) {
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function startBuild() {
    if (!isValidUrl(url)) {
      setError("Please enter a valid http/https URL.");
      return;
    }
    setError(null);
    setBusy(true);
    setProgress(0);
    setStatus(null);

    const res = await fetch(`${API_BASE}/api/builds/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, userId, platform: "ANDROID" }),
    });

    if (!res.ok) {
      setBusy(false);
      setError("Failed to start build.");
      return;
    }

    const data = await res.json();
    setBuildId(data.buildId);
    setStatus("PENDING");
  }

  async function pollStatus(id: string) {
    const res = await fetch(
      `${API_BASE}/api/builds/status?buildId=${encodeURIComponent(id)}`
    );
    if (!res.ok) return;

    const data: BuildResponse = await res.json();
    setStatus(data.status);
    setProgress(data.progress ?? 0);

    if (data.status === "FAILED") {
      setError(data.error || "Build failed.");
      stopPolling();
      setBusy(false);
    }

    if (data.status === "COMPLETED") {
      stopPolling();
      setBusy(false);
    }
  }

  function startPolling(id: string) {
    stopPolling();
    pollRef.current = window.setInterval(() => pollStatus(id), 15000);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  // --------- effects ----------
  useEffect(() => {
    if (buildId) startPolling(buildId);
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildId]);

  // --------- render ----------
  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Convert Website to Android APK</h2>

      <label style={{ display: "block", marginBottom: 8 }}>
        Website URL
      </label>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        style={{ width: "100%", padding: 10, marginBottom: 12 }}
        disabled={busy}
      />

      <button
        onClick={startBuild}
        disabled={busy || !isValidUrl(url)}
        style={{
          padding: "10px 16px",
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {busy ? "Building…" : "Convert to APK"}
      </button>

      {status && (
        <div style={{ marginTop: 20 }}>
          <div>Status: <strong>{status}</strong></div>
          <div>Progress: {progress}%</div>
          <div
            style={{
              height: 8,
              background: "#eee",
              marginTop: 6,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#4caf50",
              }}
            />
          </div>
        </div>
      )}

      {status === "COMPLETED" && buildId && (
        <div style={{ marginTop: 16 }}>
          <a
            href={`${API_BASE}/api/builds/download?buildId=${encodeURIComponent(
              buildId
            )}`}
          >
            Download APK
          </a>
        </div>
      )}

      {error && (
        <div style={{ color: "red", marginTop: 16 }}>
          {error}
        </div>
      )}
    </div>
  );
}
