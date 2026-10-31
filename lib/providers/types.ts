export type ProviderId = "fish-audio" | "elevenlabs" | "browser";

export type ErrorCode =
  | "not_configured" | "auth" | "rate_limit" | "insufficient_credits" | "invalid_voice"
  | "unsupported" | "timeout" | "generation_failed" | "bad_request";

export class ProviderError extends Error {
  constructor(public code: ErrorCode, message: string, public status = 500) {
    super(message);
  }
}

export interface Voice {
  id: string;
  name: string;
  provider: ProviderId;
  languages: string[];
  tags: string[];
  description?: string;
  author?: string;
  previewUrl?: string;
}

export interface Capabilities {
  speed: boolean;
  pitch: boolean;
  stability: boolean;
  similarity: boolean;
  expressiveness: boolean;
  emotion: boolean;
  cloning: boolean;
  formats: string[];
}

export interface VoiceQuery {
  search?: string;
  language?: string;
  page?: number;
  pageSize?: number;
  mine?: boolean;
}

export interface SpeechRequest {
  text: string;
  voiceId?: string;
  speed?: number;
  emotion?: string;
}

export interface SpeechResult {
  audio: Buffer;
  contentType: string;
  chunks: number;
  characters: number;
}

/** Server-side provider adapter. Implement only what the provider supports. */
export interface ServerProvider {
  id: ProviderId;
  label: string;
  description: string;
  status: "available" | "planned";
  capabilities: Capabilities;
  isConfigured(): boolean;
  getVoices?(q: VoiceQuery): Promise<{ voices: Voice[]; total: number }>;
  generateSpeech?(req: SpeechRequest): Promise<SpeechResult>;
  // Phase 3: cloneVoice, getVoiceDetails, deleteVoice, getUsage
}
