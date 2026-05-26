"use client";

import { useEffect, useMemo, useState } from "react";

type ActiveBlockerRecord = {
  id: string;
  title: string;
  summary: string;
  severity: "low" | "medium" | "high" | "critical";
  source: "readiness" | "connector" | "template";
  queue?: string;
  connector?: string;
  uiSurface: string;
  blockerCode?: string;
  approvalRequired?: boolean;
  riskClass?: string;
};

type RemediationResponse = {
  blockerCode: string;
  severity: string;
  status: string;
  summary: string;
  nextQueue: string;
  autoDispatch: boolean;
  hardGate?: string;
  actions: Array<{
    id: string;
    type: string;
    description: string;
    target: string;
    autoDispatch: boolean;
  }>;
};

type MonitorState = {
  blockers: ActiveBlockerRecord[];
  generatedAt?: string;
  loading: boolean;
  error?: string;
  remediationById: Record<string, RemediationResponse>;
};

const toneBySeverity: Record<string, { border: string; bg: string; label: string }> = {
  low: { border: "#94a3b8", bg: "#f8fafc", label: "Low" },
  medium: { border: "#d97706", bg: "#fff7ed", label: "Medium" },
  high: { border: "#dc2626", bg: "#fff1f2", label: "High" },
  critical: { border: "#7f1d1d", bg: "#fef2f2", label: "Critical" }
};

function describeLane(remediation: RemediationResponse) {
  if (remediation.hardGate || remediation.status === "release_hold") {
    return "Approval hold";
  }

  if (remediation.nextQueue === "connector_recovery_queue") {
    return "Connector recovery";
  }

  if (remediation.nextQueue === "workaround_queue") {
    return "Workaround lane";
  }

  if (remediation.nextQueue === "approval_queue") {
    return "Approval queue";
  }

  return "Auto remediation";
}

