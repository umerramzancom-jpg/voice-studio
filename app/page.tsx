"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, PageTitle } from "@/components/ui";
import { loadHistory, type HistoryItem } from "@/lib/history";

export default function Page() {
  const [recent, setRecent] = useState<HistoryItem[]>([]);
  const [providers, setProviders] = useState<{ id: string; label: string; status: string; configured: boolean }[]>([]);
  useEffect(() => {
    setRecent(loadHistory().slice(0, 5));
    fetch("/api/providers").then((r) => r.json()).then((j) => setProviders(j.providers)).catch(() => {});
  }, []);
  return (
    <>
      <PageTitle title="Welcome back" sub="Turn scripts into voiceovers. Start in the studio or browse voices first." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/tts" className="rounded-xl2 border border-accent/40 bg-accent-dim/40 p-5 hover:bg-accent-dim/60"><p className="font-medium">Open the studio</p><p className="mt-1 text-sm text-mute">Write a script and generate speech.</p></Link>
        <Link href="/library" className="rounded-xl2 border border-line bg-surface p-5 hover:bg-raised"><p className="font-medium">Browse the voice library</p><p className="mt-1 text-sm text-mute">Preview public voices and pick one.</p></Link>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-medium">Providers</h2>
          <ul className="space-y-2 text-sm">
            {providers.map((p) => <li key={p.id} className="flex justify-between"><span>{p.label}</span><span className="text-mute">{p.status === "planned" ? "Planned" : p.configured ? "Ready" : "Key missing"}</span></li>)}
            <li className="flex justify-between"><span>Browser voices</span><span className="text-mute">Ready</span></li>
          </ul>
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-medium">Recent generations</h2>
          {recent.length === 0 ? <p className="text-sm text-mute">Nothing yet.</p> : (
            <ul className="space-y-2 text-sm">{recent.map((h) => <li key={h.id} className="flex justify-between gap-3"><span className="truncate">{h.name}</span><span className="shrink-0 text-mute">{new Date(h.createdAt).toLocaleDateString()}</span></li>)}</ul>
          )}
        </Card>
      </div>
    </>
  );
}
