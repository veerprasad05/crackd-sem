"use client";

import * as React from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type VoteCountProps = {
  captionId: string | number;
  profileId?: string | number | null;
  votes?: Array<number | null | undefined>;
  initialUserVote?: number | null;
  className?: string;
};

function sumVotes(votes: VoteCountProps["votes"]) {
  if (!Array.isArray(votes)) return 0;
  let total = 0;
  for (const vote of votes) {
    if (typeof vote === "number") {
      total += vote;
    }
  }
  return total;
}

function normalizeVote(value: VoteCountProps["initialUserVote"]) {
  if (value === 1 || value === -1) return value;
  return 0;
}

export function VoteCount({
  captionId,
  profileId,
  votes,
  initialUserVote,
  className,
}: VoteCountProps) {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [total, setTotal] = React.useState(() => sumVotes(votes));
  const [userVote, setUserVote] = React.useState(() =>
    normalizeVote(initialUserVote)
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canVote = Boolean(profileId);
  const isUpvoted = userVote === 1;
  const isDownvoted = userVote === -1;

  const handleVote = async (nextVote: 1 | -1) => {
    if (!canVote || isSubmitting || nextVote === userVote) return;
    setIsSubmitting(true);
    const timestamp = new Date().toISOString();

    let voteError: { message?: string } | null = null;
    if (userVote === 0) {
      const { error } = await supabase.from("caption_votes").insert({
        caption_id: captionId,
        profile_id: profileId,
        vote_value: nextVote,
        created_datetime_utc: timestamp,
      });
      voteError = error;
    } else {
      const { error } = await supabase
        .from("caption_votes")
        .update({
          vote_value: nextVote,
          modified_datetime_utc: timestamp,
        })
        .eq("caption_id", captionId)
        .eq("profile_id", profileId);
      voteError = error;
    }

    if (voteError) {
      setIsSubmitting(false);
      return;
    }

    setTotal((prev) => prev - userVote + nextVote);
    setUserVote(nextVote);
    setIsSubmitting(false);
  };

  return (
    <div
      className={[
        "absolute right-3 top-3 z-20",
        "flex items-center gap-1.5",
        "rounded-full border border-white/15 bg-black/70 px-2.5 py-1",
        "text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-orange-200",
        "shadow-[0_10px_20px_rgba(0,0,0,0.45)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        aria-label="Downvote caption"
        aria-pressed={isDownvoted}
        disabled={!canVote || isSubmitting}
        onClick={() => handleVote(-1)}
        className={[
          "rounded-full p-1 transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
          "disabled:cursor-not-allowed disabled:opacity-40",
          isDownvoted ? "text-orange-200" : "text-orange-200/70 hover:text-orange-200",
        ].join(" ")}
      >
        <ThumbsDown
          className="h-3.5 w-3.5"
          aria-hidden="true"
          fill={isDownvoted ? "currentColor" : "none"}
        />
      </button>

      <span className="min-w-[1.5rem] text-xs text-center">{total}</span>

      <button
        type="button"
        aria-label="Upvote caption"
        aria-pressed={isUpvoted}
        disabled={!canVote || isSubmitting}
        onClick={() => handleVote(1)}
        className={[
          "rounded-full p-1 transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
          "disabled:cursor-not-allowed disabled:opacity-40",
          isUpvoted ? "text-orange-200" : "text-orange-200/70 hover:text-orange-200",
        ].join(" ")}
      >
        <ThumbsUp
          className="h-3.5 w-3.5"
          aria-hidden="true"
          fill={isUpvoted ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
}
