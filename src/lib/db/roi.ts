import { v4 as uuidv4 } from "uuid";

import { getDatabase } from "@/lib/db";
import type { ROISettingsRecord } from "@/lib/db/types";

export function getROISettings(projectId: string) {
  return (
    (getDatabase()
      .prepare(
        `SELECT id, project_id, cost_per_error, time_per_fix_minutes, hourly_rate, volume_per_period, updated_at
         FROM roi_settings
         WHERE project_id = ?`,
      )
      .get(projectId) as ROISettingsRecord | undefined) ?? null
  );
}

export function upsertROISettings(
  projectId: string,
  input: Pick<
    ROISettingsRecord,
    "cost_per_error" | "time_per_fix_minutes" | "hourly_rate" | "volume_per_period"
  >,
) {
  const payload: ROISettingsRecord = {
    id: getROISettings(projectId)?.id || uuidv4(),
    project_id: projectId,
    cost_per_error: input.cost_per_error,
    time_per_fix_minutes: input.time_per_fix_minutes,
    hourly_rate: input.hourly_rate,
    volume_per_period: input.volume_per_period,
    updated_at: new Date().toISOString(),
  };

  getDatabase()
    .prepare(
      `INSERT INTO roi_settings (id, project_id, cost_per_error, time_per_fix_minutes, hourly_rate, volume_per_period, updated_at)
       VALUES (@id, @project_id, @cost_per_error, @time_per_fix_minutes, @hourly_rate, @volume_per_period, @updated_at)
       ON CONFLICT(project_id) DO UPDATE SET
         cost_per_error = excluded.cost_per_error,
         time_per_fix_minutes = excluded.time_per_fix_minutes,
         hourly_rate = excluded.hourly_rate,
         volume_per_period = excluded.volume_per_period,
         updated_at = excluded.updated_at`,
    )
    .run(payload);

  return payload;
}
