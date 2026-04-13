import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-[0.5rem] border border-[color:var(--workspace-border)] bg-white px-4 py-2 text-sm text-[color:var(--workspace-ink)] placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
