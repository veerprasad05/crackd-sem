import { redirect } from "next/navigation";
import SignInModal from "@/components/SignInModal";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/captions");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center">
      <SignInModal />
    </div>
  );
}
