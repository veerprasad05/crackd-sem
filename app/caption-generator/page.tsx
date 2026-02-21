"use client";

import * as React from "react";
import {
  generateCaptions,
  generatePresignedUrl,
  registerImageUrl,
  uploadImageToPresignedUrl,
  type CaptionRecord,
} from "@/lib/captionPipeline";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

const ACCEPT_ATTR =
  "image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,.heic";

function resolveContentType(file: File) {
  if (ALLOWED_CONTENT_TYPES.has(file.type)) {
    return file.type;
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpeg":
    case "jpg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "heic":
      return "image/heic";
    default:
      return null;
  }
}

function toCaptionText(record: CaptionRecord) {
  const candidate =
    typeof record.content === "string"
      ? record.content
      : typeof record.caption === "string"
        ? record.caption
        : typeof record.text === "string"
          ? record.text
          : typeof record.caption_text === "string"
            ? record.caption_text
            : null;
  if (candidate && candidate.trim().length > 0) return candidate;
  return JSON.stringify(record);
}

export default function CaptionGeneratorPage() {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [captions, setCaptions] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isWorking, setIsWorking] = React.useState(false);
  const [authStatus, setAuthStatus] = React.useState<
    "checking" | "authed"
  >("checking");

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  React.useEffect(() => {
    let isActive = true;
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (!isActive) return;
      if (!data.user) {
        router.replace("/");
        return;
      }
      setAuthStatus("authed");
    };
    void checkSession();
    return () => {
      isActive = false;
    };
  }, [router, supabase]);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setCaptions([]);
    setStatus(null);

    const contentType = resolveContentType(file);
    if (!contentType) {
      setError("Unsupported file type. Please upload jpeg, jpg, png, webp, gif, or heic.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setFileName(file.name);

    try {
      setIsWorking(true);
      setStatus("Checking authentication...");
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("You need to sign in before generating captions.");
      }

      setStatus("Requesting upload URL...");
      const { presignedUrl, cdnUrl } = await generatePresignedUrl(
        token,
        contentType
      );

      setStatus("Uploading image...");
      await uploadImageToPresignedUrl(presignedUrl, file, contentType);

      setStatus("Registering image...");
      const { imageId } = await registerImageUrl(token, cdnUrl, false);

      setStatus("Generating captions...");
      const captionRecords = await generateCaptions(token, imageId);

      const nextCaptions = Array.isArray(captionRecords)
        ? captionRecords.map(toCaptionText)
        : [];
      setCaptions(nextCaptions);
      setStatus(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate captions.";
      setError(message);
      setStatus(null);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {authStatus === "checking" ? (
        <p className="text-sm text-zinc-300/80">Checking session...</p>
      ) : null}
      {authStatus !== "authed" ? null : (
        <>
          <header className="flex flex-col gap-3">
            <p className="text-[0.7rem] uppercase tracking-[0.5em] text-orange-300/80 [font-family:var(--font-heading)]">
              Caption Generator
            </p>
            <h1 className="text-[2.5rem] sm:text-[3rem] leading-none uppercase tracking-[0.18em] text-zinc-100 [font-family:var(--font-heading)]">
              Generate Captions From Images
            </h1>
            <p className="text-sm text-zinc-300/70 max-w-2xl">
              Upload a supported image and we will generate captions using the
              pipeline. Supported types: jpeg, jpg, png, webp, gif, heic.
            </p>
          </header>

          <section className="mt-8">
            <div className="rounded-2xl border border-white/10 bg-[#15151b]/90 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-zinc-300/70">
                    Upload Image
                  </p>
                  <p className="mt-2 text-sm text-zinc-100">
                    {fileName ? fileName : "No file selected yet."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePickImage}
                  disabled={isWorking}
                  className="rounded-xl px-5 py-3 text-[0.7rem] uppercase tracking-[0.32em] bg-orange-500/15 text-orange-200 ring-2 ring-orange-400/50 shadow-[0_0_24px_rgba(255,120,0,0.2)] transition-colors hover:bg-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isWorking ? "Processing..." : "Upload Image"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_ATTR}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {status ? (
                <p className="mt-4 text-xs uppercase tracking-[0.32em] text-orange-200/80">
                  {status}
                </p>
              ) : null}
              {error ? (
                <p className="mt-4 text-sm text-rose-200/90">{error}</p>
              ) : null}
            </div>
          </section>

          {previewUrl ? (
            <section className="mt-8">
              <div className="rounded-2xl border border-white/10 bg-black/60 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
                <img
                  src={previewUrl}
                  alt="Uploaded preview"
                  className="w-full max-h-[520px] object-contain rounded-xl bg-black"
                />
              </div>
            </section>
          ) : null}

          <section className="mt-8">
            <div className="rounded-2xl border border-white/10 bg-[#15151b]/85 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
              <p className="text-xs uppercase tracking-[0.32em] text-zinc-300/70">
                Generated Captions
              </p>
              {captions.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-400/80">
                  Upload an image to generate captions.
                </p>
              ) : (
                <ul className="mt-4 space-y-3 text-sm text-zinc-100">
                  {captions.map((caption, index) => (
                    <li
                      key={`${index}-${caption.slice(0, 12)}`}
                      className="rounded-xl border border-white/10 bg-black/40 px-4 py-3"
                    >
                      {caption}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
