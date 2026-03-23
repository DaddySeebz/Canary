import fs from "node:fs";
import path from "node:path";

import type Database from "better-sqlite3";

import { ensureProjectUploadDir } from "@/lib/csv/storage";
import { isVercelDeployment } from "@/lib/runtime";

export const VERCEL_DEMO_PROJECT_ID = "demo-quarter-end-receivables";

const timestamps = {
  created: "2026-03-23T08:15:00.000Z",
  invoicesUploaded: "2026-03-23T08:18:00.000Z",
  paymentsUploaded: "2026-03-23T08:19:00.000Z",
  rule1: "2026-03-23T08:22:00.000Z",
  rule2: "2026-03-23T08:23:00.000Z",
  rule3: "2026-03-23T08:24:00.000Z",
  rule4: "2026-03-23T08:25:00.000Z",
  rule5: "2026-03-23T08:26:00.000Z",
  rule6: "2026-03-23T08:27:00.000Z",
  roi: "2026-03-23T08:30:00.000Z",
  run1: "2026-03-23T08:35:00.000Z",
  run2: "2026-03-23T08:44:00.000Z",
  run3: "2026-03-23T08:53:00.000Z",
  insights: "2026-03-23T08:54:30.000Z",
  updated: "2026-03-23T08:54:30.000Z",
} as const;

const demoProject = {
  id: VERCEL_DEMO_PROJECT_ID,
  name: "Quarter-End Receivables Review",
  description: "Seeded Vercel preview for a finance and reconciliation workflow review.",
  created_at: timestamps.created,
  updated_at: timestamps.updated,
};

const invoicesCsv = [
  "invoice_id,customer_id,amount,invoice_date,due_date,status",
  "INV-1001,CUST-01,1200.50,2026-03-01,2026-03-15,open",
  "INV-1002,CUST-02,,2026-03-02,2026-03-20,open",
  "INV-1003,CUST-03,-250.00,2026-03-05,2026-03-25,hold",
  "INV-1003,CUST-03,450.00,2026-03-05,2026-03-04,open",
  "INV-1005,CUST-04,875.00,2026-03-07,2026-03-22,paid",
  "INV-1006,CUST-05,610.00,2026-03-08,2026-03-18,open",
].join("\n");

const paymentsCsv = [
  "invoice_id,paid_amount,payment_date,status",
  "INV-1001,1200.50,2026-03-10,matched",
  "INV-1002,0.00,2026-03-11,exception",
  "INV-1003,440.00,2026-03-12,matched",
  "INV-1005,875.00,2026-03-13,matched",
].join("\n");

const files = [
  {
    id: "demo-file-invoices",
    project_id: demoProject.id,
    filename: "seeded-invoices.csv",
    original_name: "invoices.csv",
    uploaded_at: timestamps.invoicesUploaded,
    row_count: 6,
    columns: ["invoice_id", "customer_id", "amount", "invoice_date", "due_date", "status"],
    sample_data: [
      {
        invoice_id: "INV-1001",
        customer_id: "CUST-01",
        amount: "1200.50",
        invoice_date: "2026-03-01",
        due_date: "2026-03-15",
        status: "open",
      },
      {
        invoice_id: "INV-1002",
        customer_id: "CUST-02",
        amount: "",
        invoice_date: "2026-03-02",
        due_date: "2026-03-20",
        status: "open",
      },
      {
        invoice_id: "INV-1003",
        customer_id: "CUST-03",
        amount: "-250.00",
        invoice_date: "2026-03-05",
        due_date: "2026-03-25",
        status: "hold",
      },
    ],
    file_size: Buffer.byteLength(invoicesCsv, "utf8"),
    contents: invoicesCsv,
  },
  {
    id: "demo-file-payments",
    project_id: demoProject.id,
    filename: "seeded-payments.csv",
    original_name: "payments.csv",
    uploaded_at: timestamps.paymentsUploaded,
    row_count: 4,
    columns: ["invoice_id", "paid_amount", "payment_date", "status"],
    sample_data: [
      {
        invoice_id: "INV-1001",
        paid_amount: "1200.50",
        payment_date: "2026-03-10",
        status: "matched",
      },
      {
        invoice_id: "INV-1002",
        paid_amount: "0.00",
        payment_date: "2026-03-11",
        status: "exception",
      },
      {
        invoice_id: "INV-1003",
        paid_amount: "440.00",
        payment_date: "2026-03-12",
        status: "matched",
      },
    ],
    file_size: Buffer.byteLength(paymentsCsv, "utf8"),
    contents: paymentsCsv,
  },
] as const;

