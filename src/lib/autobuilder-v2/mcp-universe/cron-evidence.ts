import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

const SIGNATURE_HEADER = "x-awos-signature";
const TIMESTAMP_HEADER = "x-awos-timestamp";
const MAX_SKEW_MS = 5 * 60 * 1000;

export type SignedCronEvidenceTarget = "auto-builder-mcp-pulse" | "mcp-self-operating-loop";

export type SignedCronEvidenceVerification =
  | {
      ok: true;
      signedAt: string;
      signatureDigest: string;
    }
  | {
      ok: false;
      status: 401 | 408 | 503;
      body: {
        ok: false;
        productionActionAllowed: false;
        evidenceMode: "signed_cron_dry_run";
        error: string;
        target: SignedCronEvidenceTarget;
      };
    };

function getSigningSecret() {
  return process.env.CRON_DRY_RUN_SIGNING_SECRET ?? process.env.CRON_API_TOKEN;
}

function normalizeSignature(signature: string) {
  return signature.replace(/^sha256=/i, "").trim();
}

function safeEqualHex(left: string, right: string) {
  if (!/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right)) {
    return false;
  }

  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function signedCronPayload(target: SignedCronEvidenceTarget, timestamp: string, pathname: string) {
  return `${target}.${timestamp}.${pathname}`;
}

export function verifySignedCronEvidenceRequest(request: NextRequest, target: SignedCronEvidenceTarget): SignedCronEvidenceVerification {
  const secret = getSigningSecret();
  if (!secret) {
    return {
      ok: false,
      status: 503,
      body: {
        ok: false,
        productionActionAllowed: false,
        evidenceMode: "signed_cron_dry_run",
        error: "Cron dry-run signing secret is not configured.",
        target
      }
    };
  }

  const timestamp = request.headers.get(TIMESTAMP_HEADER);
  const signature = request.headers.get(SIGNATURE_HEADER);
  if (!timestamp || !signature) {
    return {
      ok: false,
      status: 401,
      body: {
        ok: false,
        productionActionAllowed: false,
        evidenceMode: "signed_cron_dry_run",
        error: `Missing ${TIMESTAMP_HEADER} or ${SIGNATURE_HEADER} header.`,
        target
      }
    };
  }

  const timestampMs = Date.parse(timestamp);
  if (Number.isNaN(timestampMs) || Math.abs(Date.now() - timestampMs) > MAX_SKEW_MS) {
    return {
      ok: false,
      status: 408,
      body: {
        ok: false,
        productionActionAllowed: false,
        evidenceMode: "signed_cron_dry_run",
        error: "Cron dry-run signature timestamp is stale or invalid.",
        target
      }
    };
  }

  const expected = createHmac("sha256", secret).update(signedCronPayload(target, timestamp, request.nextUrl.pathname)).digest("hex");
  const provided = normalizeSignature(signature);

  if (!safeEqualHex(provided, expected)) {
    return {
      ok: false,
      status: 401,
      body: {
        ok: false,
        productionActionAllowed: false,
        evidenceMode: "signed_cron_dry_run",
        error: "Invalid cron dry-run signature.",
        target
      }
    };
  }

  return {
    ok: true,
    signedAt: timestamp,
    signatureDigest: createHash("sha256").update(provided).digest("hex").slice(0, 16)
  };
}
