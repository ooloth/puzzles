import { defineConfig } from "vite";

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
  build: {
    outDir: "../../dist/client",
    emptyOutDir: true,
    target: [...browserFloor],
  },
});
