import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { api } from "../api";
import { AnalysisHeader, AnalysisLoading, AnalysisPending, PredictionNotice } from "../components/AnalysisHeader";
import type { Project, SpatialResponse } from "../types";

const PATH_COLORS = ["#0d9e94", "#377fdb", "#e2a522", "#8d68d2", "#df655c", "#40aa73", "#cf68a2", "#779f38", "#2c9fc7", "#df7b32"];

function percent(value: number): string { return `${(value * 100).toFixed(1)}%`; }

function SpatialPlot({ data, selectedFly, showHeatmap, showPath }: { data: SpatialResponse; selectedFly: number | "all"; showHeatmap: boolean; showPath: boolean }) {
  const { width, height } = data.video;
  const bounds = data.arena_bounds;
  const cellWidth = bounds.width / data.heatmap.columns;
  const cellHeight = bounds.height / data.heatmap.rows;
  const maximum = Math.max(...data.heatmap.density, 0.000001);
  const hotspotKeys = new Set(data.hotspots.map((item) => `${item.row}-${item.column}`));
  const paths = selectedFly === "all" ? data.paths : data.paths.filter((path) => path.fly_id === selectedFly);
  return <svg className="spatial-plot" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="果蝇轨迹密度热图与二维轨迹">
    <defs><radialGradient id="arenaShade"><stop stopColor="#fbfdfc"/><stop offset="1" stopColor="#e6eeec"/></radialGradient></defs>
    <rect width={width} height={height} fill="#dfe7e5"/>
    <rect x={bounds.x} y={bounds.y} width={bounds.width} height={bounds.height} rx={Math.min(bounds.width, bounds.height) * .15} fill="url(#arenaShade)" stroke="#91aaa5" strokeWidth="5"/>
    {showHeatmap && data.heatmap.density.map((density, index) => {
      if (!density) return null;
      const row = Math.floor(index / data.heatmap.columns), column = index % data.heatmap.columns;
      const ratio = Math.sqrt(density / maximum);
      const hot = hotspotKeys.has(`${row}-${column}`);
      return <rect key={index} x={bounds.x + column * cellWidth} y={bounds.y + row * cellHeight} width={cellWidth + .5} height={cellHeight + .5} fill={ratio > .65 ? "#ef5a3c" : ratio > .35 ? "#f4a63d" : "#38b9ad"} opacity={.12 + ratio * .72} stroke={hot ? "#fff4c9" : "none"} strokeWidth={hot ? 4 : 0}/>;
    })}
    {showPath && paths.map((path) => {
      const points = path.points.map((point) => `${point[0]},${point[1]}`).join(" ");
      const last = path.points[path.points.length - 1];
      return <g key={path.fly_id}><polyline points={points} fill="none" stroke={PATH_COLORS[(path.fly_id - 1) % PATH_COLORS.length]} strokeWidth={selectedFly === "all" ? 2.6 : 5} opacity={selectedFly === "all" ? .62 : .94} strokeLinejoin="round" strokeLinecap="round"/>{last && <><circle cx={last[0]} cy={last[1]} r={selectedFly === "all" ? 7 : 12} fill={PATH_COLORS[(path.fly_id - 1) % PATH_COLORS.length]} stroke="#fff" strokeWidth="3"/><text x={last[0] + 13} y={last[1] - 10} className="spatial-fly-label">F{path.fly_id}</text></>}</g>;
    })}
    <text x={bounds.x + 15} y={bounds.y + 32} className="spatial-unit-label">ARENA ROI · px coordinates</text>
  </svg>;
}

