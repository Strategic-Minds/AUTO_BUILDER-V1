import { buildReadinessSnapshot, readAllEdenReviewData, type ApprovalEvent, type ContentQueueItem, type PersonaAsset, type PromptBankItem, type SignalLog } from "@/lib/eden-skye/review-data";

export const dynamic = "force-dynamic";

type StatusTone = "ok" | "warn" | "block" | "neutral";

const toneStyles: Record<StatusTone, React.CSSProperties> = {
  ok: { borderColor: "rgba(74, 222, 128, 0.45)", color: "#bbf7d0", background: "rgba(22, 101, 52, 0.22)" },
  warn: { borderColor: "rgba(212, 175, 55, 0.55)", color: "#fde68a", background: "rgba(133, 77, 14, 0.2)" },
  block: { borderColor: "rgba(248, 113, 113, 0.45)", color: "#fecaca", background: "rgba(127, 29, 29, 0.22)" },
  neutral: { borderColor: "var(--line)", color: "var(--muted)", background: "rgba(255, 255, 255, 0.04)" }
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "24px",
  display: "grid",
  gap: 18,
  background: "#090b11",
  color: "var(--ink)"
};

const panelStyle: React.CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 8,
  background: "var(--panel)",
  padding: 16,
  overflow: "hidden"
};

const tableWrapStyle: React.CSSProperties = {
  overflowX: "auto",
  border: "1px solid var(--line)",
  borderRadius: 8
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 760,
  fontSize: 13
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  color: "var(--accent-2)",
  borderBottom: "1px solid var(--line)",
  background: "#0b0f16",
  fontWeight: 600
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid rgba(60, 67, 84, 0.55)",
  verticalAlign: "top",
  color: "var(--muted)"
};

