// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/hello-world", label: "Hello World" },
  { href: "/captions", label: "Captions List" }, // keep if you want it like screenshot 1
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.02] ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),_0_18px_50px_rgba(0,0,0,0.7)] p-4">
      <div className="mb-4 text-xs tracking-[0.22em] uppercase text-white/60">
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
                "rounded-xl px-4 py-3 text-sm ring-1 ring-white/10 bg-white/[0.03] text-white/80 transition-colors",
                "hover:bg-white/[0.05] hover:text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                active
                  ? "bg-white/[0.06] text-white ring-2 ring-white/70 shadow-[0_0_24px_rgba(255,255,255,0.08)]"
                  : "",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
