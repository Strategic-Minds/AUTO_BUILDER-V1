# Daily Schedule System

Timezone: America/New_York

## Daily 8:30 AM - Prompt Builder

Purpose:
Create prompt variants for today's content calendar items.

Output:
- 3 prompt variants per asset
- Negative prompt
- Filename
- Manifest draft row

## Daily 12:00 PM - Optional Image Generation

Purpose:
Generate draft images for rows marked `ready_for_generation`.

Output:
- Draft images in `06_Output_Queue`
- Status changed to `review`

## Daily 4:00 PM - QA Review

Purpose:
Review generated outputs for material realism, finish accuracy, and marketing readiness.

Output:
- `approved`, `revise`, or `rejected`
- QA notes
- Suggested regeneration prompt if needed

## Weekly Monday 10:00 AM - Campaign Planner

Purpose:
Plan the next week of image content across all finish categories.

## Monthly First Monday 11:00 AM - Finish Refresh

Purpose:
Refresh prompt sets, add seasonal ideas, add new local-market use cases, and update finish reference cards.
