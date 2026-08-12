import {
  movementFor,
  seedComparisons,
  seedProjects,
  socialFor,
  spatialFor,
  statisticsFor,
  tracksFor,
} from "./mock-data";
import type {
  AnalysisRun,
  Comparison,
  DataExportInfo,
  DataExportRecord,
  DashboardData,
  ExportKind,
  MovementResponse,
  Project,
  ProjectInput,
  SocialResponse,
  SpatialResponse,
  TrackPayload,
} from "./types";

type DemoState = {
  version: 1;
  projects: Project[];
  comparisons: Comparison[];
  exports: DataExportRecord[];
};

const STORAGE_KEY = "biovision-web-demo-v1";
const uploadedMedia = new Map<string, string>();
let pendingVideo: { name: string; url: string; size: number } | null = null;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const delay = (duration = 80) => new Promise((resolve) => window.setTimeout(resolve, duration));
const uniqueId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

function initialState(): DemoState {
  return { version: 1, projects: clone(seedProjects), comparisons: clone(seedComparisons), exports: [] };
}

function loadState(): DemoState {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState();
    const parsed = JSON.parse(stored) as DemoState;
    return parsed.version === 1 && Array.isArray(parsed.projects) ? parsed : initialState();
  } catch {
    return initialState();
  }
}

function saveState(state: DemoState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function requireProject(state: DemoState, projectId: string): Project {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) throw new Error("项目不存在");
  return project;
}

function completedRun(project: Project, runId?: string): AnalysisRun {
  const run = runId
    ? project.runs.find((item) => item.id === runId)
    : project.runs.find((item) => item.status === "completed");
  if (!run || run.status !== "completed") throw new Error("所选实验尚无已完成的 AI 预测分析");
  return run;
}

function dashboard(state: DemoState): DashboardData {
  const projects = state.projects.filter((project) => !project.archived);
  const runs = projects.flatMap((project) => project.runs);
  const completed = runs.filter((run) => run.status === "completed");
  const usable = completed.flatMap((run) => run.summary.fixed?.activity_usable_rate == null ? [] : [run.summary.fixed.activity_usable_rate]);
  return {
    project_count: projects.length,
    video_count: projects.reduce((sum, project) => sum + project.videos.length, 0),
    completed_count: completed.length,
    running_count: runs.filter((run) => ["queued", "running", "cancelling"].includes(run.status)).length,
    failed_count: runs.filter((run) => run.status === "failed").length,
    mean_usable_rate: usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : null,
    uncertain_rows: completed.reduce((sum, run) => sum + (run.summary.trajectory_diagnostics?.uncertain_rows || 0), 0),
    predicted_rows: completed.reduce((sum, run) => sum + (run.summary.trajectory_diagnostics?.predicted_rows || 0), 0),
    storage_bytes: 1287426624,
    recent_projects: projects.slice(0, 4),
    recent_runs: runs.slice(0, 5),
    system: { model: "128011s-best.pt", tracker: "mht_v3", offline: true, queue_mode: "single_worker" },
  };
}

function baseVideo(project: Project, name: string, size = 7340032) {
  return {
    id: uniqueId("video"),
    project_id: project.id,
    path: `浏览器上传/${name}`,
    name,
    sha256: "browser-session",
    size_bytes: size,
    width: 1920,
    height: 1080,
    fps: 29.87,
    duration_s: 60.69,
    codec: "h264",
    created_at: now(),
  };
}

