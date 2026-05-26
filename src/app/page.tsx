import { audit, entryPrompts, repoRoles, workflow } from "@/lib/autobuilder";

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "32px 20px 72px",
        display: "grid",
        gap: 24
      }}
    >
      <section
        style={{
          background: "rgba(255,250,242,0.92)",
          border: "1px solid #d8ccba",
          padding: 24,
          borderRadius: 8
        }}
      >
        <div style={{ color: "#0f766e", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>
          AUTO BUILDER GPT Project Folder
        </div>
        <h1 style={{ margin: "10px 0 8px", fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1 }}>
          Universal Bridge Brain
        </h1>
        <p style={{ margin: 0, maxWidth: 860, color: "#5d5a53", fontSize: 18, lineHeight: 1.5 }}>
          This repo is the orchestration brain for the full build-promote-validate loop. It governs prompts,
          contracts, repo roles, audit, readiness, and the operator rules that drive AUTO BUILDER.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16
        }}
      >
        {entryPrompts.map((prompt) => (
          <article
            key={prompt.id}
            style={{
              background: "#fffaf2",
              border: "1px solid #d8ccba",
              borderRadius: 8,
              padding: 18
            }}
          >
            <div style={{ fontSize: 12, color: "#b45309", textTransform: "uppercase", letterSpacing: 1 }}>
              Entry Prompt
            </div>
            <h2 style={{ margin: "8px 0 10px", fontSize: 24 }}>{prompt.title}</h2>
            <p style={{ margin: 0, color: "#5d5a53", lineHeight: 1.5 }}>{prompt.starter}</p>
          </article>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16
        }}
      >
        <article style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>Repo Roles</h3>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
            <li>AUTO_BUILDER: {repoRoles.source}</li>
            <li>SANDBOX: {repoRoles.sandbox}</li>
            <li>FRONTEND: {repoRoles.frontend}</li>
          </ul>
        </article>
        <article style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>Workflow</h3>
          <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
            {workflow.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
        <article style={{ background: "#fffaf2", border: "1px solid #d8ccba", borderRadius: 8, padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>Audit</h3>
          <p style={{ margin: 0, color: "#5d5a53", lineHeight: 1.5 }}>
            Status: {audit.status}. Surfaces: {audit.surfaces.join(", ")}.
          </p>
        </article>
      </section>
    </main>
  );
}
