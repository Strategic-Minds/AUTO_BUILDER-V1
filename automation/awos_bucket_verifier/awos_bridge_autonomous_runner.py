#!/usr/bin/env python3
"""Trigger the GPT GitHub workflow bridge and verify the written workflow file."""

from __future__ import annotations

import argparse
import json
import os
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import quote

DEFAULT_BASE_URL = "https://auto-builder-livid.vercel.app"
DEFAULT_REQUEST_PATH = "automation/awos_bucket_verifier/awos-bridge-smoke-test-request.json"
DEFAULT_OUTPUT_DIR = "automation/awos_bucket_verifier/output"


def fetch_json(
    url: str,
    *,
    method: str = "GET",
    body: dict | None = None,
    token: str | None = None,
) -> dict:
    headers = {
        "Accept": "application/json",
        "User-Agent": "awos-bridge-autonomous-runner/0.1",
    }
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode("utf-8")
    if token:
        headers["Authorization"] = f"Bearer {token}"
        headers["X-GitHub-Api-Version"] = "2022-11-28"
        headers["Accept"] = "application/vnd.github+json"

    request = urllib.request.Request(url, data=data, headers=headers, method=method)
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
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--request-file", default=DEFAULT_REQUEST_PATH)
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()

    request_payload = json.loads(Path(args.request_file).read_text(encoding="utf-8"))
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    bridge_response = fetch_json(
        f"{args.base_url.rstrip('/')}/api/bridge/http",
        method="POST",
        body=request_payload,
    )
    bridge_response_path = output_dir / "bridge-response.json"
    bridge_response_path.write_text(json.dumps(bridge_response, indent=2) + "\n", encoding="utf-8")

    target_repo = request_payload["repo"]
    target_path = request_payload["target_path"]
    github_token = os.environ.get("GITHUB_TOKEN")
    if not github_token:
        raise SystemExit("Missing GITHUB_TOKEN in runner environment.")

    encoded_path = "/".join(quote(segment, safe="") for segment in target_path.split("/"))
    github_response = fetch_json(
        f"https://api.github.com/repos/{target_repo}/contents/{encoded_path}",
        token=github_token,
    )
    github_response_path = output_dir / "github-workflow-file.json"
    github_response_path.write_text(json.dumps(github_response, indent=2) + "\n", encoding="utf-8")

    bridge_status = bridge_response.get("status")
    file_exists = isinstance(github_response, dict) and github_response.get("path") == target_path
    summary = {
        "bridgeStatus": bridge_status,
        "workflowFileVerified": file_exists,
        "targetPath": target_path,
        "repo": target_repo,
        "expectedStatuses": ["created", "updated"],
    }
    summary_path = output_dir / "bridge-summary.json"
    summary_path.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))

    if bridge_status not in {"created", "updated"} or not file_exists:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
