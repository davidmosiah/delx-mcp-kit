import assert from 'node:assert/strict';
import { clampMaxPoints, SERIES_HARD_MAX_POINTS, SERIES_CONTRACT_VERSION } from '../dist/series.js';
assert.equal(SERIES_CONTRACT_VERSION, 'agent-safe-series/v1');
assert.equal(clampMaxPoints(9999), SERIES_HARD_MAX_POINTS);
assert.equal(clampMaxPoints(12), 12);
console.log(JSON.stringify({ ok: true, suite: 'series-types' }));
