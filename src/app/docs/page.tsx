import Link from "next/link";

const docLinks = [
  { title: "Start a workspace", href: "/signup", body: "Create an account, then move straight into the project shell." },
  { title: "Open projects", href: "/projects", body: "Review workspaces, audits, and tracked files in one place." },
  { title: "Security", href: "/security", body: "Read how Canary handles access, uploads, and audit logs." },
  { title: "Status", href: "/status", body: "Check the current application status surface." },
];

export default function DocsPage() {
  return (
    <main className="min-h-[100dvh] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[0.9rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="text-[11px] uppercase tracking-[0.26em] text-primary">Documentation</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Canary docs</h1>
          <p className="mt-4 max-w-[56ch] text-sm leading-7 text-zinc-300">
            This lightweight docs surface points to the main product routes that matter most for onboarding and day to
            day use.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {docLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[0.9rem] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">{link.title}</div>
              <p className="mt-3 text-sm leading-7 text-zinc-300">{link.body}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
