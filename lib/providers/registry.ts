import { elevenLabs } from "./elevenlabs";
import { fishAudio } from "./fish-audio";
import type { ProviderId, ServerProvider } from "./types";

// Add a provider by importing its adapter and listing it here.
const providers: ServerProvider[] = [fishAudio, elevenLabs];

export const listProviders = () => providers;
export const getProvider = (id: string): ServerProvider | undefined => providers.find((p) => p.id === (id as ProviderId));
