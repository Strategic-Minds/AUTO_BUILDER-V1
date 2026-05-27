import { NextResponse } from "next/server";
import {
  DEFAULT_WRITEBACK_FIELDS,
  GOVERNED_MUTATION_TYPES,
  REQUIRED_SYNC_COLUMNS,
  WORKBOOK_REGISTRY,
  WORKBOOK_SYNC_VERSION,
} from "@/lib/workbook/contract";
import { WORKBOOK_SHEET_MAP } from "@/lib/workbook/sheet-map";

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: WORKBOOK_SYNC_VERSION,
    registry: WORKBOOK_REGISTRY,
    requiredSyncColumns: REQUIRED_SYNC_COLUMNS,
    defaultWritebackFields: DEFAULT_WRITEBACK_FIELDS,
    governedMutationTypes: GOVERNED_MUTATION_TYPES,
    sheetMap: WORKBOOK_SHEET_MAP,
  });
}
