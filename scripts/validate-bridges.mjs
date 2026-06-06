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

console.log("valid bridge contracts");
