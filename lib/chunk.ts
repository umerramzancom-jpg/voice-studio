/** Split a script into ordered chunks no longer than `max` characters, preferring sentence boundaries. */
export function chunkText(text: string, max = 800): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?。！？\n]+[.!?。！？]*\s*|\n+/g) ?? [clean];
  const chunks: string[] = [];
  let cur = "";
  const push = () => { if (cur.trim()) chunks.push(cur.trim()); cur = ""; };
  for (const s of sentences) {
    if (s.length > max) {
      push();
      const words = s.split(/\s+/);
      let part = "";
      for (let w of words) {
        while (w.length > max) { if (part) { chunks.push(part.trim()); part = ""; } chunks.push(w.slice(0, max)); w = w.slice(max); }
        if (part && (part + " " + w).length > max) { chunks.push(part.trim()); part = w; }
        else part = part ? part + " " + w : w;
      }
      cur = part;
      continue;
    }
    if ((cur + s).length > max) push();
    cur += s;
  }
  push();
  return chunks;
}
