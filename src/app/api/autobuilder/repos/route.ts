import { NextResponse } from "next/server";
import { repoRoles } from "@/lib/autobuilder";

export async function GET() {
  return NextResponse.json(repoRoles);
}
