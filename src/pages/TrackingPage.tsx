import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { api, formatDateTime, formatDuration } from "../api";
import { Icon } from "../icons";
import { isActiveRun, preferredRun } from "../run-utils";
import type { AnalysisRun, Project, TrackPayload, TrackPoint } from "../types";

const COLORS = ["#4fe0d3", "#74a8ff", "#ffc35a", "#b391ff", "#ff7d73", "#65d795", "#f18fc5", "#94c961", "#67d0f4", "#ff9d5b"];

function percent(value: number | undefined): string {
  return value == null ? "—" : `${(value * 100).toFixed(1)}%`;
}

function quality(run: AnalysisRun | null) {
  const summary = run?.summary || {};
  const rows = summary.fixed?.rows || 0;
  const predicted = summary.trajectory_diagnostics?.predicted_rows || 0;
  return {
    usable: percent(summary.fixed?.activity_usable_rate),
    uncertain: percent(summary.trajectory_diagnostics?.uncertain_rate),
    predicted: rows ? `${(predicted / rows * 100).toFixed(1)}%` : "—",
    interactions: summary.mht?.interaction_events ?? 0,
  };
}

function statusLabel(status: AnalysisRun["status"]): string {
  return ({ queued: "排队中", running: "AI 分析中", cancelling: "正在取消", completed: "分析完成", failed: "分析失败", cancelled: "已取消" } as Record<string, string>)[status] || status;
}

