const workflowSteps = [
  "Read locked files",
  "Select one master TODO item",
  "Inspect repo and source truth",
  "Create or update repo artifact",
  "Validate or hard-gate",
  "Record workflow receipt",
  "Update status matrix",
  "Stop only at a real gate"
];

const priorityItems = [
  { label: "Locked workflow files", status: "Complete", detail: "Workflow lock, output contract, runbook, receipt schema, and locked manifest are installed." },
  { label: "Implementation branch", status: "In progress", detail: "Branch auto-builder/frontend-system-port-20260607 is active for repo-backed port work." },
  { label: "Canonical frontend port", status: "Active", detail: "Control-plane surface is being ported without redesign into the canonical repo." },
  { label: "Install / lint / typecheck / build", status: "Pending evidence", detail: "Must run in GitHub/Vercel or an approved checkout before completion is claimed." }
];

const gates = [
  "Production deploy",
  "Production database mutation",
  "Secret mutation",
  "Commerce/payment mutation",
  "Live social publish",
  "Customer message",
  "Destructive action",
  "External spend",
  "Credentialed browser action"
];

const evidence = [
  "Repo path",
  "Commit SHA",
  "PR URL",
  "Vercel build receipt",
  "Supabase dev receipt",
  "Browser smoke receipt",
  "API smoke receipt",
  "Connector dry-run receipt",
  "Hard-gate or approval receipt"
];

const connectors = [
  { name: "GitHub", state: "Partial", next: "Branch and PR evidence" },
  { name: "Vercel", state: "Pending", next: "Preview/build receipt" },
  { name: "Supabase", state: "Pending", next: "Dev schema and RLS hardening" },
  { name: "Browser", state: "Pending", next: "Desktop/mobile smoke" },
  { name: "Drive", state: "Blocked", next: "Write bridge for mirror" },
  { name: "Metricool / Chat / n8n", state: "Blocked", next: "Dry-run after env and allowlists" }
];

export default function HomePage() {
  return (
    <main className="control-shell">
      <aside className="control-sidebar" aria-label="AUTO BUILDER navigation">
        <div className="brand-lock">AUTO BUILDER OS</div>
        <h1>Control Plane</h1>
        <nav className="nav-list" aria-label="Workflow sections">
          <a href="#workflow">Workflow</a>
          <a href="#todo">Master TODO</a>
          <a href="#evidence">Evidence</a>
          <a href="#connectors">Connectors</a>
          <a href="#gates">Protected Gates</a>
        </nav>
        <div className="sidebar-note">
          Repo-first. One TODO item per run. Evidence or hard gate only.
        </div>
      </aside>

      <section className="control-main">
        <section className="hero-band" id="workflow">
          <div>
            <p className="eyebrow">Mandatory workflow lock</p>
            <h2>Finish the system through the repo, not local-only proof.</h2>
            <p>
              AUTO BUILDER now runs from locked files, the master completion TODO, and receipt-backed evidence. Every run must move one item forward or record the exact gate stopping it.
            </p>
          </div>
          <div className="status-stack" aria-label="Current phase">
            <span>Phase</span>
            <strong>Frontend System Port</strong>
            <small>Branch: auto-builder/frontend-system-port-20260607</small>
          </div>
        </section>

        <section className="section-grid two" aria-label="Workflow and active work">
          <div className="panel">
            <div className="panel-title">
              <p className="eyebrow">Repeatable run loop</p>
              <h3>Agent Workflow</h3>
            </div>
            <ol className="step-list">
              {workflowSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="panel" id="todo">
            <div className="panel-title">
              <p className="eyebrow">Master TODO</p>
              <h3>Active Completion Items</h3>
            </div>
            <div className="todo-list">
              {priorityItems.map((item) => (
                <article className="todo-row" key={item.label}>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <span data-state={item.status.toLowerCase().replaceAll(" ", "-")}>{item.status}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-grid three" id="evidence" aria-label="Evidence, connectors, and gates">
          <div className="panel">
            <div className="panel-title">
              <p className="eyebrow">Completion standard</p>
              <h3>Required Evidence</h3>
            </div>
            <ul className="compact-list">
              {evidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="panel" id="connectors">
            <div className="panel-title">
              <p className="eyebrow">Readiness lane</p>
              <h3>Connector Proof</h3>
            </div>
            <div className="connector-list">
              {connectors.map((connector) => (
                <div className="connector-row" key={connector.name}>
                  <div>
                    <strong>{connector.name}</strong>
                    <p>{connector.next}</p>
                  </div>
                  <span>{connector.state}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" id="gates">
            <div className="panel-title">
              <p className="eyebrow">Approval required</p>
              <h3>Protected Gates</h3>
            </div>
            <ul className="compact-list gate-list">
              {gates.map((gate) => (
                <li key={gate}>{gate}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="release-band" aria-label="Next action">
          <div>
            <p className="eyebrow">Next action</p>
            <h3>Run install, lint, typecheck, and build on this branch.</h3>
            <p>
              Completion is blocked until the branch produces clean validation receipts. The UI must not claim launch readiness until those checks pass and the status matrix is updated.
            </p>
          </div>
          <div className="command-card">
            <code>npm install</code>
            <code>npm run lint</code>
            <code>npm run typecheck</code>
            <code>npm run build</code>
          </div>
        </section>
      </section>
    </main>
  );
}