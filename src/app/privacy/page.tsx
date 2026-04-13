export default function PrivacyPage() {
  return (
    <main className="min-h-[100dvh] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl rounded-[0.9rem] border border-white/10 bg-white/[0.03] p-8">
        <h1 className="text-4xl font-semibold tracking-tight text-white">Privacy Policy</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-300">
          <p>Canary stores uploaded datasets, rule definitions, audit findings, and account metadata required to operate the product.</p>
          <p>We use authentication data from Clerk to manage sign-in, account recovery, and secure access to project workspaces.</p>
          <p>Uploaded files remain associated with the authenticated workspace that created them. Operational telemetry is used only to improve reliability and detect abuse.</p>
        </div>
      </div>
    </main>
  );
}
