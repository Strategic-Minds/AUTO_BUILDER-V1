import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AutoSocialReceipt } from "./types";

type PersistableRun = {
  operation: string;
  receipt: AutoSocialReceipt;
  preRunReflection?: unknown;
  postRunReflection?: unknown;
};

export type AutoSocialPersistenceResult = {
  mode: "supabase" | "memory_only";
  ok: boolean;
  receiptId: string;
  reason?: string;
};

export function getAutoSocialSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

export function createAutoSocialSupabaseAdminClient(): SupabaseClient | null {
  const { url, serviceRoleKey } = getAutoSocialSupabaseConfig();
  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export async function persistAutoSocialRun(run: PersistableRun): Promise<AutoSocialPersistenceResult> {
  const supabase = createAutoSocialSupabaseAdminClient();
  if (!supabase) {
    return {
      mode: "memory_only",
      ok: true,
      receiptId: run.receipt.id,
      reason: "SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not both configured."
    };
  }

  const { error } = await supabase.from("auto_social_receipts").insert({
    action: run.receipt.action,
    target: run.operation,
    ok: run.receipt.ok,
    gate: run.receipt.gate,
    production_action_allowed: false,
    evidence: run.receipt.evidence,
    rollback: {
      required: false,
      reason: "Sandbox-only receipt. No external mutation performed."
    }
  });

  if (error) {
    return {
      mode: "supabase",
      ok: false,
      receiptId: run.receipt.id,
      reason: error.message
    };
  }

  return {
    mode: "supabase",
    ok: true,
    receiptId: run.receipt.id
  };
}
