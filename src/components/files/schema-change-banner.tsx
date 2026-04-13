import { AlertTriangle, ArrowRight } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import type { SchemaDiffResult } from "@/lib/db/types";

export function SchemaChangeBanner({ schemaDiff }: { schemaDiff: SchemaDiffResult | null }) {
  if (!schemaDiff) {
    return null;
  }

  const hasChanges =
    schemaDiff.added.length > 0 ||
    schemaDiff.removed.length > 0 ||
    schemaDiff.renamed.length > 0;

  if (!hasChanges || !schemaDiff.previousFile) {
    return null;
  }

  return (
    <Alert className="border-amber-200 bg-[#fff8e8]">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
        <div className="space-y-3">
          <div>
            <div className="text-sm font-semibold text-amber-800">Schema change detected</div>
            <p className="mt-1 text-sm text-amber-700">
              This upload changed the shape of {schemaDiff.previousFile.original_name}. Review the impacted rules before the next audit.
            </p>
          </div>
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div>
              <div className="mb-1 text-xs uppercase tracking-[0.18em] text-amber-700/80">Added</div>
              <div>{schemaDiff.added.join(", ") || "None"}</div>
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-[0.18em] text-amber-700/80">Removed</div>
              <div>{schemaDiff.removed.join(", ") || "None"}</div>
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-[0.18em] text-amber-700/80">Renamed</div>
              <div className="space-y-1">
                {schemaDiff.renamed.length > 0
                  ? schemaDiff.renamed.map((rename) => (
                      <div key={`${rename.from}-${rename.to}`} className="inline-flex items-center gap-1">
                        <span>{rename.from}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>{rename.to}</span>
                      </div>
                    ))
                  : "None"}
              </div>
            </div>
          </div>
          {schemaDiff.affectedRules.length > 0 ? (
            <p className="text-sm text-amber-700">
              Impacted rules: {schemaDiff.affectedRules.map((rule) => rule.description_plain).join(", ")}
            </p>
          ) : null}
        </div>
      </div>
    </Alert>
  );
}
