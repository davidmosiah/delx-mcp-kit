# Changelog

## 0.2.0 - 2026-08-13

### Added

- `buildAgentSafeSeries`: stamp `agent-safe-series/v1`, reject GPS-named metrics and over-cap point arrays. Connectors still downsample.
- README public API, privacy annotations, series caps, and how to bump (package semver vs contract string).
- `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`.

### Tests

- Series builder invariants (caps, GPS metric, `returned_points`, downsample/`method` pairing).
- `include_gps` without intent; TokenStore file mode `0600`.

## 0.1.1 - 2026-08-05

### Added

- `agent-safe-series/v1` types, `SERIES_HARD_MAX_POINTS` / `SERIES_DEFAULT_MAX_POINTS`, `clampMaxPoints`.
- Series types wired into `npm test`.

## 0.1.0 - 2026-07-30

### Added

- Initial public release: privacy escalation, GPS deep redaction, TokenStore, annotations, error codes.