const rules = [
  {
    id: "demo-rule-required-amount",
    project_id: demoProject.id,
    description_plain: "Invoice amount must be present on every row",
    rule_type: "required_field",
    rule_config: { column: "amount", file_id: "demo-file-invoices", allow_empty_string: false },
    severity: "critical",
    created_at: timestamps.rule1,
    active: 1,
  },
  {
    id: "demo-rule-unique-invoice-id",
    project_id: demoProject.id,
    description_plain: "Invoice IDs must stay unique",
    rule_type: "uniqueness",
    rule_config: { columns: ["invoice_id"], file_id: "demo-file-invoices" },
    severity: "critical",
    created_at: timestamps.rule2,
    active: 1,
  },
  {
    id: "demo-rule-nonnegative-amount",
    project_id: demoProject.id,
    description_plain: "Invoice amount should never be negative",
    rule_type: "numeric_range",
    rule_config: { column: "amount", min: 0, file_id: "demo-file-invoices" },
    severity: "warning",
    created_at: timestamps.rule3,
    active: 1,
  },
  {
    id: "demo-rule-due-after-invoice",
    project_id: demoProject.id,
    description_plain: "Due date must come after invoice date",
    rule_type: "date_comparison",
    rule_config: {
      column_a: "due_date",
      column_b: "invoice_date",
      operator: "after",
      file_id: "demo-file-invoices",
    },
    severity: "warning",
    created_at: timestamps.rule4,
    active: 1,
  },
  {
    id: "demo-rule-reconcile-payments",
    project_id: demoProject.id,
    description_plain: "Paid amounts should reconcile back to invoice amounts",
    rule_type: "cross_file_reconciliation",
    rule_config: {
      file_id_a: "demo-file-invoices",
      file_id_b: "demo-file-payments",
      key_a: "invoice_id",
      key_b: "invoice_id",
      compare_columns: [{ column_a: "amount", column_b: "paid_amount", tolerance: 0.01 }],
    },
    severity: "warning",
    created_at: timestamps.rule5,
    active: 1,
  },
  {
    id: "demo-rule-approved-status",
    project_id: demoProject.id,
    description_plain: "Invoice status should stay inside the approved workflow states",
    rule_type: "value_match",
    rule_config: {
      column: "status",
      allowed_values: ["open", "hold", "paid"],
      case_sensitive: false,
      file_id: "demo-file-invoices",
    },
    severity: "passing",
    created_at: timestamps.rule6,
    active: 1,
  },
] as const;

const runTemplates = [
  { id: "demo-run-1", ran_at: timestamps.run1, duration_ms: 42, health_score: 85 },
  { id: "demo-run-2", ran_at: timestamps.run2, duration_ms: 39, health_score: 85 },
  { id: "demo-run-3", ran_at: timestamps.run3, duration_ms: 37, health_score: 85 },
] as const;

