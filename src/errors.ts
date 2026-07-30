/** Stable agent-facing error codes for Delx MCP servers. */

export const ERROR_CODES = {
  USER_ACTION_REQUIRED: "USER_ACTION_REQUIRED",
  AUTH_REQUIRED: "AUTH_REQUIRED",
  RATE_LIMITED: "RATE_LIMITED",
  UPSTREAM_UNAVAILABLE: "UPSTREAM_UNAVAILABLE",
  INVALID_INPUT: "INVALID_INPUT",
  NOT_FOUND: "NOT_FOUND",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export function userActionRequired(message: string): Error {
  const msg = message.startsWith("USER_ACTION_REQUIRED")
    ? message
    : `USER_ACTION_REQUIRED: ${message}`;
  return new Error(msg);
}

export function authRequired(message = "Authenticate before calling this tool."): Error {
  return new Error(`AUTH_REQUIRED: ${message}`);
}

export function isUserActionRequired(error: unknown): boolean {
  return String((error as Error)?.message ?? error).includes("USER_ACTION_REQUIRED");
}
