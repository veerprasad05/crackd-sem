import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type BrowserSupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

export async function getAuthenticatedUserId(
  supabase: BrowserSupabaseClient,
  errorMessage = "You need to sign in before saving changes."
) {
  const { data, error } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (error || !userId) {
    throw new Error(error?.message ?? errorMessage);
  }

  return userId;
}
