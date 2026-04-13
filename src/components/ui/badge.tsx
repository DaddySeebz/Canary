import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
  {
    variants: {
      variant: {
        default: "border-[color:var(--workspace-border)] bg-slate-100 text-slate-600",
        critical: "border-red-200 bg-red-50 text-red-600",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        passing: "border-emerald-200 bg-emerald-50 text-emerald-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
