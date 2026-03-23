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
        "rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}
