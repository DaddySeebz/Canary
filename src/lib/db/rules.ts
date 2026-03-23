import { v4 as uuidv4 } from "uuid";

import { getDatabase, parseJsonColumn, toJson } from "@/lib/db";
import type { AuditRuleRecord } from "@/lib/db/types";
import type { RuleSeverity, RuleType } from "@/lib/rules/types";

type RawRuleRow = Omit<AuditRuleRecord, "rule_config" | "active"> & {
  rule_config: string;
  active: number;
};

function mapRuleRow(row: RawRuleRow): AuditRuleRecord {
  return {
    ...row,
    rule_config: parseJsonColumn<Record<string, unknown>>(row.rule_config, {}),
    active: Boolean(row.active),
  };
}

export function listProjectRules(projectId: string) {
  const rows = getDatabase()
    .prepare(
      `SELECT id, project_id, description_plain, rule_type, rule_config, severity, created_at, active
       FROM audit_rules
       WHERE project_id = ?
       ORDER BY datetime(created_at) DESC`,
    )
    .all(projectId) as RawRuleRow[];

  return rows.map(mapRuleRow);
}

export function listActiveProjectRules(projectId: string) {
  return listProjectRules(projectId).filter((rule) => rule.active);
}

export function getRuleById(ruleId: string) {
  const row = getDatabase()
    .prepare(
      `SELECT id, project_id, description_plain, rule_type, rule_config, severity, created_at, active
       FROM audit_rules
       WHERE id = ?`,
    )
    .get(ruleId) as RawRuleRow | undefined;

  return row ? mapRuleRow(row) : null;
}

export function createRule(input: {
  projectId: string;
  descriptionPlain: string;
  ruleType: RuleType;
  ruleConfig: Record<string, unknown>;
  severity: RuleSeverity;
}) {
  const rule: AuditRuleRecord = {
    id: uuidv4(),
    project_id: input.projectId,
    description_plain: input.descriptionPlain.trim(),
    rule_type: input.ruleType,
    rule_config: input.ruleConfig,
    severity: input.severity,
    created_at: new Date().toISOString(),
    active: true,
  };

  getDatabase()
    .prepare(
      `INSERT INTO audit_rules (id, project_id, description_plain, rule_type, rule_config, severity, created_at, active)
       VALUES (@id, @project_id, @description_plain, @rule_type, @rule_config, @severity, @created_at, @active)`,
    )
    .run({
      ...rule,
      rule_config: toJson(rule.rule_config),
      active: 1,
    });

  return rule;
}

export function updateRule(
  ruleId: string,
  input: Partial<{
    descriptionPlain: string;
    ruleType: RuleType;
    ruleConfig: Record<string, unknown>;
    severity: RuleSeverity;
    active: boolean;
  }>,
) {
  const existing = getRuleById(ruleId);
  if (!existing) {
    return null;
  }

  const updated: AuditRuleRecord = {
    ...existing,
    description_plain: input.descriptionPlain?.trim() || existing.description_plain,
    rule_type: input.ruleType || existing.rule_type,
    rule_config: input.ruleConfig || existing.rule_config,
    severity: input.severity || existing.severity,
    active: input.active ?? existing.active,
  };

  getDatabase()
    .prepare(
      `UPDATE audit_rules
       SET description_plain = @description_plain,
           rule_type = @rule_type,
           rule_config = @rule_config,
           severity = @severity,
           active = @active
       WHERE id = @id`,
    )
    .run({
      ...updated,
      rule_config: toJson(updated.rule_config),
      active: updated.active ? 1 : 0,
    });

  return updated;
}

export function deleteRule(ruleId: string) {
  return getDatabase().prepare(`DELETE FROM audit_rules WHERE id = ?`).run(ruleId).changes > 0;
}
