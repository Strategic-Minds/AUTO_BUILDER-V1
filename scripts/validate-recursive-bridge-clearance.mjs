import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "docs/bridges/recursive-clearance/AUTONOMOUS_BRIDGE_REGISTRY.json",
  "docs/bridges/recursive-clearance/CONNECTOR_BRIDGE_ENV_CONTRACT.json",
  "docs/bridges/recursive-clearance/BLOCKER_BRIDGE_QUEUE.json",
  "docs/bridges/recursive-clearance/QUEUE_AND_RECEIPT_SCHEMA.json",
  "docs/bridges/recursive-clearance/OPENAPI_BRIDGE_CONTRACT.yaml",
  "docs/bridges/recursive-clearance/RECURSIVE_BRIDGE_CLEARANCE_REPORT.md",
  "docs/bridges/recursive-clearance/receipts/recursive-bridge-validation-2026-06-07.json",
  "src/app/api/bridge/registry/route.ts",
  "src/app/api/bridge/connectors/status/route.ts",
  "src/app/api/bridge/connectors/dry-run/route.ts",
  "src/app/api/bridge/connectors/execute-approved/route.ts",
  "src/app/api/bridge/unblock/scan/route.ts"
];

const requiredBridgeIds = [
  "gmail_connector_bridge",
  "google_calendar_connector_bridge",
  "metricool_connector_bridge",
  "google_chat_operator_bridge",
  "n8n_connector_bridge",
  "playwright_external_runner_bridge",
  "connector_unblock_router",
  "heygen_video_bridge",
  "higgsfield_media_bridge"
];

const errors = [];

for (const file of requiredFiles) {
  if (!existsSync(file)) errors.push(`Missing required file: ${file}`);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`Invalid JSON in ${path}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

const registry = readJson("docs/bridges/recursive-clearance/AUTONOMOUS_BRIDGE_REGISTRY.json");
if (registry) {
  const ids = new Set((registry.bridges || []).map((bridge) => bridge.id));
  if ((registry.bridges || []).length !== 20) errors.push(`Expected 20 bridges, found ${(registry.bridges || []).length}.`);
  for (const id of requiredBridgeIds) {
    if (!ids.has(id)) errors.push(`Registry missing bridge id: ${id}`);
  }
}

const blockerQueue = readJson("docs/bridges/recursive-clearance/BLOCKER_BRIDGE_QUEUE.json");
if (blockerQueue) {
  const blockers = blockerQueue.blockers || [];
  if (blockers.length < 9) errors.push(`Expected at least 9 blockers, found ${blockers.length}.`);
  for (const blocker of blockers) {
    if (!blocker.owner || !blocker.required_action || !blocker.next_test) {
      errors.push(`Blocker ${blocker.id || "unknown"} missing owner, required_action, or next_test.`);
    }
  }
}

const statusRoute = existsSync("src/app/api/bridge/connectors/status/route.ts")
  ? readFileSync("src/app/api/bridge/connectors/status/route.ts", "utf8")
  : "";
for (const marker of ["HEYGEN_API_KEY", "HIGGINGFIELD_API_KEY", "HIGGSFIELD_API_KEY"]) {
  if (!statusRoute.includes(marker)) errors.push(`status route missing env marker: ${marker}`);
}

const executeRoute = existsSync("src/app/api/bridge/connectors/execute-approved/route.ts")
  ? readFileSync("src/app/api/bridge/connectors/execute-approved/route.ts", "utf8")
  : "";
if (!executeRoute.includes("Unapproved Class 2+ action rejected")) {
  errors.push("execute-approved route does not include Class 2+ rejection marker.");
}
if (!executeRoute.includes("BRIDGE_LIVE_MUTATION_ENABLED")) {
  errors.push("execute-approved route does not include live mutation env gate.");
}

const openapi = existsSync("docs/bridges/recursive-clearance/OPENAPI_BRIDGE_CONTRACT.yaml")
  ? readFileSync("docs/bridges/recursive-clearance/OPENAPI_BRIDGE_CONTRACT.yaml", "utf8")
  : "";
for (const marker of ["/api/bridge/connectors/status", "/api/bridge/connectors/dry-run", "/api/bridge/connectors/execute-approved", "/api/bridge/unblock/scan"]) {
  if (!openapi.includes(marker)) errors.push(`OpenAPI contract missing marker: ${marker}`);
}

if (errors.length > 0) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  bridgeCount: 20,
  routeScaffolds: 5,
  blockersMapped: (blockerQueue?.blockers || []).length,
  mutation: false,
  nextAction: "Deploy preview and run live route smoke."
}, null, 2));
