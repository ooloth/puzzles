import assert from "node:assert/strict";
import type { FastifyInstance } from "fastify";

export type ShutdownTiming = { readonly reapIntervalMs: number; readonly ceilingMs: number };

export const defaultShutdownTiming = { reapIntervalMs: 100, ceilingMs: 10_000 } satisfies ShutdownTiming;

export type ShutdownOutcome =
  | { readonly kind: "drained" }
  | { readonly kind: "ceiling-exceeded"; readonly afterMs: number }
  | { readonly kind: "close-failed"; readonly error: unknown };

/**
 * Closes the server, letting requests in flight finish. `server.close()` collects only the
 * connections idle when it is called, so a keep-alive connection whose request finishes afterwards
 * would hold the close open for Fastify's 72-second `keepAliveTimeout`. Reaping on an interval
 * collects it as soon as it falls idle — see ADR-0035 and `docs/constraints.md`.
 */
export async function closeGracefully(app: FastifyInstance, timing: ShutdownTiming): Promise<ShutdownOutcome> {
  assert.ok(timing.reapIntervalMs > 0, `reapIntervalMs must be positive, got ${timing.reapIntervalMs}`);
  assert.ok(
    timing.ceilingMs > timing.reapIntervalMs,
    `ceilingMs (${timing.ceilingMs}) must exceed reapIntervalMs (${timing.reapIntervalMs})`,
  );

  const reaper = setInterval(() => app.server.closeIdleConnections(), timing.reapIntervalMs);
  let ceilingTimer: NodeJS.Timeout | undefined;
  const ceiling = new Promise<ShutdownOutcome>((resolve) => {
    ceilingTimer = setTimeout(() => resolve({ kind: "ceiling-exceeded", afterMs: timing.ceilingMs }), timing.ceilingMs);
  });
  const closed = app.close().then(
    (): ShutdownOutcome => ({ kind: "drained" }),
    (error: unknown): ShutdownOutcome => ({ kind: "close-failed", error }),
  );

  try {
    return await Promise.race([closed, ceiling]);
  } finally {
    clearInterval(reaper);
    clearTimeout(ceilingTimer);
  }
}

export function exitCodeFor(outcome: ShutdownOutcome): 0 | 1 {
  switch (outcome.kind) {
    case "drained":
      return 0;
    case "ceiling-exceeded":
    case "close-failed":
      return 1;
    default: {
      const unreachable: never = outcome;
      return unreachable;
    }
  }
}
