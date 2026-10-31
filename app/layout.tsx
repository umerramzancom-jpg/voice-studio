import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = { title: "Voice Studio", description: "Text-to-speech and voice cloning studio" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen md:flex">
        <Sidebar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-10">{children}</main>
      </body>
    </html>
  );
}
