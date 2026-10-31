"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AudioLines, FolderOpen, History, LayoutDashboard, Library, Menu, Mic, Settings, X } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tts", label: "Text to Speech", icon: AudioLines },
  { href: "/voices", label: "My Voices", icon: Mic },
  { href: "/library", label: "Voice Library", icon: Library },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/history", label: "Generation History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = (
    <nav className="flex flex-col gap-1 p-3">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-accent-dim text-accent" : "text-mute hover:bg-raised hover:text-ink"}`}>
            <Icon size={18} /> {label}
          </Link>
        );
      })}
    </nav>
  );
  return (
    <>
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
        <span className="font-semibold">Voice Studio</span>
        <button aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-raised">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      {open && <div className="border-b border-line bg-surface md:hidden">{links}</div>}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-line bg-surface md:block">
        <div className="px-6 py-6 text-lg font-semibold tracking-tight">Voice Studio</div>
        {links}
      </aside>
    </>
  );
}
