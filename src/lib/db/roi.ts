import { v4 as uuidv4 } from "uuid";

import { getDatabase, queryRow } from "@/lib/db";
import type { ROISettingsRecord } from "@/lib/db/types";

export async function getROISettings(projectId: string) {
  return await queryRow<ROISettingsRecord>(
    `SELECT id, project_id, cost_per_error, time_per_fix_minutes, hourly_rate, volume_per_period, updated_at
     FROM roi_settings
     WHERE project_id = $1`,
    [projectId],
  );
}

export async function upsertROISettings(
  projectId: string,
  input: Pick<
    ROISettingsRecord,
    "cost_per_error" | "time_per_fix_minutes" | "hourly_rate" | "volume_per_period"
  >,
) {
  const existing = await getROISettings(projectId);
  const payload: ROISettingsRecord = {
    id: existing?.id || uuidv4(),
    project_id: projectId,
    cost_per_error: input.cost_per_error,
    time_per_fix_minutes: input.time_per_fix_minutes,
    hourly_rate: input.hourly_rate,
    volume_per_period: input.volume_per_period,
    updated_at: new Date().toISOString(),
  };

  const db = await getDatabase();
  await db.query(
    `INSERT INTO roi_settings (id, project_id, cost_per_error, time_per_fix_minutes, hourly_rate, volume_per_period, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT(project_id) DO UPDATE SET
       cost_per_error = excluded.cost_per_error,
       time_per_fix_minutes = excluded.time_per_fix_minutes,
       hourly_rate = excluded.hourly_rate,
       volume_per_period = excluded.volume_per_period,
       updated_at = excluded.updated_at`,
    [
      payload.id,
      payload.project_id,
      payload.cost_per_error,
      payload.time_per_fix_minutes,
      payload.hourly_rate,
      payload.volume_per_period,
      payload.updated_at,
    ],
  );

  return payload;
}
