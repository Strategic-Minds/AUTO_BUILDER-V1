"use client";

import { useEffect, useState } from "react";

const MODEL_OPTIONS = ["gpt-autobuilder-default", "gpt-5", "gpt-5-codex-medium", "vercel-ai-gateway"];

export function NativeControlPanel() {
  const [model, setModel] = useState("gpt-autobuilder-default");
  const [runtime, setRuntime] = useState("cloud-primary");
  const [gatewayEnabled, setGatewayEnabled] = useState(true);

  useEffect(() => {
    const savedModel = localStorage.getItem("ab_model");
    const savedRuntime = localStorage.getItem("ab_runtime");
    const savedGateway = localStorage.getItem("ab_gateway");
    if (savedModel) setModel(savedModel);
    if (savedRuntime) setRuntime(savedRuntime);
    if (savedGateway) setGatewayEnabled(savedGateway === "true");
  }, []);

  function persist(nextModel: string, nextRuntime: string, nextGateway: boolean) {
    setModel(nextModel);
    setRuntime(nextRuntime);
    setGatewayEnabled(nextGateway);
    localStorage.setItem("ab_model", nextModel);
    localStorage.setItem("ab_runtime", nextRuntime);
    localStorage.setItem("ab_gateway", String(nextGateway));
  }

  return (
    <section style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, padding: 18 }}>
      <div style={{ color: "var(--accent)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>System Controls</div>
      <h2 style={{ margin: "8px 0 12px", color: "var(--ink)" }}>Native Capability Settings</h2>
      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ color: "var(--muted)" }}>Default Model</label>
        <select value={model} onChange={(e) => persist(e.target.value, runtime, gatewayEnabled)} style={{ padding: 10, borderRadius: 6, border: "1px solid var(--line)", background: "#0f121a", color: "var(--ink)" }}>
          {MODEL_OPTIONS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <label style={{ color: "var(--muted)" }}>Runtime Mode</label>
        <select value={runtime} onChange={(e) => persist(model, e.target.value, gatewayEnabled)} style={{ padding: 10, borderRadius: 6, border: "1px solid var(--line)", background: "#0f121a", color: "var(--ink)" }}>
          <option value="cloud-primary">cloud-primary</option>
          <option value="local-secondary">local-secondary</option>
        </select>

        <label style={{ color: "var(--muted)" }}>Vercel AI Gateway</label>
        <button onClick={() => persist(model, runtime, !gatewayEnabled)} style={{ padding: 10, borderRadius: 6, border: "1px solid var(--line)", background: "#0f121a", color: "var(--ink)" }}>
          {gatewayEnabled ? "Enabled" : "Disabled"}
        </button>

        <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 10, background: "#0f121a", color: "var(--muted)", fontSize: 13 }}>
          GPT AUTO BUILDER is default orchestration brain. Codex remains implementation/runtime specialist.
        </div>
      </div>
    </section>
  );
}
