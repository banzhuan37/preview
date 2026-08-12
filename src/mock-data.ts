import type {
  AnalysisRun,
  Comparison,
  ComparisonStatistics,
  MovementResponse,
  Project,
  SocialResponse,
  SpatialResponse,
  TrackPayload,
} from "./types";

const date = "2026-08-11";
const timestamp = "2026-08-11T10:21:36+08:00";
const colors = 10;

function completedRun(projectId: string, videoId: string, suffix: string, usable: number): AnalysisRun {
  return {
    id: `run-${suffix}`,
    project_id: projectId,
    video_id: videoId,
    status: "completed",
    stage: "completed",
    progress: 100,
    message: "AI 预测分析已完成",
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
      fixed: {
        rows: 18130,
        activity_usable_rate: usable,
        state_rows: { ACTIVE: 17470, OCCLUDED: 317, RECOVERING: 219, UNCERTAIN: 124 },
      },
      trajectory_diagnostics: {
        uncertain_rows: 124,
        uncertain_rate: 0.0068,
        predicted_rows: 332,
        large_jump_count_over_2L: 1,
      },
      mht: { interaction_events: 69, uncertain_events: 2, committed_events: 67 },
      cache_metadata: { frame_count: 1813, average_fps: 29.87, width: 1920, height: 1080 },
    },
  };
}

function seedProject({ id, code, name, purpose, count, seconds, bytes, usable, suffix }: {
  id: string;
  code: string;
  name: string;
  purpose: string;
  count: number;
  seconds: number;
  bytes: number;
  usable: number;
  suffix: string;
}): Project {
  const videoId = `video-${suffix}`;
  const run = completedRun(id, videoId, suffix, usable);
  return {
    id,
    code,
    name,
    experiment_date: date,
    purpose,
    researcher: "",
    strain: "",
    sex: "未知",
    age_days: "",
    treatment: "",
    expected_count: count,
    vessel: "培养皿",
    notes: "",
    archived: false,
    created_at: timestamp,
    updated_at: timestamp,
    videos: [{
      id: videoId,
      project_id: id,
      path: `浏览器演示/${name}.MP4`,
      name: `${name}.MP4`,
      sha256: "browser-demo",
      size_bytes: bytes,
      width: 1920,
      height: 1080,
      fps: 29.87,
      duration_s: seconds,
      codec: "h264",
      created_at: timestamp,
    }],
    runs: [run],
    latest_run: run,
  };
}

export const seedProjects: Project[] = [
  seedProject({
    id: "project-testfly10",
    code: "BV-20260811-001",
    name: "testfly10",
    purpose: "10只果蝇一分钟视频 AI 跟踪首期测试",
    count: 10,
    seconds: 60.69,
    bytes: 135797918,
    usable: 0.9635,
    suffix: "testfly10",
  }),
  seedProject({
    id: "project-testfly2",
    code: "BV-20260811-002",
    name: "Testfly2",
    purpose: "测试目的",
    count: 2,
    seconds: 31.19,
    bytes: 69649447,
    usable: 0.9821,
    suffix: "testfly2",
  }),
];

