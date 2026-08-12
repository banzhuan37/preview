import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { AnalysisHeader, AnalysisLoading, AnalysisPending, PredictionNotice } from "../components/AnalysisHeader";
import type { MovementIndividual, MovementResponse, Project } from "../types";

function value(number: number | undefined, digits = 1): string {
  return number == null || !Number.isFinite(number) ? "—" : number.toFixed(digits);
}

function percent(number: number | undefined): string {
  return number == null ? "—" : `${(number * 100).toFixed(1)}%`;
}

type RhythmBin = MovementResponse["rhythm"]["bins"][number];

function SpeedChart({ bins, label }: { bins: RhythmBin[]; label: string }) {
  const width = 820, height = 180, pad = 24;
  const maximum = Math.max(...bins.map((bin) => bin.mean_speed_px_s), 1);
  const points = bins.map((bin, index) => `${pad + index / Math.max(bins.length - 1, 1) * (width - pad * 2)},${height - pad - bin.mean_speed_px_s / maximum * (height - pad * 2)}`).join(" ");
  return <svg className="analysis-line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label}平均速度随时间变化`}>
    <defs><linearGradient id="speedFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#34bdb0" stopOpacity=".35"/><stop offset="1" stopColor="#34bdb0" stopOpacity="0"/></linearGradient></defs>
    {[0, .25, .5, .75, 1].map((tick) => <line key={tick} x1={pad} x2={width - pad} y1={pad + tick * (height - pad * 2)} y2={pad + tick * (height - pad * 2)} className="chart-grid-line"/>)}
    <polygon points={`${pad},${height - pad} ${points} ${width - pad},${height - pad}`} fill="url(#speedFill)"/>
    <polyline points={points} fill="none" stroke="#119d92" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
    {bins.filter((_, index) => index % 5 === 0).map((bin, index) => <text key={bin.start_s} x={pad + (index * 5) / Math.max(bins.length - 1, 1) * (width - pad * 2)} y={height - 4} className="chart-label">{Math.round(bin.start_s)}s</text>)}
  </svg>;
}

function RhythmChart({ bins, label }: { bins: RhythmBin[]; label: string }) {
  return <div className="rhythm-chart" aria-label={`${label}休息与运动节奏`}>
    {bins.map((bin) => <div className="rhythm-column" key={bin.start_s} title={`${bin.start_s.toFixed(0)}–${bin.end_s.toFixed(0)} 秒`}>
      <span className="active" style={{ height: `${bin.active_ratio * 100}%` }}/>
      <span className="low" style={{ height: `${bin.low_ratio * 100}%` }}/>
      <span className="rest" style={{ height: `${bin.rest_ratio * 100}%` }}/>
    </div>)}
  </div>;
}

