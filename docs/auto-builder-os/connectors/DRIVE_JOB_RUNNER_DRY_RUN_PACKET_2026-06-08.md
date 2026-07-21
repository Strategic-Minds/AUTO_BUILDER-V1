# Drive Job Runner Dry-Run Packet

Date: 2026-06-08
Branch: `auto-builder/drive-job-runner-20260608`
Mode: dry-run first, approved-write gated

## Purpose

Expose the remaining AUTO SOCIAL + EDEN SKYE STUDIOS Drive scaffold process through a manifest-based worker action without allowing live Drive writes by default.

The new worker action is:

```text
drive.runDriveJob
```

It is routed through the existing factory router shape:

```text
POST /api/factory/router
```

## Safety Rules

- `mode: dry_run` may inspect and report what would happen.
- `mode: approved_write` requires `approved: true` at the worker request level.
- `move_files` and `move_folders` are blocked even inside this runner unless a future exact-action runner is created.
- Delete, rename existing, publish, deploy, payment, and live social remain blocked policy actions.
- Receipt JSON upload only occurs in `approved_write` when `write_receipts: true`.

## Required Environment

```text
AUTO_BUILDER_EXECUTION_WORKER_ENABLED=true
AUTO_BUILDER_WORKER_TOKEN=<secret>
GOOGLE_DRIVE_ACCESS_TOKEN=<token>
```

or service-account auth:

```text
GOOGLE_CLIENT_EMAIL=<service account email>
GOOGLE_PRIVATE_KEY=<private key>
```

## Dry-Run Request Shape

