import type { ProjectSummary } from "@/lib/db/types";

export type ProjectsLandingProject = ProjectSummary & {
  needsAttention: boolean;
};

export type ProjectsLandingModel = {
  projects: ProjectsLandingProject[];
  metrics: {
    workspaceHealth: number | null;
    needsAttentionCount: number;
    criticalProjectCount: number;
    warningFindingCount: number;
    totalFiles: number;
    totalRules: number;
    totalViolations: number;
  };
};

function projectNeedsAttention(project: ProjectSummary) {
  const health = project.latest_run_health_score;
  const violations = project.latest_run_violations ?? 0;

  return Boolean((health !== null && health < 90) || violations > 0);
}

function compareByAttentionThenRecency(a: ProjectsLandingProject, b: ProjectsLandingProject) {
  if (a.needsAttention !== b.needsAttention) {
    return a.needsAttention ? -1 : 1;
  }

  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
}

export function getProjectsLandingModel(projects: ProjectSummary[]): ProjectsLandingModel {
  const projectsWithAttention = projects.map((project) => ({
    ...project,
    needsAttention: projectNeedsAttention(project),
  }));
  const healthScores = projects
    .map((project) => project.latest_run_health_score)
    .filter((score): score is number => score !== null);

  return {
    projects: projectsWithAttention.toSorted(compareByAttentionThenRecency),
    metrics: {
      workspaceHealth:
        healthScores.length > 0
          ? Math.round(healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length)
          : null,
      needsAttentionCount: projectsWithAttention.filter((project) => project.needsAttention).length,
      criticalProjectCount: projects.filter((project) => project.latest_run_critical_count > 0).length,
      warningFindingCount: projects.reduce((sum, project) => sum + project.latest_run_warning_count, 0),
      totalFiles: projects.reduce((sum, project) => sum + project.file_count, 0),
      totalRules: projects.reduce((sum, project) => sum + project.rule_count, 0),
      totalViolations: projects.reduce((sum, project) => sum + (project.latest_run_violations ?? 0), 0),
    },
  };
}
