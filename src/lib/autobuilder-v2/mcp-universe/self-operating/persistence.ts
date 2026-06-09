export function buildPersistencePlan() {
  return {
    mode: "planned_internal_write",
    productionActionAllowed: false,
    tables: [
      {
        name: "mcp_registry",
        purpose: "Durable registry entries, layer classification, scoring, and governance posture.",
        writeMode: "schema_pending"
      },
      {
        name: "mcp_readiness",
        purpose: "Current connector readiness state, missing credentials, blockers, and next safe step.",
        writeMode: "schema_pending"
      },
      {
        name: "mcp_receipts",
        purpose: "Every pulse, validator, blocker, recommendation, and approval-needed event.",
        writeMode: "schema_pending"
      },
      {
        name: "mcp_validation_results",
        purpose: "Registry, API, cron, browser, security, social, business, and optimization validators.",
        writeMode: "schema_pending"
      },
      {
        name: "mcp_approval_queue",
        purpose: "Guarded production, social, commerce, finance, secrets, customer, database, DNS, and destructive actions.",
        writeMode: "schema_pending"
      },
      {
        name: "mcp_optimization_queue",
        purpose: "Continuous improvement candidates produced by self-reflection and analytics loops.",
        writeMode: "schema_pending"
      }
    ],
    validators: ["schema_draft_check", "rls_policy_draft_check", "receipt_insert_dry_run", "no_secret_output"],
    nextAction: "Create Supabase migration draft and RLS policy after approval."
  };
}
