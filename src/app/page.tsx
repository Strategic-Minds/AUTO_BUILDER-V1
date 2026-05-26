import { BlockerMonitorPanel } from "@/components/blocker-monitor-panel";
import { CapabilityBridgePanel } from "@/components/capability-bridge-panel";
import { OperationsConsolePanel } from "@/components/operations-console-panel";
import { RecursiveIntelligencePanel } from "@/components/recursive-intelligence-panel";
import { RuntimeTelemetryPanel } from "@/components/runtime-telemetry-panel";

export default function HomePage() {
  return (
    <main className="shell-grid">
      <aside className="shell-left" style={{ borderRight: "1px solid var(--line)", padding: 16, background: "#0b0f16" }}>
        <div style={{ color: "var(--accent)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>AUTO BUILDER</div>
        <h1 style={{ margin: "8px 0 16px", fontSize: 22, color: "var(--ink)" }}>Native Shell</h1>
        <nav style={{ display: "grid", gap: 8, color: "var(--muted)", fontSize: 14 }}>
          <div>Chat</div>
          <div>Queue</div>
          <div>Capabilities</div>
          <div>Approvals</div>
          <div>Workers</div>
          <div>Finance</div>
        </nav>
      </aside>

      <section className="shell-main" style={{ padding: 16, display: "grid", gap: 14 }}>
        <section style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, padding: 16 }}>
          <div style={{ color: "var(--accent-2)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Conversation</div>
          <h2 style={{ margin: "8px 0", color: "var(--ink)" }}>AUTO BUILDER Command Surface</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            GPT remains the orchestration brain. Cloud workers and bridges execute recurring operations. Codex is reserved for implementation runtime tasks.
          </p>
        </section>
        <OperationsConsolePanel />
        <BlockerMonitorPanel />
        <RuntimeTelemetryPanel />
        <RecursiveIntelligencePanel />
      </section>

      <section className="shell-right" style={{ borderLeft: "1px solid var(--line)", padding: 16, background: "#0b0f16", display: "grid", gap: 14 }}>
        <CapabilityBridgePanel />
        <section style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, padding: 12 }}>
          <div style={{ color: "var(--accent)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Mode</div>
          <div style={{ marginTop: 6, color: "var(--ink)" }}>Dark Primary · Light Optional</div>
        </section>
      </section>
    </main>
  );
}
