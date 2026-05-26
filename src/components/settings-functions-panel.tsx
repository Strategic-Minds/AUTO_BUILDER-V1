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
    <section style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, padding: 12 }}>
      <button onClick={() => setOpen((v) => !v)} style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "#0f121a", color: "var(--ink)" }}>
        {open ? "Hide Settings / Functions" : "Settings / Functions"}
      </button>
      {open ? (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
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
