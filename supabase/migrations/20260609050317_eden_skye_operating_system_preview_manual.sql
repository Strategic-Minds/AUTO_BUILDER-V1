-- Sync marker for the Supabase preview-branch migration applied through the native Supabase MCP.
-- The schema lives in 20260609050000_eden_skye_operating_system.sql.
-- This file prevents Supabase Git from reporting the preview branch remote migration version as missing locally.
select 1;
