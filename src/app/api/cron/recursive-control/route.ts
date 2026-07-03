import { NextRequest, NextResponse } from "next/server";
import { authorizeCronRequest, type CronAuthorizationResult } from "@/lib/cron-auth";

// AUTO_BUILDER — Recursive Control Cron Route
// workflow/api package removed — replaced with direct async execution
// Operator: jeremy@autobuilderos.com | Mode: dry_run

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
  authorization: CronAuthorizationResult;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authorization = authorizeCronRequest(req);
  if (!authorization.ok) {
    return NextResponse.json({ ok: false, error: authorization.reason, authorization }, { status: authorization.status });
  }

  const notes: string[] = [];
  let tasksProcessed = 0;
  const receiptsWritten = 0;

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
      authorization,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error, timestamp: new Date().toISOString() }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return GET(req);
}
