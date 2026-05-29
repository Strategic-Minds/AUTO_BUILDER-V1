import type { CSSProperties, ReactNode } from "react";
import { buildReadinessSnapshot, readAllEdenReviewData, type ApprovalEvent, type ContentQueueItem, type ForbiddenFruitPersona, type InteractionMode, type PersonaAsset, type PromptBankItem, type ReadinessSnapshot, type SignalLog } from "@/lib/eden-skye/review-data";

export const dynamic = "force-dynamic";

type Tone = "ok" | "warn" | "block" | "neutral";

const badgeTone: Record<Tone, CSSProperties> = {
  ok: { borderColor: "rgba(74, 222, 128, 0.45)", color: "#bbf7d0", background: "rgba(22, 101, 52, 0.22)" },
  warn: { borderColor: "rgba(212, 175, 55, 0.55)", color: "#fde68a", background: "rgba(133, 77, 14, 0.2)" },
  block: { borderColor: "rgba(248, 113, 113, 0.45)", color: "#fecaca", background: "rgba(127, 29, 29, 0.22)" },
  neutral: { borderColor: "var(--line)", color: "var(--muted)", background: "rgba(255, 255, 255, 0.04)" }
};

const panel: CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 8,
  background: "var(--panel)",
  padding: 16,
  overflow: "hidden"
};

const table: CSSProperties = {
  width: "100%",
  minWidth: 760,
  borderCollapse: "collapse",
  fontSize: 13
};

const th: CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  color: "var(--accent-2)",
  borderBottom: "1px solid var(--line)",
  background: "#0b0f16",
  fontWeight: 600
};

const td: CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid rgba(60, 67, 84, 0.55)",
  verticalAlign: "top",
  color: "var(--muted)"
};

function normalizeSource(source: string): ReadinessSnapshot["source"] {
  return source === "supabase" || source === "static_seed" || source === "mixed" ? source : "mixed";
}

function tone(status: string): Tone {
  if (["approved", "published", "sandbox_ready", "live"].includes(status)) return "ok";
  if (["rejected", "blocked", "archived", "disabled"].includes(status)) return "block";
  if (["needs_review", "draft", "scheduled", "medium", "high"].includes(status)) return "warn";
  return "neutral";
}

function Badge({ children, status = "neutral" }: { children: ReactNode; status?: string }) {
  const style = badgeTone[tone(status)];
  return <span style={{ ...style, display: "inline-flex", border: "1px solid", borderRadius: 999, padding: "3px 8px", whiteSpace: "nowrap" }}>{children}</span>;
}

function TableShell({ children }: { children: ReactNode }) {
  return <div style={{ overflowX: "auto", border: "1px solid var(--line)", borderRadius: 8 }}>{children}</div>;
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section style={panel}>
      <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
      <p style={{ margin: "6px 0 12px", color: "var(--muted)", maxWidth: 860 }}>{subtitle}</p>
      {children}
    </section>
  );
}

function Personas({ rows }: { rows: ForbiddenFruitPersona[] }) {
  return (
    <TableShell>
      <table style={table}>
        <thead><tr><th style={th}>Persona</th><th style={th}>Parent</th><th style={th}>Archetype</th><th style={th}>Status</th><th style={th}>Risk</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id || row.persona_key}><td style={td}>{row.display_name} / {row.persona_key}</td><td style={td}>{row.parent_brand}</td><td style={td}>{row.archetype}</td><td style={td}><Badge status={row.status}>{row.status}</Badge></td><td style={td}><Badge status={row.policy_risk_level}>{row.policy_risk_level}</Badge></td></tr>)}</tbody>
      </table>
    </TableShell>
  );
}

function Assets({ rows }: { rows: PersonaAsset[] }) {
  return (
    <TableShell>
      <table style={table}>
        <thead><tr><th style={th}>Asset</th><th style={th}>Role</th><th style={th}>Type</th><th style={th}>Status</th><th style={th}>Source</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id || row.asset_key}><td style={td}>{row.asset_key}</td><td style={td}>{row.asset_role}</td><td style={td}>{row.asset_type}</td><td style={td}><Badge status={row.status}>{row.status}</Badge></td><td style={td}>{row.public_url || row.source_path || "pending"}</td></tr>)}</tbody>
      </table>
    </TableShell>
  );
}

function Prompts({ rows }: { rows: PromptBankItem[] }) {
  return (
    <TableShell>
      <table style={table}>
        <thead><tr><th style={th}>Prompt</th><th style={th}>Tool</th><th style={th}>Type</th><th style={th}>Risk</th><th style={th}>Status</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id || `${row.tool_surface}-${row.prompt_name}`}><td style={td}>{row.prompt_name}</td><td style={td}>{row.tool_surface}</td><td style={td}>{row.prompt_type}</td><td style={td}><Badge status={row.risk_level}>{row.risk_level}</Badge></td><td style={td}><Badge status={row.status}>{row.status}</Badge></td></tr>)}</tbody>
      </table>
    </TableShell>
  );
}

function Queue({ rows }: { rows: ContentQueueItem[] }) {
  return (
    <TableShell>
      <table style={table}>
        <thead><tr><th style={th}>Title</th><th style={th}>Platform</th><th style={th}>Type</th><th style={th}>Status</th><th style={th}>Risk</th><th style={th}>Schedule</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id || `${row.platform}-${row.title}`}><td style={td}>{row.title}</td><td style={td}>{row.platform}</td><td style={td}>{row.product_type || row.content_type || "content"}</td><td style={td}><Badge status={row.status}>{row.status}</Badge></td><td style={td}><Badge status={row.risk_level}>{row.risk_level}</Badge></td><td style={td}>{row.scheduled_for || "not scheduled"}</td></tr>)}</tbody>
      </table>
    </TableShell>
  );
}

