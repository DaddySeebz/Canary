import { auth } from "@clerk/nextjs/server";
import {
  consumeStream,
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";

import { getModel } from "@/lib/ai/provider";
import {
  createRuleFromChatInput,
  getSafeStreamErrorMessage,
  jsonError,
  parseRuleChatRequest,
  stripUiMessageIds,
} from "@/lib/ai/rule-chat";
import { buildRuleSystemPrompt } from "@/lib/ai/system-prompt";
import { logActivity } from "@/lib/db/activity";
import { getProjectById, touchProject } from "@/lib/db/projects";
import { createRule } from "@/lib/db/rules";
import { isAiConfigured } from "@/lib/env";
import { genericRuleSchema } from "@/lib/rules/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return jsonError("Unauthorized", "unauthorized", 401);
  }

  if (!isAiConfigured()) {
    return jsonError(
      "AI rule chat is not configured for this deployment.",
      "ai_feature_disabled",
      503,
    );
  }

  const body = await parseRuleChatRequest(request);

  if (!body.ok) {
    return body.response;
  }

  if (!(await getProjectById(body.data.projectId, userId))) {
    return jsonError("Project not found", "project_not_found", 404);
  }

  try {
    const result = streamText({
      model: getModel(),
      system: await buildRuleSystemPrompt(body.data.projectId),
      messages: await convertToModelMessages(stripUiMessageIds(body.data.messages) as UIMessage[]),
      abortSignal: request.signal,
      stopWhen: stepCountIs(3),
      onError: ({ error }) => {
        console.error("AI rule chat failed", error);
      },
      tools: {
        create_rule: tool({
          description: "Create a Canary audit rule for this project.",
          inputSchema: genericRuleSchema,
          execute: async (input) =>
            createRuleFromChatInput(body.data.projectId, input, {
              createRule,
              touchProject,
              logActivity,
            }),
        }),
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: body.data.messages,
      consumeSseStream: consumeStream,
      onError: getSafeStreamErrorMessage,
    });
  } catch (error) {
    console.error("AI rule chat request failed", error);
    return jsonError(
      "AI rule drafting is temporarily unavailable.",
      "ai_chat_failed",
      500,
    );
  }
}