export function MovementPage({ projects, selectedId, onSelectProject }: {
  projects: Project[];
  selectedId: string | null;
  onSelectProject: (project: Project) => void;
}) {
  const project = projects.find((item) => item.id === selectedId) || projects[0] || null;
  const completedRuns = project?.runs.filter((run) => run.status === "completed") || [];
  const [runId, setRunId] = useState("");
  const [data, setData] = useState<MovementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFly, setSelectedFly] = useState<number | null>(null);

  useEffect(() => {
    setRunId((current) => completedRuns.some((run) => run.id === current) ? current : completedRuns[0]?.id || "");
  }, [project?.id, completedRuns.length]);

  useEffect(() => {
    if (!project || !runId) { setData(null); return; }
    let cancelled = false;
    setLoading(true); setError("");
    api.movement(project.id, runId).then((result) => { if (!cancelled) { setData(result); setSelectedFly(null); } }).catch((reason) => !cancelled && setError(reason instanceof Error ? reason.message : "运动指标计算失败")).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [project?.id, runId]);

  const selected = useMemo(() => data?.individuals.find((item) => item.fly_id === selectedFly) || null, [data, selectedFly]);
  const group = data?.group;
  const rhythmBins = useMemo(() => selectedFly == null ? data?.rhythm.bins || [] : data?.individual_rhythm.find((item) => item.fly_id === selectedFly)?.bins || [], [data, selectedFly]);
  const rhythmLabel = selectedFly == null ? "群体" : `Fly ${String(selectedFly).padStart(2, "0")}`;

  return <div className="page science-page">
    <AnalysisHeader eyebrow="LOCOMOTOR PERFORMANCE" title="运动能力" description="查看个体与群体的运动距离、速度、转向、兴奋度和短时运动节律。" projects={projects} project={project} runId={runId} onProject={onSelectProject} onRun={setRunId}/>
    {!completedRuns.length ? <AnalysisPending/> : loading ? <AnalysisLoading label="正在计算运动能力指标"/> : error ? <AnalysisPending message={error}/> : data && group ? <>
      <PredictionNotice>距离、速度、兴奋度与节律均由 AI 预测轨迹派生；未标定比例尺时使用 px 与 px/s。</PredictionNotice>
      <div className="science-metric-grid five">
        <article><span>群体平均总距离</span><strong>{value(group.total_distance_px, 0)} <small>px</small></strong><em>10 只预测身份均值</em></article>
        <article><span>群体平均速度</span><strong>{value(group.mean_speed_px_s, 2)} <small>px/s</small></strong><em>仅使用活动可用轨迹</em></article>
        <article><span>平均转向次数</span><strong>{value(group.turn_count, 1)} <small>次</small></strong><em>≥90° 且满足速度门槛</em></article>
        <article><span>兴奋度</span><strong>{percent(group.excitability)}</strong><em>EXC-ACTIVE-RATIO-v1</em></article>
        <article><span>休息时间占比</span><strong>{percent(group.rest_ratio)}</strong><em>速度低于 0.2 体长/秒</em></article>
      </div>
      <div className="science-two-column movement-charts">
        <section className="science-card"><header><div><h2>{rhythmLabel}速度变化</h2><p>2 秒时间箱 · px/s</p></div><select className="science-scope-select" value={selectedFly ?? "group"} onChange={(event) => setSelectedFly(event.target.value === "group" ? null : Number(event.target.value))}><option value="group">群体节律</option>{data.individuals.map((item) => <option key={item.fly_id} value={item.fly_id}>Fly {String(item.fly_id).padStart(2, "0")}</option>)}</select></header><SpeedChart bins={rhythmBins} label={rhythmLabel}/></section>
        <section className="science-card"><header><div><h2>{rhythmLabel}休息与运动节奏</h2><p>每个时间箱内的状态时间占比</p></div><span className="method-pill">短时节律</span></header><RhythmChart bins={rhythmBins} label={rhythmLabel}/><div className="rhythm-legend"><span><i className="active"/>活跃</span><span><i className="low"/>低速</span><span><i className="rest"/>休息</span></div><div className="bout-summary"><div><span>平均运动片段</span><strong>{value(selected?.mean_active_bout_s ?? group.mean_active_bout_s, 2)} s</strong></div><div><span>平均休息片段</span><strong>{value(selected?.mean_rest_bout_s ?? group.mean_rest_bout_s, 2)} s</strong></div><div><span>运动片段数</span><strong>{value(selected?.active_bout_count ?? group.active_bout_count, selected ? 0 : 1)}</strong></div></div></section>
      </div>
      <section className="science-card individual-table-card"><header><div><h2>个体运动能力比较</h2><p>点击任意果蝇查看相对群体中位数的差值</p></div><span>{data.individuals.length} 个预测身份</span></header>
        <div className="science-table"><div className="science-tr header"><span>个体</span><span>总距离</span><span>平均速度</span><span>转向</span><span>兴奋度</span><span>休息占比</span><span>有效覆盖</span></div>{data.individuals.map((item) => <button className={`science-tr ${selectedFly === item.fly_id ? "selected" : ""}`} key={item.fly_id} onClick={() => setSelectedFly((current) => current === item.fly_id ? null : item.fly_id)}><span><i className={`fly-dot fly-${(item.fly_id - 1) % 10}`}/>Fly {String(item.fly_id).padStart(2, "0")}</span><span>{value(item.total_distance_px, 0)} px</span><span>{value(item.mean_speed_px_s, 2)} px/s</span><span>{item.turn_count}</span><span>{percent(item.excitability)}</span><span>{percent(item.rest_ratio)}</span><span>{percent(item.coverage)}</span></button>)}</div>
        {selected && <IndividualDetail item={selected}/>} 
      </section>
      <footer className="profile-footer"><span>参数版本 {String(data.metric_profile.id)}</span><span>体长标尺 {value(Number(data.metric_profile.body_length_px), 2)} px</span><span>未进行 mm 标定</span></footer>
    </> : null}
  </div>;
}

function IndividualDetail({ item }: { item: MovementIndividual }) {
  const distanceTone = item.distance_delta_group_px >= 0 ? "positive" : "negative";
  const speedTone = item.speed_delta_group_px_s >= 0 ? "positive" : "negative";
  return <div className="individual-detail"><div><span>Fly {String(item.fly_id).padStart(2, "0")}</span><strong>个体预测详情</strong></div><dl><div><dt>相对群体距离中位数</dt><dd className={distanceTone}>{item.distance_delta_group_px >= 0 ? "+" : ""}{value(item.distance_delta_group_px, 1)} px</dd></div><div><dt>相对群体速度中位数</dt><dd className={speedTone}>{item.speed_delta_group_px_s >= 0 ? "+" : ""}{value(item.speed_delta_group_px_s, 2)} px/s</dd></div><div><dt>运动 / 休息片段</dt><dd>{item.active_bout_count} / {item.rest_bout_count}</dd></div><div><dt>平均运动 / 休息时长</dt><dd>{value(item.mean_active_bout_s, 2)} / {value(item.mean_rest_bout_s, 2)} s</dd></div></dl></div>;
}