const findingTemplates = [
  {
    rule_id: "demo-rule-required-amount",
    file_id: "demo-file-invoices",
    row_number: 2,
    column_name: "amount",
    value: "",
    expected: "non-empty value",
    message: 'Expected "amount" to be populated.',
    severity: "critical",
  },
  {
    rule_id: "demo-rule-unique-invoice-id",
    file_id: "demo-file-invoices",
    row_number: 4,
    column_name: "invoice_id",
    value: "INV-1003",
    expected: "unique combination",
    message: "Duplicate value combination first appeared on row 3.",
    severity: "critical",
  },
  {
    rule_id: "demo-rule-nonnegative-amount",
    file_id: "demo-file-invoices",
    row_number: 2,
    column_name: "amount",
    value: "",
    expected: "numeric value",
    message: 'Expected "amount" to be numeric.',
    severity: "warning",
  },
  {
    rule_id: "demo-rule-nonnegative-amount",
    file_id: "demo-file-invoices",
    row_number: 3,
    column_name: "amount",
    value: "-250.00",
    expected: ">= 0",
    message: "Value fell below the configured minimum.",
    severity: "warning",
  },
  {
    rule_id: "demo-rule-due-after-invoice",
    file_id: "demo-file-invoices",
    row_number: 4,
    column_name: "due_date",
    value: "2026-03-04",
    expected: "due_date after invoice_date",
    message: "Expected due_date to be after invoice_date.",
    severity: "warning",
  },
  {
    rule_id: "demo-rule-reconcile-payments",
    file_id: "demo-file-invoices",
    row_number: 2,
    column_name: "amount",
    value: "",
    expected: "paid_amount within tolerance 0.01",
    message: "Cross-file numeric comparison exceeded tolerance.",
    severity: "warning",
  },
  {
    rule_id: "demo-rule-reconcile-payments",
    file_id: "demo-file-invoices",
    row_number: 3,
    column_name: "amount",
    value: "-250.00",
    expected: "paid_amount within tolerance 0.01",
    message: "Cross-file numeric comparison exceeded tolerance.",
    severity: "warning",
  },
  {
    rule_id: "demo-rule-reconcile-payments",
    file_id: "demo-file-invoices",
    row_number: 4,
    column_name: "amount",
    value: "450.00",
    expected: "paid_amount within tolerance 0.01",
    message: "Cross-file numeric comparison exceeded tolerance.",
    severity: "warning",
  },
  {
    rule_id: "demo-rule-reconcile-payments",
    file_id: "demo-file-invoices",
    row_number: 6,
    column_name: "invoice_id",
    value: "INV-1006",
    expected: "matching invoice_id in comparison file",
    message: "No matching record was found in the comparison file.",
    severity: "warning",
  },
] as const;

const resolutionTemplates = [
  {
    rule_id: "demo-rule-required-amount",
    summary: '1 rows need attention for "Invoice amount must be present on every row".',
    suggestion: "Fill missing values before the file moves downstream.",
    affected_count: 1,
    issue_type: "required_field",
  },
  {
    rule_id: "demo-rule-unique-invoice-id",
    summary: '1 rows need attention for "Invoice IDs must stay unique".',
    suggestion: "Deduplicate the source rows or fix the key strategy.",
    affected_count: 1,
    issue_type: "uniqueness",
  },
  {
    rule_id: "demo-rule-nonnegative-amount",
    summary: '2 rows need attention for "Invoice amount should never be negative".',
    suggestion: "Review thresholds and upstream numeric transforms.",
    affected_count: 2,
    issue_type: "numeric_range",
  },
  {
    rule_id: "demo-rule-due-after-invoice",
    summary: '1 rows need attention for "Due date must come after invoice date".',
    suggestion: "Check date sequencing and source-system timestamp logic.",
    affected_count: 1,
    issue_type: "date_comparison",
  },
  {
    rule_id: "demo-rule-reconcile-payments",
    summary: '4 rows need attention for "Paid amounts should reconcile back to invoice amounts".',
    suggestion: "Reconcile the mismatched records across the two source files.",
    affected_count: 4,
    issue_type: "cross_file_reconciliation",
  },
  {
    rule_id: "demo-rule-approved-status",
    summary: "Rule passed cleanly.",
    suggestion: "Normalize values to the approved set.",
    affected_count: 0,
    issue_type: "value_match",
  },
] as const;

