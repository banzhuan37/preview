import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Modal } from "../components/Modal";
import { PredictionNotice } from "../components/AnalysisHeader";
import { Icon } from "../icons";
import type { Comparison, ComparisonStatistics, Project } from "../types";

const DEFAULT_METRICS = [
  { code: "mean_speed_px_s", label: "平均速度", unit: "px/s" },
  { code: "total_distance_px", label: "运动总距离", unit: "px" },
  { code: "turn_count", label: "转向次数", unit: "次" },
  { code: "excitability", label: "兴奋度", unit: "%" },
  { code: "rest_ratio", label: "休息占比", unit: "%" },
  { code: "active_bout_count", label: "运动片段数", unit: "次" },
  { code: "mean_active_bout_s", label: "平均运动片段时长", unit: "s" },
  { code: "center_ratio", label: "中心区域停留占比", unit: "%" },
  { code: "top_zone_occupancy", label: "最高活动区域停留占比", unit: "%" },
  { code: "mean_pair_distance_bl", label: "平均个体间距离", unit: "体长" },
  { code: "aggregation_index", label: "聚集指数", unit: "%" },
  { code: "mean_dispersion_bl", label: "平均扩散半径", unit: "体长" },
  { code: "contact_per_min", label: "预测接触频率", unit: "次/min" },
  { code: "following_per_min", label: "预测跟随频率", unit: "次/min" },
  { code: "chasing_per_min", label: "预测追逐频率", unit: "次/min" },
];

function display(value: number | null | undefined, unit = "", digits = 2): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return unit === "%" ? `${(value * 100).toFixed(1)}%` : `${value.toFixed(digits)}${unit ? ` ${unit}` : ""}`;
}

function ObservationPlot({ data }: { data: ComparisonStatistics }) {
  const values = data.observations.map((item) => item.value);
  const minimum = Math.min(...values, 0), maximum = Math.max(...values, 1);
  const span = Math.max(maximum - minimum, 0.000001);
  const unit = data.metric.unit;
  return <div className="observation-plot">
    {(["control", "experimental"] as const).map((role) => {
      const rows = data.observations.filter((item) => item.role === role);
      const summary = data.statistics[role];
      return <div className={`observation-group ${role}`} key={role}><header><span>{role === "control" ? "对照组" : "实验组"}</span><strong>n={summary.n}</strong></header><div className="observation-scale">{rows.map((item,index)=><div className="observation-dot" key={item.project_id} style={{left:`${8+(item.value-minimum)/span*84}%`,top:`${20+(index%4)*19}%`}} title={`${item.project_name}: ${display(item.value,unit)}`}><i/><span>{item.project_name}</span></div>)}{summary.mean != null && <div className="mean-marker" style={{left:`${8+(summary.mean-minimum)/span*84}%`}}><i/><span>均值 {display(summary.mean,unit)}</span></div>}</div></div>;
    })}
    <footer><span>{display(minimum, unit)}</span><b>{data.metric.label}</b><span>{display(maximum, unit)}</span></footer>
  </div>;
}

