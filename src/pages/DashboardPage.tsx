import { formatBytes, formatDateTime } from "../api";
import { Icon } from "../icons";
import { preferredRun } from "../run-utils";
import type { DashboardData, PageKey, Project } from "../types";
import type { CSSProperties } from "react";

function metric(label: string, value: string, note: string, icon: "folder" | "video" | "activity" | "database", tone: string) {
  return <article className="metric-card" style={{ "--tone": tone } as CSSProperties}>
    <div><span>{label}</span><i><Icon name={icon}/></i></div><strong>{value}</strong><small>{note}</small>
  </article>;
}

function projectStatus(project: Project) {
  const run = preferredRun(project);
  if (!run) return ["待分析", "neutral"];
  if (run.status === "completed") return ["分析完成", "success"];
  if (["running", "queued", "cancelling"].includes(run.status)) return ["分析中", "running"];
  return ["需要检查", "danger"];
}

export function DashboardPage({ data, onNavigate, onOpenProject }: {
  data: DashboardData | null;
  onNavigate: (page: PageKey) => void;
  onOpenProject: (project: Project, page?: PageKey) => void;
}) {
  const usable = data?.mean_usable_rate == null ? "—" : `${(data.mean_usable_rate * 100).toFixed(1)}%`;
  return <div className="page dashboard-page">
    <div className="page-header">
      <div><span className="eyebrow">RESEARCH OVERVIEW</span><h1>科研总览</h1><p>管理果蝇视频、AI 预测任务和轨迹质量状态。</p></div>
      <div className="header-actions"><span className="date-pill">2026年8月11日</span><button className="primary" onClick={() => onNavigate("projects")}><Icon name="plus"/>新建实验</button></div>
    </div>
    <section className="hero-card">
      <div className="hero-icon"><Icon name="target" /></div>
      <div><span>LOCAL AI WORKSPACE</span><h2>本地果蝇跟踪分析已经就绪</h2><p>128011s-best.pt · MHT v3 · 完全离线 · 单任务队列</p></div>
      <div className="hero-flow"><span>导入视频</span><i>→</i><span>AI 检测</span><i>→</i><span>身份跟踪</span><i>→</i><span>轨迹展示</span></div>
      <button onClick={() => onNavigate("projects")}>打开实验项目 <Icon name="chevron" /></button>
    </section>
    <div className="metric-grid">
      {metric("实验项目", String(data?.project_count ?? 0), `${data?.video_count ?? 0} 个引用视频`, "folder", "#0b9189")}
      {metric("已完成分析", String(data?.completed_count ?? 0), `${data?.running_count ?? 0} 个任务正在排队或运行`, "video", "#2e72d2")}
      {metric("平均活动可用率", usable, "模型轨迹质量指标，不代表准确率", "activity", "#8067c8")}
      {metric("本地分析数据", formatBytes(data?.storage_bytes ?? 0), "不包含源视频 · 完全离线", "database", "#e29225")}
    </div>
    <div className="dashboard-grid">
      <article className="card recent-card">
        <header className="card-header"><div><h2>近期实验</h2><p>点击项目继续分析或查看预测轨迹</p></div><button className="text-button" onClick={() => onNavigate("projects")}>查看全部 <Icon name="chevron"/></button></header>
        <div className="project-rows">
          {(data?.recent_projects || []).map((project, index) => {
            const [label, tone] = projectStatus(project);
            return <button key={project.id} onClick={() => onOpenProject(project, "projects")}>
              <span className={`project-avatar tone-${index % 4}`}>{project.name.slice(0, 2).toUpperCase()}</span>
              <span><strong>{project.name}</strong><small>{project.code} · {project.expected_count} 只 · {project.vessel}</small></span>
              <span className={`status ${tone}`}>{label}</span>
              <time>{formatDateTime(project.updated_at)}</time><Icon name="chevron"/>
            </button>;
          })}
          {!data?.recent_projects?.length && <div className="empty-inline">还没有实验项目</div>}
        </div>
      </article>
      <article className="card quality-card">
        <header className="card-header"><div><h2>AI 预测状态</h2><p>当前工作区的模型输出概况</p></div><span className="ai-badge"><i/>AI PREDICTION</span></header>
        <div className="quality-gauge"><div style={{ "--value": `${Math.round((data?.mean_usable_rate || 0) * 100)}%` } as CSSProperties}><strong>{usable}</strong><span>活动可用率</span></div></div>
        <div className="quality-list"><div><span>身份不确定轨迹行</span><strong>{data?.uncertain_rows ?? 0}</strong></div><div><span>模型预测补位轨迹行</span><strong>{data?.predicted_rows ?? 0}</strong></div><div><span>失败任务</span><strong className={data?.failed_count ? "danger-text" : ""}>{data?.failed_count ?? 0}</strong></div></div>
        <p className="prediction-note"><Icon name="alert"/>以上为模型内部预测状态，不代表人工验证的真实准确率。</p>
      </article>
    </div>
    <section className="quick-section analysis-quick"><header><h2>全部科研功能</h2><p>从项目管理到行为预测与组间检验</p></header><div>
      <button onClick={() => onNavigate("projects")}><i><Icon name="plus"/></i><span><strong>新建实验</strong><small>登记项目并引用本地视频</small></span></button>
      <button onClick={() => onNavigate("projects")}><i><Icon name="video"/></i><span><strong>启动 AI 分析</strong><small>YOLO 检测与 MHT v3 跟踪</small></span></button>
      <button onClick={() => onNavigate("tracking")}><i><Icon name="target"/></i><span><strong>查看预测轨迹</strong><small>短轨迹、长轨迹和个体筛选</small></span></button>
      <button onClick={() => onNavigate("movement")}><i><Icon name="activity"/></i><span><strong>运动能力</strong><small>距离、速度、节律与兴奋度</small></span></button>
      <button onClick={() => onNavigate("spatial")}><i><Icon name="map"/></i><span><strong>空间偏好</strong><small>密度热点与二维运动路径</small></span></button>
      <button onClick={() => onNavigate("social")}><i><Icon name="users"/></i><span><strong>社交行为</strong><small>距离、接触、追逐与聚集代理</small></span></button>
      <button onClick={() => onNavigate("statistics")}><i><Icon name="chart"/></i><span><strong>组间统计</strong><small>对照实验、效应量与显著性</small></span></button>
      <button onClick={() => onNavigate("data")}><i><Icon name="database"/></i><span><strong>数据管理</strong><small>分别导出原视频、轨迹视频与分析数据</small></span></button>
    </div></section>
  </div>;
}
