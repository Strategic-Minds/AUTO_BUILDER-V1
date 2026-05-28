# AUTO BUILDER MCP HELPER IMPLEMENTATION ARCHITECTURE

## Purpose
Define the TypeScript helper architecture for future implementation of Layer-1 and Layer-2 MCP executor tools. This architecture supports read-only and receipt-producing tools only. It must not mutate protected external systems.

## Current Status
AUTO BUILDER contains:
1. Hardened governance spine.
2. Recursive continuity architecture.
3. Operational workflow tree.
4. Validation architecture.
5. GPT MCP connected bridge.
6. MCP executor expansion roadmap.
7. Layer-1 and Layer-2 executor contracts.

## Implementation Boundary
This architecture prepares future code implementation for:
1. Shared MCP response envelope helper.
2. Approval-gate classifier.
3. Receipt ID generator.
4. Continuity receipt helper.
5. Recursive NEXT GPT INSTRUCTION generator.

Layer-1 and Layer-2 tools must remain read-only or receipt-producing. They must not write to Drive, Sheets, Supabase, Shopify, Stripe, Vercel env, billing, production deployments, or external publishing systems.

## Recommended File Structure

```text
src/lib/autobuilder/executors/
  envelope.ts
  approval.ts
  receipts.ts
  recursive-next-step.ts
  workflow-state.ts
  stack-status.ts
  index.ts
```

## Shared Types
Create shared types in `src/lib/autobuilder/executors/envelope.ts`.

```ts
export type AutoBuilderToolStatus = "ok" | "blocked" | "needs_human" | "error";

export type ApprovalStatus =
  | "not_required"
  | "required"
  | "approved"
  | "blocked";

export type GovernanceClassification =
  | "SAFE_READ_ONLY"
  | "SAFE_RECEIPT_ONLY"
  | "APPROVAL_REQUIRED"
  | "BLOCKED_PROTECTED_MUTATION";

export type EvidenceSet = {
  verified: string[];
  inferred: string[];
  couldNotVerify: string[];
};

export type GovernanceEnvelope = {
  mutationPerformed: boolean;
  protectedMutationRequested: boolean;
  approvalRequired: boolean;
  approvalStatus: ApprovalStatus;
  classification: GovernanceClassification;
};

export type AutoBuilderEnvelope<T> = EvidenceSet & {
  tool: string;
  status: AutoBuilderToolStatus;
  phaseStep: string;
  timestamp: string;
  governance: GovernanceEnvelope;
  result: T;
  blockers: string[];
  workarounds: string[];
  selfHeal: string[];
  nextStep: string;
};
```

## Shared Envelope Helper
Create `createEnvelope` in `envelope.ts`.

```ts
export function createEnvelope<T>(input: {
  tool: string;
  status?: AutoBuilderToolStatus;
  phaseStep: string;
  governance: GovernanceEnvelope;
  result: T;
  verified?: string[];
  inferred?: string[];
  couldNotVerify?: string[];
  blockers?: string[];
  workarounds?: string[];
  selfHeal?: string[];
  nextStep: string;
}): AutoBuilderEnvelope<T> {
  return {
    tool: input.tool,
    status: input.status ?? "ok",
    phaseStep: input.phaseStep,
    timestamp: new Date().toISOString(),
    governance: input.governance,
    result: input.result,
    verified: input.verified ?? [],
    inferred: input.inferred ?? [],
    couldNotVerify: input.couldNotVerify ?? [],
    blockers: input.blockers ?? [],
    workarounds: input.workarounds ?? [],
    selfHeal: input.selfHeal ?? [],
    nextStep: input.nextStep
  };
}
```

## Approval-Gate Classifier
Create `src/lib/autobuilder/executors/approval.ts`.

Protected target keywords:
1. workflow
2. governance
3. source-truth
4. billing
5. deployment
6. database
7. Drive canon
8. Sheets canon
9. Shopify write
10. Stripe money movement
11. Vercel env
12. Supabase schema
13. connector settings
14. authority file
15. live publishing

Classifier contract:

```ts
export function classifyApproval(input: {
  action: string;
  targetSystem?: string;
  mutationRequested?: boolean;
  receiptOnly?: boolean;
  explicitCurrentSessionApproval?: boolean;
}): GovernanceEnvelope {
  const target = `${input.action} ${input.targetSystem ?? ""}`.toLowerCase();
  const protectedKeywords = [
    "workflow",
    "governance",
    "source-truth",
    "billing",
    "deployment",
    "database",
    "drive canon",
    "sheets canon",
    "shopify write",
    "stripe money",
    "vercel env",
    "supabase schema",
    "connector",
    "authority",
    "publish"
  ];
  const protectedMutationRequested =
    input.mutationRequested === true && protectedKeywords.some((word) => target.includes(word));

  if (protectedMutationRequested && !input.explicitCurrentSessionApproval) {
    return {
      mutationPerformed: false,
      protectedMutationRequested: true,
      approvalRequired: true,
      approvalStatus: "blocked",
      classification: "BLOCKED_PROTECTED_MUTATION"
    };
  }

  if (input.mutationRequested) {
    return {
      mutationPerformed: false,
      protectedMutationRequested,
      approvalRequired: true,
      approvalStatus: input.explicitCurrentSessionApproval ? "approved" : "required",
      classification: "APPROVAL_REQUIRED"
    };
  }

  return {
    mutationPerformed: false,
    protectedMutationRequested: false,
    approvalRequired: false,
    approvalStatus: "not_required",
    classification: input.receiptOnly ? "SAFE_RECEIPT_ONLY" : "SAFE_READ_ONLY"
  };
}
```

