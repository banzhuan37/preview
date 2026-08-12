import type { AnalysisRun, Project } from "./types";

export const ACTIVE_RUN_STATUSES: AnalysisRun["status"][] = ["queued", "running", "cancelling"];

export function isActiveRun(run: AnalysisRun | null | undefined): run is AnalysisRun {
  return !!run && ACTIVE_RUN_STATUSES.includes(run.status);
}

export function preferredRun(project: Project | null | undefined): AnalysisRun | null {
  if (!project) return null;
  return project.runs.find(isActiveRun)
    || project.runs.find((run) => run.status === "completed")
    || project.runs[0]
    || null;
}
