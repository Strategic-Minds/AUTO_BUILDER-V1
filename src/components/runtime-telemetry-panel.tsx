"use client";

import { useEffect, useState } from "react";

type RuntimeStatus = "verified" | "unverified" | "blocked";

type TelemetryCard = {
  id: string;
  label: string;
  value: string;
  status: RuntimeStatus;
  detail: string;
};

type RuntimeTelemetrySnapshot = {
  generatedAt: string;
  environment: "sandbox" | "production";
  verdict: "instrumented" | "needs_runtime_evidence";
  cards: TelemetryCard[];
  requiredTables: string[];
  requiredSignals: string[];
};

const tone: Record<RuntimeStatus, { border: string; bg: string }> = {
  verified: { border: "#0f766e", bg: "#f0fdfa" },
  unverified: { border: "#b45309", bg: "#fff7ed" },
  blocked: { border: "#991b1b", bg: "#fef2f2" }
};

export function RuntimeTelemetryPanel() {
  const [state, setState] = useState<{
    loading: boolean;
    error?: string;
    telemetry?: RuntimeTelemetrySnapshot;
  }>({ loading: true });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/runtime/telemetry", { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Telemetry endpoint failed with ${response.status}`);
        }

        const payload = (await response.json()) as { telemetry: RuntimeTelemetrySnapshot };

        if (cancelled) {
          return;
        }

        setState({ loading: false, telemetry: payload.telemetry });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          loading: false,
          error: error instanceof Error ? error.message : "Unknown telemetry error"
        });
      }
    }

    void load();

    const timer = window.setInterval(() => {
      void load();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18, display: "grid", gap: 16 }}>
      <div>
        <div style={{ color: "#0f766e", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
          Runtime Telemetry
        </div>
        <h2 style={{ margin: "8px 0 10px" }}>Autonomous Execution Observability</h2>
        <p style={{ margin: 0, color: "#5d5a53", lineHeight: 1.6 }}>
          This dashboard separates deployment readiness from real runtime evidence. Instrumented signals must be backed by queue metrics, heartbeat rows, execution traces, browser worker evidence, and rollback telemetry.
        </p>
      </div>

      {state.loading ? <div>Loading telemetry evidence...</div> : null}
      {state.error ? <div style={{ color: "#991b1b" }}>{state.error}</div> : null}

      {state.telemetry ? (
        <>
          <div style={{ color: "#57534e", fontSize: 13 }}>
            Environment: <strong>{state.telemetry.environment}</strong> · Verdict: <strong>{state.telemetry.verdict}</strong> · Last refresh: {new Date(state.telemetry.generatedAt).toLocaleString()}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {state.telemetry.cards.map((card) => (
              <article
                key={card.id}
                style={{
                  border: `1px solid ${tone[card.status].border}`,
                  background: tone[card.status].bg,
                  borderRadius: 8,
                  padding: 14
                }}
              >
                <div style={{ fontSize: 12, textTransform: "uppercase", color: "#57534e" }}>{card.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{card.value}</div>
                <div style={{ marginTop: 8, color: "#44403c", lineHeight: 1.5 }}>{card.detail}</div>
              </article>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            <article style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 14 }}>
              <h3 style={{ marginTop: 0 }}>Required Supabase Tables</h3>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                {state.telemetry.requiredTables.map((table) => (
                  <li key={table}>{table}</li>
                ))}
              </ul>
            </article>

            <article style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 14 }}>
              <h3 style={{ marginTop: 0 }}>Required Runtime Signals</h3>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                {state.telemetry.requiredSignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </article>
          </div>
        </>
      ) : null}
    </section>
  );
}
