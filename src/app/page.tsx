import { BlockerMonitorPanel } from "@/components/blocker-monitor-panel";
import { CapabilityBridgePanel } from "@/components/capability-bridge-panel";
import { RecursiveIntelligencePanel } from "@/components/recursive-intelligence-panel";
import { RuntimeTelemetryPanel } from "@/components/runtime-telemetry-panel";
import { audit, entryPrompts, factorySurfaces, repoRoles, workflow } from "@/lib/autobuilder";
import { connectorOps, factoryReadiness, fastPathRoutes, templateLibrary } from "@/lib/factory";

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "32px 20px 72px",
        display: "grid",
        gap: 24
      }}
    >
      <section
        style={{
          background: "rgba(255,250,242,0.92)",
          border: "1px solid #d8ccba",
          padding: 24,
          borderRadius: 8
        }}
      >
        <div style={{ color: "#0f766e", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>
          AUTO BUILDER GPT Project Folder
        </div>
        <h1 style={{ margin: "10px 0 8px", fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1 }}>
          Universal Bridge Brain
        </h1>
        <p style={{ margin: 0, maxWidth: 900, color: "#5d5a53", fontSize: 18, lineHeight: 1.5 }}>
          This repo is the orchestration brain for the full build-promote-validate loop. It now includes the
          one-hour build factory, capability test system, passive reverse-engineering scaffold, and live blocker
          autonomy monitor needed for high-frequency universal system creation.
        </p>
      </section>

      <BlockerMonitorPanel />
      <RuntimeTelemetryPanel />
      <RecursiveIntelligencePanel />
      <CapabilityBridgePanel />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16
        }}
      >
        {entryPrompts.map((prompt) => (
          <article
            key={prompt.id}
            style={{
              background: "#fffaf2",
              border: "1px solid #d8ccba",
              borderRadius: 8,
              padding: 18
            }}
          >
            <div style={{ fontSize: 12, color: "#b45309", textTransform: "uppercase", letterSpacing: 1 }}>
              Entry Prompt
            </div>
            <h2 style={{ margin: "8px 0 10px", fontSize: 24 }}>{prompt.title}</h2>
            <p style={{ margin: 0, color: "#5d5a53", lineHeight: 1.5 }}>{prompt.starter}</p>
          </article>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16
        }}
      >
        <article style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>Repo Roles</h3>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
            <li>AUTO_BUILDER: {repoRoles.source}</li>
            <li>SANDBOX: {repoRoles.sandbox}</li>
            <li>FRONTEND: {repoRoles.frontend}</li>
          </ul>
        </article>
        <article style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>Workflow</h3>
          <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
            {workflow.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
        <article style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>Audit</h3>
          <p style={{ margin: 0, color: "#5d5a53", lineHeight: 1.5 }}>
            Status: {audit.status}. Surfaces: {audit.surfaces.join(", ")}.
          </p>
        </article>
      </section>

      <section style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18 }}>
        <div style={{ color: "#0f766e", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
          One-Hour Build Factory
        </div>
        <h2 style={{ margin: "8px 0 12px" }}>Factory Readiness</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {[
            ["Readiness", factoryReadiness.factoryReadinessScore],
            ["Template Coverage", factoryReadiness.templateCoverage],
            ["Connector Readiness", factoryReadiness.connectorReadiness],
            ["Hardening Coverage", factoryReadiness.hardeningCoverage],
            ["One-Hour Eligibility", factoryReadiness.oneHourEligibility]
          ].map(([label, value]) => (
            <div key={String(label)} style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 12, color: "#b45309", textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{value}</div>
            </div>
          ))}
        </div>
        <p style={{ margin: "14px 0 0", color: "#5d5a53", lineHeight: 1.6 }}>{factoryReadiness.operatingStandard}</p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <article style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>Fast Routes</h3>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
            {fastPathRoutes.slice(0, 6).map((route) => (
              <li key={route.ideaType}>{route.ideaType}: {route.speedPath}</li>
            ))}
          </ul>
        </article>
        <article style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>Template Packs</h3>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
            {templateLibrary.map((template) => (
              <li key={template.id}>{template.name}: {template.status}</li>
            ))}
          </ul>
        </article>
        <article style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>Connector Ops</h3>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
            {connectorOps.slice(0, 6).map((connector) => (
              <li key={connector.connector}>{connector.connector}: {connector.readiness}</li>
            ))}
          </ul>
        </article>
      </section>

      <section style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18 }}>
        <div style={{ color: "#0f766e", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
          Passive Intelligence
        </div>
        <h2 style={{ margin: "8px 0 12px" }}>Capability Test and Reverse Engineering Surfaces</h2>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          {factorySurfaces.map((surface) => (
            <li key={surface}>{surface}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
