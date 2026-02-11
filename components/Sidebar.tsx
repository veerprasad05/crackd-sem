// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarUserMenu from "@/components/SidebarUserMenu";

const navItems = [
  { href: "/hello-world", label: "Hello World" },
  { href: "/captions", label: "Captions List" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col rounded-2xl bg-[#15151b]/90 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_0_18px_50px_rgba(0,0,0,0.7)] p-4 backdrop-blur">
      <div className="text-center mb-5 text-[0.7rem] tracking-[0.4em] uppercase text-orange-300/80 [font-family:var(--font-heading)]">
        Veer's Humor Project
      </div>

      <nav className="flex flex-col gap-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "text-center rounded-xl uppercase px-4 py-3 text-[0.7rem] tracking-[0.32em]",
                "bg-black/40 ring-1 ring-white/10 text-zinc-300/80",
                "transition-colors hover:bg-black/60 hover:text-zinc-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50",
                active
                  ? "bg-orange-500/15 text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.25)]"
                  : "",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <SidebarUserMenu />
      </div>
    </div>
  );
}