const insights = [
  {
    id: "demo-insight-required-amount",
    project_id: demoProject.id,
    run_id: "demo-run-3",
    insight_type: "recurring_issue",
    title: "Invoice amount must be present on every row keeps resurfacing",
    description: "Canary spotted a recurring issue pattern that deserves a closer look.",
    evidence: "This rule failed in the last 3 completed audits.",
    recommendation: "Check the source process that feeds this field and tighten the export checklist.",
    severity: "critical",
    status: "new",
    created_at: timestamps.insights,
  },
  {
    id: "demo-insight-unique-invoice-id",
    project_id: demoProject.id,
    run_id: "demo-run-3",
    insight_type: "recurring_issue",
    title: "Invoice IDs must stay unique keeps resurfacing",
    description: "Canary spotted a recurring issue pattern that deserves a closer look.",
    evidence: "This rule failed in the last 3 completed audits.",
    recommendation: "Check the source process that feeds this field and tighten the export checklist.",
    severity: "critical",
    status: "new",
    created_at: timestamps.insights,
  },
  {
    id: "demo-insight-nonnegative-amount",
    project_id: demoProject.id,
    run_id: "demo-run-3",
    insight_type: "recurring_issue",
    title: "Invoice amount should never be negative keeps resurfacing",
    description: "Canary spotted a recurring issue pattern that deserves a closer look.",
    evidence: "This rule failed in the last 3 completed audits.",
    recommendation: "Check the source process that feeds this field and tighten the export checklist.",
    severity: "warning",
    status: "new",
    created_at: timestamps.insights,
  },
  {
    id: "demo-insight-due-after-invoice",
    project_id: demoProject.id,
    run_id: "demo-run-3",
    insight_type: "recurring_issue",
    title: "Due date must come after invoice date keeps resurfacing",
    description: "Canary spotted a recurring issue pattern that deserves a closer look.",
    evidence: "This rule failed in the last 3 completed audits.",
    recommendation: "Check the source process that feeds this field and tighten the export checklist.",
    severity: "warning",
    status: "new",
    created_at: timestamps.insights,
  },
  {
    id: "demo-insight-reconcile-payments",
    project_id: demoProject.id,
    run_id: "demo-run-3",
    insight_type: "recurring_issue",
    title: "Paid amounts should reconcile back to invoice amounts keeps resurfacing",
    description: "Canary spotted a recurring issue pattern that deserves a closer look.",
    evidence: "This rule failed in the last 3 completed audits.",
    recommendation: "Check the source process that feeds this field and tighten the export checklist.",
    severity: "warning",
    status: "new",
    created_at: timestamps.insights,
  },
] as const;

