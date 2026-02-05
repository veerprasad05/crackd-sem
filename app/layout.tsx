// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Crack'd Clone",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen text-cyan-100 antialiased bg-zinc-950 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.06),rgba(0,0,0,0)_55%),radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_35%,rgba(24,24,27,1)_100%)]">
        <div className="min-h-screen w-full p-6">
          <div className="flex min-h-[calc(100vh-3rem)] gap-6">
            <aside className="shrink-0">
              <Sidebar />
            </aside>

            <main className="flex-1 grid place-items-center">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
