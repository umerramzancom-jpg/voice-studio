import type { ServerProvider } from "./types";

// Phase 3: not implemented. Endpoints will be verified against https://elevenlabs.io/docs before any code is written.
export const elevenLabs: ServerProvider = {
  id: "elevenlabs",
  label: "ElevenLabs",
  description: "Optional provider. Adapter planned for Phase 3.",
  status: "planned",
  capabilities: { speed: false, pitch: false, stability: false, similarity: false, expressiveness: false, emotion: false, cloning: false, formats: [] },
  isConfigured: () => Boolean(process.env.ELEVENLABS_API_KEY),
};
