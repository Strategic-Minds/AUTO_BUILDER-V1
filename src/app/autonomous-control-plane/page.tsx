import styles from "./page.module.css";
import { getAutonomousControlPlaneState } from "@/lib/autonomous-control-plane/state";

export const dynamic = "force-dynamic";

export default function AutonomousControlPlanePage() {
  const state = getAutonomousControlPlaneState();
  const blocked = state.queues.filter((task) => task.status === "blocked" || task.approvalRequired);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.mark}>SM</div>
          <div>
            <strong>Strategic Minds</strong>
            <span>Autonomous Wealth Operating System</span>
          </div>
        </div>
        <nav className={styles.nav} aria-label="Control plane sections">
          <a href="#journey">Journey</a>
          <a href="#queues">Queues</a>
          <a href="#receipts">Receipts</a>
        </nav>
        <a className={styles.primaryButton} href="/api/autonomous-control-plane/run-loop">Run Safe Loop</a>
      </header>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>AI-powered. Automated. Governed.</p>
          <h1>Builds, validates, and improves business systems while keeping risky actions gated.</h1>
          <p className={styles.heroCopy}>
            This preview turns the AWOS doctrine into a visible control plane: client journey state, package ladder,
            self-build queues, dry-run receipts, and hard approval boundaries for live actions.
          </p>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href="/api/autonomous-control-plane/run-loop">Run autonomous dry-run</a>
            <a className={styles.secondaryButton} href="/api/autonomous-control-plane/state">View state JSON</a>
          </div>
        </div>
        <div className={styles.orbit} aria-label="AWOS operating loop">
          <div className={styles.brain}>AWOS</div>
          <span>Discover</span>
          <span>Build</span>
          <span>Monetize</span>
          <span>Optimize</span>
        </div>
      </section>

      <section className={styles.packages} aria-label="Strategic Minds packages">
        <article><span>1. Business Planning</span><strong>$497</strong><p>Strategy call, business audit, action plan, recommendations.</p></article>
        <article><span>2. Workflow Automation</span><strong>$1,497</strong><p>Workflow audit, automation setup, integrations, training.</p></article>
        <article className={styles.popular}><span>3. MVP System Build</span><strong>$2,997</strong><p>Custom MVP, database/backend, frontend, and two revision cycles.</p></article>
        <article><span>4. Full Business System</span><strong>$5,997+</strong><p>End-to-end automation, launch support, and team training.</p></article>
      </section>

      <section id="journey" className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <p className={styles.eyebrow}>Client command center</p>
            <h2>Welcome back, {state.clientJourney.clientName}</h2>
          </div>
          <div className={styles.score}><span>Readiness</span><strong>{state.system.readinessScore}%</strong></div>
        </div>
        <div className={styles.journey}>
          {state.clientJourney.steps.map((label, index) => {
            const stepNumber = index + 1;
            const status = stepNumber < state.clientJourney.currentStep ? styles.done : stepNumber === state.clientJourney.currentStep ? styles.active : "";
            return <div className={`${styles.step} ${status}`} key={label}><b>{stepNumber}</b><span>{label}</span></div>;
          })}
        </div>
      </section>

      <section className={styles.grid}>
        <section id="queues" className={styles.panel}>
          <div className={styles.panelHead}><h2>Self-Build Queue</h2><span>{state.queues.length} tasks</span></div>
          <div className={styles.list}>
            {state.queues.map((task) => (
              <article className={styles.item} key={task.id}>
                <strong>{task.title}</strong>
                <div className={styles.meta}>
                  <span>{task.lane}</span><span className={styles[task.status]}>{task.status}</span><span>Risk {task.riskClass}</span>
                  <span className={task.approvalRequired ? styles.blocked : styles.ready}>{task.approvalRequired ? "Approval required" : "Autonomous safe"}</span>
                </div>
                <p>{task.nextAction}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}><h2>Governance Gates</h2><span>{blocked.length} blocked</span></div>
          <div className={styles.list}>
            {state.approvals.map((approval) => <article className={styles.item} key={approval.id}><strong>{approval.label}</strong><div className={styles.meta}><span className={styles.blocked}>{approval.status}</span><span>Risk {approval.riskClass}</span></div></article>)}
          </div>
        </section>
      </section>

      <section id="receipts" className={styles.panel}>
        <div className={styles.panelHead}><h2>Evidence Receipts</h2><span>Preview-safe</span></div>
        <p className={styles.receiptCopy}>Use <code>/api/autonomous-control-plane/run-loop</code> to generate a current dry-run receipt. The route checks all 12 AWOS stages and returns completed versus blocked work without external mutation.</p>
      </section>
    </main>
  );
}
