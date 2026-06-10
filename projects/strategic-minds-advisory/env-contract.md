# Environment Contract

## Purpose
Define required environment variable names for Strategic Minds Advisory when routed through AUTO_BUILDER and Vercel Workflow.

## Rule
This file lists names only. Secret values must never be committed to GitHub or pasted into chat.

## Required Target Names
- AUTO_BUILDER_SYNC_SECRET
- AUTO_BUILDER_CONTROL_REPO
- AUTO_BUILDER_TARGET_REPO
- AUTO_BUILDER_MODE
- VERCEL_AI_GATEWAY_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- STRIPE_WEBHOOK_SECRET
- TWILIO_FROM_NUMBER
- GOOGLE_DRIVE_ROOT_FOLDER_ID
- CRON_SECRET

## Server Only Names
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- GOOGLE_CLIENT_EMAIL
- GOOGLE_PRIVATE_KEY
- OPENAI_API_KEY

## Safety Gates
- Values are configured in Vercel or provider dashboards only.
- Values are not written to docs, code, receipts, logs, or screenshots.
- Production variables require operator approval before use.
