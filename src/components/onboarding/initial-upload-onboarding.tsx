"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "@/components/ui/sonner";

type InitialUploadResponse = {
  project?: {
    id: string;
  };
  error?: string;
};

function isCsvFile(file: File) {
  return file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
}

export function InitialUploadOnboarding() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function upload(file: File) {
    if (!isCsvFile(file)) {
      toast.error("Only .csv files are supported for the first upload.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/onboarding/initial-upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as InitialUploadResponse;

      if (!response.ok || !payload.project?.id) {
        throw new Error(payload.error || "Initial upload failed.");
      }

      toast.success("First audit workspace created.");
      router.push(`/projects/${payload.project.id}/audits`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Initial upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];

    if (file) {
      void upload(file);
    }
  }

  function wireDesignFrame() {
    const document = iframeRef.current?.contentDocument;

    if (!document) {
      return;
    }

    const chooseFileButton = document.querySelector<HTMLButtonElement>(".btn-primary");
    chooseFileButton?.addEventListener("click", (event) => {
      event.preventDefault();
      inputRef.current?.click();
    });

    document.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    document.addEventListener("drop", (event) => {
      event.preventDefault();
      handleFiles(event.dataTransfer?.files ?? null);
    });
  }

  return (
    <main className="min-h-[100dvh] bg-[#f1ede4]">
      <input
        ref={inputRef}
        hidden
        type="file"
        accept=".csv,text/csv"
        disabled={isUploading}
        onChange={(event) => handleFiles(event.target.files)}
      />
      <iframe
        ref={iframeRef}
        title="Canary initial upload onboarding"
        src="/onboarding/01-initial-upload.html"
        className="block h-[100dvh] w-full border-0 bg-[#f1ede4]"
        onLoad={wireDesignFrame}
      />
    </main>
  );
}