export function TrackingPage({ projects, selectedId, onSelectProject, onAnalyze, onCancel, refreshToken }: {
  projects: Project[];
  selectedId: string | null;
  onSelectProject: (project: Project) => void;
  onAnalyze: (project: Project) => Promise<void>;
  onCancel: (run: AnalysisRun) => Promise<void>;
  refreshToken: number;
}) {
  const project = projects.find((item) => item.id === selectedId) || projects[0] || null;
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<TrackPayload>({ run_id: null, points: [], fly_ids: [] });
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [mode, setMode] = useState<"short" | "long">("short");
  const [selectedFly, setSelectedFly] = useState<number | "all">("all");
  const [source, setSource] = useState<"source" | "short" | "long">("source");
  const [layers, setLayers] = useState({ trails: true, boxes: true, labels: true, uncertain: true });
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const runs = project?.runs || [];
  const run = runs.find((item) => item.id === selectedRunId) || preferredRun(project);
  const video = project?.videos[0] || null;
  const runQuality = quality(run);

  useEffect(() => {
    if (!project) return;
    const preferred = preferredRun(project);
    setSelectedRunId((current) => current && project.runs.some((item) => item.id === current) ? current : preferred?.id || null);
  }, [project?.id, refreshToken]);

  useEffect(() => {
    if (!project || !run || run.status !== "completed") {
      setTracks({ run_id: null, points: [], fly_ids: [] });
      return;
    }
    let cancelled = false;
    setLoadingTracks(true);
    api.tracks(project.id, run.id).then((payload) => !cancelled && setTracks(payload)).catch(() => !cancelled && setTracks({ run_id: null, points: [], fly_ids: [] })).finally(() => !cancelled && setLoadingTracks(false));
    return () => { cancelled = true; };
  }, [project?.id, run?.id, run?.status]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    const tick = () => {
      setCurrentTime(videoElement.currentTime || 0);
      setPlaying(!videoElement.paused);
    };
    videoElement.addEventListener("timeupdate", tick);
    videoElement.addEventListener("play", tick);
    videoElement.addEventListener("pause", tick);
    return () => {
      videoElement.removeEventListener("timeupdate", tick);
      videoElement.removeEventListener("play", tick);
      videoElement.removeEventListener("pause", tick);
    };
  }, [source, project?.id, run?.id]);

  useTrajectoryCanvas({ canvasRef, videoRef, tracks, mode, selectedFly, layers, currentTime, sourceWidth: video?.width || 1920, sourceHeight: video?.height || 1080 });

  const mediaUrl = project ? api.mediaUrl(project.id, source, run?.id) : "";
  const events = useMemo(() => {
    if (!tracks.points.length) return [] as { time: number; type: string; fly: string }[];
    const output: { time: number; type: string; fly: string }[] = [];
    let priorState = new Map<number, string>();
    for (const point of tracks.points) {
      const prior = priorState.get(point.fly_id);
      if (point.state !== prior && ["UNCERTAIN", "OCCLUDED", "RECOVERING"].includes(point.state)) {
        output.push({ time: point.timestamp_s, type: point.state, fly: `Fly ${String(point.fly_id).padStart(2, "0")}` });
      }
      priorState.set(point.fly_id, point.state);
    }
    return output.slice(0, 24);
  }, [tracks]);

  if (!project) return <div className="page tracking-empty-page"><Icon name="target"/><h1>还没有实验项目</h1><p>请先建立项目并引用果蝇视频。</p></div>;

  return <div className="page tracking-page">
    <div className="page-header tracking-header">
      <div><span className="eyebrow">TRACKING WORKBENCH</span><h1>轨迹工作台</h1><p>同步查看原视频、短/长轨迹和 MHT v3 预测状态。</p></div>
      <div className="header-actions"><label className="project-select"><span>当前实验</span><select value={project.id} onChange={(event) => { const next = projects.find((item) => item.id === event.target.value); if (next) onSelectProject(next); }}>{projects.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>{runs.length > 0 && <label className="project-select run-select"><span>分析运行</span><select value={run?.id || ""} onChange={(event) => setSelectedRunId(event.target.value)}>{runs.map((item) => <option value={item.id} key={item.id}>{formatDateTime(item.queued_at)} · {statusLabel(item.status)}</option>)}</select></label>}<span className="ai-badge large"><i/>AI PREDICTION</span></div>
    </div>
    {isActiveRun(run) && <section className="analysis-banner"><div className="analysis-pulse"><span/><i/></div><div><strong>{statusLabel(run.status)}</strong><p>{run.message}</p><div className="analysis-track"><span style={{ width: `${run.progress}%` }}/></div></div><b>{Math.round(run.progress)}%</b>{run.status !== "cancelling" && <button onClick={() => onCancel(run)}>取消任务</button>}</section>}
    {run?.status === "failed" && <section className="error-banner"><Icon name="alert"/><div><strong>AI 分析失败</strong><p>{run.error || run.message}</p></div><button onClick={() => onAnalyze(project)}><Icon name="refresh"/>重新分析</button></section>}
    <div className="tracking-shell">
      <section className="video-stage">
        <div className="video-toolbar"><div><span className="live-dot"/><strong>{project.name}</strong><i>{project.expected_count} 只预测身份</i></div><div>{video && <><span>{video.width} × {video.height}</span><span>{video.fps.toFixed(2)} FPS</span></>}<span className="dark-pill">{source === "source" ? "原始视频 + 动态轨迹" : source === "short" ? "短轨迹导出视频" : "长轨迹导出视频"}</span></div></div>
        <div className="video-canvas">
          {video ? <video key={mediaUrl} ref={videoRef} src={mediaUrl} playsInline preload="metadata" onClick={() => { const element = videoRef.current; if (!element) return; element.paused ? void element.play() : element.pause(); }}/>: <div className="no-video"><Icon name="video"/><p>项目没有引用视频</p></div>}
          {source === "source" && <canvas ref={canvasRef}/>} 
          <div className="video-overlay-top"><span><i/>AI TRACKING · MHT v3</span>{selectedFly !== "all" && <b style={{ color: COLORS[(selectedFly - 1) % COLORS.length] }}>Fly {String(selectedFly).padStart(2, "0")}</b>}</div>
          {loadingTracks && <div className="canvas-loading"><span className="spinner"/>读取预测轨迹</div>}
          {!tracks.points.length && run?.status !== "completed" && <div className="canvas-empty"><Icon name="target"/><strong>等待 AI 预测轨迹</strong><span>分析完成后将在视频上同步显示</span></div>}
        </div>
        <div className="video-controls"><button className="round-control" onClick={() => { const element = videoRef.current; if (!element) return; element.paused ? void element.play() : element.pause(); }}><Icon name={playing ? "pause" : "play"}/></button><button onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 1 / (video?.fps || 30)); }}>−1f</button><div className="timeline"><input type="range" min="0" max={videoRef.current?.duration || video?.duration_s || 1} step="0.01" value={currentTime} onChange={(event) => { if (videoRef.current) videoRef.current.currentTime = Number(event.target.value); }}/><div><span>{formatDuration(currentTime)}</span><span>{formatDuration(videoRef.current?.duration || video?.duration_s || 0)}</span></div></div><button onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.min(videoRef.current.duration || Infinity, videoRef.current.currentTime + 1 / (video?.fps || 30)); }}>+1f</button><select defaultValue="1" onChange={(event) => { if (videoRef.current) videoRef.current.playbackRate = Number(event.target.value); }}><option value="0.5">0.5×</option><option value="1">1.0×</option><option value="1.5">1.5×</option><option value="2">2.0×</option></select></div>
      </section>
      <aside className="tracking-panel">
        <section className="panel-card quality-panel"><header><h3>预测质量概况</h3><span className={run?.status === "completed" ? "success-dot" : "neutral-dot"}/></header><div className="quality-stat-grid"><div><span>活动可用率</span><strong>{runQuality.usable}</strong></div><div><span>身份不确定率</span><strong>{runQuality.uncertain}</strong></div><div><span>预测补位率</span><strong>{runQuality.predicted}</strong></div><div><span>交互事件</span><strong>{runQuality.interactions}</strong></div></div><p><Icon name="alert"/>模型内部预测状态，不代表真实准确率。</p></section>
        <section className="panel-card"><header><h3>轨迹模式</h3><span>{mode === "short" ? "1.5 秒尾迹" : "累计轨迹"}</span></header><div className="segmented"><button className={mode === "short" ? "active" : ""} onClick={() => setMode("short")}>短轨迹</button><button className={mode === "long" ? "active" : ""} onClick={() => setMode("long")}>长轨迹</button></div><label className="panel-field"><span>预测个体</span><select value={selectedFly} onChange={(event) => setSelectedFly(event.target.value === "all" ? "all" : Number(event.target.value))}><option value="all">全部果蝇</option>{tracks.fly_ids.map((flyId) => <option key={flyId} value={flyId}>Fly {String(flyId).padStart(2, "0")}</option>)}</select></label><div className="fly-palette">{tracks.fly_ids.map((flyId) => <button key={flyId} className={selectedFly === flyId ? "active" : ""} style={{ "--fly": COLORS[(flyId - 1) % COLORS.length] } as CSSProperties} onClick={() => setSelectedFly(flyId)}>F{flyId}</button>)}</div></section>
        <section className="panel-card"><header><h3>显示图层</h3></header><div className="layer-list">{([ ["trails", "运动轨迹"], ["boxes", "检测框与中心点"], ["labels", "预测身份标签"], ["uncertain", "不确定与补位轨迹"] ] as const).map(([key, label]) => <button key={key} onClick={() => setLayers((current) => ({ ...current, [key]: !current[key] }))}><span className={layers[key] ? "checked" : ""}>{layers[key] && <Icon name="check"/>}</span><strong>{label}</strong><Icon name={layers[key] ? "eye" : "eyeOff"}/></button>)}</div></section>
        <section className="panel-card"><header><h3>视频视图与导出</h3></header><div className="source-tabs"><button className={source === "source" ? "active" : ""} onClick={() => setSource("source")}>动态视图</button><button disabled={!run?.short_video_path} className={source === "short" ? "active" : ""} onClick={() => setSource("short")}>短轨迹 MP4</button><button disabled={!run?.long_video_path} className={source === "long" ? "active" : ""} onClick={() => setSource("long")}>长轨迹 MP4</button></div><div className="export-buttons"><a className={!run?.short_video_path ? "disabled" : ""} href={run?.short_video_path ? api.mediaUrl(project.id, "short", run.id) : undefined} download={`${project.name}_短轨迹.mp4`}><Icon name="download"/>导出短轨迹</a><a className={!run?.long_video_path ? "disabled" : ""} href={run?.long_video_path ? api.mediaUrl(project.id, "long", run.id) : undefined} download={`${project.name}_长轨迹.mp4`}><Icon name="download"/>导出长轨迹</a><a className={run?.status !== "completed" ? "disabled manifest-export" : "manifest-export"} href={run?.status === "completed" ? api.mediaUrl(project.id, "manifest", run.id) : undefined} download={`${project.name}_运行清单.json`}><Icon name="database"/>导出运行清单</a></div></section>
        <section className="panel-card events-panel"><header><h3>预测状态事件</h3><span>{events.length}</span></header><div>{events.length ? events.map((event, index) => <button key={`${event.time}-${index}`} onClick={() => { if (videoRef.current) videoRef.current.currentTime = event.time; }}><time>{formatDuration(event.time)}</time><span className={`event-dot ${event.type.toLowerCase()}`}/><strong>{event.fly}</strong><small>{({ UNCERTAIN: "身份不确定", OCCLUDED: "遮挡预测", RECOVERING: "恢复关联" } as Record<string, string>)[event.type]}</small><Icon name="chevron"/></button>) : <p className="empty-events">分析完成后显示遮挡和身份不确定事件</p>}</div></section>
        {run && <section className="run-meta"><div><span>分析运行</span><strong>{run.id.slice(0, 8)}</strong></div><div><span>模型</span><strong>{run.model_name}</strong></div><div><span>跟踪</span><strong>MHT v3</strong></div><div><span>{run.completed_at ? "完成时间" : run.started_at ? "开始时间" : "排队时间"}</span><strong>{formatDateTime(run.completed_at || run.started_at || run.queued_at)}</strong></div></section>}
        {!run && <button className="start-analysis panel-start" disabled={!video} onClick={() => onAnalyze(project)}><Icon name="activity"/>开始 AI 分析</button>}
      </aside>
    </div>
  </div>;
}

