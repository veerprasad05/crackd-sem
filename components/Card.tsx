"use client";

import * as React from "react";
import { Heart } from "lucide-react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

type CardImageProps = {
  src: string;
  alt?: string;
  className?: string;
  likes?: number | null;
};

type CaptionEntry = {
  id?: string | number;
  content?: string | null;
  like_count?: number | null;
};

type CardCaptionProps = {
  captions: CaptionEntry[];
  className?: string;
};

type CardContextValue = {
  captions: CaptionEntry[];
  setCaptions: React.Dispatch<React.SetStateAction<CaptionEntry[]>>;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
};

const CardContext = React.createContext<CardContextValue | null>(null);

const baseCardClasses = [
  "relative overflow-hidden rounded-2xl",
  "bg-zinc-950/80",
  "ring-1 ring-white/10",
  "shadow-[0_18px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]",
  "transition-transform duration-300 ease-out",
  "hover:-translate-y-1",
  "before:pointer-events-none before:absolute before:inset-0",
  "before:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.14),transparent_55%)]",
  "before:opacity-60 before:content-['']",
].join(" ");

const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    const [captions, setCaptions] = React.useState<CaptionEntry[]>([]);
    const [index, setIndex] = React.useState(0);

    return (
      <CardContext.Provider value={{ captions, setCaptions, index, setIndex }}>
        <div
          ref={ref}
          className={[baseCardClasses, className].filter(Boolean).join(" ")}
          {...props}
        >
          {children}
        </div>
      </CardContext.Provider>
    );
  }
);

CardRoot.displayName = "Card";

function CardImage({
  src,
  alt = "Card image",
  className,
  likes,
}: CardImageProps) {
  const context = React.useContext(CardContext);
  const activeCaption =
    context && context.captions.length > 0
      ? context.captions[context.index]
      : undefined;
  const resolvedLikes =
    typeof likes === "number"
      ? likes
      : typeof activeCaption?.like_count === "number"
        ? activeCaption.like_count
        : 0;
  const hasLikesOverride = typeof likes === "number" && Number.isFinite(likes);
  const hasCaptions = (context?.captions.length ?? 0) > 0;
  const showLikes = (hasLikesOverride || hasCaptions) && Number.isFinite(resolvedLikes);

  return (
    <div
      className={[
        "relative z-10 w-full overflow-hidden",
        "aspect-[16/9] sm:aspect-[7/4]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain bg-black"
      />
      {showLikes ? (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-rose-400 ring-1 ring-rose-500/40 shadow-[0_0_14px_rgba(244,63,94,0.35)]">
          <Heart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          <span>{resolvedLikes}</span>
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-black/0 to-black/60" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}

function CardCaption({ captions, className }: CardCaptionProps) {
  const context = React.useContext(CardContext);
  const safeCaptions = React.useMemo(
    () => (Array.isArray(captions) ? captions : []),
    [captions]
  );
  const [localIndex, setLocalIndex] = React.useState(0);
  const currentIndex = context ? context.index : localIndex;
  const setIndex = context ? context.setIndex : setLocalIndex;
  const count = safeCaptions.length;

  React.useEffect(() => {
    if (context) {
      context.setCaptions(safeCaptions);
    }
  }, [context, safeCaptions]);

  React.useEffect(() => {
    if (count === 0) {
      setIndex(0);
      return;
    }
    setIndex((prev) => (prev >= count ? count - 1 : prev));
  }, [count, setIndex]);

  const goPrev = () => {
    if (count === 0) return;
    setIndex((prev) => (prev - 1 + count) % count);
  };

  const goNext = () => {
    if (count === 0) return;
    setIndex((prev) => (prev + 1) % count);
  };

  const activeCaption = count > 0 ? safeCaptions[currentIndex] : undefined;
  const captionText = activeCaption?.content ? String(activeCaption.content) : "";
  const disableNav = count <= 1;
  const hasCaptions = count > 0;
  const displayText = hasCaptions ? captionText : "No captions for Image";

  return (
    <div
      className={[
        "relative z-10 w-full",
        "bg-black/70",
        "px-12 sm:px-14",
        "py-3 sm:py-3.5",
        "text-center",
        "text-xs sm:text-sm",
        "tracking-[0.08em]",
        "text-zinc-100",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        "border-t border-white/10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        onClick={goPrev}
        disabled={disableNav}
        aria-label="Previous caption"
        className={[
          "absolute left-0 top-0 h-full w-10 sm:w-12",
          "flex items-center justify-center",
          "border-r border-white/10",
          "bg-gradient-to-b from-white/10 via-white/5 to-transparent",
          "text-zinc-200/70 transition",
          "hover:text-white",
          "disabled:cursor-not-allowed disabled:text-zinc-500/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60",
        ].join(" ")}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        className={[
          "min-h-[1.75rem] whitespace-pre-wrap break-words",
          hasCaptions ? "text-zinc-100" : "text-zinc-400/70",
        ].join(" ")}
      >
        {displayText}
      </div>

      <button
        type="button"
        onClick={goNext}
        disabled={disableNav}
        aria-label="Next caption"
        className={[
          "absolute right-0 top-0 h-full w-10 sm:w-12",
          "flex items-center justify-center",
          "border-l border-white/10",
          "bg-gradient-to-b from-white/10 via-white/5 to-transparent",
          "text-zinc-200/70 transition",
          "hover:text-white",
          "disabled:cursor-not-allowed disabled:text-zinc-500/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60",
        ].join(" ")}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

const Card = Object.assign(CardRoot, {
  Image: CardImage,
  Caption: CardCaption,
});

export { Card, CardImage, CardCaption };
export type { CaptionEntry };
