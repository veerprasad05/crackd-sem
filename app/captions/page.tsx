import {
  Card,
  CardCaption,
  CardImage,
  type CaptionEntry,
} from "@/components/Card";
import { VoteCount } from "@/components/VoteCount";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FastForward, Rewind } from "lucide-react";
import { redirect } from "next/navigation";

const TABLES = ["images", "caption_likes", "caption_saved", "shares", "captions"];

type TableResult = {
  table: string;
  row: Record<string, unknown> | null;
  columns: string[];
  error?: string;
};

function inferType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) return "date";
  const t = typeof value;
  if (t === "object") return "object";
  return t;
}

type PageProps = {
  searchParams?: Promise<{ page?: string }>;
};

function clampPage(value: string | undefined, totalPages: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  if (totalPages > 0 && parsed > totalPages) return totalPages;
  return parsed;
}

function buildPageItems(current: number, total: number) {
  if (total <= 1) return [1];
  const items: Array<number | "ellipsis"> = [];
  const range = 2;
  const start = Math.max(2, current - range);
  const end = Math.min(total - 1, current + range);

  items.push(1);
  if (start > 2) items.push("ellipsis");
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

export default async function CaptionsPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/");
  }
  
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const results = await Promise.all(
    TABLES.map(async (table): Promise<TableResult> => {
      const { data, error } = await supabase.from(table).select("*").limit(1);
      if (error) {
        return { table, columns: [], row: null, error: error.message };
      }
      const row = data && data.length > 0 ? (data[0] as Record<string, unknown>) : null;
      const columns = row ? Object.keys(row) : [];
      return { table, columns, row };
    })
  );
  const perPage = 50;
  const { count: totalCaptionCount, error: captionsCountError } = await supabase
    .from("captions")
    .select("id", { count: "exact", head: true });

  const totalPages = Math.max(
    1,
    Math.ceil((totalCaptionCount ?? 0) / perPage)
  );
  const currentPage = clampPage(resolvedSearchParams?.page, totalPages);
  const rangeStart = (currentPage - 1) * perPage;
  const rangeEnd = rangeStart + perPage - 1;

  const { data: captionsData, error: captionsError } = await supabase
    .from("captions")
    .select("id, image_id, content")
    .not("content", "is", null)
    .neq("content", "")
    .order("id", { ascending: true })
    .range(rangeStart, rangeEnd);

  const captionRows = Array.isArray(captionsData) ? captionsData : [];
  const captionIds = Array.from(
    new Set(
      captionRows
        .map((caption) => (caption as Record<string, unknown>).id)
        .filter(
          (id): id is string | number =>
            typeof id === "string" || typeof id === "number"
        )
    )
  );
  const imageIds = Array.from(
    new Set(
      captionRows
        .map((caption) => (caption as Record<string, unknown>).image_id)
        .filter(
          (id): id is string | number =>
            typeof id === "string" || typeof id === "number"
        )
    )
  );

  const { data: imagesForCaptions, error: imagesForCaptionsError } =
    imageIds.length
      ? await supabase.from("images").select("id, url").in("id", imageIds)
    : { data: null, error: null };

  const imagesById = new Map<string | number, { id: string | number; url?: string }>();
  if (Array.isArray(imagesForCaptions)) {
    imagesForCaptions.forEach((image) => {
      const row = image as Record<string, unknown>;
      const imageId = row.id;
      if (typeof imageId !== "string" && typeof imageId !== "number") return;
      imagesById.set(imageId, {
        id: imageId,
        url: row.url as string | undefined,
      });
    });
  }

  const { data: captionVotes, error: captionVotesError } = captionIds.length
    ? await supabase
        .from("caption_votes")
        .select("caption_id, vote_value")
        .in("caption_id", captionIds)
    : { data: null, error: null };

  const votesByCaptionId = new Map<string | number, number[]>();
  if (Array.isArray(captionVotes)) {
    captionVotes.forEach((vote) => {
      const row = vote as Record<string, unknown>;
      const captionId = row.caption_id;
      const voteValue = row.vote_value;
      if (
        (typeof captionId !== "string" && typeof captionId !== "number") ||
        typeof voteValue !== "number"
      ) {
        return;
      }
      const bucket = votesByCaptionId.get(captionId) ?? [];
      bucket.push(voteValue);
      votesByCaptionId.set(captionId, bucket);
    });
  }

  const dataErrorMessage =
    captionsCountError?.message ??
    captionsError?.message ??
    imagesForCaptionsError?.message ??
    captionVotesError?.message;

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
            Grid View
          </p>
          <h1 className="mt-3 text-[2.75rem] sm:text-[3.25rem] lg:text-[3.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 [font-family:var(--font-heading)]">
            Captions Library
          </h1>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-xs uppercase tracking-[0.32em] text-zinc-300/70 shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
          Showing all captions
        </div>
      </header>

      <div className="mt-10">
        {dataErrorMessage ? (
          <p className="mt-3 text-sm text-rose-200/90">
            Failed to load captions: {dataErrorMessage}
          </p>
        ) : captionRows.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400/80">
            No captions found to display.
          </p>
        ) : (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {captionRows.map((caption) => {
                const row = caption as Record<string, unknown>;
                const captionId = row.id;
                const imageId = row.image_id;
                if (typeof imageId !== "string" && typeof imageId !== "number") {
                  return null;
                }
                const imageUrl = imagesById.get(imageId)?.url;
                if (!imageUrl) return null;
                const captionEntry: CaptionEntry = {
                  id: captionId as string | number | undefined,
                  content: row.content as string | null | undefined,
                };
                const captionVotesList =
                  typeof captionId === "string" || typeof captionId === "number"
                    ? votesByCaptionId.get(captionId) ?? []
                    : [];
                return (
                  <Card
                    key={String(captionId ?? imageId ?? imageUrl)}
                    className="w-full"
                  >
                    <VoteCount votes={captionVotesList} />
                    <CardImage src={imageUrl} alt="Image preview" />
                    <CardCaption captions={[captionEntry]} />
                  </Card>
                );
              })}
            </div>

            {totalPages > 1 ? (
              <nav
                className="mt-12 flex flex-wrap items-center justify-center gap-2 text-[0.65rem] uppercase tracking-[0.4em] text-zinc-400/80"
                aria-label="Pagination"
              >
                <a
                  href={`?page=${Math.max(1, currentPage - 1)}`}
                  aria-disabled={currentPage === 1}
                  aria-label="Previous page"
                  className={[
                    "rounded-full px-3 py-2 ring-1 ring-white/10 transition",
                    currentPage === 1
                      ? "cursor-not-allowed opacity-40"
                      : "hover:text-orange-200 hover:ring-orange-400/60",
                  ].join(" ")}
                >
                  <Rewind className="h-4 w-4" aria-hidden="true" />
                </a>

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
                    <a
                      key={`page-${item}`}
                      href={`?page=${item}`}
                      aria-current={isActive ? "page" : undefined}
                    className={[
                        "inline-flex min-w-[2.5rem] items-center justify-center rounded-full px-3 py-2 text-center ring-1 ring-white/10 transition",
                        isActive
                          ? "text-orange-200 ring-2 ring-orange-400/70 shadow-[0_0_16px_rgba(255,120,0,0.35)]"
                          : "hover:text-orange-200 hover:ring-orange-400/60",
                      ].join(" ")}
                    >
                      {item}
                    </a>
                  );
                })}

                <a
                  href={`?page=${Math.min(totalPages, currentPage + 1)}`}
                  aria-disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className={[
                    "rounded-full px-3 py-2 ring-1 ring-white/10 transition",
                    currentPage === totalPages
                      ? "cursor-not-allowed opacity-40"
                      : "hover:text-orange-200 hover:ring-orange-400/60",
                  ].join(" ")}
                >
                  <FastForward className="h-4 w-4" aria-hidden="true" />
                </a>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
