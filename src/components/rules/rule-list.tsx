"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import type { AuditRuleRecord } from "@/lib/db/types";

export function RuleList({
  projectId,
  rules,
}: {
  projectId: string;
  rules: AuditRuleRecord[];
}) {
  const router = useRouter();

  async function toggleRule(rule: AuditRuleRecord) {
    const response = await fetch(`/api/projects/${projectId}/rules/${rule.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !rule.active }),
    });

    if (!response.ok) {
      toast.error("Could not update rule.");
      return;
    }

    toast.success(rule.active ? "Rule paused." : "Rule activated.");
    router.refresh();
  }

  async function removeRule(rule: AuditRuleRecord) {
    const response = await fetch(`/api/projects/${projectId}/rules/${rule.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      toast.error("Could not delete rule.");
      return;
    }

    toast.success("Rule deleted.");
    router.refresh();
  }

  if (rules.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/4 p-4 text-sm text-muted-foreground">
        No rules yet. Ask Canary for the first one in plain English.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <div key={rule.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    rule.severity === "critical"
                      ? "critical"
                      : rule.severity === "warning"
                        ? "warning"
                        : "passing"
                  }
                >
                  {rule.severity}
                </Badge>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {rule.rule_type.replaceAll("_", " ")}
                </span>
              </div>
              <div className="text-sm font-medium">{rule.description_plain}</div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={rule.active} onCheckedChange={() => void toggleRule(rule)} />
              <Button variant="ghost" size="icon" onClick={() => void removeRule(rule)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
