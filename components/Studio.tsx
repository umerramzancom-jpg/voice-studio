"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic2, Pause, Play, RotateCcw, Square, Wand2 } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import VoiceList from "./VoiceList";
import { Btn, Card, Notice, inputCls } from "./ui";
import { browserSupported, loadBrowserVoices, speakBrowser } from "@/lib/providers/browser-tts";
import { DRAFT_KEY, VOICE_KEY, addHistory, loadHistory, type HistoryItem } from "@/lib/history";
import type { Capabilities, Voice } from "@/lib/providers/types";

interface ProviderInfo { id: string; label: string; status: string; configured: boolean; capabilities: Capabilities }
const EMOTIONS = ["", "happy", "calm", "excited"];

export default function Studio() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [provider, setProvider] = useState("fish-audio");
  const [text, setText] = useState("");
  const [voice, setVoice] = useState<Voice | null>(null);
  const [showVoices, setShowVoices] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [emotion, setEmotion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [name, setName] = useState("voiceover");
  const [recent, setRecent] = useState<HistoryItem[]>([]);
  const [sysVoices, setSysVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [sysVoiceName, setSysVoiceName] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const lastBlob = useRef("");

  useEffect(() => {
    fetch("/api/providers").then((r) => r.json()).then((j) => setProviders(j.providers)).catch(() => setError("Could not load providers."));
    try {
      setText(localStorage.getItem(DRAFT_KEY) ?? "");
      const v = localStorage.getItem(VOICE_KEY);
      if (v) setVoice(JSON.parse(v));
    } catch {}
    setRecent(loadHistory().slice(0, 5));
    loadBrowserVoices().then(setSysVoices);
    return () => { if (lastBlob.current) URL.revokeObjectURL(lastBlob.current); if (browserSupported()) speechSynthesis.cancel(); };
  }, []);
  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, text); } catch {} }, [text]);

  const info = providers.find((p) => p.id === provider);
  const isBrowser = provider === "browser";
  const caps: Capabilities | undefined = isBrowser ? { speed: true, pitch: true, stability: false, similarity: false, expressiveness: false, emotion: false, cloning: false, formats: [] } : info?.capabilities;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const pickVoice = (v: Voice) => { setVoice(v); setShowVoices(false); try { localStorage.setItem(VOICE_KEY, JSON.stringify(v)); } catch {} };
  const clearVoice = () => { setVoice(null); try { localStorage.removeItem(VOICE_KEY); } catch {} };

  const generate = useCallback(async () => {
    setError("");
    if (!text.trim()) return setError("Enter some text first.");
    if (isBrowser) {
      if (!browserSupported()) return setError("This browser does not support speech synthesis.");
      setSpeaking(true); setPaused(false);
      speakBrowser(text, sysVoices.find((v) => v.name === sysVoiceName), speed, pitch, () => { setSpeaking(false); setPaused(false); }, (m) => { setError(m); setSpeaking(false); });
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/tts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, text, voiceId: voice?.provider === provider ? voice.id : undefined, speed, emotion: emotion || undefined }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => null);
        throw new Error(j?.error?.message ?? `Generation failed (${r.status}).`);
      }
      const blob = await r.blob();
      if (lastBlob.current) URL.revokeObjectURL(lastBlob.current);
      const url = URL.createObjectURL(blob);
      lastBlob.current = url; setAudioUrl(url);
      const item: HistoryItem = {
        id: crypto.randomUUID(), name, provider, providerLabel: info?.label ?? provider, voiceName: voice?.name ?? "Provider default",
        text, characters: text.length, chunks: Number(r.headers.get("X-Chunks") ?? 1), createdAt: Date.now(),
      };
      addHistory(item); setRecent(loadHistory().slice(0, 5));
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }, [text, isBrowser, provider, voice, speed, pitch, emotion, sysVoices, sysVoiceName, name, info]);

  const blocked = !isBrowser && info && !info.configured;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <Card>
          <label htmlFor="script" className="mb-2 block text-sm font-medium">Script</label>
          <textarea id="script" value={text} onChange={(e) => setText(e.target.value)} rows={12}
            placeholder="Paste or write your script here. Long scripts are split into chunks automatically and joined in order."
            className={`${inputCls} resize-y leading-relaxed`} />
          <p className="mt-2 text-xs text-mute">{text.length.toLocaleString()} characters · {words.toLocaleString()} words</p>
        </Card>

        {error && (
          <Notice tone="error">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{error}</span>
              <Btn variant="ghost" onClick={generate} disabled={busy}><RotateCcw size={14} />Retry</Btn>
            </div>
          </Notice>
        )}

        {isBrowser && (
          <Card>
            <div className="flex flex-wrap gap-3">
              <Btn onClick={generate} disabled={speaking && !paused}><Play size={16} />Speak</Btn>
              <Btn variant="ghost" disabled={!speaking} onClick={() => { if (paused) { speechSynthesis.resume(); setPaused(false); } else { speechSynthesis.pause(); setPaused(true); } }}>
                {paused ? <><Play size={16} />Resume</> : <><Pause size={16} />Pause</>}
              </Btn>
              <Btn variant="ghost" disabled={!speaking} onClick={() => { speechSynthesis.cancel(); setSpeaking(false); setPaused(false); }}><Square size={14} />Stop</Btn>
            </div>
            <p className="mt-3 text-xs text-mute">Basic browser-generated speech. It plays on this device only, cannot be downloaded and does not support voice cloning.</p>
          </Card>
        )}

        {!isBrowser && (
          <Card>
            <Btn className="w-full sm:w-auto" onClick={generate} disabled={busy || !!blocked}>
              {busy ? <><Loader2 size={16} className="animate-spin" />Generating…</> : <><Wand2 size={16} />Generate voiceover</>}
            </Btn>
            {blocked && <p className="mt-3 text-sm text-mute">{info?.label} is not configured on the server. Add its API key to your environment variables and restart.</p>}
            {busy && <p className="mt-3 text-sm text-mute">Long scripts are generated in chunks and may take up to a minute.</p>}
            {audioUrl && !busy && <div className="mt-5 border-t border-line pt-5"><AudioPlayer src={audioUrl} name={name} onName={setName} /></div>}
          </Card>
        )}

        {recent.length > 0 && (
          <Card>
            <h2 className="mb-3 text-sm font-medium">Recent generations</h2>
            <ul className="divide-y divide-line text-sm">
              {recent.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="truncate">{h.name} <span className="text-mute">· {h.voiceName}</span></span>
                  <span className="shrink-0 text-xs text-mute">{new Date(h.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <aside className="space-y-6">
        <Card>
          <label htmlFor="prov" className="mb-2 block text-sm font-medium">Provider</label>
          <select id="prov" className={inputCls} value={provider} onChange={(e) => { setProvider(e.target.value); setError(""); }}>
            {providers.filter((p) => p.status === "available").map((p) => <option key={p.id} value={p.id}>{p.label}{p.configured ? "" : " (not configured)"}</option>)}
            <option value="browser">Browser voices (basic, free)</option>
            {providers.filter((p) => p.status === "planned").map((p) => <option key={p.id} value={p.id} disabled>{p.label} (coming in Phase 3)</option>)}
          </select>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-sm font-medium">Voice</h2>
          {isBrowser ? (
            <select aria-label="Browser voice" className={inputCls} value={sysVoiceName} onChange={(e) => setSysVoiceName(e.target.value)}>
              <option value="">System default</option>
              {sysVoices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
            </select>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-xl border border-line bg-raised px-3 py-2.5 text-sm">
                <Mic2 size={16} className="text-mute" />
                <span className="truncate">{voice ? voice.name : "Provider default voice"}</span>
                {voice && <button className="ml-auto text-xs text-mute hover:text-ink" onClick={clearVoice}>Clear</button>}
              </div>
              <Btn variant="ghost" className="w-full" onClick={() => setShowVoices(!showVoices)}>{showVoices ? "Hide voices" : "Browse voices"}</Btn>
            </>
          )}
        </Card>

        <Card className="space-y-4">
          <h2 className="text-sm font-medium">Voice settings</h2>
          {caps?.speed && (
            <div>
              <label htmlFor="speed" className="mb-1 flex justify-between text-xs text-mute"><span>Speed</span><span>{speed.toFixed(2)}×</span></label>
              <input id="speed" type="range" className="w-full" min={0.5} max={2} step={0.05} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
            </div>
          )}
          {caps?.pitch && (
            <div>
              <label htmlFor="pitch" className="mb-1 flex justify-between text-xs text-mute"><span>Pitch</span><span>{pitch.toFixed(1)}</span></label>
              <input id="pitch" type="range" className="w-full" min={0.5} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(Number(e.target.value))} />
            </div>
          )}
          {caps?.emotion && (
            <div>
              <label htmlFor="emo" className="mb-1 block text-xs text-mute">Delivery style</label>
              <select id="emo" className={inputCls} value={emotion} onChange={(e) => setEmotion(e.target.value)}>
                {EMOTIONS.map((e) => <option key={e} value={e}>{e || "Neutral"}</option>)}
              </select>
            </div>
          )}
          <p className="text-xs text-mute">Only controls supported by this provider are shown. {!isBrowser && "Stability, similarity and pitch are not available for Fish Audio."}</p>
        </Card>
      </aside>

      {showVoices && (
        <div className="lg:col-span-2">
          <Card><VoiceList provider={provider} selectedId={voice?.id} onSelect={pickVoice} /></Card>
        </div>
      )}
    </div>
  );
}
