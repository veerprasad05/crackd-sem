import {
  Card,
  CardCaption,
  CardImage,
  type CaptionEntry,
} from "@/components/Card";
import { supabase } from "@/lib/supabaseClient";

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
  const { count: totalImageCount, error: imagesCountError } = await supabase
    .from("images")
    .select("id", { count: "exact", head: true });

  const totalPages = Math.max(
    1,
    Math.ceil((totalImageCount ?? 0) / perPage)
  );
  const currentPage = clampPage(resolvedSearchParams?.page, totalPages);
  const rangeStart = (currentPage - 1) * perPage;
  const rangeEnd = rangeStart + perPage - 1;

  const { data: imagesData, error: imagesError } = await supabase
    .from("images")
    .select("*, captions(count)")
    .order("count", {
      foreignTable: "captions",
      ascending: false,
      nullsFirst: false,
    })
    .order("id", { ascending: true })
    .range(rangeStart, rangeEnd);

  const imageRows = Array.isArray(imagesData) ? imagesData : [];
  const imageIds = imageRows
    .map((image) => (image as Record<string, unknown>).id)
    .filter(
      (id): id is string | number =>
        typeof id === "string" || typeof id === "number"
    );

  const { data: captionsForImages, error: captionsError } = imageIds.length
    ? await supabase
        .from("captions")
        .select("id, image_id, content")
        .in("image_id", imageIds)
    : { data: null, error: null };

  const captionsByImageId = new Map<string | number, CaptionEntry[]>();
  if (Array.isArray(captionsForImages)) {
    captionsForImages.forEach((caption) => {
      const row = caption as Record<string, unknown>;
      const imageId = row.image_id;
      if (typeof imageId !== "string" && typeof imageId !== "number") return;
      const entry: CaptionEntry = {
        id: row.id as string | number | undefined,
        content: row.content as string | null | undefined,
      };
      const bucket = captionsByImageId.get(imageId) ?? [];
      bucket.push(entry);
      captionsByImageId.set(imageId, bucket);
    });
  }

  const dataErrorMessage =
    imagesCountError?.message ?? imagesError?.message ?? captionsError?.message;

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
          Showing all images
        </div>
      </header>

      <div className="mt-10">
        {dataErrorMessage ? (
          <p className="mt-3 text-sm text-rose-200/90">
            Failed to load images: {dataErrorMessage}
          </p>
        ) : imageRows.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400/80">
            No images found to display.
          </p>
        ) : (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {imageRows.map((image) => {
                const row = image as Record<string, unknown>;
                const imageId = row.id;
                const imageUrl = row.url as string | undefined;
                if (!imageUrl) return null;
                const captionItems =
                  typeof imageId === "string" || typeof imageId === "number"
                    ? captionsByImageId.get(imageId) ?? []
                    : [];
                return (
                  <Card key={String(imageId ?? imageUrl)} className="w-full">
                    <CardImage src={imageUrl} alt="Image preview" />
                    <CardCaption captions={captionItems} />
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
                  className={[
                    "rounded-full px-3 py-2 ring-1 ring-white/10 transition",
                    currentPage === 1
                      ? "cursor-not-allowed opacity-40"
                      : "hover:text-orange-200 hover:ring-orange-400/60",
                  ].join(" ")}
                >
                  Prev
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
                        "min-w-[2.5rem] rounded-full px-3 py-2 text-center ring-1 ring-white/10 transition",
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
                  className={[
                    "rounded-full px-3 py-2 ring-1 ring-white/10 transition",
                    currentPage === totalPages
                      ? "cursor-not-allowed opacity-40"
                      : "hover:text-orange-200 hover:ring-orange-400/60",
                  ].join(" ")}
                >
                  Next
                </a>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
