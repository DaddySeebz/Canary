import { v4 as uuidv4 } from "uuid";

import { getDatabase, queryRow, queryRows } from "@/lib/db";
import type { AuditRunRecord, FindingRecord, ResolutionRecord } from "@/lib/db/types";
import type { RuleSeverity } from "@/lib/rules/types";

export async function createAuditRun(projectId: string) {
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

  const db = await getDatabase();
  await db.query(
    `INSERT INTO audit_runs (id, project_id, ran_at, total_violations, total_rows_checked, status, duration_ms, health_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      run.id,
      run.project_id,
      run.ran_at,
      run.total_violations,
      run.total_rows_checked,
      run.status,
      run.duration_ms,
      run.health_score,
    ],
  );

  return run;
}

export async function completeAuditRun(input: {
  runId: string;
  totalViolations: number;
  totalRowsChecked: number;
  durationMs: number;
  healthScore: number;
}) {
  const db = await getDatabase();
  await db.query(
    `UPDATE audit_runs
     SET total_violations = $1, total_rows_checked = $2, status = 'completed', duration_ms = $3, health_score = $4
     WHERE id = $5`,
    [
      input.totalViolations,
      input.totalRowsChecked,
      input.durationMs,
      input.healthScore,
      input.runId,
    ],
  );
}

export async function failAuditRun(runId: string) {
  const db = await getDatabase();
  await db.query(`UPDATE audit_runs SET status = 'failed' WHERE id = $1`, [runId]);
}

export async function insertFindings(
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

  const rows = findings.map((finding) => ({
    id: uuidv4(),
    run_id: runId,
    ...finding,
  }));

  const db = await getDatabase();
  await db.transaction((tx) =>
    rows.map((item) =>
      tx.query(
        `INSERT INTO findings (id, run_id, rule_id, file_id, row_number, column_name, value, expected, message, severity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          item.id,
          item.run_id,
          item.rule_id,
          item.file_id,
          item.row_number,
          item.column_name,
          item.value,
          item.expected,
          item.message,
          item.severity,
        ],
      ),
    ),
  );

  return rows;
}

export async function insertResolutions(
  runId: string,
  resolutions: Array<Omit<ResolutionRecord, "id" | "run_id">>,
) {
  if (resolutions.length === 0) {
    return [];
  }

  const rows = resolutions.map((resolution) => ({
    id: uuidv4(),
    run_id: runId,
    ...resolution,
  }));

  const db = await getDatabase();
  await db.transaction((tx) =>
    rows.map((item) =>
      tx.query(
        `INSERT INTO resolutions (id, run_id, rule_id, summary, suggestion, affected_count, issue_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          item.id,
          item.run_id,
          item.rule_id,
          item.summary,
          item.suggestion,
          item.affected_count,
          item.issue_type,
        ],
      ),
    ),
  );

  return rows;
}

export async function listProjectRuns(projectId: string) {
  return await queryRows<AuditRunRecord>(
    `SELECT id, project_id, ran_at, total_violations, total_rows_checked, status, duration_ms, health_score
     FROM audit_runs
     WHERE project_id = $1
     ORDER BY ran_at DESC`,
    [projectId],
  );
}

export async function listCompletedRuns(projectId: string, limit = 6) {
  return await queryRows<AuditRunRecord>(
    `SELECT id, project_id, ran_at, total_violations, total_rows_checked, status, duration_ms, health_score
     FROM audit_runs
     WHERE project_id = $1 AND status = 'completed'
     ORDER BY ran_at DESC
     LIMIT $2`,
    [projectId, limit],
  );
}

export async function getLatestRun(projectId: string) {
  return await queryRow<AuditRunRecord>(
    `SELECT id, project_id, ran_at, total_violations, total_rows_checked, status, duration_ms, health_score
     FROM audit_runs
     WHERE project_id = $1
     ORDER BY ran_at DESC
     LIMIT 1`,
    [projectId],
  );
}

export async function getRunById(runId: string) {
  return await queryRow<AuditRunRecord>(
    `SELECT id, project_id, ran_at, total_violations, total_rows_checked, status, duration_ms, health_score
     FROM audit_runs
     WHERE id = $1`,
    [runId],
  );
}

export async function getRunRuleCounts(projectId: string) {
  return await queryRows<{
    run_id: string;
    ran_at: string;
    rule_id: string | null;
    violation_count: number;
  }>(
    `SELECT
       ar.id AS run_id,
       ar.ran_at,
       f.rule_id,
       COUNT(*)::int AS violation_count
     FROM audit_runs ar
     LEFT JOIN findings f ON f.run_id = ar.id
     WHERE ar.project_id = $1 AND ar.status = 'completed'
     GROUP BY ar.id, ar.ran_at, f.rule_id
     ORDER BY ar.ran_at ASC`,
    [projectId],
  );
}

export async function getFindingsBundle(projectId: string, runId?: string) {
  const targetRun = runId ? await getRunById(runId) : await getLatestRun(projectId);
  if (!targetRun) {
    return null;
  }

  const [findings, resolutions, summary] = await Promise.all([
    queryRows<FindingRecord>(
      `SELECT id, run_id, rule_id, file_id, row_number, column_name, value, expected, message, severity
       FROM findings
       WHERE run_id = $1
       ORDER BY row_number ASC`,
      [targetRun.id],
    ),
    queryRows<ResolutionRecord>(
      `SELECT id, run_id, rule_id, summary, suggestion, affected_count, issue_type
       FROM resolutions
       WHERE run_id = $1
       ORDER BY affected_count DESC`,
      [targetRun.id],
    ),
    queryRows<{
      rule_id: string;
      description_plain: string;
      rule_type: string;
      severity: RuleSeverity;
      active: boolean;
      finding_count: number;
      file_count: number;
    }>(
      `SELECT
         ar.id AS rule_id,
         ar.description_plain,
         ar.rule_type,
         ar.severity,
         ar.active,
         COUNT(f.id)::int AS finding_count,
         COUNT(DISTINCT f.file_id)::int AS file_count
       FROM audit_rules ar
       LEFT JOIN findings f ON f.rule_id = ar.id AND f.run_id = $1
       WHERE ar.project_id = $2
       GROUP BY ar.id, ar.description_plain, ar.rule_type, ar.severity, ar.active
       ORDER BY
         CASE
           WHEN ar.severity = 'critical' THEN 0
           WHEN ar.severity = 'warning' THEN 1
           ELSE 2
         END,
         ar.description_plain ASC`,
      [targetRun.id, projectId],
    ),
  ]);

  return {
    run: targetRun,
    findings,
    resolutions,
    summary,
  };
}
