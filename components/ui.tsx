import type { ReactNode } from "react";

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <section className={`rounded-xl2 border border-line bg-surface p-5 ${className}`}>{children}</section>
);
export const PageTitle = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    {sub && <p className="mt-1 max-w-2xl text-sm text-mute">{sub}</p>}
  </div>
);
export const Btn = ({ variant = "primary", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) => (
  <button {...p} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
    variant === "primary" ? "bg-accent text-black hover:bg-emerald-300" : "border border-line bg-raised text-ink hover:bg-line"} ${className}`} />
);
export const Notice = ({ tone = "info", children }: { tone?: "info" | "error"; children: ReactNode }) => (
  <div role={tone === "error" ? "alert" : undefined} className={`rounded-xl border px-4 py-3 text-sm ${tone === "error" ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-line bg-raised text-mute"}`}>{children}</div>
);
export const inputCls = "w-full rounded-xl border border-line bg-raised px-3 py-2.5 text-sm text-ink placeholder:text-mute";
