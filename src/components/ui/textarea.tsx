import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[120px] w-full rounded-[0.5rem] border border-[color:var(--workspace-border)] bg-white px-4 py-3 text-sm text-[color:var(--workspace-ink)] placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
