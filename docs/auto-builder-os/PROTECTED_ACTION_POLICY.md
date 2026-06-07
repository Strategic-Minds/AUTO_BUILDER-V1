# AUTO BUILDER OS - Protected Action Policy

Protected actions require explicit approval and a receipt.

## Protected Actions

- production deploy
- production database migration
- secret change
- Shopify write
- Stripe/payment write
- live social publish
- customer message
- email send
- destructive file action
- credentialed browser action
- external spend

## Default

Default behavior is block, record hard-gate receipt, and request approval.
