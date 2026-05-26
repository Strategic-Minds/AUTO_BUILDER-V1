"use client";

import { useState } from "react";
import { CapabilityBridgePanel } from "@/components/capability-bridge-panel";
import { NativeControlPanel } from "@/components/native-control-panel";
import { OperationsConsolePanel } from "@/components/operations-console-panel";
import { QueueTimelinePanel } from "@/components/queue-timeline-panel";
import { RecursiveIntelligencePanel } from "@/components/recursive-intelligence-panel";
import { RuntimeTelemetryPanel } from "@/components/runtime-telemetry-panel";

export function SettingsFunctionsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 50,
          padding: "10px 12px",
          borderRadius: 6,
          border: "1px solid var(--line)",
          background: "#0f121a",
          color: "var(--ink)"
        }}
      >
        Functions
      </button>
      {open ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "min(680px, 100vw)",
            height: "100vh",
            overflow: "auto",
            background: "#0b0f16",
            borderLeft: "1px solid var(--line)",
            padding: 16,
            zIndex: 45,
            display: "grid",
            gap: 12
          }}
        >
          <button onClick={() => setOpen(false)} style={{ justifySelf: "end", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--line)", background: "#0f121a", color: "var(--ink)" }}>
            Close
          </button>
          <section style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 12, background: "#0f121a", color: "var(--muted)" }}>
            <div style={{ color: "var(--accent)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Capabilities Matrix</div>
            <div>Implemented: queue manager, browser bridge, bridge status, recursive hardening, PWA shell, model/runtime controls.</div>
            <div>Simulated Equivalent: Codex-style settings and workflow controls in local shell UI.</div>
            <div>Platform-Native Required: proprietary Codex account controls, internal app review queues, protected plugin admin surfaces.</div>
          </section>
          <NativeControlPanel />
          <OperationsConsolePanel />
          <QueueTimelinePanel />
          <RuntimeTelemetryPanel />
          <RecursiveIntelligencePanel />
          <CapabilityBridgePanel />
        </div>
      ) : null}
    </section>
  );
}
