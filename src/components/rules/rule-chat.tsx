"use client";

import { useMemo, useState } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function RuleChat({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { projectId },
      }),
    [projectId],
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    onFinish: () => {
      router.refresh();
    },
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();
    if (!value) {
      return;
    }

    setInput("");
    await sendMessage({ text: value });
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <Sparkles className="h-4 w-4 text-amber-600" />
          Rule chat
        </div>
        <p className="text-sm text-slate-500">
          Tell Canary what should be true. It will turn that into a usable audit rule.
        </p>
      </div>
      <div className="min-h-[320px] flex-1 space-y-3 overflow-y-auto rounded-[0.75rem] border border-[color:var(--workspace-border)] bg-slate-50 p-4">
        {messages.length === 0 ? (
          <div className="rounded-[0.75rem] border border-dashed border-[color:var(--workspace-border)] bg-white p-4 text-sm text-slate-500">
            Try: &ldquo;Amount should always be positive&rdquo; or &ldquo;Invoice ID must be unique.&rdquo;
          </div>
        ) : null}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[90%] rounded-[0.75rem] border p-4 ${
              message.role === "user"
                ? "ml-auto border-amber-200 bg-amber-50"
                : "border-[color:var(--workspace-border)] bg-white"
            }`}
          >
            <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
              {message.role}
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return <p key={index}>{part.text}</p>;
                }

                if (part.type === "reasoning") {
                  return (
                    <p key={index} className="text-xs text-slate-400">
                      {part.text}
                    </p>
                  );
                }

                if (part.type.includes("tool")) {
                  return (
                    <div key={index} className="rounded-[0.65rem] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      Rule proposal executed.
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        ))}
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Example: Transaction date should be before settlement date."
          className="min-h-[110px]"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Direct in, durable rule out.</p>
          <Button type="submit" disabled={status !== "ready" && status !== "error"}>
            {status === "submitted" || status === "streaming" ? "Thinking..." : "Create Rule"}
          </Button>
        </div>
      </form>
    </div>
  );
}
