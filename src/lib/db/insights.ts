import { v4 as uuidv4 } from "uuid";

import { getDatabase, queryRows } from "@/lib/db";
import type { InsightRecord } from "@/lib/db/types";

export async function listProjectInsights(projectId: string) {
  return await queryRows<InsightRecord>(
    `SELECT id, project_id, run_id, insight_type, title, description, evidence, recommendation, severity, status, created_at
     FROM insights
     WHERE project_id = $1
     ORDER BY created_at DESC`,
    [projectId],
  );
}

export async function listInsightsForRun(projectId: string, runId: string) {
  return await queryRows<InsightRecord>(
    `SELECT id, project_id, run_id, insight_type, title, description, evidence, recommendation, severity, status, created_at
     FROM insights
     WHERE project_id = $1 AND run_id = $2
     ORDER BY created_at DESC`,
    [projectId, runId],
  );
}

export async function replaceInsightsForRun(
  projectId: string,
  runId: string | null,
  insights: Array<Omit<InsightRecord, "id" | "project_id" | "run_id" | "created_at">>,
) {
  const db = await getDatabase();

  if (!runId && insights.length === 0) {
    return;
  }

  await db.transaction((tx) => {
    const queries = [];

    if (runId) {
      queries.push(
        tx.query(`DELETE FROM insights WHERE project_id = $1 AND run_id = $2`, [projectId, runId]),
      );
    }

    for (const insight of insights) {
      const createdAt = new Date().toISOString();
      queries.push(
        tx.query(
          `INSERT INTO insights (id, project_id, run_id, insight_type, title, description, evidence, recommendation, severity, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            uuidv4(),
            projectId,
            runId,
            insight.insight_type,
            insight.title,
            insight.description,
            insight.evidence,
            insight.recommendation,
            insight.severity,
            insight.status,
            createdAt,
          ],
        ),
      );
    }

    return queries;
  });
}
