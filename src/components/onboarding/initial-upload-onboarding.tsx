"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Loader2,
  LockKeyhole,
  MessageSquare,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

type InitialUploadResponse = {
  project?: {
    id: string;
  };
  error?: string;
};

const workflowSteps = [
  { label: "Upload", state: "active" },
  { label: "Parse", state: "next" },
  { label: "Define Rules", state: "next" },
  { label: "Audit", state: "next" },
  { label: "Results", state: "next" },
];

const outcomeItems = [
  { label: "Parse and profile", icon: Database },
  { label: "Chat to define rules", icon: MessageSquare },
  { label: "First findings", icon: ShieldCheck },
];

function isCsvFile(file: File) {
  return file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
}

export function InitialUploadOnboarding() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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
      setIsDragging(false);
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

  return (
    <div
      className="space-y-6"
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
          return;
        }
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        handleFiles(event.dataTransfer.files);
      }}
    >
      <section className="workspace-panel overflow-hidden rounded-[0.9rem] border border-[color:var(--workspace-border)]">
        <div className="grid min-h-[640px] xl:grid-cols-[0.82fr_1.18fr]">
          <aside className="border-b border-[color:var(--workspace-border)] bg-[#0d0d0f] p-6 text-zinc-200 xl:border-b-0 xl:border-r">
            <div className="flex h-full flex-col justify-between gap-10">
              <div className="space-y-8">
                <div className="rounded-[0.75rem] border border-white/8 bg-white/[0.04] p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">New Audit</div>
                  <div className="mt-2 text-2xl font-semibold text-white">Upload Dataset</div>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Start Canary with the first file your team wants watched.
                  </p>
                </div>

                <div className="space-y-3">
                  {workflowSteps.map((step, index) => (
                    <div
                      key={step.label}
                      className={cn(
                        "grid grid-cols-[2.5rem_1fr] items-center rounded-[0.75rem] px-3 py-3 text-sm font-medium",
                        step.state === "active"
                          ? "bg-white/[0.08] text-white"
                          : "text-zinc-500",
                      )}
                    >
                      <span
                        className={cn(
                          "font-mono text-xs",
                          step.state === "active" ? "text-primary" : "text-zinc-600",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[0.75rem] border border-white/8 bg-white/[0.04] p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  System Health: Good
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Your first upload stays scoped to your authenticated workspace.
                </p>
              </div>
            </div>
          </aside>

          <div className="workspace-grid bg-[#f8f6ef] p-6 md:p-8">
            <div className="mx-auto flex h-full max-w-5xl flex-col justify-center gap-8">
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
                <div className="space-y-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700">
                    Step 01 // Ingestion
                  </div>
                  <h1 className="text-5xl font-semibold leading-[0.98] tracking-tight text-slate-950 md:text-7xl">
                    Begin with a dataset.
                  </h1>
                </div>
                <p className="max-w-[46rem] text-base leading-8 text-slate-500">
                  Upload a CSV and Canary will parse the schema, infer columns, and bring you into a quick chat about what to watch for.
                </p>
              </div>

              <div
                className={cn(
                  "rounded-[0.9rem] border border-dashed bg-white/90 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] transition",
                  isDragging
                    ? "border-amber-500 ring-4 ring-amber-200/70"
                    : "border-[color:var(--workspace-border)]",
                )}
              >
                <input
                  ref={inputRef}
                  hidden
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => handleFiles(event.target.files)}
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => inputRef.current?.click()}
                  className="flex min-h-[330px] w-full flex-col items-center justify-center rounded-[0.75rem] border border-dashed border-[color:var(--workspace-border)] bg-slate-50 px-6 py-9 text-center transition hover:border-amber-300 hover:bg-white disabled:cursor-wait disabled:opacity-80"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                    {isUploading ? (
                      <Loader2 className="h-7 w-7 animate-spin" />
                    ) : (
                      <UploadCloud className="h-7 w-7" />
                    )}
                  </span>
                  <div className="mt-5 text-[11px] uppercase tracking-[0.24em] text-amber-700">
                    Canary listening for file
                  </div>
                  <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                    {isUploading ? "Creating your first audit..." : "Drop your first dataset to begin."}
                  </div>
                  <p className="mt-3 max-w-[44rem] text-sm leading-7 text-slate-500">
                    Canary will create your first workspace, parse the CSV, infer the schema, and open the rule chat with file context attached.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-[0.5rem] border border-[color:var(--workspace-border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                      <FileSpreadsheet className="h-4 w-4 text-amber-600" />
                      CSV
                    </span>
                  </div>
                  <span className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-[0.5rem] bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_18px_40px_-28px_rgba(255,201,101,0.7)]">
                    {isUploading ? "Uploading..." : "Choose File"}
                    {!isUploading ? <ArrowRight className="h-4 w-4" /> : null}
                  </span>
                  <div className="mt-4 text-xs text-slate-400">or drop a CSV anywhere on this panel</div>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {outcomeItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-white/80 px-4 py-4 text-sm font-medium text-slate-700"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.5rem] bg-slate-950 text-primary">
                      <item.icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--workspace-border)] bg-white/75 px-4 py-2">
                  <LockKeyhole className="h-3.5 w-3.5 text-amber-600" />
                  Private workspace storage
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--workspace-border)] bg-white/75 px-4 py-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Scoped to your account
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
