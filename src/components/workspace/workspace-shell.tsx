"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  Bell,
  BookOpen,
  BrainCircuit,
  FolderKanban,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";

import { CanaryLogo } from "@/components/branding/canary-logo";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { cn } from "@/lib/utils";

const topLevelLinks = [
  { label: "Projects", icon: FolderKanban, href: "/projects" },
  { label: "Audits", icon: ShieldCheck, href: "audits" },
  { label: "Monitoring", icon: Bell, href: "monitoring" },
  { label: "Intelligence", icon: BrainCircuit, href: "intelligence" },
];

const utilityLinks = [
  { label: "Documentation", icon: BookOpen, href: "/terms" },
  { label: "Settings", icon: Settings, href: "/security" },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ id?: string }>();
  const projectId = typeof params?.id === "string" ? params.id : null;

  return (
    <div className="min-h-[100dvh] bg-[color:var(--workspace-bg)] text-[color:var(--workspace-ink)] lg:grid lg:grid-cols-[292px_minmax(0,1fr)]">
      <aside className="border-r border-white/5 bg-[#0d0d0f] px-5 py-6 text-zinc-200">
        <div className="flex h-full flex-col">
          <div className="space-y-8">
            <CanaryLogo variant="inline" showTagline={false} className="[&_div:first-child]:text-primary" />
            <div className="rounded-[0.9rem] border border-white/8 bg-white/[0.04] p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Workspace</div>
              <div className="mt-2 text-sm font-semibold text-white">System health: good</div>
              <div className="mt-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                All monitors online
              </div>
            </div>
            <nav className="space-y-2">
              {topLevelLinks.map((link) => {
                const href =
                  link.href.startsWith("/")
                    ? link.href
                    : projectId
                      ? `/projects/${projectId}/${link.href}`
                      : "/projects";
                const active =
                  pathname === href ||
                  (href !== "/projects" && pathname.startsWith(`${href}`)) ||
                  (href === "/projects" && pathname === "/projects");

                return (
                  <Link
                    key={`${link.label}-${href}`}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-[0.75rem] px-3 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white",
                      active && "bg-white/[0.08] text-white",
                    )}
                  >
                    <link.icon className={cn("h-4 w-4", active && "text-primary")} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto space-y-4 pt-8">
            <CreateProjectDialog triggerLabel="Create New Audit" />
            <div className="space-y-2 border-t border-white/6 pt-4">
              {utilityLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 rounded-[0.75rem] px-3 py-3 text-sm font-medium text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="workspace-grid sticky top-0 z-20 border-b border-[color:var(--workspace-border)] bg-[color:var(--workspace-bg)]/95 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-6 text-sm font-medium">
                <Link href="/projects" className={cn("transition-colors hover:text-slate-950", pathname === "/projects" ? "text-amber-700" : "text-slate-500")}>
                  Projects
                </Link>
                {projectId ? (
                  <>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900">Workspace</span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 min-w-[280px] items-center gap-3 rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-white px-4 text-sm text-slate-500">
                <Search className="h-4 w-4" />
                Search audits, rules, and anomalies...
              </div>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-white text-slate-500"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="flex h-11 w-11 items-center justify-center rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-white">
                <UserButton />
              </div>
            </div>
          </div>
        </header>
        <main className="min-w-0 px-5 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
