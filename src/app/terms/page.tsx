export default function TermsPage() {
  return (
    <main className="min-h-[100dvh] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl rounded-[0.9rem] border border-white/10 bg-white/[0.03] p-8">
        <h1 className="text-4xl font-semibold tracking-tight text-white">Terms of Service</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-300">
          <p>Canary is intended for professional use by operations teams validating structured business data.</p>
          <p>You are responsible for the datasets you upload, the downstream systems that receive your exports, and the permissions you grant to collaborators.</p>
          <p>Service access may be suspended for misuse, abuse, or attempts to access workspaces that do not belong to your authenticated account.</p>
        </div>
      </div>
    </main>
  );
}
