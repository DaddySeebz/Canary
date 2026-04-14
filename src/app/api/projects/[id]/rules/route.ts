import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { logActivity } from "@/lib/db/activity";
import { getProjectById } from "@/lib/db/projects";
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
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await getProjectById(id, userId))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ rules: await listProjectRules(id) });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await getProjectById(id, userId))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = createRuleSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const validatedConfig = validateRuleConfig(body.data.rule_type, body.data.rule_config);
  const rule = await createRule({
    projectId: id,
    descriptionPlain: body.data.description_plain,
    ruleType: body.data.rule_type,
    ruleConfig: validatedConfig,
    severity: body.data.severity,
  });

  await touchProject(id);
  await logActivity(id, "rule.created", JSON.stringify({ ruleId: rule.id, type: rule.rule_type }));

  return NextResponse.json({ rule }, { status: 201 });
}
