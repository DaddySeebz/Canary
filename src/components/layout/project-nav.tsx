"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { label: "Audits", href: "/audits" },
  { label: "Monitoring", href: "/monitoring" },
  { label: "Intelligence", href: "/intelligence" },
];

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6 border-b border-white/10">
      {links.map((link) => {
        const href = `/projects/${projectId}${link.href}`;
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative py-4 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950",
              isActive && "text-slate-950",
            )}
          >
            {link.label}
            <span
              className={cn(
                "absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary transition-opacity",
                isActive ? "opacity-100" : "opacity-0",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
