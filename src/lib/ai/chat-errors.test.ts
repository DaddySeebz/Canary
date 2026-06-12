import assert from "node:assert/strict";
import test from "node:test";

import { getChatErrorMessage } from "./chat-errors.ts";

test("getChatErrorMessage reads JSON error payloads from failed chat requests", () => {
  const message = getChatErrorMessage(
    new Error(JSON.stringify({ error: "AI rule chat is not configured for this deployment." })),
    "fallback",
  );

  assert.equal(message, "AI rule chat is not configured for this deployment.");
});

test("getChatErrorMessage falls back for empty or non-user-facing errors", () => {
  assert.equal(getChatErrorMessage(new Error(""), "Rule drafting is unavailable."), "Rule drafting is unavailable.");
  assert.equal(getChatErrorMessage({}, "Rule drafting is unavailable."), "Rule drafting is unavailable.");
});
