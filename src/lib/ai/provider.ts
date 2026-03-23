import { createOpenAI } from "@ai-sdk/openai";

let openRouter: ReturnType<typeof createOpenAI> | null = null;

export function getOpenRouter() {
  if (!openRouter) {
    openRouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }

  return openRouter;
}

export function getModel(modelId?: string) {
  return getOpenRouter()(modelId || "anthropic/claude-sonnet-4");
}
