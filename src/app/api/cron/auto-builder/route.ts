export async function GET() {
  return Response.json({
    ok: true,
    mode: process.env.AUTO_BUILDER_MODE || 'dry_run',
    action: 'auto_builder_5_minute_heartbeat',
    timestamp: new Date().toISOString()
  });
}
