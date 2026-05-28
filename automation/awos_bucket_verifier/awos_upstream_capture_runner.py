#!/usr/bin/env python3
"""Fetch AWOS live endpoints and hand payloads to the local ingestion workflow."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path


UTC = timezone.utc
BASE_DIR = Path(__file__).resolve().parent


def floor_to_five_minutes(now: datetime) -> datetime:
    return now - timedelta(minutes=now.minute % 5, seconds=now.second, microseconds=now.microsecond)


def format_bucket_key(moment: datetime) -> str:
    return moment.strftime("%Y-%m-%dT%H:%MZ")


def derive_bucket_key(now: datetime, lag_minutes: int) -> str:
    return format_bucket_key(floor_to_five_minutes(now - timedelta(minutes=lag_minutes)))


def fetch_json(url: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "awos-upstream-capture-runner/0.1",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        payload = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code} for {url}: {payload}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Request failed for {url}: {exc.reason}") from exc


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="https://auto-builder-livid.vercel.app")
    parser.add_argument("--bucket")
    parser.add_argument(
        "--lag-minutes",
        type=int,
        default=0,
        help="Derive the expected bucket from current UTC time minus this many minutes.",
    )
    parser.add_argument("--ingestion-script", default=str(BASE_DIR / "awos_capture_ingest_and_verify.py"))
    args = parser.parse_args()

    bucket = args.bucket or derive_bucket_key(datetime.now(UTC), args.lag_minutes)
    base_url = args.base_url.rstrip("/")

    recursive_payload = fetch_json(f"{base_url}/api/recursive/status")
    health_payload = fetch_json(f"{base_url}/api/health")

    command = [
        sys.executable,
        args.ingestion_script,
        "--bucket",
        bucket,
        "--recursive-json",
        json.dumps(recursive_payload),
        "--health-json",
        json.dumps(health_payload),
    ]
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode > 2:
        sys.stderr.write(completed.stderr)
        return completed.returncode
    sys.stdout.write(completed.stdout)
    return completed.returncode


if __name__ == "__main__":
    raise SystemExit(main())
