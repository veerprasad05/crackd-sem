import AuthButtons from "@/components/AuthButtons";

export default function SignInModal() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-cyan-200/15 bg-black/40 p-8 text-center shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur">
      <p className="text-xs uppercase tracking-[0.5em] text-cyan-200/70">
        Access Required
      </p>
      <h1 className="mt-4 font-mono text-3xl font-semibold uppercase tracking-[0.18em] text-cyan-100">
        Sign In To Continue
      </h1>
      <p className="mt-4 text-sm text-cyan-200/70">
        Use your Google account to unlock the project.
      </p>
      <AuthButtons mode="sign-in" />
    </div>
  );
}