const activity = [
  {
    id: "demo-activity-project-created",
    project_id: demoProject.id,
    action: "project.created",
    details: JSON.stringify({ name: demoProject.name }),
    created_at: timestamps.created,
  },
  {
    id: "demo-activity-file-invoices",
    project_id: demoProject.id,
    action: "file.uploaded",
    details: JSON.stringify({ fileId: "demo-file-invoices", originalName: "invoices.csv", rowCount: 6 }),
    created_at: timestamps.invoicesUploaded,
  },
  {
    id: "demo-activity-file-payments",
    project_id: demoProject.id,
    action: "file.uploaded",
    details: JSON.stringify({ fileId: "demo-file-payments", originalName: "payments.csv", rowCount: 4 }),
    created_at: timestamps.paymentsUploaded,
  },
  {
    id: "demo-activity-rule-required",
    project_id: demoProject.id,
    action: "rule.created",
    details: JSON.stringify({ ruleId: "demo-rule-required-amount", type: "required_field" }),
    created_at: timestamps.rule1,
  },
  {
    id: "demo-activity-rule-unique",
    project_id: demoProject.id,
    action: "rule.created",
    details: JSON.stringify({ ruleId: "demo-rule-unique-invoice-id", type: "uniqueness" }),
    created_at: timestamps.rule2,
  },
  {
    id: "demo-activity-rule-range",
    project_id: demoProject.id,
    action: "rule.created",
    details: JSON.stringify({ ruleId: "demo-rule-nonnegative-amount", type: "numeric_range" }),
    created_at: timestamps.rule3,
  },
  {
    id: "demo-activity-rule-date",
    project_id: demoProject.id,
    action: "rule.created",
    details: JSON.stringify({ ruleId: "demo-rule-due-after-invoice", type: "date_comparison" }),
    created_at: timestamps.rule4,
  },
  {
    id: "demo-activity-rule-reconcile",
    project_id: demoProject.id,
    action: "rule.created",
    details: JSON.stringify({ ruleId: "demo-rule-reconcile-payments", type: "cross_file_reconciliation" }),
    created_at: timestamps.rule5,
  },
  {
    id: "demo-activity-rule-status",
    project_id: demoProject.id,
    action: "rule.created",
    details: JSON.stringify({ ruleId: "demo-rule-approved-status", type: "value_match" }),
    created_at: timestamps.rule6,
  },
  {
    id: "demo-activity-roi",
    project_id: demoProject.id,
    action: "roi.updated",
    details: JSON.stringify({
      cost_per_error: 180,
      time_per_fix_minutes: 12,
      hourly_rate: 65,
      volume_per_period: 2500,
    }),
    created_at: timestamps.roi,
  },
  {
    id: "demo-activity-run-1",
    project_id: demoProject.id,
    action: "audit.run",
    details: JSON.stringify({
      runId: "demo-run-1",
      totalViolations: 9,
      totalRowsChecked: 10,
      healthScore: 85,
    }),
    created_at: timestamps.run1,
  },
  {
    id: "demo-activity-run-2",
    project_id: demoProject.id,
    action: "audit.run",
    details: JSON.stringify({
      runId: "demo-run-2",
      totalViolations: 9,
      totalRowsChecked: 10,
      healthScore: 85,
    }),
    created_at: timestamps.run2,
  },
  {
    id: "demo-activity-run-3",
    project_id: demoProject.id,
    action: "audit.run",
    details: JSON.stringify({
      runId: "demo-run-3",
      totalViolations: 9,
      totalRowsChecked: 10,
      healthScore: 85,
    }),
    created_at: timestamps.run3,
  },
  {
    id: "demo-activity-insights",
    project_id: demoProject.id,
    action: "insights.generated",
    details: JSON.stringify({ runId: "demo-run-3", count: insights.length }),
    created_at: timestamps.insights,
  },
] as const;

function writeDemoUploads() {
  const projectDir = ensureProjectUploadDir(demoProject.id);

  for (const file of files) {
    const fullPath = path.join(projectDir, file.filename);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, file.contents);
    }
  }
}

