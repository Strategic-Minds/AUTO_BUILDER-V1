import { buildModelRegistrySeed, buildQueueSeed, edenCohorts, edenModules, edenProtectedActions, getConnectorReadiness } from "@/lib/eden-skye-os";

const card = { background: "#111722", border: "1px solid #263241", borderRadius: 8, padding: 16 };
const muted = { color: "#9aa8ba", lineHeight: 1.45, margin: 0 };

export default function EdenSkyeAdminPage() {
  const registry = buildModelRegistrySeed();
  const queue = buildQueueSeed();
  const connectors = getConnectorReadiness();

  return (
    <main style={{ minHeight: "100vh", background: "#090b11", color: "#eef4ff", padding: 24 }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 16 }}>
        <header style={{ display: "grid", gap: 8 }}>
          <div style={{ color: "#7dd3fc", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Eden Skye Studios</div>
          <h1 style={{ margin: 0, fontSize: 30 }}>AUTO SOCIAL Command Center</h1>
          <p style={muted}>Draft-first admin surface for model registry, media library, approvals, queues, cron validation, connector readiness, memory, quarantine, and A/B tests.</p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
          <Tile label="Accounts" value={String(registry.length)} />
          <Tile label="Cohorts" value={String(edenCohorts.length)} />
          <Tile label="Queue" value={String(queue.length)} />
          <Tile label="Modules" value={String(edenModules.length)} />
          <Tile label="Live Actions" value="Locked" danger />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <Panel title="Registry" body="160 target model/faceless accounts seeded across 8 cohorts, ready for Supabase persistence and media linking." />
          <Panel title="Media Library" body="Image/video records, placeholder assets, prompt queues, QA states, quarantine reasons, and approval gates." />
          <Panel title="Publishing Queue" body="Metricool/Xyla-ready draft schedule records. Live publish remains locked until owner approval." />
          <Panel title="Engagement Desk" body="Comments, replies, and DMs are drafted and classified, never sent automatically." />
          <Panel title="A/B Testing Lab" body="Website, model, content, hook, offer, and membership tests with winner/kill rules." />
          <Panel title="Agent Ops" body="Five-minute validation, receipts, recovery queue, memory, self-reflection, and connector health." />
        </section>

        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Current Queue</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {queue.map((item) => (
              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 12, borderTop: "1px solid #263241", paddingTop: 10 }}>
                <div><strong>{item.target}</strong><p style={muted}>{item.lane}</p></div>
                <span>{item.gate}</span>
                <span>{item.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <article style={card}><h2>Connectors</h2><p style={muted}>{connectors.map((c) => `${c.connector}: ${c.ready ? "ready" : "blocked"}`).join(" | ")}</p></article>
          <article style={card}><h2>Protected</h2><p style={muted}>{edenProtectedActions.join(", ")}</p></article>
        </section>
      </section>
    </main>
  );
}

function Tile({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return <div style={card}><div style={{ color: "#7dd3fc", fontSize: 12 }}>{label}</div><div style={{ fontSize: 24, color: danger ? "#fda4af" : "#eef4ff" }}>{value}</div></div>;
}

function Panel({ title, body }: { title: string; body: string }) {
  return <article style={card}><h2 style={{ marginTop: 0 }}>{title}</h2><p style={muted}>{body}</p></article>;
}
