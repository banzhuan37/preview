export type PageKey = "dashboard" | "projects" | "tracking" | "data" | "movement" | "spatial" | "social" | "statistics";

export type ExportKind = "source_video" | "trajectory_video" | "analysis";
export type StoredExportKind = ExportKind | "raw" | "complete";

export interface DataExportInfo {
  project: {
    id: string;
    code: string;
    name: string;
    video_count: number;
    run_count: number;
    completed_run_count: number;
  };
  source_video_bytes: number;
  trajectory_video_bytes: number;
  analysis_data_bytes: number;
  source_video_file_count: number;
  trajectory_video_file_count: number;
  analysis_data_file_count: number;
  missing_videos: string[];
  active_analysis: boolean;
  suggested_names: Record<ExportKind, string>;
}

export interface DataExportRecord {
  id: string;
  project_id: string;
  project_name: string;
  project_code: string;
  kind: StoredExportKind;
  destination: string;
  status: "running" | "completed" | "failed";
  file_count: number;
  size_bytes: number;
  created_at: string;
  completed_at: string;
  error: string;
}

export interface VideoAsset {
  id: string;
  project_id: string;
  path: string;
  name: string;
  sha256: string;
  size_bytes: number;
  width: number;
  height: number;
  fps: number;
  duration_s: number;
  codec: string;
  created_at: string;
}

export interface QualitySummary {
  fixed?: {
    activity_usable_rate?: number;
    per_fly_observed_coverage?: Record<string, number>;
    state_rows?: Record<string, number>;
    rows?: number;
  };
  trajectory_diagnostics?: {
    uncertain_rows?: number;
    uncertain_rate?: number;
    predicted_rows?: number;
    large_jump_count_over_2L?: number;
  };
  mht?: {
    interaction_events?: number;
    uncertain_events?: number;
    committed_events?: number;
  };
  cache_metadata?: {
    frame_count?: number;
    average_fps?: number;
    width?: number;
    height?: number;
  };
}

export interface AnalysisRun {
  id: string;
  project_id: string;
  video_id: string;
  status: "queued" | "running" | "cancelling" | "completed" | "failed" | "cancelled";
  stage: string;
  progress: number;
  message: string;
  error: string;
  output_dir: string;
  tracks_path: string;
  short_video_path: string;
  long_video_path: string;
  summary_path: string;
  model_name: string;
  tracker_name: string;
  queued_at: string;
  started_at: string;
  completed_at: string;
  summary: QualitySummary;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  experiment_date: string;
  purpose: string;
  researcher: string;
  strain: string;
  sex: string;
  age_days: string;
  treatment: string;
  expected_count: number;
  vessel: string;
  notes: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  videos: VideoAsset[];
  runs: AnalysisRun[];
  latest_run: AnalysisRun | null;
}

export interface DashboardData {
  project_count: number;
  video_count: number;
  completed_count: number;
  running_count: number;
  failed_count: number;
  mean_usable_rate: number | null;
  uncertain_rows: number;
  predicted_rows: number;
  storage_bytes: number;
  recent_projects: Project[];
  recent_runs: AnalysisRun[];
  system: {
    model: string;
    tracker: string;
    offline: boolean;
    queue_mode: string;
  };
}

export interface TrackPoint {
  frame_idx: number;
  timestamp_s: number;
  fly_id: number;
  state: string;
  source: string;
  x1: number | null;
  y1: number | null;
  x2: number | null;
  y2: number | null;
  cx: number | null;
  cy: number | null;
  det_conf: number;
  identity_conf: number;
  position_conf: number;
  usable: boolean;
}

export interface TrackPayload {
  run_id: string | null;
  points: TrackPoint[];
  fly_ids: number[];
}

export interface ProjectInput {
  name: string;
  experiment_date: string;
  expected_count: number;
  vessel: string;
  purpose?: string;
  researcher?: string;
  strain?: string;
  sex?: string;
  age_days?: string;
  treatment?: string;
  notes?: string;
  video_path?: string;
}

