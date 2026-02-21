"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";

type VoteCountProps = {
  votes?: Array<number | null | undefined>;
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

export function VoteCount({ votes, className }: VoteCountProps) {
  const total = sumVotes(votes);

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
        className="rounded-full p-1 text-orange-200/80 transition hover:text-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
      >
        <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <span className="min-w-[1.5rem] text-xs text-center">{total}</span>

      <button
        type="button"
        aria-label="Upvote caption"
        className="rounded-full p-1 text-orange-200/80 transition hover:text-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
      >
        <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
