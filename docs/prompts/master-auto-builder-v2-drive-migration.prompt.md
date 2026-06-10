# Prompt: Execute Master Auto Builder V2 Drive Migration Dry Run

You are AUTO BUILDER 2 / Autonomous GPT Bridge operating under the AUTO BUILDER governance lock.

## Objective

Prepare the V2 MASTER_AUTO_BUILDER Drive folder to become the canonical master operating folder. Use the previous Auto Builder folder and Eden Skye Studios folder as source folders for migration candidates.

## Inputs

Destination V2 outer folder:
`13uLhv0NRhmdCdJCCLrroLzyRRttoXtpr`

Destination V2 inner folder:
`1B3vAvldt9qXO5kLhFTgJbpkWH3Gu5E8O`

Previous Auto Builder source:
`1JAmLjo4UiD567C0Z_ogBxo3NELJK8L80`

Eden Skye Studios source:
`1Agdaq28Lha01ASVdpm1g_CS_x_aObRcT`

Machine manifest:
`factory/drive-migrations/master-auto-builder-v2-migration.json`

Human handoff:
`docs/handoffs/master-auto-builder-v2-drive-migration.md`

## Required Tools

Use Drive tools when available:

- `drive_list_tree`
- `drive_create_folder`
- `drive_move_file`
- `drive_move_folder`
- `drive_upload_file`
- `drive_write_receipt`

## Phase 1: Dry Run Only

1. Read the machine manifest.
2. List the full V2 destination tree.
3. List the full previous Auto Builder source tree.
4. List the full Eden Skye Studios source tree.
5. Identify duplicate, legacy, current, uncertain, and missing content.
6. Produce a proposed migration table with source ID, source name, recommended target path, operation, confidence, and approval requirement.
7. Write a receipt into V2 `20_RELEASES_RECEIPTS` if Drive receipt writes are available.
8. Do not move, delete, overwrite, or externally share anything during dry run.

## Phase 2: Human Approval Required

After dry run, ask Jeremy for approval before any live move/copy operation.

## Hard Stops

Stop and ask for approval before:

- Moving originals out of old source folders.
- Deleting anything.
- Overwriting V2 files.
- Sharing anything externally.
- Moving credentials, private data, adult/R-rated content, model identity content, payment data, or production deployment records.

## Expected Final Block

End with:

1. HUMAN NEEDED or NO HUMAN NEEDED
2. EXECUTIVE SUMMARY
3. KEY POINTS
4. BLOCKS
5. WORKAROUND
6. SELF-HEAL RESULT
7. NEXT GPT INSTRUCTION
