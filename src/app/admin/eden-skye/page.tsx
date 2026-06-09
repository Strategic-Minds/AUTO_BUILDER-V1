import { buildEdenAdminControlSnapshot } from "@/lib/eden-skye-admin";

const shell = { minHeight: "100vh", background: "#090b11", color: "#eef4ff", padding: 24 };
const wrap = { maxWidth: 1280, margin: "0 auto", display: "grid", gap: 18 };
const panel = { background: "#111722", border: "1px solid #263241", borderRadius: 8, padding: 16 };
const quietPanel = { background: "#0c111a", border: "1px solid #1d2735", borderRadius: 8, padding: 14 };
const muted = { color: "#9aa8ba", lineHeight: 1.45, margin: 0 };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" };

type Snapshot = Awaited<ReturnType<typeof buildEdenAdminControlSnapshot>>;

export default async function EdenSkyeAdminPage() {
  const snapshot = await buildEdenAdminControlSnapshot();
  const readyConnectors = snapshot.connectors.filter((connector) => connector.ready).length;
  const blockedConnectors = snapshot.connectors.length - readyConnectors;

  return (
    <main style={shell}>
      <section style={wrap}>
        <header style={{ display: "grid", gap: 8 }}>
          <div style={{ color: "#7dd3fc", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Eden Skye Studios</div>
          <h1 style={{ margin: 0, fontSize: 30 }}>AUTO SOCIAL Command Center</h1>
          <p style={muted}>Live preview control plane for registry, media queue, approvals, website backend, Eden's Closet, workflow supervisor, receipts, and agent ops.</p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          <Metric label="Models" value={snapshot.counts.models} />
          <Metric label="Image Queue" value={snapshot.counts.queuedImageAssets} tone="warn" />
          <Metric label="Receipts" value={snapshot.counts.receipts} />
          <Metric label="Agent Runs" value={snapshot.counts.agentRuns} />
          <Metric label="Connectors" value={`${readyConnectors}/${snapshot.connectors.length}`} tone={blockedConnectors ? "warn" : "good"} />
          <Metric label="Live Actions" value="Locked" tone="danger" />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(300px, 0.75fr)", gap: 12 }}>
          <article style={panel}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: 0 }}>Automation Lanes</h2>
                <p style={{ ...muted, marginTop: 6 }}>Safe lanes can run in preview/draft mode. Approval lanes stay locked until owner approval receipts exist.</p>
              </div>
              <StatusPill label={snapshot.productionActionAllowed ? "production enabled" : "production locked"} tone="danger" />
            </div>
            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              {snapshot.automationLanes.map((lane) => (
                <div key={lane.lane} style={{ display: "grid", gridTemplateColumns: "minmax(160px, 0.8fr) minmax(120px, 0.5fr) minmax(0, 1.2fr)", gap: 12, alignItems: "start", borderTop: "1px solid #263241", paddingTop: 10 }}>
                  <div><strong>{lane.lane}</strong><p style={{ ...muted, ...mono, fontSize: 12 }}>{lane.route}</p></div>
                  <StatusPill label={lane.state} tone={lane.state.includes("ready") || lane.state === "queued" ? "good" : lane.state.includes("gated") ? "warn" : "neutral"} />
                  <p style={muted}>{lane.next}</p>
                </div>
              ))}
            </div>
          </article>

          <article style={panel}>
            <h2 style={{ marginTop: 0 }}>Approval Locks</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {snapshot.approvalLocks.map((lock) => (
                <div key={lock.lane} style={quietPanel}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <strong>{lock.lane}</strong>
                    <StatusPill label={lock.status} tone="warn" />
                  </div>
                  <p style={{ ...muted, marginTop: 8 }}>{lock.reason}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <CountPanel title="Model Registry" counts={snapshot.modelCoverage.byCohort} footer={`${snapshot.counts.models} total seeded profiles`} />
          <CountPanel title="Media Library" counts={snapshot.mediaLibrary.byType} footer={`${snapshot.mediaLibrary.needsGenerationOrUpload} assets need generation or upload`} />
          <CountPanel title="Publishing Queue" counts={snapshot.publishingQueue.byApprovalState} footer="Draft schedule rows feed Metricool/Xyla after approval." />
          <CountPanel title="Engagement Desk" counts={snapshot.engagementDesk.byOutboundState} footer="Replies and DMs stay draft-only until approved." />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          <article style={panel}>
            <h2 style={{ marginTop: 0 }}>Website Backend</h2>
            <p style={muted}>The website can now read from the operating snapshot, model registry, media queue, approval locks, receipts, and workflow lanes. Next build layer is public site mockup plus admin actions.</p>
          </article>
          <article style={panel}>
            <h2 style={{ marginTop: 0 }}>Eden's Closet</h2>
            <p style={muted}>Membership, payment, access tiers, age-gate policy, and content-release queues are marked as approval-gated design work. No paid activation or adult content release is enabled here.</p>
          </article>
          <article style={panel}>
            <h2 style={{ marginTop: 0 }}>Self-Healing Loop</h2>
            <p style={muted}>The five-minute supervisor, validation, heal, quarantine, memory, and receipt lanes are visible and ready for preview-only automation evidence.</p>
          </article>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12 }}>
          <RecentList title="Recent Agent Runs" rows={snapshot.operations.agentRuns} primary="agent_name" secondary="status" />
          <RecentList title="Recent Receipts" rows={snapshot.operations.receipts} primary="action" secondary="gate" />
        </section>

        <section style={panel}>
          <h2 style={{ marginTop: 0 }}>Protected Actions</h2>
          <p style={muted}>{snapshot.protectedActions.join(", ")}</p>
          <p style={{ ...muted, ...mono, marginTop: 10, fontSize: 12 }}>Snapshot generated: {snapshot.generatedAt}</p>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value, tone = "neutral" }: { label: string; value: string | number; tone?: "neutral" | "good" | "warn" | "danger" }) {
  const color = tone === "good" ? "#86efac" : tone === "warn" ? "#fde68a" : tone === "danger" ? "#fda4af" : "#eef4ff";
  return <div style={panel}><div style={{ color: "#7dd3fc", fontSize: 12 }}>{label}</div><div style={{ ...mono, fontSize: 24, color }}>{value}</div></div>;
}

function StatusPill({ label, tone }: { label: string; tone: "neutral" | "good" | "warn" | "danger" }) {
  const colors = {
    neutral: ["#9aa8ba", "#172033"],
    good: ["#86efac", "#10251a"],
    warn: ["#fde68a", "#2a230f"],
    danger: ["#fda4af", "#2b1118"]
  } as const;
  const [color, background] = colors[tone];
  return <span style={{ ...mono, color, background, border: `1px solid ${color}33`, borderRadius: 999, padding: "4px 8px", fontSize: 12, width: "fit-content" }}>{label}</span>;
}

function CountPanel({ title, counts, footer }: { title: string; counts: Record<string, number>; footer: string }) {
  const entries = Object.entries(counts);
  return (
    <article style={panel}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {entries.length ? entries.map(([key, value]) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderTop: "1px solid #263241", paddingTop: 8 }}>
            <span>{key}</span><strong style={mono}>{value}</strong>
          </div>
        )) : <p style={muted}>No rows yet.</p>}
      </div>
      <p style={{ ...muted, marginTop: 10 }}>{footer}</p>
    </article>
  );
}

function RecentList({ title, rows, primary, secondary }: { title: string; rows: Snapshot["operations"]["agentRuns"]; primary: string; secondary: string }) {
  return (
    <article style={panel}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {rows.slice(0, 8).map((row, index) => (
          <div key={`${title}-${index}`} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 130px", gap: 12, borderTop: "1px solid #263241", paddingTop: 8 }}>
            <span>{String(row[primary] || "unknown")}</span>
            <span style={{ ...muted, ...mono }}>{String(row[secondary] || "unknown")}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
