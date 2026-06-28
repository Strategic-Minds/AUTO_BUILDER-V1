# Index, Taxonomy, and Memory Template

## Shared taxonomy domains
- systems
- modules
- prompts
- connectors
- sources
- lanes
- markets
- statuses
- blocker types
- risk levels
- delivery levels

## Index schemas
### Prompt index
Fields:
- prompt_id
- title
- system
- role
- lane
- input contract
- output contract
- status
- owner
- version
- tags

### Artifact index
Fields:
- artifact_id
- name
- type
- system
- canonical_path
- status
- source_of_truth
- version

### Memory ledger
Fields:
- memory_id
- timestamp
- system
- object_type
- object_id
- event_type
- delta_summary
- source_reference
- operator_or_agent
- recovery_value

## Rules
- append only where possible
- preserve timestamps
- separate evidence from inference
- never overwrite prior run truth silently
