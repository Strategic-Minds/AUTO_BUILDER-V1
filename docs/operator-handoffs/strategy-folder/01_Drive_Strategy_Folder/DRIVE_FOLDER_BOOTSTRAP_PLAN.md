# Drive Folder Bootstrap Plan

Target folder ID: `1B6qh7cxE4mftl91w5SzwaTqB2Edsv3lm`

The AUTO_BUILDER connector accepted a dry-run plan for this manifest. The live tree could not be inspected because the Drive list adapter returned `not_implemented`; therefore Base44 must validate actual Drive access before writing.

## Create folders in missing-only mode

```json
{
  "root_folder_id": "1B6qh7cxE4mftl91w5SzwaTqB2Edsv3lm",
  "create_missing_folders": true,
  "folder_manifest": [
    "00_Source_Truth",
    "01_Strategy",
    "01_Strategy/00_Intake",
    "01_Strategy/01_Discovery",
    "01_Strategy/02_Competitive_Intelligence",
    "01_Strategy/03_Business_Plan",
    "01_Strategy/04_Business_Strategy",
    "01_Strategy/05_Financial_Plan",
    "01_Strategy/06_Automation_Roadmap",
    "01_Strategy/07_Brand_Packs"
  ]
}
```

## Folder policy
- Do not delete, rename, or move existing folders automatically.
- Create only missing folders.
- Write a JSON receipt into `99_Receipts`.
- After creation, run Drive tree validation and compare against `DRIVE_FOLDER_MANIFEST.json`.

## File population rule
Every project starts with Drive-first docs before GitHub/Supabase/Vercel.
