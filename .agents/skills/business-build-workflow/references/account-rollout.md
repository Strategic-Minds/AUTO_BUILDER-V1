# Account Rollout

This skill cannot force every GPT or workspace agent to behave differently unless it is added to those agents or their shared runtime/build packet.

## Rollout Pattern

1. Add `business-build-workflow` to the standard Strategic Minds / Auto Builder OS agent skill library.
2. Add the skill to Business Builder, Apex, QA, frontend, brand, and release agents.
3. Put this instruction in each agent profile:

`Use the business-build-workflow skill for every new business, website, funnel, app, or launch build. Do not build before the user selects the website pack option.`

4. Pair with `playwright-chromium-validation` for browser validation.
5. Store each project scaffold in Drive, GitHub, or the chosen workspace folder.

## Enforcement

Agents should reject shortcuts that skip:

- intake questions
- discovery
- brand pack
- website pack
- user selection gate
- testing
- hardening
- deployment approval

## Recommended Default Prompt

Bootstrap this project using the standard business-build-workflow. Ask only blocking questions, discover, plan, create the brand pack, create the website pack, wait for my selected website direction, build exactly that option, test, review, harden, and prepare deployment for approval.
