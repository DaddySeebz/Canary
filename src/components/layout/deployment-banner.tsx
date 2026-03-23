import { CloudAlert } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { getDeploymentStorageMode, isVercelDeployment } from "@/lib/runtime";

export function DeploymentBanner() {
  if (!isVercelDeployment() || getDeploymentStorageMode() !== "ephemeral") {
    return null;
  }

  return (
    <Alert className="border-amber-400/25 bg-amber-500/8">
      <div className="flex items-start gap-3">
        <CloudAlert className="mt-0.5 h-5 w-5 text-amber-200" />
        <div className="space-y-1">
          <div className="text-sm font-semibold text-amber-100">Vercel preview mode</div>
          <p className="text-sm text-amber-50/80">
            Canary is running on Vercel with database and upload storage redirected to <span className="font-mono">/tmp</span>. That keeps the deployment functional for demos, but data is ephemeral and not durable across cold starts or instances.
          </p>
        </div>
      </div>
    </Alert>
  );
}
