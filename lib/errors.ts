import { NextResponse } from "next/server";
import { ProviderError } from "@/lib/providers/types";

export function errorResponse(e: unknown) {
  if (e instanceof ProviderError) return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: e.status });
  console.error(e);
  return NextResponse.json({ error: { code: "generation_failed", message: "Unexpected server error." } }, { status: 500 });
}

const hits = new Map<string, number[]>();
/** Best-effort in-memory limiter. Not reliable across serverless instances; replace with Redis/Upstash in Phase 5. */
export function rateLimited(ip: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  return list.length > limit;
}
