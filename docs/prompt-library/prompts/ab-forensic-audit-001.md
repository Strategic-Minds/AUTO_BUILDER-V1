# Forensic Audit Prompt

prompt_id: ab-forensic-audit-001
version: 1.0.0
status: active
phase: audit

## Purpose
Perform a repo-grounded forensic audit of AUTO_BUILDER and identify what exists, what is missing, what overlaps, what is redundant, and what blocks completion.

## Required focus
- source of truth
- phase and step map
- agent routing
- workflow and cron
- validation and receipts
- browser validation
- handoff behavior
- leadership packaging

## Output requirements
- separate Verified, Inferred, and Could Not Verify
- name exact files
- name exact routes
- classify canonical vs supporting vs redundant vs stale
- identify the master spec recommendation
- identify the shortest path to completion
