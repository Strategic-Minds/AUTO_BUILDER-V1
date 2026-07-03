import { GlassCard, MobilePwaShell, StatusPill } from "@/components/mobile-pwa-shell";

const steps = [
  ["Intake Completed", "10:15 AM", "done"],
  ["Plan Approved", "10:18 AM", "done"],
  ["Discovery Complete", "10:22 AM", "done"],
  ["Brand Selected", "10:25 AM", "done"],
  ["Build In Progress", "10:31 AM", "active"],
  ["Validation Pending", "", "pending"],
  ["Deployment Pending", "", "pending"]
];

export default function TimelinePage() {
  return (
    <MobilePwaShell title="Project Timeline" subtitle="Track the project from intake to launch." active="Timeline">
      <GlassCard>
        <strong>Overall Progress</strong>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
          <span style={{ fontSize: 34, fontWeight: 900 }}>68%</span>
          <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(255,255,255,.10)" }}><div style={{ width: "68%", height: "100%", borderRadius: 999, background: "#0A84FF" }} /></div>
        </div>
      </GlassCard>
      <GlassCard>
        {steps.map(([label, time, state]) => (
          <div key={label} style={{ display: "grid", gridTemplateColumns: "22px 1fr auto", gap: 12, alignItems: "center", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            <span style={{ width: 14, height: 14, borderRadius: 999, background: state === 'done' ? '#19d67f' : state === 'active' ? '#0A84FF' : 'transparent', border: "1px solid rgba(10,132,255,.60)", boxShadow: state === 'active' ? "0 0 20px rgba(10,132,255,.75)" : 'none' }} />
            <span style={{ color: state === 'pending' ? 'rgba(255,255,255,.45)' : 'white' }}>{label}</span>
            <small style={{ color: state === 'active' ? '#53B9FF' : 'rgba(255,255,255,.48)' }}>{time}</small>
          </div>
        ))}
      </GlassCard>
      <GlassCard>
        <strong>Next Checkpoint</strong>
        <p style={{ color: "rgba(255,255,255,.70)" }}>Validator Agent will score the build and create a receipt before deployment.</p>
        <StatusPill>Release gate locked</StatusPill>
      </GlassCard>
    </MobilePwaShell>
  );
}
