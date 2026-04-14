import { CloudAlert } from "lucide-react";

import { Alert } from "@/components/ui/alert";

export function DeploymentBanner({ preview = false }: { preview?: boolean }) {
  return (
    <Alert className="border-amber-400/25 bg-amber-500/8">
      <div className="flex items-start gap-3">
        <CloudAlert className="mt-0.5 h-5 w-5 text-amber-200" />
        <div className="space-y-1">
          <div className="text-sm font-semibold text-amber-100">Read-only demo workspace</div>
          <p className="text-sm text-amber-50/80">
            This seeded workspace is backed by durable Vercel storage and kept separate from signed-in projects.
            {preview
              ? " You are looking at the preview deployment variant of the public demo."
              : " Use it to explore Canary before creating a private workspace."}
          </p>
        </div>
      </div>
    </Alert>
  );
}
