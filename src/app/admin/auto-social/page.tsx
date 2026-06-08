import { buildInitialQueue, cohortTargets, enterpriseModules, modelRegistrySeed, protectedLiveActions } from "@/lib/auto-social";
import { getWorkflowReadiness } from "@/workflows/auto-social/eden-skye-enterprise-workflow";

const panels = [
  "Registry",
  "Media Library",
  "Calendar",
  "Engagement Desk",
  "A/B Testing Lab",
  "Agent Ops"
];

export default function AutoSocialAdminPage() {
  const queue = buildInitialQueue();
  const workflow = getWorkflowReadiness();

  return (
    <main style={{ minHeight: "100vh", background: "#090b11", color: "#eef4ff", padding: 24 }}>
      <section style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 18 }}>
        <header style={{ display: "grid", gap: 8 }}>
          <div style={{ color: "#7dd3fc", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>AUTO SOCIAL / Eden Skye</div>
          <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.15 }}>Enterprise Digital Media Command Center</h1>
          <p style={{ margin: 0, maxWidth: 820, color: "#9aa8ba" }}>
            Sandbox-first operating surface for model registry, draft content, media QA, scheduling, engagement, experiments, agents, memory, and receipts.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <StatusTile label="Cohorts" value={String(Object.keys(cohortTargets).length)} />
          <StatusTile label="Target Accounts" value="160" />
          <StatusTile label="Queue Items" value={String(queue.length)} />
          <StatusTile label="Workflow Steps" value={String(workflow.steps.length)} />
          <StatusTile label="Live Actions" value="Locked" tone="danger" />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {panels.map((panel) => (
            <article key={panel} style={cardStyle}>
              <div style={eyebrowStyle}>{panel}</div>
              <h2 style={cardTitleStyle}>{panel === "Registry" ? "Model/account cohorts" : panel}</h2>
              <p style={bodyStyle}>{panelCopy(panel)}</p>
            </article>
          ))}
        </section>

        <section style={wideCardStyle}>
          <div style={eyebrowStyle}>Draft Queue</div>
          <div style={{ display: "grid", gap: 10 }}>
            {queue.map((item) => (
              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 12, alignItems: "center", borderTop: "1px solid #263241", paddingTop: 10 }}>
                <div>
                  <strong>{item.target}</strong>
                  <div style={bodyStyle}>{item.notes}</div>
                </div>
                <span>{item.gate}</span>
                <span>{item.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          <article style={cardStyle}>
            <div style={eyebrowStyle}>Enterprise Modules</div>
            <p style={bodyStyle}>{enterpriseModules.join(", ")}</p>
          </article>
          <article style={cardStyle}>
            <div style={eyebrowStyle}>Protected Live Actions</div>
            <p style={bodyStyle}>{protectedLiveActions.join(", ")}</p>
          </article>
          <article style={cardStyle}>
            <div style={eyebrowStyle}>Registry Seed</div>
            <p style={bodyStyle}>{modelRegistrySeed.map((model) => model.name).join("; ")}</p>
          </article>
        </section>
      </section>
    </main>
  );
}

function StatusTile({ label, value, tone = "normal" }: { label: string; value: string; tone?: "normal" | "danger" }) {
  return (
    <div style={{ ...cardStyle, padding: 14 }}>
      <div style={eyebrowStyle}>{label}</div>
      <div style={{ fontSize: 24, color: tone === "danger" ? "#fda4af" : "#eef4ff" }}>{value}</div>
    </div>
  );
}

function panelCopy(panel: string) {
  switch (panel) {
    case "Registry":
      return "160-account cohort target across 18-25, 25-50, 50+, international, and faceless lanes.";
    case "Media Library":
      return "Images, videos, prompts, QA status, quarantine reason, source references, and approval state.";
    case "Calendar":
      return "Draft-only publishing queue with Metricool/Xyla readiness and locked live schedule gates.";
    case "Engagement Desk":
      return "Inbound comments, replies, and messages classified into draft responses with approval gates.";
    case "A/B Testing Lab":
      return "Website, model, content, and engagement tests with metrics, winner rules, and kill/scale states.";
    default:
      return "Vercel Agent validation, five-minute heartbeat, workflow receipts, self-reflection, and repair queue.";
  }
}

const cardStyle = {
  background: "#111722",
  border: "1px solid #263241",
  borderRadius: 8,
  padding: 16
};

const wideCardStyle = {
  ...cardStyle,
  display: "grid",
  gap: 12
};

const eyebrowStyle = {
  color: "#7dd3fc",
  fontSize: 12,
  textTransform: "uppercase" as const,
  letterSpacing: 1,
  marginBottom: 8
};

const cardTitleStyle = {
  margin: "0 0 8px",
  fontSize: 18
};

const bodyStyle = {
  margin: 0,
  color: "#9aa8ba",
  lineHeight: 1.45
};
