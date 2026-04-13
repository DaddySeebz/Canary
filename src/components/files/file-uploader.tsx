"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export interface UploadedFilePayload {
  file: unknown;
  schemaDiff: unknown;
}

export function FileUploader({
  projectId,
  onUploaded,
  compact = false,
}: {
  projectId: string;
  onUploaded?: (payload: UploadedFilePayload) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function upload(file: File) {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Upload failed.");
      }

      const payload = (await response.json()) as UploadedFilePayload;
      toast.success("CSV uploaded.");
      onUploaded?.(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div
      className={cn(
        compact
          ? "inline-flex"
          : "rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-6",
      )}
    >
      <input
        ref={inputRef}
        hidden
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void upload(file);
          }
        }}
      />
      {compact ? (
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={isUploading}>
          <UploadCloud className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload CSV"}
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[280px] w-full flex-col items-center justify-center gap-4 rounded-[0.75rem] border border-dashed border-[color:var(--workspace-border)] bg-slate-50 px-6 py-8 text-center"
          disabled={isUploading}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <UploadCloud className="h-7 w-7" />
          </span>
          <div>
            <div className="text-3xl font-semibold tracking-tight text-slate-950">
              {isUploading ? "Uploading..." : "Upload your data source"}
            </div>
            <p className="mt-3 max-w-[40ch] text-sm leading-7 text-slate-500">
              Select a CSV file and Canary will map the schema, sample the rows, and ground every rule you create afterward.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs uppercase tracking-[0.22em] text-slate-400">
            <span className="rounded-[0.5rem] border border-[color:var(--workspace-border)] bg-white px-4 py-2">CSV</span>
            <span className="rounded-[0.5rem] border border-[color:var(--workspace-border)] bg-white px-4 py-2 opacity-60">JSON</span>
            <span className="rounded-[0.5rem] border border-[color:var(--workspace-border)] bg-white px-4 py-2 opacity-60">Parquet</span>
          </div>
        </button>
      )}
    </div>
  );
}
