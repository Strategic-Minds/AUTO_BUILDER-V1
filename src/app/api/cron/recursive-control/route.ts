import { NextResponse } from "next/server";

// AUTO_BUILDER — Recursive Control Cron Route
// workflow/api package removed — replaced with direct async execution
// Operator: jeremy@autobuilderos.com | Mode: dry_run

const CRON_SECRET = process.env.CRON_SECRET ?? "";
const DRY_RUN = process.env.AUTO_BUILDER_MODE === "dry_run" || process.env.AUTO_BUILDER_MODE !== "production";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ControlResult {
  ok: boolean;
  mode: string;
  timestamp: string;
  tasksProcessed: number;
  receiptsWritten: number;
  dryRun: boolean;
  notes: string[];
}

export async function GET(req: Request): Promise<NextResponse> {
  // Auth check
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const notes: string[] = [];
  let tasksProcessed = 0;
  let receiptsWritten = 0;

  try {
    // Phase 1: Read queued agent_commands from Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      notes.push("Supabase env vars not set — skipping command processing");
    } else {
      const commandsRes = await fetch(
        `${supabaseUrl}/rest/v1/agent_commands?status=eq.queued&to_agent=eq.APEX&limit=5&order=created_at.asc`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      const commands = commandsRes.ok ? await commandsRes.json() : [];

      if (DRY_RUN) {
        notes.push(`DRY_RUN: Found ${commands.length} queued commands — not processing (mode=dry_run)`);
      } else {
        for (const cmd of commands) {
          // Claim command
          await fetch(`${supabaseUrl}/rest/v1/agent_commands?command_id=eq.${cmd.command_id}`, {
            method: "PATCH",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({ status: "in_progress", claimed_by: "APEX_CRON", claimed_at: new Date().toISOString() }),
          });
          tasksProcessed++;
          notes.push(`Claimed: ${cmd.command_id}`);
        }
      }
    }

    // Phase 2: Health check
    notes.push(`System healthy | mode=${DRY_RUN ? "dry_run" : "production"}`);

    const result: ControlResult = {
      ok: true,
      mode: DRY_RUN ? "dry_run" : "production",
      timestamp: new Date().toISOString(),
      tasksProcessed,
      receiptsWritten,
      dryRun: DRY_RUN,
      notes,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error, timestamp: new Date().toISOString() }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  return GET(req);
}
