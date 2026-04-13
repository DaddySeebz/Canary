import { cn } from "@/lib/utils";

export function Alert({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-white p-4 text-sm text-[color:var(--workspace-ink)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
