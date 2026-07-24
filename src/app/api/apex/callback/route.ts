import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN!;
const SLACK_CHANNELS: Record<string, string> = {
  builds:    "C0BDV3Z0F9P",
  approvals: "C0BDT8DSA2W",
  leads:     "C0BDWT9PK0U",
  intel:     "C0BDLTRE3D1",
  alerts:    "C0BDR5TEN3G",
  revenue:   "C0BDPS7QKFX",
  ops:       "C0BEMGNCX4G",
};

async function postToSlack(channel: string, text: string) {
  const ch = SLACK_CHANNELS[channel] || SLACK_CHANNELS.ops;
  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { "Authorization": `Bearer ${SLACK_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ channel: ch, text, mrkdwn: true }),
  });
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get("authorization") || req.headers.get("x-apex-key") || "";
    const apiKey = authHeader.replace("Bearer ", "");
    if (!apiKey || apiKey !== process.env.APEX_CALLBACK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      agent,       // e.g. "business_builder", "brand_agent", "gpt_worker"
      task,        // e.g. "brand_pack_complete", "site_built", "leads_found"
      project,     // e.g. "NEP", "XPS", "PCU"
      status,      // "success" | "error" | "needs_approval"
      summary,     // Short summary (1-2 sentences)
      data,        // Full result payload
      slack_channel, // Which channel to notify: "builds","approvals","leads","ops"
      needs_approval, // boolean — send to approvals channel
    } = body;

    const ts = new Date().toISOString().replace("T", " ").slice(0, 16) + " EST";
    const icon = status === "success" ? "✅" : status === "error" ? "❌" : "⏳";

    // 1. Save to Supabase agent_memory for APEX to read
    await supabase.from("agent_memory").upsert({
      key: `callback_${agent}_${task}_${Date.now()}`,
      value: JSON.stringify({ agent, task, project, status, summary, data, received_at: ts }),
      importance: status === "error" ? 9 : needs_approval ? 8 : 6,
      tags: ["callback", agent, task, project || "general"],
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });

    // 2. Post to Slack
    const targetChannel = needs_approval ? "approvals" : (slack_channel || "ops");
    const slackMsg = needs_approval
      ? `${icon} *APPROVAL NEEDED — ${agent?.toUpperCase()}*\n*Project:* ${project || "N/A"} | *Task:* ${task}\n*Summary:* ${summary}\n\n_Reply with *approve ${project}* or *reject ${project}* in #apex-ops_`
      : `${icon} *${agent?.toUpperCase()} → ${task}*\n*Project:* ${project || "N/A"} | *Status:* ${status}\n*Summary:* ${summary}`;
    
    await postToSlack(targetChannel, slackMsg);

    // 3. Also notify #apex-ops for all events
    if (targetChannel !== "ops") {
      await postToSlack("ops", `${icon} [${agent}] ${task} on ${project}: ${summary}`);
    }

    return NextResponse.json({
      ok: true,
      received: { agent, task, project, status },
      posted_to: targetChannel,
      timestamp: ts,
    });

  } catch (err: any) {
    console.error("APEX callback error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — health check + connection test for GPT agents
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "APEX Callback MCP",
    agent_id: "6a3a1cc6fda8cc665dd22ea4",
    version: "1.0.0",
    endpoints: {
      callback: "POST /api/apex/callback",
      auth: "Header: x-apex-key: YOUR_APEX_CALLBACK_SECRET",
    },
    channels: ["ops","builds","approvals","leads","intel","alerts","revenue"],
    tasks: ["brand_pack_complete","site_built","leads_found","bid_submitted","report_ready","needs_approval"],
  });
}