function pseudo(index: number, seed = 1): number {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function movementFor(project: Project, runId: string): MovementResponse {
  const count = project.expected_count;
  const duration = project.videos[0]?.duration_s || 60;
  const individuals = Array.from({ length: count }, (_, index) => {
    const fly = index + 1;
    const distance = 1030 + fly * 84 + pseudo(fly, count) * 430;
    const speed = distance / (duration * (0.76 + pseudo(fly, 4) * 0.18));
    return {
      fly_id: fly,
      total_distance_px: distance,
      mean_speed_px_s: speed,
      turn_count: 12 + Math.round(pseudo(fly, 7) * 18),
      excitability: 0.42 + pseudo(fly, 3) * 0.31,
      rest_ratio: 0.08 + pseudo(fly, 9) * 0.16,
      active_bout_count: 8 + Math.round(pseudo(fly, 11) * 7),
      rest_bout_count: 3 + Math.round(pseudo(fly, 12) * 5),
      mean_active_bout_s: 1.8 + pseudo(fly, 13) * 2.1,
      mean_rest_bout_s: 0.55 + pseudo(fly, 14) * 1.4,
      valid_time_s: duration * (0.89 + pseudo(fly, 15) * 0.08),
      coverage: 0.89 + pseudo(fly, 15) * 0.08,
      distance_delta_group_px: distance - 1540,
      speed_delta_group_px_s: speed - 30,
    };
  });
  const average = (key: keyof typeof individuals[number]) => individuals.reduce((sum, item) => sum + Number(item[key]), 0) / Math.max(individuals.length, 1);
  const bins = Array.from({ length: Math.ceil(duration / 2) }, (_, index) => {
    const active = 0.48 + Math.sin(index / 3) * 0.12 + pseudo(index, count) * 0.08;
    const rest = 0.13 + pseudo(index, 8) * 0.09;
    return { start_s: index * 2, end_s: Math.min(duration, index * 2 + 2), rest_ratio: rest, low_ratio: Math.max(0, 1 - active - rest), active_ratio: active, mean_speed_px_s: 25 + active * 18 + Math.sin(index / 4) * 4 };
  });
  return {
    project: { id: project.id, name: project.name },
    run_id: runId,
    metric_profile: { id: "BV-METRIC-v1.0.0", body_length_px: 32.17, coordinate_unit: "px", speed_unit: "px/s", scale_calibrated: false },
    duration_s: duration,
    group: {
      total_distance_px: average("total_distance_px"),
      mean_speed_px_s: average("mean_speed_px_s"),
      turn_count: average("turn_count"),
      excitability: average("excitability"),
      rest_ratio: average("rest_ratio"),
      active_bout_count: average("active_bout_count"),
      rest_bout_count: average("rest_bout_count"),
      mean_active_bout_s: average("mean_active_bout_s"),
      mean_rest_bout_s: average("mean_rest_bout_s"),
    },
    individuals,
    rhythm: { bin_s: 2, bins },
    individual_rhythm: individuals.map((item) => ({
      fly_id: item.fly_id,
      bins: bins.map((bin, index) => ({ ...bin, mean_speed_px_s: bin.mean_speed_px_s * (0.82 + pseudo(index, item.fly_id) * 0.36) })),
    })),
  };
}

export function spatialFor(project: Project, runId: string): SpatialResponse {
  const columns = 24;
  const rows = 14;
  const density = Array.from({ length: columns * rows }, (_, index) => {
    const x = index % columns;
    const y = Math.floor(index / columns);
    const main = Math.exp(-((x - 8) ** 2 / 28 + (y - 7) ** 2 / 12));
    const second = 0.72 * Math.exp(-((x - 17) ** 2 / 18 + (y - 5) ** 2 / 9));
    return main + second + pseudo(index, project.expected_count) * 0.08;
  });
  const threshold = [...density].sort((a, b) => a - b)[Math.floor(density.length * 0.85)];
  const hotspots = density.map((value, index) => ({ value, index })).filter((item) => item.value >= threshold).map((item) => ({ column: item.index % columns, row: Math.floor(item.index / columns), density: item.value, zone: item.index % columns < 12 ? "左侧中部" : "右侧中部" }));
  const paths = Array.from({ length: project.expected_count }, (_, index) => {
    const fly = index + 1;
    const points = Array.from({ length: 74 }, (_, point) => {
      const angle = point / 5 + fly * 0.62;
      const radius = 150 + 70 * Math.sin(point / 9 + fly);
      return [960 + Math.cos(angle) * radius + Math.sin(point / 3 + fly) * 180, 540 + Math.sin(angle * 0.82) * radius + Math.cos(point / 5 + fly) * 120];
    });
    return { fly_id: fly, points };
  });
  return {
    project: { id: project.id, name: project.name },
    run_id: runId,
    metric_profile: { id: "BV-METRIC-v1.0.0", columns, rows, hotspot_percentile: 0.85, coordinate_unit: "px" },
    video: { width: 1920, height: 1080 },
    arena_bounds: { x: 170, y: 105, width: 1580, height: 870 },
    heatmap: { columns, rows, density, hotspot_threshold: threshold },
    hotspots,
    zone_summary: [
      { zone: "左侧中部", occupancy: 0.273 },
      { zone: "右侧中部", occupancy: 0.219 },
      { zone: "中心区域", occupancy: 0.184 },
      { zone: "左上区域", occupancy: 0.126 },
      { zone: "右下区域", occupancy: 0.108 },
      { zone: "边缘区域", occupancy: 0.09 },
    ],
    group: { center_ratio: 0.184, hotspot_grid_count: hotspots.length, top_zone_occupancy: 0.273 },
    paths,
  };
}

export function socialFor(project: Project, runId: string): SocialResponse {
  const count = project.expected_count;
  const duration = project.videos[0]?.duration_s || 60;
  const individuals = Array.from({ length: count }, (_, index) => ({
    fly_id: index + 1,
    approach_count: 7 + Math.round(pseudo(index, 2) * 11),
    departure_count: 6 + Math.round(pseudo(index, 3) * 10),
    contact_count: 2 + Math.round(pseudo(index, 4) * 7),
    following_count: 1 + Math.round(pseudo(index, 5) * 5),
    chasing_count: Math.round(pseudo(index, 6) * 4),
    mean_pair_distance_bl: 3.1 + pseudo(index, 7) * 1.8,
    mean_nearest_neighbor_bl: 1.4 + pseudo(index, 8) * 1.2,
    social_activity_per_min: 11 + pseudo(index, 9) * 16,
  }));
  const sum = (key: keyof typeof individuals[number]) => individuals.reduce((total, item) => total + Number(item[key]), 0);
  const mean = (key: keyof typeof individuals[number]) => sum(key) / Math.max(individuals.length, 1);
  const eventTypes = ["approach", "departure", "contact", "following", "chasing"];
  const events = Array.from({ length: Math.max(18, count * 7) }, (_, index) => ({
    type: eventTypes[index % eventTypes.length],
    time_s: (index + 1) * duration / Math.max(20, count * 7 + 1),
    duration_s: index % 3 === 0 ? 0 : 0.2 + pseudo(index, count) * 1.2,
    actors: [index % count + 1, (index + 3) % count + 1],
  }));
  const center_series = Array.from({ length: 80 }, (_, index) => ({
    time_s: index * duration / 79,
    x: 930 + Math.sin(index / 8) * 120,
    y: 520 + Math.cos(index / 10) * 80,
    dispersion_bl: 4.1 + Math.sin(index / 7) * 0.9 + pseudo(index, count) * 0.45,
  }));
  return {
    project: { id: project.id, name: project.name },
    run_id: runId,
    metric_profile: { id: "BV-METRIC-v1.0.0", body_length_px: 32.17 },
    duration_s: duration,
    group: {
      mean_pair_distance_bl: mean("mean_pair_distance_bl"),
      approach_count: sum("approach_count"),
      departure_count: sum("departure_count"),
      contact_count: sum("contact_count"),
      following_count: sum("following_count"),
      chasing_count: sum("chasing_count"),
      aggregation_index: 0.42 + count * 0.006,
      mean_dispersion_bl: center_series.reduce((total, item) => total + item.dispersion_bl, 0) / center_series.length,
      max_dispersion_bl: Math.max(...center_series.map((item) => item.dispersion_bl)),
    },
    individuals,
    center_series,
    events,
  };
}

export function tracksFor(project: Project, runId: string): TrackPayload {
  const count = project.expected_count;
  const duration = project.videos[0]?.duration_s || 60;
  const points = Array.from({ length: 130 }, (_, frame) => Array.from({ length: count }, (_, index) => {
    const fly = index + 1;
    const angle = frame / (11 + fly * 0.3) + fly;
    const cx = 960 + Math.cos(angle) * (180 + fly * 21) + Math.sin(frame / 8 + fly) * 90;
    const cy = 540 + Math.sin(angle * 0.91) * (135 + fly * 15) + Math.cos(frame / 9 + fly) * 70;
    const uncertain = frame % (37 + fly) === 0;
    return {
      frame_idx: frame * 14,
      timestamp_s: frame * duration / 129,
      fly_id: fly,
      state: uncertain ? "UNCERTAIN" : "ACTIVE",
      source: uncertain ? "predicted" : "detected",
      x1: cx - 18,
      y1: cy - 13,
      x2: cx + 18,
      y2: cy + 13,
      cx,
      cy,
      det_conf: uncertain ? 0.31 : 0.91,
      identity_conf: uncertain ? 0.48 : 0.93,
      position_conf: uncertain ? 0.61 : 0.95,
      usable: true,
    };
  })).flat();
  return { run_id: runId, points, fly_ids: Array.from({ length: count }, (_, index) => index + 1) };
}

export const seedComparisons: Comparison[] = [{
  id: "comparison-demo",
  name: "对照组 vs 实验组",
  created_at: timestamp,
  updated_at: timestamp,
  members: [
    { project_id: seedProjects[1].id, role: "control", name: seedProjects[1].name, code: seedProjects[1].code, vessel: seedProjects[1].vessel },
    { project_id: seedProjects[0].id, role: "experimental", name: seedProjects[0].name, code: seedProjects[0].code, vessel: seedProjects[0].vessel },
  ],
  control_ids: [seedProjects[1].id],
  experimental_ids: [seedProjects[0].id],
}];

export const availableMetrics = [
  { code: "mean_speed_px_s", label: "平均速度", unit: "px/s" },
  { code: "total_distance_px", label: "运动总距离", unit: "px" },
  { code: "turn_count", label: "转向次数", unit: "次" },
  { code: "excitability", label: "兴奋度（活跃时间指数）", unit: "%" },
  { code: "rest_ratio", label: "休息不动时间占比", unit: "%" },
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

export function statisticsFor(comparison: Comparison, metricCode: string, projects: Project[]): ComparisonStatistics {
  const metric = availableMetrics.find((item) => item.code === metricCode) || availableMetrics[0];
  const valueFor = (project: Project) => {
    const runId = project.runs.find((run) => run.status === "completed")?.id || "";
    const movement = movementFor(project, runId);
    const spatial = spatialFor(project, runId);
    const social = socialFor(project, runId);
    const values: Record<string, number> = {
      mean_speed_px_s: movement.group.mean_speed_px_s,
      total_distance_px: movement.group.total_distance_px,
      turn_count: movement.group.turn_count,
      excitability: movement.group.excitability,
      rest_ratio: movement.group.rest_ratio,
      active_bout_count: movement.group.active_bout_count,
      mean_active_bout_s: movement.group.mean_active_bout_s,
      center_ratio: spatial.group.center_ratio,
      top_zone_occupancy: spatial.group.top_zone_occupancy,
      mean_pair_distance_bl: social.group.mean_pair_distance_bl,
      aggregation_index: social.group.aggregation_index,
      mean_dispersion_bl: social.group.mean_dispersion_bl,
      contact_per_min: social.group.contact_count / social.duration_s * 60,
      following_per_min: social.group.following_count / social.duration_s * 60,
      chasing_per_min: social.group.chasing_count / social.duration_s * 60,
    };
    return values[metric.code] ?? 0;
  };
  const observations = comparison.members.flatMap((member) => {
    const project = projects.find((item) => item.id === member.project_id);
    if (!project || !project.runs.some((run) => run.status === "completed")) return [];
    return [{ project_id: project.id, project_name: project.name, role: member.role, value: valueFor(project), run_id: project.runs[0].id }];
  });
  const values = (role: "control" | "experimental") => observations.filter((item) => item.role === role).map((item) => item.value);
  const summary = (rows: number[]) => {
    const mean = rows.length ? rows.reduce((sum, value) => sum + value, 0) / rows.length : null;
    return { n: rows.length, mean, median: mean, sd: rows.length > 1 ? 0 : null, ci95: [mean, mean] as [number | null, number | null] };
  };
  const control = summary(values("control"));
  const experimental = summary(values("experimental"));
  const difference = control.mean == null || experimental.mean == null ? null : experimental.mean - control.mean;
  return {
    comparison,
    metric,
    available_metrics: availableMetrics,
    statistics: {
      control,
      experimental,
      difference,
      percent_change: difference == null || !control.mean ? null : difference / control.mean,
      inference: { test: "Welch t-test", t: null, df: null, p_two_sided: null, hedges_g: null, available: false },
      independent_unit: "project_vessel",
    },
    observations,
    skipped: comparison.members.filter((member) => !observations.some((item) => item.project_id === member.project_id)).map((member) => ({ project_id: member.project_id, project_name: member.name, reason: "尚无已完成的 AI 预测分析" })),
    prediction_notice: "组间结果基于 AI 预测轨迹；项目/培养皿作为独立实验单位。",
  };
}
