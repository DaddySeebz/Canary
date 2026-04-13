import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SigmaScore({
  sigma,
  dpmo,
  yieldValue,
  label,
}: {
  sigma: number;
  dpmo: number;
  yieldValue: number;
  label: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Six Sigma</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Sigma</div>
          <div className="mt-2 font-mono text-3xl text-slate-950">{sigma.toFixed(1)}</div>
          <div className="mt-1 text-sm text-slate-500">{label}</div>
        </div>
        <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">DPMO</div>
          <div className="mt-2 font-mono text-3xl text-slate-950">{Math.round(dpmo).toLocaleString()}</div>
        </div>
        <div className="rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Yield</div>
          <div className="mt-2 font-mono text-3xl text-slate-950">{(yieldValue * 100).toFixed(1)}%</div>
        </div>
      </CardContent>
    </Card>
  );
}
