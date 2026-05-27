"use client";

import { useMemo, useRef, useState } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { Bot, Loader2, Play, Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { toast } from "@/components/ui/sonner";

type RuleType =
  | "required_field"
  | "date_comparison"
  | "numeric_range"
  | "regex_pattern"
  | "uniqueness"
  | "value_match"
  | "cross_file_reconciliation"
  | "custom_expression";

type RuleSeverity = "critical" | "warning" | "passing";

type UploadedOnboardingFile = {
  id: string;
  original_name: string;
  row_count: number;
  columns: string[];
};

type InitialUploadResponse = {
  project?: {
    id: string;
  };
  file?: UploadedOnboardingFile;
  error?: string;
};

type ProjectContext = {
  projectId: string;
  file: UploadedOnboardingFile;
};

type DraftRule = {
  id: string;
  label: string;
  expression: string;
  category: string;
  description_plain: string;
  rule_type: RuleType;
  rule_config: Record<string, unknown>;
  severity: RuleSeverity;
};

type AuditRuleRecord = {
  id: string;
  description_plain: string;
  rule_type: RuleType;
  rule_config: Record<string, unknown>;
  severity: RuleSeverity;
  active: boolean;
};

type ConversationRule = AuditRuleRecord & {
  category: string;
  expression: string;
};

type AuditProgressRule = {
  id: string;
  description_plain: string;
  rule_type: RuleType;
  severity: RuleSeverity;
};

type AuditProgressEvent =
  | {
      type: "started";
      run_id: string;
      total_rows_checked: number;
      total_rules: number;
      rules: AuditProgressRule[];
    }
  | {
      type: "rule_started";
      run_id: string;
      rule: AuditProgressRule;
      rule_index: number;
      total_rules: number;
    }
  | {
      type: "rule_completed";
      run_id: string;
      rule: AuditProgressRule;
      rule_index: number;
      total_rules: number;
      finding_count: number;
    }
  | {
      type: "completed";
      run_id: string;
      total_findings: number;
      total_rows_checked: number;
      duration_ms: number;
      health_score: number;
    }
  | {
      type: "failed";
      run_id: string;
      error: string;
    };

type RuleProgressState = {
  rule: AuditProgressRule;
  status: "queued" | "running" | "done";
  findingCount: number | null;
};

type AuditFrameState = {
  runId: string | null;
  totalRowsChecked: number;
  totalRules: number;
  completedRules: number;
  totalFindings: number;
  startedAt: number | null;
  completedAt: number | null;
  rules: RuleProgressState[];
  liveFindings: Array<{
    elapsedMs: number;
    rule: AuditProgressRule;
    findingCount: number;
  }>;
  error: string | null;
};

const MIN_AUDIT_DISPLAY_MS = 18_000;
const MIN_RULE_RUNNING_MS = 1_500;
const MIN_RULE_COMPLETED_MS = 1_000;

const onboardingScreens = {
  upload: "/onboarding/01-initial-upload.html",
  parsing: "/onboarding/02-parsing.html",
  defineRules: "react",
  auditRunning: "/onboarding/04-audit-running.html",
} as const;

type OnboardingScreen = keyof typeof onboardingScreens;

function isCsvFile(file: File) {
  return file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
}

function normalizeColumn(column: string) {
  return column.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function findColumn(columns: string[], patterns: RegExp[], usedColumns: Set<string>) {
  return columns.find((column) => {
    if (usedColumns.has(column)) {
      return false;
    }

    const normalized = normalizeColumn(column);
    return patterns.some((pattern) => pattern.test(normalized));
  });
}

function formatColumn(column: string) {
  return column.replace(/_/g, " ");
}

function makeDraftRule(
  id: string,
  label: string,
  expression: string,
  category: string,
  rule_type: RuleType,
  rule_config: Record<string, unknown>,
  severity: RuleSeverity = "critical",
): DraftRule {
  return {
    id,
    label,
    expression,
    category,
    description_plain: label,
    rule_type,
    rule_config,
    severity,
  };
}

function buildDraftRules(file: UploadedOnboardingFile) {
  const usedColumns = new Set<string>();
  const drafts: DraftRule[] = [];

  const addColumnRule = (column: string | undefined, draft: (column: string) => DraftRule) => {
    if (!column) {
      return;
    }

    usedColumns.add(column);
    drafts.push(draft(column));
  };

  addColumnRule(
    findColumn(file.columns, [/^amount$/, /(^|_)amount(_|$)/, /total/, /charge/, /price/, /cost/], usedColumns),
    (column) =>
      makeDraftRule(
        "positive-amount",
        `Positive ${formatColumn(column)}`,
        `${column} > 0`,
        "Financial integrity",
        "numeric_range",
        { column, min: 0, file_id: file.id },
      ),
  );

  addColumnRule(
    findColumn(file.columns, [/created_at/, /timestamp/, /(^|_)date(_|$)/, /time/], usedColumns),
    (column) =>
      makeDraftRule(
        "required-timestamp",
        `Non-null ${formatColumn(column)}`,
        `${column} IS NOT NULL`,
        "Completeness",
        "required_field",
        { column, file_id: file.id, allow_empty_string: false },
      ),
  );

  addColumnRule(
    findColumn(file.columns, [/user_id/, /customer_id/, /account_id/, /member_id/], usedColumns),
    (column) =>
      makeDraftRule(
        "required-entity-id",
        `${formatColumn(column)} exists`,
        `${column} IS NOT NULL`,
        "Identity integrity",
        "required_field",
        { column, file_id: file.id, allow_empty_string: false },
      ),
  );

  addColumnRule(
    findColumn(file.columns, [/transaction_id/, /invoice_id/, /event_id/, /charge_id/, /payment_id/, /order_id/], usedColumns),
    (column) =>
      makeDraftRule(
        "unique-event-id",
        `Unique ${formatColumn(column)}`,
        `${column} is unique`,
        "Duplicate prevention",
        "uniqueness",
        { columns: [column], file_id: file.id },
      ),
  );

  addColumnRule(
    findColumn(file.columns, [/currency/, /currency_code/, /iso_currency/], usedColumns),
    (column) =>
      makeDraftRule(
        "currency-allowlist",
        "Currency allowlist",
        `${column} in [USD, EUR, GBP]`,
        "Policy compliance",
        "value_match",
        { column, allowed_values: ["USD", "EUR", "GBP"], case_sensitive: false, file_id: file.id },
      ),
  );

  for (const column of file.columns) {
    if (drafts.length >= 3 || usedColumns.has(column)) {
      continue;
    }

    usedColumns.add(column);
    drafts.push(
      makeDraftRule(
        `required-${normalizeColumn(column)}`,
        `Required ${formatColumn(column)}`,
        `${column} IS NOT NULL`,
        "Completeness",
        "required_field",
        { column, file_id: file.id, allow_empty_string: false },
      ),
    );
  }

  return drafts.slice(0, 3);
}

function getRuleKey(rule: DraftRule) {
  return `${rule.description_plain}:${rule.rule_type}:${JSON.stringify(rule.rule_config)}`;
}

function formatRows(rowCount: number) {
  if (rowCount >= 1_000_000) {
    return `${(rowCount / 1_000_000).toFixed(1)}M`;
  }

  if (rowCount >= 1_000) {
    return `${Math.round(rowCount / 1_000)}K`;
  }

  return String(rowCount);
}

function formatFullNumber(value: number) {
  return value.toLocaleString("en-US");
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatRuleLabel(index: number) {
  return `R-${String(index + 1).padStart(2, "0")}`;
}

function wait(ms: number) {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function createAbortError() {
  return new DOMException("Audit presentation cancelled.", "AbortError");
}

function createInitialAuditFrameState(): AuditFrameState {
  return {
    runId: null,
    totalRowsChecked: 0,
    totalRules: 0,
    completedRules: 0,
    totalFindings: 0,
    startedAt: null,
    completedAt: null,
    rules: [],
    liveFindings: [],
    error: null,
  };
}

function replaceText(document: Document, from: string, to: string) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    if (node.textContent?.includes(from)) {
      node.textContent = node.textContent.replace(from, to);
    }

    node = walker.nextNode();
  }
}

function replaceTextMatching(document: Document, pattern: RegExp, to: string) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    if (node.textContent && pattern.test(node.textContent)) {
      node.textContent = node.textContent.replace(pattern, to);
    }

    node = walker.nextNode();
  }
}

