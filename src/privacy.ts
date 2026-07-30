/** Shared privacy modes for Delx wellness MCPs. */
export type PrivacyMode = "summary" | "structured" | "raw";

export type PrivacyEscalationOpts = {
  /** Required true when agent requests raw or include_gps. */
  explicit_user_intent?: boolean;
  include_gps?: boolean;
};

/**
 * Resolve effective privacy mode.
 * Agent-requested escalations (raw / include_gps) require explicit_user_intent=true.
 * Config-default raw (env) is allowed without per-call intent.
 */
export function resolvePrivacyMode(
  config: { privacyMode: PrivacyMode },
  override?: PrivacyMode,
  opts?: PrivacyEscalationOpts,
): PrivacyMode {
  const agentAskedRaw = override === "raw";
  const agentAskedGps = opts?.include_gps === true;
  if ((agentAskedRaw || agentAskedGps) && opts?.explicit_user_intent !== true) {
    throw new Error(
      "USER_ACTION_REQUIRED: privacy_mode=raw and include_gps=true require explicit_user_intent=true after the user explicitly asked for unredacted or GPS data.",
    );
  }
  return override ?? config.privacyMode;
}

export function isGpsKey(key: string): boolean {
  return [
    "startLatitude",
    "startLongitude",
    "start_latlng",
    "endLatitude",
    "endLongitude",
    "end_latlng",
    "latitude",
    "longitude",
    "lat",
    "lon",
    "lng",
    "latlng",
    "coordinates",
    "coordinate",
    "gps",
    "gpx",
    "geoPolylineDTO",
    "map",
    "polyline",
    "summary_polyline",
    "activities-tracker-gps",
  ].includes(key);
}

export function deepRedact(
  value: unknown,
  dropKey: (key: string) => boolean,
): unknown {
  if (Array.isArray(value)) return value.map((item) => deepRedact(item, dropKey));
  if (!value || typeof value !== "object") return value;
  const clone: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (dropKey(key)) continue;
    clone[key] = deepRedact(child, dropKey);
  }
  return clone;
}

export function stripGpsDeep(value: unknown): unknown {
  return deepRedact(value, isGpsKey);
}
