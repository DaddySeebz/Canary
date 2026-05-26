"use client";

import { useRef, useState } from "react";
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

const onboardingScreens = {
  upload: "/onboarding/01-initial-upload.html",
  parsing: "/onboarding/02-parsing.html",
  defineRules: "/onboarding/03-define-rules.html",
} as const;

type OnboardingScreen = keyof typeof onboardingScreens;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
        `${column} ∈ [USD, EUR, GBP]`,
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

function findButton(document: Document, label: string) {
  return Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find((button) =>
    button.textContent?.replace(/\s+/g, " ").trim().includes(label),
  );
}

function readError(payload: { error?: unknown }, fallback: string) {
  if (typeof payload.error === "string") {
    return payload.error;
  }

  return fallback;
}

function inferDatasetKind(columns: string[]) {
  const normalizedColumns = columns.map(normalizeColumn);
  const joinedColumns = normalizedColumns.join(" ");

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

function createSummaryParagraph(document: Document, text: string) {
  const paragraph = document.createElement("p");
  paragraph.className = "bubble-foot";
  paragraph.textContent = text;
  paragraph.style.margin = "0 0 10px";
  paragraph.style.lineHeight = "1.55";
  return paragraph;
}

export function InitialUploadOnboarding() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const selectedRuleIdsRef = useRef<Set<string>>(new Set());
  const createdRuleKeysRef = useRef<Set<string>>(new Set());
  const hasConversationRulesRef = useRef(false);
  const isFinalizingRef = useRef(false);
  const isAiSendingRef = useRef(false);
  const [screen, setScreen] = useState<OnboardingScreen>("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [hasConversationRules, setHasConversationRules] = useState(false);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [draftRules, setDraftRules] = useState<DraftRule[]>([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set());

  function setSelectedRules(nextSelectedRuleIds: Set<string>) {
    selectedRuleIdsRef.current = nextSelectedRuleIds;
    setSelectedRuleIds(new Set(nextSelectedRuleIds));
  }

  function setConversationRulesVisible(isVisible: boolean) {
    hasConversationRulesRef.current = isVisible;
    setHasConversationRules(isVisible);
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
      const nextSelectedRuleIds = new Set(nextDraftRules.map((rule) => rule.id));

      createdRuleKeysRef.current = new Set();
      setConversationRulesVisible(false);
      setProjectContext({ projectId: payload.project.id, file: payload.file });
      setDraftRules(nextDraftRules);
      setSelectedRules(nextSelectedRuleIds);
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

  function syncRuleFrame(document: Document) {
    if (!projectContext) {
      return;
    }

    const conversationToggleStats = getConversationToggleStats(document);
    const selectedCount =
      draftRules.filter((rule) => selectedRuleIdsRef.current.has(rule.id)).length + conversationToggleStats.selected;
    const totalCount = draftRules.length + conversationToggleStats.total;

    replaceText(document, "billing_events_q1.csv", projectContext.file.original_name);
    replaceText(document, "billing_events_q1", projectContext.file.original_name.replace(/\.csv$/i, ""));
    replaceText(document, "24 columns", `${projectContext.file.columns.length} columns`);
    replaceText(document, "1.2M rows", `${formatRows(projectContext.file.row_count)} rows`);
    replaceText(document, "3 recommended rules", `${draftRules.length} recommended rules`);
    replaceText(document, "4 / 5 on", `${selectedCount} / ${totalCount} on`);

    const count = document.querySelector<HTMLElement>(".rp-count");
    const countOf = document.querySelector<HTMLElement>(".rp-count-of");

    if (count) {
      count.textContent = String(selectedCount);
    }

    if (countOf) {
      countOf.textContent = `/${totalCount} on`;
    }

    syncConversation(document);
    syncRuleRows(document);
    syncCanarySummary(document);

    const runButton = findButton(document, "Run audit");
    if (runButton) {
      runButton.textContent = `Run audit with ${selectedCount} active ${selectedCount === 1 ? "rule" : "rules"} →`;
    }
  }

  function syncConversation(document: Document) {
    const groups = Array.from(document.querySelectorAll<HTMLElement>(".rp-group"));
    const conversationGroup = groups[1];

    if (!conversationGroup) {
      return;
    }

    conversationGroup.style.display = hasConversationRulesRef.current ? "" : "none";
  }

  function getConversationToggleStats(document: Document) {
    if (!hasConversationRulesRef.current) {
      return { selected: 0, total: 0 };
    }

    const groups = Array.from(document.querySelectorAll<HTMLElement>(".rp-group"));
    const conversationGroup = groups[1];
    const toggles = Array.from(conversationGroup?.querySelectorAll<HTMLButtonElement>(".rp-toggle") ?? []);

    return {
      selected: toggles.filter((toggle) => toggle.dataset.on !== "0").length,
      total: toggles.length,
    };
  }

  function syncRuleRows(document: Document) {
    const recommendedGroup = document.querySelector<HTMLElement>(".rp-group");
    const ruleItems = Array.from(recommendedGroup?.querySelectorAll<HTMLElement>(".rp-item") ?? []);

    ruleItems.forEach((item, index) => {
      const rule = draftRules[index];

      if (!rule) {
        item.style.display = "none";
        return;
      }

      item.style.display = "";
      item.classList.toggle("rp-item-on", selectedRuleIdsRef.current.has(rule.id));

      const tag = item.querySelector<HTMLElement>(".rp-tag");
      const name = item.querySelector<HTMLElement>(".rp-name");
      const expression = item.querySelector<HTMLElement>(".rp-expr");

      if (tag) {
        tag.textContent = `R-${String(index + 1).padStart(2, "0")}`;
      }

      if (name) {
        name.textContent = rule.label;
      }

      if (expression) {
        expression.textContent = rule.expression;
      }

      syncRuleMetadata(item, rule);
    });
  }

  function syncRuleMetadata(item: HTMLElement, rule: DraftRule) {
    const body = item.querySelector<HTMLElement>(".rp-body");
    const name = item.querySelector<HTMLElement>(".rp-name");

    if (!body || !name) {
      return;
    }

    let metadata = body.querySelector<HTMLElement>("[data-canary-rule-meta]");

    if (!metadata) {
      metadata = item.ownerDocument.createElement("div");
      metadata.dataset.canaryRuleMeta = "true";
      body.insertBefore(metadata, name);
    }

    metadata.innerHTML = `
      <span>${escapeHtml(rule.category)}</span>
      <strong>${rule.severity === "critical" ? "Critical" : escapeHtml(rule.severity)}</strong>
    `;
    metadata.style.display = "flex";
    metadata.style.gap = "6px";
    metadata.style.alignItems = "center";
    metadata.style.marginBottom = "5px";
    metadata.style.fontSize = "10px";
    metadata.style.lineHeight = "1";
    metadata.style.textTransform = "uppercase";
    metadata.style.letterSpacing = "0.08em";
    metadata.style.color = "#5a544c";

    const [category, severity] = Array.from(metadata.children) as HTMLElement[];

    if (category) {
      category.style.border = "1px solid #d8d2c2";
      category.style.borderRadius = "999px";
      category.style.padding = "4px 6px";
      category.style.background = "#fbf9f3";
    }

    if (severity) {
      severity.style.border = "1px solid #c44d3a";
      severity.style.borderRadius = "999px";
      severity.style.padding = "4px 6px";
      severity.style.background = "#f4dcd3";
      severity.style.color = "#8f2d1f";
      severity.style.fontWeight = "700";
    }
  }

  function syncCanarySummary(document: Document) {
    if (!projectContext) {
      return;
    }

    const chatThread = document.querySelector<HTMLElement>(".chat-thread");
    const firstAiBubble = document.querySelector<HTMLElement>(".bubble-ai");

    if (!chatThread || !firstAiBubble) {
      return;
    }

    Array.from(chatThread.querySelectorAll<HTMLElement>(".bubble")).forEach((bubble) => {
      if (bubble !== firstAiBubble) {
        bubble.remove();
      }
    });

    const summaryHeader = document.createElement("div");
    summaryHeader.className = "bubble-who";
    summaryHeader.innerHTML = `<span>Canary AI</span><span class="who-time mono">now</span>`;

    const columns = projectContext.file.columns.slice(0, 6);
    const datasetKind = inferDatasetKind(projectContext.file.columns);
    const recommendedRules = draftRules.map((rule) => rule.label).join(", ");

    firstAiBubble.replaceChildren(
      summaryHeader,
      createSummaryParagraph(
        document,
        `I parsed ${projectContext.file.original_name}: ${projectContext.file.columns.length} columns across ${formatRows(
          projectContext.file.row_count,
        )} rows.`,
      ),
      createSummaryParagraph(
        document,
        `This looks like a ${datasetKind} dataset. The columns that shaped my read are ${columns.join(", ")}${
          projectContext.file.columns.length > columns.length ? ", and others" : ""
        }.`,
      ),
      createSummaryParagraph(
        document,
        `I recommended ${draftRules.length} audit rules to start: ${recommendedRules}. Toggle anything that should not run yet.`,
      ),
      createSummaryParagraph(
        document,
        "Before the audit, I need any source-system context, field definitions, authoritative IDs or timestamps, and allowed-value policies that should override these defaults.",
      ),
    );
  }

  function syncToggleButtons(document: Document) {
    const toggleButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".rp-toggle"));

    toggleButtons.forEach((button, index) => {
      const rule = draftRules[index];
      const isSelected = rule ? selectedRuleIdsRef.current.has(rule.id) : button.dataset.on !== "0";

      if (rule) {
        button.dataset.ruleDraftId = rule.id;
        button.setAttribute("aria-label", `${isSelected ? "Disable" : "Enable"} ${rule.label}`);
      } else {
        button.setAttribute("aria-label", `${isSelected ? "Disable" : "Enable"} conversation rule`);
      }

      button.dataset.on = isSelected ? "1" : "0";
      button.setAttribute("aria-pressed", String(isSelected));
      button.style.position = "relative";
      button.style.overflow = "hidden";
      button.style.background = isSelected ? "#d4a94a" : "#d8d2c2";
      button.style.borderColor = isSelected ? "#a27820" : "#c8c1ad";
      button.style.transition = "background 180ms ease, border-color 180ms ease, opacity 180ms ease";
      button.style.opacity = "1";

      const knob = button.querySelector<HTMLElement>("i");

      if (knob) {
        knob.style.display = "block";
        knob.style.transition = "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), background 180ms ease";
        knob.style.transform = isSelected ? "translateX(16px)" : "translateX(0)";
        knob.style.background = isSelected ? "#18120a" : "#fbf9f3";
      }
    });
  }

  async function createSelectedDraftRules() {
    if (!projectContext) {
      throw new Error("Project is not ready yet.");
    }

    const selectedRules = draftRules.filter((rule) => selectedRuleIdsRef.current.has(rule.id));

    if (selectedRules.length === 0) {
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

  async function sendAiRuleMessage(document: Document) {
    if (!projectContext) {
      toast.error("Project is not ready yet.");
      return;
    }

    if (isAiSendingRef.current) {
      return;
    }

    const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
    const value = textarea?.value.trim();

    if (!value) {
      textarea?.focus();
      return;
    }

    isAiSendingRef.current = true;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectId: projectContext.projectId,
          messages: [
            {
              id: crypto.randomUUID(),
              role: "user",
              parts: [{ type: "text", text: value }],
            },
          ],
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: unknown };
        throw new Error(readError(payload, "AI rule authoring is unavailable."));
      }

      if (response.body) {
        const reader = response.body.getReader();
        while (!(await reader.read()).done) {
          // Drain the stream so server-side tool calls complete before we refresh.
        }
      }

      if (textarea) {
        textarea.value = "";
      }

      setConversationRulesVisible(true);
      syncRuleFrame(document);
      syncToggleButtons(document);
      toast.success("Canary reviewed that rule request.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI rule authoring is unavailable.");
    } finally {
      isAiSendingRef.current = false;
    }
  }

  async function finalizeRules({ runAudit }: { runAudit: boolean }) {
    if (!projectContext || isFinalizingRef.current) {
      return;
    }

    isFinalizingRef.current = true;
    setIsFinalizing(true);

    try {
      await createSelectedDraftRules();

      if (runAudit) {
        const response = await fetch(`/api/projects/${projectContext.projectId}/audit`, { method: "POST" });
        const payload = (await response.json()) as { error?: unknown };

        if (!response.ok) {
          toast.error(`Rules were created, but the audit did not run: ${readError(payload, "Audit failed.")}`);
          router.push(`/projects/${projectContext.projectId}/audits`);
          router.refresh();
          return;
        }

        toast.success("Audit complete.");
      } else {
        toast.success("Rules created.");
      }

      router.push(`/projects/${projectContext.projectId}/audits`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create rules.");
    } finally {
      isFinalizingRef.current = false;
      setIsFinalizing(false);
    }
  }

  function wireRuleDefinitionFrame(document: Document) {
    syncRuleFrame(document);
    syncToggleButtons(document);

    const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
    const addRuleButton = findButton(document, "+ Add rule manually");
    const suggestMoreButton = findButton(document, "Suggest more");
    const sendButton = findButton(document, "Send");
    const reviewButton = findButton(document, "Review & edit all rules");
    const runButton = findButton(document, "Run audit");
    const toggleButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".rp-toggle"));

    toggleButtons.forEach((button, index) => {
      const rule = draftRules[index];

      button.addEventListener("click", (event) => {
        event.preventDefault();

        if (rule) {
          const nextSelectedRuleIds = new Set(selectedRuleIdsRef.current);

          if (nextSelectedRuleIds.has(rule.id)) {
            nextSelectedRuleIds.delete(rule.id);
          } else {
            nextSelectedRuleIds.add(rule.id);
          }

          setSelectedRules(nextSelectedRuleIds);
        } else {
          button.dataset.on = button.dataset.on === "0" ? "1" : "0";
          button.closest(".rp-item")?.classList.toggle("rp-item-on", button.dataset.on !== "0");
        }

        syncRuleFrame(document);
        syncToggleButtons(document);
      });
    });

    addRuleButton?.addEventListener("click", (event) => {
      event.preventDefault();
      textarea?.focus();
    });

    suggestMoreButton?.addEventListener("click", (event) => {
      event.preventDefault();

      if (textarea) {
        textarea.value = "Suggest two more high-signal audit rules for this dataset.";
        textarea.focus();
      }
    });

    sendButton?.addEventListener("click", (event) => {
      event.preventDefault();
      void sendAiRuleMessage(document);
    });

    textarea?.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void sendAiRuleMessage(document);
      }
    });

    reviewButton?.addEventListener("click", (event) => {
      event.preventDefault();
      void finalizeRules({ runAudit: false });
    });

    runButton?.addEventListener("click", (event) => {
      event.preventDefault();
      void finalizeRules({ runAudit: true });
    });
  }

  function wireDesignFrame() {
    const document = iframeRef.current?.contentDocument;

    if (!document) {
      return;
    }

    if (screen === "defineRules") {
      wireRuleDefinitionFrame(document);
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
      <span className="sr-only" aria-live="polite">
        {selectedRuleIds.size} recommended audit rules selected.{" "}
        {hasConversationRules ? "Conversation rules are visible." : "Only recommended rules are visible."}
      </span>
    </main>
  );
}
