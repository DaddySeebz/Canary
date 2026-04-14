import { put } from "@vercel/blob";

import { getDatabase, queryRow, toJson } from "@/lib/db";
import { getBlobReadWriteToken } from "@/lib/env";

export const PUBLIC_DEMO_PROJECT_ID = "demo-quarter-end-receivables";

const timestamps = {
  created: "2026-03-23T08:15:00.000Z",
  invoicesUploaded: "2026-03-23T08:18:00.000Z",
  paymentsUploaded: "2026-03-23T08:19:00.000Z",
  rule1: "2026-03-23T08:22:00.000Z",
  rule2: "2026-03-23T08:23:00.000Z",
  rule3: "2026-03-23T08:24:00.000Z",
  rule4: "2026-03-23T08:25:00.000Z",
  roi: "2026-03-23T08:30:00.000Z",
  run1: "2026-03-23T08:35:00.000Z",
  run2: "2026-03-23T08:44:00.000Z",
  run3: "2026-03-23T08:53:00.000Z",
  insights: "2026-03-23T08:54:30.000Z",
  updated: "2026-03-23T08:54:30.000Z",
} as const;

const demoProject = {
  id: PUBLIC_DEMO_PROJECT_ID,
  user_id: null,
  name: "Quarter-End Receivables Review",
  description: "Read-only seeded workspace for a finance and reconciliation workflow review.",
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

function buildDemoBlobPath(filename: string) {
  return `demo/${PUBLIC_DEMO_PROJECT_ID}/${filename}`;
}

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
    active: true,
  },
  {
    id: "demo-rule-unique-invoice-id",
    project_id: demoProject.id,
    description_plain: "Invoice IDs must stay unique",
    rule_type: "uniqueness",
    rule_config: { columns: ["invoice_id"], file_id: "demo-file-invoices" },
    severity: "critical",
    created_at: timestamps.rule2,
    active: true,
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
    created_at: timestamps.rule3,
    active: true,
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
    created_at: timestamps.rule4,
    active: true,
  },
] as const;

const runs = [
  { id: "demo-run-1", ran_at: timestamps.run1, duration_ms: 42, health_score: 81 },
  { id: "demo-run-2", ran_at: timestamps.run2, duration_ms: 39, health_score: 81 },
  { id: "demo-run-3", ran_at: timestamps.run3, duration_ms: 37, health_score: 81 },
] as const;

const findings = [
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
    row_number: 6,
    column_name: "invoice_id",
    value: "INV-1006",
    expected: "matching invoice_id in comparison file",
    message: "No matching record was found in the comparison file.",
    severity: "warning",
  },
] as const;

const resolutions = [
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
    rule_id: "demo-rule-due-after-invoice",
    summary: '1 rows need attention for "Due date must come after invoice date".',
    suggestion: "Check date sequencing and source-system timestamp logic.",
    affected_count: 1,
    issue_type: "date_comparison",
  },
  {
    rule_id: "demo-rule-reconcile-payments",
    summary: '2 rows need attention for "Paid amounts should reconcile back to invoice amounts".',
    suggestion: "Reconcile the mismatched records across the two source files.",
    affected_count: 2,
    issue_type: "cross_file_reconciliation",
  },
] as const;

const insights = [
  {
    id: "demo-insight-required-amount",
    project_id: demoProject.id,
    run_id: "demo-run-3",
    insight_type: "recurring_issue",
    title: "Missing invoice amounts keep resurfacing",
    description: "One required field continues to arrive blank across multiple audits.",
    evidence: "This issue failed in the last three completed demo audits.",
    recommendation: "Tighten the export checklist for the finance source system.",
    severity: "critical",
    status: "new",
    created_at: timestamps.insights,
  },
  {
    id: "demo-insight-reconcile-payments",
    project_id: demoProject.id,
    run_id: "demo-run-3",
    insight_type: "worsening_trend",
    title: "Reconciliation mismatches need upstream attention",
    description: "Cross-file payment drift still appears after the close workflow refresh.",
    evidence: "Latest audit still shows unreconciled invoices and a missing payment row.",
    recommendation: "Verify invoice and payment exports are generated from the same source window.",
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
    id: "demo-activity-insights",
    project_id: demoProject.id,
    action: "insights.generated",
    details: JSON.stringify({ runId: "demo-run-3", count: insights.length }),
    created_at: timestamps.insights,
  },
] as const;

