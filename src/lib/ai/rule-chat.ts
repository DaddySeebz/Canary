import type { UIMessage } from "ai";
import { z } from "zod";

import type { AuditRuleRecord } from "../db/types.ts";
import type { RuleSeverity, RuleType } from "../rules/types.ts";
import { genericRuleSchema, validateRuleConfig } from "../rules/schemas.ts";

export const MAX_CHAT_MESSAGES = 24;

const ruleChatRequestSchema = z.object({
  projectId: z.string().min(1),
  messages: z.array(z.custom<UIMessage>()).min(1).max(MAX_CHAT_MESSAGES),
});

export type RuleChatRequest = z.infer<typeof ruleChatRequestSchema>;

export type CreateRuleFromChatInputDeps = {
  createRule: (input: {
    projectId: string;
    descriptionPlain: string;
    ruleType: RuleType;
    ruleConfig: Record<string, unknown>;
    severity: RuleSeverity;
  }) => Promise<AuditRuleRecord>;
  touchProject: (projectId: string) => Promise<void>;
  logActivity: (projectId: string, action: string, details: string) => Promise<unknown>;
};

export function jsonError(error: string, code: string, status: number) {
  return new Response(JSON.stringify({ error, code }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function parseRuleChatRequest(
  request: Request,
): Promise<{ ok: true; data: RuleChatRequest } | { ok: false; response: Response }> {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return {
      ok: false,
      response: jsonError("Invalid chat request.", "invalid_chat_request", 400),
    };
  }

  const parsed = ruleChatRequestSchema.safeParse(json);

  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError("Invalid chat request.", "invalid_chat_request", 400),
    };
  }

  return { ok: true, data: parsed.data };
}

export function stripUiMessageIds(messages: UIMessage[]) {
  return messages.map((message) => {
    const { id, ...payload } = message as UIMessage & { id?: string };
    void id;
    return payload;
  });
}

export function getSafeStreamErrorMessage(error: unknown) {
  console.error("AI rule chat stream failed", error);
  return "AI rule drafting is temporarily unavailable.";
}

export async function createRuleFromChatInput(
  projectId: string,
  input: unknown,
  deps: CreateRuleFromChatInputDeps,
) {
  const parsed = genericRuleSchema.parse(input);
  const ruleConfig = validateRuleConfig(parsed.rule_type, parsed.rule_config);
  const rule = await deps.createRule({
    projectId,
    descriptionPlain: parsed.description_plain,
    ruleType: parsed.rule_type,
    ruleConfig,
    severity: parsed.severity,
  });

  await deps.touchProject(projectId);
  await deps.logActivity(
    projectId,
    "rule.created.ai",
    JSON.stringify({ ruleId: rule.id, ruleType: rule.rule_type }),
  );

  return rule;
}
