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
    liked?: string;
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
  const likedOnly = parseBooleanSearchParam(resolvedSearchParams?.liked);

  const { data: likedCaptionData, error: likedCaptionsError } = likedOnly
    ? await supabase
        .from("caption_votes")
        .select("caption_id")
        .eq("profile_id", profileId)
        .eq("vote_value", 1)
    : { data: [], error: null };

  const likedCaptionIds = Array.from(
    new Set(
      (Array.isArray(likedCaptionData) ? likedCaptionData : [])
        .map((vote) => vote.caption_id)
        .filter((id): id is string => typeof id === "string")
    )
  );

  const noLikedMatches = likedOnly && likedCaptionIds.length === 0;

  let captionsCountQuery = supabase
    .from("captions")
    .select("id", { count: "exact", head: true })
    .not("content", "is", null)
    .neq("content", "");

  if (featuredOnly) {
    captionsCountQuery = captionsCountQuery.eq("is_featured", true);
  }

  if (publicOnly) {
    captionsCountQuery = captionsCountQuery.eq("is_public", true);
  }

  if (likedOnly && likedCaptionIds.length > 0) {
    captionsCountQuery = captionsCountQuery.in("id", likedCaptionIds);
  }

  const { count: totalCaptionCount, error: captionsCountError } = noLikedMatches
    ? { count: 0, error: null }
    : await captionsCountQuery;

  const totalPages = Math.max(
    1,
    Math.ceil((totalCaptionCount ?? 0) / CAPTION_PAGE_SIZE)
  );
  const currentPage = clampPage(resolvedSearchParams?.page, totalPages);
  const rangeStart = (currentPage - 1) * CAPTION_PAGE_SIZE;
  const rangeEnd = rangeStart + CAPTION_PAGE_SIZE - 1;

  let captionsQuery = supabase
    .from("captions")
    .select(
      "id, image_id, content, created_datetime_utc, is_featured, is_public, like_count"
    )
    .not("content", "is", null)
    .neq("content", "");

  if (featuredOnly) {
    captionsQuery = captionsQuery.eq("is_featured", true);
  }

  if (publicOnly) {
    captionsQuery = captionsQuery.eq("is_public", true);
  }

  if (likedOnly && likedCaptionIds.length > 0) {
    captionsQuery = captionsQuery.in("id", likedCaptionIds);
  }

  const { data: captionsData, error: captionsError } = noLikedMatches
    ? { data: [], error: null }
    : await captionsQuery
        .order("like_count", { ascending: sort === "least-likes" })
        .order("created_datetime_utc", { ascending: false })
        .range(rangeStart, rangeEnd);

  const pagedCaptionRows = Array.isArray(captionsData)
    ? (captionsData as CaptionRow[])
    : [];

  const pagedCaptionIds = Array.from(
    new Set(
      pagedCaptionRows.map((caption) => caption.id).filter(
        (id): id is string => typeof id === "string"
      )
    )
  );

  const { data: userCaptionVotes, error: userCaptionVotesError } = pagedCaptionIds.length
    ? await supabase
        .from("caption_votes")
        .select("caption_id, vote_value")
        .eq("profile_id", profileId)
        .in("caption_id", pagedCaptionIds)
    : { data: [], error: null };

  const userVoteByCaptionId = new Map<string, number>();

  if (Array.isArray(userCaptionVotes)) {
    userCaptionVotes.forEach((vote) => {
      const captionId = typeof vote.caption_id === "string" ? vote.caption_id : null;
      const voteValue = typeof vote.vote_value === "number" ? vote.vote_value : null;

      if (!captionId || voteValue === null) {
        return;
      }

      userVoteByCaptionId.set(captionId, voteValue);
    });
  }

  const pagedImageIds = Array.from(
    new Set(
      pagedCaptionRows.map((caption) => caption.image_id).filter(
        (id): id is string => typeof id === "string"
      )
    )
  );

  const { data: imagesForCaptions, error: imagesForCaptionsError } = pagedImageIds.length
    ? await supabase.from("images").select("id, url").in("id", pagedImageIds)
    : { data: [], error: null };

  const imagesById = new Map<string, string | null>();
  if (Array.isArray(imagesForCaptions)) {
    imagesForCaptions.forEach((image) => {
      imagesById.set(String(image.id), typeof image.url === "string" ? image.url : null);
    });
  }

  const dataErrorMessage =
    likedCaptionsError?.message ??
    captionsCountError?.message ??
    captionsError?.message ??
    userCaptionVotesError?.message ??
    imagesForCaptionsError?.message;

  const totalMatchingCaptions = totalCaptionCount ?? 0;
  const visibleStart = totalMatchingCaptions === 0 ? 0 : rangeStart + 1;
  const visibleEnd = Math.min(rangeStart + CAPTION_PAGE_SIZE, totalMatchingCaptions);

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
            Browse the highest-rated captions first, then narrow the list with
            filters that match what you want to revisit.
          </p>
        </div>

        <div className="lg:ml-auto lg:self-start">
          <CaptionFilterControls
            sort={sort}
            featuredOnly={featuredOnly}
            publicOnly={publicOnly}
            likedOnly={likedOnly}
            options={CAPTION_SORT_OPTIONS}
          />
        </div>
      </header>

      <section className="mt-10">
        {dataErrorMessage ? (
          <p className="text-sm text-rose-200/90">
            Failed to load captions: {dataErrorMessage}
          </p>
        ) : totalMatchingCaptions === 0 ? (
          <p className="text-sm text-zinc-400/80">No captions found.</p>
        ) : pagedCaptionRows.length === 0 ? (
          <p className="text-sm text-zinc-400/80">
            No captions match the current filters.
          </p>
        ) : (
          <>
            <p className="mb-5 text-sm text-zinc-300/75">
              Showing {visibleStart}-{visibleEnd} of {totalMatchingCaptions} captions
            </p>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {pagedCaptionRows.map((caption) => {
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
                const userVote = userVoteByCaptionId.get(caption.id) ?? 0;

                return (
                  <Card key={String(caption.id)} className="w-full">
                    <VoteCount
                      captionId={caption.id}
                      profileId={profileId}
                      initialTotal={caption.like_count}
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
                sort: sort === "most-likes" ? undefined : sort,
                featured: featuredOnly ? "true" : undefined,
                public: publicOnly ? "true" : undefined,
                liked: likedOnly ? "true" : undefined,
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}