```json
{
  "action": "drive.runDriveJob",
  "token": "<AUTO_BUILDER_WORKER_TOKEN>",
  "payload": {
    "job_id": "master-auto-builder-drive-scaffold-001",
    "mode": "dry_run",
    "root_folder_id": "1JAmLjo4UiD567C0Z_ogBxo3NELJK8L80",
    "root_folder_name": "MASTER AUTO BUILDER",
    "create_missing_folders": true,
    "write_receipts": true,
    "validate_tree": true,
    "folder_manifest": [
      "AUTO SOCIAL/00 Source Truth",
      "AUTO SOCIAL/01 Builder Docs",
      "AUTO SOCIAL/02 Active Builds",
      "AUTO SOCIAL/03 Receipts",
      "AUTO SOCIAL/04 Delivery Assets",
      "AUTO SOCIAL/05 Governance",
      "AUTO SOCIAL/06 Workflow Spine/WF-001 PLAN",
      "AUTO SOCIAL/06 Workflow Spine/WF-002 DISCOVERY",
      "AUTO SOCIAL/06 Workflow Spine/WF-003 STRATEGY",
      "AUTO SOCIAL/06 Workflow Spine/WF-004 CREATE",
      "AUTO SOCIAL/06 Workflow Spine/WF-005 REVIEW",
      "AUTO SOCIAL/06 Workflow Spine/WF-006 SCHEDULE",
      "AUTO SOCIAL/06 Workflow Spine/WF-007 POST",
      "AUTO SOCIAL/06 Workflow Spine/WF-008 ANALYZE",
      "AUTO SOCIAL/06 Workflow Spine/WF-009 IMPROVE",
      "AUTO SOCIAL/07 Stack Registry",
      "AUTO SOCIAL/08 ENV Registry",
      "AUTO SOCIAL/09 Agent Registry",
      "AUTO SOCIAL/10 Content Calendar",
      "AUTO SOCIAL/11 Campaign Tracker",
      "AUTO SOCIAL/12 Publishing Queue",
      "AUTO SOCIAL/13 Model Systems",
      "AUTO SOCIAL/14 Media Engine/Image Prompts",
      "AUTO SOCIAL/14 Media Engine/Video Prompts",
      "AUTO SOCIAL/14 Media Engine/HeyGen Jobs",
      "AUTO SOCIAL/14 Media Engine/Higgsfield Jobs",
      "AUTO SOCIAL/14 Media Engine/Xyla Jobs",
      "AUTO SOCIAL/14 Media Engine/Generated Images",
      "AUTO SOCIAL/14 Media Engine/Generated Videos",
      "AUTO SOCIAL/15 Social Channels/Facebook",
      "AUTO SOCIAL/15 Social Channels/Instagram",
      "AUTO SOCIAL/15 Social Channels/Snapchat",
      "AUTO SOCIAL/15 Social Channels/Pinterest",
      "AUTO SOCIAL/15 Social Channels/TikTok",
      "AUTO SOCIAL/15 Social Channels/X",
      "AUTO SOCIAL/15 Social Channels/YouTube",
      "AUTO SOCIAL/16 Validation",
      "AUTO SOCIAL/17 Approval Requests",
      "AUTO SOCIAL/18 Legal Compliance",
      "AUTO SOCIAL/19 Financial Strategy",
      "AUTO SOCIAL/20 Business Plan",
      "EDEN SKYE STUDIOS/00 Source Truth",
      "EDEN SKYE STUDIOS/01 Builder Docs",
      "EDEN SKYE STUDIOS/02 Active Builds",
      "EDEN SKYE STUDIOS/03 Receipts",
      "EDEN SKYE STUDIOS/04 Delivery Assets",
      "EDEN SKYE STUDIOS/05 Governance",
      "EDEN SKYE STUDIOS/06 Business Control",
      "EDEN SKYE STUDIOS/07 Brand System",
      "EDEN SKYE STUDIOS/08 Website Mockups",
      "EDEN SKYE STUDIOS/09 Website Content Machine",
      "EDEN SKYE STUDIOS/10 Model System/00 Contact Sheets",
      "EDEN SKYE STUDIOS/10 Model System/01 Roster Preview",
      "EDEN SKYE STUDIOS/10 Model System/Male Models Primary/25-50",
      "EDEN SKYE STUDIOS/10 Model System/Male Models Primary/50-80",
      "EDEN SKYE STUDIOS/10 Model System/Male Models Primary/International 18-35",
      "EDEN SKYE STUDIOS/10 Model System/Female Models/25-50",
      "EDEN SKYE STUDIOS/10 Model System/Female Models/50-80",
      "EDEN SKYE STUDIOS/10 Model System/Female Models/International 18-35",
      "EDEN SKYE STUDIOS/10 Model System/Mature Models 50-80",
      "EDEN SKYE STUDIOS/10 Model System/International Models 18-35",
      "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Luxury Lifestyle",
      "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/AI Business",
      "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Men's Style",
      "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Travel POV",
      "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Fitness",
      "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Wealth Mindset",
      "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Eden Closet",
      "EDEN SKYE STUDIOS/10 Model System/Faceless Accounts/Black Card",
      "EDEN SKYE STUDIOS/10 Model System/Model Registry",
      "EDEN SKYE STUDIOS/10 Model System/Shopify Card Map",
      "EDEN SKYE STUDIOS/10 Model System/Xyla Feed Records",
      "EDEN SKYE STUDIOS/10 Model System/Metricool Draft Prompts",
      "EDEN SKYE STUDIOS/11 Eden Closet Black Card",
      "EDEN SKYE STUDIOS/12 18 Plus Membership Routing",
      "EDEN SKYE STUDIOS/13 Xyla Feeds",
      "EDEN SKYE STUDIOS/14 Media Generation/Image Prompts",
      "EDEN SKYE STUDIOS/14 Media Generation/Video Prompts",
      "EDEN SKYE STUDIOS/14 Media Generation/HeyGen",
      "EDEN SKYE STUDIOS/14 Media Generation/Higgsfield",
      "EDEN SKYE STUDIOS/14 Media Generation/Xyla",
      "EDEN SKYE STUDIOS/14 Media Generation/Generated Images",
      "EDEN SKYE STUDIOS/14 Media Generation/Generated Videos",
      "EDEN SKYE STUDIOS/15 Content Calendar",
      "EDEN SKYE STUDIOS/16 Metricool Drafts",
      "EDEN SKYE STUDIOS/17 Supabase Runtime",
      "EDEN SKYE STUDIOS/18 Social Channels/Facebook",
      "EDEN SKYE STUDIOS/18 Social Channels/Instagram",
      "EDEN SKYE STUDIOS/18 Social Channels/Snapchat",
      "EDEN SKYE STUDIOS/18 Social Channels/Pinterest",
      "EDEN SKYE STUDIOS/18 Social Channels/TikTok",
      "EDEN SKYE STUDIOS/18 Social Channels/X",
      "EDEN SKYE STUDIOS/18 Social Channels/YouTube",
      "EDEN SKYE STUDIOS/19 Analytics Optimization",
      "EDEN SKYE STUDIOS/20 Validation",
      "EDEN SKYE STUDIOS/21 Approval Requests",
      "EDEN SKYE STUDIOS/22 Website Build Packets"
    ],
    "blocked_actions": [
      "delete",
      "rename_existing",
      "move_existing",
      "publish",
      "deploy",
      "payment",
      "live_social"
    ]
  }
}
```

## Approval Gate

Only after dry-run returns PASS/acceptable receipt, submit an approved-write request by changing:

```json
{
  "approved": true,
  "payload": {
    "mode": "approved_write"
  }
}
```

Do not run approved-write from an agent without Jeremy's explicit approval.

## Current Automation Status

- Branch-safe worker implementation created.
- Dry-run request packet created.
- No Drive mutation performed.
- No deploy or production mutation performed.
