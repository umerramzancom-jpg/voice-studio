import { NextRequest, NextResponse } from "next/server";
import { errorResponse, rateLimited } from "@/lib/errors";
import { getProvider } from "@/lib/providers/registry";
import { ProviderError } from "@/lib/providers/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    if (rateLimited(ip)) throw new ProviderError("rate_limit", "Too many requests. Wait a minute and try again.", 429);
    const b = await req.json().catch(() => null);
    if (!b || typeof b.text !== "string") throw new ProviderError("bad_request", "Missing text.", 400);
    const p = getProvider(b.provider);
    if (!p?.generateSpeech) throw new ProviderError("unsupported", "This provider cannot generate speech on the server.", 400);
    if (!p.isConfigured()) throw new ProviderError("not_configured", `${p.label} is not configured. Add its API key to the server environment.`, 503);
    const speed = typeof b.speed === "number" ? Math.min(2, Math.max(0.5, b.speed)) : 1;
    const r = await p.generateSpeech({
      text: b.text, voiceId: b.voiceId || undefined, speed,
      emotion: typeof b.emotion === "string" && /^[a-z ]{1,24}$/i.test(b.emotion) ? b.emotion : undefined,
    });
    return new NextResponse(new Uint8Array(r.audio), {
      headers: { "Content-Type": r.contentType, "X-Chunks": String(r.chunks), "X-Characters": String(r.characters), "Cache-Control": "no-store" },
    });
  } catch (e) { return errorResponse(e); }
}
