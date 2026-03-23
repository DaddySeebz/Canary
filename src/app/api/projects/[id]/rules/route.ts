import { NextResponse } from "next/server";

import { logActivity } from "@/lib/db/activity";
import { touchProject } from "@/lib/db/projects";
import { createRule, listProjectRules } from "@/lib/db/rules";
import { genericRuleSchema, validateRuleConfig } from "@/lib/rules/schemas";

export const runtime = "nodejs";

const createRuleSchema = genericRuleSchema;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return NextResponse.json({ rules: listProjectRules(id) });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = createRuleSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const validatedConfig = validateRuleConfig(body.data.rule_type, body.data.rule_config);
  const rule = createRule({
    projectId: id,
    descriptionPlain: body.data.description_plain,
    ruleType: body.data.rule_type,
    ruleConfig: validatedConfig,
    severity: body.data.severity,
  });

  touchProject(id);
  logActivity(id, "rule.created", JSON.stringify({ ruleId: rule.id, type: rule.rule_type }));

  return NextResponse.json({ rule }, { status: 201 });
}
