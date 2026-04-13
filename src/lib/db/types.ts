import type { RuleSeverity, RuleType } from "@/lib/rules/types";

export interface ProjectRecord {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectSummary extends ProjectRecord {
  file_count: number;
  rule_count: number;
  latest_run_id: string | null;
  latest_run_at: string | null;
  latest_run_health_score: number | null;
  latest_run_violations: number | null;
}

export interface FileRecord {
  id: string;
  project_id: string;
  filename: string;
  original_name: string;
  uploaded_at: string;
  row_count: number;
  columns: string[];
  sample_data: Array<Record<string, string>>;
  file_size: number;
}

export interface AuditRuleRecord {
  id: string;
  project_id: string;
  description_plain: string;
  rule_type: RuleType;
  rule_config: Record<string, unknown>;
  severity: RuleSeverity;
  created_at: string;
  active: boolean;
}

export interface AuditRunRecord {
  id: string;
  project_id: string;
  ran_at: string;
  total_violations: number;
  total_rows_checked: number;
  status: string;
  duration_ms: number | null;
  health_score: number | null;
}

export interface FindingRecord {
  id: string;
  run_id: string;
  rule_id: string;
  file_id: string;
  row_number: number;
  column_name: string | null;
  value: string | null;
  expected: string | null;
  message: string;
  severity: RuleSeverity;
}

export interface ResolutionRecord {
  id: string;
  run_id: string;
  rule_id: string;
  summary: string;
  suggestion: string;
  affected_count: number;
  issue_type: string | null;
}

export interface FileSnapshotRecord {
  id: string;
  file_id: string;
  columns: string[];
  row_count: number;
  uploaded_at: string;
}

export interface ROISettingsRecord {
  id: string;
  project_id: string;
  cost_per_error: number;
  time_per_fix_minutes: number;
  hourly_rate: number;
  volume_per_period: number;
  updated_at: string;
}

export interface InsightRecord {
  id: string;
  project_id: string;
  run_id: string | null;
  insight_type: string;
  title: string;
  description: string;
  evidence: string | null;
  recommendation: string | null;
  severity: string;
  status: string;
  created_at: string;
}

export interface ActivityRecord {
  id: string;
  project_id: string;
  action: string;
  details: string | null;
  created_at: string;
}

export interface ColumnRename {
  from: string;
  to: string;
  similarity: number;
}

export interface SchemaDiffResult {
  added: string[];
  removed: string[];
  renamed: ColumnRename[];
  affectedRules: AuditRuleRecord[];
  previousFile: FileRecord | null;
}
