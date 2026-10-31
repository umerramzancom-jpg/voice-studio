"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Card, Notice, PageTitle } from "@/components/ui";
import { DRAFT_KEY, clearHistory, loadHistory, type HistoryItem } from "@/lib/history";

export default function Page() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => setItems(loadHistory()), []);
  return (
    <>
      <PageTitle title="Generation History" sub="Metadata and scripts from generations on this device. Saved audio files arrive with Supabase Storage in Phase 4–5." />
      {items.length === 0 ? <Notice>No generations yet. Create one in Text to Speech.</Notice> : (
        <Card>
          <ul className="divide-y divide-line">
            {items.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{h.name}</p>
                  <p className="truncate text-xs text-mute">{h.providerLabel} · {h.voiceName} · {h.characters.toLocaleString()} chars · {h.chunks} chunk{h.chunks > 1 ? "s" : ""} · {new Date(h.createdAt).toLocaleString()}</p>
                </div>
                <Btn variant="ghost" onClick={() => { try { localStorage.setItem(DRAFT_KEY, h.text); } catch {} router.push("/tts"); }}>Reuse script</Btn>
              </li>
            ))}
          </ul>
          <Btn variant="ghost" className="mt-4" onClick={() => { clearHistory(); setItems([]); }}>Clear history</Btn>
        </Card>
      )}
    </>
  );
}
