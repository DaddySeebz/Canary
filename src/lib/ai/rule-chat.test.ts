import assert from "node:assert/strict";
import test from "node:test";

import { createRuleFromChatInput, parseRuleChatRequest } from "./rule-chat.ts";

test("parseRuleChatRequest rejects malformed JSON with a safe 400 response", async () => {
  const result = await parseRuleChatRequest(
    new Request("https://canary.test/api/chat", {
      method: "POST",
      body: "{not json",
    }),
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.response.status, 400);
    assert.deepEqual(await result.response.json(), {
      error: "Invalid chat request.",
      code: "invalid_chat_request",
    });
  }
});

test("parseRuleChatRequest caps message history for production chat requests", async () => {
  const result = await parseRuleChatRequest(
    new Request("https://canary.test/api/chat", {
      method: "POST",
      body: JSON.stringify({
        projectId: "project-1",
        messages: Array.from({ length: 25 }, (_, index) => ({
          id: `message-${index}`,
          role: "user",
          parts: [{ type: "text", text: "Amount should be positive." }],
        })),
      }),
    }),
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.response.status, 400);
  }
});

test("createRuleFromChatInput validates and persists an AI-drafted rule", async () => {
  const calls: string[] = [];
  const created = await createRuleFromChatInput(
    "project-1",
    {
      description_plain: "Amount should be positive",
      rule_type: "numeric_range",
      rule_config: { column: "amount", min: 0, file_id: "file-1" },
      severity: "critical",
    },
    {
      createRule: async (input) => {
        calls.push(`create:${input.projectId}:${input.ruleType}`);
        return {
          id: "rule-1",
          project_id: input.projectId,
          description_plain: input.descriptionPlain,
          rule_type: input.ruleType,
          rule_config: input.ruleConfig,
          severity: input.severity,
          created_at: "2026-06-12T12:00:00.000Z",
          active: true,
        };
      },
      touchProject: async (projectId) => {
        calls.push(`touch:${projectId}`);
      },
      logActivity: async (projectId, action, details) => {
        calls.push(`log:${projectId}:${action}:${JSON.parse(details).ruleId}`);
      },
    },
  );

  assert.equal(created.id, "rule-1");
  assert.deepEqual(created.rule_config, { column: "amount", min: 0, file_id: "file-1" });
  assert.deepEqual(calls, [
    "create:project-1:numeric_range",
    "touch:project-1",
    "log:project-1:rule.created.ai:rule-1",
  ]);
});