function makeRun(project: Project): AnalysisRun {
  const timestamp = now();
  const video = project.videos[0];
  return {
    id: uniqueId("run"),
    project_id: project.id,
    video_id: video?.id || "",
    status: "completed",
    stage: "completed",
    progress: 100,
    message: "浏览器演示分析已完成",
    error: "",
    output_dir: "browser-demo",
    tracks_path: "browser-demo/tracks.csv",
    short_video_path: "browser-demo/tracking_short.mp4",
    long_video_path: "browser-demo/tracking_long.mp4",
    summary_path: "browser-demo/summary.json",
    model_name: "128011s-best.pt",
    tracker_name: "mht_v3",
    queued_at: timestamp,
    started_at: timestamp,
    completed_at: timestamp,
    summary: {
      fixed: { rows: project.expected_count * 1813, activity_usable_rate: 0.958, state_rows: { ACTIVE: 17204, OCCLUDED: 392, RECOVERING: 298, UNCERTAIN: 236 } },
      trajectory_diagnostics: { uncertain_rows: 236, uncertain_rate: 0.013, predicted_rows: 428, large_jump_count_over_2L: 2 },
      mht: { interaction_events: 57, uncertain_events: 3, committed_events: 54 },
      cache_metadata: { frame_count: 1813, average_fps: 29.87, width: 1920, height: 1080 },
    },
  };
}

