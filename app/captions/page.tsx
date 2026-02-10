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
  searchParams?: { page?: string };
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
  const { data: allCaptions, error: captionsError } = await supabase
    .from("captions")
    .select("id, image_id, content, like_count");

  const captionsByImageId = new Map<string | number, CaptionEntry[]>();
  const totalLikesByImageId = new Map<string | number, number>();

  if (Array.isArray(allCaptions)) {
    allCaptions.forEach((caption) => {
      const row = caption as Record<string, unknown>;
      const imageId = row.image_id;
      if (typeof imageId !== "string" && typeof imageId !== "number") return;
      const rawLikeCount =
        typeof row.like_count === "number"
          ? row.like_count
          : Number.isFinite(Number(row.like_count))
            ? Number(row.like_count)
            : 0;
      const likeCount = Math.max(0, rawLikeCount);
      const entry: CaptionEntry = {
        id: row.id as string | number | undefined,
        content: row.content as string | null | undefined,
        like_count: likeCount,
      };
      const bucket = captionsByImageId.get(imageId) ?? [];
      bucket.push(entry);
      captionsByImageId.set(imageId, bucket);

      const currentTotal = totalLikesByImageId.get(imageId) ?? 0;
      totalLikesByImageId.set(imageId, currentTotal + likeCount);
    });
  }
  captionsByImageId.forEach((bucket, imageId) => {
    const sorted = [...bucket].sort(
      (a, b) => (b.like_count ?? 0) - (a.like_count ?? 0)
    );
    captionsByImageId.set(imageId, sorted);
  });

  const sortedImageIds = Array.from(totalLikesByImageId.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([imageId]) => imageId);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedImageIds.length / perPage)
  );
  const currentPage = clampPage(searchParams?.page, totalPages);
  const rangeStart = (currentPage - 1) * perPage;
  const rangeEnd = rangeStart + perPage;
  const pageImageIds = sortedImageIds.slice(rangeStart, rangeEnd);

  const { data: imagesData, error: imagesError } = pageImageIds.length
    ? await supabase.from("images").select("*").in("id", pageImageIds)
    : { data: null, error: null };

  const imageById = new Map<string | number, Record<string, unknown>>();
  if (Array.isArray(imagesData)) {
    imagesData.forEach((image) => {
      const row = image as Record<string, unknown>;
      const imageId = row.id;
      if (typeof imageId !== "string" && typeof imageId !== "number") return;
      imageById.set(imageId, row);
    });
  }

  const sortedImageRows = pageImageIds
    .map((imageId) => imageById.get(imageId))
    .filter((row): row is Record<string, unknown> => Boolean(row));

  const dataErrorMessage = captionsError?.message ?? imagesError?.message;

  return (
    <div className="text-center">
      <h1 className="font-mono text-[3.5rem] sm:text-[4rem] lg:text-[4.75rem] leading-none tracking-[0.2em] font-semibold text-cyan-100 drop-shadow-[0_0_2px_rgba(34,211,238,0.7)] [text-shadow:0_0_2px_rgba(34,211,238,0.7),0_0_22px_rgba(34,211,238,0.35)]">
        TABLE COLUMNS
      </h1>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-cyan-100">
          Images
        </h2>
        <h3 className="text-sm text-cyan-200/70">
          Sorted By Likes
        </h3>
        {dataErrorMessage ? (
          <p className="mt-3 text-sm text-red-200/90">
            Failed to load images: {dataErrorMessage}
          </p>
        ) : sortedImageRows.length === 0 ? (
          <p className="mt-3 text-sm text-cyan-200/70">
            No images found to display.
          </p>
        ) : (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedImageRows.map((image) => {
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
                className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-200/70"
                aria-label="Pagination"
              >
                <a
                  href={`?page=${Math.max(1, currentPage - 1)}`}
                  aria-disabled={currentPage === 1}
                  className={[
                    "rounded-full px-3 py-2 ring-1 ring-white/10 transition",
                    currentPage === 1
                      ? "cursor-not-allowed opacity-40"
                      : "hover:text-cyan-100 hover:ring-cyan-200/70",
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
                          ? "text-cyan-100 ring-2 ring-cyan-200/70 shadow-[0_0_16px_rgba(34,211,238,0.35)]"
                          : "hover:text-cyan-100 hover:ring-cyan-200/70",
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
                      : "hover:text-cyan-100 hover:ring-cyan-200/70",
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
