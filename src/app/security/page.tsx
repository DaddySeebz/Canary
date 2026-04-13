export default function SecurityPage() {
  return (
    <main className="min-h-[100dvh] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl rounded-[0.9rem] border border-white/10 bg-white/[0.03] p-8">
        <h1 className="text-4xl font-semibold tracking-tight text-white">Security</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-300">
          <p>Canary uses authenticated sessions, scoped project access, and per-user project ownership to protect workspace data.</p>
          <p>CSV uploads are stored in the application storage directory associated with each workspace, and project API access is restricted to the authenticated owner.</p>
          <p>Operational logs record file uploads, rule changes, audit runs, and generated insights to preserve an audit trail for investigation and review.</p>
        </div>
      </div>
    </main>
  );
}
