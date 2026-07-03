import type { ReactNode } from "react";

const navItems = [
  ["/chat", "Chat"],
  ["/builder", "Build"],
  ["/timeline", "Timeline"],
  ["/tools", "Tools"],
  ["/approvals", "Approvals"]
];

export function MobilePwaShell({ title, subtitle, active, children }: { title: string; subtitle?: string; active: string; children: ReactNode }) {
  return (
    <main style={styles.page}>
      <section style={styles.phone}>
        <header style={styles.header}>
          <div>
            <div style={styles.brand}>Strategic Minds AI</div>
            <div style={styles.slogan}>Intelligence in Motion</div>
          </div>
          <a href="/menu" style={styles.menu}>Menu</a>
        </header>
        <section style={styles.titleCard}>
          <p style={styles.kicker}>Auto Builder</p>
          <h1 style={styles.title}>{title}</h1>
          {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
        </section>
        <section style={styles.content}>{children}</section>
        <nav style={styles.nav}>
          {navItems.map(([href, label]) => (
            <a key={href} href={href} style={{ ...styles.navItem, ...(active === label ? styles.navActive : {}) }}>{label}</a>
          ))}
        </nav>
      </section>
    </main>
  );
}

export function GlassCard({ children }: { children: ReactNode }) {
  return <div style={styles.card}>{children}</div>;
}

export function StatusPill({ children }: { children: ReactNode }) {
  return <span style={styles.pill}>{children}</span>;
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#02040A", color: "white", display: "grid", placeItems: "center", padding: 20, fontFamily: "Inter, Segoe UI, Arial, sans-serif" },
  phone: { width: "min(430px, 100%)", minHeight: "calc(100vh - 40px)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 34, background: "radial-gradient(circle at 50% 20%, rgba(10,132,255,.22), transparent 38%), #040812", boxShadow: "0 0 80px rgba(10,132,255,.20)", padding: 18, display: "flex", flexDirection: "column", gap: 14 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,.10)" },
  brand: { fontSize: 18, fontWeight: 800, letterSpacing: -.2 },
  slogan: { fontSize: 10, letterSpacing: 2.6, textTransform: "uppercase", color: "rgba(255,255,255,.65)", marginTop: 2 },
  menu: { color: "white", textDecoration: "none", border: "1px solid rgba(255,255,255,.14)", borderRadius: 12, padding: "9px 12px", background: "rgba(255,255,255,.04)" },
  titleCard: { border: "1px solid rgba(10,132,255,.28)", background: "rgba(3,12,28,.70)", borderRadius: 18, padding: 18 },
  kicker: { margin: 0, color: "#53B9FF", textTransform: "uppercase", letterSpacing: 2, fontSize: 11 },
  title: { margin: "8px 0 0", fontSize: 28, lineHeight: 1.05 },
  subtitle: { margin: "8px 0 0", color: "rgba(255,255,255,.70)", lineHeight: 1.5 },
  content: { display: "grid", gap: 12, flex: 1, overflow: "auto", paddingBottom: 8 },
  card: { border: "1px solid rgba(255,255,255,.10)", background: "rgba(5,15,35,.66)", borderRadius: 18, padding: 16, boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)" },
  pill: { display: "inline-flex", alignItems: "center", border: "1px solid rgba(10,132,255,.42)", color: "#8fd3ff", borderRadius: 999, padding: "5px 9px", fontSize: 12, background: "rgba(10,132,255,.10)" },
  nav: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, borderTop: "1px solid rgba(255,255,255,.10)", paddingTop: 10 },
  navItem: { color: "rgba(255,255,255,.62)", textDecoration: "none", textAlign: "center", fontSize: 12, padding: "9px 4px", borderRadius: 12 },
  navActive: { color: "#3eb3ff", background: "rgba(10,132,255,.12)", border: "1px solid rgba(10,132,255,.22)" }
};
