#!/usr/bin/env python3
import argparse
import csv
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Validate a CSV manifest has headers and rows.")
    parser.add_argument("manifest")
    args = parser.parse_args()

    path = Path(args.manifest)
    result = {"manifest": str(path), "exists": path.exists(), "rows": 0, "headers": [], "status": "failed"}
    if not path.exists():
        print(json.dumps(result, indent=2))
        raise SystemExit(1)

    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        result["headers"] = reader.fieldnames or []
        result["rows"] = sum(1 for _ in reader)

    result["status"] = "passed" if result["headers"] and result["rows"] >= 0 else "failed"
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["status"] == "passed" else 1)


if __name__ == "__main__":
    main()
