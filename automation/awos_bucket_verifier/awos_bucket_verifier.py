#!/usr/bin/env python3
"""Emit a standardized PASS/WARN/FAIL record for an AWOS bucket."""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

UTC = timezone.utc


@dataclass
class FetchResult:
    status: int
    body: dict


def fetch_json(url: str) -> FetchResult:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "awos-bucket-verifier/0.1",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = response.read().decode("utf-8")
            parsed = json.loads(payload)
            return FetchResult(status=response.status, body=parsed)
    except urllib.error.HTTPError as exc:
        payload = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code} for {url}: {payload}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Request failed for {url}: {exc.reason}") from exc


def unwrap_embedded_json(body: dict) -> dict:
    text = body.get("text")
    if not isinstance(text, str):
        raise RuntimeError("Response did not include JSON text payload.")
    return json.loads(text)


def load_embedded_json_file(path: str) -> dict:
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    if isinstance(payload, dict) and isinstance(payload.get("text"), str):
        return unwrap_embedded_json(payload)
    return payload


def normalize_checked_at(now: datetime) -> str:
    return now.strftime("%Y-%m-%d %H:%M:%S UTC")


def floor_to_five_minutes(now: datetime) -> datetime:
    floored = now - timedelta(minutes=now.minute % 5, seconds=now.second, microseconds=now.microsecond)
    return floored


def format_bucket_key(bucket_time: datetime) -> str:
    return bucket_time.strftime("%Y-%m-%dT%H:%MZ")


def derive_expected_bucket(now: datetime, lag_minutes: int) -> str:
    return format_bucket_key(floor_to_five_minutes(now - timedelta(minutes=lag_minutes)))


def build_result(expected_bucket: str, recursive: dict, health: dict, checked_at: str) -> dict:
    recursive_block = recursive.get("recursive", {})
    last_run = recursive_block.get("lastRun", {})
    scheduler = recursive_block.get("scheduler", {})
    queue = recursive_block.get("queue", {})
    queue_metric = queue.get("metric", {})
    queue_execution = queue.get("execution", {})
    queue_summary = queue_execution.get("summary", {})
    sandbox = recursive_block.get("sandbox", {})
    awos = health.get("awos", {})

    observed = {
        "lastRunBucketKey": last_run.get("bucketKey"),
        "lastRunStatus": last_run.get("status"),
        "schedulerStatus": scheduler.get("status"),
        "schedulerName": scheduler.get("schedulerName"),
        "sandboxMode": sandbox.get("mode"),
        "sandboxId": sandbox.get("sandboxId"),
        "sandboxJobId": sandbox.get("jobId"),
        "sandboxTasksRequested": sandbox.get("tasksRequested"),
        "queueName": queue.get("name"),
        "queueFailed": queue_metric.get("failed"),
        "awaitingApproval": queue_summary.get("awaitingApproval"),
        "migrationStatus": awos.get("migrationStatus"),
        "stagedMigrationFile": awos.get("stagedMigrationFile"),
    }

    checks = {
        "bucketAdvanced": observed["lastRunBucketKey"] == expected_bucket,
        "lastRunStatusSuccess": observed["lastRunStatus"] == "success",
        "schedulerExecuted": observed["schedulerStatus"] == "executed",
        "sandboxPassed": observed["sandboxMode"] == "passed",
        "sandboxIdPresent": bool(observed["sandboxId"]),
        "queueNamePresent": bool(observed["queueName"]),
        "queueFailedZero": observed["queueFailed"] == 0,
        "approvalHeldCountExpected": observed["awaitingApproval"] == 1,
        "migrationStillStagedNotExecuted": observed["migrationStatus"] == "staged_not_executed",
    }

    fail_reasons = []
    warn_reasons = []

    if not checks["bucketAdvanced"]:
        fail_reasons.append("Bucket did not advance to the expected key.")
    if not checks["lastRunStatusSuccess"]:
        fail_reasons.append("lastRun.status is not success.")
    if not checks["schedulerExecuted"]:
        fail_reasons.append("scheduler.status is not executed.")
    if not checks["migrationStillStagedNotExecuted"]:
        fail_reasons.append("migrationStatus changed unexpectedly.")

    if checks["bucketAdvanced"] and not checks["sandboxPassed"]:
        warn_reasons.append("Bucket advanced, but sandbox.mode is not passed.")
    if checks["bucketAdvanced"] and checks["sandboxPassed"] and not checks["sandboxIdPresent"]:
        warn_reasons.append("Bucket advanced, but sandboxId is missing.")
    if not checks["queueNamePresent"]:
        warn_reasons.append("Queue name is missing.")
    if not checks["queueFailedZero"]:
        warn_reasons.append("Queue failed count drifted above zero.")
    if not checks["approvalHeldCountExpected"]:
        warn_reasons.append("Approval-held count drifted from the expected governed value of 1.")

    if fail_reasons:
        result = "FAIL"
        notes = fail_reasons + warn_reasons
    elif warn_reasons:
        result = "WARN"
        notes = warn_reasons
    else:
        result = "PASS"
        notes = [
            "Approval hold remains expected for staged Supabase queue activation.",
            f"Sandbox-backed execution advanced to the {expected_bucket} bucket.",
        ]

    return {
        "bucketKey": expected_bucket,
        "checkedAtUtc": checked_at,
        "result": result,
        "checks": checks,
        "observed": observed,
        "notes": notes,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="https://auto-builder-livid.vercel.app")
    parser.add_argument("--expected-bucket")
    parser.add_argument("--recursive-status-file")
    parser.add_argument("--health-file")
    parser.add_argument(
        "--lag-minutes",
        type=int,
        default=0,
        help="Derive expected bucket from current UTC time minus this many minutes.",
    )
    args = parser.parse_args()

    now = datetime.now(UTC)
    expected_bucket = args.expected_bucket or derive_expected_bucket(now, args.lag_minutes)
    checked_at = normalize_checked_at(now)

    if bool(args.recursive_status_file) != bool(args.health_file):
        raise SystemExit("Use both --recursive-status-file and --health-file together.")

    if args.recursive_status_file and args.health_file:
        recursive = load_embedded_json_file(args.recursive_status_file)
        health = load_embedded_json_file(args.health_file)
    else:
        recursive_result = fetch_json(f"{args.base_url.rstrip('/')}/api/recursive/status")
        health_result = fetch_json(f"{args.base_url.rstrip('/')}/api/health")
        recursive = unwrap_embedded_json(recursive_result.body)
        health = unwrap_embedded_json(health_result.body)

    result = build_result(expected_bucket, recursive, health, checked_at)
    json.dump(result, sys.stdout, indent=2)
    sys.stdout.write("\n")

    if result["result"] == "PASS":
        return 0
    if result["result"] == "WARN":
        return 1
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
