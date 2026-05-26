"use client";

import { useEffect, useState } from "react";

export function OperationsConsolePanel() {
  const [result, setResult] = useState<string>("No action run yet.");
  const [idea, setIdea] = useState("Build a lead generation system for roofing services.");
  const [projectName, setProjectName] = useState("AUTO BUILDER");
  const [pluginName, setPluginName] = useState("shopify");
  const [searchTerm, setSearchTerm] = useState("high-converting lead generation systems");
  const [goalRevenue, setGoalRevenue] = useState("1000000");
  const [workflowType, setWorkflowType] = useState("system_build");
  const [cron, setCron] = useState("*/5 * * * *");
  const [live, setLive] = useState<string>("Live stream idle.");

  async function run(label: string, path: string, method: "GET" | "POST", body?: Record<string, unknown>) {
    const response = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    const text = await response.text();
    setResult(`${label} -> ${response.status}\n${text}`);
  }

  async function queueBatch() {
    const common = {
      source: "dashboard_manual",
      approved: true,
      priority: "high"
    };
    const actions = [
      fetch("/api/capability/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: "research_benchmark_reverse_engineering",
          taskPrompt: `Benchmark top 3 systems for: ${idea}.`,
          riskScore: 40,
          expectedProfitScore: 80
        })
      }),
      fetch("/api/bridge/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...common,
          taskType: "build_validation",
          taskPrompt: `Create ${workflowType} for project ${projectName}. End goal: ${idea}. Financial goal: ${goalRevenue}.`
        })
      }),
      fetch("/api/browser/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: "validate",
          taskPrompt: `Research and capture top benchmark systems for ${idea}`,
          target: "https://example.com",
          approved: true,
          priority: "high"
        })
      })
    ];
    const responses = await Promise.all(actions);
    const payloads = await Promise.all(responses.map(async (r) => `${r.status}: ${await r.text()}`));
    await fetch("/api/bridge/queue/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queueName: "bridge_tasks", action: "schedule", details: { cron } })
    });
    setResult(`Batch Queue Complete\nCron: ${cron}\n${payloads.join("\n\n")}`);
  }

  useEffect(() => {
    async function poll() {
      const [bridge, browser, runtime] = await Promise.all([
        fetch("/api/bridge/status", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
        fetch("/api/browser/status", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
        fetch("/api/runtime/health", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null))
      ]);
      setLive(
        `Bridge blockers: ${Number(bridge?.openBlockers ?? 0)} | Browser tasks: ${Number(browser?.tasks?.rows?.length ?? 0)} | Runtime: ${String(runtime?.status ?? "unknown")}`
      );
    }
    void poll();
    const timer = window.setInterval(() => void poll(), 20000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8, padding: 18 }}>
      <div style={{ color: "var(--accent)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Manual Operations Console</div>
      <h2 style={{ margin: "8px 0 12px", color: "var(--ink)" }}>Run Triggers Without Chat</h2>
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project Name" style={{ padding: 10, borderRadius: 6, border: "1px solid var(--line)", background: "#0f121a", color: "var(--ink)" }} />
          <input value={workflowType} onChange={(e) => setWorkflowType(e.target.value)} placeholder="Build Type (system/agent/workflow)" style={{ padding: 10, borderRadius: 6, border: "1px solid var(--line)", background: "#0f121a", color: "var(--ink)" }} />
          <input value={goalRevenue} onChange={(e) => setGoalRevenue(e.target.value)} placeholder="Financial Goal" style={{ padding: 10, borderRadius: 6, border: "1px solid var(--line)", background: "#0f121a", color: "var(--ink)" }} />
          <input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="End Goal / Prompt" style={{ padding: 10, borderRadius: 6, border: "1px solid var(--line)", background: "#0f121a", color: "var(--ink)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
          <input value={pluginName} onChange={(e) => setPluginName(e.target.value)} placeholder="Plugin Name" style={{ padding: 10, borderRadius: 6, border: "1px solid var(--line)", background: "#0f121a", color: "var(--ink)" }} />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search Query" style={{ padding: 10, borderRadius: 6, border: "1px solid var(--line)", background: "#0f121a", color: "var(--ink)" }} />
          <select value={cron} onChange={(e) => setCron(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid var(--line)", background: "#0f121a", color: "var(--ink)" }}>
            <option value="*/5 * * * *">Every 5 minutes</option>
            <option value="*/15 * * * *">Every 15 minutes</option>
            <option value="0 * * * *">Hourly</option>
            <option value="0 */6 * * *">Every 6 hours</option>
            <option value="0 0 * * *">Daily</option>
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          <button onClick={() => setResult(`New Chat Ready\nProject: ${projectName}\nGoal: ${idea}`)}>New Chat</button>
          <button onClick={() => setResult(`Project Selected\n${projectName}`)}>Project</button>
          <button onClick={() => setResult(`Plugin Selected\n${pluginName}`)}>Plugin</button>
          <button onClick={() => setResult(`Search Prepared\n${searchTerm}`)}>Search</button>
          <button onClick={() => void queueBatch()}>Create Workflow</button>
          <button onClick={() => void run("Automation Trigger", "/api/cron/recursive-control", "GET")}>Automation</button>
          <button onClick={() => void run("Queue Pause", "/api/bridge/queue/manage", "POST", { queueName: "bridge_tasks", action: "pause" })}>Pause Queue</button>
          <button onClick={() => void run("Queue Resume", "/api/bridge/queue/manage", "POST", { queueName: "bridge_tasks", action: "resume" })}>Resume Queue</button>
          <button onClick={() => void run("Queue Retry", "/api/bridge/queue/manage", "POST", { queueName: "bridge_tasks", action: "retry" })}>Retry Queue</button>
          <button onClick={() => void run("Queue Cancel", "/api/bridge/queue/manage", "POST", { queueName: "bridge_tasks", action: "cancel" })}>Cancel Queue</button>
          <button onClick={() => void run("Queue Reorder", "/api/bridge/queue/manage", "POST", { queueName: "bridge_tasks", action: "reorder" })}>Reorder Queue</button>
          <button onClick={() => void run("Route Capability", "/api/capability/router", "POST", { taskType: "lead_research_browser_validation", taskPrompt: idea, riskScore: 40, expectedProfitScore: 75 })}>Route Capability</button>
          <button onClick={() => void run("Queue Browser Task", "/api/browser/task", "POST", { taskType: "validate", taskPrompt: idea, target: "https://example.com", priority: "high", approved: true })}>Queue Browser Task</button>
          <button onClick={() => void run("Claim Browser Task", "/api/browser/claim?worker=github_actions_playwright", "GET")}>Claim Browser Task</button>
          <button onClick={() => void run("Run Recursive Loop", "/api/cron/recursive-control", "GET")}>Run Recursive Loop</button>
          <button onClick={() => void run("Bridge Status", "/api/bridge/status", "GET")}>Bridge Status</button>
          <button onClick={() => void run("Browser Status", "/api/browser/status", "GET")}>Browser Status</button>
        </div>
        <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 10, background: "#0f121a", color: "var(--muted)" }}>
          Live Results: {live}
        </div>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", background: "#0b0e15", color: "#f3f5f8", border: "1px solid var(--line)", borderRadius: 8, padding: 12, maxHeight: 280, overflow: "auto" }}>{result}</pre>
      </div>
    </section>
  );
}
