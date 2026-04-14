import { v4 as uuidv4 } from "uuid";

import { getDatabase, parseJsonColumn, queryRow, queryRows, toJson } from "@/lib/db";
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

export async function listProjectRules(projectId: string) {
  const rows = await queryRows<RawRuleRow>(
    `SELECT id, project_id, description_plain, rule_type, rule_config, severity, created_at, active
     FROM audit_rules
     WHERE project_id = $1
     ORDER BY created_at DESC`,
    [projectId],
  );

  return rows.map(mapRuleRow);
}

export async function listActiveProjectRules(projectId: string) {
  return (await listProjectRules(projectId)).filter((rule) => rule.active);
}

export async function getRuleById(ruleId: string) {
  const row = await queryRow<RawRuleRow>(
    `SELECT id, project_id, description_plain, rule_type, rule_config, severity, created_at, active
     FROM audit_rules
     WHERE id = $1`,
    [ruleId],
  );

  return row ? mapRuleRow(row) : null;
}

export async function createRule(input: {
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

  const db = await getDatabase();
  await db.query(
    `INSERT INTO audit_rules (id, project_id, description_plain, rule_type, rule_config, severity, created_at, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      rule.id,
      rule.project_id,
      rule.description_plain,
      rule.rule_type,
      toJson(rule.rule_config),
      rule.severity,
      rule.created_at,
      rule.active,
    ],
  );

  return rule;
}

export async function updateRule(
  ruleId: string,
  input: Partial<{
    descriptionPlain: string;
    ruleType: RuleType;
    ruleConfig: Record<string, unknown>;
    severity: RuleSeverity;
    active: boolean;
  }>,
) {
  const existing = await getRuleById(ruleId);
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

  const db = await getDatabase();
  await db.query(
    `UPDATE audit_rules
     SET description_plain = $1,
         rule_type = $2,
         rule_config = $3,
         severity = $4,
         active = $5
     WHERE id = $6`,
    [
      updated.description_plain,
      updated.rule_type,
      toJson(updated.rule_config),
      updated.severity,
      updated.active,
      updated.id,
    ],
  );

  return updated;
}

export async function deleteRule(ruleId: string) {
  const deleted = await queryRow<{ id: string }>(
    `DELETE FROM audit_rules WHERE id = $1 RETURNING id`,
    [ruleId],
  );

  return Boolean(deleted);
}
