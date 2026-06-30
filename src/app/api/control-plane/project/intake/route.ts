export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({
    ok: true,
    mode: body.mode || 'dry_run',
    receipt: {
      type: 'project_intake_received',
      status: 'planned',
      next_gate: 'discovery'
    }
  });
}
