import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { start } from "workflow/api";

import {
  APPROVED_WEBPACK,
  ingestApprovedWebpack,
} from "@/lib/autobuilder-v2/approved-webpack-ingestion";
import {
  approvedWebpackFiveMinuteQueue,
  type ApprovedWebpackQueueInput,
} from "@/workflows/approved-webpack-five-minute-queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SUBMISSION_PATH = "runtime/queues/five-minute/AZ-EPOXY-WEBPACK-20260718-01.submission.json";

type SubmissionReceipt = {
  schemaVersion: "1.0";
  jobId: typeof APPROVED_WEBPACK.jobId;
  queue: "vercel-workflow-five-minute";
  queueRunId: string;
  runStatusUrl: string;
  eventsUrl: string;
  submittedAt: string;
  branch: typeof APPROVED_WEBPACK.branch;
  approvedAssetSha256: typeof APPROVED_WEBPACK.expectedSha256;
  productionTouched: false;
  legacyBrowserWorkerTouched: false;
  replacementJobCreated: false;
};

export async function GET(request: NextRequest) {
  const execute = request.nextUrl.searchParams.get("execute") === "1";
  const requestedJobId = request.nextUrl.searchParams.get("jobId");

  if (!execute) {
    return NextResponse.json({
      ok: true,
      adapter: "approved-webpack-ingestion",
      mode: "preview_branch_locked",
      exactJobId: APPROVED_WEBPACK.jobId,
      sourceCarrier: {
        type: "google_slides_binary_carrier",
        driveFileId: APPROVED_WEBPACK.carrierDriveFileId,
      },
      expectedAsset: {
        sha256: APPROVED_WEBPACK.expectedSha256,
        width: APPROVED_WEBPACK.expectedWidth,
        height: APPROVED_WEBPACK.expectedHeight,
        mimeType: APPROVED_WEBPACK.mimeType,
      },
      target: {
        repository: APPROVED_WEBPACK.repository,
        branch: APPROVED_WEBPACK.branch,
        assetPath: APPROVED_WEBPACK.assetPath,
        queuePath: APPROVED_WEBPACK.queuePath,
      },
      safeguards: {
        productionTouched: false,
        legacyBrowserWorkerTouched: false,
        replacementJobAllowed: false,
      },
    });
  }

  if (requestedJobId !== APPROVED_WEBPACK.jobId) {
    return NextResponse.json(
      {
        ok: false,
        error: "JOB_ID_MISMATCH",
        expectedJobId: APPROVED_WEBPACK.jobId,
      },
      { status: 400 },
    );
  }

  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json(
      { ok: false, error: "PREVIEW_ONLY", environment: process.env.VERCEL_ENV ?? "unknown" },
      { status: 409 },
    );
  }

  if (process.env.VERCEL_GIT_COMMIT_REF !== APPROVED_WEBPACK.branch) {
    return NextResponse.json(
      {
        ok: false,
        error: "BRANCH_LOCK_MISMATCH",
        expectedBranch: APPROVED_WEBPACK.branch,
        actualBranch: process.env.VERCEL_GIT_COMMIT_REF ?? "unknown",
      },
      { status: 409 },
    );
  }

  try {
    const existing = await readExistingSubmissionReceipt();
    if (existing) {
      return NextResponse.json({
        ok: true,
        idempotentReplay: true,
        jobId: APPROVED_WEBPACK.jobId,
        state: "already_submitted",
        ingestion: "already_verified",
        submission: existing,
      });
    }

    const ingestion = await ingestApprovedWebpack();
    const queueInput: ApprovedWebpackQueueInput = {
      jobId: APPROVED_WEBPACK.jobId,
      branch: APPROVED_WEBPACK.branch,
      assetPath: APPROVED_WEBPACK.assetPath,
      assetSha256: APPROVED_WEBPACK.expectedSha256,
      sourceManifestPath: APPROVED_WEBPACK.manifestPath,
      queuedAt: new Date().toISOString(),
    };
    const run = await start(approvedWebpackFiveMinuteQueue, [queueInput]);
    const receipt: SubmissionReceipt = {
      schemaVersion: "1.0",
      jobId: APPROVED_WEBPACK.jobId,
      queue: "vercel-workflow-five-minute",
      queueRunId: run.runId,
      runStatusUrl: `/api/workflows/approved-webpack-five-minute-queue/run/${run.runId}`,
      eventsUrl: `/api/workflows/approved-webpack-five-minute-queue/readable/${run.runId}`,
      submittedAt: new Date().toISOString(),
      branch: APPROVED_WEBPACK.branch,
      approvedAssetSha256: APPROVED_WEBPACK.expectedSha256,
      productionTouched: false,
      legacyBrowserWorkerTouched: false,
      replacementJobCreated: false,
    };
    const receiptWrite = await writeSubmissionReceipt(receipt);

    return NextResponse.json(
      {
        ok: true,
        idempotentReplay: false,
        state: "submitted_to_five_minute_vercel_workflow_queue",
        jobId: APPROVED_WEBPACK.jobId,
        ingestion,
        submission: receipt,
        receiptWrite,
      },
      { status: 202 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        jobId: APPROVED_WEBPACK.jobId,
        error: error instanceof Error ? error.message : String(error),
        safeguards: {
          productionTouched: false,
          legacyBrowserWorkerTouched: false,
          replacementJobCreated: false,
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { jobId?: string };
  const url = new URL(request.url);
  url.searchParams.set("execute", "1");
  url.searchParams.set("jobId", body.jobId ?? "");
  return GET(new NextRequest(url, { headers: request.headers }));
}

async function readExistingSubmissionReceipt(): Promise<SubmissionReceipt | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required to read the queue submission receipt.");
  const endpoint = githubContentsEndpoint(SUBMISSION_PATH);
  const response = await fetch(`${endpoint}?ref=${encodeURIComponent(APPROVED_WEBPACK.branch)}`, {
    headers: githubHeaders(token),
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub submission receipt read failed (${response.status}).`);

  const data = (await response.json()) as { content?: string; encoding?: string; download_url?: string };
  let bytes: Buffer;
  if (data.content && data.encoding === "base64") {
    bytes = Buffer.from(data.content.replace(/\n/g, ""), "base64");
  } else if (data.download_url) {
    const download = await fetch(data.download_url, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!download.ok) throw new Error(`GitHub submission receipt download failed (${download.status}).`);
    bytes = Buffer.from(await download.arrayBuffer());
  } else {
    throw new Error("GitHub submission receipt did not include readable content.");
  }

  const receipt = JSON.parse(bytes.toString("utf8")) as SubmissionReceipt;
  if (
    receipt.jobId !== APPROVED_WEBPACK.jobId ||
    receipt.approvedAssetSha256 !== APPROVED_WEBPACK.expectedSha256 ||
    receipt.branch !== APPROVED_WEBPACK.branch
  ) {
    throw new Error("Existing queue submission receipt does not match the locked job and approved asset.");
  }
  return receipt;
}

async function writeSubmissionReceipt(receipt: SubmissionReceipt) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required to write the queue submission receipt.");
  const endpoint = githubContentsEndpoint(SUBMISSION_PATH);
  const bytes = Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  const expectedHash = createHash("sha256").update(bytes).digest("hex");

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: { ...githubHeaders(token), "content-type": "application/json" },
    body: JSON.stringify({
      message: `chore(pipeline): record five-minute queue submission for ${APPROVED_WEBPACK.jobId}`,
      content: bytes.toString("base64"),
      branch: APPROVED_WEBPACK.branch,
    }),
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`GitHub submission receipt write failed (${response.status}): ${text.slice(0, 500)}`);
  const data = JSON.parse(text) as { commit?: { sha?: string }; content?: { sha?: string } };
  return {
    path: SUBMISSION_PATH,
    sha256: expectedHash,
    contentSha: data.content?.sha ?? null,
    commitSha: data.commit?.sha ?? null,
  };
}

function githubContentsEndpoint(path: string) {
  const [owner, repo] = APPROVED_WEBPACK.repository.split("/");
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function githubHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "user-agent": "strategic-minds-auto-builder",
  };
}