## Receipt ID Generator
Create `src/lib/autobuilder/executors/receipts.ts`.

```ts
export function createReceiptId(input: {
  receiptType: string;
  phaseStep: string;
  action: string;
  createdAt?: string;
}) {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const normalized = `${input.receiptType}:${input.phaseStep}:${input.action}:${createdAt}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `abr-${normalized}`;
}
```

## Receipt Structure Helper
In `receipts.ts`:

```ts
export type AutoBuilderReceipt = {
  receiptId: string;
  receiptType: "continuity" | "execution" | "validation" | "blocker" | "recursive_next_step";
  phaseStep: string;
  actor: "AUTO_BUILDER_GPT_MCP";
  source: "GPT MCP";
  action: string;
  targetSystem: string;
  mutationPerformed: false;
  protectedMutationRequested: boolean;
  approvalRequired: boolean;
  verified: string[];
  inferred: string[];
  couldNotVerify: string[];
  blockers: string[];
  workarounds: string[];
  selfHeal: string[];
  nextInstruction: string;
  createdAt: string;
};

export function createReceipt(input: Omit<AutoBuilderReceipt, "receiptId" | "actor" | "source" | "mutationPerformed" | "createdAt">): AutoBuilderReceipt {
  const createdAt = new Date().toISOString();
  return {
    receiptId: createReceiptId({ receiptType: input.receiptType, phaseStep: input.phaseStep, action: input.action, createdAt }),
    actor: "AUTO_BUILDER_GPT_MCP",
    source: "GPT MCP",
    mutationPerformed: false,
    createdAt,
    ...input
  };
}
```

## Recursive NEXT GPT INSTRUCTION Generator
Create `src/lib/autobuilder/executors/recursive-next-step.ts`.

```ts
export function buildRecursiveNextInstruction(input: {
  currentPhaseStep: string;
  objective: string;
  summary: string;
  blockers?: string[];
  humanNeeded?: boolean;
}) {
  const blockers = input.blockers?.length ? input.blockers.join("; ") : "No current blockers.";
  return `${input.currentPhaseStep} :\n\nRehydrate AUTO BUILDER continuity from the AUTOBUILDER BRIDGE Ops Sheet, verified GPT MCP connection status, repo source truth, and active governance hierarchy.\n\nObjective: ${input.objective}\n\nSummary: ${input.summary}\n\nBlockers: ${blockers}\n\nMaintain governance-first execution, PHASE-X / STEP-Y progression, executive final block reporting, blocker/workaround/self-heal logging, recursive continuation logic, and autonomous continuity preservation. Do not mutate protected billing, deployment, database, Shopify, Stripe money movement, Vercel env, Supabase schema, Drive canon permissions, Sheets canon permissions, connectors, or authority rules unless Jeremy explicitly commands that exact mutation.`;
}
```

## Workflow State Helper
Create `src/lib/autobuilder/executors/workflow-state.ts`.

Responsibilities:
1. Normalize current phase/step.
2. Preserve objective.
3. Identify workflow lane.
4. Return readiness status.
5. Return human-needed state.
6. Return next governed action.

Output should use the shared envelope.

## Stack Status Helper
Create `src/lib/autobuilder/executors/stack-status.ts`.

Responsibilities:
1. Return locked stack.
2. Return verified GPT MCP connection status.
3. Return route summary.
4. Return executor maturity classification.
5. Return known gaps.

Output should use the shared envelope.

## Runtime Organization
MCP route should import executor helpers from:

```ts
import {
  getLiveStackStatus,
  getWorkflowState,
  createContinuityReceipt,
  createExecutionReceipt,
  createRecursiveNextStep
} from "@/lib/autobuilder/executors";
```

## Tool Registration Plan
Add MCP tools in `src/app/api/mcp/route.ts`:
1. `get_live_stack_status`
2. `get_workflow_state`
3. `create_continuity_receipt`
4. `create_execution_receipt`
5. `create_recursive_next_step`

## Validation Plan
1. Build must pass.
2. Existing MCP tools must remain registered.
3. New tools must return envelopes.
4. No tool may write external systems.
5. Protected mutation requests must classify as blocked or approval-required.
6. Receipts must include stable IDs.
7. Recursive next instruction must be copyable.

## Future Implementation Rule
Implement in sandbox-first sequence. Do not add live writes in Layer-1 or Layer-2.
