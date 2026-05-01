import Link from "next/link";
import { FastForward, Rewind } from "lucide-react";
import { buildPageHref, buildPageItems } from "@/lib/caption-listing";

type PaginationProps = {
  pathname: string;
  currentPage: number;
  totalPages: number;
  queryParams: Record<string, string | undefined>;
};

export default function Pagination({
  pathname,
  currentPage,
  totalPages,
  queryParams,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const preservedParams = Object.entries(queryParams).filter(
    ([, value]) => typeof value === "string" && value.length > 0
  );

  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      <p className="text-sm text-zinc-300/75">
        Page {currentPage} of {totalPages}
      </p>

      <nav
        className="flex flex-wrap items-center justify-center gap-2 text-[0.65rem] uppercase tracking-[0.4em] text-zinc-400/80"
        aria-label="Pagination"
      >
        <Link
          href={buildPageHref(
            pathname,
            Math.max(1, currentPage - 1),
            queryParams
          )}
          aria-disabled={currentPage === 1}
          aria-label="Previous page"
          className={[
            "rounded-full px-3 py-2 ring-1 ring-white/10 transition",
            currentPage === 1
              ? "pointer-events-none opacity-40"
              : "hover:text-orange-200 hover:ring-orange-400/60",
          ].join(" ")}
        >
          <Rewind className="h-4 w-4" aria-hidden="true" />
        </Link>

        {buildPageItems(currentPage, totalPages).map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span key={`ellipsis-${index}`} className="px-2">
                ...
              </span>
            );
          }

          const isActive = item === currentPage;

          return (
            <Link
              key={`page-${item}`}
              href={buildPageHref(pathname, item, queryParams)}
              aria-current={isActive ? "page" : undefined}
              className={[
                "inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 py-0 text-center leading-none ring-1 ring-white/10 transition",
                isActive
                  ? "text-orange-200 ring-2 ring-orange-400/70 shadow-[0_0_16px_rgba(255,120,0,0.35)]"
                  : "hover:text-orange-200 hover:ring-orange-400/60",
              ].join(" ")}
            >
              {item}
            </Link>
          );
        })}

        <Link
          href={buildPageHref(
            pathname,
            Math.min(totalPages, currentPage + 1),
            queryParams
          )}
          aria-disabled={currentPage === totalPages}
          aria-label="Next page"
          className={[
            "rounded-full px-3 py-2 ring-1 ring-white/10 transition",
            currentPage === totalPages
              ? "pointer-events-none opacity-40"
              : "hover:text-orange-200 hover:ring-orange-400/60",
          ].join(" ")}
        >
          <FastForward className="h-4 w-4" aria-hidden="true" />
        </Link>
      </nav>

      <form action={pathname} className="flex items-center gap-3 text-sm text-zinc-300/75">
        {preservedParams.map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <label htmlFor="page-jump">Jump to page</label>
        <input
          id="page-jump"
          name="page"
          type="number"
          min={1}
          max={totalPages}
          defaultValue={currentPage}
          className="h-10 w-20 rounded-xl border border-white/10 bg-[#101016] px-3 py-0 text-center text-sm leading-none text-zinc-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
        />
        <button
          type="submit"
          className="rounded-xl bg-black/40 px-4 py-2 text-sm text-zinc-200 ring-1 ring-white/10 transition hover:bg-black/60 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
        >
          Go
        </button>
      </form>
    </div>
  );
}
