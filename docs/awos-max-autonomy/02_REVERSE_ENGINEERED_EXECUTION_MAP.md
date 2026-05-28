# Reverse Engineered Execution Map

## Target Behavior

A mature AUTO BUILDER runtime should look like this from the outside:

1. doctrine is inspectable through a dedicated route
2. cron fires every five minutes
3. runtime builds a queue from source truth and current blockers
4. safe work executes immediately
5. protected work is escalated and held cleanly
6. queue state, telemetry, and bridge state are persisted
7. optimization loops revise the next step automatically

## Reverse Engineered Build Sequence

### Phase 1
- normalize doctrine into repo docs
- expose doctrine through a live route
- bind recursive-control to the doctrine pack

### Phase 2
- materialize queue items from doctrine, blockers, and runtime evidence
- persist queue control events and bridge state
- surface queue preview through a live route

### Phase 3
- stage Supabase migration for true queue tables
- activate live queue tables only when approved
- shift queue materialization from synthetic to persistent

### Phase 4
- wire downstream workers to governed queue items
- keep protected actions held behind explicit approvals
- add replay, recovery, and rollback state

### Phase 5
- add optimization scoring
- auto-rank the next highest-value step
- keep doctrine, runtime, and queue state aligned

## Operating Rule

Never jump to the final autonomous claim. Build the loop in the same order it must survive in production.