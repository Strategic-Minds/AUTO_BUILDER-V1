# Wave 2: Drive Upload/Import And Video Generation Adapters

## Purpose

Restore the missing Google Drive upload/import surface and add governed draft-only video generation as the next AUTO_BUILDER MCP adapter wave after PR #25 route/readiness validation.

This wave directly addresses:

- Issue #26: expose Google Drive upload/import tools for Eden Skye ops.
- Issue #27: add governed video generation MCP tools for Eden Skye AUTO SOCIAL.

## Operating Rule

Wave 2 must stay sandbox-first and approval-gated.

Allowed before approval:

- read provider readiness,
- list Drive metadata,
- list avatar/voice/video metadata,
- validate dry-run payloads,
- write internal planning receipts,
- produce blocked/readiness receipts.

Not allowed before explicit approval:

- Drive writes to canonical folders,
- paid video generation,
- Metricool scheduling,
- public posting,
- comments/replies/DMs,
- n8n dispatch or activation,
- production deployment,
- Supabase production writes,
- external sharing changes.

## Adapter A: Google Drive Upload/Import

### Required Tools

- `run_drive_job`
- `drive_list_tree`
- `drive_create_folder`
- `drive_upload_file`
- `drive_upload_image`
- `drive_move_file`
- `drive_move_folder`
- `drive_write_receipt`

### Required Native Import Modes

`drive_upload_file` must support:

- raw upload with original MIME type,
- `.docx` to native Google Docs,
- `.xlsx`, `.csv`, `.tsv` to native Google Sheets,
- `.pptx` to native Google Slides.

### Required Inputs

```ts
type DriveUploadFileInput = {
  mode: "dry_run" | "approved_write";
  approved?: boolean;
  approvalId?: string;
  sourceFileRef: string;
  targetFolderIdOrUrl: string;
  targetName?: string;
  uploadMode: "raw" | "native_google_docs" | "native_google_sheets" | "native_google_slides";
  idempotencyKey?: string;
  receiptRequired: true;
};
```

### Required Outputs

```ts
type DriveUploadFileOutput = {
  status: "dry_run_pass" | "uploaded" | "blocked" | "failed";
  fileId?: string;
  fileUrl?: string;
  mimeType?: string;
  parentFolderId?: string;
  receiptId: string;
  blocker?: string;
};
```

### Sandbox Smoke

1. List target sandbox folder metadata.
2. Dry-run upload local text file.
3. Dry-run native Google Doc import.
4. Dry-run native Google Sheet import.
5. Dry-run image upload.
6. Confirm blocked if `mode=approved_write` and `approved !== true`.
7. After explicit approval only, create sandbox folder and upload one harmless test file.
8. Read back metadata and write receipt.

## Adapter B: Governed Video Generation

### Required Tools

- `run_video_job`
- `video_generate_draft`
- `video_lipsync_draft`
- `video_translate_draft`
- `video_status`
- `video_list_assets`
- `video_write_receipt`
- `video_quarantine_asset`
- `video_approve_asset`

### Provider Order

1. HeyGen primary.
2. Xyla optional creative/storyboard input when verified.
3. Google Drive archive after Adapter A is live.
4. Metricool draft scheduling after separate approval.
5. n8n later, after readiness passes.

### Required Inputs

```ts
type VideoGenerateDraftInput = {
  mode: "dry_run" | "approved_generation";
  approved?: boolean;
  approvalId?: string;
  provider: "heygen" | "xyla" | "manual";
  modelId: string;
  avatarId?: string;
  voiceId?: string;
  script: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
  durationTargetSeconds: number;
  platformTarget: "instagram" | "tiktok" | "youtube_shorts" | "facebook" | "pinterest" | "website";
  driveTargetFolderIdOrUrl?: string;
  contentSafetyClass: "public_safe" | "sensitive_review" | "quarantine";
  receiptRequired: true;
};
```

### Required Outputs

```ts
type VideoGenerateDraftOutput = {
  status: "dry_run_pass" | "queued" | "rendering" | "draft_ready" | "blocked" | "failed";
  jobId: string;
  providerJobId?: string;
  estimatedCostOrCredits?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  driveArchiveFileId?: string;
  receiptId: string;
  blocker?: string;
};
```

### Sandbox Smoke

1. List HeyGen profile/status.
2. List avatar looks.
3. List compatible voices.
4. Validate a harmless dry-run script.
5. Confirm no paid generation in dry-run mode.
6. Confirm blocked if `mode=approved_generation` and `approved !== true`.
7. After explicit approval only, create one low-risk draft video.
8. Poll status.
9. Archive metadata/video/thumbnail to Drive after Adapter A is live.
10. Mark output `draft_only` and `not_public_approved`.

## Health Check Contract

```json
{
  "googleDrive": {
    "read": true,
    "createFolder": true,
    "uploadFile": true,
    "uploadImage": true,
    "nativeDocsImport": true,
    "nativeSheetsImport": true,
    "nativeSlidesImport": true,
    "writeReceipt": true
  },
  "videoGeneration": {
    "readProviders": true,
    "listAvatars": true,
    "listVoices": true,
    "createDraftVideo": true,
    "pollStatus": true,
    "writeReceipt": true,
    "driveArchive": true,
    "quarantine": true,
    "approvalGate": true
  }
}
```

## Eden Skye First Import Targets

After Adapter A passes sandbox smoke and receives approval, import/archive:

- `/workspace/output/eden-skye-enterprise-image-library-ops-workbook.xlsx`
- `/workspace/output/eden-skye-enterprise-operating-system-plan.docx`
- `/workspace/output/eden-skye-os-render/eden-skye-enterprise-operating-system-plan.pdf`

Target Drive root:

- `https://drive.google.com/drive/folders/1uCsLaebFWtiMQ3T6A8i_NvgzWB6Kmxgk`

## Acceptance Criteria

- Tool discovery exposes every required Drive and video tool.
- Dry-run mode proves payload validation without external mutation.
- Approved-write mode refuses execution without `approved: true` and approval id.
- Sandbox upload/import test creates readback metadata receipt.
- Video dry-run creates readiness receipt without spending credits.
- One approved video draft remains draft-only, quarantined or approval-pending, and not scheduled/published.