export function SpatialPage({ projects, selectedId, onSelectProject }: {
  projects: Project[];
  selectedId: string | null;
  onSelectProject: (project: Project) => void;
}) {
  const project = projects.find((item) => item.id === selectedId) || projects[0] || null;
  const completedRuns = project?.runs.filter((run) => run.status === "completed") || [];
  const [runId, setRunId] = useState("");
  const [data, setData] = useState<SpatialResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFly, setSelectedFly] = useState<number | "all">("all");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showPath, setShowPath] = useState(true);

  useEffect(() => setRunId((current) => completedRuns.some((run) => run.id === current) ? current : completedRuns[0]?.id || ""), [project?.id, completedRuns.length]);
  useEffect(() => {
    if (!project || !runId) { setData(null); return; }
    let cancelled = false;
    setLoading(true); setError("");
    api.spatial(project.id, runId).then((result) => !cancelled && setData(result)).catch((reason) => !cancelled && setError(reason instanceof Error ? reason.message : "空间指标计算失败")).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [project?.id, runId]);

  const topZone = data?.zone_summary[0];
  const selectedPath = useMemo(() => selectedFly === "all" ? null : data?.paths.find((path) => path.fly_id === selectedFly), [data, selectedFly]);

  return <div className="page science-page spatial-page">
    <AnalysisHeader eyebrow="SPATIAL PREFERENCE" title="空间偏好" description="查看停留密度热点、场地区域偏好和任意预测个体的完整二维运动路径。" projects={projects} project={project} runId={runId} onProject={onSelectProject} onRun={setRunId}/>
    {!completedRuns.length ? <AnalysisPending/> : loading ? <AnalysisLoading label="正在生成空间密度和二维轨迹"/> : error ? <AnalysisPending message={error}/> : data ? <>
      <PredictionNotice>热图按活动可用轨迹的真实停留时间加权；高亮区域为密度分布第 85 百分位以上。</PredictionNotice>
      <div className="spatial-layout">
        <section className="science-card spatial-main"><header><div><h2>轨迹密度与二维路径</h2><p>{selectedFly === "all" ? "全部预测个体" : `Fly ${String(selectedFly).padStart(2, "0")} 完整路径`} · 视频原始坐标</p></div><div className="plot-toggles"><button className={showHeatmap ? "active" : ""} onClick={() => setShowHeatmap((current) => !current)}>密度热图</button><button className={showPath ? "active" : ""} onClick={() => setShowPath((current) => !current)}>二维轨迹</button></div></header><SpatialPlot data={data} selectedFly={selectedFly} showHeatmap={showHeatmap} showPath={showPath}/><footer className="heat-legend"><span>低停留</span><i/><i/><i/><span>高停留</span><b>亮边框：热点</b></footer></section>
        <aside className="spatial-side">
              <section className="science-card"><header><div><h2>预测个体</h2><p>选择任意果蝇查看完整路径</p></div></header><div className="fly-selector-grid"><button className={selectedFly === "all" ? "active" : ""} onClick={() => setSelectedFly("all")}>全部</button>{data.paths.map((path) => <button key={path.fly_id} className={selectedFly === path.fly_id ? "active" : ""} style={{ "--fly-color": PATH_COLORS[(path.fly_id - 1) % PATH_COLORS.length] } as CSSProperties} onClick={() => setSelectedFly(path.fly_id)}>F{path.fly_id}</button>)}</div>{selectedPath && <div className="path-summary"><span>采样路径点</span><strong>{selectedPath.points.length}</strong><small>仅为显示降采样，指标使用完整轨迹</small></div>}</section>
          <section className="science-card zone-card"><header><div><h2>活动区域总结</h2><p>按场地相对位置划分</p></div></header>{data.zone_summary.slice(0, 6).map((zone, index) => <div className="zone-row" key={zone.zone}><span><i>{index + 1}</i>{zone.zone}</span><div><b style={{ width: `${Math.min(zone.occupancy * 220, 100)}%` }}/></div><strong>{percent(zone.occupancy)}</strong></div>)}</section>
          <section className="science-card hotspot-summary"><span>最高停留区域</span><strong>{topZone?.zone || "—"}</strong><p>{topZone ? `约占活动可用停留时间的 ${percent(topZone.occupancy)}。共识别 ${data.hotspots.length} 个高密度网格。` : "暂无可用热点。"}</p></section>
        </aside>
      </div>
      <footer className="profile-footer"><span>参数版本 {String(data.metric_profile.id)}</span><span>{data.heatmap.columns} × {data.heatmap.rows} 时间加权网格</span><span>坐标单位 px</span></footer>
    </> : null}
  </div>;
}
