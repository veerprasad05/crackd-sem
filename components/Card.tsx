"use client";

import * as React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

type CardImageProps = {
  src: string;
  alt?: string;
  className?: string;
};

type CaptionEntry = {
  id?: string | number;
  content?: string | null;
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
  "group relative overflow-hidden rounded-2xl",
  "bg-[#15151b]",
  "ring-1 ring-white/10",
  "shadow-[0_24px_50px_rgba(0,0,0,0.65)]",
  "transition-transform duration-300 ease-out",
  "hover:-translate-y-1",
  "focus-within:ring-2 focus-within:ring-orange-400/60",
  "before:pointer-events-none before:absolute before:-inset-[1px] before:rounded-[1.1rem]",
  "before:bg-[linear-gradient(140deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_35%,rgba(255,110,0,0.3)_60%,rgba(255,255,255,0)_90%)]",
  "before:opacity-70 before:content-['']",
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl",
  "after:bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.08),transparent_55%)]",
  "after:opacity-80 after:content-['']",
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
}: CardImageProps) {
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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-black/0 to-black/70" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 to-transparent" />
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
  const displayText = hasCaptions ? captionText : "No captions for this image.";

  return (
    <div
      className={[
        "relative z-10 w-full",
        "bg-[#0f0f14]/85",
        "px-12 sm:px-14",
        "py-3 sm:py-3.5",
        "text-center",
        "text-[0.7rem] sm:text-xs",
        "tracking-[0.14em]",
        "text-zinc-100",
        "[font-family:var(--font-body)]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
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
          "text-orange-200/70 transition",
          "hover:text-orange-200",
          "disabled:cursor-not-allowed disabled:text-zinc-500/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
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
          "text-orange-200/70 transition",
          "hover:text-orange-200",
          "disabled:cursor-not-allowed disabled:text-zinc-500/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60",
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
