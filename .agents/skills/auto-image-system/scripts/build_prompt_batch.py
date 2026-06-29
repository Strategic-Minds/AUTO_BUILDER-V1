#!/usr/bin/env python3
import argparse
import csv
from pathlib import Path


DEFAULT_REGISTRY = Path(__file__).resolve().parents[1] / "assets/source-system/04_Manifests/prompt_registry.csv"


def main():
    parser = argparse.ArgumentParser(description="Build a prompt batch CSV from the canonical prompt registry.")
    parser.add_argument("--registry", default=str(DEFAULT_REGISTRY))
    parser.add_argument("--count", type=int, default=8)
    parser.add_argument("--output", default="./prompt_batch.csv")
    args = parser.parse_args()

    with open(args.registry, newline="", encoding="utf-8") as src:
        rows = list(csv.DictReader(src))

    selected = rows[: args.count]
    fields = [
        "batch_id",
        "prompt_id",
        "prompt_pack",
        "finish_category",
        "use_case",
        "platform",
        "aspect_ratio",
        "status",
        "disclosure_label",
        "qa_required",
    ]

    with open(args.output, "w", newline="", encoding="utf-8") as dst:
        writer = csv.DictWriter(dst, fieldnames=fields)
        writer.writeheader()
        for index, row in enumerate(selected, start=1):
            writer.writerow(
                {
                    "batch_id": f"BATCH-{index:04d}",
                    "prompt_id": row["prompt_id"],
                    "prompt_pack": row["prompt_pack"],
                    "finish_category": row["finish_category"],
                    "use_case": row["use_case"],
                    "platform": row["platform"],
                    "aspect_ratio": row["aspect_ratio"],
                    "status": "queued",
                    "disclosure_label": "AI-generated project concept",
                    "qa_required": "yes",
                }
            )

    print(f"Wrote {len(selected)} prompt rows to {args.output}")


if __name__ == "__main__":
    main()
