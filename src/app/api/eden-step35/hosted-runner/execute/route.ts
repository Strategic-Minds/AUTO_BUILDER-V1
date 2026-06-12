import { NextRequest, NextResponse } from "next/server";

import { expandedStep35Rows, forbiddenStep35Actions, validateStep35Rows } from "@/lib/eden-step35/placement";
import { getHostedCredentialStatus, runHostedDrivePlacement } from "@/lib/eden-step35/drive-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  const rows = expandedStep35Rows();
  const validationErrors = validateStep35Rows(rows);
  if (validationErrors.length > 0) {
    return NextResponse.json(
      {
        status: "blocked_manifest_validation_failed",
        mutation_performed: false,
        errors: validationErrors,
        forbidden_actions: forbiddenStep35Actions,
      },
      { status: 422 }
    );
  }

  const credentialStatus = getHostedCredentialStatus();
  if (!credentialStatus.ready) {
    return NextResponse.json(
      {
        status: "blocked_missing_google_credentials",
        mutation_performed: false,
        missing_credential_fields: credentialStatus.missing,
        required_fields: ["GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY"],
        forbidden_actions: forbiddenStep35Actions,
      },
      { status: 403 }
    );
  }

  const artifactBaseUrl = process.env.STEP35_PACKAGE_BASE_URL;
  if (!artifactBaseUrl) {
    return NextResponse.json(
      {
        status: "blocked_missing_artifact_source",
        mutation_performed: false,
        required_fields: ["STEP35_PACKAGE_BASE_URL"],
        note: "STEP35_PACKAGE_BASE_URL must point at an approved hosted copy of the Step 35 package contents.",
        forbidden_actions: forbiddenStep35Actions,
      },
      { status: 422 }
    );
  }

  try {
    const result = await runHostedDrivePlacement({ rows, artifactBaseUrl });
    return NextResponse.json({
      status: "completed_guarded_drive_placement",
      mutation_performed: result.mutationPerformed,
      row_count: rows.length,
      receipts: result.receipts,
      forbidden_actions: forbiddenStep35Actions,
      approvals_preserved: {
        approved_public_marked: false,
        production_deploy: false,
        shopify_mutation: false,
        payments_activation: false,
        social_publish: false,
        heygen_activation: false,
        live_database_migration: false,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "failed_guarded_drive_placement",
        mutation_performed: "unknown_partial_check_receipts_and_drive",
        error: error instanceof Error ? error.message : "Unknown execution error",
        forbidden_actions: forbiddenStep35Actions,
      },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      status: "method_not_allowed_use_post_for_execute",
      mutation_performed: false,
      allowed_methods: ["POST"],
    },
    { status: 405 }
  );
}
