# delx-mcp-kit

Shared primitives for [Delx](https://github.com/davidmosiah/delx-wellness) local-first MCP servers.

Not another wearable connector — the contract layer the fleet already dogfoods (`whoop-mcp`, `google-health-mcp`). Node **>=20**, ESM only.

```bash
npm i delx-mcp-kit
```

```ts
import {
  resolvePrivacyMode,
  stripGpsDeep,
  TokenStore,
  userActionRequired,
  buildAgentSafeSeries,
  clampMaxPoints,
} from "delx-mcp-kit";

const mode = resolvePrivacyMode(
  { privacyMode: "structured" },
  params.privacy_mode,
  { explicit_user_intent: params.explicit_user_intent, include_gps: params.include_gps },
);
```

## Public API

| Export | Role |
|---|---|
| `resolvePrivacyMode` | Agent `raw` / `include_gps` requires `explicit_user_intent` |
| `stripGpsDeep` / `deepRedact` / `isGpsKey` | Recursive GPS/PII key stripping |
| `TokenStore` | Local tokens: dir `0700`, file `0600`, exclusive lock |
| `readOnlyAnnotation` / `readOnlyOpenWorldAnnotation` / `mutationAnnotation` | Scorecard-ready MCP annotations |
| `ERROR_CODES` / `userActionRequired` / `authRequired` / `isUserActionRequired` | Stable agent error strings |
| `AgentSafeSeries` / `buildAgentSafeSeries` / `clampMaxPoints` | Frozen `agent-safe-series/v1` envelope + hard cap 500 |

Re-exports live on the package root (`import { … } from "delx-mcp-kit"`). There is no subpath export.

## Privacy annotations

- Default tools: `readOnlyAnnotation()` (`openWorldHint: false`).
- Tools that hit a live upstream: `readOnlyOpenWorldAnnotation()`.
- Writes: `mutationAnnotation({ destructive })`.
- `privacy_mode=raw` and `include_gps=true` throw `USER_ACTION_REQUIRED` unless `explicit_user_intent=true`. A **config-default** `raw` (env) is allowed without per-call intent.

## Series caps (`agent-safe-series/v1`)

Connectors still downsample. This kit only freezes the envelope:

1. Stats stay on full-resolution samples (connector-owned).
2. Server hard cap is **500** points (`SERIES_HARD_MAX_POINTS`); default budget **400**.
3. Honest loss metadata: `downsampled`, `method`, `source_points`, `returned_points`.
4. GPS/latlng **never** enters a series tool — `buildAgentSafeSeries` rejects those metric names.
5. `buildAgentSafeSeries` stamps `contract_version` and `t_unit: "seconds_from_start"`. Do not invent a second contract string.

Canonical field rules: [delx-wellness `agent-safe-series.md`](https://github.com/davidmosiah/delx-wellness/blob/main/docs/agent-safe-series.md). Local note: [`docs/0.2-story.md`](docs/0.2-story.md).

```ts
const series = buildAgentSafeSeries({
  activity_id,
  metric: "heart_rate",
  unit: "bpm",
  resolution_seconds: 60,
  requested_resolution_seconds: 60,
  points, // already shaped + capped by the connector
  stats,
  downsampled: points.length < source_points,
  source_points,
  method: points.length < source_points ? "time_bucket_mean" : "none",
  data_quality,
  notes: [],
});
```

Use `clampMaxPoints(params.max_points)` on the **input budget** before shaping. If `points.length` is still over 500, the builder throws `INVALID_INPUT` instead of silently truncating.

## Versioning

Two version lines:

| Line | What | Bump when |
|---|---|---|
| Package semver (`0.2.0`) | JS API of this kit | new export, behavior change, bugfix |
| `agent-safe-series/v1` | Frozen envelope string | **never** for optional fields; new required field / rename / meaning change → `v2` **and** package major |

Package bumps (0.x, keep it boring):

- Additive export or optional envelope field agents may ignore → **minor** (`0.1.1` → `0.2.0`)
- Breaking JS API, tighter hard cap, or required-field change → **major**
- Bugfix that keeps the envelope identical → **patch**

Keep the previous contract major readable for ≥1 minor after a bump. Do not silently reinterpret `v1` fields.

### How to bump

1. Edit `version` in `package.json` (and the lockfile if npm rewrites it).
2. Add a `CHANGELOG.md` section. Mention `agent-safe-series/v1` when the envelope changes.
3. Prove with **`npm test` on this machine**. GitHub Actions in `.github/workflows` is a leftover template, not a merge gate (no paid Actions minutes).
4. Maintainer publishes from a trusted machine: `npm publish` (`prepublishOnly` re-runs tests). This repo does not publish from CI.

Do not bump the contract string from a connector. Propose additive fields via the hub ADR / [garmin-mcp#19](https://github.com/davidmosiah/garmin-mcp/issues/19) first.

## Develop

```bash
npm ci
npm test          # typecheck + build + kit + series fixtures
npm run typecheck
```

See [AGENTS.md](AGENTS.md), [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md).

MIT · part of the Delx wellness MCP surface. Yardstick: [`mcp-scorecard`](https://github.com/davidmosiah/mcp-scorecard).
