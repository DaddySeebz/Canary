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
          {isUploading ? "Uploading..." : "Drop CSV"}
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-start gap-3 text-left"
          disabled={isUploading}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-amber-500/10 text-amber-200">
            <UploadCloud className="h-5 w-5" />
          </span>
          <div>
            <div className="text-base font-semibold">{isUploading ? "Uploading..." : "Drop a CSV or click to upload"}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Canary stores the raw file locally, samples the first rows, and uses the schema to ground rules.
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
