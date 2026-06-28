# System Delivery Levels

## 1. MVP
Goal: prove the workflow works.

Typical qualities:
- one narrow use case
- minimum connectors
- manual fallback allowed
- limited UI
- basic logging
- limited automation

Use when:
- the client is early
- requirements are uncertain
- budget is tight
- speed matters more than polish

## 2. Scaffold
Goal: produce a reusable starting system.

Typical qualities:
- clearer module boundaries
- initial docs and contracts
- prompt library starts to stabilize
- first real data model
- first scheduler loop
- basic admin UI shell

Use when:
- the client wants a platform, not just a demo
- multiple future modules are expected
- the operator needs a repeatable foundation

## 3. Production
Goal: operate continuously with safe writes and recoverability.

Typical qualities:
- environment separation
- runtime ledger
- quarantine and retry paths
- monitoring and heartbeat
- backup export path
- stronger contracts
- operator runbooks

Use when:
- the system affects revenue or operations
- the system must run daily or continuously
- failure must be controlled rather than tolerated

## 4. Enterprise
Goal: multi-surface, governed, durable operation.

Typical qualities:
- bounded orchestration
- role separation
- shared contracts and taxonomy
- security model
- auditability
- recovery and change control
- multi-team handoff
- serious documentation discipline

Use when:
- the system becomes a company capability
- multiple users or teams depend on it
- the client wants long-term maintainability
