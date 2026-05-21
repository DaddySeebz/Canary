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

const ruleTitlePlaceholders = [
  "Positive amount",
  "User exists",
  "Non-null timestamp",
  "Duplicate window",
  "Currency allowlist",
];

const ruleExpressionPlaceholders = [
  "amount > 0",
  "user_id ∈ users.id",
  "created_at IS NOT NULL",
  "same user_id ≤",
  "currency ∈ [USD, EUR, GBP]",
];

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
  rule_type: RuleType,
  rule_config: Record<string, unknown>,
  severity: RuleSeverity = "critical",
): DraftRule {
  return {
    id,
    label,
    expression,
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
        "uniqueness",
        { columns: [column], file_id: file.id },
        "warning",
      ),
  );

  addColumnRule(
    findColumn(file.columns, [/currency/, /currency_code/, /iso_currency/], usedColumns),
    (column) =>
      makeDraftRule(
        "currency-allowlist",
        "Currency allowlist",
        `${column} ∈ [USD, EUR, GBP]`,
        "value_match",
        { column, allowed_values: ["USD", "EUR", "GBP"], case_sensitive: false, file_id: file.id },
        "warning",
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
        "required_field",
        { column, file_id: file.id, allow_empty_string: false },
      ),
    );
  }

  return drafts.slice(0, 5);
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

export function InitialUploadOnboarding() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const selectedRuleIdsRef = useRef<Set<string>>(new Set());
  const createdRuleKeysRef = useRef<Set<string>>(new Set());
  const isFinalizingRef = useRef(false);
  const isAiSendingRef = useRef(false);
  const [screen, setScreen] = useState<OnboardingScreen>("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [draftRules, setDraftRules] = useState<DraftRule[]>([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set());

  function setSelectedRules(nextSelectedRuleIds: Set<string>) {
    selectedRuleIdsRef.current = nextSelectedRuleIds;
    setSelectedRuleIds(new Set(nextSelectedRuleIds));
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
      const nextSelectedRuleIds = new Set(nextDraftRules.slice(0, 4).map((rule) => rule.id));

      createdRuleKeysRef.current = new Set();
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

    const selectedCount = draftRules.filter((rule) => selectedRuleIdsRef.current.has(rule.id)).length;
    const totalCount = Math.max(draftRules.length, 1);

    replaceText(document, "billing_events_q1.csv", projectContext.file.original_name);
    replaceText(document, "billing_events_q1", projectContext.file.original_name.replace(/\.csv$/i, ""));
    replaceText(document, "24 columns", `${projectContext.file.columns.length} columns`);
    replaceText(document, "1.2M rows", `${formatRows(projectContext.file.row_count)} rows`);
    replaceText(document, "3 recommended rules", `${Math.min(draftRules.length, 3)} recommended rules`);
    replaceText(document, "4 / 5 on", `${selectedCount} / ${totalCount} on`);

    draftRules.forEach((rule, index) => {
      replaceText(document, ruleTitlePlaceholders[index], rule.label);
      replaceText(document, ruleExpressionPlaceholders[index], rule.expression);
    });

    const runButton = findButton(document, "Run audit");
    if (runButton) {
      runButton.textContent = `Run audit with ${selectedCount} active ${selectedCount === 1 ? "rule" : "rules"} →`;
    }
  }

  function syncToggleButtons(document: Document) {
    const emptyButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).filter(
      (button) => !button.textContent?.trim(),
    );
    const toggleButtons = emptyButtons.slice(-draftRules.length);

    toggleButtons.forEach((button, index) => {
      const rule = draftRules[index];

      if (!rule) {
        return;
      }

      const isSelected = selectedRuleIdsRef.current.has(rule.id);
      button.dataset.ruleDraftId = rule.id;
      button.setAttribute("aria-label", `${isSelected ? "Disable" : "Enable"} ${rule.label}`);
      button.setAttribute("aria-pressed", String(isSelected));
      button.style.opacity = isSelected ? "1" : "0.45";
      button.style.filter = isSelected ? "none" : "grayscale(1)";
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
    const emptyButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).filter(
      (button) => !button.textContent?.trim(),
    );
    const toggleButtons = emptyButtons.slice(-draftRules.length);

    toggleButtons.forEach((button, index) => {
      const rule = draftRules[index];

      if (!rule) {
        return;
      }

      button.addEventListener("click", (event) => {
        event.preventDefault();
        const nextSelectedRuleIds = new Set(selectedRuleIdsRef.current);

        if (nextSelectedRuleIds.has(rule.id)) {
          nextSelectedRuleIds.delete(rule.id);
        } else {
          nextSelectedRuleIds.add(rule.id);
        }

        setSelectedRules(nextSelectedRuleIds);
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
        {selectedRuleIds.size} recommended audit rules selected.
      </span>
    </main>
  );
}
