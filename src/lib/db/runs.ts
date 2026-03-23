import { v4 as uuidv4 } from "uuid";

import { getDatabase } from "@/lib/db";
import type { AuditRunRecord, FindingRecord, ResolutionRecord } from "@/lib/db/types";
import type { RuleSeverity } from "@/lib/rules/types";

export function createAuditRun(projectId: string) {
  const run: AuditRunRecord = {
    id: uuidv4(),
    project_id: projectId,
    ran_at: new Date().toISOString(),
    total_violations: 0,
    total_rows_checked: 0,
    status: "pending",
    duration_ms: null,
    health_score: null,
  };

  getDatabase()
    .prepare(
      `INSERT INTO audit_runs (id, project_id, ran_at, total_violations, total_rows_checked, status, duration_ms, health_score)
       VALUES (@id, @project_id, @ran_at, @total_violations, @total_rows_checked, @status, @duration_ms, @health_score)`,
    )
    .run(run);

  return run;
}

export function completeAuditRun(input: {
  runId: string;
  totalViolations: number;
  totalRowsChecked: number;
  durationMs: number;
  healthScore: number;
}) {
  getDatabase()
    .prepare(
      `UPDATE audit_runs
       SET total_violations = ?, total_rows_checked = ?, status = 'completed', duration_ms = ?, health_score = ?
       WHERE id = ?`,
    )
    .run(
      input.totalViolations,
      input.totalRowsChecked,
      input.durationMs,
      input.healthScore,
      input.runId,
    );
}

export function failAuditRun(runId: string) {
  getDatabase()
    .prepare(`UPDATE audit_runs SET status = 'failed' WHERE id = ?`)
    .run(runId);
}

export function insertFindings(
  runId: string,
  findings: Array<
    Omit<FindingRecord, "id" | "run_id"> & {
      rule_id: string;
      severity: RuleSeverity;
    }
  >,
) {
  if (findings.length === 0) {
    return [];
  }

  const db = getDatabase();
  const insert = db.prepare(
    `INSERT INTO findings (id, run_id, rule_id, file_id, row_number, column_name, value, expected, message, severity)
     VALUES (@id, @run_id, @rule_id, @file_id, @row_number, @column_name, @value, @expected, @message, @severity)`,
  );

  const rows = findings.map((finding) => ({
    id: uuidv4(),
    run_id: runId,
    ...finding,
  }));

  db.transaction((items: typeof rows) => {
    for (const item of items) {
      insert.run(item);
    }
  })(rows);

  return rows;
}

export function insertResolutions(
  runId: string,
  resolutions: Array<Omit<ResolutionRecord, "id" | "run_id">>,
) {
  if (resolutions.length === 0) {
    return [];
  }

  const db = getDatabase();
  const insert = db.prepare(
    `INSERT INTO resolutions (id, run_id, rule_id, summary, suggestion, affected_count, issue_type)
     VALUES (@id, @run_id, @rule_id, @summary, @suggestion, @affected_count, @issue_type)`,
  );

  const rows = resolutions.map((resolution) => ({
    id: uuidv4(),
    run_id: runId,
    ...resolution,
  }));

  db.transaction((items: typeof rows) => {
    for (const item of items) {
      insert.run(item);
    }
  })(rows);

  return rows;
}

export function listProjectRuns(projectId: string) {
  return getDatabase()
    .prepare(
      `SELECT id, project_id, ran_at, total_violations, total_rows_checked, status, duration_ms, health_score
       FROM audit_runs
       WHERE project_id = ?
       ORDER BY datetime(ran_at) DESC`,
    )
    .all(projectId) as AuditRunRecord[];
}

export function listCompletedRuns(projectId: string, limit = 6) {
  return getDatabase()
    .prepare(
      `SELECT id, project_id, ran_at, total_violations, total_rows_checked, status, duration_ms, health_score
       FROM audit_runs
       WHERE project_id = ? AND status = 'completed'
       ORDER BY datetime(ran_at) DESC
       LIMIT ?`,
    )
    .all(projectId, limit) as AuditRunRecord[];
}

export function getLatestRun(projectId: string) {
  return (
    (getDatabase()
      .prepare(
        `SELECT id, project_id, ran_at, total_violations, total_rows_checked, status, duration_ms, health_score
         FROM audit_runs
         WHERE project_id = ?
         ORDER BY datetime(ran_at) DESC
         LIMIT 1`,
      )
      .get(projectId) as AuditRunRecord | undefined) ?? null
  );
}

export function getRunById(runId: string) {
  return (
    (getDatabase()
      .prepare(
        `SELECT id, project_id, ran_at, total_violations, total_rows_checked, status, duration_ms, health_score
         FROM audit_runs
         WHERE id = ?`,
      )
      .get(runId) as AuditRunRecord | undefined) ?? null
  );
}

export function getRunRuleCounts(projectId: string) {
  return getDatabase()
    .prepare(
      `SELECT
         ar.id AS run_id,
         ar.ran_at,
         f.rule_id,
         COUNT(*) AS violation_count
       FROM audit_runs ar
       LEFT JOIN findings f ON f.run_id = ar.id
       WHERE ar.project_id = ? AND ar.status = 'completed'
       GROUP BY ar.id, ar.ran_at, f.rule_id
       ORDER BY datetime(ar.ran_at) ASC`,
    )
    .all(projectId) as Array<{
      run_id: string;
      ran_at: string;
      rule_id: string | null;
      violation_count: number;
    }>;
}

export function getFindingsBundle(projectId: string, runId?: string) {
  const targetRun = runId ? getRunById(runId) : getLatestRun(projectId);
  if (!targetRun) {
    return null;
  }

  const db = getDatabase();
  const findings = db
    .prepare(
      `SELECT id, run_id, rule_id, file_id, row_number, column_name, value, expected, message, severity
       FROM findings
       WHERE run_id = ?
       ORDER BY row_number ASC`,
    )
    .all(targetRun.id) as FindingRecord[];

  const resolutions = db
    .prepare(
      `SELECT id, run_id, rule_id, summary, suggestion, affected_count, issue_type
       FROM resolutions
       WHERE run_id = ?
       ORDER BY affected_count DESC`,
    )
    .all(targetRun.id) as ResolutionRecord[];

  const summary = db
    .prepare(
      `SELECT
         ar.id AS rule_id,
         ar.description_plain,
         ar.rule_type,
         ar.severity,
         ar.active,
         COUNT(f.id) AS finding_count,
         COUNT(DISTINCT f.file_id) AS file_count
       FROM audit_rules ar
       LEFT JOIN findings f ON f.rule_id = ar.id AND f.run_id = ?
       WHERE ar.project_id = ?
       GROUP BY ar.id, ar.description_plain, ar.rule_type, ar.severity, ar.active
       ORDER BY ar.severity = 'critical' DESC, ar.severity = 'warning' DESC, ar.description_plain ASC`,
    )
    .all(targetRun.id, projectId) as Array<{
      rule_id: string;
      description_plain: string;
      rule_type: string;
      severity: RuleSeverity;
      active: number;
      finding_count: number;
      file_count: number;
    }>;

  return {
    run: targetRun,
    findings,
    resolutions,
    summary: summary.map((item) => ({
      ...item,
      active: Boolean(item.active),
    })),
  };
}
