#!/usr/bin/env python3
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


FOLDERS = [
    "00_INTAKE",
    "01_DISCOVERY/benchmarks",
    "01_DISCOVERY/reverse_engineering",
    "02_PLAN",
    "03_BRAND_PACK/assets",
    "03_BRAND_PACK/messaging",
    "04_WEBSITE_PACK/options",
    "04_WEBSITE_PACK/selected",
    "05_APPROVALS",
    "06_BUILD/src",
    "06_BUILD/public",
    "07_TESTING/screenshots",
    "07_TESTING/reports",
    "08_REVIEW/findings",
    "09_HARDENING/fixes",
    "10_DEPLOYMENT",
    "11_HANDOFF",
    "12_MEMORY",
    "13_RECEIPTS",
]


FILES = {
    "00_INTAKE/intake-questions.md": """# Intake Questions

- Business name:
- Offer/product:
- Target customer:
- Geography:
- Style references:
- Must-have pages:
- Must-have integrations:
- Existing assets:
- Deployment target:
- Approval owner:
""",
    "01_DISCOVERY/discovery-notes.md": """# Discovery Notes

## Benchmarks

## Strong Patterns

## Risks

## Opportunities
""",
    "02_PLAN/build-plan.md": """# Build Plan

## Goals

## Scope

## Pages

## Integrations

## Asset Requirements

## Approval Gates
""",
    "03_BRAND_PACK/brand-pack.md": """# Brand Pack

## Brand Core

## Voice

## Visual Direction

## Content System

## Governance
""",
    "04_WEBSITE_PACK/website-pack.md": """# Website Pack

## Option A - Premium Conversion

## Option B - App/Operational

## Option C - SEO-Maximal

## User Selection

Selected option:
Approval date:
Approved by:
""",
    "05_APPROVALS/approval-log.md": """# Approval Log

| Date | Gate | Decision | Owner | Notes |
|---|---|---|---|---|
""",
    "07_TESTING/test-report.md": """# Test Report

## Commands

## Routes

## Forms

## Browser Screenshots

## PWA

## Blockers
""",
    "08_REVIEW/review-findings.md": """# Review Findings

## Findings

## Severity

## Fix Plan
""",
    "09_HARDENING/hardening-log.md": """# Hardening Log

| Date | Defect | Fix | Validation | Owner |
|---|---|---|---|---|
""",
    "10_DEPLOYMENT/deployment-handoff.md": """# Deployment Handoff

## Target

## Required Secrets

## DNS

## Approval

## Rollback
""",
    "11_HANDOFF/final-handoff.md": """# Final Handoff

## What Was Built

## Selected Website Pack

## QA Score

## Links

## Remaining Blockers
""",
    "12_MEMORY/project-state.json": "{}\n",
}


def write_if_missing(path: Path, content: str):
    if not path.exists():
        path.write_text(content, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Bootstrap a governed business build folder system.")
    parser.add_argument("--name", required=True, help="Human-readable project or business name.")
    parser.add_argument("--slug", required=True, help="Filesystem-safe slug.")
    parser.add_argument("--root", default="./builds", help="Root output folder.")
    args = parser.parse_args()

    project_root = Path(args.root).resolve() / args.slug
    project_root.mkdir(parents=True, exist_ok=True)

    for folder in FOLDERS:
        (project_root / folder).mkdir(parents=True, exist_ok=True)

    for rel_path, content in FILES.items():
        write_if_missing(project_root / rel_path, content)

    state = {
        "project": args.name,
        "slug": args.slug,
        "phase": "INTAKE",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "workflow": [
            "INTAKE",
            "DISCOVERY",
            "PLAN",
            "BRAND_PACK",
            "WEBSITE_PACK",
            "USER_SELECTION_GATE",
            "BUILD",
            "TEST",
            "REVIEW",
            "HARDEN",
            "DEPLOY_GATE",
            "RELEASE_HANDOFF",
        ],
        "approval_required_before": ["website_selection", "deployment", "production_changes"],
    }
    (project_root / "12_MEMORY/project-state.json").write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")

    manifest = "\n".join(str(path.relative_to(project_root)) for path in sorted(project_root.rglob("*")))
    (project_root / "FOLDER_INDEX.txt").write_text(manifest + "\n", encoding="utf-8")

    print(json.dumps({"project_root": str(project_root), "phase": "INTAKE"}, indent=2))


if __name__ == "__main__":
    main()
