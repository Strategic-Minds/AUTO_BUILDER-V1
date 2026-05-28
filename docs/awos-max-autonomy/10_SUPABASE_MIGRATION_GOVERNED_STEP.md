# Governed Supabase Migration Step

## Status

Prepared but not executed.

## Purpose

Stage the live queue tables needed for AWOS queue materialization, approval gates, revenue ledgering, and content scheduling.

## Activation Rule

Do not execute this migration until the operator explicitly wants the live queue tables turned on.

## Target Migration File

- `supabase/migrations/20260528_awos_live_queue.sql`

## Activation Checklist

1. confirm production queue activation is desired now
2. confirm rollback expectation
3. execute migration
4. validate tables exist
5. confirm recursive-control can switch from synthetic queue state to persistent queue state
