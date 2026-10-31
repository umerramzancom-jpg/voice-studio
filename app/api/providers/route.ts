import { NextResponse } from "next/server";
import { listProviders } from "@/lib/providers/registry";

export async function GET() {
  return NextResponse.json({
    providers: listProviders().map((p) => ({
      id: p.id, label: p.label, description: p.description, status: p.status,
      configured: p.isConfigured(), capabilities: p.capabilities,
    })),
  });
}
