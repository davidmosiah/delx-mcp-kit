# Agent Development Notes

## Scope

Shared primitives for Delx local-first MCP servers (privacy escalation, GPS redaction, TokenStore, MCP annotations, agent error codes, `agent-safe-series/v1` types). This is not a connector and must not grow provider-specific shapers (Garmin descriptors, Strava streams, Google E7 keys).

## Commands

- Install: `npm ci`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Full gate: `npm test`

Prove changes with `npm test` on the working machine. `.github/workflows/scorecard.yml` is not a usable merge gate.

## Rules

- Keep the kit thin. New exports need a consumer in the wellness fleet or a frozen contract (series/privacy), not a speculative framework.
- GPS/latlng never enters series tools. Agent `raw` / `include_gps` requires `explicit_user_intent`.
- Never commit OAuth tokens, token files, or real user health data.
- Token files: directory `0700`, file `0600`.
- Not a medical device and not medical advice.