function readError(payload: { error?: unknown }, fallback: string) {
  if (typeof payload.error === "string") {
    return payload.error;
  }

  return fallback;
}

function inferDatasetKind(columns: string[]) {
  const joinedColumns = columns.map(normalizeColumn).join(" ");

  if (/opportunity|stage|forecast|pipeline|close_date/.test(joinedColumns)) {
    return "sales pipeline";
  }

  if (/invoice|charge|payment|amount|currency|billing/.test(joinedColumns)) {
    return "billing or transaction";
  }

  if (/user|customer|account|member/.test(joinedColumns)) {
    return "customer or account";
  }

  if (/event|timestamp|session|activity/.test(joinedColumns)) {
    return "event log";
  }

  return "operational";
}

function expressionForRule(rule: AuditRuleRecord) {
  const config = rule.rule_config;

  if (rule.rule_type === "required_field" && typeof config.column === "string") {
    return `${config.column} IS NOT NULL`;
  }

  if (rule.rule_type === "numeric_range" && typeof config.column === "string") {
    const min = typeof config.min === "number" ? ` >= ${config.min}` : "";
    const max = typeof config.max === "number" ? ` <= ${config.max}` : "";
    return `${config.column}${min}${max}`.trim();
  }

  if (rule.rule_type === "uniqueness" && Array.isArray(config.columns)) {
    return `${config.columns.join(" + ")} is unique`;
  }

  if (rule.rule_type === "value_match" && typeof config.column === "string" && Array.isArray(config.allowed_values)) {
    return `${config.column} in [${config.allowed_values.join(", ")}]`;
  }

  if (rule.rule_type === "custom_expression" && typeof config.expression === "string") {
    return config.expression;
  }

  return rule.rule_type.replace(/_/g, " ");
}

function categoryForRule(rule: Pick<AuditRuleRecord, "rule_type" | "description_plain">) {
  if (rule.rule_type === "numeric_range" || /amount|currency|payment|charge/i.test(rule.description_plain)) {
    return "Financial integrity";
  }

  if (rule.rule_type === "uniqueness") {
    return "Duplicate prevention";
  }

  if (rule.rule_type === "value_match" || rule.rule_type === "regex_pattern") {
    return "Policy compliance";
  }

  if (/user|account|customer|id/i.test(rule.description_plain)) {
    return "Identity integrity";
  }

  return "Completeness";
}

