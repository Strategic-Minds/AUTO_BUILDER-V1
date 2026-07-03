import { GlassCard, MobilePwaShell, StatusPill } from "@/components/mobile-pwa-shell";

const approvals = [
  ["Brand Direction", "Approved", "done"],
  ["Homepage UI", "Approved", "done"],
  ["Builder Page", "Review", "active"],
  ["Production Release", "Locked", "locked"]
];

export default function ApprovalsPage() {
  return (
    <MobilePwaShell title="Approvals" subtitle="Review gates before the system moves forward." active="Approvals">
      <GlassCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>Current Gate</strong>
          <StatusPill>Hybrid Mode</StatusPill>
        </div>
        <p style={{ color: "rgba(255,255,255,.70)", lineHeight: 1.5 }}>The Builder Agent needs approval before continuing to production-ready frontend pages.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          <button style={{ border: 0, background: "#0A84FF", color: "white", borderRadius: 14, padding: 14, fontWeight: 900 }}>Approve</button>
          <button style={{ border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.04)", color: "white", borderRadius: 14, padding: 14, fontWeight: 900 }}>Revise</button>
        </div>
      </GlassCard>
      <GlassCard>
        <strong>Approval Queue</strong>
        {approvals.map(([title, status, state]) => (
          <div key={title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            <span>{title}</span>
            <StatusPill>{status}</StatusPill>
          </div>
        ))}
      </GlassCard>
      <GlassCard>
        <strong>Revision Questions</strong>
        <p style={{ color: "rgba(255,255,255,.68)" }}>If revise is selected, the system asks only phase-specific questions about color, layout, audience, workflow, and monetization.</p>
      </GlassCard>
    </MobilePwaShell>
  );
}
