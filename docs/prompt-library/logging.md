# Prompt Logging Specification

## Purpose
Every prompt implementation and prompt execution must be logged so the system can analyze itself, validate itself, and resume safely.

## Log Targets
Prompt execution and implementation events should be recorded in:
- Git commit history
- validation receipts
- prompt library index updates
- runtime job receipts
- optional future prompt-log files under `docs/prompt-library/logs/`

## Required Fields
Every prompt log entry should include:
- `prompt_id`
- `title`
- `version`
- `timestamp`
- `actor`
- `branch`
- `target`
- `status`
- `receipt_path`
- `artifact_paths`
- `blocker`
- `next_action`
- `resume_pointer`

## Logging Rules
1. Log every implementation of a prompt, taxonomy, or index update.
2. Log every prompt execution that changes repo state.
3. Log every validation run that is prompted through the library.
4. Log blockers explicitly.
5. Log the next action explicitly.
6. If a prompt fails, the log must still record the failure and the fallback path.

## Canonical Pattern
Use machine-readable JSON for index and receipts, and Markdown for human-readable summaries.

## Future Extension
If prompt run history grows beyond a few entries, create a dedicated append-only log file set:
- `docs/prompt-library/logs/YYYY-MM-DD.md`
- `docs/prompt-library/logs/YYYY-MM-DD.jsonl`
