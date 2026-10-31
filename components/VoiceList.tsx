"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Pause, Play, Search } from "lucide-react";
import type { Voice } from "@/lib/providers/types";
import { Btn, Notice, inputCls } from "./ui";

const LANGS = [["", "All languages"], ["en", "English"], ["zh", "Chinese"], ["ja", "Japanese"], ["ko", "Korean"], ["es", "Spanish"], ["fr", "French"], ["de", "German"], ["ar", "Arabic"], ["ru", "Russian"], ["pt", "Portuguese"]];

export default function VoiceList({ provider = "fish-audio", selectedId, onSelect, pageSize = 8, actionLabel = "Select voice" }: {
  provider?: string; selectedId?: string; onSelect: (v: Voice) => void; pageSize?: number; actionLabel?: string;
}) {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [language, setLanguage] = useState("");
  const [page, setPage] = useState(1);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const p = new URLSearchParams({ provider, page: String(page), pageSize: String(pageSize) });
    if (q) p.set("search", q);
    if (language) p.set("language", language);
    try {
      const r = await fetch(`/api/voices?${p}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message ?? "Could not load voices.");
      setVoices(j.voices); setTotal(j.total);
    } catch (e) { setError((e as Error).message); setVoices([]); }
    finally { setLoading(false); }
  }, [provider, page, pageSize, q, language]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => () => audio.current?.pause(), []);

  const preview = (v: Voice) => {
    if (!v.previewUrl) return;
    if (playing === v.id) { audio.current?.pause(); setPlaying(null); return; }
    audio.current?.pause();
    const a = new Audio(v.previewUrl);
    a.onended = () => setPlaying(null);
    a.onerror = () => { setPlaying(null); setError("Preview audio could not be played."); };
    audio.current = a; a.play().then(() => setPlaying(v.id)).catch(() => setError("Preview audio could not be played."));
  };

  return (
    <div className="space-y-4">
      <form className="flex flex-wrap gap-3" onSubmit={(e) => { e.preventDefault(); setPage(1); setQ(search); }}>
        <div className="relative min-w-[12rem] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-3 text-mute" />
          <input className={`${inputCls} pl-9`} placeholder="Search voices by name" aria-label="Search voices" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select aria-label="Language" className={`${inputCls} w-auto`} value={language} onChange={(e) => { setPage(1); setLanguage(e.target.value); }}>
          {LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Btn variant="ghost" type="submit">Search</Btn>
      </form>
      {error && <Notice tone="error">{error}</Notice>}
      {loading && <p className="text-sm text-mute">Loading voices…</p>}
      {!loading && !error && voices.length === 0 && <Notice>No voices match. Try a different name or language.</Notice>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {voices.map((v) => (
          <li key={v.id} className={`rounded-xl border p-4 ${selectedId === v.id ? "border-accent bg-accent-dim/40" : "border-line bg-raised"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{v.name}</p>
                <p className="truncate text-xs text-mute">{[v.languages.join(", "), v.author].filter(Boolean).join(" · ") || "Language not listed"}</p>
              </div>
              {v.previewUrl && (
                <button aria-label={playing === v.id ? `Pause preview of ${v.name}` : `Play preview of ${v.name}`} onClick={() => preview(v)} className="rounded-full border border-line p-2 hover:bg-line">
                  {playing === v.id ? <Pause size={14} /> : <Play size={14} />}
                </button>
              )}
            </div>
            {v.tags.length > 0 && <p className="mt-2 truncate text-xs text-mute">{v.tags.slice(0, 4).join(", ")}</p>}
            <Btn variant={selectedId === v.id ? "primary" : "ghost"} className="mt-3 w-full" onClick={() => onSelect(v)}>
              {selectedId === v.id ? <><Check size={14} /> Selected</> : actionLabel}
            </Btn>
          </li>
        ))}
      </ul>
      {total > pageSize && (
        <div className="flex items-center justify-between text-sm text-mute">
          <Btn variant="ghost" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>Previous</Btn>
          <span>Page {page} of {Math.ceil(total / pageSize)}</span>
          <Btn variant="ghost" disabled={page * pageSize >= total || loading} onClick={() => setPage(page + 1)}>Next</Btn>
        </div>
      )}
    </div>
  );
}
