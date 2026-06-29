# Auto Image System Runbook

## Daily Loop

1. Read `content_calendar.csv`.
2. Build a prompt batch from `prompt_registry.csv`.
3. Generate or queue images.
4. Review against `qa_checklist.md`.
5. Update `image_manifest.csv`.
6. Move approved work to channel folders.

## Roles

- Prompt Builder Agent: creates prompt variants.
- Image Generator Agent: generates or queues images.
- QA Review Agent: rejects weak realism or unsafe claims.
- Asset Librarian Agent: updates manifests and folder placement.
- Campaign Planner Agent: turns approved assets into social, website, ad, and email campaigns.

## Output States

- raw
- candidate
- approved
- rejected
- superseded
- published

## Required Metadata

- prompt ID
- finish category
- use case
- platform
- aspect ratio
- disclosure label
- QA status
- approval owner