export function ensureVercelDemoSeed(db: Database.Database) {
  if (!isVercelDeployment()) {
    return;
  }

  const existing = db
    .prepare("SELECT id FROM projects WHERE id = ?")
    .get(demoProject.id) as { id: string } | undefined;

  if (existing) {
    writeDemoUploads();
    return;
  }

  writeDemoUploads();

  const insertProject = db.prepare(
    `INSERT INTO projects (id, name, description, created_at, updated_at)
     VALUES (@id, @name, @description, @created_at, @updated_at)`,
  );
  const insertFile = db.prepare(
    `INSERT INTO files (id, project_id, filename, original_name, uploaded_at, row_count, columns, sample_data, file_size)
     VALUES (@id, @project_id, @filename, @original_name, @uploaded_at, @row_count, @columns, @sample_data, @file_size)`,
  );
  const insertSnapshot = db.prepare(
    `INSERT INTO file_snapshots (id, file_id, columns, row_count, uploaded_at)
     VALUES (@id, @file_id, @columns, @row_count, @uploaded_at)`,
  );
  const insertRule = db.prepare(
    `INSERT INTO audit_rules (id, project_id, description_plain, rule_type, rule_config, severity, created_at, active)
     VALUES (@id, @project_id, @description_plain, @rule_type, @rule_config, @severity, @created_at, @active)`,
  );
  const insertRun = db.prepare(
    `INSERT INTO audit_runs (id, project_id, ran_at, total_violations, total_rows_checked, status, duration_ms, health_score)
     VALUES (@id, @project_id, @ran_at, @total_violations, @total_rows_checked, @status, @duration_ms, @health_score)`,
  );
  const insertFinding = db.prepare(
    `INSERT INTO findings (id, run_id, rule_id, file_id, row_number, column_name, value, expected, message, severity)
     VALUES (@id, @run_id, @rule_id, @file_id, @row_number, @column_name, @value, @expected, @message, @severity)`,
  );
  const insertResolution = db.prepare(
    `INSERT INTO resolutions (id, run_id, rule_id, summary, suggestion, affected_count, issue_type)
     VALUES (@id, @run_id, @rule_id, @summary, @suggestion, @affected_count, @issue_type)`,
  );
  const insertRoi = db.prepare(
    `INSERT INTO roi_settings (id, project_id, cost_per_error, time_per_fix_minutes, hourly_rate, volume_per_period, updated_at)
     VALUES (@id, @project_id, @cost_per_error, @time_per_fix_minutes, @hourly_rate, @volume_per_period, @updated_at)`,
  );
  const insertInsight = db.prepare(
    `INSERT INTO insights (id, project_id, run_id, insight_type, title, description, evidence, recommendation, severity, status, created_at)
     VALUES (@id, @project_id, @run_id, @insight_type, @title, @description, @evidence, @recommendation, @severity, @status, @created_at)`,
  );
  const insertActivity = db.prepare(
    `INSERT INTO activity_log (id, project_id, action, details, created_at)
     VALUES (@id, @project_id, @action, @details, @created_at)`,
  );

  db.transaction(() => {
    insertProject.run(demoProject);

    for (const file of files) {
      insertFile.run({
        ...file,
        columns: JSON.stringify(file.columns),
        sample_data: JSON.stringify(file.sample_data),
      });
      insertSnapshot.run({
        id: `${file.id}-snapshot-1`,
        file_id: file.id,
        columns: JSON.stringify(file.columns),
        row_count: file.row_count,
        uploaded_at: file.uploaded_at,
      });
    }

    for (const rule of rules) {
      insertRule.run({
        ...rule,
        rule_config: JSON.stringify(rule.rule_config),
      });
    }

    for (const run of runTemplates) {
      insertRun.run({
        ...run,
        project_id: demoProject.id,
        total_violations: 9,
        total_rows_checked: 10,
        status: "completed",
      });

      for (const [index, finding] of findingTemplates.entries()) {
        insertFinding.run({
          id: `${run.id}-finding-${index + 1}`,
          run_id: run.id,
          ...finding,
        });
      }

      for (const [index, resolution] of resolutionTemplates.entries()) {
        insertResolution.run({
          id: `${run.id}-resolution-${index + 1}`,
          run_id: run.id,
          ...resolution,
        });
      }
    }

    insertRoi.run({
      id: "demo-roi-settings",
      project_id: demoProject.id,
      cost_per_error: 180,
      time_per_fix_minutes: 12,
      hourly_rate: 65,
      volume_per_period: 2500,
      updated_at: timestamps.roi,
    });

    for (const insight of insights) {
      insertInsight.run(insight);
    }

    for (const entry of activity) {
      insertActivity.run(entry);
    }
  })();
}
