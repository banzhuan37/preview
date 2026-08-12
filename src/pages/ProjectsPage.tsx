import { useMemo, useState } from "react";
import { chooseVideoPath, formatBytes, formatDateTime, formatDuration } from "../api";
import { Icon } from "../icons";
import { Modal } from "../components/Modal";
import { isActiveRun, preferredRun } from "../run-utils";
import type { AnalysisRun, PageKey, Project, ProjectInput } from "../types";

const emptyForm: ProjectInput = {
  name: "",
  experiment_date: "2026-08-11",
  expected_count: 10,
  vessel: "培养皿",
  purpose: "",
  researcher: "",
  strain: "",
  sex: "未知",
  age_days: "",
  treatment: "",
  notes: "",
  video_path: "",
};

function runLabel(run: AnalysisRun | null, hasVideo = true): [string, string] {
  if (!run) return [hasVideo ? "可开始分析" : "待导入视频", "neutral"];
  if (run.status === "completed") return ["AI 分析完成", "success"];
  if (["running", "queued", "cancelling"].includes(run.status)) return [run.message || "AI 分析中", "running"];
  if (run.status === "cancelled") return ["分析已取消", "neutral"];
  return ["分析失败", "danger"];
}

export function ProjectsPage({
  projects,
  selectedId,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  onAddVideo,
  onAnalyze,
  onNavigate,
  busy,
}: {
  projects: Project[];
  selectedId: string | null;
  onSelect: (project: Project) => void;
  onCreate: (input: ProjectInput) => Promise<void>;
  onUpdate: (id: string, input: Partial<ProjectInput> & { archived?: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddVideo: (id: string, path: string) => Promise<void>;
  onAnalyze: (project: Project) => Promise<void>;
  onNavigate: (page: PageKey) => void;
  busy: boolean;
}) {
  const [search, setSearch] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteName, setDeleteName] = useState("");
  const [form, setForm] = useState<ProjectInput>(emptyForm);
  const selected = projects.find((project) => project.id === selectedId) || null;
  const selectedRun = preferredRun(selected);
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((project) => `${project.name} ${project.code} ${project.strain} ${project.treatment}`.toLowerCase().includes(term));
  }, [projects, search]);

  const updateField = (key: keyof ProjectInput, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const openEdit = () => {
    if (!selected) return;
    setForm({
      name: selected.name,
      experiment_date: selected.experiment_date,
      expected_count: selected.expected_count,
      vessel: selected.vessel,
      purpose: selected.purpose,
      researcher: selected.researcher,
      strain: selected.strain,
      sex: selected.sex,
      age_days: selected.age_days,
      treatment: selected.treatment,
      notes: selected.notes,
    });
    setEditOpen(true);
  };
  const chooseVideo = async () => {
    const path = await chooseVideoPath();
    if (path) updateField("video_path", path);
  };

  return <div className="page projects-page">
    <div className="page-header">
      <div><span className="eyebrow">EXPERIMENT PROJECTS</span><h1>实验项目</h1><p>登记实验信息、引用源视频并管理 AI 预测分析运行。</p></div>
      <div className="header-actions"><span className="offline-pill"><i/>源视频仅引用，不复制</span><button className="primary" onClick={() => { setForm(emptyForm); setNewOpen(true); }}><Icon name="plus"/>新建实验</button></div>
    </div>
    <div className="project-toolbar">
      <label className="search-box"><Icon name="search"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索项目名称、编号、品系或处理条件"/></label>
      <div><span>共 {projects.length} 个项目</span><button onClick={() => setSearch("")}><Icon name="refresh"/>重置筛选</button></div>
    </div>
    <div className="projects-layout">
      <section className="project-grid">
        {visible.map((project, index) => {
          const displayRun = preferredRun(project);
          const [label, tone] = runLabel(displayRun, project.videos.length > 0);
          const video = project.videos[0];
          return <article key={project.id} className={`project-card ${selectedId === project.id ? "selected" : ""}`} onClick={() => onSelect(project)}>
            <header><span className={`project-mark tone-${index % 4}`}>{project.name.slice(0, 2).toUpperCase()}</span><span className={`status ${tone}`}>{label}</span></header>
            <h2>{project.name}</h2><p>{project.purpose || "尚未填写研究目的"}</p>
            <div className="tag-row"><span>{project.expected_count} 只果蝇</span><span>{project.vessel}</span>{project.strain && <span>{project.strain}</span>}</div>
            {isActiveRun(displayRun) && <div className="mini-progress"><span style={{ width: `${displayRun.progress}%` }}/><small>{Math.round(displayRun.progress)}%</small></div>}
            <footer><span>{project.code}</span><span>{video ? `${formatDuration(video.duration_s)} · ${video.width}×${video.height}` : "无视频"}</span><time>{project.experiment_date}</time></footer>
          </article>;
        })}
        {!visible.length && <div className="empty-panel"><Icon name="folder"/><h2>没有匹配的实验项目</h2><p>调整搜索条件或新建实验。</p></div>}
      </section>
      <aside className={`project-detail ${selected ? "open" : ""}`}>
        {selected ? <>
          <div className="detail-hero"><span className="detail-icon"><Icon name="folder"/></span><div><small>{selected.code}</small><h2>{selected.name}</h2><p>{selected.purpose || "未填写研究目的"}</p></div><button onClick={() => onSelect(selected)} aria-label="关闭"><Icon name="x"/></button></div>
          <div className="detail-actions"><button onClick={openEdit}><Icon name="edit"/>编辑</button><button onClick={() => onUpdate(selected.id, { archived: true })}><Icon name="archive"/>归档</button><button className="danger-button" onClick={() => { setDeleteName(""); setDeleteOpen(true); }}><Icon name="trash"/>永久删除</button></div>
          <section className="detail-section"><header><h3>实验信息</h3><span>{selected.experiment_date}</span></header><dl>
            <div><dt>预期果蝇</dt><dd>{selected.expected_count} 只</dd></div><div><dt>观察器皿</dt><dd>{selected.vessel}</dd></div>
            <div><dt>研究员</dt><dd>{selected.researcher || "未填写"}</dd></div><div><dt>品系</dt><dd>{selected.strain || "未填写"}</dd></div>
            <div><dt>性别 / 日龄</dt><dd>{selected.sex || "未知"}{selected.age_days ? ` · ${selected.age_days} 天` : ""}</dd></div><div><dt>处理条件</dt><dd>{selected.treatment || "未填写"}</dd></div>
          </dl></section>
          <section className="detail-section video-section"><header><div><h3>引用视频</h3><p>源文件保留在原位置</p></div>{selected.videos.length > 0 && <button onClick={async () => { const path = await chooseVideoPath(); if (path) await onAddVideo(selected.id, path); }}><Icon name="plus"/>添加</button>}</header>
            {selected.videos.length ? selected.videos.map((video) => <div className="video-file" key={video.id}><span><Icon name="video"/></span><div><strong title={video.path}>{video.name}</strong><small>{video.codec.toUpperCase()} · {video.width}×{video.height} · {video.fps.toFixed(2)} FPS</small><em>{video.path}</em></div><b>{formatBytes(video.size_bytes)}</b></div>) : <button className="video-empty" onClick={async () => { const path = await chooseVideoPath(); if (path) await onAddVideo(selected.id, path); }}><Icon name="video"/><strong>选择本地视频</strong><span>仅保存路径引用，不复制文件</span></button>}
          </section>
          <section className="detail-section run-section"><header><div><h3>AI 分析</h3><p>128011s-best.pt · MHT v3</p></div><span className="ai-badge"><i/>AI PREDICTION</span></header>
            {selectedRun ? <><div className="run-status"><div><span className={`run-symbol ${selectedRun.status}`}><Icon name={selectedRun.status === "completed" ? "check" : selectedRun.status === "failed" ? "alert" : "activity"}/></span><div><strong>{runLabel(selectedRun)[0]}</strong><small>{selectedRun.message}</small></div><b>{Math.round(selectedRun.progress)}%</b></div><div className="run-progress"><span style={{ width: `${selectedRun.progress}%` }}/></div><footer><span>运行时间 {formatDateTime(selectedRun.queued_at)}</span><button onClick={() => onNavigate("tracking")}>打开轨迹工作台 <Icon name="chevron"/></button></footer></div>{selected.runs.length > 1 && <div className="run-count"><Icon name="clock"/>已保留 {selected.runs.length} 次分析运行，可在轨迹工作台切换</div>}</> : <div className="run-empty"><Icon name="target"/><p>尚未运行 AI 预测分析</p></div>}
            <button className="start-analysis" disabled={busy || !selected.videos.length || selected.runs.some(isActiveRun)} onClick={() => onAnalyze(selected)}>{busy ? <span className="spinner"/> : <Icon name="activity"/>}{selected.runs.some((run) => run.status === "completed") ? "重新运行 AI 分析" : "开始 AI 分析"}</button>
            <p className="prediction-note"><Icon name="alert"/>分析结果是模型预测值，不代表人工确认的真实身份。</p>
          </section>
        </> : <div className="detail-empty"><Icon name="folder"/><h2>选择一个实验项目</h2><p>查看视频、分析运行和预测轨迹。</p></div>}
      </aside>
    </div>

    {newOpen && <Modal title="新建实验项目" description="创建项目并引用本地果蝇视频。" onClose={() => setNewOpen(false)}>
      <ProjectForm form={form} onField={updateField} onChooseVideo={chooseVideo} onCancel={() => setNewOpen(false)} submitLabel="创建实验" busy={busy} onSubmit={async () => { await onCreate(form); setNewOpen(false); }}/>
    </Modal>}
    {editOpen && selected && <Modal title="编辑实验项目" description={`修改 ${selected.name} 的实验信息。`} onClose={() => setEditOpen(false)}>
      <ProjectForm form={form} onField={updateField} onCancel={() => setEditOpen(false)} submitLabel="保存修改" busy={busy} onSubmit={async () => { await onUpdate(selected.id, form); setEditOpen(false); }}/>
    </Modal>}
    {deleteOpen && selected && <Modal danger title="永久删除项目" description="此操作将删除项目、分析运行和派生文件，但不会删除外部源视频。" onClose={() => setDeleteOpen(false)}>
      <div className="delete-confirm"><div className="delete-warning"><Icon name="alert"/><p>请输入项目名称 <strong>{selected.name}</strong> 以确认永久删除。</p></div><label><span>项目名称</span><input autoFocus value={deleteName} onChange={(event) => setDeleteName(event.target.value)} placeholder={selected.name}/></label><footer><button onClick={() => setDeleteOpen(false)}>取消</button><button className="delete-final" disabled={deleteName !== selected.name || busy} onClick={async () => { await onDelete(selected.id); setDeleteOpen(false); }}>永久删除项目</button></footer></div>
    </Modal>}
  </div>;
}