function toneForStatus(status: string): StatusTone {
  if (["approved", "published", "sandbox_ready"].includes(status)) return "ok";
  if (["rejected", "blocked", "archived"].includes(status)) return "block";
  if (["needs_review", "draft", "scheduled", "medium", "high"].includes(status)) return "warn";
  return "neutral";
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: StatusTone }) {
  return (
    <span style={{ ...toneStyles[tone], display: "inline-flex", alignItems: "center", border: "1px solid", borderRadius: 999, padding: "3px 8px", fontSize: 12, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section style={panelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
          <p style={{ margin: "6px 0 0", color: "var(--muted)", maxWidth: 760 }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function AssetTable({ rows }: { rows: PersonaAsset[] }) {
  return (
    <div style={tableWrapStyle}>
      <table style={tableStyle}>
        <thead><tr><th style={thStyle}>Asset</th><th style={thStyle}>Role</th><th style={thStyle}>Type</th><th style={thStyle}>Status</th><th style={thStyle}>Source</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || row.asset_key}>
              <td style={tdStyle}>{row.asset_key}</td>
              <td style={tdStyle}>{row.asset_role}</td>
              <td style={tdStyle}>{row.asset_type}</td>
              <td style={tdStyle}><Badge tone={toneForStatus(row.status)}>{row.status}</Badge></td>
              <td style={tdStyle}>{row.public_url || row.source_path || "pending"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PromptTable({ rows }: { rows: PromptBankItem[] }) {
  return (
    <div style={tableWrapStyle}>
      <table style={tableStyle}>
        <thead><tr><th style={thStyle}>Prompt</th><th style={thStyle}>Tool</th><th style={thStyle}>Type</th><th style={thStyle}>Risk</th><th style={thStyle}>Status</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || `${row.tool_surface}-${row.prompt_name}`}>
              <td style={tdStyle}>{row.prompt_name}</td>
              <td style={tdStyle}>{row.tool_surface}</td>
              <td style={tdStyle}>{row.prompt_type}</td>
              <td style={tdStyle}><Badge tone={toneForStatus(row.risk_level)}>{row.risk_level}</Badge></td>
              <td style={tdStyle}><Badge tone={toneForStatus(row.status)}>{row.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QueueTable({ rows }: { rows: ContentQueueItem[] }) {
  return (
    <div style={tableWrapStyle}>
      <table style={tableStyle}>
        <thead><tr><th style={thStyle}>Title</th><th style={thStyle}>Platform</th><th style={thStyle}>Pillar</th><th style={thStyle}>Status</th><th style={thStyle}>Risk</th><th style={thStyle}>Schedule</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || `${row.platform}-${row.title}`}>
              <td style={tdStyle}>{row.title}</td>
              <td style={tdStyle}>{row.platform}</td>
              <td style={tdStyle}>{row.content_pillar}</td>
              <td style={tdStyle}><Badge tone={toneForStatus(row.status)}>{row.status}</Badge></td>
              <td style={tdStyle}><Badge tone={toneForStatus(row.risk_level)}>{row.risk_level}</Badge></td>
              <td style={tdStyle}>{row.scheduled_for || "not scheduled"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApprovalTable({ rows }: { rows: ApprovalEvent[] }) {
  return (
    <div style={tableWrapStyle}>
      <table style={tableStyle}>
        <thead><tr><th style={thStyle}>Action</th><th style={thStyle}>Target</th><th style={thStyle}>Status</th><th style={thStyle}>Risk</th><th style={thStyle}>Blocker</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || `${row.target_table}-${row.target_id}-${row.action_requested}`}>
              <td style={tdStyle}>{row.action_requested}</td>
              <td style={tdStyle}>{row.target_table}</td>
              <td style={tdStyle}><Badge tone={toneForStatus(row.status)}>{row.status}</Badge></td>
              <td style={tdStyle}>{row.risk_level}</td>
              <td style={tdStyle}>{row.blocker || "none"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SignalTable({ rows }: { rows: SignalLog[] }) {
  return (
    <div style={tableWrapStyle}>
      <table style={tableStyle}>
        <thead><tr><th style={thStyle}>Platform</th><th style={thStyle}>Measured</th><th style={thStyle}>Views</th><th style={thStyle}>Clicks</th><th style={thStyle}>Purchases</th><th style={thStyle}>Revenue</th></tr></thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td style={tdStyle} colSpan={6}>No signal logs yet. Sandbox launch data will appear here after approved tests.</td></tr>
          ) : rows.map((row) => (
            <tr key={row.id || `${row.platform}-${row.measured_at}`}>
              <td style={tdStyle}>{row.platform}</td>
              <td style={tdStyle}>{row.measured_at || "pending"}</td>
              <td style={tdStyle}>{row.views || 0}</td>
              <td style={tdStyle}>{row.clicks || 0}</td>
              <td style={tdStyle}>{row.purchases || 0}</td>
              <td style={tdStyle}>${((row.revenue_cents || 0) / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function EdenSkyeReviewPage() {
  const result = await readAllEdenReviewData();
  const readiness = buildReadinessSnapshot(result.data, result.source, result.blockers);

  return (
    <main style={pageStyle}>
      <section style={{ ...panelStyle, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "var(--accent)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Eden Skye</div>
            <h1 style={{ margin: "8px 0", fontSize: 28 }}>Queue Review Command Surface</h1>
            <p style={{ margin: 0, color: "var(--muted)", maxWidth: 840 }}>
              Read-only review lane for persona assets, prompt bank, content queue, approvals, and signal logs. Execution remains gated until sandbox credentials and approvals are present.
            </p>
          </div>
          <Badge tone={toneForStatus(readiness.status)}>{readiness.status}</Badge>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          {Object.entries(readiness.counts).map(([key, value]) => (
            <div key={key} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 12, background: "#0b0f16" }}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>{key}</div>
              <div style={{ fontSize: 22, marginTop: 6 }}>{value}</div>
            </div>
          ))}
        </div>
        {readiness.blockers.length > 0 && (
          <div style={{ border: "1px solid rgba(248, 113, 113, 0.42)", borderRadius: 8, padding: 12, background: "rgba(127, 29, 29, 0.18)" }}>
            <strong>Blocked before execution</strong>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "#fecaca" }}>
              {readiness.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
            </ul>
          </div>
        )}
      </section>

      <Section title="Persona Assets" subtitle="Identity, voice, visual, and source assets that must resolve before downstream scheduling.">
        <AssetTable rows={result.data.personaAssets} />
      </Section>

      <Section title="Prompt Bank" subtitle="Tool-specific prompts for Kling AI, HeyGen, Metricool, Shopify, and related generation surfaces.">
        <PromptTable rows={result.data.promptBank} />
      </Section>

      <Section title="Content Queue" subtitle="Draft and review-state queue items before any public scheduler, storefront, or avatar workflow runs.">
        <QueueTable rows={result.data.contentQueue} />
      </Section>

      <Section title="Approval Events" subtitle="Audit lane for approval requests, blockers, workarounds, and rollback paths.">
        <ApprovalTable rows={result.data.approvalEvents} />
      </Section>

      <Section title="Signal Logs" subtitle="Performance telemetry after approved sandbox tests and public launches.">
        <SignalTable rows={result.data.signalLogs} />
      </Section>
    </main>
  );
}
