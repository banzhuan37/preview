import { useCallback, useEffect, useMemo, useState } from "react";
import { api, chooseExportPath, formatBytes, formatDateTime } from "../api";
import { Icon } from "../icons";
import type { DataExportInfo, DataExportRecord, ExportKind, Project, StoredExportKind } from "../types";

const kindLabels: Record<StoredExportKind, string> = {
  source_video: "原视频文件包",
  trajectory_video: "轨迹视频文件包",
  analysis: "实验分析数据包",
  raw: "旧版原始数据包",
  complete: "旧版完整实验包",
};

function ProjectSelector({ projects, project, onSelect }: {
  projects: Project[];
  project: Project | null;
  onSelect: (project: Project) => void;
}) {
  return <label className="data-project-select"><span>指定实验</span><select value={project?.id || ""} onChange={(event) => {
    const next = projects.find((item) => item.id === event.target.value);
    if (next) onSelect(next);
  }}>{projects.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.code}</option>)}</select></label>;
}

export function DataManagementPage({ projects, selectedId, onSelectProject }: {
  projects: Project[];
  selectedId: string | null;
  onSelectProject: (project: Project) => void;
}) {
  const project = projects.find((item) => item.id === selectedId) || projects[0] || null;
  const [info, setInfo] = useState<DataExportInfo | null>(null);
  const [history, setHistory] = useState<DataExportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<ExportKind | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    if (!project) { setInfo(null); setHistory([]); return; }
    setLoading(true); setError("");
    try {
      const [nextInfo, nextHistory] = await Promise.all([api.exportInfo(project.id), api.exports(project.id)]);
      setInfo(nextInfo); setHistory(nextHistory);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "无法读取实验数据");
    } finally {
      setLoading(false);
    }
  }, [project?.id]);

  useEffect(() => { void load(); }, [load]);

  const disabled = useMemo<Record<ExportKind, boolean>>(() => ({
    source_video: !info || info.source_video_file_count === 0 || info.missing_videos.length > 0,
    trajectory_video: !info || info.active_analysis || info.trajectory_video_file_count === 0,
    analysis: !info || info.active_analysis || info.analysis_data_file_count === 0 || info.project.run_count === 0,
  }), [info]);

  const runExport = async (kind: ExportKind) => {
    if (!project || !info || disabled[kind]) return;
    setError(""); setSuccess("");
    const destination = await chooseExportPath(info.suggested_names[kind]);
    if (!destination) return;
    setExporting(kind);
    try {
      const record = await api.createExport({ project_id: project.id, kind, destination });
      setSuccess(`${kindLabels[kind]}已保存到 ${record.destination}`);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "实验数据导出失败");
      await load();
    } finally {
      setExporting(null);
    }
  };

  if (!project) return <div className="page data-page"><div className="page-header"><div><span className="eyebrow">DATA MANAGEMENT</span><h1>数据管理</h1><p>按实验导出原始数据与 AI 分析数据。</p></div></div><div className="analysis-state"><span className="analysis-state-mark"><Icon name="database"/></span><h2>还没有实验项目</h2><p>请先在“实验项目”中创建项目并引用视频。</p></div></div>;

  const sourceVideoEstimate = info?.source_video_bytes || 0;
  const trajectoryVideoEstimate = info?.trajectory_video_bytes || 0;
  const analysisEstimate = info?.analysis_data_bytes || 0;
  return <div className="page data-page">
    <div className="page-header data-header"><div><span className="eyebrow">DATA MANAGEMENT</span><h1>数据管理</h1><p>原视频、轨迹视频和实验分析数据分别生成独立 ZIP 文件，内容互不混合。</p></div><div className="header-actions"><span className="offline-pill"><i/>源视频只读</span><ProjectSelector projects={projects} project={project} onSelect={onSelectProject}/></div></div>

    {error && <div className="inline-error"><Icon name="alert"/><span>{error}</span></div>}
    {success && <div className="data-export-success"><Icon name="check"/><span>{success}</span></div>}
    {loading && !info ? <div className="analysis-state compact"><span className="spinner dark"/><h2>正在核对实验文件</h2></div> : info && <>
      <section className="data-summary-grid">
        <article><i><Icon name="video"/></i><div><span>原视频</span><strong>{formatBytes(info.source_video_bytes)}</strong><small>{info.source_video_file_count} 个独立源文件</small></div></article>
        <article><i><Icon name="target"/></i><div><span>轨迹视频</span><strong>{formatBytes(info.trajectory_video_bytes)}</strong><small>{info.trajectory_video_file_count} 个短/长轨迹视频</small></div></article>
        <article><i><Icon name="database"/></i><div><span>分析数据</span><strong>{formatBytes(info.analysis_data_bytes)}</strong><small>{info.analysis_data_file_count} 个非视频数据文件</small></div></article>
        <article><i><Icon name="cpu"/></i><div><span>处理方式</span><strong>离线</strong><small>{info.project.run_count} 次运行 · {info.project.completed_run_count} 次已完成</small></div></article>
      </section>

      {info.missing_videos.length > 0 && <div className="data-export-warning"><Icon name="alert"/><div><strong>原始视频不可访问</strong><span>{info.missing_videos[0]}。请恢复文件后再导出原视频；已有轨迹视频与分析数据仍可独立导出。</span></div></div>}
      {info.active_analysis && <div className="data-export-warning"><Icon name="clock"/><div><strong>分析任务仍在运行</strong><span>原视频可以独立导出；轨迹视频与实验分析数据将在任务结束后开放。</span></div></div>}

      <section className="export-package-grid">
        <PackageCard kind="source_video" title="原视频文件包" badge="SOURCE VIDEO ONLY" icon="video" estimate={sourceVideoEstimate} fileCount={info.source_video_file_count} disabled={disabled.source_video} exporting={exporting === "source_video"} onExport={runExport}>
          <li>仅包含项目引用的原视频文件</li><li>不包含元数据、轨迹或分析结果</li><li>只读复制，不修改原文件</li>
        </PackageCard>
        <PackageCard kind="trajectory_video" title="轨迹视频文件包" badge="TRACK VIDEO ONLY" icon="target" estimate={trajectoryVideoEstimate} fileCount={info.trajectory_video_file_count} disabled={disabled.trajectory_video} exporting={exporting === "trajectory_video"} onExport={runExport}>
          <li>仅包含短轨迹和长轨迹预测视频</li><li>按分析运行分别存放</li><li>不包含轨迹表、日志或指标数据</li>
        </PackageCard>
        <PackageCard kind="analysis" title="实验分析数据包" badge="DATA ONLY" icon="database" estimate={analysisEstimate} fileCount={info.analysis_data_file_count + 4} disabled={disabled.analysis} exporting={exporting === "analysis"} onExport={runExport}>
          <li>项目元数据、轨迹表、配置、日志与检测缓存</li><li>运动、空间、社交派生指标 JSON</li><li>不包含原视频或任何轨迹视频</li>
        </PackageCard>
      </section>

      <div className="data-policy-note"><Icon name="alert"/><p><strong>分离导出说明</strong> 三类内容分别保存为独立 ZIP，不再提供混合或完整实验包。运动、空间及社交结果均为 AI 模型预测值。</p></div>
    </>}

    <section className="card export-history-card"><header className="card-header"><div><h2>当前实验的导出记录</h2><p>记录保存在本机；归档文件由你选择保存位置</p></div><button className="text-button" disabled={loading} onClick={() => void load()}><Icon name="refresh"/>刷新</button></header>
      <div className="export-history-table"><div className="export-history-row header"><span>类型</span><span>状态</span><span>大小 / 文件</span><span>保存位置</span><span>完成时间</span></div>
        {history.map((record) => <div className="export-history-row" key={record.id}><strong>{kindLabels[record.kind]}</strong><span className={`status ${record.status === "completed" ? "success" : record.status === "running" ? "running" : "danger"}`}>{record.status === "completed" ? "已完成" : record.status === "running" ? "导出中" : "失败"}</span><span>{record.status === "completed" ? `${formatBytes(record.size_bytes)} · ${record.file_count} 个文件` : record.error || "正在打包"}</span><span className="export-path" title={record.destination}>{record.destination}</span><time>{formatDateTime(record.completed_at || record.created_at)}</time></div>)}
        {!history.length && <div className="empty-inline">这个实验还没有导出记录</div>}
      </div>
    </section>
  </div>;
}

function PackageCard({ kind, title, badge, icon, estimate, fileCount, disabled, exporting, onExport, children }: {
  kind: ExportKind;
  title: string;
  badge: string;
  icon: "video" | "target" | "database";
  estimate: number;
  fileCount: number;
  disabled: boolean;
  exporting: boolean;
  onExport: (kind: ExportKind) => Promise<void>;
  children: React.ReactNode;
}) {
  return <article className={`export-package-card ${kind}`}><header><span className="package-icon"><Icon name={icon}/></span><div><em>{badge}</em><h2>{title}</h2></div></header><ul>{children}</ul><div className="package-estimate"><span>预计数据量</span><strong>{formatBytes(estimate)}</strong><small>约 {fileCount} 个归档条目</small></div><button disabled={disabled || exporting} onClick={() => void onExport(kind)}>{exporting ? <><span className="spinner"/>正在生成 ZIP…</> : <><Icon name="download"/>选择位置并导出</>}</button></article>;
}
