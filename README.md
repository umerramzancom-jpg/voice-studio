# AI Voice Studio

Next.js 15 (App Router) + TypeScript + Tailwind. Phases 1–2: full responsive UI and real text-to-speech via Fish Audio, plus a free browser-voice fallback.

## Status

| Feature | Status |
|---|---|
| Dashboard, sidebar, responsive layout | Done |
| Text-to-speech studio (editor, counters, provider/voice pickers, speed, delivery style) | Done |
| Fish Audio TTS (`POST /v1/tts`), long-script chunking and ordered MP3 joining | Done, **untested with a real key** |
| Fish Audio voice list and previews (`GET /model`) | Done, **untested with a real key** |
| Player (play/pause/resume/stop/seek), rename, MP3 download | Done |
| Browser voices (basic, no download, no cloning) | Done |
| History (metadata + scripts, stored in this browser) | Done |
| ElevenLabs adapter | Phase 3 |
| Voice cloning (My Voices) | Phase 3 |
| WAV export, saved audio files, projects | Phase 4–5 |
| Supabase auth, database, RLS | Phase 5 |

## Setup

```bash
npm install
cp .env.example .env.local   # add FISH_API_KEY
npm run dev                  # http://localhost:3000
```

Get a Fish Audio key at https://fish.audio/app/api-keys. Keys are read only on the server; nothing is exposed to the browser.

## Architecture

- `lib/providers/types.ts` – provider interface and error codes
- `lib/providers/fish-audio.ts`, `elevenlabs.ts` (stub), `browser-tts.ts` (client-side)
- `lib/providers/registry.ts` – add a provider by listing it here
- `app/api/tts`, `app/api/voices`, `app/api/providers` – server routes
- Provider errors map to codes: `auth`, `rate_limit`, `insufficient_credits`, `invalid_voice`, `timeout`, `not_configured`, etc. The app never switches provider or voice silently.

## Notes and limits

- Fish TTS is called with the `model: s2-pro` header, `format: mp3`, and `prosody.speed`. Delivery style prepends an inline marker such as `(happy)` to each chunk, as Fish documents.
- Scripts over 800 characters are split at sentence boundaries, generated (3 at a time), and the MP3 parts are concatenated in order. Scripts are capped at 10,000 characters for now to fit a 60 s serverless window; Phase 4 moves long jobs to a background flow.
- Voice list response fields (`languages`, `tags`, `samples[].audio`, `author`) are read defensively; confirm them against a live response.
- The rate limiter is in-memory and best-effort. Replace with a shared store (e.g. Upstash) before public launch.
- UI primitives are hand-written shadcn-style components; run `npx shadcn@latest init` if you want the official registry later.

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add `FISH_API_KEY` under Project Settings → Environment Variables.
3. Deploy. `/api/tts` sets `maxDuration = 60`; check your Vercel plan's function limit.
