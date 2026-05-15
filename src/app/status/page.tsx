const statusChecks = [
  { label: "Web app", status: "Operational" },
  { label: "Auth", status: "Operational" },
  { label: "Project workspaces", status: "Operational" },
  { label: "File uploads", status: "Operational" },
];

export default function StatusPage() {
  return (
    <main className="min-h-[100dvh] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[0.9rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <div className="text-[11px] uppercase tracking-[0.26em] text-emerald-300">Status</div>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">All core systems operational</h1>
          <p className="mt-4 max-w-[56ch] text-sm leading-7 text-zinc-300">
            The public app shell is healthy, and the main onboarding routes are available.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {statusChecks.map((check) => (
            <div key={check.label} className="rounded-[0.9rem] border border-white/10 bg-white/[0.03] p-6">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">{check.label}</div>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-white">{check.status}</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