export const api = {
  async health() {
    await delay(30);
    return { status: "ok", model_ready: true, tracker_ready: true };
  },
  async dashboard() {
    await delay();
    return clone(dashboard(loadState()));
  },
  async projects() {
    await delay();
    return clone(loadState().projects.filter((project) => !project.archived));
  },
  async project(id: string) {
    await delay();
    return clone(requireProject(loadState(), id));
  },
  async createProject(input: ProjectInput) {
    const state = loadState();
    const timestamp = now();
    const project: Project = {
      id: uniqueId("project"),
      code: `BV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(state.projects.length + 1).padStart(3, "0")}`,
      name: input.name.trim(),
      experiment_date: input.experiment_date,
      purpose: input.purpose || "",
      researcher: input.researcher || "",
      strain: input.strain || "",
      sex: input.sex || "未知",
      age_days: input.age_days || "",
      treatment: input.treatment || "",
      expected_count: Number(input.expected_count),
      vessel: input.vessel,
      notes: input.notes || "",
      archived: false,
      created_at: timestamp,
      updated_at: timestamp,
      videos: [],
      runs: [],
      latest_run: null,
    };
    if (input.video_path) {
      project.videos.push(baseVideo(project, pendingVideo?.name || input.video_path.split(/[\\/]/).at(-1) || "experiment.mp4", pendingVideo?.size ?? 7340032));
      if (pendingVideo) uploadedMedia.set(project.id, pendingVideo.url);
      pendingVideo = null;
    }
    state.projects.unshift(project);
    saveState(state);
    await delay(160);
    return clone(project);
  },
  async updateProject(id: string, input: Partial<ProjectInput> & { archived?: boolean }) {
    const state = loadState();
    const project = requireProject(state, id);
    Object.assign(project, input, { updated_at: now() });
    saveState(state);
    await delay();
    return clone(project);
  },
  async deleteProject(id: string) {
    const state = loadState();
    state.projects = state.projects.filter((project) => project.id !== id);
    state.comparisons = state.comparisons.map((comparison) => ({
      ...comparison,
      members: comparison.members.filter((member) => member.project_id !== id),
      control_ids: comparison.control_ids.filter((projectId) => projectId !== id),
      experimental_ids: comparison.experimental_ids.filter((projectId) => projectId !== id),
    }));
    saveState(state);
    await delay();
    return { deleted: true };
  },
  async addVideo(id: string, path: string) {
    const state = loadState();
    const project = requireProject(state, id);
    const name = pendingVideo?.name || path.split(/[\\/]/).at(-1) || "experiment.mp4";
    const video = baseVideo(project, name, pendingVideo?.size ?? 7340032);
    project.videos.push(video);
    project.updated_at = now();
    if (pendingVideo) uploadedMedia.set(project.id, pendingVideo.url);
    pendingVideo = null;
    saveState(state);
    await delay();
    return clone(video);
  },
  async analyze(id: string, _videoId?: string) {
    const state = loadState();
    const project = requireProject(state, id);
    if (!project.videos.length) throw new Error("请先选择实验视频");
    await delay(380);
    const run = makeRun(project);
    project.runs.unshift(run);
    project.latest_run = run;
    project.updated_at = now();
    saveState(state);
    return clone(run);
  },
  async cancelRun(id: string) {
    const state = loadState();
    const run = state.projects.flatMap((project) => project.runs).find((item) => item.id === id);
    if (!run) throw new Error("分析运行不存在");
    run.status = "cancelled";
    run.message = "任务已取消";
    saveState(state);
    await delay();
    return clone(run);
  },
  async tracks(projectId: string, runId?: string): Promise<TrackPayload> {
    const project = requireProject(loadState(), projectId);
    const run = completedRun(project, runId);
    await delay(180);
    return tracksFor(project, run.id);
  },
  async movement(projectId: string, runId?: string): Promise<MovementResponse> {
    const project = requireProject(loadState(), projectId);
    const run = completedRun(project, runId);
    await delay(140);
    return movementFor(project, run.id);
  },
  async spatial(projectId: string, runId?: string): Promise<SpatialResponse> {
    const project = requireProject(loadState(), projectId);
    const run = completedRun(project, runId);
    await delay(140);
    return spatialFor(project, run.id);
  },
  async social(projectId: string, runId?: string): Promise<SocialResponse> {
    const project = requireProject(loadState(), projectId);
    const run = completedRun(project, runId);
    await delay(140);
    return socialFor(project, run.id);
  },
  async exportInfo(projectId: string): Promise<DataExportInfo> {
    const project = requireProject(loadState(), projectId);
    const completed = project.runs.filter((run) => run.status === "completed").length;
    await delay();
    return {
      project: { id: project.id, code: project.code, name: project.name, video_count: project.videos.length, run_count: project.runs.length, completed_run_count: completed },
      source_video_bytes: project.videos.reduce((sum, video) => sum + video.size_bytes, 0),
      trajectory_video_bytes: completed * 21874256,
      analysis_data_bytes: completed * 18432000,
      source_video_file_count: project.videos.length,
      trajectory_video_file_count: completed * 2,
      analysis_data_file_count: completed * 9,
      missing_videos: [],
      active_analysis: project.runs.some((run) => ["queued", "running", "cancelling"].includes(run.status)),
      suggested_names: {
        source_video: `${project.code}_${project.name}_原视频.zip`,
        trajectory_video: `${project.code}_${project.name}_轨迹视频.zip`,
        analysis: `${project.code}_${project.name}_分析数据.zip`,
      },
    };
  },
  async exports(projectId?: string) {
    await delay();
    return clone(loadState().exports.filter((record) => !projectId || record.project_id === projectId));
  },
  async createExport(payload: { project_id: string; kind: ExportKind; destination: string }) {
    const state = loadState();
    const project = requireProject(state, payload.project_id);
    const manifest = JSON.stringify({
      product: "BioVision Web Preview",
      project: { code: project.code, name: project.name, vessel: project.vessel },
      export_kind: payload.kind,
      generated_at: now(),
      notice: "浏览器演示导出仅包含示例清单，不含用户本地视频或真实 AI 结果。",
    }, null, 2);
    downloadZip(payload.destination, "manifest.json", manifest);
    const record: DataExportRecord = {
      id: uniqueId("export"),
      project_id: project.id,
      project_name: project.name,
      project_code: project.code,
      kind: payload.kind,
      destination: payload.destination,
      status: "completed",
      file_count: 1,
      size_bytes: new TextEncoder().encode(manifest).length,
      created_at: now(),
      completed_at: now(),
      error: "",
    };
    state.exports.unshift(record);
    saveState(state);
    await delay();
    return clone(record);
  },
  async comparisons() {
    await delay();
    return clone(loadState().comparisons);
  },
  async createComparison(payload: { name: string; control_ids: string[]; experimental_ids: string[] }) {
    const state = loadState();
    const comparison = comparisonFromPayload(uniqueId("comparison"), payload, state.projects);
    state.comparisons.unshift(comparison);
    saveState(state);
    await delay();
    return clone(comparison);
  },
  async updateComparison(id: string, payload: { name: string; control_ids: string[]; experimental_ids: string[] }) {
    const state = loadState();
    const index = state.comparisons.findIndex((comparison) => comparison.id === id);
    if (index < 0) throw new Error("组间比较不存在");
    state.comparisons[index] = comparisonFromPayload(id, payload, state.projects, state.comparisons[index].created_at);
    saveState(state);
    await delay();
    return clone(state.comparisons[index]);
  },
  async deleteComparison(id: string) {
    const state = loadState();
    state.comparisons = state.comparisons.filter((comparison) => comparison.id !== id);
    saveState(state);
    await delay();
    return { deleted: true };
  },
  async comparisonStatistics(id: string, metric: string) {
    const state = loadState();
    const comparison = state.comparisons.find((item) => item.id === id);
    if (!comparison) throw new Error("组间比较不存在");
    await delay(140);
    return statisticsFor(comparison, metric, state.projects);
  },
  mediaUrl(projectId: string, _kind?: "source" | "short" | "long" | "manifest", _runId?: string) {
    return uploadedMedia.get(projectId) || `${import.meta.env.BASE_URL}tracking-demo.mp4`;
  },
};