async function uploadDemoFiles() {
  for (const file of files) {
    await put(buildDemoBlobPath(file.filename), file.contents, {
      access: "private",
      allowOverwrite: true,
      contentType: "text/csv",
      token: getBlobReadWriteToken(),
    });
  }
}

export async function ensurePublicDemoProjectSeeded() {
  const existing = await queryRow<{ id: string }>(
    `SELECT id FROM projects WHERE id = $1`,
    [PUBLIC_DEMO_PROJECT_ID],
  );

  if (existing) {
    return PUBLIC_DEMO_PROJECT_ID;
  }

  await uploadDemoFiles();

  const db = await getDatabase();
  await db.transaction((tx) => {
    const queries = [
      tx.query(
        `INSERT INTO projects (id, user_id, name, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          demoProject.id,
          demoProject.user_id,
          demoProject.name,
          demoProject.description,
          demoProject.created_at,
          demoProject.updated_at,
        ],
      ),
    ];

    for (const file of files) {
      queries.push(
        tx.query(
          `INSERT INTO files (id, project_id, filename, original_name, uploaded_at, row_count, columns, sample_data, file_size)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            file.id,
            file.project_id,
            buildDemoBlobPath(file.filename),
            file.original_name,
            file.uploaded_at,
            file.row_count,
            toJson(file.columns),
            toJson(file.sample_data),
            file.file_size,
          ],
        ),
      );

      queries.push(
        tx.query(
          `INSERT INTO file_snapshots (id, file_id, columns, row_count, uploaded_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            `${file.id}-snapshot-1`,
            file.id,
            toJson(file.columns),
            file.row_count,
            file.uploaded_at,
          ],
        ),
      );
    }

    for (const rule of rules) {
      queries.push(
        tx.query(
          `INSERT INTO audit_rules (id, project_id, description_plain, rule_type, rule_config, severity, created_at, active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            rule.id,
            rule.project_id,
            rule.description_plain,
            rule.rule_type,
            toJson(rule.rule_config),
            rule.severity,
            rule.created_at,
            rule.active,
          ],
        ),
      );
    }

    for (const run of runs) {
      queries.push(
        tx.query(
          `INSERT INTO audit_runs (id, project_id, ran_at, total_violations, total_rows_checked, status, duration_ms, health_score)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [run.id, demoProject.id, run.ran_at, findings.length, 10, "completed", run.duration_ms, run.health_score],
        ),
      );

      for (const [index, finding] of findings.entries()) {
        queries.push(
          tx.query(
            `INSERT INTO findings (id, run_id, rule_id, file_id, row_number, column_name, value, expected, message, severity)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              `${run.id}-finding-${index + 1}`,
              run.id,
              finding.rule_id,
              finding.file_id,
              finding.row_number,
              finding.column_name,
              finding.value,
              finding.expected,
              finding.message,
              finding.severity,
            ],
          ),
        );
      }

      for (const [index, resolution] of resolutions.entries()) {
        queries.push(
          tx.query(
            `INSERT INTO resolutions (id, run_id, rule_id, summary, suggestion, affected_count, issue_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              `${run.id}-resolution-${index + 1}`,
              run.id,
              resolution.rule_id,
              resolution.summary,
              resolution.suggestion,
              resolution.affected_count,
              resolution.issue_type,
            ],
          ),
        );
      }
    }

    queries.push(
      tx.query(
        `INSERT INTO roi_settings (id, project_id, cost_per_error, time_per_fix_minutes, hourly_rate, volume_per_period, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ["demo-roi-settings", demoProject.id, 180, 12, 65, 2500, timestamps.roi],
      ),
    );

    for (const insight of insights) {
      queries.push(
        tx.query(
          `INSERT INTO insights (id, project_id, run_id, insight_type, title, description, evidence, recommendation, severity, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            insight.id,
            insight.project_id,
            insight.run_id,
            insight.insight_type,
            insight.title,
            insight.description,
            insight.evidence,
            insight.recommendation,
            insight.severity,
            insight.status,
            insight.created_at,
          ],
        ),
      );
    }

    for (const entry of activity) {
      queries.push(
        tx.query(
          `INSERT INTO activity_log (id, project_id, action, details, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [entry.id, entry.project_id, entry.action, entry.details, entry.created_at],
        ),
      );
    }

    return queries;
  });

  return PUBLIC_DEMO_PROJECT_ID;
}
