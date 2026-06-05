# AWOS Template Factory

## Purpose

The AWOS Template Factory standardizes repeatable AUTO BUILDER modules with source truth, schemas, validation, approval gates, fallback routes, and evidence receipts.

Templates are accelerators, not live authorization. Every generated build still needs grounded source truth, sandbox-first execution where possible, connector capability checks, approval gates for consequential mutation, validation evidence, and rollback planning.

## Installed Registry

- `factory/template-modules/awos-template-factory.json`

## Installed Modules

- SaaS Starter
- Landing Page Lead Capture
- Content Machine
- Shopify Funnel
- Analytics Proof Report
- Proof Loop Review
- Browser QA Worker
- Queue Runner

## Generation Flow

1. Select a module.
2. Load grounded source truth.
3. Generate a builder-doc pack.
4. Generate an implementation plan.
5. Generate a validation checklist.
6. Generate a fallback route.
7. Run local or sandbox validation.
8. Store evidence.
9. Request approval for gated live execution.

## Governance

Approval remains required for:

- production deploys
- database mutation
- billing or spend
- external publishing
- mass outreach
- Shopify mutation
- environment-variable mutation
- irreversible infrastructure change

## Validation

The registry mirrors the memory-installed AWOS template factory created on 2026-06-05 and should be validated by parsing the JSON and checking that every module includes required source-truth, output, schema, validation, evidence, fallback, and approval-gate fields.
