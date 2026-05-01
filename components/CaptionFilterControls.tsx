"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CaptionSortMode, SelectOption } from "@/lib/caption-listing";

type CaptionFilterControlsProps = {
  sort: CaptionSortMode;
  featuredOnly: boolean;
  publicOnly: boolean;
  likedOnly: boolean;
  options: SelectOption[];
};

export default function CaptionFilterControls({
  sort,
  featuredOnly,
  publicOnly,
  likedOnly,
  options,
}: CaptionFilterControlsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const pushParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (typeof value === "string" && value.length > 0) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.set("page", "1");
    const nextSearch = params.toString();
    router.push(nextSearch ? `${pathname}?${nextSearch}` : pathname);
  };

  const toggleFlag = (
    key: "featured" | "public" | "liked",
    enabled: boolean
  ) => {
    pushParams({ [key]: enabled ? undefined : "true" });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-300/80 shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
        <span>Sort</span>
        <select
          value={sort}
          onChange={(event) =>
            pushParams({ sort: event.target.value as CaptionSortMode })
          }
          className="rounded-xl border border-white/10 bg-[#101016] px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
          aria-label="Sort captions"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => toggleFlag("featured", featuredOnly)}
        aria-pressed={featuredOnly}
        className={[
          "rounded-2xl px-4 py-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
          featuredOnly
            ? "bg-orange-500/15 text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.2)]"
            : "bg-black/40 text-zinc-300/80 ring-1 ring-white/10 hover:bg-black/60 hover:text-zinc-100",
        ].join(" ")}
      >
        Featured Only
      </button>

      <button
        type="button"
        onClick={() => toggleFlag("public", publicOnly)}
        aria-pressed={publicOnly}
        className={[
          "rounded-2xl px-4 py-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
          publicOnly
            ? "bg-orange-500/15 text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.2)]"
            : "bg-black/40 text-zinc-300/80 ring-1 ring-white/10 hover:bg-black/60 hover:text-zinc-100",
        ].join(" ")}
      >
        Public only
      </button>

      <button
        type="button"
        onClick={() => toggleFlag("liked", likedOnly)}
        aria-pressed={likedOnly}
        className={[
          "rounded-2xl px-4 py-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
          likedOnly
            ? "bg-orange-500/15 text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.2)]"
            : "bg-black/40 text-zinc-300/80 ring-1 ring-white/10 hover:bg-black/60 hover:text-zinc-100",
        ].join(" ")}
      >
        Liked by me
      </button>
    </div>
  );
}
