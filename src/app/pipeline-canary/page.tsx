export const dynamic = "force-dynamic";

const checks = [
  ["Workbook", "Loaded and evidence ledger present"],
  ["Skills", "13 packages validated"],
  ["GitHub", "Feature branch and draft PR lane"],
  ["Vercel", "Preview deployment required"],
  ["Supabase", "Read-only health verified"],
  ["Release", "Production locked"],
] as const;

export default function PipelineCanaryPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "48px 24px", maxWidth: 960, margin: "0 auto" }}>
      <p style={{ color: "#d4af37", fontWeight: 700, letterSpacing: "0.08em" }}>AUTO BUILDER VALIDATION CANARY</p>
      <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 0.95, margin: "16px 0" }}>
        One image to live system pipeline
      </h1>
      <p style={{ color: "#b7bfcc", fontSize: "1.15rem", maxWidth: 720 }}>
        This reversible preview route proves branch-safe implementation, deployment, route health, API response, and rollback readiness without promoting production.
      </p>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 36 }}>
        {checks.map(([title, detail]) => (
          <article key={title} style={{ border: "1px solid #3c4354", borderRadius: 18, padding: 22, background: "rgba(18,21,29,.82)" }}>
            <strong style={{ display: "block", fontSize: "1.2rem", marginBottom: 8 }}>{title}</strong>
            <span style={{ color: "#b7bfcc" }}>{detail}</span>
          </article>
        ))}
      </section>
      <a href="/api/pipeline-canary" style={{ display: "inline-block", marginTop: 32, padding: "14px 20px", borderRadius: 999, background: "#d4af37", color: "#090b11", fontWeight: 800, textDecoration: "none" }}>
        Open canary API
      </a>
    </main>
  );
}
