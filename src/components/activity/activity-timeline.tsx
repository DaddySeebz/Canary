import { Activity, BrainCircuit, Calculator, FileUp, ShieldCheck } from "lucide-react";

import type { ActivityRecord } from "@/lib/db/types";

function iconForAction(action: string) {
  if (action.startsWith("file.")) return FileUp;
  if (action.startsWith("rule.")) return ShieldCheck;
  if (action.startsWith("roi.")) return Calculator;
  if (action.startsWith("insights.")) return BrainCircuit;
  return Activity;
}

export function ActivityTimeline({ entries }: { entries: ActivityRecord[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-[0.75rem] border border-dashed border-[color:var(--workspace-border)] bg-slate-50 p-6 text-sm text-slate-500">
        No activity yet. Upload a file or run the first audit to start the trail.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const Icon = iconForAction(entry.action);
        return (
          <div key={entry.id} className="flex gap-4 rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.65rem] bg-amber-50">
              <Icon className="h-4 w-4 text-amber-600" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-950">{entry.action.replaceAll(".", " / ")}</div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {new Date(entry.created_at).toLocaleString()}
              </div>
              {entry.details ? <pre className="whitespace-pre-wrap font-mono text-xs text-slate-500">{entry.details}</pre> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
