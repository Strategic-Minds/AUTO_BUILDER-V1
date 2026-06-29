#!/usr/bin/env python3
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


def slugify(value: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "-" for ch in value).strip("-").replace("--", "-")


def main():
    parser = argparse.ArgumentParser(description="Create an Auto Image System run folder.")
    parser.add_argument("--brand", required=True)
    parser.add_argument("--campaign", required=True)
    parser.add_argument("--root", default="./image-runs")
    args = parser.parse_args()

    now = datetime.now(timezone.utc)
    run_id = f"{now.strftime('%Y%m%dT%H%M%SZ')}-{slugify(args.campaign)}"
    root = Path(args.root).resolve() / run_id
    for folder in ["00_prompt_batch", "01_source_images", "02_generated", "03_qa_review", "04_approved", "05_exports", "06_receipts"]:
        (root / folder).mkdir(parents=True, exist_ok=True)

    state = {
        "brand": args.brand,
        "campaign": args.campaign,
        "run_id": run_id,
        "status": "created",
        "created_at": now.isoformat(),
        "unified_ai_email": "ai@autobuilderos.com",
    }
    (root / "run-state.json").write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"run_folder": str(root), "run_id": run_id}, indent=2))


if __name__ == "__main__":
    main()
