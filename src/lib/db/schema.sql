CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  row_count INTEGER NOT NULL DEFAULT 0,
  columns TEXT NOT NULL DEFAULT '[]',
  sample_data TEXT,
  file_size INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audit_rules (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description_plain TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  rule_config TEXT NOT NULL DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'critical',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS audit_runs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  ran_at TEXT NOT NULL DEFAULT (datetime('now')),
  total_violations INTEGER NOT NULL DEFAULT 0,
  total_rows_checked INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  duration_ms INTEGER,
  health_score INTEGER
);

CREATE TABLE IF NOT EXISTS findings (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES audit_runs(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL REFERENCES audit_rules(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  column_name TEXT,
  value TEXT,
  expected TEXT,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'critical'
);

CREATE TABLE IF NOT EXISTS resolutions (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES audit_runs(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL REFERENCES audit_rules(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  affected_count INTEGER NOT NULL DEFAULT 0,
  issue_type TEXT
);

CREATE TABLE IF NOT EXISTS file_snapshots (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  columns TEXT NOT NULL DEFAULT '[]',
  row_count INTEGER NOT NULL DEFAULT 0,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS roi_settings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  cost_per_error REAL NOT NULL DEFAULT 0,
  time_per_fix_minutes REAL NOT NULL DEFAULT 0,
  hourly_rate REAL NOT NULL DEFAULT 0,
  volume_per_period INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS insights (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  run_id TEXT REFERENCES audit_runs(id) ON DELETE SET NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT,
  recommendation TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_rules_project ON audit_rules(project_id);
CREATE INDEX IF NOT EXISTS idx_runs_project ON audit_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_findings_run ON findings(run_id);
CREATE INDEX IF NOT EXISTS idx_findings_rule ON findings(rule_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_run ON resolutions(run_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_file ON file_snapshots(file_id);
CREATE INDEX IF NOT EXISTS idx_insights_project ON insights(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_log(project_id);
