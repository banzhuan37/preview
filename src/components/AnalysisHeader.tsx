import { formatDateTime } from "../api";
import type { Project } from "../types";

export function AnalysisHeader({ eyebrow, title, description, projects, project, runId, onProject, onRun }: {
  eyebrow: string;
  title: string;
  description: string;
  projects: Project[];
  project: Project | null;
  runId: string;
  onProject: (project: Project) => void;
  onRun: (runId: string) => void;
}) {
  const completedRuns = project?.runs.filter((run) => run.status === "completed") || [];
  return <div className="page-header analysis-page-header">
    <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
    <div className="header-actions">
      <label className="project-select"><span>当前实验</span><select value={project?.id || ""} onChange={(event) => { const next = projects.find((item) => item.id === event.target.value); if (next) onProject(next); }}>{projects.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      {completedRuns.length > 0 && <label className="project-select run-select"><span>分析运行</span><select value={runId} onChange={(event) => onRun(event.target.value)}>{completedRuns.map((run) => <option value={run.id} key={run.id}>{formatDateTime(run.completed_at)} · {run.id.slice(0, 8)}</option>)}</select></label>}
      <span className="ai-badge large"><i/>AI PREDICTION</span>
    </div>
  </div>;
}

export function AnalysisPending({ message = "请先在轨迹工作台完成一次 AI 预测分析。" }: { message?: string }) {
  return <div className="analysis-state"><span className="analysis-state-mark">AI</span><h2>暂无可分析的预测轨迹</h2><p>{message}</p></div>;
}

export function AnalysisLoading({ label = "正在计算预测指标" }: { label?: string }) {
  return <div className="analysis-state compact"><span className="spinner dark"/><h2>{label}</h2><p>所有计算均在本机离线完成。</p></div>;
}

export function PredictionNotice({ children }: { children?: string }) {
  return <div className="prediction-notice"><span>AI</span><p>{children || "以下结果由模型预测轨迹派生，不代表人工确认的真实行为。"}</p></div>;
}
