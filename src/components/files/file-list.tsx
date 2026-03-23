import { FileText, Layers3 } from "lucide-react";

import type { FileRecord } from "@/lib/db/types";

export function FileList({ files }: { files: FileRecord[] }) {
  if (files.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/4 p-4 text-sm text-muted-foreground">
        No CSVs yet. Drop a file to give Canary some context.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div key={file.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <FileText className="h-4 w-4 text-amber-200" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{file.original_name}</div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
