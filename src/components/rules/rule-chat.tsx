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
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-amber-200" />
          Rule chat
        </div>
        <p className="text-sm text-muted-foreground">
          Tell Canary what should be true. It will turn that into a usable audit rule.
        </p>
      </div>
      <div className="min-h-[320px] flex-1 space-y-3 overflow-y-auto rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
        {messages.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/4 p-4 text-sm text-muted-foreground">
            Try: “Amount should always be positive” or “Invoice ID must be unique.”
          </div>
        ) : null}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[90%] rounded-[1.25rem] border p-4 ${
              message.role === "user"
                ? "ml-auto border-amber-300/20 bg-amber-400/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {message.role}
            </div>
            <div className="space-y-2 text-sm">
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return <p key={index}>{part.text}</p>;
                }

                if (part.type === "reasoning") {
                  return (
                    <p key={index} className="text-xs text-muted-foreground">
                      {part.text}
                    </p>
                  );
                }

                if (part.type.includes("tool")) {
                  return (
                    <div key={index} className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
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
          <p className="text-xs text-muted-foreground">
            Direct in, durable rule out.
          </p>
          <Button type="submit" disabled={status !== "ready" && status !== "error"}>
            {status === "submitted" || status === "streaming" ? "Thinking..." : "Create Rule"}
          </Button>
        </div>
      </form>
    </div>
  );
}
