import { Card, type CaptionEntry } from "@/components/Card";
import CaptionFilterControls from "@/components/CaptionFilterControls";
import Pagination from "@/components/Pagination";
import { VoteCount } from "@/components/VoteCount";
import {
  CAPTION_PAGE_SIZE,
  CAPTION_SORT_OPTIONS,
  clampPage,
  parseBooleanSearchParam,
  parseCaptionSortMode,
} from "@/lib/caption-listing";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    sort?: string;
    featured?: string;
    public?: string;
  }>;
};

type CaptionRow = {
  id: string;
  image_id: string;
  content: string | null;
  created_datetime_utc: string;
  is_featured: boolean;
  is_public: boolean | null;
  like_count: number;
};

export default async function CaptionsPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const profileId = data.user?.id ?? null;

  if (!profileId) {
    redirect("/");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const sort = parseCaptionSortMode(resolvedSearchParams?.sort);
  const featuredOnly = parseBooleanSearchParam(resolvedSearchParams?.featured);
  const publicOnly = parseBooleanSearchParam(resolvedSearchParams?.public);

  const buildCaptionQuery = () => {
    let query = supabase
      .from("captions")
      .select(
        "id, image_id, content, created_datetime_utc, is_featured, is_public, like_count"
      )
      .not("content", "is", null)
      .neq("content", "");

    if (featuredOnly) {
      query = query.eq("is_featured", true);
    }

    if (publicOnly) {
      query = query.eq("is_public", true);
    }

    return query;
  };

  let countQuery = supabase
    .from("captions")
    .select("id", { count: "exact", head: true });

  countQuery = countQuery.not("content", "is", null).neq("content", "");

  if (featuredOnly) {
    countQuery = countQuery.eq("is_featured", true);
  }

  if (publicOnly) {
    countQuery = countQuery.eq("is_public", true);
  }

  const { count: totalCaptionCount, error: captionsCountError } = await countQuery;
  const totalPages = Math.max(
    1,
    Math.ceil((totalCaptionCount ?? 0) / CAPTION_PAGE_SIZE)
  );
  const currentPage = clampPage(resolvedSearchParams?.page, totalPages);
  const rangeStart = (currentPage - 1) * CAPTION_PAGE_SIZE;
  const rangeEnd = rangeStart + CAPTION_PAGE_SIZE - 1;

  let captionsQuery = buildCaptionQuery();

  if (sort === "most-likes" || sort === "least-likes") {
    captionsQuery = captionsQuery.order("like_count", {
      ascending: sort === "least-likes",
    });
  }

  const { data: captionsData, error: captionsError } = await captionsQuery
    .order("created_datetime_utc", { ascending: sort === "asc" })
    .range(rangeStart, rangeEnd);

  const captionRows = Array.isArray(captionsData)
    ? (captionsData as CaptionRow[])
    : [];
  const captionIds = Array.from(
    new Set(
      captionRows.map((caption) => caption.id).filter(
        (id): id is string => typeof id === "string"
      )
    )
  );
  const imageIds = Array.from(
    new Set(
      captionRows.map((caption) => caption.image_id).filter(
        (id): id is string => typeof id === "string"
      )
    )
  );

  const { data: imagesForCaptions, error: imagesForCaptionsError } = imageIds.length
    ? await supabase.from("images").select("id, url").in("id", imageIds)
    : { data: [], error: null };

  const { data: captionVotes, error: captionVotesError } = captionIds.length
    ? await supabase
        .from("caption_votes")
        .select("caption_id, profile_id, vote_value")
        .in("caption_id", captionIds)
    : { data: [], error: null };

  const imagesById = new Map<string, string | null>();
  if (Array.isArray(imagesForCaptions)) {
    imagesForCaptions.forEach((image) => {
      imagesById.set(String(image.id), typeof image.url === "string" ? image.url : null);
    });
  }

  const totalVotesByCaptionId = new Map<string, number>();
  const userVoteByCaptionId = new Map<string, number>();

  if (Array.isArray(captionVotes)) {
    captionVotes.forEach((vote) => {
      const captionId = typeof vote.caption_id === "string" ? vote.caption_id : null;
      const voteValue = typeof vote.vote_value === "number" ? vote.vote_value : null;

      if (!captionId || voteValue === null) {
        return;
      }

      totalVotesByCaptionId.set(
        captionId,
        (totalVotesByCaptionId.get(captionId) ?? 0) + voteValue
      );

      if (vote.profile_id === profileId) {
        userVoteByCaptionId.set(captionId, voteValue);
      }
    });
  }

  const dataErrorMessage =
    captionsCountError?.message ??
    captionsError?.message ??
    imagesForCaptionsError?.message ??
    captionVotesError?.message;

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
            Library
          </p>
          <h1 className="mt-3 text-[2.75rem] leading-none uppercase tracking-[0.18em] text-zinc-100 sm:text-[3.25rem] lg:text-[3.75rem] [font-family:var(--font-heading)]">
            Captions
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-zinc-300/75">
            Browse caption records alongside their images with the same
            sort, filter, and pagination flow used in admin.
          </p>
        </div>

        <div className="lg:ml-auto lg:self-start">
          <CaptionFilterControls
            sort={sort}
            featuredOnly={featuredOnly}
            publicOnly={publicOnly}
            options={CAPTION_SORT_OPTIONS}
          />
        </div>
      </header>

      <section className="mt-10">
        {dataErrorMessage ? (
          <p className="text-sm text-rose-200/90">
            Failed to load captions: {dataErrorMessage}
          </p>
        ) : captionRows.length === 0 ? (
          <p className="text-sm text-zinc-400/80">No captions found.</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {captionRows.map((caption) => {
                const imageUrl =
                  typeof caption.image_id === "string"
                    ? imagesById.get(caption.image_id) ?? null
                    : null;
                if (!imageUrl) return null;

                const captionEntry: CaptionEntry = {
                  id: caption.id,
                  content:
                    typeof caption.content === "string" ? caption.content : null,
                };
                const totalVotes = totalVotesByCaptionId.get(caption.id) ?? 0;
                const userVote = userVoteByCaptionId.get(caption.id) ?? 0;

                return (
                  <Card key={String(caption.id)} className="w-full">
                    <VoteCount
                      captionId={caption.id}
                      profileId={profileId}
                      initialTotal={totalVotes}
                      initialUserVote={userVote}
                    />
                    <Card.Image src={imageUrl} alt="Caption image" />
                    <Card.Caption captions={[captionEntry]} />
                  </Card>
                );
              })}
            </div>

            <Pagination
              pathname="/captions"
              currentPage={currentPage}
              totalPages={totalPages}
              queryParams={{
                sort,
                featured: featuredOnly ? "true" : undefined,
                public: publicOnly ? "true" : undefined,
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}
