import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildAutonomousDryRunReceipt } from "@/lib/autonomous-control-plane/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Verification = {
  ok: boolean;
  status: "verified" | "dry_run_unsigned" | "missing_secret" | "invalid_signature";
  reason: string;
};

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function verifySignedCron(request: NextRequest): Verification {
  const secret = process.env.AUTONOMOUS_CONTROL_PLANE_CRON_SECRET ?? process.env.CRON_API_TOKEN;
  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";

  if (!secret) {
    return dryRun
      ? { ok: true, status: "missing_secret", reason: "Dry-run allowed because no signing secret is configured in this environment." }
      : { ok: false, status: "missing_secret", reason: "Set AUTONOMOUS_CONTROL_PLANE_CRON_SECRET or CRON_API_TOKEN before live cron execution." };
  }

  const timestamp = request.headers.get("x-awos-timestamp") ?? "";
  const signature = request.headers.get("x-awos-signature") ?? "";
  const payload = `${request.nextUrl.pathname}:${timestamp}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  if (signature && safeEqual(signature, expected)) {
    return { ok: true, status: "verified", reason: "Signed cron request verified." };
  }

  if (dryRun) {
    return { ok: true, status: "dry_run_unsigned", reason: "Unsigned dry-run evidence allowed; live cron remains blocked." };
  }

  return { ok: false, status: "invalid_signature", reason: "Missing or invalid x-awos-signature." };
}

export async function GET(request: NextRequest) {
  const verification = verifySignedCron(request);
  if (!verification.ok) {
    return NextResponse.json({ ok: false, productionActionAllowed: false, verification }, { status: 401 });
  }

  const receipt = buildAutonomousDryRunReceipt();
  return NextResponse.json({
    ok: true,
    productionActionAllowed: false,
    verification,
    receipt,
    allowedByDefault: [
      "check recursive loop stages",
      "generate internal dry-run receipt",
      "report blocked approval gates",
      "prepare browser validation queue"
    ],
    blockedByDefault: [
      "production deploy",
      "database migration apply",
      "live billing mutation",
      "external publishing",
      "environment variable mutation"
    ]
  });
}
