import { useEffect, useMemo, useState } from "react";
import { api, formatDuration } from "../api";
import { AnalysisHeader, AnalysisLoading, AnalysisPending, PredictionNotice } from "../components/AnalysisHeader";
import type { Project, SocialResponse } from "../types";

const EVENT_LABELS: Record<string, string> = { approach: "接近", departure: "离开", contact: "预测接触", following: "预测跟随", chasing: "预测追逐" };
const EVENT_COLORS: Record<string, string> = { approach: "#2f9dd0", departure: "#8d78c9", contact: "#e59d2f", following: "#21a78f", chasing: "#df645d" };

function number(value: number | undefined, digits = 1): string { return value == null ? "—" : value.toFixed(digits); }
function percent(value: number | undefined): string { return value == null ? "—" : `${(value * 100).toFixed(1)}%`; }

function DispersionChart({ data }: { data: SocialResponse }) {
  const series = data.center_series;
  const width = 760, height = 150, pad = 22;
  const maximum = Math.max(...series.map((item) => item.dispersion_bl), 1);
  const lastTime = Math.max(series.at(-1)?.time_s || 1, 1);
  const points = series.map((item) => `${pad + item.time_s / lastTime * (width - pad * 2)},${height - pad - item.dispersion_bl / maximum * (height - pad * 2)}`).join(" ");
  return <svg className="analysis-line-chart social-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="群体扩散半径变化"><line x1={pad} x2={width-pad} y1={height-pad} y2={height-pad} className="chart-axis"/><polyline points={points} fill="none" stroke="#8267c7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{series.filter((_, index) => index % 20 === 0).map((item) => <circle key={item.time_s} cx={pad + item.time_s / lastTime * (width-pad*2)} cy={height-pad-item.dispersion_bl/maximum*(height-pad*2)} r="4" fill="#fff" stroke="#8267c7" strokeWidth="2"/>)}</svg>;
}

