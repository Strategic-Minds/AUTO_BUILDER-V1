"use client";

import { useEffect, useState } from "react";

type Data = {
  capability?: { gap_score?: number };
  profit?: { profit_score?: number };
  scheduler?: { status?: string };
  worker?: { stale?: boolean; heartbeat_age_seconds?: number };
  blocker?: { severity?: string; category?: string };
  approvalOpen?: number;
};

export function RecursiveIntelligencePanel() {
  const [data, setData] = useState<Data>({});

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/recursive/intelligence", { cache: "no-store" });
      if (!res.ok) {
        return;
      }
      const payload = (await res.json()) as Data;
      setData(payload);
    }
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18 }}>
      <div style={{ color: "#0f766e", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Recursive Intelligence</div>
      <h2 style={{ margin: "8px 0 12px" }}>Quality Hardening</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <div style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 12 }}>Capability Score: <strong>{100 - Number(data.capability?.gap_score ?? 0)}</strong></div>
        <div style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 12 }}>Profit Score: <strong>{Number(data.profit?.profit_score ?? 0)}</strong></div>
        <div style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 12 }}>Scheduler Health: <strong>{data.scheduler?.status ?? "unknown"}</strong></div>
        <div style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 12 }}>Worker Heartbeat: <strong>{data.worker?.stale ? "stale" : "healthy"}</strong></div>
        <div style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 12 }}>Blocker Severity: <strong>{data.blocker?.severity ?? "none"}</strong></div>
        <div style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 12 }}>Approval Queue: <strong>{Number(data.approvalOpen ?? 0)}</strong></div>
      </div>
    </section>
  );
}
