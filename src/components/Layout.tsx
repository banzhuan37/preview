import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { PageKey } from "../types";
import { Icon } from "../icons";

const labels: Record<PageKey, string> = {
  dashboard: "科研总览",
  projects: "实验项目",
  tracking: "轨迹工作台",
  data: "数据管理",
  movement: "运动能力",
  spatial: "空间偏好",
  social: "社交行为",
  statistics: "组间统计",
};

export function Layout({
  page,
  onNavigate,
  children,
  projectCount,
  backendReady,
}: {
  page: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
  projectCount: number;
  backendReady: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [page]);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-symbol" aria-hidden="true"><Icon name="target" /></span>
          <div><strong>BioVision</strong><span>FLY TRACKING LAB</span></div>
        </div>
        <nav>
          <p className="nav-label">工作空间</p>
          <button className={page === "dashboard" ? "active" : ""} onClick={() => onNavigate("dashboard")}>
            <Icon name="home" /><span>科研总览</span>
          </button>
          <button className={page === "projects" ? "active" : ""} onClick={() => onNavigate("projects")}>
            <Icon name="folder" /><span>实验项目</span><i>{projectCount}</i>
          </button>
          <button className={page === "tracking" ? "active" : ""} onClick={() => onNavigate("tracking")}>
            <Icon name="target" /><span>轨迹工作台</span>
          </button>
          <button className={page === "data" ? "active" : ""} onClick={() => onNavigate("data")}>
            <Icon name="database" /><span>数据管理</span>
          </button>
          <p className="nav-label">行为分析</p>
          <button className={page === "movement" ? "active" : ""} onClick={() => onNavigate("movement")}><Icon name="activity" /><span>运动能力</span></button>
          <button className={page === "spatial" ? "active" : ""} onClick={() => onNavigate("spatial")}><Icon name="map" /><span>空间偏好</span></button>
          <button className={page === "social" ? "active" : ""} onClick={() => onNavigate("social")}><Icon name="users" /><span>社交行为</span></button>
          <button className={page === "statistics" ? "active" : ""} onClick={() => onNavigate("statistics")}><Icon name="chart" /><span>组间统计</span></button>
        </nav>
        <div className="sidebar-footer">
          <div className="offline-card">
            <span className={backendReady ? "online-dot" : "online-dot error"} />
            <div><strong>{backendReady ? "浏览器演示已就绪" : "演示数据未加载"}</strong><small>界面预览 · 本地浏览器数据</small></div>
          </div>
          <div className="device-card"><Icon name="cpu" /><div><strong>BioVision Web</strong><small>桌面应用界面预览</small></div></div>
        </div>
      </aside>
      <section className="main-area">
        <header className="commandbar">
          <div className="window-dots"><i/><i/><i/></div>
          <div className="breadcrumb"><span>BioVision</span><b>›</b><strong>{labels[page]}</strong></div>
          <div className="prediction-chip"><span/>AI 预测模式</div>
        </header>
        <div className="page-scroll" ref={scrollRef}>{children}</div>
      </section>
    </main>
  );
}
