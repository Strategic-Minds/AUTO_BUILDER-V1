#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const jsonFiles = [
  "docs/bridges/AUTONOMOUS_BRIDGE_REGISTRY.json",
  "docs/bridges/QUEUE_AND_RECEIPT_SCHEMA.json"
];

for (const file of jsonFiles) {
  JSON.parse(await readFile(file, "utf8"));
  console.log(`valid json: ${file}`);
}

const contract = await readFile("docs/bridges/OPENAPI_BRIDGE_CONTRACT.yaml", "utf8");
for (const marker of ["openapi:", "/snapshot:", "/receipts:", "bearerAuth:"]) {
  if (!contract.includes(marker)) throw new Error(`missing OpenAPI marker: ${marker}`);
}

const eventBusFiles = [
  "src/lib/bridge-event-bus.ts",
  "src/app/api/bridge/inbound/route.ts",
  "src/app/api/bridge/dispatch/route.ts",
  "src/app/api/bridge/events/route.ts",
  "src/app/api/bridge/connections/route.ts",
  "src/app/api/bridge/register/route.ts",
  "src/app/api/bridge/retry/route.ts",
  "supabase/migrations/20260606061000_awos_bridge_event_bus.sql"
];

for (const file of eventBusFiles) {
  const contents = await readFile(file, "utf8");
  if (!contents.trim()) throw new Error(`empty event bus file: ${file}`);
  console.log(`valid event bus file: ${file}`);
}

const migration = await readFile("supabase/migrations/20260606061000_awos_bridge_event_bus.sql", "utf8");
for (const marker of ["bridge_events", "bridge_connections", "bridge_credentials", "enable row level security", "supabase_realtime"]) {
  if (!migration.includes(marker)) throw new Error(`missing event bus migration marker: ${marker}`);
}

console.log("valid bridge contracts");
