# AI Consultant E2E Template Handbook

## What this package is for
Use this package when a business tells you what they want and you need to translate that into a fully scoped AI system that GPT can help design, document, scaffold, and harden.

## Consultant workflow
1. Run discovery.
2. Turn discovery into a pre-development brief.
3. Define the workflow boundary and success metrics.
4. Choose the delivery level.
5. Specify architecture, objects, indexes, memory, and environment.
6. Fill the Auto Builder canon documents.
7. Use GPT to generate prompts, scaffolds, code structures, UI specs, and runbooks.
8. Configure accounts and environment variables.
9. Test preview.
10. Promote to production.

## What makes a system complete
A complete system has:
- defined business outcome
- clear system boundary
- documented data objects
- connector and account map
- scheduler rules
- write gates
- quarantine path
- recovery path
- logs and memory
- frontend requirements
- release process

## What Auto Builder should do
Auto Builder should only build from canon documents.
It should detect missing canon, create the missing artifact, then continue.
It should not pretend a system is complete when the docs are incomplete.

## Best use of GPT
GPT is strongest at:
- extracting system requirements
- structuring documentation
- generating prompt packs
- generating repo scaffolds
- drafting admin UI specs
- creating contracts and runbooks
- identifying missing inputs

GPT is weaker when:
- live permissions are unclear
- business rules are not explicit
- connector truth is not verified
- the operator wants code without a system design

## Rule for consulting delivery
Never deliver a serious AI system without the docs that allow another GPT or operator to continue the work cleanly.