export function StatisticsPage({ projects }: { projects: Project[] }) {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [metric, setMetric] = useState("mean_speed_px_s");
  const [statistics, setStatistics] = useState<ComparisonStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "对照组 vs 实验组", control_ids: [] as string[], experimental_ids: [] as string[] });
  const [error, setError] = useState("");

  const loadComparisons = async (prefer?: string) => {
    const rows = await api.comparisons();
    setComparisons(rows);
    setSelectedId((current) => prefer && rows.some((item) => item.id === prefer) ? prefer : rows.some((item) => item.id === current) ? current : rows[0]?.id || "");
  };
  useEffect(() => { void loadComparisons().catch((reason) => setError(reason instanceof Error ? reason.message : "无法读取比较方案")); }, []);
  useEffect(() => {
    if (!selectedId) { setStatistics(null); return; }
    let cancelled = false;
    setLoading(true); setError("");
    api.comparisonStatistics(selectedId, metric).then((result) => !cancelled && setStatistics(result)).catch((reason) => !cancelled && setError(reason instanceof Error ? reason.message : "组间统计计算失败")).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [selectedId, metric]);

  const selected = comparisons.find((item) => item.id === selectedId) || null;
  const metrics = statistics?.available_metrics || DEFAULT_METRICS;
  const stats = statistics?.statistics;
  const metricUnit = statistics?.metric.unit || metrics.find((item) => item.code === metric)?.unit || "";
  const openCreate = () => { setEditingId(null); setForm({ name: "对照组 vs 实验组", control_ids: [], experimental_ids: [] }); setEditorOpen(true); };
  const openEdit = () => { if (!selected) return; setEditingId(selected.id); setForm({ name: selected.name, control_ids: [...selected.control_ids], experimental_ids: [...selected.experimental_ids] }); setEditorOpen(true); };
  const assign = (projectId: string, role: "control" | "experimental") => setForm((current) => ({
    ...current,
    control_ids: role === "control" ? current.control_ids.includes(projectId) ? current.control_ids.filter((id) => id !== projectId) : [...current.control_ids, projectId] : current.control_ids.filter((id) => id !== projectId),
    experimental_ids: role === "experimental" ? current.experimental_ids.includes(projectId) ? current.experimental_ids.filter((id) => id !== projectId) : [...current.experimental_ids, projectId] : current.experimental_ids.filter((id) => id !== projectId),
  }));
  const save = async () => {
    setLoading(true); setError("");
    try {
      const result = editingId ? await api.updateComparison(editingId, form) : await api.createComparison(form);
      await loadComparisons(result.id); setEditorOpen(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "保存比较方案失败"); }
    finally { setLoading(false); }
  };
  const remove = async () => {
    if (!selected) return;
    setLoading(true);
    try { await api.deleteComparison(selected.id); await loadComparisons(); setDeleteOpen(false); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "删除比较方案失败"); }
    finally { setLoading(false); }
  };

  const completedCount = useMemo(() => projects.filter((project) => project.runs.some((run) => run.status === "completed")).length, [projects]);

  return <div className="page science-page statistics-page">
    <div className="page-header"><div><span className="eyebrow">BETWEEN-GROUP STATISTICS</span><h1>组间统计</h1><p>设置对照组与实验组，比较项目级 AI 预测运动、空间与社交指标。</p></div><div className="header-actions"><span className="offline-pill"><i/>{completedCount} 个项目可用于统计</span><button className="primary" onClick={openCreate}><Icon name="plus"/>新建比较</button></div></div>
    <PredictionNotice>默认将每个项目/培养皿作为一个独立实验单位，避免把同一培养皿中的果蝇错误当作完全独立重复。</PredictionNotice>
    {error && <div className="inline-error"><Icon name="alert"/>{error}</div>}
    {!comparisons.length ? <div className="statistics-empty"><span><Icon name="chart"/></span><h2>建立第一套组间比较</h2><p>至少准备一个对照组项目和一个实验组项目。只有完成 AI 分析的项目才会进入统计。</p><button className="primary" onClick={openCreate}><Icon name="plus"/>设置对照组与实验组</button></div> : <>
      <div className="statistics-toolbar"><label><span>比较方案</span><select value={selectedId} onChange={(event)=>setSelectedId(event.target.value)}>{comparisons.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span>比较指标</span><select value={metric} onChange={(event)=>setMetric(event.target.value)}>{metrics.map((item)=><option key={item.code} value={item.code}>{item.label} · {item.unit}</option>)}</select></label><div><button onClick={openEdit}><Icon name="edit"/>编辑分组</button><button className="danger-text" onClick={()=>setDeleteOpen(true)}><Icon name="trash"/>删除方案</button></div></div>
      {loading && !statistics ? <div className="analysis-state compact"><span className="spinner dark"/><h2>正在计算组间统计</h2></div> : statistics && stats ? <>
        <div className="science-metric-grid statistics-metrics">
          <article className="control"><span>对照组均值</span><strong>{display(stats.control.mean,metricUnit)}</strong><em>{stats.control.n} 个项目/培养皿</em></article>
          <article className="experimental"><span>实验组均值</span><strong>{display(stats.experimental.mean,metricUnit)}</strong><em>{stats.experimental.n} 个项目/培养皿</em></article>
          <article><span>实验组 − 对照组</span><strong>{stats.difference != null && stats.difference > 0 ? "+" : ""}{display(stats.difference,metricUnit)}</strong><em>{stats.percent_change == null ? "基线为 0 或数据不足" : `相对变化 ${stats.percent_change > 0 ? "+" : ""}${(stats.percent_change*100).toFixed(1)}%`}</em></article>
          <article><span>Welch t 检验</span><strong>{stats.inference.p_two_sided == null ? "—" : `p=${stats.inference.p_two_sided.toFixed(4)}`}</strong><em>{stats.inference.available ? `t=${stats.inference.t?.toFixed(2)} · df=${stats.inference.df?.toFixed(1)}` : "每组至少需要 2 个独立项目"}</em></article>
          <article><span>Hedges’ g</span><strong>{stats.inference.hedges_g == null ? "—" : stats.inference.hedges_g.toFixed(2)}</strong><em>标准化效应量</em></article>
        </div>
        <div className="science-two-column statistics-content"><section className="science-card"><header><div><h2>{statistics.metric.label}分布</h2><p>每个点代表一个项目/培养皿的个体均值</p></div><span className="method-pill">{metricUnit}</span></header><ObservationPlot data={statistics}/></section><section className="science-card group-members"><header><div><h2>分组与数据可用性</h2><p>统计始终绑定具体项目和成功运行</p></div></header>{(["control","experimental"] as const).map((role)=><div className={`member-group ${role}`} key={role}><h3>{role==="control"?"对照组":"实验组"}</h3>{statistics.comparison.members.filter((member)=>member.role===role).map((member)=><div key={member.project_id}><span>{member.name}</span><small>{member.code} · {member.vessel}</small><b>{statistics.observations.some((item)=>item.project_id===member.project_id)?"已纳入":"无成功运行"}</b></div>)}</div>)}{statistics.skipped.length>0&&<p className="skipped-note"><Icon name="alert"/>{statistics.skipped.length} 个项目因没有完成的预测轨迹而跳过。</p>}</section></div>
        <footer className="profile-footer"><span>独立实验单位：项目 / 培养皿</span><span>Welch t 检验</span><span>95% CI 为均值正态近似区间</span></footer>
      </> : null}
    </>}

    {editorOpen && <Modal title={editingId?"编辑比较方案":"新建比较方案"} description="将实验项目分配到互斥的对照组与实验组。" onClose={()=>setEditorOpen(false)}><div className="comparison-form"><label><span>方案名称</span><input value={form.name} onChange={(event)=>setForm((current)=>({...current,name:event.target.value}))}/></label><div className="comparison-project-list"><header><span>实验项目</span><b>对照组</b><b>实验组</b></header>{projects.map((project)=><div key={project.id}><span><strong>{project.name}</strong><small>{project.code} · {project.vessel}{project.runs.some((run)=>run.status==="completed")?"":" · 尚无成功分析"}</small></span><button className={form.control_ids.includes(project.id)?"selected control":""} onClick={()=>assign(project.id,"control")}>{form.control_ids.includes(project.id)?"✓":"＋"}</button><button className={form.experimental_ids.includes(project.id)?"selected experimental":""} onClick={()=>assign(project.id,"experimental")}>{form.experimental_ids.includes(project.id)?"✓":"＋"}</button></div>)}</div><div className="comparison-counts"><span>对照组 {form.control_ids.length} 个项目</span><span>实验组 {form.experimental_ids.length} 个项目</span></div><footer className="modal-actions"><button onClick={()=>setEditorOpen(false)}>取消</button><button className="primary" disabled={!form.name.trim()||loading} onClick={()=>void save()}>{loading&&<span className="spinner"/>}保存方案</button></footer></div></Modal>}
    {deleteOpen && selected && <Modal danger title="删除比较方案" description="只删除分组配置，不删除项目、视频或任何 AI 分析结果。" onClose={()=>setDeleteOpen(false)}><div className="delete-confirm"><div className="delete-warning"><Icon name="alert"/><p>确认删除比较方案 <strong>{selected.name}</strong>？</p></div><footer><button onClick={()=>setDeleteOpen(false)}>取消</button><button className="delete-final" disabled={loading} onClick={()=>void remove()}>删除比较方案</button></footer></div></Modal>}
  </div>;
}