function useTrajectoryCanvas({ canvasRef, videoRef, tracks, mode, selectedFly, layers, currentTime, sourceWidth, sourceHeight }: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  tracks: TrackPayload;
  mode: "short" | "long";
  selectedFly: number | "all";
  layers: { trails: boolean; boxes: boolean; labels: boolean; uncertain: boolean };
  currentTime: number;
  sourceWidth: number;
  sourceHeight: number;
}) {
  const grouped = useMemo(() => {
    const map = new Map<number, TrackPoint[]>();
    for (const point of tracks.points) {
      if (!map.has(point.fly_id)) map.set(point.fly_id, []);
      map.get(point.fly_id)!.push(point);
    }
    return map;
  }, [tracks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const rect = video.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(ratio, ratio);
    context.clearRect(0, 0, rect.width, rect.height);
    if (!grouped.size) return;
    const scale = Math.min(rect.width / sourceWidth, rect.height / sourceHeight);
    const offsetX = (rect.width - sourceWidth * scale) / 2;
    const offsetY = (rect.height - sourceHeight * scale) / 2;
    const startTime = mode === "short" ? Math.max(0, currentTime - 1.5) : 0;
    const flyIds = selectedFly === "all" ? [...grouped.keys()] : [selectedFly];
    for (const flyId of flyIds) {
      const points = grouped.get(flyId) || [];
      const visible = points.filter((point) => point.timestamp_s >= startTime && point.timestamp_s <= currentTime && point.cx != null && point.cy != null && (layers.uncertain || point.usable));
      const color = COLORS[(flyId - 1) % COLORS.length];
      if (layers.trails && visible.length > 1) {
        context.lineWidth = selectedFly === flyId ? 2.6 : 1.6;
        context.lineJoin = "round";
        context.lineCap = "round";
        for (let index = 1; index < visible.length; index += 1) {
          const prior = visible[index - 1];
          const point = visible[index];
          context.beginPath();
          context.strokeStyle = ["UNCERTAIN", "OCCLUDED", "LOST"].includes(point.state) || point.source === "predicted" ? "#ff8a72" : color;
          context.globalAlpha = mode === "short" ? 0.84 : Math.max(0.18, index / visible.length * 0.75);
          context.setLineDash(point.source === "predicted" || point.state !== "ACTIVE" ? [5, 4] : []);
          context.moveTo(offsetX + (prior.cx || 0) * scale, offsetY + (prior.cy || 0) * scale);
          context.lineTo(offsetX + (point.cx || 0) * scale, offsetY + (point.cy || 0) * scale);
          context.stroke();
        }
      }
      const current = [...points].reverse().find((point) => point.timestamp_s <= currentTime + 0.04 && point.cx != null && point.cy != null);
      if (!current) continue;
      context.globalAlpha = 1;
      context.setLineDash(current.source === "predicted" ? [5, 3] : []);
      context.strokeStyle = current.state === "UNCERTAIN" ? "#ff6f63" : color;
      context.fillStyle = color;
      if (layers.boxes && current.x1 != null && current.y1 != null && current.x2 != null && current.y2 != null) {
        context.lineWidth = 1.5;
        context.strokeRect(offsetX + current.x1 * scale, offsetY + current.y1 * scale, (current.x2 - current.x1) * scale, (current.y2 - current.y1) * scale);
        context.beginPath();
        context.arc(offsetX + (current.cx || 0) * scale, offsetY + (current.cy || 0) * scale, 3.2, 0, Math.PI * 2);
        context.fill();
      }
      if (layers.labels) {
        const x = offsetX + (current.x1 ?? current.cx ?? 0) * scale;
        const y = offsetY + (current.y1 ?? current.cy ?? 0) * scale - 8;
        context.setLineDash([]);
        context.font = "600 11px -apple-system, BlinkMacSystemFont, sans-serif";
        const label = `Fly ${String(flyId).padStart(2, "0")}`;
        const width = context.measureText(label).width + 12;
        context.fillStyle = "rgba(4, 22, 29, .82)";
        context.fillRect(x, y - 15, width, 20);
        context.fillStyle = color;
        context.fillText(label, x + 6, y);
      }
    }
    context.globalAlpha = 1;
    context.setLineDash([]);
  }, [canvasRef, videoRef, grouped, mode, selectedFly, layers, currentTime, sourceWidth, sourceHeight]);
}
