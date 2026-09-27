import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";
import { build, createServer, preview, type InlineConfig, type Rolldown } from "vite";
import { buildServer, startServer } from "./src/server/app.ts";
import { parseServerConfig } from "./src/server/config.ts";
import { proxyApiTo, type LoopbackOrigin } from "./vite.config.ts";

const configFile = join(import.meta.dirname, "vite.config.ts");

type Closeable = { close(): Promise<unknown> };

/** The real API server on a free port. */
async function startApiServer(): Promise<{ readonly origin: LoopbackOrigin } & Closeable> {
  const app = buildServer({ logDestination: { write: () => {} } });
  const config = parseServerConfig({ HOST: "127.0.0.1", PORT: "0" });
  assert.ok(config.ok);
  await startServer(app, config.config);
  const address = app.addresses()[0];
  assert.ok(address !== undefined, "the API server is not listening");
  return { origin: `http://127.0.0.1:${address.port}`, close: () => app.close() };
}

/**
 * The routing ADR-0041 asks of any server in front of the API, run against one that `start` puts
 * in front of the real API server. `start` receives the API server's origin and returns its own.
 */
function describeRoutingByApiPrefix(name: string, start: (api: LoopbackOrigin) => Promise<{ readonly origin: string } & Closeable>): void {
  describe(name, () => {
    const running: Closeable[] = [];
    let origin = "";

    before(async () => {
      const api = await startApiServer();
      running.push(api);
      const front = await start(api.origin);
      running.push(front);
      origin = front.origin;
    });
    after(async () => {
      for (const server of running.reverse()) await server.close();
    });

    test("/api/hello answers the server's Hello!", async () => {
      const response = await fetch(`${origin}/api/hello`);
      assert.equal(response.status, 200);
      assert.equal(await response.text(), "Hello!");
    });

    test("an unknown path under /api/ answers the server's 404 JSON", async () => {
      const response = await fetch(`${origin}/api/does-not-exist`);
      assert.equal(response.status, 404);
      assert.match(String(response.headers.get("content-type")), /^application\/json/);
    });

    for (const clientPath of ["/", "/apidocs", "/api"]) {
      test(`${clientPath} answers the entry document`, async () => {
        const response = await fetch(`${origin}${clientPath}`);
        assert.equal(response.status, 200);
        assert.match(await response.text(), /<div id="root">/);
      });
    }
  });
}

describeRoutingByApiPrefix("the dev server in front of the API server", async (api) => {
  const server = await createServer({
    configFile,
    logLevel: "silent",
    server: { host: "127.0.0.1", port: 0, proxy: proxyApiTo(api) },
  });
  await server.listen();
  const url = server.resolvedUrls?.local[0];
  assert.ok(url !== undefined, "the dev server reports no local address");
  return { origin: url.replace(/\/$/, ""), close: () => server.close() };
});

describeRoutingByApiPrefix("the preview server in front of the API server", async (api) => {
  const outDir = await mkdtemp(join(tmpdir(), "preview-"));
  // Only `server.proxy` is given: the preview server is expected to inherit it.
  const shared: InlineConfig = { configFile, logLevel: "silent", server: { proxy: proxyApiTo(api) }, build: { outDir, emptyOutDir: true } };
  await build(shared);
  const server = await preview({ ...shared, preview: { host: "127.0.0.1", port: 0 } });
  const url = server.resolvedUrls?.local[0];
  assert.ok(url !== undefined, "the preview server reports no local address");
  return {
    origin: url.replace(/\/$/, ""),
    close: async () => {
      await server.close();
      await rm(outDir, { recursive: true, force: true });
    },
  };
});

async function buildInMemory(overrides: InlineConfig = {}): Promise<Rolldown.OutputBundle> {
  const result = await build({ configFile, logLevel: "silent", ...overrides, build: { write: false } });
  assert.ok(!Array.isArray(result) && "output" in result, "expected a single in-memory build");
  return Object.fromEntries(result.output.map((file) => [file.fileName, file]));
}

test("the build emits an entry document that loads a content-hashed script", async () => {
  const bundle = await buildInMemory();
  const entry = bundle["index.html"];
  assert.ok(entry !== undefined && entry.type === "asset", "no index.html in the build output");

  const script = String(entry.source).match(/<script type="module"[^>]* src="\/(assets\/index-[\w-]{8,}\.js)"/);
  assert.ok(script !== null, "index.html loads no content-hashed module script");
  assert.equal(bundle[script[1]!]?.type, "chunk", `index.html loads ${script[1]}, which the build did not emit`);
});

test("the build lowers syntax the declared browser floor cannot parse", async () => {
  const project = await mkdtemp(join(tmpdir(), "floor-"));
  try {
    await writeFile(join(project, "index.html"), '<script type="module" src="./main.ts"></script>');
    // Class static blocks arrived in Safari 16.4, so the floor needs them lowered.
    await writeFile(join(project, "main.ts"), 'class Sample { static label = ""; static { Sample.label = "floor-sample"; } }\nconsole.log(Sample.label);\n');

    const bundle = await buildInMemory({ root: project });
    const code = Object.values(bundle)
      .flatMap((file) => (file.type === "chunk" ? [file.code] : []))
      .join("\n");
    assert.match(code, /floor-sample/, "the sample class is missing from the build output");
    assert.doesNotMatch(code, /\bstatic\s*\{/);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});

test("the built client calls /api/hello by a relative path and contains no absolute API URL", async () => {
  const bundle = await buildInMemory();
  const code = Object.values(bundle)
    .flatMap((file) => (file.type === "chunk" ? [file.code] : []))
    .join("\n");
  assert.match(code, /["'`]\/api\/hello["'`]/, "the build never asks for /api/hello");
  assert.doesNotMatch(code, /https?:\/\/[^"'`\s]*\/api\//);
});
