import type { Capabilities } from "./types";

/** Client-side only. Basic browser speech: no API key, no cloning, no downloadable audio. */
export const browserCapabilities: Capabilities = {
  speed: true, pitch: true, stability: false, similarity: false, expressiveness: false, emotion: false, cloning: false, formats: [],
};

export const browserSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

export function loadBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!browserSupported()) return resolve([]);
    const have = speechSynthesis.getVoices();
    if (have.length) return resolve(have);
    const done = () => resolve(speechSynthesis.getVoices());
    speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1500);
  });
}

export function speakBrowser(text: string, voice: SpeechSynthesisVoice | undefined, rate: number, pitch: number, onEnd: () => void, onError: (m: string) => void) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (voice) { u.voice = voice; u.lang = voice.lang; }
  u.rate = rate; u.pitch = pitch;
  u.onend = onEnd;
  u.onerror = (e) => { if (e.error !== "canceled" && e.error !== "interrupted") onError(`Browser speech failed: ${e.error}`); else onEnd(); };
  speechSynthesis.speak(u);
}
