import assert from "node:assert/strict";
import test from "node:test";

import type { ProjectSummary } from "@/lib/db/types";

import { getProjectsLandingModel } from "./projects-index-utils.ts";

function makeProject(overrides: Partial<ProjectSummary> & Pick<ProjectSummary, "id" | "name">): ProjectSummary {
  const { id, name, ...rest } = overrides;

  return {
    id,
    user_id: "user_123",
    name,
    description: null,
    created_at: "2026-05-01T10:00:00.000Z",
    updated_at: "2026-05-01T10:00:00.000Z",
    file_count: 0,
    rule_count: 0,
    latest_run_id: null,
    latest_run_at: null,
    latest_run_health_score: null,
    latest_run_violations: null,
    latest_run_critical_count: 0,
    latest_run_warning_count: 0,
    ...rest,
  };
}

test("orders projects needing attention before healthy projects, then by recency", () => {
  const model = getProjectsLandingModel([
    makeProject({
      id: "healthy-newer",
      name: "Healthy newer",
      updated_at: "2026-05-05T10:00:00.000Z",
      latest_run_health_score: 99,
      latest_run_violations: 0,
    }),
    makeProject({
      id: "attention-older",
      name: "Attention older",
      updated_at: "2026-05-03T10:00:00.000Z",
      latest_run_health_score: 97,
      latest_run_violations: 2,
    }),
    makeProject({
      id: "attention-newer",
      name: "Attention newer",
      updated_at: "2026-05-04T10:00:00.000Z",
      latest_run_health_score: 84,
      latest_run_violations: 0,
    }),
  ]);

  assert.deepEqual(
    model.projects.map((project) => project.id),
    ["attention-newer", "attention-older", "healthy-newer"],
  );
});

test("summarizes returning-user project health and latest finding counts", () => {
  const model = getProjectsLandingModel([
    makeProject({
      id: "healthy",
      name: "Healthy",
      file_count: 2,
      rule_count: 5,
      latest_run_health_score: 96,
      latest_run_violations: 0,
      latest_run_critical_count: 0,
      latest_run_warning_count: 1,
    }),
    makeProject({
      id: "critical",
      name: "Critical",
      file_count: 3,
      rule_count: 7,
      latest_run_health_score: 72,
      latest_run_violations: 9,
      latest_run_critical_count: 4,
      latest_run_warning_count: 5,
    }),
  ]);

  assert.equal(model.metrics.workspaceHealth, 84);
  assert.equal(model.metrics.needsAttentionCount, 1);
  assert.equal(model.metrics.criticalProjectCount, 1);
  assert.equal(model.metrics.warningFindingCount, 6);
  assert.equal(model.metrics.totalFiles, 5);
  assert.equal(model.metrics.totalRules, 12);
  assert.equal(model.metrics.totalViolations, 9);
});
