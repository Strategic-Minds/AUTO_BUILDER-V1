# Media Drive Pipeline Smoke Test

## Objective

Validate the AUTO_BUILDER_2 Media Drive Pipeline scaffold without performing live Google Drive mutations.

## Route

`GET /api/mcp-media-drive-smoke`

## Expected sequence

1. Create or resolve folder tree.
2. Generate image asset.
3. Upload image.
4. Copy file.
5. Move file.
6. Download file.
7. Write receipt.

## Expected response

```json
{
  "status": "pass",
  "mode": "autonomous_logged_smoke",
  "liveMutation": false
}
```

## Validation checklist

- Route responds with HTTP 200.
- Seven smoke steps execute.
- No hard gates triggered.
- Receipts returned for each step.
- No production deployment.
- No external sharing.
- No delete operations.

## Failure conditions

- Any step returns `hard_gated`.
- Route throws an exception.
- Receipt generation fails.
- A live mutation occurs in scaffold mode.

## Recovery

Inspect the receipt payloads returned by the smoke route and validate governance classification before wiring live adapters.
