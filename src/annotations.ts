/** MCP tool annotation helpers (agent-readiness / scorecard). */

export const readOnlyAnnotation = () =>
  ({
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  }) as const;

export const readOnlyOpenWorldAnnotation = () =>
  ({
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  }) as const;

export const mutationAnnotation = (opts?: { destructive?: boolean }) =>
  ({
    readOnlyHint: false,
    destructiveHint: opts?.destructive ?? false,
    idempotentHint: false,
    openWorldHint: false,
  }) as const;
