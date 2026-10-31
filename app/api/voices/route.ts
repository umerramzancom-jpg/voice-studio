import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/errors";
import { getProvider } from "@/lib/providers/registry";
import { ProviderError } from "@/lib/providers/types";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const p = getProvider(sp.get("provider") ?? "fish-audio");
    if (!p?.getVoices) throw new ProviderError("unsupported", "This provider does not offer a voice list.", 400);
    const data = await p.getVoices({
      search: sp.get("search") || undefined,
      language: sp.get("language") || undefined,
      page: Number(sp.get("page") ?? 1),
      pageSize: Math.min(Number(sp.get("pageSize") ?? 12), 30),
      mine: sp.get("mine") === "true",
    });
    return NextResponse.json(data);
  } catch (e) { return errorResponse(e); }
}