function ProjectForm({ form, onField, onChooseVideo, onCancel, onSubmit, submitLabel, busy }: {
  form: ProjectInput;
  onField: (key: keyof ProjectInput, value: string | number) => void;
  onChooseVideo?: () => void;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
  submitLabel: string;
  busy: boolean;
}) {
  return <form className="project-form" onSubmit={(event) => { event.preventDefault(); void onSubmit(); }}>
    <div className="form-grid">
      <label><span>项目名称 <b>*</b></span><input required value={form.name} onChange={(event) => onField("name", event.target.value)} placeholder="例如：testfly10"/></label>
      <label><span>实验日期 <b>*</b></span><input required type="date" value={form.experiment_date} onChange={(event) => onField("experiment_date", event.target.value)}/></label>
      <label><span>预期果蝇数量 <b>*</b></span><input required min="1" type="number" value={form.expected_count} onChange={(event) => onField("expected_count", Number(event.target.value))}/></label>
      <label><span>观察器皿 <b>*</b></span><input required value={form.vessel} onChange={(event) => onField("vessel", event.target.value)} placeholder="例如：培养皿"/></label>
      <label><span>研究员</span><input value={form.researcher} onChange={(event) => onField("researcher", event.target.value)}/></label>
      <label><span>果蝇品系</span><input value={form.strain} onChange={(event) => onField("strain", event.target.value)}/></label>
      <label><span>性别</span><select value={form.sex} onChange={(event) => onField("sex", event.target.value)}><option>未知</option><option>雄</option><option>雌</option><option>混合</option></select></label>
      <label><span>日龄</span><input type="number" min="0" value={form.age_days} onChange={(event) => onField("age_days", event.target.value)} placeholder="天"/></label>
      <label className="span-2"><span>处理条件</span><input value={form.treatment} onChange={(event) => onField("treatment", event.target.value)} placeholder="例如：对照组、光照刺激"/></label>
      <label className="span-2"><span>研究目的</span><textarea value={form.purpose} onChange={(event) => onField("purpose", event.target.value)} placeholder="简要说明本实验的研究目的"/></label>
      {onChooseVideo && <label className="span-2"><span>引用视频</span><div className="path-picker"><input value={form.video_path || ""} onChange={(event) => onField("video_path", event.target.value)} placeholder="选择本地视频，不会复制文件"/><button type="button" onClick={onChooseVideo}><Icon name="folder"/>选择</button></div><small>源视频移动或删除后，项目中的引用将失效。</small></label>}
    </div>
    <footer className="modal-actions"><button type="button" onClick={onCancel}>取消</button><button className="primary" disabled={busy} type="submit">{busy && <span className="spinner"/>}{submitLabel}</button></footer>
  </form>;
}
