import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TrackingPage } from "./pages/TrackingPage";
import { MovementPage } from "./pages/MovementPage";
import { SpatialPage } from "./pages/SpatialPage";
import { SocialPage } from "./pages/SocialPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { DataManagementPage } from "./pages/DataManagementPage";
import type { AnalysisRun, DashboardData, PageKey, Project, ProjectInput } from "./types";

export default function App() {
  const [page, setPage] = useState<PageKey>("dashboard");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [backendReady, setBackendReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(async (quiet = false) => {
    try {
      const [health, dashboardData, projectData] = await Promise.all([api.health(), api.dashboard(), api.projects()]);
      setBackendReady(health.status === "ok");
      setDashboard(dashboardData);
      setProjects(projectData);
      setSelectedId((current) => current && projectData.some((project) => project.id === current) ? current : projectData[0]?.id || null);
      setRefreshToken((current) => current + 1);
      if (!quiet) setError(null);
    } catch (reason) {
      setBackendReady(false);
      if (!quiet) setError(reason instanceof Error ? reason.message : "无法连接本地分析服务");
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const active = projects.some((project) => project.runs.some((run) => ["queued", "running", "cancelling"].includes(run.status)));
    if (!active) return;
    const timer = window.setInterval(() => void refresh(true), 1000);
    return () => window.clearInterval(timer);
  }, [projects, refresh]);

  const action = async (work: () => Promise<void>, success: string) => {
    setBusy(true); setError(null);
    try { await work(); setMessage(success); await refresh(true); window.setTimeout(() => setMessage(null), 2600); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "操作失败"); }
    finally { setBusy(false); }
  };

  const openProject = (project: Project, target: PageKey = "projects") => { setSelectedId(project.id); setPage(target); };
  return <Layout page={page} onNavigate={setPage} projectCount={projects.length} backendReady={backendReady}>
    {page === "dashboard" && <DashboardPage data={dashboard} onNavigate={setPage} onOpenProject={openProject}/>} 
    {page === "projects" && <ProjectsPage
      projects={projects} selectedId={selectedId} onSelect={(project) => setSelectedId((current) => current === project.id ? null : project.id)}
      onCreate={(input: ProjectInput) => action(async () => { const project = await api.createProject(input); setSelectedId(project.id); }, "实验项目已创建")}
      onUpdate={(id, input) => action(async () => { await api.updateProject(id, input); }, "实验项目已更新")}
      onDelete={(id) => action(async () => { await api.deleteProject(id); setSelectedId(null); }, "实验项目及派生数据已永久删除")}
      onAddVideo={(id, path) => action(async () => { await api.addVideo(id, path); }, "视频引用已添加")}
      onAnalyze={(project) => action(async () => { await api.analyze(project.id, project.videos[0]?.id); setSelectedId(project.id); setPage("tracking"); }, "AI 分析任务已加入队列")}
      onNavigate={setPage} busy={busy}
    />}
    {page === "tracking" && <TrackingPage
      projects={projects} selectedId={selectedId} refreshToken={refreshToken}
      onSelectProject={(project) => setSelectedId(project.id)}
      onAnalyze={(project) => action(async () => { await api.analyze(project.id, project.videos[0]?.id); }, "AI 分析任务已加入队列")}
      onCancel={(run: AnalysisRun) => action(async () => { await api.cancelRun(run.id); }, "正在取消分析任务")}
    />}
    {page === "data" && <DataManagementPage projects={projects} selectedId={selectedId} onSelectProject={(project) => setSelectedId(project.id)}/>} 
    {page === "movement" && <MovementPage projects={projects} selectedId={selectedId} onSelectProject={(project) => setSelectedId(project.id)}/>} 
    {page === "spatial" && <SpatialPage projects={projects} selectedId={selectedId} onSelectProject={(project) => setSelectedId(project.id)}/>} 
    {page === "social" && <SocialPage projects={projects} selectedId={selectedId} onSelectProject={(project) => setSelectedId(project.id)}/>} 
    {page === "statistics" && <StatisticsPage projects={projects}/>} 
    {message && <div className="toast success-toast">✓ {message}</div>}
    {error && <div className="toast error-toast"><button onClick={() => setError(null)}>×</button><strong>操作未完成</strong><span>{error}</span></div>}
    {!backendReady && <div className="connection-overlay"><div className="spinner dark"/><h2>正在连接本地分析服务</h2><p>BioVision 完全离线运行，请保持应用窗口开启。</p><button onClick={() => void refresh()}>重新连接</button></div>}
  </Layout>;
}
