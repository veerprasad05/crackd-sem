// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/hello-world", label: "Hello World" },
  { href: "/captions", label: "Captions List" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.02] ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),_0_18px_50px_rgba(0,0,0,0.7)] p-4">
      <div className="text-center mb-4 text-xs tracking-[0.22em] uppercase text-cyan-200/70">
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
                "text-center rounded-xl uppercase px-4 py-3 text-xs tracking-[0.22em] ring-1 ring-white/10 bg-white/[0.03] text-cyan-100/80 transition-colors",
                "hover:bg-white/[0.05] hover:text-cyan-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40",
                active
                  ? "bg-white/[0.06] text-cyan-100 ring-2 ring-cyan-200/70 shadow-[0_0_24px_rgba(34,211,238,0.2)]"
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
