import { auth } from "@clerk/nextjs/server";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { buildRuleSystemPrompt } from "@/lib/ai/system-prompt";
import { getModel } from "@/lib/ai/provider";
import { logActivity } from "@/lib/db/activity";
import { getProjectById } from "@/lib/db/projects";
import { touchProject } from "@/lib/db/projects";
import { createRule } from "@/lib/db/rules";
import { genericRuleSchema, validateRuleConfig } from "@/lib/rules/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  projectId: z.string().min(1),
  messages: z.array(z.custom<UIMessage>()),
});

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const body = requestSchema.safeParse(await request.json());

  if (!body.success) {
    return new Response(JSON.stringify({ error: body.error.flatten() }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  if (!getProjectById(body.data.projectId, userId)) {
    return new Response(JSON.stringify({ error: "Project not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  const result = streamText({
    model: getModel(),
    system: buildRuleSystemPrompt(body.data.projectId),
    messages: await convertToModelMessages(
      body.data.messages.map((message) => {
        const { id, ...payload } = message as UIMessage & { id?: string };
        void id;
        return payload;
      }),
    ),
    stopWhen: stepCountIs(3),
    tools: {
      create_rule: tool({
        description: "Create a Canary audit rule for this project.",
        inputSchema: genericRuleSchema,
        execute: async (input) => {
          const ruleConfig = validateRuleConfig(input.rule_type, input.rule_config);
          const rule = createRule({
            projectId: body.data.projectId,
            descriptionPlain: input.description_plain,
            ruleType: input.rule_type,
            ruleConfig,
            severity: input.severity,
          });

          touchProject(body.data.projectId);
          logActivity(
            body.data.projectId,
            "rule.created.ai",
            JSON.stringify({ ruleId: rule.id, ruleType: rule.rule_type }),
          );

          return rule;
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
