export interface HistoryItem {
  id: string; name: string; provider: string; providerLabel: string; voiceName: string;
  text: string; characters: number; chunks: number; createdAt: number;
}
const KEY = "vs.history";
export function loadHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
export function addHistory(item: HistoryItem) {
  try { localStorage.setItem(KEY, JSON.stringify([item, ...loadHistory()].slice(0, 100))); } catch {}
}
export function clearHistory() { try { localStorage.removeItem(KEY); } catch {} }
export const DRAFT_KEY = "vs.draft";
export const VOICE_KEY = "vs.voice";
