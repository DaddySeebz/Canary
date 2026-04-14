import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { logActivity } from "@/lib/db/activity";
import { getProjectById } from "@/lib/db/projects";
import { touchProject } from "@/lib/db/projects";
import { deleteRule, getRuleById, updateRule } from "@/lib/db/rules";
import { validateRuleConfig } from "@/lib/rules/schemas";

export const runtime = "nodejs";

const updateRuleSchema = z.object({
  description_plain: z.string().min(1).optional(),
  rule_type: z
    .enum([
      "required_field",
      "date_comparison",
      "numeric_range",
      "regex_pattern",
      "uniqueness",
      "value_match",
      "cross_file_reconciliation",
      "custom_expression",
    ])
    .optional(),
  rule_config: z.record(z.string(), z.unknown()).optional(),
  severity: z.enum(["critical", "warning", "passing"]).optional(),
  active: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string; ruleId: string }> },
) {
  const { id, ruleId } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await getProjectById(id, userId))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const existing = await getRuleById(ruleId);

  if (!existing || existing.project_id !== id) {
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  }

  const body = updateRuleSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const ruleType = body.data.rule_type || existing.rule_type;
  const ruleConfig = body.data.rule_config
    ? validateRuleConfig(ruleType, body.data.rule_config)
    : undefined;

  const updated = await updateRule(ruleId, {
    descriptionPlain: body.data.description_plain,
    ruleType: body.data.rule_type,
    ruleConfig,
    severity: body.data.severity,
    active: body.data.active,
  });

  await touchProject(id);
  await logActivity(id, "rule.updated", JSON.stringify({ ruleId, changes: body.data }));

  return NextResponse.json({ rule: updated });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; ruleId: string }> },
) {
  const { id, ruleId } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await getProjectById(id, userId))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const rule = await getRuleById(ruleId);

  if (!rule || rule.project_id !== id) {
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  }

  await deleteRule(ruleId);
  await touchProject(id);
  await logActivity(id, "rule.deleted", JSON.stringify({ ruleId, type: rule.rule_type }));

  return NextResponse.json({ success: true });
}
