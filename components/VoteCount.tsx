"use client";

import * as React from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type VoteCountProps = {
  captionId: string;
  profileId: string;
  initialTotal: number;
  initialUserVote: number;
  className?: string;
};

function clampVoteValue(value: number) {
  if (value === 1 || value === -1) {
    return value;
  }

  return 0;
}

export function VoteCount({
  captionId,
  profileId,
  initialTotal,
  initialUserVote,
  className,
}: VoteCountProps) {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [total, setTotal] = React.useState(initialTotal);
  const [userVote, setUserVote] = React.useState(() =>
    clampVoteValue(initialUserVote)
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleVote = async (nextVote: 1 | -1) => {
    if (isSubmitting) {
      return;
    }

    const previousVote = userVote;
    const isUndo = nextVote === userVote;
    const nextDisplayedVote = isUndo ? 0 : nextVote;
    const nextTotal = total - previousVote + nextDisplayedVote;

    setIsSubmitting(true);
    setUserVote(nextDisplayedVote);
    setTotal(nextTotal);

    const { error } = isUndo
      ? await supabase
          .from("caption_votes")
          .delete()
          .eq("caption_id", captionId)
          .eq("profile_id", profileId)
      : await supabase.from("caption_votes").upsert(
          {
            caption_id: captionId,
            profile_id: profileId,
            vote_value: nextVote,
            is_from_study: false,
          },
          {
            onConflict: "profile_id,caption_id",
          }
        );

    if (error) {
      setUserVote(previousVote);
      setTotal(total);
    } else {
      router.refresh();
    }

    setIsSubmitting(false);
  };

  const isUpvoted = userVote === 1;
  const isDownvoted = userVote === -1;
  const voteTone =
    total > 0
      ? "text-emerald-200 ring-emerald-400/40"
      : total < 0
        ? "text-rose-200 ring-rose-400/40"
        : "text-zinc-200 ring-white/15";

  return (
    <div
      className={[
        "absolute right-4 top-4 z-20 inline-flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.2em] ring-1 shadow-[0_10px_24px_rgba(0,0,0,0.35)]",
        voteTone,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        aria-label="Upvote caption"
        aria-pressed={isUpvoted}
        disabled={isSubmitting}
        onClick={() => handleVote(1)}
        className={[
          "rounded-full p-1 transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
          "disabled:cursor-not-allowed disabled:opacity-40",
          isUpvoted
            ? "text-emerald-200"
            : "text-zinc-200/70 hover:text-emerald-200",
        ].join(" ")}
      >
        <ThumbsUp
          className="h-3.5 w-3.5"
          aria-hidden="true"
          fill={isUpvoted ? "currentColor" : "none"}
        />
      </button>

      <span className="min-w-[1.5rem] text-center text-xs">{total}</span>

      <button
        type="button"
        aria-label="Downvote caption"
        aria-pressed={isDownvoted}
        disabled={isSubmitting}
        onClick={() => handleVote(-1)}
        className={[
          "rounded-full p-1 transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
          "disabled:cursor-not-allowed disabled:opacity-40",
          isDownvoted
            ? "text-rose-200"
            : "text-zinc-200/70 hover:text-rose-200",
        ].join(" ")}
      >
        <ThumbsDown
          className="h-3.5 w-3.5"
          aria-hidden="true"
          fill={isDownvoted ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
}
