# delx-mcp-kit

Shared **SOTA primitives** for [Delx](https://github.com/davidmosiah/delx-wellness) local-first MCP servers.

Not another wearable connector — the contract layer the fleet already dogfoods:

| Export | Role |
|---|---|
| `resolvePrivacyMode` | Agent `raw` / `include_gps` requires `explicit_user_intent` |
| `stripGpsDeep` / `deepRedact` | Recursive GPS/PII key stripping |
| `TokenStore` | Local tokens: dir `0700`, file `0600`, lock |
| `readOnlyAnnotation` / `mutationAnnotation` | Scorecard-ready MCP annotations |
| `ERROR_CODES` / `userActionRequired` | Stable agent error strings |

```bash
npm i delx-mcp-kit
```

```ts
import { resolvePrivacyMode, stripGpsDeep, TokenStore, userActionRequired } from "delx-mcp-kit";

const mode = resolvePrivacyMode(
  { privacyMode: "structured" },
  params.privacy_mode,
  { explicit_user_intent: params.explicit_user_intent, include_gps: params.include_gps },
);
```

MIT · part of the Delx wellness MCP surface. Yardstick: [`mcp-scorecard`](https://github.com/davidmosiah/mcp-scorecard).