function toConversationRule(rule: AuditRuleRecord): ConversationRule {
  return {
    ...rule,
    category: categoryForRule(rule),
    expression: expressionForRule(rule),
  };
}

function isDraftDuplicate(rule: AuditRuleRecord, draftRules: DraftRule[]) {
  return draftRules.some(
    (draft) =>
      draft.description_plain === rule.description_plain &&
      draft.rule_type === rule.rule_type &&
      JSON.stringify(draft.rule_config) === JSON.stringify(rule.rule_config),
  );
}

function getMessageText(parts: Array<{ type: string; text?: string }>) {
  return parts
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text)
    .join("\n");
}

function RuleToggle({
  checked,
  label,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 ${
        checked ? "border-[#a27820] bg-[#d4a94a]" : "border-[#c8c1ad] bg-[#d8d2c2]"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full transition-transform duration-200 ease-out ${
          checked ? "translate-x-[21px] bg-[#18120a]" : "translate-x-1 bg-[#fbf9f3]"
        }`}
      />
    </button>
  );
}

function RuleCard({
  code,
  title,
  expression,
  category,
  severity,
  source,
  enabled,
  onToggle,
  disabled = false,
}: {
  code: string;
  title: string;
  expression: string;
  category: string;
  severity: RuleSeverity;
  source: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <li
      className={`rounded-[8px] border bg-[#fbf9f3] p-4 transition-colors ${
        enabled ? "border-[#c8c1ad]" : "border-[#e6e0d2] opacity-65"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-[5px] bg-[#18120a] px-3 py-2 font-mono text-xs font-semibold text-[#f5f2eb]">
              {code}
            </span>
            <span className="rounded-full border border-[#d8d2c2] bg-[#f5f2eb] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5a544c]">
              {category}
            </span>
            <span className="rounded-full border border-[#c44d3a] bg-[#f4dcd3] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f2d1f]">
              {severity === "critical" ? "Critical" : severity}
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-base font-semibold text-[#18120a]">{title}</div>
            <div className="break-words font-mono text-sm text-[#8a847b]">{expression}</div>
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[#a27820]">{source}</div>
        </div>
        <RuleToggle checked={enabled} disabled={disabled} label={`Toggle ${title}`} onChange={onToggle} />
      </div>
    </li>
  );
}

function InitialAiSummary({
  file,
  draftRules,
}: {
  file: UploadedOnboardingFile;
  draftRules: DraftRule[];
}) {
  const columns = file.columns.slice(0, 6);
  const datasetKind = inferDatasetKind(file.columns);
  const recommendedRules = draftRules.map((rule) => rule.label).join(", ");

  return (
    <div className="rounded-[8px] border border-[#e6e0d2] bg-[#fbf9f3] p-5 shadow-[0_1px_0_rgba(15,15,15,0.04)]">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#18120a]">
        <Bot className="h-4 w-4 text-[#a27820]" />
        Canary AI
        <span className="font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-[#8a847b]">now</span>
      </div>
      <div className="space-y-3 text-[15px] leading-7 text-[#2b2620]">
        <p>
          I parsed <span className="font-mono text-[#a27820]">{file.original_name}</span>: {file.columns.length} columns across{" "}
          {formatRows(file.row_count)} rows.
        </p>
        <p>
          This looks like a {datasetKind} dataset. The columns that shaped my read are {columns.join(", ")}
          {file.columns.length > columns.length ? ", and others" : ""}.
        </p>
        <p>I recommended {draftRules.length} audit rules to start: {recommendedRules}.</p>
        <p>
          Useful context would be source system ownership, field definitions, authoritative IDs or timestamps, and allowed-value
          policies that should override these defaults.
        </p>
      </div>
    </div>
  );
}

function RuleDefinitionOnboarding({
  context,
  draftRules,
  selectedRuleIds,
  conversationRules,
  isFinalizing,
  onToggleDraft,
  onConversationRulesChange,
  onToggleConversationRule,
  onRunAudit,
}: {
  context: ProjectContext;
  draftRules: DraftRule[];
  selectedRuleIds: Set<string>;
  conversationRules: ConversationRule[];
  isFinalizing: boolean;
  onToggleDraft: (ruleId: string) => void;
  onConversationRulesChange: (rules: ConversationRule[]) => void;
  onToggleConversationRule: (rule: ConversationRule) => Promise<void>;
  onRunAudit: () => void;
}) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { projectId: context.projectId },
      }),
    [context.projectId],
  );
  const { messages, sendMessage, status } = useChat({
    transport,
    onFinish: async () => {
      router.refresh();
      await loadConversationRules();
    },
    onError: (error) => {
      setChatError(error.message || "AI rule authoring is unavailable.");
      toast.error(error.message || "AI rule authoring is unavailable.");
    },
  });

  const selectedDraftCount = draftRules.filter((rule) => selectedRuleIds.has(rule.id)).length;
  const activeConversationCount = conversationRules.filter((rule) => rule.active).length;
  const enabledCount = selectedDraftCount + activeConversationCount;
  const totalCount = draftRules.length + conversationRules.length;
  const canSend = input.trim().length > 0 && (status === "ready" || status === "error");

  async function loadConversationRules() {
    const response = await fetch(`/api/projects/${context.projectId}/rules`);

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { rules?: AuditRuleRecord[] };
    const nextRules = (payload.rules || [])
      .filter((rule) => !isDraftDuplicate(rule, draftRules))
      .map(toConversationRule);

    onConversationRulesChange(nextRules);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();

    if (!value) {
      return;
    }

    setChatError(null);
    setInput("");
    await sendMessage({ text: value });
  }

  return (
    <main className="min-h-[100dvh] bg-[#f1ede4] px-5 py-5 text-[#18120a]">
      <div className="mx-auto grid min-h-[calc(100dvh-40px)] max-w-[1600px] gap-7 lg:grid-cols-[minmax(0,1fr)_440px]">
        <section className="rounded-[8px] border border-[#e6e0d2] bg-[#f5f2eb] p-7 lg:p-10">
          <div className="mb-9 flex flex-wrap items-start justify-between gap-5">
            <div className="space-y-4">
              <div className="font-mono text-sm uppercase tracking-[0.35em] text-[#8a847b]">Step 03 // Define Rules</div>
              <h1 className="text-5xl font-semibold tracking-normal text-[#18120a] md:text-6xl">
                What should we <span className="text-[#d4a94a]">audit</span>?
              </h1>
            </div>
            <div className="space-y-2 text-right">
              <div className="font-mono text-xs uppercase tracking-[0.35em] text-[#8a847b]">Dataset</div>
              <div className="max-w-[20rem] rounded-[8px] border border-[#e6e0d2] bg-[#fbf9f3] px-4 py-3 font-mono text-sm text-[#a27820]">
                {context.file.original_name}
              </div>
            </div>
          </div>

          <div className="flex min-h-[620px] flex-col gap-5">
            <InitialAiSummary file={context.file} draftRules={draftRules} />

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {messages.map((message) => {
                const text = getMessageText(message.parts);

                if (!text && !message.parts.some((part) => part.type.includes("tool"))) {
                  return null;
                }

                return (
                  <div
                    key={message.id}
                    className={`max-w-[82%] rounded-[8px] border p-4 ${
                      message.role === "user"
                        ? "ml-auto border-[#18120a] bg-[#18120a] text-[#f5f2eb]"
                        : "border-[#e6e0d2] bg-[#fbf9f3] text-[#2b2620]"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
                      {message.role === "user" ? "You" : "Canary AI"}
                    </div>
                    <div className="space-y-2 text-sm leading-6">
                      {text ? <p>{text}</p> : null}
                      {message.parts.some((part) => part.type.includes("tool")) ? (
                        <div className="rounded-[6px] border border-[#d8d2c2] bg-[#f5f2eb] px-3 py-2 text-xs text-[#5a544c]">
                          Rule added to the audit panel.
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              {status === "submitted" || status === "streaming" ? (
                <div className="flex items-center gap-2 text-sm text-[#8a847b]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Canary is reviewing the dataset context.
                </div>
              ) : null}
            </div>

            {chatError ? (
              <div className="rounded-[8px] border border-[#f4dcd3] bg-[#fff7f3] px-4 py-3 text-sm text-[#8f2d1f]">
                {chatError}
              </div>
            ) : null}

            <form className="rounded-[8px] border border-[#d8d2c2] bg-[#fbf9f3] p-4" onSubmit={handleSubmit}>
              <textarea
                value={input}
                rows={3}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Add source context or ask Canary to create another rule."
                className="block w-full resize-none bg-transparent text-sm leading-6 text-[#18120a] outline-none placeholder:text-[#8a847b]"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-[#d8d2c2] px-3 py-1.5 text-xs font-medium text-[#5a544c] hover:bg-[#f5f2eb]"
                    onClick={() => setInput("Suggest one more critical rule for this dataset.")}
                  >
                    Suggest more
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-[#d8d2c2] px-3 py-1.5 text-xs font-medium text-[#5a544c] hover:bg-[#f5f2eb]"
                    onClick={() => setInput("What business definitions do you need before this audit runs?")}
                  >
                    Ask for context
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!canSend}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-[#18120a] px-4 py-2 text-sm font-semibold text-[#f5f2eb] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {status === "submitted" || status === "streaming" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </button>
              </div>
            </form>
          </div>
        </section>

        <aside className="rounded-[8px] border border-[#e6e0d2] bg-[#fbf9f3] p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="font-mono text-sm uppercase tracking-[0.35em] text-[#8a847b]">Audit Rules</div>
              <p className="max-w-[18rem] text-sm leading-6 text-[#8a847b]">Auto-drafted from your data. Toggle to enable.</p>
            </div>
            <div className="rounded-[8px] bg-[#18120a] px-4 py-3 text-center font-mono text-lg font-semibold text-[#f5f2eb]">
              {enabledCount}/{totalCount} on
            </div>
          </div>

          <div className="space-y-6 border-t border-[#d8d2c2] pt-6">
            <section className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.28em]">
                <span className="text-[#a27820]">Recommended</span>
                <span className="text-[#8a847b]">from parse</span>
              </div>
              <ul className="space-y-3">
                {draftRules.map((rule, index) => (
                  <RuleCard
                    key={rule.id}
                    code={`R-${String(index + 1).padStart(2, "0")}`}
                    title={rule.label}
                    expression={rule.expression}
                    category={rule.category}
                    severity={rule.severity}
                    source="Recommended"
                    enabled={selectedRuleIds.has(rule.id)}
                    disabled={isFinalizing}
                    onToggle={() => onToggleDraft(rule.id)}
                  />
                ))}
              </ul>
            </section>

            {conversationRules.length > 0 ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.28em]">
                  <span className="text-[#a27820]">From Conversation</span>
                  <span className="text-[#8a847b]">{conversationRules.length} added</span>
                </div>
                <ul className="space-y-3">
                  {conversationRules.map((rule, index) => (
                    <RuleCard
                      key={rule.id}
                      code={`C-${String(index + 1).padStart(2, "0")}`}
                      title={rule.description_plain}
                      expression={rule.expression}
                      category={rule.category}
                      severity={rule.severity}
                      source="From conversation"
                      enabled={rule.active}
                      disabled={isFinalizing}
                      onToggle={() => void onToggleConversationRule(rule)}
                    />
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <div className="mt-7 space-y-3">
            <button
              type="button"
              disabled={isFinalizing || enabledCount === 0}
              onClick={onRunAudit}
              className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#18120a] px-4 py-3 text-sm font-semibold text-[#f5f2eb] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFinalizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run audit with {enabledCount} active {enabledCount === 1 ? "rule" : "rules"}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}

export function InitialUploadOnboarding() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const createdRuleKeysRef = useRef<Set<string>>(new Set());
  const auditAbortRef = useRef<AbortController | null>(null);
  const auditFrameStateRef = useRef<AuditFrameState>(createInitialAuditFrameState());
  const auditPresentationQueueRef = useRef<Promise<void>>(Promise.resolve());
  const auditPresentationStartedAtRef = useRef<number | null>(null);
  const isAuditPresentationCancelledRef = useRef(false);
  const isFinalizingRef = useRef(false);
  const [screen, setScreen] = useState<OnboardingScreen>("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [draftRules, setDraftRules] = useState<DraftRule[]>([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set());
  const [conversationRules, setConversationRules] = useState<ConversationRule[]>([]);

  function toggleDraftRule(ruleId: string) {
    setSelectedRuleIds((current) => {
      const next = new Set(current);

      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }

      return next;
    });
  }

  async function upload(file: File) {
    if (!isCsvFile(file)) {
      toast.error("Only .csv files are supported for the first upload.");
      return;
    }

    setIsUploading(true);
    setScreen("parsing");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/onboarding/initial-upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as InitialUploadResponse;

      if (!response.ok || !payload.project?.id || !payload.file?.id) {
        throw new Error(payload.error || "Initial upload failed.");
      }

      const nextDraftRules = buildDraftRules(payload.file);

      createdRuleKeysRef.current = new Set();
      setProjectContext({ projectId: payload.project.id, file: payload.file });
      setDraftRules(nextDraftRules);
      setSelectedRuleIds(new Set(nextDraftRules.map((rule) => rule.id)));
      setConversationRules([]);
      toast.success("First audit workspace created.");
      setScreen("defineRules");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Initial upload failed.");
      setScreen("upload");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];

    if (file) {
      void upload(file);
    }
  }

  async function createSelectedDraftRules() {
    if (!projectContext) {
      throw new Error("Project is not ready yet.");
    }

    const selectedRules = draftRules.filter((rule) => selectedRuleIds.has(rule.id));

    if (selectedRules.length === 0 && conversationRules.filter((rule) => rule.active).length === 0) {
      throw new Error("Select at least one rule before continuing.");
    }

    for (const rule of selectedRules) {
      const ruleKey = getRuleKey(rule);

      if (createdRuleKeysRef.current.has(ruleKey)) {
        continue;
      }

      const response = await fetch(`/api/projects/${projectContext.projectId}/rules`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          description_plain: rule.description_plain,
          rule_type: rule.rule_type,
          rule_config: rule.rule_config,
          severity: rule.severity,
        }),
      });
      const payload = (await response.json()) as { error?: unknown };

      if (!response.ok) {
        throw new Error(readError(payload, `Could not create "${rule.label}".`));
      }

      createdRuleKeysRef.current.add(ruleKey);
    }

    router.refresh();
  }

  async function toggleConversationRule(rule: ConversationRule) {
    if (!projectContext) {
      return;
    }

    const nextActive = !rule.active;
    setConversationRules((rules) =>
      rules.map((item) => (item.id === rule.id ? { ...item, active: nextActive } : item)),
    );

    try {
      const response = await fetch(`/api/projects/${projectContext.projectId}/rules/${rule.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
      const payload = (await response.json()) as { error?: unknown; rule?: AuditRuleRecord };

      if (!response.ok) {
        throw new Error(readError(payload, "Could not update rule."));
      }

      if (payload.rule) {
        setConversationRules((rules) =>
          rules.map((item) => (item.id === payload.rule?.id ? toConversationRule(payload.rule) : item)),
        );
      }
    } catch (error) {
      setConversationRules((rules) =>
        rules.map((item) => (item.id === rule.id ? { ...item, active: rule.active } : item)),
      );
      toast.error(error instanceof Error ? error.message : "Could not update rule.");
    }
  }

  function resetAuditFrameState() {
    auditFrameStateRef.current = createInitialAuditFrameState();
    auditPresentationStartedAtRef.current = Date.now();
    auditPresentationQueueRef.current = Promise.resolve();
    isAuditPresentationCancelledRef.current = false;
  }

  async function waitForPresentation(ms: number) {
    const target = Date.now() + Math.max(0, ms);

    while (Date.now() < target) {
      await wait(Math.min(100, target - Date.now()));

      if (isAuditPresentationCancelledRef.current) {
        throw createAbortError();
      }
    }

    if (isAuditPresentationCancelledRef.current) {
      throw createAbortError();
    }
  }

  async function waitForMinimumAuditDisplay() {
    const startedAt = auditPresentationStartedAtRef.current ?? Date.now();
    await waitForPresentation(MIN_AUDIT_DISPLAY_MS - (Date.now() - startedAt));
  }

  function updateAuditFrameState(event: AuditProgressEvent) {
    const state = auditFrameStateRef.current;

    if (event.type === "started") {
      auditFrameStateRef.current = {
        runId: event.run_id,
        totalRowsChecked: event.total_rows_checked,
        totalRules: event.total_rules,
        completedRules: 0,
        totalFindings: 0,
        startedAt: Date.now(),
        completedAt: null,
        rules: event.rules.map((rule) => ({ rule, status: "queued", findingCount: null })),
        liveFindings: [],
        error: null,
      };
      return;
    }

    if (event.type === "rule_started") {
      state.runId = event.run_id;
      state.rules = state.rules.map((item) =>
        item.rule.id === event.rule.id ? { ...item, status: "running" } : item,
      );
      return;
    }

    if (event.type === "rule_completed") {
      state.runId = event.run_id;
      state.completedRules = Math.max(state.completedRules, event.rule_index);
      state.totalFindings += event.finding_count;
      state.rules = state.rules.map((item) =>
        item.rule.id === event.rule.id ? { ...item, status: "done", findingCount: event.finding_count } : item,
      );
      state.liveFindings = [
        ...state.liveFindings,
        {
          elapsedMs: Date.now() - (state.startedAt ?? Date.now()),
          rule: event.rule,
          findingCount: event.finding_count,
        },
      ].slice(-8);
      return;
    }

    if (event.type === "completed") {
      state.runId = event.run_id;
      state.completedAt = Date.now();
      state.completedRules = state.totalRules;
      state.totalFindings = event.total_findings;
      state.totalRowsChecked = event.total_rows_checked;
      state.rules = state.rules.map((item) => ({ ...item, status: "done" }));
      return;
    }

    state.runId = event.run_id || state.runId;
    state.completedAt = Date.now();
    state.error = event.error;
  }

  function renderAuditProgressEvent(event: AuditProgressEvent) {
    updateAuditFrameState(event);

    const document = iframeRef.current?.contentDocument;
    if (document) {
      syncAuditRunningFrame(document);
    }
  }

  function queueAuditProgressEvent(event: AuditProgressEvent) {
    if (event.type === "failed") {
      isAuditPresentationCancelledRef.current = true;
      renderAuditProgressEvent(event);
      return Promise.resolve();
    }

    auditPresentationQueueRef.current = auditPresentationQueueRef.current
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        throw error;
      })
      .then(async () => {
        if (isAuditPresentationCancelledRef.current) {
          throw createAbortError();
        }

        renderAuditProgressEvent(event);

        if (event.type === "rule_started") {
          await waitForPresentation(MIN_RULE_RUNNING_MS);
        }

        if (event.type === "rule_completed") {
          await waitForPresentation(MIN_RULE_COMPLETED_MS);
        }
      });

    return auditPresentationQueueRef.current;
  }

  function setLastSpanText(element: Element | null, text: string) {
    if (!element) {
      return;
    }

    const spans = Array.from(element.querySelectorAll<HTMLElement>("span"));
    const target = spans.at(-1);

    if (target) {
      target.textContent = text;
    }
  }

  function getOrCreateTemplate(list: HTMLElement, selector: string, templateKey: string) {
    let template = list.querySelector<HTMLElement>(`[data-canary-template="${templateKey}"]`);

    if (!template) {
      const firstItem = list.querySelector<HTMLElement>(selector);
      if (!firstItem) {
        return null;
      }

      template = firstItem.cloneNode(true) as HTMLElement;
      template.dataset.canaryTemplate = templateKey;
      template.style.display = "none";
      list.appendChild(template);
    }

    return template;
  }

  function updateAuditMetricRows(document: Document, percent: number, elapsedMs: number) {
    const state = auditFrameStateRef.current;
    const rows = Array.from(document.querySelectorAll<HTMLElement>(".ap-row"));

    rows.forEach((row) => {
      const text = row.textContent ?? "";

      if (text.includes("OVERALL")) {
        const percentElement = row.querySelector<HTMLElement>(".ap-pct") ?? row.querySelector<HTMLElement>("span:last-child");
        if (percentElement) {
          percentElement.textContent = `${percent}%`;
        }
        return;
      }

      if (text.includes("ELAPSED")) {
        setLastSpanText(row, formatElapsed(elapsedMs));
        return;
      }

      if (text.includes("ETA")) {
        setLastSpanText(row, state.completedAt ? "00:00" : "working");
        return;
      }

      if (text.includes("ISSUES")) {
        setLastSpanText(row, `${String(state.totalFindings).padStart(2, "0")} ISSUES FOUND`);
      }
    });

    const fill = document.querySelector<HTMLElement>(".ap-fill");
    if (fill) {
      fill.style.width = `${percent}%`;
    }
  }

  function updateAuditRuleMarkers(document: Document) {
    const state = auditFrameStateRef.current;
    const markers = Array.from(document.querySelectorAll<HTMLElement>(".orb-mark"));

    markers.forEach((marker, index) => {
      const item = state.rules[index];
      marker.style.display = item ? "" : "none";
      marker.textContent = item ? formatRuleLabel(index) : "";

      if (item?.status === "done") {
        marker.style.background = "#dcefdf";
        marker.style.borderColor = "#2c9b62";
      } else if (item?.status === "running") {
        marker.style.background = "#d4a94a";
        marker.style.borderColor = "#a27820";
      } else {
        marker.style.background = "#fbf9f3";
        marker.style.borderColor = "#18120a";
      }
    });
  }

  function updateAuditPhaseList(document: Document) {
    const state = auditFrameStateRef.current;
    const phaseList = document.querySelector<HTMLElement>(".phase-list");

    if (!phaseList) {
      return;
    }

    const template = getOrCreateTemplate(phaseList, ".phase", "phase");
    if (!template) {
      return;
    }

    Array.from(phaseList.querySelectorAll<HTMLElement>(".phase:not([data-canary-template])")).forEach((item) => item.remove());

    state.rules.forEach((item, index) => {
      const phase = template.cloneNode(true) as HTMLElement;
      delete phase.dataset.canaryTemplate;
      phase.style.display = "";
      phase.classList.remove("phase-done", "phase-run", "phase-wait");
      phase.classList.add(item.status === "done" ? "phase-done" : item.status === "running" ? "phase-run" : "phase-wait");

      const findingText =
        item.findingCount === null
          ? "queued"
          : item.findingCount === 0
            ? "0 findings"
            : `${item.findingCount} ${item.findingCount === 1 ? "finding" : "findings"}`;

      const phaseNum = phase.querySelector<HTMLElement>(".phase-num");
      const phaseLabel = phase.querySelector<HTMLElement>(".phase-label");
      const phaseCount = phase.querySelector<HTMLElement>(".phase-count");
      const phaseState = phase.querySelector<HTMLElement>(".phase-state");

      if (phaseNum) {
        phaseNum.textContent = formatRuleLabel(index);
      }
      if (phaseLabel) {
        phaseLabel.textContent = item.rule.description_plain;
      }
      if (phaseCount) {
        phaseCount.textContent = findingText;
      }
      if (phaseState) {
        phaseState.textContent = item.status === "done" ? "DONE" : item.status === "running" ? "RUNNING" : "QUEUED";
      }

      phaseList.insertBefore(phase, template);
    });
  }

  function updateAuditLiveFindings(document: Document) {
    const state = auditFrameStateRef.current;
    const rows = document.querySelector<HTMLElement>(".lf-rows");

    if (!rows) {
      return;
    }

    const template = getOrCreateTemplate(rows, ".lf-row", "finding");
    if (!template) {
      return;
    }

    Array.from(rows.querySelectorAll<HTMLElement>(".lf-row:not([data-canary-template])")).forEach((item) => item.remove());

    const findings =
      state.liveFindings.length > 0
        ? state.liveFindings
        : [
            {
              elapsedMs: 0,
              rule: {
                id: "pending",
                description_plain: "Waiting for active rules to finish",
                rule_type: "required_field" as RuleType,
                severity: "passing" as RuleSeverity,
              },
              findingCount: 0,
            },
          ];

    findings.forEach((finding) => {
      const row = template.cloneNode(true) as HTMLElement;
      delete row.dataset.canaryTemplate;
      row.style.display = "";
      row.classList.remove("lf-row-crit", "lf-row-warn");
      row.classList.add(finding.rule.severity === "critical" ? "lf-row-crit" : "lf-row-warn");

      const severity = finding.findingCount === 0 ? "PASS" : finding.rule.severity === "critical" ? "CRIT" : "WARN";
      const message =
        finding.findingCount === 0
          ? `${finding.rule.description_plain} passed with no findings`
          : `${finding.rule.description_plain} returned ${finding.findingCount} ${
              finding.findingCount === 1 ? "finding" : "findings"
            }`;

      const time = row.querySelector<HTMLElement>(".lf-time");
      const severityElement = row.querySelector<HTMLElement>(".lf-sev");
      const messageElement = row.querySelector<HTMLElement>(".lf-msg");

      if (time) {
        time.textContent = formatElapsed(finding.elapsedMs);
      }
      if (severityElement) {
        severityElement.textContent = severity;
      }
      if (messageElement) {
        messageElement.textContent = message;
      }

      rows.insertBefore(row, template);
    });
  }

  function syncAuditRunningFrame(document: Document) {
    const state = auditFrameStateRef.current;
    const elapsedMs = (state.completedAt ?? Date.now()) - (state.startedAt ?? Date.now());
    const percent = state.totalRules > 0 ? Math.round((state.completedRules / state.totalRules) * 100) : 0;
    const ruleCount = state.totalRules || selectedRuleIds.size + conversationRules.filter((rule) => rule.active).length;
    const rowCount = state.totalRowsChecked || projectContext?.file.row_count || 0;
    const runLabel = state.runId ? `#${state.runId.slice(0, 8)}` : "starting";

    replaceText(document, "billing_events_q1.csv", projectContext?.file.original_name ?? "uploaded dataset");
    replaceText(document, "billing_events_q1", projectContext?.file.original_name.replace(/\.csv$/i, "") ?? "uploaded dataset");
    replaceTextMatching(document, /Audit (?:#042|starting|#[a-z0-9-]+)/i, `Audit ${runLabel}`);
    replaceTextMatching(
      document,
      /(?:Five rules across 1,204,882 rows\.|\d+ active rules? across [\d,]+ rows\.)/,
      `${ruleCount} active ${ruleCount === 1 ? "rule" : "rules"} across ${formatFullNumber(rowCount)} rows.`,
    );
    replaceText(document, "We'll surface results as soon as the temporal pass completes.", "Results update as each active rule finishes processing.");

    updateAuditMetricRows(document, percent, elapsedMs);
    updateAuditRuleMarkers(document);
    updateAuditPhaseList(document);
    updateAuditLiveFindings(document);

    const subhead = document.querySelector<HTMLElement>(".lf-sub");
    if (subhead) {
      subhead.textContent = state.error ? "failed" : state.completedAt ? "complete" : "streaming";
    }

    const cancelButton = document.querySelector<HTMLButtonElement>(".btn-cancel");
    if (cancelButton && !cancelButton.dataset.canaryWired) {
      cancelButton.dataset.canaryWired = "true";
      cancelButton.addEventListener("click", (event) => {
        event.preventDefault();
        isAuditPresentationCancelledRef.current = true;
        auditAbortRef.current?.abort();

        if (projectContext) {
          router.push(`/projects/${projectContext.projectId}/audits`);
          router.refresh();
        }
      });
    }
  }

  async function runAuditWithProgress(projectId: string) {
    auditAbortRef.current?.abort();
    const controller = new AbortController();
    auditAbortRef.current = controller;

    const response = await fetch(`/api/projects/${projectId}/audit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stream: true }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      const payload = (await response.json().catch(() => ({}))) as { error?: unknown };
      throw new Error(readError(payload, "Audit failed."));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let completed = false;

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) {
          continue;
        }

        const event = JSON.parse(line) as AuditProgressEvent;
        void queueAuditProgressEvent(event);

        if (event.type === "failed") {
          throw new Error(event.error);
        }

        if (event.type === "completed") {
          completed = true;
        }
      }

      if (done) {
        break;
      }
    }

    await auditPresentationQueueRef.current;

    if (!completed) {
      throw new Error("Audit stream ended before completion.");
    }

    await waitForMinimumAuditDisplay();
    toast.success("Audit complete.");
    router.push(`/projects/${projectId}/monitoring`);
    router.refresh();
  }

  async function runAuditFromDefinedRules() {
    if (!projectContext || isFinalizingRef.current) {
      return;
    }

    isFinalizingRef.current = true;
    setIsFinalizing(true);

    try {
      await createSelectedDraftRules();

      resetAuditFrameState();
      setScreen("auditRunning");
      await runAuditWithProgress(projectContext.projectId);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      toast.error(error instanceof Error ? error.message : "Could not create rules.");
    } finally {
      isFinalizingRef.current = false;
      setIsFinalizing(false);
    }
  }

  function wireDesignFrame() {
    const document = iframeRef.current?.contentDocument;

    if (!document) {
      return;
    }

    if (screen === "auditRunning") {
      syncAuditRunningFrame(document);
      return;
    }

    const chooseFileButton = document.querySelector<HTMLButtonElement>(".btn-primary");
    chooseFileButton?.addEventListener("click", (event) => {
      event.preventDefault();
      inputRef.current?.click();
    });

    document.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    document.addEventListener("drop", (event) => {
      event.preventDefault();
      handleFiles(event.dataTransfer?.files ?? null);
    });
  }

  if (screen === "defineRules" && projectContext) {
    return (
      <RuleDefinitionOnboarding
        context={projectContext}
        draftRules={draftRules}
        selectedRuleIds={selectedRuleIds}
        conversationRules={conversationRules}
        isFinalizing={isFinalizing}
        onToggleDraft={toggleDraftRule}
        onConversationRulesChange={setConversationRules}
        onToggleConversationRule={toggleConversationRule}
        onRunAudit={() => void runAuditFromDefinedRules()}
      />
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#f1ede4]">
      <input
        ref={inputRef}
        hidden
        type="file"
        accept=".csv,text/csv"
        disabled={isUploading || isFinalizing}
        onChange={(event) => handleFiles(event.target.files)}
      />
      <iframe
        ref={iframeRef}
        title="Canary initial upload onboarding"
        src={onboardingScreens[screen]}
        className="block h-[100dvh] w-full border-0 bg-[#f1ede4]"
        onLoad={wireDesignFrame}
      />
    </main>
  );
}
