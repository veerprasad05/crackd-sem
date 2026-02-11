"use client";

import { useCallback, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthButtonsProps = {
  mode?: "sign-in" | "full";
};

export default function AuthButtons({ mode = "full" }: AuthButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) setError(signInError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) setError(signOutError.message);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <div className="flex gap-3">
        <button
          className="rounded-md border border-cyan-200/40 px-4 py-2 text-sm text-cyan-100 hover:border-cyan-200/70 hover:text-white"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? "Working..." : "Sign in with Google"}
        </button>
        {mode === "full" ? (
          <button
            className="rounded-md border border-cyan-200/20 px-4 py-2 text-sm text-cyan-200/80 hover:border-cyan-200/50 hover:text-cyan-100"
            onClick={handleSignOut}
            disabled={loading}
          >
            Sign out
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
