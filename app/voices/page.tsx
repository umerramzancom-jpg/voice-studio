import Link from "next/link";
import { Card, Notice, PageTitle } from "@/components/ui";

export default function Page() {
  return (
    <>
      <PageTitle title="My Voices" sub="Personal voice cloning is built in Phase 3, using Fish Audio's real voice-model API. Nothing here is simulated." />
      <Notice>Cloning is not available yet. Until then you can use any voice from the <Link href="/library" className="text-accent underline">Voice Library</Link>.</Notice>
      <Card className="mt-6">
        <h2 className="mb-3 text-sm font-medium">Recording guidance for Phase 3</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-mute">
          <li>Record in a quiet room with no background noise.</li>
          <li>Use one speaker only and speak naturally.</li>
          <li>Use good-quality audio (MP3, WAV or M4A).</li>
          <li>Only clone a voice that is yours or that you have explicit permission to use. A consent confirmation will be required.</li>
        </ul>
      </Card>
    </>
  );
}