function comparisonFromPayload(id: string, payload: { name: string; control_ids: string[]; experimental_ids: string[] }, projects: Project[], createdAt = now()): Comparison {
  const members = [...payload.control_ids.map((projectId) => ({ projectId, role: "control" as const })), ...payload.experimental_ids.map((projectId) => ({ projectId, role: "experimental" as const }))]
    .flatMap(({ projectId, role }) => {
      const project = projects.find((item) => item.id === projectId);
      return project ? [{ project_id: project.id, role, name: project.name, code: project.code, vessel: project.vessel }] : [];
    });
  return { id, name: payload.name.trim(), created_at: createdAt, updated_at: now(), members, control_ids: [...payload.control_ids], experimental_ids: [...payload.experimental_ids] };
}

export async function chooseVideoPath(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/mp4,video/quicktime,video/x-msvideo,video/x-matroska";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      pendingVideo = { name: file.name, url: URL.createObjectURL(file), size: file.size };
      resolve(file.name);
    };
    input.click();
  });
}

export async function chooseExportPath(suggestedName: string): Promise<string | null> {
  return suggestedName;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(safe / 60);
  return `${String(minutes).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function formatDateTime(value: string): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function downloadZip(zipName: string, entryName: string, content: string): void {
  const encoder = new TextEncoder();
  const name = encoder.encode(entryName);
  const data = encoder.encode(content);
  const checksum = crc32(data);
  const local = new Uint8Array(30 + name.length + data.length);
  const localView = new DataView(local.buffer);
  localView.setUint32(0, 0x04034b50, true);
  localView.setUint16(4, 20, true);
  localView.setUint16(6, 0x0800, true);
  localView.setUint32(14, checksum, true);
  localView.setUint32(18, data.length, true);
  localView.setUint32(22, data.length, true);
  localView.setUint16(26, name.length, true);
  local.set(name, 30);
  local.set(data, 30 + name.length);

  const central = new Uint8Array(46 + name.length);
  const centralView = new DataView(central.buffer);
  centralView.setUint32(0, 0x02014b50, true);
  centralView.setUint16(4, 20, true);
  centralView.setUint16(6, 20, true);
  centralView.setUint16(8, 0x0800, true);
  centralView.setUint32(16, checksum, true);
  centralView.setUint32(20, data.length, true);
  centralView.setUint32(24, data.length, true);
  centralView.setUint16(28, name.length, true);
  central.set(name, 46);

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, 1, true);
  endView.setUint16(10, 1, true);
  endView.setUint32(12, central.length, true);
  endView.setUint32(16, local.length, true);

  const blob = new Blob([local, central, end], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = zipName.endsWith(".zip") ? zipName : `${zipName}.zip`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
