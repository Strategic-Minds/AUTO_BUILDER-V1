"use client";

import { useEffect, useState } from "react";

type QueueRow = {
  id?: string;
  task_type?: string;
  state?: string;
  priority?: string;
  created_at?: string;
};

export function QueueTimelinePanel() {
  const [rows, setRows] = useState<QueueRow[]>([]);

  async function load() {
    const res = await fetch("/api/bridge/queue", { cache: "no-store" });
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as { tasks?: { rows?: QueueRow[] } };
    setRows(data.tasks?.rows ?? []);
  }

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, padding: 18 }}>
      <div style={{ color: "var(--accent)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Queue Timeline</div>
      <h2 style={{ margin: "8px 0 12px", color: "var(--ink)" }}>Batch Queue Manager</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {rows.length === 0 ? <div style={{ color: "var(--muted)" }}>No queued tasks.</div> : null}
        {rows.slice(0, 12).map((row) => (
          <article key={row.id} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 10, background: "#0f121a" }}>
            <div style={{ color: "var(--ink)", fontWeight: 600 }}>{row.task_type ?? "unknown_task"}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              {row.state ?? "unknown"} · {row.priority ?? "normal"} · {row.created_at ?? "n/a"}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
