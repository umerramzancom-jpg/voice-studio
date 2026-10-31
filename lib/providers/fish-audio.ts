import { chunkText } from "@/lib/chunk";
import {
  ProviderError, type ServerProvider, type SpeechRequest, type SpeechResult, type Voice, type VoiceQuery,
} from "./types";

// Endpoints and fields verified against https://docs.fish.audio (POST /v1/tts, GET /model).
const BASE = "https://api.fish.audio";
const TTS_MODEL = "s2-pro"; // sent in the `model` request header
const CHUNK_CHARS = 800;
const MAX_CHARS = 10_000; // keeps one request inside a 60s serverless window
const CONCURRENCY = 3;
const TIMEOUT_MS = 45_000;

function key(): string {
  const k = process.env.FISH_API_KEY;
  if (!k) throw new ProviderError("not_configured", "FISH_API_KEY is not set on the server.", 503);
  return k;
}

async function upstreamError(res: Response, voiceId?: string): Promise<ProviderError> {
  let detail = "";
  try { detail = (await res.text()).slice(0, 300); } catch {}
  switch (res.status) {
    case 401: return new ProviderError("auth", "Fish Audio rejected the API key. Check FISH_API_KEY.", 401);
    case 402: return new ProviderError("insufficient_credits", "Your Fish Audio account has insufficient credits.", 402);
    case 429: return new ProviderError("rate_limit", "Fish Audio rate limit reached. Wait a moment and retry.", 429);
    case 404:
      return voiceId
        ? new ProviderError("invalid_voice", "This voice is not available on Fish Audio. Choose another voice.", 404)
        : new ProviderError("generation_failed", `Fish Audio returned 404. ${detail}`, 502);
    default: return new ProviderError("generation_failed", `Fish Audio error ${res.status}. ${detail}`, 502);
  }
}

async function fishFetch(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw new ProviderError("timeout", "Fish Audio took too long to respond.", 504);
    throw new ProviderError("generation_failed", "Could not reach Fish Audio.", 502);
  } finally { clearTimeout(t); }
}

async function speakChunk(text: string, req: SpeechRequest): Promise<Buffer> {
  const marker = req.emotion ? `(${req.emotion}) ` : "";
  const body: Record<string, unknown> = { text: marker + text, format: "mp3" };
  if (req.voiceId) body.reference_id = req.voiceId;
  if (req.speed && req.speed !== 1) body.prosody = { speed: req.speed };
  const res = await fishFetch(`${BASE}/v1/tts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json", model: TTS_MODEL },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await upstreamError(res, req.voiceId);
  return Buffer.from(await res.arrayBuffer());
}

interface FishModel {
  _id: string; title?: string; description?: string; languages?: string[]; tags?: string[];
  samples?: { audio?: string }[]; author?: { nickname?: string; name?: string };
}

export const fishAudio: ServerProvider = {
  id: "fish-audio",
  label: "Fish Audio",
  description: "Primary provider. Neural TTS, public voice library and voice cloning.",
  status: "available",
  capabilities: {
    speed: true, pitch: false, stability: false, similarity: false,
    expressiveness: false, emotion: true, cloning: true, formats: ["mp3"],
  },
  isConfigured: () => Boolean(process.env.FISH_API_KEY),

  async getVoices(q: VoiceQuery) {
    const p = new URLSearchParams({ page_size: String(q.pageSize ?? 12), page_number: String(q.page ?? 1) });
    if (q.search) p.set("title", q.search);
    if (q.language) p.set("language", q.language);
    if (q.mine) p.set("self", "true");
    const res = await fishFetch(`${BASE}/model?${p}`, { headers: { Authorization: `Bearer ${key()}` } });
    if (!res.ok) throw await upstreamError(res);
    const data = (await res.json()) as { total?: number; items?: FishModel[] };
    const voices: Voice[] = (data.items ?? []).map((m) => ({
      id: m._id,
      name: m.title || "Untitled voice",
      provider: "fish-audio",
      languages: m.languages ?? [],
      tags: m.tags ?? [],
      description: m.description,
      author: m.author?.nickname ?? m.author?.name,
      previewUrl: m.samples?.[0]?.audio,
    }));
    return { voices, total: data.total ?? voices.length };
  },

  async generateSpeech(req: SpeechRequest): Promise<SpeechResult> {
    key(); // fail fast if not configured
    if (req.text.length > MAX_CHARS)
      throw new ProviderError("bad_request", `Script is too long for one request (max ${MAX_CHARS} characters for now).`, 400);
    const chunks = chunkText(req.text, CHUNK_CHARS);
    if (!chunks.length) throw new ProviderError("bad_request", "Enter some text first.", 400);
    const out: Buffer[] = new Array(chunks.length);
    for (let i = 0; i < chunks.length; i += CONCURRENCY) {
      const batch = chunks.slice(i, i + CONCURRENCY);
      const parts = await Promise.all(batch.map((c) => speakChunk(c, req)));
      parts.forEach((b, j) => (out[i + j] = b)); // keeps original order
    }
    return { audio: Buffer.concat(out), contentType: "audio/mpeg", chunks: chunks.length, characters: req.text.length };
  },
};
