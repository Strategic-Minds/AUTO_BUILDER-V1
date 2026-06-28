# System Boundary and Change Control Template

## Canonical system names
- 
- 
- 

## Production lock rules
- what cannot be renamed:
- what cannot be re-architected during production:
- what can change safely:
- what must require explicit approval:

## Allowed routine changes
- prompts
- schedules
- quotas
- routing
- thresholds
- labels

## Forbidden routine changes
- schema redesign
- new uncontrolled apps
- silent connector swaps
- silent write-path changes
- deleting audit history

## Rollback rule
Document how to revert the last safe state.
