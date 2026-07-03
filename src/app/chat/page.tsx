import { GlassCard, MobilePwaShell, StatusPill } from "@/components/mobile-pwa-shell";

const messages = [
  ["Intake Agent", "I captured your project requirements and business goals."],
  ["Plan Agent", "Project scope, stack, and timeline are ready for discovery."],
  ["Builder Agent", "I am preparing the visual builder and page scaffold."],
  ["You", "Make the primary color deep electric blue."],
  ["Builder Agent", "Theme update queued for validation."]
];

export default function ChatPage() {
  return (
    <MobilePwaShell title="Agent Chat" subtitle="Talk with the swarm or call one agent directly." active="Chat">
      <GlassCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>Control Mode</strong>
          <StatusPill>5 online</StatusPill>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
          {['AUTO', 'HYBRID', 'MANUAL'].map((mode, index) => (
            <button key={mode} style={{ border: "1px solid rgba(10,132,255,.35)", background: index === 0 ? "#0756d9" : "rgba(255,255,255,.04)", color: "white", borderRadius: 12, padding: 10, fontWeight: 800 }}>{mode}</button>
          ))}
        </div>
      </GlassCard>
      <GlassCard>
        <strong>Live Agent Chat</strong>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {messages.map(([name, body]) => (
            <div key={name + body} style={{ padding: 12, borderRadius: 14, background: name === 'You' ? "rgba(10,82,210,.72)" : "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b>{name}</b><small style={{ color: "rgba(255,255,255,.55)" }}>10:32 AM</small></div>
              <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,.75)", lineHeight: 1.45 }}>{body}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <input placeholder="Message all agents or @agent" style={{ flex: 1, borderRadius: 12, padding: 12, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", color: "white" }} />
          <button style={{ borderRadius: 12, border: 0, background: "#0A84FF", color: "white", padding: "0 14px" }}>Send</button>
        </div>
      </GlassCard>
      <GlassCard>
        <strong>Active Agents</strong>
        {['Intake', 'Plan', 'Builder', 'Validator', 'Deploy'].map((agent, index) => (
          <div key={agent} style={{ display: "flex", justifyContent: "space-between", paddingTop: 10 }}><span>{agent} Agent</span><StatusPill>{index < 4 ? 'Active' : 'Queued'}</StatusPill></div>
        ))}
      </GlassCard>
    </MobilePwaShell>
  );
}
