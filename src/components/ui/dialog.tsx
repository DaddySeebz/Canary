"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

export function DialogContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
      <BaseDialog.Popup
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(92vw,40rem)] -translate-x-1/2 -translate-y-1/2 rounded-[0.85rem] border border-[color:var(--workspace-border)] bg-[color:var(--workspace-elevated)] p-6 text-[color:var(--workspace-ink)] shadow-[0_30px_100px_-40px_rgba(0,0,0,0.4)]",
          className,
        )}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-5 space-y-2", className)} {...props} />;
}

export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <BaseDialog.Title className={cn("text-xl font-semibold tracking-tight", className)}>{children}</BaseDialog.Title>;
}

export function DialogDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <BaseDialog.Description className={cn("text-sm text-[color:var(--workspace-muted)]", className)}>{children}</BaseDialog.Description>;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex items-center justify-end gap-3", className)} {...props} />;
}
