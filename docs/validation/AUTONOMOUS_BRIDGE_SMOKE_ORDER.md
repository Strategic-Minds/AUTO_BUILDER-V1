# Autonomous Bridge Smoke Order

Run this widening sequence after the bridge suite is installed on a sandbox branch.

1. Heartbeat
2. Secret names only
3. Read harmless file
4. Write harmless file
5. Execute harmless command
6. Browser screenshot
7. Git status
8. Connector-by-connector widening

## Pass Conditions

- Heartbeat returns `ready` and `mutation: false`.
- Secret check returns names and missing/present booleans only; never values.
- Harmless file read is restricted to allowlisted paths.
- Harmless file write is branch/sandbox-only and receipt-backed.
- Harmless command is allowlisted and non-destructive.
- Browser screenshot captures public or preview pages only.
- Git status returns parsed branch and file state.
- Connector widening proceeds one connector at a time with explicit risk class and approval state.

## Stop Conditions

- Any secret value appears in logs.
- Any Class 2+ action lacks approval.
- Any connector attempts production, billing, commerce, social, Slack, or credentialed browser mutation without approval.
