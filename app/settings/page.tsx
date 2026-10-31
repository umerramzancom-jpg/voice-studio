"use client";
import { useEffect, useState } from "react";
import { Card, Notice, PageTitle } from "@/components/ui";
import type { Capabilities } from "@/lib/providers/types";

interface P { id: string; label: string; description: string; status: string; configured: boolean; capabilities: Capabilities }

export default function Page() {
  const [list, setList] = useState<P[]>([]);
  const [err, setErr] = useState("");
  useEffect(() => { fetch("/api/providers").then((r) => r.json()).then((j) => setList(j.providers)).catch(() => setErr("Could not load provider status.")); }, []);
  return (
    <>
      <PageTitle title="Settings" sub="Provider status. API keys are read from server environment variables and never reach the browser." />
      {err && <Notice tone="error">{err}</Notice>}
      <div className="space-y-4">
        {list.map((p) => {
          const c = p.capabilities;
          const feats = [c.speed && "speed", c.pitch && "pitch", c.stability && "stability", c.similarity && "similarity", c.emotion && "delivery style", c.cloning && "voice cloning"].filter(Boolean).join(", ");
          return (
            <Card key={p.id}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-medium">{p.label}</h2>
                <span className={`rounded-full px-3 py-1 text-xs ${p.status === "planned" ? "bg-raised text-mute" : p.configured ? "bg-accent-dim text-accent" : "bg-red-500/10 text-red-200"}`}>
                  {p.status === "planned" ? "Planned" : p.configured ? "API key found" : "API key missing"}
                </span>
              </div>
              <p className="mt-1 text-sm text-mute">{p.description}</p>
              {feats && <p className="mt-2 text-xs text-mute">Supports: {feats}</p>}
            </Card>
          );
        })}
        <Card>
          <h2 className="font-medium">Browser voices</h2>
          <p className="mt-1 text-sm text-mute">Free, no key needed. Basic quality, plays on this device only, no downloads and no cloning.</p>
        </Card>
      </div>
    </>
  );
}
