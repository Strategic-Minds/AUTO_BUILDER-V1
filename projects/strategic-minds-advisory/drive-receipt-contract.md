# Drive Receipt Contract

## Purpose
Define the evidence trail stored in Google Drive for Strategic Minds Advisory workflow activity.

## Receipt Requirements
Each governed workflow run should produce a receipt containing:
- project name
- packet id
- repository
- branch
- commit receipts
- validation status
- timestamp
- operator approval state

## Storage Target
V2 MASTER AUTO BUILDER/STRATEGIC MINDS ADVISORY/03_BRIDGE_RECEIPTS

## Receipt Types
- build packet receipt
- validation receipt
- workflow receipt
- preview receipt
- release receipt
- rollback receipt

## Safety Rules
Receipts must not contain secrets, payment credentials, private keys, or customer-sensitive information.

## Completion Evidence
A workflow is not considered fully verified until GitHub receipts, Drive receipts, and Vercel receipts all exist.
