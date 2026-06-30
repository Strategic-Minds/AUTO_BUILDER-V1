export default function DashboardHome() {
  return (
    <main style={{ padding: 32, fontFamily: 'system-ui' }}>
      <h1>AUTO_BUILDER Client Dashboard</h1>
      <p>Editable PWA shell for intake, approvals, revisions, QA receipts, and final handoff.</p>
      <section>
        <h2>Project Timeline</h2>
        <ol>
          <li>Intake</li>
          <li>Discovery</li>
          <li>Consultation Pack</li>
          <li>Approval</li>
          <li>Build Preview</li>
          <li>QA</li>
          <li>Final Handoff</li>
        </ol>
      </section>
      <section>
        <h2>Pending Approval</h2>
        <button>Approve</button>
        <button>Request exact changes</button>
      </section>
    </main>
  );
}
