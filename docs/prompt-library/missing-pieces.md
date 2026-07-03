# Prompt Library Missing Pieces Manifest

These are the remaining capabilities the current autonomous build prompt system still needs to be fully enterprise-grade and self-building.

## Required Missing Pieces
1. Actual attached industry intelligence packs
   - The library needs real, attached, domain-specific intelligence packs instead of only taxonomy and abstract prompts.
   - These packs should be accessible as repo artifacts and referenced by prompt_id.

2. Actual canonical template repo content
   - The prompt system needs the real reusable template sources, not only taxonomy and structural descriptions.
   - Templates should be callable from prompt index entries and build packets.

3. Real external scraping / benchmark workers
   - The prompt library must have explicit workers or jobs for crawling, benchmarking, and evidence capture.
   - These workers need safety limits and receipt outputs.

4. Real browser worker integration
   - Browser execution should be a first-class prompt target and worker target, not just a script reference.
   - It must support desktop and mobile validation receipts.

5. Live control plane
   - The system needs a canonical live orchestration layer that owns routing, state, and governance.
   - Prompts should reference it directly when active.

6. Live score / repair / hardening queues
   - The prompt library needs dedicated prompts for scoring, repair, and hardening loops.
   - These should emit queue receipts and next-step pointers.

7. Live sync layer
   - The prompt system needs a sync contract for keeping state aligned across systems.
   - It should be indexed and versioned.

8. Accessible Supabase operational layer
   - The prompt library should point to a usable operational layer with read/write boundaries and receipt visibility.
   - It must be guarded and explicit.

9. Stronger production-grade cron family
   - The prompt system needs cron prompts tied to durable routing and validation receipts.
   - It should define 5-minute cadence and fallback behavior.

10. Actual starter template source repos attached or accessible
   - The prompt library needs access to the real starter/template repositories used for generation.
   - These should be referenced by file path or repo URL.

## Status
- These items are blocking for a fully hardened autonomous build system.
- They should be tracked as explicit gaps until attached, wired, or accessible from the repo.
