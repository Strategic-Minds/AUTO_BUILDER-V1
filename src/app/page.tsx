import type { CSSProperties } from "react";
import { buildEdenAdminControlSnapshot } from "@/lib/eden-skye-admin";

export const dynamic = "force-dynamic";

const ink = "#f7f1e8";
const muted = "#b8b0a4";
const line = "rgba(247,241,232,0.16)";
const accent = "#d8b36a";
const deep = "#070706";

const page: CSSProperties = {
  minHeight: "100vh",
  background: deep,
  color: ink,
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
};

const section: CSSProperties = {
  width: "100%",
  borderTop: `1px solid ${line}`
};

const inner: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  padding: "72px 24px"
};

const eyebrow: CSSProperties = {
  color: accent,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0,
  fontWeight: 700
};

const pill: CSSProperties = {
  border: `1px solid ${line}`,
  borderRadius: 999,
  padding: "7px 10px",
  color: muted,
  fontSize: 12,
  width: "fit-content"
};

function Stat({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div style={{ borderTop: `1px solid ${line}`, paddingTop: 14 }}>
      <div style={{ color: accent, fontSize: 28, fontWeight: 800 }}>{value}</div>
      <div style={{ fontWeight: 700, marginTop: 4 }}>{label}</div>
      <p style={{ color: muted, margin: "6px 0 0", lineHeight: 1.45 }}>{note}</p>
    </div>
  );
}

function Lane({ title, state, body }: { title: string; state: string; body: string }) {
  return (
    <div style={{ display: "grid", gap: 8, borderTop: `1px solid ${line}`, paddingTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", flexWrap: "wrap" }}>
        <strong>{title}</strong>
        <span style={{ ...pill, color: state.includes("locked") || state.includes("blocked") ? "#f2a6a6" : accent }}>{state}</span>
      </div>
      <p style={{ color: muted, margin: 0, lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}

export default async function HomePage() {
  const snapshot = await buildEdenAdminControlSnapshot();
  const readyConnectors = snapshot.connectors.filter((connector) => connector.ready).length;
  const scheduledDrafts = Object.values(snapshot.publishingQueue.platforms).reduce((sum, count) => sum + count, 0);

  return (
    <main style={page}>
      <section
        style={{
          minHeight: "92svh",
          display: "grid",
          alignItems: "end",
          background:
            "radial-gradient(circle at 78% 18%, rgba(216,179,106,0.22), transparent 28%), linear-gradient(135deg, #070706 0%, #11100e 48%, #211b13 100%)"
        }}
      >
        <div style={{ ...inner, width: "100%", paddingTop: 34, paddingBottom: 44 }}>
          <nav style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", marginBottom: 92 }}>
            <strong style={{ fontSize: 18 }}>Eden Skye Studios</strong>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span style={pill}>Draft automation live</span>
              <span style={pill}>Publishing locked</span>
            </div>
          </nav>

          <div style={{ maxWidth: 760, display: "grid", gap: 22 }}>
            <div style={eyebrow}>AI creator network and automation studio</div>
            <h1 style={{ fontSize: "clamp(48px, 8vw, 108px)", lineHeight: 0.92, margin: 0, letterSpacing: 0 }}>Eden Skye Studios</h1>
            <p style={{ color: muted, fontSize: 20, lineHeight: 1.45, maxWidth: 620, margin: 0 }}>
              A draft-first operating system for digital models, faceless media pages, social publishing queues, engagement review, and gated membership offers.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/admin/eden-skye" style={{ color: "#111", background: accent, padding: "12px 16px", borderRadius: 6, textDecoration: "none", fontWeight: 800 }}>Open command center</a>
              <a href="#closet" style={{ color: ink, border: `1px solid ${line}`, padding: "12px 16px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>View Eden&apos;s Closet</a>
            </div>
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={{ ...inner, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 26 }}>
          <Stat label="Creator Accounts" value={snapshot.counts.models} note="Seeded model and faceless registry records." />
          <Stat label="Image Queue" value={snapshot.counts.queuedImageAssets} note="Missing media remains approval-gated." />
          <Stat label="Draft Posts" value={scheduledDrafts} note="Calendar rows are draft-only and not sent." />
          <Stat label="Connectors" value={`${readyConnectors}/${snapshot.connectors.length}`} note="n8n is non-critical and still locked." />
        </div>
      </section>

      <section style={section}>
        <div style={{ ...inner, display: "grid", gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)", gap: 40 }}>
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <div style={eyebrow}>Automation loop</div>
            <h2 style={{ fontSize: 42, lineHeight: 1.04, margin: 0, letterSpacing: 0 }}>Built to feed the operating system, not just describe it.</h2>
            <p style={{ color: muted, lineHeight: 1.6, margin: 0 }}>
              The public site connects to the same control plane that feeds the registry, media library, content calendar, engagement desk, experiments, memory, and receipts.
            </p>
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            <Lane title="Model registry" state="ready" body={`${snapshot.counts.models} draft profiles are organized by cohort and available to backend workflows.`} />
            <Lane title="Media library" state="locked until approval" body={`${snapshot.mediaLibrary.needsGenerationOrUpload} assets still need generation, upload, QA, and explicit approval before linking.`} />
            <Lane title="Publishing queue" state="draft only" body="Metricool/Xyla-ready schedules can be prepared, but no external scheduling is allowed from this page." />
            <Lane title="Engagement desk" state="locked" body="Comments, replies, and messages stay as review drafts until an approval receipt exists." />
          </div>
        </div>
      </section>

      <section id="closet" style={section}>
        <div style={{ ...inner, display: "grid", gap: 28 }}>
          <div style={{ maxWidth: 720 }}>
            <div style={eyebrow}>Eden&apos;s Closet</div>
            <h2 style={{ fontSize: 42, lineHeight: 1.05, margin: "10px 0", letterSpacing: 0 }}>Black Card membership is designed, locked, and waiting for review.</h2>
            <p style={{ color: muted, lineHeight: 1.6, margin: 0 }}>
              Membership tiers, payment gates, age-gate checks, release queues, and adult-content access must remain disabled until compliance, payment testing, and owner approval are complete.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
            <Lane title="Membership backend" state="locked design" body="Backend surfaces can be built, tested, and reviewed without activating payment or access." />
            <Lane title="Age and policy gate" state="required" body="Adult/membership release requires policy review and a verified gate before launch." />
            <Lane title="Payment activation" state="blocked" body="No checkout, billing, or paid access is enabled without separate approval." />
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={{ ...inner, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 0.55fr)", gap: 30, alignItems: "start" }}>
          <div>
            <div style={eyebrow}>Approval boundaries</div>
            <h2 style={{ fontSize: 34, lineHeight: 1.08, margin: "10px 0 18px", letterSpacing: 0 }}>The system advances drafts automatically and stops before live action.</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {snapshot.approvalLocks.map((lock) => (
                <Lane key={lock.lane} title={lock.lane} state={lock.status} body={lock.reason} />
              ))}
            </div>
          </div>
          <aside style={{ border: `1px solid ${line}`, borderRadius: 8, padding: 18, background: "rgba(255,255,255,0.035)" }}>
            <div style={eyebrow}>Preview state</div>
            <p style={{ color: muted, lineHeight: 1.55 }}>Production actions and external writes are disabled. Image generation/upload and PR merge remain separate approval gates.</p>
            <a href="/api/eden-skye/admin-control" style={{ color: accent, textDecoration: "none", fontWeight: 800 }}>Read admin-control API</a>
          </aside>
        </div>
      </section>
    </main>
  );
}
