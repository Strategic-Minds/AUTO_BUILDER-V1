import { getWritable, sleep } from "workflow";

import { APPROVED_WEBPACK } from "@/lib/autobuilder-v2/approved-webpack-ingestion";

export type ApprovedWebpackQueueInput = {
  jobId: typeof APPROVED_WEBPACK.jobId;
  branch: typeof APPROVED_WEBPACK.branch;
  assetPath: typeof APPROVED_WEBPACK.assetPath;
  assetSha256: typeof APPROVED_WEBPACK.expectedSha256;
  sourceManifestPath: typeof APPROVED_WEBPACK.manifestPath;
  queuedAt?: string;
};

type QueueEvent = {
  type: "queued" | "five_minute_boundary" | "handoff_submitted" | "blocked" | "done";
  at: string;
  jobId: string;
  status: string;
  data?: Record<string, unknown>;
};

export async function approvedWebpackFiveMinuteQueue(input: ApprovedWebpackQueueInput) {
  "use workflow";

  validateInput(input);
  const queuedAt = input.queuedAt ?? new Date().toISOString();
  const waitMs = millisecondsToNextFiveMinuteBoundary(new Date(queuedAt));

  await emitQueueEvent({
    type: "queued",
    jobId: input.jobId,
    status: "queued",
    data: {
      queue: "vercel-workflow-five-minute",
      waitMs,
      branch: input.branch,
      assetPath: input.assetPath,
      assetSha256: input.assetSha256,
      previewOnly: true,
    },
  });

  if (waitMs > 0) await sleep(waitMs);

  await emitQueueEvent({
    type: "five_minute_boundary",
    jobId: input.jobId,
    status: "dispatching",
    data: { boundaryAt: new Date().toISOString() },
  });

  const handoff = await submitExistingJobToHandoff(input);
  await emitQueueEvent({
    type: handoff.ok ? "handoff_submitted" : "blocked",
    jobId: input.jobId,
    status: handoff.ok ? "submitted" : "blocked",
    data: handoff,
  });

  await emitQueueEvent({
    type: "done",
    jobId: input.jobId,
    status: handoff.ok ? "submitted" : "blocked",
    data: {
      runId: handoff.runId ?? null,
      statusUrl: handoff.statusUrl ?? null,
      productionTouched: false,
      legacyBrowserWorkerTouched: false,
    },
  });

  return {
    ok: handoff.ok,
    jobId: input.jobId,
    queue: "vercel-workflow-five-minute",
    queuedAt,
    dispatchedAt: new Date().toISOString(),
    waitMs,
    handoff,
    safeguards: {
      deploymentMode: "preview",
      productionTouched: false,
      legacyBrowserWorkerTouched: false,
      replacementJobCreated: false,
    },
  };
}

function validateInput(input: ApprovedWebpackQueueInput) {
  const expected = APPROVED_WEBPACK;
  if (
    input.jobId !== expected.jobId ||
    input.branch !== expected.branch ||
    input.assetPath !== expected.assetPath ||
    input.assetSha256 !== expected.expectedSha256 ||
    input.sourceManifestPath !== expected.manifestPath
  ) {
    throw new Error("Five-minute queue input does not match the locked approved web-pack job.");
  }
}

function millisecondsToNextFiveMinuteBoundary(value: Date) {
  const cadence = 5 * 60 * 1000;
  const timestamp = value.getTime();
  const remainder = timestamp % cadence;
  return remainder === 0 ? 0 : cadence - remainder;
}

async function emitQueueEvent(event: Omit<QueueEvent, "at">) {
  "use step";
  const writer = getWritable<QueueEvent>().getWriter();
  try {
    await writer.write({ ...event, at: new Date().toISOString() });
  } finally {
    writer.releaseLock();
  }
}

async function submitExistingJobToHandoff(input: ApprovedWebpackQueueInput): Promise<{
  ok: boolean;
  status: number;
  runId?: string;
  statusUrl?: string;
  eventsUrl?: string;
  error?: string;
}> {
  "use step";

  const token = process.env.AUTO_BUILDER_OPERATOR_TOKEN ?? process.env.AUTO_BUILDER_BRIDGE_TOKEN;
  const deploymentHost = process.env.VERCEL_URL;
  if (!token || token.length < 16) {
    return { ok: false, status: 503, error: "Operator or bridge token is unavailable inside the preview workflow." };
  }
  if (!deploymentHost) {
    return { ok: false, status: 503, error: "VERCEL_URL is unavailable inside the preview workflow." };
  }

  const endpoint = new URL("/api/workflows/auto-builder-handoff", `https://${deploymentHost}`);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      workflowId: input.jobId,
      targetSystem: "auto_builder",
      mode: "execute",
      deploymentMode: "preview",
      ref: input.branch,
      requestedBy: "approved-webpack-five-minute-queue",
      metadata: {
        jobId: input.jobId,
        sourceManifestPath: input.sourceManifestPath,
        approvedAssetPath: input.assetPath,
        approvedAssetSha256: input.assetSha256,
        queue: "vercel-workflow-five-minute",
        productionAllowed: "false",
        legacyBrowserWorkerMutable: "false",
      },
    }),
    cache: "no-store",
  });
  const text = await response.text();
  const body = parseJson(text) as {
    runId?: string;
    statusUrl?: string;
    eventsUrl?: string;
    error?: string | { message?: string };
  };

  if (!response.ok || !body.runId) {
    return {
      ok: false,
      status: response.status,
      error: typeof body.error === "string" ? body.error : body.error?.message ?? text.slice(0, 500),
    };
  }

  return {
    ok: true,
    status: response.status,
    runId: body.runId,
    statusUrl: body.statusUrl,
    eventsUrl: body.eventsUrl,
  };
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return { raw: value };
  }
}