export function SocialPage({ projects, selectedId, onSelectProject }: {
  projects: Project[];
  selectedId: string | null;
  onSelectProject: (project: Project) => void;
}) {
  const project = projects.find((item) => item.id === selectedId) || projects[0] || null;
  const completedRuns = project?.runs.filter((run) => run.status === "completed") || [];
  const [runId, setRunId] = useState("");
  const [data, setData] = useState<SocialResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [selectedFly, setSelectedFly] = useState<number | null>(null);

  useEffect(() => setRunId((current) => completedRuns.some((run) => run.id === current) ? current : completedRuns[0]?.id || ""), [project?.id, completedRuns.length]);
  useEffect(() => {
    if (!project || !runId) { setData(null); return; }
    let cancelled = false;
    setLoading(true); setError("");
    api.social(project.id, runId).then((result) => { if (!cancelled) { setData(result); setSelectedFly(null); } }).catch((reason) => !cancelled && setError(reason instanceof Error ? reason.message : "社交指标计算失败")).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [project?.id, runId]);

  const filteredEvents = useMemo(() => data?.events.filter((event) => eventFilter === "all" || event.type === eventFilter).slice(0, 80) || [], [data, eventFilter]);
  const selected = data?.individuals.find((item) => item.fly_id === selectedFly) || null;

  return <div className="page science-page social-page">
    <AnalysisHeader eyebrow="SOCIAL BEHAVIOR" title="社交行为" description="分析个体间距离、接近离开、预测接触、跟随追逐、聚集程度与群体扩散。" projects={projects} project={project} runId={runId} onProject={onSelectProject} onRun={setRunId}/>
    {!completedRuns.length ? <AnalysisPending/> : loading ? <AnalysisLoading label="正在计算社交行为代理指标"/> : error ? <AnalysisPending message={error}/> : data ? <>
      <PredictionNotice>接触、跟随和追逐不含人工标注与头尾朝向信息，统一作为 AI 预测代理事件展示。</PredictionNotice>
      <div className="science-metric-grid five social-metrics">
        <article><span>平均个体间距离</span><strong>{number(data.group.mean_pair_distance_bl, 2)} <small>体长</small></strong><em>所有有效个体对</em></article>
        <article><span>接近 / 离开</span><strong>{number(data.group.approach_count, 0)} / {number(data.group.departure_count, 0)}</strong><em>2.5 / 3.0 体长迟滞阈值</em></article>
        <article><span>预测接触</span><strong>{number(data.group.contact_count, 0)} <small>次</small></strong><em>≤1.2 体长且持续 ≥0.2 秒</em></article>
        <article><span>跟随 / 追逐代理</span><strong>{number(data.group.following_count, 0)} / {number(data.group.chasing_count, 0)}</strong><em>方向、距离和速度规则</em></article>
        <article><span>聚集指数</span><strong>{percent(data.group.aggregation_index)}</strong><em>3 体长内个体对占比</em></article>
      </div>
      <div className="science-two-column social-overview">
        <section className="science-card"><header><div><h2>群体中心与扩散范围</h2><p>扩散半径随时间变化 · 体长</p></div><span className="method-pill">群体中心</span></header><DispersionChart data={data}/><div className="dispersion-summary"><div><span>平均扩散半径</span><strong>{number(data.group.mean_dispersion_bl, 2)} 体长</strong></div><div><span>最大扩散半径</span><strong>{number(data.group.max_dispersion_bl, 2)} 体长</strong></div><div><span>中心采样点</span><strong>{data.center_series.length}</strong></div></div></section>
        <section className="science-card event-bars"><header><div><h2>群体社交事件构成</h2><p>同一事件计为一个个体对事件</p></div></header>{["approach","departure","contact","following","chasing"].map((type) => { const count = data.group[`${type}_count`] || 0; const max = Math.max(...["approach","departure","contact","following","chasing"].map((key) => data.group[`${key}_count`] || 0), 1); return <div key={type}><span>{EVENT_LABELS[type]}</span><div><b style={{ width: `${count/max*100}%`, background: EVENT_COLORS[type] }}/></div><strong>{count.toFixed(0)}</strong></div>; })}</section>
      </div>
      <div className="science-two-column social-detail-grid">
        <section className="science-card social-individuals"><header><div><h2>个体社交活跃程度</h2><p>加权预测事件数 / 分钟</p></div><span>{data.individuals.length} 个身份</span></header><div className="social-rank-list">{[...data.individuals].sort((a,b) => b.social_activity_per_min-a.social_activity_per_min).map((item,index) => <button key={item.fly_id} className={selectedFly===item.fly_id?"active":""} onClick={() => setSelectedFly((current)=>current===item.fly_id?null:item.fly_id)}><i>{index+1}</i><span>Fly {String(item.fly_id).padStart(2,"0")}</span><div><b style={{width:`${Math.min(item.social_activity_per_min/Math.max(...data.individuals.map((entry)=>entry.social_activity_per_min),1)*100,100)}%`}}/></div><strong>{number(item.social_activity_per_min,1)}</strong></button>)}</div>{selected && <div className="social-fly-detail"><strong>Fly {String(selected.fly_id).padStart(2,"0")}</strong><span>最近邻 {number(selected.mean_nearest_neighbor_bl,2)} 体长</span><span>接触 {selected.contact_count}</span><span>跟随 {selected.following_count}</span><span>追逐 {selected.chasing_count}</span></div>}</section>
        <section className="science-card social-events"><header><div><h2>预测事件时间线</h2><p>点击筛选不同代理行为</p></div><span>{data.events.length} 个事件</span></header><div className="event-filter"><button className={eventFilter==="all"?"active":""} onClick={()=>setEventFilter("all")}>全部</button>{Object.entries(EVENT_LABELS).map(([key,label])=><button key={key} className={eventFilter===key?"active":""} onClick={()=>setEventFilter(key)}>{label}</button>)}</div><div className="social-event-list">{filteredEvents.map((event,index)=><div key={`${event.type}-${event.time_s}-${index}`}><time>{formatDuration(event.time_s)}</time><i style={{background:EVENT_COLORS[event.type]}}/><strong>{EVENT_LABELS[event.type]}</strong><span>{event.actors.map((actor)=>`F${actor}`).join(" → ")}</span><em>{event.duration_s>0?`${event.duration_s.toFixed(2)}s`:"瞬时越界"}</em></div>)}</div></section>
      </div>
      <footer className="profile-footer"><span>参数版本 {String(data.metric_profile.id)}</span><span>距离单位：体长</span><span>代理指标，不作为人工行为标签</span></footer>
    </> : null}
  </div>;
}
