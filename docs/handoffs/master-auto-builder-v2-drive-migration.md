# Master Auto Builder V2 Drive Migration Handoff

## Canonical Destination

Use the V2 Drive folder as the new canonical Master Auto Builder root.

- Outer folder: `13uLhv0NRhmdCdJCCLrroLzyRRttoXtpr`
- Inner folder: `1B3vAvldt9qXO5kLhFTgJbpkWH3Gu5E8O`
- Current inner title observed: ` MASTER_AUTO_BUILDER`
- Recommended inner title: `MASTER_AUTO_BUILDER`

The current inner folder has the expected V2 structure: `00_START_HERE`, `01_ADMIN_CONTROL_PLANE`, `02_INDEX_REGISTRY`, `03_MEMORY`, `04_TAXONOMY`, `05_SANDBOX`, `06_QUARANTINE`, `07_ARCHIVE`, `08_PROJECTS`, `09_WORKFLOWS`, `10_CONTENT`, `11_CRM_HUBSPOT`, `12_GOOGLE_WORKSPACE`, `13_GITHUB`, `14_VERCEL`, `15_SUPABASE`, `16_SHOPIFY_XYLA`, `17_SOCIAL_METRICOOL_HEYGEN`, `18_FINANCE`, `19_COMPLIANCE`, and `20_RELEASES_RECEIPTS`.

## Source Folders

### Previous Auto Builder

Root: `1JAmLjo4UiD567C0Z_ogBxo3NELJK8L80`

Observed top-level folders:

- `AUTO BUILDER` -> migrate/index under `00_START_HERE/legacy/AUTO_BUILDER` or receipts/source-truth legacy.
- `AUTO SOCIAL` -> migrate/index under `17_SOCIAL_METRICOOL_HEYGEN/legacy/AUTO_SOCIAL`.
- `AUTO WORKFLOW` -> migrate/index under `09_WORKFLOWS/legacy/AUTO_WORKFLOW`.
- `PROJECTS` -> migrate/index under `08_PROJECTS/legacy`.
- `SANDBOX` -> migrate/index under `05_SANDBOX/legacy`.
- `QUARENTINE` -> migrate/index under `06_QUARANTINE/legacy_QUARENTINE`.
- `INDEX` -> migrate/index under `02_INDEX_REGISTRY/legacy_INDEX`.
- `ARCHIEVE` -> migrate/index under `07_ARCHIVE/legacy_ARCHIEVE`.

Important source files observed:

- `AUTO_BUILDER_OS_WORKBOOK.xlsx`
- `AUTO_SOCIAL_OS_WORKBOOK.xlsm`
- `AUTO_WORKFLOW_OS_WORKBOOK_ALIGNED.xlsx`

These should be preserved as legacy canonical references and indexed before any overwrite decision.

### Eden Skye Studios

Root: `1Agdaq28Lha01ASVdpm1g_CS_x_aObRcT`

Observed top-level folders:

- `WEBSITE` -> `08_PROJECTS/EDEN_SKYE_STUDIOS/03_WEBSITE_APP`
- `WORKSPACE` -> review and split into intake, CRM, automation, and delivery folders as appropriate.
- `MODELS` -> `08_PROJECTS/EDEN_SKYE_STUDIOS/06_CONTENT/creator_models`
- `AUTO SOCIAL V1` -> `17_SOCIAL_METRICOOL_HEYGEN/legacy/AUTO_SOCIAL_V1`
- `INDEX` -> `02_INDEX_REGISTRY/legacy_EDEN_SKYE_INDEX`

Important source files observed:

- Eden Skye website image assets in `WEBSITE`.
- `DIGITAL ASSETS` and `eden_skye_drive_bootstrap_upload_ready` inside `WORKSPACE`.
- `IMAGES` and `INDEX` inside `MODELS`.

## Bridge Execution Mode

Use this manifest for execution:

`factory/drive-migrations/master-auto-builder-v2-migration.json`

Required bridge capabilities:

- `drive_list_tree`
- `drive_create_folder`
- `drive_move_file`
- `drive_move_folder`
- `drive_upload_file`
- `drive_write_receipt`

## Rules

1. Do not delete source files during first pass.
2. First pass should be index/copy/shortcut only whenever possible.
3. Require human approval before moving originals.
4. Require human approval before overwriting any V2 file.
5. Rename the destination inner folder from ` MASTER_AUTO_BUILDER` to `MASTER_AUTO_BUILDER` before indexing if the bridge has rename capability.
6. Write receipts into `20_RELEASES_RECEIPTS` for every action.
7. Update the V2 Drive index after every confirmed action.
8. Put uncertain, duplicate, unsafe, or low-confidence content into `06_QUARANTINE` with a reason.
9. Keep adult/R-rated/model identity content approval-gated and separate from public content folders.

## Recommended First Bridge Job

Run an index-only dry run:

1. List full tree for V2 destination.
2. List full tree for previous Auto Builder source.
3. List full tree for Eden Skye Studios source.
4. Create a migration receipt without moving originals.
5. Produce a proposed move/copy table.
6. Ask for human approval before executing file moves.

## Human Approval

No production move, external share, deletion, overwrite, adult-content move, credential move, or source-folder cleanup should happen without explicit approval from Jeremy in the active session.