export interface MetricProfile {
  id: string;
  body_length_px?: number;
  coordinate_unit?: string;
  speed_unit?: string;
  scale_calibrated?: boolean;
  [key: string]: unknown;
}

export interface MovementIndividual {
  fly_id: number;
  total_distance_px: number;
  mean_speed_px_s: number;
  turn_count: number;
  excitability: number;
  rest_ratio: number;
  active_bout_count: number;
  rest_bout_count: number;
  mean_active_bout_s: number;
  mean_rest_bout_s: number;
  valid_time_s: number;
  coverage: number;
  distance_delta_group_px: number;
  speed_delta_group_px_s: number;
}

export interface MovementResponse {
  project: { id: string; name: string };
  run_id: string;
  metric_profile: MetricProfile;
  duration_s: number;
  group: Record<string, number>;
  individuals: MovementIndividual[];
  rhythm: {
    bin_s: number;
    bins: Array<{ start_s: number; end_s: number; rest_ratio: number; low_ratio: number; active_ratio: number; mean_speed_px_s: number }>;
  };
  individual_rhythm: Array<{
    fly_id: number;
    bins: Array<{ start_s: number; end_s: number; rest_ratio: number; low_ratio: number; active_ratio: number; mean_speed_px_s: number }>;
  }>;
}

export interface SpatialResponse {
  project: { id: string; name: string };
  run_id: string;
  metric_profile: MetricProfile & { columns: number; rows: number; hotspot_percentile: number };
  video: { width: number; height: number };
  arena_bounds: { x: number; y: number; width: number; height: number };
  heatmap: { columns: number; rows: number; density: number[]; hotspot_threshold: number };
  hotspots: Array<{ column: number; row: number; density: number; zone: string }>;
  zone_summary: Array<{ zone: string; occupancy: number }>;
  group: { center_ratio: number; hotspot_grid_count: number; top_zone_occupancy: number };
  paths: Array<{ fly_id: number; points: number[][] }>;
}

export interface SocialIndividual {
  fly_id: number;
  approach_count: number;
  departure_count: number;
  contact_count: number;
  following_count: number;
  chasing_count: number;
  mean_pair_distance_bl: number;
  mean_nearest_neighbor_bl: number;
  social_activity_per_min: number;
}

export interface SocialResponse {
  project: { id: string; name: string };
  run_id: string;
  metric_profile: MetricProfile;
  duration_s: number;
  group: Record<string, number>;
  individuals: SocialIndividual[];
  center_series: Array<{ time_s: number; x: number; y: number; dispersion_bl: number }>;
  events: Array<{ type: string; time_s: number; duration_s: number; actors: number[] }>;
}

export interface ComparisonMember {
  project_id: string;
  role: "control" | "experimental";
  name: string;
  code: string;
  vessel: string;
}

export interface Comparison {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  members: ComparisonMember[];
  control_ids: string[];
  experimental_ids: string[];
}

export interface ComparisonStatistics {
  comparison: Comparison;
  metric: { code: string; label: string; unit: string };
  available_metrics: Array<{ code: string; label: string; unit: string }>;
  statistics: {
    control: { n: number; mean: number | null; median: number | null; sd: number | null; ci95: [number | null, number | null] };
    experimental: { n: number; mean: number | null; median: number | null; sd: number | null; ci95: [number | null, number | null] };
    difference: number | null;
    percent_change: number | null;
    inference: { test: string; t: number | null; df: number | null; p_two_sided: number | null; hedges_g: number | null; available: boolean };
    independent_unit: string;
  };
  observations: Array<{ project_id: string; project_name: string; role: "control" | "experimental"; value: number; run_id: string }>;
  skipped: Array<{ project_id: string; project_name: string; reason: string }>;
  prediction_notice: string;
}
