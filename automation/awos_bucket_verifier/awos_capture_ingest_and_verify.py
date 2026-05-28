#!/usr/bin/env python3
"""Ingest captured AWOS payloads, write canonical snapshots, and run verification."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


def parse_payload_text(raw: str) -> dict:
    payload = json.loads(raw)
    if isinstance(payload, dict) and isinstance(payload.get("text"), str):
        return json.loads(payload["text"])
    return payload


def load_payload(*, file_path: str | None, inline_json: str | None) -> dict:
    if bool(file_path) == bool(inline_json):
        raise SystemExit("Provide exactly one of file path or inline JSON for each payload.")
    if file_path:
        raw = Path(file_path).read_text(encoding="utf-8")
    else:
        raw = inline_json or ""
    return parse_payload_text(raw)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bucket", required=True)
    parser.add_argument("--output-dir", default=str(BASE_DIR / "output"))
    parser.add_argument("--wrapper-script", default=str(BASE_DIR / "awos_bucket_verify_and_log.py"))
    parser.add_argument("--recursive-file")
    parser.add_argument("--recursive-json")
    parser.add_argument("--health-file")
    parser.add_argument("--health-json")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    recursive = load_payload(file_path=args.recursive_file, inline_json=args.recursive_json)
    health = load_payload(file_path=args.health_file, inline_json=args.health_json)

    bucket_safe = args.bucket.replace(":", "-")
    recursive_path = output_dir / f"awos_recursive_status_{bucket_safe}.json"
    health_path = output_dir / f"awos_health_{bucket_safe}.json"

    recursive_path.write_text(json.dumps(recursive, indent=2) + "\n", encoding="utf-8")
    health_path.write_text(json.dumps(health, indent=2) + "\n", encoding="utf-8")

    command = [
        sys.executable,
        args.wrapper_script,
        "--bucket",
        args.bucket,
        "--recursive-status-file",
        str(recursive_path),
        "--health-file",
        str(health_path),
    ]
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode > 2:
        sys.stderr.write(completed.stderr)
        return completed.returncode

    wrapper_output = json.loads(completed.stdout)
    print(
        json.dumps(
            {
                "bucket": args.bucket,
                "recursiveSnapshot": str(recursive_path),
                "healthSnapshot": str(health_path),
                "verification": wrapper_output,
            },
            indent=2,
        )
    )
    return completed.returncode


if __name__ == "__main__":
    raise SystemExit(main())
