# Security Policy

## Supported versions

Security fixes target the latest `main` and the newest published npm version.

## Reporting a vulnerability

Do not open public issues or pull requests that contain:

- OAuth access tokens or refresh tokens
- Provider client secrets or API keys
- Token files (`tokens.json` and similar)
- Raw wearable exports from real users
- Medical, psychological, or personally identifiable health documents

If you discover a credential leak or a privacy bug in this kit, use a
[GitHub private security advisory](https://github.com/davidmosiah/delx-mcp-kit/security/advisories/new)
or email **support@delx.ai** — do not post the secret in a public issue.

## What this package handles

- **TokenStore:** local JSON token files. Callers must keep the path on a trusted machine, outside synced/shared folders. The store creates the directory as `0700` and the file as `0600`.
- **Privacy:** `resolvePrivacyMode` refuses agent-requested `raw` / GPS without `explicit_user_intent`. `stripGpsDeep` drops known GPS keys; connectors may add provider-specific keys on top.
- **Series:** `buildAgentSafeSeries` rejects GPS-named metrics. Dense streams still belong in the connector, behind the hard cap of 500 points.

This package is not a medical device, clinical tool, or emergency monitoring system.
