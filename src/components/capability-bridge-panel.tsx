"use client";

import { useEffect, useState } from "react";

type State = {
  browser?: { staleWorkers?: number };
  bridge?: { openBlockers?: number };
};

export function CapabilityBridgePanel() {
  const [state, setState] = useState<State>({});
  useEffect(() => {
    async function load() {
      const [browser, bridge] = await Promise.all([
        fetch("/api/browser/status", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
        fetch("/api/bridge/status", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null))
      ]);
      setState({ browser: browser ?? undefined, bridge: bridge ?? undefined });
    }
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18 }}>
      <div style={{ color: "#0f766e", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Capability Bridge</div>
      <h2 style={{ margin: "8px 0 12px" }}>Cloud Worker and Queue Health</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <div style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 12 }}>Browser worker stale: <strong>{Number(state.browser?.staleWorkers ?? 0)}</strong></div>
        <div style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 12 }}>Bridge blockers: <strong>{Number(state.bridge?.openBlockers ?? 0)}</strong></div>
        <div style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 12 }}>Router mode: <strong>GPT-first</strong></div>
        <div style={{ border: "1px solid #d8ccba", borderRadius: 8, padding: 12 }}>Browser runtime: <strong>cloud workers</strong></div>
      </div>
    </section>
  );
}
