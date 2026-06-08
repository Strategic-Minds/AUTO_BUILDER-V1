import { actionCatalog } from "@/lib/autobuilder-v2/action-catalog";
import { providerRegistry } from "@/lib/autobuilder-v2/provider-registry";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    providers: providerRegistry.length,
    actions: actionCatalog.length,
    providerRegistry,
    actionCatalog
  });
}
