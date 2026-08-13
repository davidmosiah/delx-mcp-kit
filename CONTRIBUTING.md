# Contributing

Contributions are welcome around the shared contract: privacy escalation, GPS redaction, token storage, MCP annotations, agent error strings, and `agent-safe-series/v1` types.

## Local development

```bash
npm ci
npm test
```

GitHub Actions is **not** the proof for this repository. Run `npm test` locally (or on the agent VM) and paste the result in the PR if useful.

## Design rules

- Keep this package a thin primitive layer. Provider-specific series shaping stays in connector repos.
- Do not commit tokens, OAuth client secrets, or personal health exports.
- Agent `privacy_mode=raw` and `include_gps=true` stay behind `explicit_user_intent`.
- GPS/latlng never enters a series envelope.
- **Series contract (`agent-safe-series/v1`):** a required-field change needs a golden fixture in this repo **and** a hub ADR / garmin-mcp#19 proposal. Do not bump the contract string in a drive-by PR. Optional fields agents may ignore can ship as a package minor while the string stays `v1`.
- Preserve the disclaimer: not a medical device and not medical advice.

## Pull request checklist

- `npm test` passes on the author's machine.
- `CHANGELOG.md` is updated when the public API or envelope changes.
- README public API / versioning notes stay accurate.
- No GitHub Actions workflow expansion unless the owner has asked for it (free-plan Actions is not a merge gate).