export function BlockerMonitorPanel() {
  const [state, setState] = useState<MonitorState>({
    blockers: [],
    loading: true,
    remediationById: {}
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((current) => ({ ...current, loading: true, error: undefined }));

      try {
        const response = await fetch("/api/factory/blocker-monitor", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Blocker monitor failed with ${response.status}`);
        }

        const data = (await response.json()) as {
          generatedAt: string;
          activeBlockers: ActiveBlockerRecord[];
        };

        if (cancelled) {
          return;
        }

        setState((current) => ({
          ...current,
          blockers: data.activeBlockers,
          generatedAt: data.generatedAt,
          loading: false,
          error: undefined
        }));

        const remediationEntries = await Promise.all(
          data.activeBlockers.map(async (blocker) => {
            const remediationResponse = await fetch("/api/factory/blocker-remediation", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                blockerCode: blocker.blockerCode,
                queue: blocker.queue,
                connector: blocker.connector,
                uiSurface: blocker.uiSurface,
                summary: blocker.summary,
                approvalRequired: blocker.approvalRequired,
                riskClass: blocker.riskClass
              })
            });

            if (!remediationResponse.ok) {
              throw new Error(`Remediation failed for ${blocker.id}`);
            }

            const payload = (await remediationResponse.json()) as { remediation: RemediationResponse };
            return [blocker.id, payload.remediation] as const;
          })
        );

        if (cancelled) {
          return;
        }

        setState((current) => ({
          ...current,
          loading: false,
          remediationById: Object.fromEntries(remediationEntries)
        }));
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown blocker monitor error"
        }));
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

  const summary = useMemo(() => {
    return {
      active: state.blockers.length,
      remediated: Object.keys(state.remediationById).length,
      hardGates: Object.values(state.remediationById).filter((item) => item.hardGate).length
    };
  }, [state.blockers.length, state.remediationById]);

  return (
    <section style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18, display: "grid", gap: 16 }}>
      <div>
        <div style={{ color: "#0f766e", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
          Autonomous Blocker Monitor
        </div>
        <h2 style={{ margin: "8px 0 10px" }}>Live Blockers and Auto-Fix Outcomes</h2>
        <p style={{ margin: 0, color: "#5d5a53", lineHeight: 1.6 }}>
          This panel lists active blockers, auto-posts each one into the remediation engine, and shows the next queue, hard gate, and fallback outcome without waiting for manual operator intervention.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {[
          ["Active blockers", summary.active],
          ["Auto-remediated", summary.remediated],
          ["Hard gates", summary.hardGates]
        ].map(([label, value]) => (
          <div key={String(label)} style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, color: "#b45309", textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{value}</div>
          </div>
        ))}
      </div>

      {state.generatedAt ? (
        <div style={{ color: "#78716c", fontSize: 13 }}>Last refresh: {new Date(state.generatedAt).toLocaleString()}</div>
      ) : null}

      {state.loading ? <div style={{ color: "#5d5a53" }}>Refreshing blockers and auto-fix outcomes...</div> : null}
      {state.error ? <div style={{ color: "#991b1b" }}>Monitor error: {state.error}</div> : null}

      {!state.loading && !state.error && state.blockers.length === 0 ? (
        <div style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 16, background: "#f8fafc", color: "#334155" }}>
          No active blockers are currently being surfaced by the monitor.
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 12 }}>
        {state.blockers.map((blocker) => {
          const remediation = state.remediationById[blocker.id];
          const tone = toneBySeverity[blocker.severity] ?? toneBySeverity.medium;

          return (
            <article
              key={blocker.id}
              style={{
                background: tone.bg,
                border: `1px solid ${tone.border}`,
                borderRadius: 8,
                padding: 16,
                display: "grid",
                gap: 10
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 20 }}>{blocker.title}</h3>
                  <div style={{ marginTop: 6, color: "#5d5a53", lineHeight: 1.5 }}>{blocker.summary}</div>
                </div>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: tone.border }}>{tone.label}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                <div style={{ border: "1px solid #e7dcc8", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", color: "#b45309" }}>Source</div>
                  <div style={{ marginTop: 6 }}>{blocker.source}</div>
                </div>
                <div style={{ border: "1px solid #e7dcc8", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", color: "#b45309" }}>Queue</div>
                  <div style={{ marginTop: 6 }}>{blocker.queue ?? "runtime"}</div>
                </div>
                <div style={{ border: "1px solid #e7dcc8", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", color: "#b45309" }}>Connector</div>
                  <div style={{ marginTop: 6 }}>{blocker.connector ?? "none"}</div>
                </div>
              </div>

              {remediation ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                    <div style={{ border: "1px solid #e7dcc8", borderRadius: 8, padding: 12, background: "#fff" }}>
                      <div style={{ fontSize: 12, textTransform: "uppercase", color: "#0f766e" }}>Next Queue</div>
                      <div style={{ marginTop: 6 }}>{remediation.nextQueue}</div>
                    </div>
                    <div style={{ border: "1px solid #e7dcc8", borderRadius: 8, padding: 12, background: "#fff" }}>
                      <div style={{ fontSize: 12, textTransform: "uppercase", color: "#0f766e" }}>Outcome</div>
                      <div style={{ marginTop: 6 }}>{remediation.status}</div>
                    </div>
                    <div style={{ border: "1px solid #e7dcc8", borderRadius: 8, padding: 12, background: "#fff" }}>
                      <div style={{ fontSize: 12, textTransform: "uppercase", color: "#0f766e" }}>Auto Dispatch</div>
                      <div style={{ marginTop: 6 }}>{remediation.autoDispatch ? "enabled" : "held"}</div>
                    </div>
                    <div style={{ border: "1px solid #e7dcc8", borderRadius: 8, padding: 12, background: "#fff" }}>
                      <div style={{ fontSize: 12, textTransform: "uppercase", color: "#0f766e" }}>Recovery Mode</div>
                      <div style={{ marginTop: 6 }}>{describeLane(remediation)}</div>
                    </div>
                  </div>

                  <div style={{ border: "1px solid #e7dcc8", borderRadius: 8, padding: 12, background: "#fff" }}>
                    <div style={{ fontSize: 12, textTransform: "uppercase", color: "#0f766e" }}>Remediation Summary</div>
                    <div style={{ marginTop: 6, color: "#44403c", lineHeight: 1.5 }}>{remediation.summary}</div>
                  </div>

                  <div style={{ border: "1px solid #e7dcc8", borderRadius: 8, padding: 12, background: "#fff" }}>
                    <div style={{ fontSize: 12, textTransform: "uppercase", color: "#0f766e" }}>Action Path</div>
                    <ul style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
                      {remediation.actions.map((action) => (
                        <li key={action.id}>
                          <strong>{action.type}</strong> to {action.target}
                          <div style={{ color: "#57534e" }}>{action.description}</div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {remediation.hardGate ? (
                    <div style={{ border: "1px solid #7f1d1d", borderRadius: 8, padding: 12, background: "#fff1f2", color: "#7f1d1d" }}>
                      Hard gate: {remediation.hardGate}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div style={{ color: "#5d5a53" }}>Waiting for remediation response...</div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
