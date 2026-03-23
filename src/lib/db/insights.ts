import { v4 as uuidv4 } from "uuid";

import { getDatabase } from "@/lib/db";
import type { InsightRecord } from "@/lib/db/types";

export function listProjectInsights(projectId: string) {
  return getDatabase()
    .prepare(
      `SELECT id, project_id, run_id, insight_type, title, description, evidence, recommendation, severity, status, created_at
       FROM insights
       WHERE project_id = ?
       ORDER BY datetime(created_at) DESC`,
    )
    .all(projectId) as InsightRecord[];
}

export function listInsightsForRun(projectId: string, runId: string) {
  return getDatabase()
    .prepare(
      `SELECT id, project_id, run_id, insight_type, title, description, evidence, recommendation, severity, status, created_at
       FROM insights
       WHERE project_id = ? AND run_id = ?
       ORDER BY datetime(created_at) DESC`,
    )
    .all(projectId, runId) as InsightRecord[];
}

export function replaceInsightsForRun(
  projectId: string,
  runId: string | null,
  insights: Array<Omit<InsightRecord, "id" | "project_id" | "run_id" | "created_at">>,
) {
  const db = getDatabase();

  db.transaction(() => {
    if (runId) {
      db.prepare(`DELETE FROM insights WHERE project_id = ? AND run_id = ?`).run(projectId, runId);
    }

    const insert = db.prepare(
      `INSERT INTO insights (id, project_id, run_id, insight_type, title, description, evidence, recommendation, severity, status, created_at)
       VALUES (@id, @project_id, @run_id, @insight_type, @title, @description, @evidence, @recommendation, @severity, @status, @created_at)`,
    );

    for (const insight of insights) {
      insert.run({
        id: uuidv4(),
        project_id: projectId,
        run_id: runId,
        ...insight,
        created_at: new Date().toISOString(),
      });
    }
  })();
}
