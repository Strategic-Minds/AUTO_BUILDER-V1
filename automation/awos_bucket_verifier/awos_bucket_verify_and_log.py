#!/usr/bin/env python3
"""Run the AWOS bucket verifier from captured payload files and append a log entry."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


def render_log_block(result: dict) -> str:
    observed = result["observed"]
    yes_no = lambda value: "yes" if value else "no"
    lines = [
        f"## {result['bucketKey']}",
        "",
        f"Bucket: {result['bucketKey']}",
        f"Checked at: {result['checkedAtUtc']}",
        f"Recursive status: {observed['lastRunStatus']}",
        f"Scheduler status: {observed['schedulerStatus']}",
        f"Sandbox mode: {observed['sandboxMode']}",
        f"Sandbox id present: {yes_no(bool(observed['sandboxId']))}",
        f"Queue name present: {yes_no(bool(observed['queueName']))}",
        f"Queue failed count: {observed['queueFailed']}",
        f"Awaiting approval count: {observed['awaitingApproval']}",
        f"Migration status: {observed['migrationStatus']}",
        f"Result: {result['result']}",
        f"Notes: {' '.join(result['notes'])}",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bucket", required=True)
    parser.add_argument("--recursive-status-file", required=True)
    parser.add_argument("--health-file", required=True)
    parser.add_argument("--verifier-script", default=str(BASE_DIR / "awos_bucket_verifier.py"))
    parser.add_argument("--results-dir", default=str(BASE_DIR / "output"))
    parser.add_argument("--memory-log", default=str(BASE_DIR / "logs" / "awos-bucket-verification-log.md"))
    args = parser.parse_args()

    results_dir = Path(args.results_dir)
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / f"awos-bucket-verifier-result-{args.bucket}.json"

    command = [
        sys.executable,
        args.verifier_script,
        "--expected-bucket",
        args.bucket,
        "--recursive-status-file",
        args.recursive_status_file,
        "--health-file",
        args.health_file,
    ]
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode > 2:
        sys.stderr.write(completed.stderr)
        return completed.returncode

    result = json.loads(completed.stdout)
    result_path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")

    memory_log = Path(args.memory_log)
    memory_log.parent.mkdir(parents=True, exist_ok=True)
    existing = memory_log.read_text(encoding="utf-8") if memory_log.exists() else "# AWOS Bucket Verification Log\n\n"
    block = render_log_block(result)
    if f"## {args.bucket}\n" not in existing:
        existing = existing.rstrip() + "\n\n" + block
        memory_log.write_text(existing, encoding="utf-8")

    print(json.dumps({"resultFile": str(result_path), "result": result["result"], "bucket": args.bucket}, indent=2))
    return completed.returncode


if __name__ == "__main__":
    raise SystemExit(main())
