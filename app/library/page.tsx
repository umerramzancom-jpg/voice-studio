"use client";
import { useRouter } from "next/navigation";
import VoiceList from "@/components/VoiceList";
import { Card, PageTitle } from "@/components/ui";
import { VOICE_KEY } from "@/lib/history";
import type { Voice } from "@/lib/providers/types";

export default function Page() {
  const router = useRouter();
  const use = (v: Voice) => { try { localStorage.setItem(VOICE_KEY, JSON.stringify(v)); } catch {} router.push("/tts"); };
  return (
    <>
      <PageTitle title="Voice Library" sub="Public voices loaded live from Fish Audio. Search by name or language, preview a sample, then use it in the studio." />
      <Card><VoiceList pageSize={12} onSelect={use} actionLabel="Use in studio" /></Card>
    </>
  );
}
