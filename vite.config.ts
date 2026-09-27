import { defineConfig, type ProxyOptions } from "vite";

/**
 * An IP literal rather than `localhost`, which can resolve to `::1` while the server listens on IPv4
 * only. How the two processes learn each other's address is M2's question; until then the dev server
 * assumes the server's default address.
 */
export type LoopbackOrigin = `http://127.0.0.1:${number}`;

export const defaultApiServer: LoopbackOrigin = "http://127.0.0.1:3000";

/** The one proxy rule, shared by the config and its tests so the tests exercise the real key. */
export function proxyApiTo(origin: LoopbackOrigin): Record<string, ProxyOptions> {
  // Vite matches a key without a leading `^` as a plain prefix, so `/apidocs` and `/api` stay the
  // client's — see ADR-0041.
  return { "/api/": { target: origin } };
}

type BrowserVersion = `${"safari" | "ios" | "chrome" | "edge" | "firefox"}${number}`;

/**
 * The oldest browsers the client build emits syntax for. Safari 15 is the one shipped with iOS 15,
 * the oldest iOS branch Apple still patches (docs/constraints.md). Each other engine is its newest
 * release on or before iOS 15's release on 2021-09-20, per @mdn/browser-compat-data 8.1.3.
 *
 * Named versions rather than a keyword, so the floor never falls through to Vite's default, which
 * moves when Vite does (ADR-0025, ADR-0026).
 */
const browserFloor = ["safari15", "ios15", "chrome93", "edge93", "firefox92"] as const satisfies readonly BrowserVersion[];

export default defineConfig({
  root: "src/client",
  // `pnpm preview` inherits this, because `preview.proxy` defaults to `server.proxy`.
  server: { proxy: proxyApiTo(defaultApiServer) },
  build: {
    outDir: "../../dist/client",
    emptyOutDir: true,
    target: [...browserFloor],
  },
});
