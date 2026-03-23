import { v4 as uuidv4 } from "uuid";

import { getDatabase } from "@/lib/db";
import type { ActivityRecord } from "@/lib/db/types";

export function logActivity(projectId: string, action: string, details?: string | null) {
  const db = getDatabase();
  const entry: ActivityRecord = {
    id: uuidv4(),
    project_id: projectId,
    action,
    details: details ?? null,
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO activity_log (id, project_id, action, details, created_at)
     VALUES (@id, @project_id, @action, @details, @created_at)`,
  ).run(entry);

  return entry;
}

export function listActivity(projectId: string) {
  const db = getDatabase();
  return db
    .prepare(
      `SELECT id, project_id, action, details, created_at
       FROM activity_log
       WHERE project_id = ?
       ORDER BY datetime(created_at) DESC`,
    )
    .all(projectId) as ActivityRecord[];
}
