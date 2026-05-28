# SOL Environment Variable Matrix

Project: SOL Persistent Live Avatar Assistant v1
Repo: Strategic-Minds/AUTO_BUILDER
Mode: governed staging first

## Purpose
Define required environment variables, scope boundaries, secret handling rules, and staging versus production controls.

## Environment Matrix
| Variable | Required | Scope | Staging Handling | Production Handling | Notes |
|---|---:|---|---|---|---|
| OPENAI_API_KEY | Yes | Server only | Store as staging secret | Store as production secret only after approval | Never commit |
| OPENAI_MODEL | Yes | Server only | Use approved staging model | Promote after validation | Default candidate: gpt-4o-mini |
| NEXT_PUBLIC_SUPABASE_URL | Yes for app auth/data | Browser safe | Staging URL only | Production URL after approval | Public URL, not secret |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes for browser auth | Browser safe | Staging anon key only | Production anon key after approval | Public anon key, RLS required |
| SUPABASE_SERVICE_ROLE_KEY | Yes for admin routes | Server only | Staging secret only | Production secret after approval | Never expose to browser |
| HEYGEN_API_KEY | Yes for avatar generation | Server only | Staging secret only | Production secret after approval | Cost-bearing actions require gates |
| HEYGEN_SOL_AVATAR_ID | Yes for avatar route | Server only or config | Use ready staging avatar ID | Production after validation | Confirm avatar readiness |
| HEYGEN_SOL_VOICE_ID | Yes for voice route | Server only or config | Use validated SOL voice ID | Production after validation | Confirm voice compatibility |
| SOL_READ_ONLY_MODE | Yes | Server config | true | true until explicit production approval | Must be enforced in code |
| SOL_REQUIRE_APPROVALS | Yes | Server config | true | true | Must gate mutations |
| APP_BASE_URL | Yes | App config | Preview URL | Production URL after approval | Used for callbacks |

## Scope Separation
- Staging secrets must never be reused as production secrets unless explicitly approved.
- Production secrets must never be used in sandbox or preview tests.
- Public variables may be exposed to the browser but must not bypass RLS.
- Service role keys are server only and must never appear in client bundles, logs, screenshots, docs, or commits.

## Secret Storage Rules
1. Store secrets in Vercel environment settings or approved secret manager.
2. Never commit secret values.
3. Never paste raw secret values into docs.
4. Rotate any key that is accidentally exposed.
5. Record only variable names, not values, in logs.
6. Use separate keys for staging and production where supported.

## OpenAI Requirements
- OPENAI_API_KEY must be present for chat route runtime.
- OPENAI_MODEL must be explicitly configured.
- Route must validate input before model call.
- Policy gate must run before OpenAI call.
- Errors must not leak secrets.

## HeyGen Requirements
- HEYGEN_API_KEY must be present for avatar generation.
- HEYGEN_SOL_AVATAR_ID must reference a ready avatar.
- HEYGEN_SOL_VOICE_ID must reference a compatible voice.
- Video generation and streaming must be treated as cost-bearing.
- Repeated generation requires approval gate.

## Supabase Key Handling
- NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY may be used client side.
- SUPABASE_SERVICE_ROLE_KEY must be imported only in server-only files.
- RLS must be enabled before any user-facing data access.
- Service role bypass must be logged and minimized.

## Evidence Logging
Record:
- Environment target: staging or production
- Variable names present or missing
- Secret storage location type
- Validation timestamp
- Actor
- Blockers
- Workaround
- Approval state

## Stop Conditions
Pause before:
- Adding production secrets
- Rotating billing-linked API keys
- Using production database URLs
- Enabling public deployment
- Running cost-bearing avatar generation at scale
