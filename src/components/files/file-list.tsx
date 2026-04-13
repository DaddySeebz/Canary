import { FileText, Layers3 } from "lucide-react";

import type { FileRecord } from "@/lib/db/types";

export function FileList({ files }: { files: FileRecord[] }) {
  if (files.length === 0) {
    return (
      <div className="rounded-[0.75rem] border border-dashed border-[color:var(--workspace-border)] bg-slate-50 p-4 text-sm text-slate-500">
        No CSVs yet. Drop a file to give Canary some context.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div key={file.id} className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[0.65rem] bg-amber-50">
              <FileText className="h-4 w-4 text-amber-600" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-950">{file.original_name}</div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="font-mono-data font-mono">{file.row_count} rows</span>
                <span className="inline-flex items-center gap-1">
                  <Layers3 className="h-3.5 w-3.5" />
                  {file.columns.length} columns
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
