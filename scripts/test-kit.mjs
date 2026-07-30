import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  resolvePrivacyMode,
  stripGpsDeep,
  isGpsKey,
  TokenStore,
  userActionRequired,
  ERROR_CODES,
  readOnlyAnnotation,
} from "../dist/index.js";

// privacy escalation
try {
  resolvePrivacyMode({ privacyMode: "structured" }, "raw", { explicit_user_intent: false });
  assert.fail("should throw");
} catch (e) {
  assert.match(String(e.message || e), /USER_ACTION_REQUIRED/);
}
assert.equal(
  resolvePrivacyMode({ privacyMode: "structured" }, "raw", { explicit_user_intent: true }),
  "raw",
);
assert.equal(resolvePrivacyMode({ privacyMode: "raw" }), "raw");

// GPS deep strip
const nested = stripGpsDeep({
  id: 1,
  track: { points: [{ latitude: 1, longitude: 2, elev: 9 }] },
  map: { summary_polyline: "x" },
});
assert.equal(nested.map, undefined);
assert.equal(nested.track.points[0].latitude, undefined);
assert.equal(nested.track.points[0].elev, 9);
assert.equal(isGpsKey("polyline"), true);

// TokenStore perms
const dir = mkdtempSync(join(tmpdir(), "delx-mcp-kit-"));
const path = join(dir, "tokens.json");
const store = new TokenStore(path);
await store.write({ access_token: "t" });
assert.equal(existsSync(path), true);
const read = await store.read();
assert.equal(read.access_token, "t");
await store.clear();
assert.equal(existsSync(path), false);
rmSync(dir, { recursive: true, force: true });

// errors + annotations
assert.match(userActionRequired("confirm first").message, /USER_ACTION_REQUIRED/);
assert.equal(ERROR_CODES.AUTH_REQUIRED, "AUTH_REQUIRED");
assert.equal(readOnlyAnnotation().readOnlyHint, true);

console.log(JSON.stringify({ ok: true, suite: "delx-mcp-kit" }, null, 2));
