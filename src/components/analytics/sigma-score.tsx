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
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sigma</div>
          <div className="mt-2 font-mono text-3xl">{sigma.toFixed(1)}</div>
          <div className="mt-1 text-sm text-muted-foreground">{label}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">DPMO</div>
          <div className="mt-2 font-mono text-3xl">{Math.round(dpmo).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Yield</div>
          <div className="mt-2 font-mono text-3xl">{(yieldValue * 100).toFixed(1)}%</div>
        </div>
      </CardContent>
    </Card>
  );
}
