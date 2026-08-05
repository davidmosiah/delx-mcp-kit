/**
 * Shared agent-safe-series/v1 contract types for Delx wellness MCP servers.
 * Implementation remains per-connector; this package freezes the envelope.
 */
export const SERIES_CONTRACT_VERSION = "agent-safe-series/v1" as const;
export const SERIES_HARD_MAX_POINTS = 500;
export const SERIES_DEFAULT_MAX_POINTS = 400;

export type ReferenceSource = "caller_provided" | "activity_recorded_max" | "observed_max";
export type CoverageAnchor = "nominal_duration" | "sample_span";

export type AgentSafeSeriesPoint = {
  t: number;
  value: number;
  min: number;
  max: number;
  samples: number;
};

export type AgentSafeSeries = {
  contract_version: typeof SERIES_CONTRACT_VERSION;
  activity_id: string | number;
  metric: string;
  unit: string;
  start_time?: string;
  t_unit: "seconds_from_start";
  resolution_seconds: number;
  requested_resolution_seconds: number;
  points: AgentSafeSeriesPoint[];
  stats: {
    avg: number; min: number; max: number; p25: number; p50: number; p75: number;
    percentile_method: "linear_interpolation";
  };
  time_in_zone?: {
    zone_model: "percent_of_reference_max_hr";
    reference_max_hr: number;
    reference_source: ReferenceSource;
    zones: Array<{ zone: number; min_bpm: number; max_bpm: number | null; seconds: number; percent: number }>;
  };
  downsampled: boolean;
  source_points: number;
  returned_points: number;
  method: "time_bucket_mean" | "none";
  data_quality: {
    expected_samples: number;
    actual_samples: number;
    coverage_ratio: number;
    longest_gap_seconds: number;
    sample_interval_seconds: number;
    coverage_anchor: CoverageAnchor;
  };
  notes: string[];
};

/** Assert hard caps used by connectors. */
export function clampMaxPoints(maxPoints: number): number {
  const n = Math.trunc(maxPoints);
  if (!Number.isFinite(n) || n < 1) return SERIES_DEFAULT_MAX_POINTS;
  return Math.min(n, SERIES_HARD_MAX_POINTS);
}
