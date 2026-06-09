import { protectedLiveActions } from "./governance";

export type AutoSocialConnector = "heygen" | "metricool" | "xyla" | "google-drive" | "n8n";

export const autoSocialConnectors: AutoSocialConnector[] = ["heygen", "metricool", "xyla", "google-drive", "n8n"];

const envRequirements: Record<AutoSocialConnector, string[]> = {
  heygen: ["HEYGEN_API_KEY"],
  metricool: ["METRICOOL_API_KEY"],
  xyla: ["XYLA_API_KEY"],
  "google-drive": ["GOOGLE_DRIVE_CONNECTED_ACCOUNT"],
  n8n: ["N8N_API_ROOT", "N8N_API_KEY"]
};

export function getConnectorDryRun(connector: AutoSocialConnector) {
  const requiredEnv = envRequirements[connector];
  const configured = requiredEnv.filter((key) => Boolean(process.env[key]));
  const missing = requiredEnv.filter((key) => !process.env[key]);

  return {
    connector,
    ok: missing.length === 0,
    mode: "dry_run",
    productionActionAllowed: false,
    configured,
    missing,
    blockedLiveActions: protectedLiveActions,
    readiness:
      missing.length === 0
        ? "ready_for_authenticated_dry_run"
        : connector === "google-drive"
          ? "connector_available_but_runtime_env_unverified"
          : "missing_environment",
    nextAction:
      missing.length === 0
        ? "Run authenticated dry-run receipt in preview before enabling any write action."
        : `Configure ${missing.join(", ")} in the sandbox/preview environment before authenticated dry-run.`
  };
}

export function getAllConnectorDryRuns() {
  return autoSocialConnectors.map((connector) => getConnectorDryRun(connector));
}
