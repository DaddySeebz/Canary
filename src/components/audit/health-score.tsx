import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getScoreColor(score: number) {
  if (score >= 90) return "#10b981";
  if (score >= 70) return "#fbbf24";
  return "#ef4444";
}

export function HealthScore({
  score,
  criticalCount,
  warningCount,
  passingCount,
}: {
  score: number;
  criticalCount: number;
  warningCount: number;
  passingCount: number;
}) {
  const circumference = 2 * Math.PI * 54;
  const progress = circumference - (Math.max(0, Math.min(score, 100)) / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Score</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[140px_1fr] md:items-center">
        <div className="mx-auto">
          <svg viewBox="0 0 120 120" className="h-[120px] w-[120px] -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
            <text
              x="60"
              y="65"
              textAnchor="middle"
              className="fill-white font-mono text-[28px] font-bold"
              transform="rotate(90 60 60)"
            >
              {score}
            </text>
          </svg>
        </div>
        <div className="space-y-4">
          <p className="max-w-[42ch] text-sm text-muted-foreground">
            Here’s the short version: what broke, what needs watching, and whether the dataset is safe to move downstream.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-red-400/20 bg-red-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-red-100">
                <ShieldAlert className="h-4 w-4" />
                Critical
              </div>
              <div className="mt-2 font-mono text-2xl">{criticalCount}</div>
            </div>
            <div className="rounded-[1.25rem] border border-amber-400/20 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-100">
                <AlertTriangle className="h-4 w-4" />
                Warnings
              </div>
              <div className="mt-2 font-mono text-2xl">{warningCount}</div>
            </div>
            <div className="rounded-[1.25rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
                Passing
              </div>
              <div className="mt-2 font-mono text-2xl">{passingCount}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
