import assert from "node:assert/strict";
import {
  clampMaxPoints,
  SERIES_HARD_MAX_POINTS,
  SERIES_DEFAULT_MAX_POINTS,
  SERIES_CONTRACT_VERSION,
  buildAgentSafeSeries,
} from "../dist/index.js";

assert.equal(SERIES_CONTRACT_VERSION, "agent-safe-series/v1");
assert.equal(clampMaxPoints(9999), SERIES_HARD_MAX_POINTS);
assert.equal(clampMaxPoints(12), 12);
assert.equal(clampMaxPoints(0), SERIES_DEFAULT_MAX_POINTS);
assert.equal(clampMaxPoints(-4), SERIES_DEFAULT_MAX_POINTS);
assert.equal(clampMaxPoints(Number.NaN), SERIES_DEFAULT_MAX_POINTS);
assert.equal(clampMaxPoints(SERIES_HARD_MAX_POINTS), SERIES_HARD_MAX_POINTS);

function draft(overrides = {}) {
  return {
    activity_id: 1,
    metric: "heart_rate",
    unit: "bpm",
    resolution_seconds: 60,
    requested_resolution_seconds: 60,
    points: [{ t: 0, value: 120, min: 120, max: 120, samples: 1 }],
    stats: {
      avg: 120,
      min: 120,
      max: 120,
      p25: 120,
      p50: 120,
      p75: 120,
      percentile_method: "linear_interpolation",
    },
    downsampled: false,
    source_points: 1,
    method: "none",
    data_quality: {
      expected_samples: 1,
      actual_samples: 1,
      coverage_ratio: 1,
      longest_gap_seconds: 0,
      sample_interval_seconds: 1,
      coverage_anchor: "sample_span",
    },
    notes: [],
    ...overrides,
  };
}

const stamped = buildAgentSafeSeries(draft());
assert.equal(stamped.contract_version, SERIES_CONTRACT_VERSION);
assert.equal(stamped.t_unit, "seconds_from_start");
assert.equal(stamped.returned_points, 1);
assert.equal(stamped.stats.percentile_method, "linear_interpolation");

const downsampled = buildAgentSafeSeries(
  draft({
    downsampled: true,
    method: "time_bucket_mean",
    source_points: 900,
    points: [
      { t: 0, value: 110, min: 100, max: 120, samples: 450 },
      { t: 60, value: 130, min: 120, max: 140, samples: 450 },
    ],
  }),
);
assert.equal(downsampled.returned_points, 2);
assert.equal(downsampled.downsampled, true);

assert.throws(
  () => buildAgentSafeSeries(draft({ metric: "gps" })),
  /INVALID_INPUT: GPS/,
);
assert.throws(
  () =>
    buildAgentSafeSeries(
      draft({
        points: Array.from({ length: SERIES_HARD_MAX_POINTS + 1 }, (_, i) => ({
          t: i,
          value: 1,
          min: 1,
          max: 1,
          samples: 1,
        })),
        source_points: SERIES_HARD_MAX_POINTS + 1,
      }),
    ),
  /hard cap 500/,
);
assert.throws(
  () => buildAgentSafeSeries(draft({ source_points: 0 })),
  /source_points/,
);
assert.throws(
  () => buildAgentSafeSeries(draft({ returned_points: 99 })),
  /returned_points/,
);
assert.throws(
  () => buildAgentSafeSeries(draft({ downsampled: true, method: "none" })),
  /downsampled=true/,
);
assert.throws(
  () => buildAgentSafeSeries(draft({ downsampled: false, method: "time_bucket_mean" })),
  /downsampled=true/,
);

console.log(JSON.stringify({ ok: true, suite: "series-types" }));
