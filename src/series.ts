/**
 * Shared agent-safe-series/v1 contract types for Delx wellness MCP servers.
 * Provider-specific shaping (Garmin descriptors, Strava streams, …) stays in
 * each connector. This package freezes the envelope and the hard caps.
 *
 * Canonical narrative: https://github.com/davidmosiah/delx-wellness/blob/main/docs/agent-safe-series.md
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

/**
 * Connector-owned fields. `contract_version`, `t_unit`, `returned_points`, and
 * `percentile_method` are stamped here so a caller cannot emit a different
 * contract string by accident.
 */
export type BuildAgentSafeSeriesInput = Omit<
  AgentSafeSeries,
  "contract_version" | "t_unit" | "returned_points" | "stats"
> & {
  returned_points?: number;
  stats: Omit<AgentSafeSeries["stats"], "percentile_method"> & {
    percentile_method?: "linear_interpolation";
  };
};

/** GPS/map streams stay behind privacy escalation on a details tool, never here. */
const FORBIDDEN_SERIES_METRIC = /gps|gpx|latlng|latitude|longitude|polyline/i;

/** Assert hard caps used by connectors. */
export function clampMaxPoints(maxPoints: number): number {
  const n = Math.trunc(maxPoints);
  if (!Number.isFinite(n) || n < 1) return SERIES_DEFAULT_MAX_POINTS;
  return Math.min(n, SERIES_HARD_MAX_POINTS);
}

/**
 * Stamp a frozen v1 envelope after the connector has shaped `points`.
 * Does not downsample — rejecting an over-budget array is the point.
 */
export function buildAgentSafeSeries(input: BuildAgentSafeSeriesInput): AgentSafeSeries {
  if (FORBIDDEN_SERIES_METRIC.test(input.metric)) {
    throw new Error(
      "INVALID_INPUT: GPS/latlng never enters agent-safe-series tools; use privacy_mode escalation on a details tool instead.",
    );
  }
  if (input.points.length > SERIES_HARD_MAX_POINTS) {
    throw new Error(
      `INVALID_INPUT: returned series exceeds hard cap ${SERIES_HARD_MAX_POINTS} (got ${input.points.length}). Downsample in the connector first.`,
    );
  }
  if (input.source_points < input.points.length) {
    throw new Error("INVALID_INPUT: source_points must be >= points.length.");
  }
  const returned_points = input.points.length;
  if (input.returned_points !== undefined && input.returned_points !== returned_points) {
    throw new Error("INVALID_INPUT: returned_points must equal points.length.");
  }
  if (input.downsampled && input.method === "none") {
    throw new Error('INVALID_INPUT: downsampled=true requires method other than "none".');
  }
  if (!input.downsampled && input.method !== "none") {
    throw new Error('INVALID_INPUT: method other than "none" requires downsampled=true.');
  }

  return {
    ...input,
    contract_version: SERIES_CONTRACT_VERSION,
    t_unit: "seconds_from_start",
    returned_points,
    stats: {
      ...input.stats,
      percentile_method: "linear_interpolation",
    },
  };
}
