import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

import {
  runSupabaseJob,
  supabaseExecute,
  supabaseRead,
  supabaseRuntimeStatus,
  supabaseWrite
} from "@/lib/autobuilder-v2/supabase-job-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const modeSchema = z.enum(["read", "dry_run", "draft", "execute", "rollback"]);
const writeOperationSchema = z.enum(["insert", "upsert", "update", "delete"]);
const executeOperationSchema = z.enum(["status", "rpc", "invoke_edge_function", "execute_sql", "apply_migration", "deploy_edge_function"]);
const jsonPayloadSchema = z.object({}).passthrough();
const filterSchema = z.record(z.union([z.string(), z.number(), z.boolean()]));

const sharedGovernanceSchema = {
  job_id: z.string().optional(),
  mode: modeSchema.optional(),
  approved: z.boolean().optional(),
  approved_actions: z.array(z.string()).optional(),
  blocked_actions: z.array(z.string()).optional(),
  approvalPhrase: z.string().optional(),
  approval_phrase: z.string().optional(),
  allow_any_table: z.boolean().optional(),
  requested_by: z.string().optional()
};

const supabaseReadSchema = {
  ...sharedGovernanceSchema,
  table: z.string().optional(),
  table_name: z.string().optional(),
  select: z.string().optional(),
  filters: filterSchema.optional(),
  filter: filterSchema.optional(),
  order: z.string().optional(),
  limit: z.number().int().min(1).max(500).optional()
};

const supabaseWriteSchema = {
  ...sharedGovernanceSchema,
  operation: writeOperationSchema.optional(),
  table: z.string(),
  table_name: z.string().optional(),
  payload: z.union([jsonPayloadSchema, z.array(jsonPayloadSchema)]).optional(),
  data: z.union([jsonPayloadSchema, z.array(jsonPayloadSchema)]).optional(),
  filters: filterSchema.optional(),
  filter: filterSchema.optional(),
  on_conflict: z.string().optional()
};

const supabaseExecuteSchema = {
  ...sharedGovernanceSchema,
  operation: executeOperationSchema.optional(),
  function_name: z.string().optional(),
  payload: jsonPayloadSchema.optional(),
  data: jsonPayloadSchema.optional(),
  sql: z.string().optional(),
  migration_name: z.string().optional()
};

const supabaseJobSchema = {
  ...sharedGovernanceSchema,
  action: z.string().optional(),
  operation: z.string().optional(),
  table: z.string().optional(),
  table_name: z.string().optional(),
  select: z.string().optional(),
  filters: filterSchema.optional(),
  filter: filterSchema.optional(),
  order: z.string().optional(),
  limit: z.number().int().min(1).max(500).optional(),
  payload: z.union([jsonPayloadSchema, z.array(jsonPayloadSchema)]).optional(),
  data: z.union([jsonPayloadSchema, z.array(jsonPayloadSchema)]).optional(),
  on_conflict: z.string().optional(),
  function_name: z.string().optional(),
  sql: z.string().optional(),
  migration_name: z.string().optional()
};

function mcpText(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "supabase_status",
      {
        title: "Supabase Status",
        description: "Inspect governed Supabase MCP readiness without returning secrets.",
        inputSchema: {}
      },
      async () => mcpText(supabaseRuntimeStatus({ action: "supabase_status", mode: "read" }))
    );

    server.registerTool(
      "supabase_read",
      {
        title: "Supabase Read",
        description: "Read Supabase rows through a governed, secret-redacted PostgREST reader. Known AUTO_BUILDER tables are allowed by default; full table access requires allow_any_table=true or supabase_full_access approval metadata.",
        inputSchema: supabaseReadSchema
      },
      async (input) => mcpText(await supabaseRead({ ...(input as Record<string, unknown>), action: "supabase_read", mode: "read" }))
    );

    server.registerTool(
      "supabase_write",
      {
        title: "Supabase Write",
        description: "Plan or execute Supabase insert, upsert, update, or guarded delete. Defaults to dry_run; live writes require mode=execute, approved=true, and approved_actions including supabase_write or supabase_full_access.",
        inputSchema: supabaseWriteSchema
      },
      async (input) => mcpText(await supabaseWrite({ ...(input as Record<string, unknown>), action: "supabase_write" }))
    );

    server.registerTool(
      "supabase_execute",
      {
        title: "Supabase Execute",
        description: "Plan or execute Supabase RPC and edge-function calls. Raw SQL, migrations, destructive operations, and deploys require explicit approval metadata and remain blocked unless the required reviewed adapter is configured.",
        inputSchema: supabaseExecuteSchema
      },
      async (input) => mcpText(await supabaseExecute({ ...(input as Record<string, unknown>), action: "supabase_execute" }))
    );

    server.registerTool(
      "run_supabase_job",
      {
        title: "Run Supabase Job",
        description: "Route a governed Supabase read/write/execute job through the AUTO_BUILDER Supabase runner.",
        inputSchema: supabaseJobSchema
      },
      async (input) => mcpText(await runSupabaseJob(input as Record<string, unknown>))
    );
  },
  {
    instructions: "AUTO BUILDER Supabase MCP route. Exposes full read, write, and execute capability through dry-run defaults, explicit approval gates, secret redaction, and rollback metadata. Do not use this route to store or reveal secrets."
  },
  { basePath: "/api/mcp-supabase", maxDuration: 60, verboseLogs: false }
);

export { handler as GET, handler as POST, handler as DELETE };
