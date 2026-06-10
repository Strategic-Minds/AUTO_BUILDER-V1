# Build Packet Contract

## Purpose
Define how AUTO_BUILDER packages work for Strategic Minds Advisory.

## Scope
AUTO_BUILDER may generate and route controlled build packets. This contract does not authorize website UI changes, homepage edits, production deployment, live payments, live SMS, or secret handling.

## Target
- Target repo: XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory
- Target branch: feature/auto-builder-sync
- Mode: preview_only
- Framework: Vite React

## Required Packet Fields
- packet_id
- project
- source_truth
- target_repo
- target_branch
- requested_action
- changed_files
- validation_required
- release_gate_required
- rollback_plan
- drive_receipt_target

## Allowed Packet Actions
- docs update
- contract update
- preview validation request
- safe workflow receipt request

## Blocked Packet Actions
- homepage modification
- UI modification
- production deployment
- live payment processing
- live SMS sending
- customer messaging
- secret commit
- main branch write

## Completion Rule
A packet is accepted only when validation passes and operator approval is present for any gated action.