function Modes({ rows }: { rows: InteractionMode[] }) {
  return (
    <TableShell>
      <table style={table}>
        <thead><tr><th style={th}>Mode</th><th style={th}>Type</th><th style={th}>Status</th><th style={th}>Risk</th><th style={th}>Required Gates</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id || row.mode_key}><td style={td}>{row.display_name}</td><td style={td}>{row.mode_type}</td><td style={td}><Badge status={row.status}>{row.status}</Badge></td><td style={td}><Badge status={row.risk_level}>{row.risk_level}</Badge></td><td style={td}>{[row.age_gate_required && "age gate", row.ai_disclosure_required && "AI disclosure", row.moderation_required && "moderation", row.approval_required && "approval"].filter(Boolean).join(", ")}</td></tr>)}</tbody>
      </table>
    </TableShell>
  );
}

function Approvals({ rows }: { rows: ApprovalEvent[] }) {
  return (
    <TableShell>
      <table style={table}>
        <thead><tr><th style={th}>Action</th><th style={th}>Target</th><th style={th}>Status</th><th style={th}>Risk</th><th style={th}>Blocker</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id || `${row.target_table}-${row.target_id}-${row.action_requested}`}><td style={td}>{row.action_requested}</td><td style={td}>{row.target_table}</td><td style={td}><Badge status={row.status}>{row.status}</Badge></td><td style={td}>{row.risk_level}</td><td style={td}>{row.blocker || "none"}</td></tr>)}</tbody>
      </table>
    </TableShell>
  );
}

function Signals({ rows }: { rows: SignalLog[] }) {
  return (
    <TableShell>
      <table style={table}>
        <thead><tr><th style={th}>Platform</th><th style={th}>Measured</th><th style={th}>Views</th><th style={th}>Clicks</th><th style={th}>Purchases</th><th style={th}>Revenue</th></tr></thead>
        <tbody>{rows.length === 0 ? <tr><td style={td} colSpan={6}>No signal logs yet. Sandbox launch data will appear here after approved tests.</td></tr> : rows.map((row) => <tr key={row.id || `${row.platform}-${row.measured_at}`}><td style={td}>{row.platform}</td><td style={td}>{row.measured_at || "pending"}</td><td style={td}>{row.views || 0}</td><td style={td}>{row.clicks || 0}</td><td style={td}>{row.purchases || 0}</td><td style={td}>${((row.revenue_cents || 0) / 100).toFixed(2)}</td></tr>)}</tbody>
      </table>
    </TableShell>
  );
}

export default async function EdenSkyeReviewPage() {
  const result = await readAllEdenReviewData();
  const readiness = buildReadinessSnapshot(result.data, normalizeSource(result.source), result.blockers);

  return (
    <main style={{ minHeight: "100vh", padding: 24, display: "grid", gap: 18, background: "#090b11", color: "var(--ink)" }}>
      <section style={{ ...panel, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "var(--accent)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Forbidden Fruit / Persona 001</div>
            <h1 style={{ margin: "8px 0", fontSize: 28 }}>Eden Skye Review Command Surface</h1>
            <p style={{ margin: 0, color: "var(--muted)", maxWidth: 900 }}>Read-only review lane for the Forbidden Fruit parent brand, Eden Skye persona assets, prompt bank, content products, interaction modes, approvals, and signal logs. Commerce, public distribution, chat, voice, and video execution remain gated.</p>
          </div>
          <Badge status={readiness.status}>{readiness.status}</Badge>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          {Object.entries(readiness.counts).map(([key, value]) => <div key={key} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 12, background: "#0b0f16" }}><div style={{ color: "var(--muted)", fontSize: 12 }}>{key}</div><div style={{ fontSize: 22, marginTop: 6 }}>{value}</div></div>)}
        </div>
        {readiness.blockers.length > 0 && <div style={{ border: "1px solid rgba(248, 113, 113, 0.42)", borderRadius: 8, padding: 12, background: "rgba(127, 29, 29, 0.18)" }}><strong>Blocked before execution</strong><ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "#fecaca" }}>{readiness.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul></div>}
      </section>

      <Section title="Persona Registry" subtitle="Forbidden Fruit portfolio rows. Eden Skye is Persona 001, not the whole company."><Personas rows={result.data.personas} /></Section>
      <Section title="Persona Assets" subtitle="Identity, voice, visual, and source assets that must resolve before downstream scheduling or product setup."><Assets rows={result.data.personaAssets} /></Section>
      <Section title="Prompt Bank" subtitle="Tool-specific prompts for Kling AI, HeyGen, Metricool, Shopify, chat, voice, video, and related generation surfaces."><Prompts rows={result.data.promptBank} /></Section>
      <Section title="Content Products" subtitle="Draft social, storefront, downloadable, and campaign rows before any public scheduler, storefront, or avatar workflow runs."><Queue rows={result.data.contentQueue} /></Section>
      <Section title="Interaction Modes" subtitle="Chat, voice, video, download, social, and storefront modes that require age-gate, AI disclosure, moderation, and approval gates."><Modes rows={result.data.interactionModes} /></Section>
      <Section title="Approval Events" subtitle="Audit lane for approval requests, blockers, workarounds, and rollback paths."><Approvals rows={result.data.approvalEvents} /></Section>
      <Section title="Signal Logs" subtitle="Performance telemetry after approved sandbox tests and public launches."><Signals rows={result.data.signalLogs} /></Section>
    </main>
  );
}
