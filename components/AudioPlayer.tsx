"use client";
import { useEffect, useRef, useState } from "react";
import { Download, Pause, Play, Square } from "lucide-react";
import { Btn, inputCls } from "./ui";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function AudioPlayer({ src, name, onName }: { src: string; name: string; onName: (n: string) => void }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [d, setD] = useState(0);
  useEffect(() => { setPlaying(false); setT(0); }, [src]);
  const a = () => ref.current!;
  return (
    <div className="space-y-4">
      <audio ref={ref} src={src} preload="metadata"
        onLoadedMetadata={() => setD(a().duration)} onTimeUpdate={() => setT(a().currentTime)}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      <div className="flex items-center gap-3">
        <Btn onClick={() => (playing ? a().pause() : a().play())} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={16} /> : <Play size={16} />}{playing ? "Pause" : t > 0 ? "Resume" : "Play"}
        </Btn>
        <Btn variant="ghost" aria-label="Stop" onClick={() => { a().pause(); a().currentTime = 0; }}><Square size={14} />Stop</Btn>
        <span className="ml-auto text-xs tabular-nums text-mute">{fmt(t)} / {fmt(isFinite(d) ? d : 0)}</span>
      </div>
      <input type="range" aria-label="Seek" className="w-full" min={0} max={d || 1} step={0.1} value={t}
        onChange={(e) => (a().currentTime = Number(e.target.value))} />
      <div className="flex flex-wrap items-center gap-3">
        <input aria-label="File name" className={`${inputCls} max-w-xs`} value={name} onChange={(e) => onName(e.target.value)} />
        <a href={src} download={`${name.trim().replace(/[^\w\- ]+/g, "") || "voiceover"}.mp3`}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-raised px-4 py-2.5 text-sm hover:bg-line">
          <Download size={16} /> Download MP3
        </a>
      </div>
    </div>
  );
}
