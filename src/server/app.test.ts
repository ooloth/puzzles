import assert from "node:assert/strict";
import { test } from "node:test";
import fc from "fast-check";
import { z } from "zod";
import { buildServer, startServer } from "./app.ts";
import { parseServerConfig } from "./config.ts";

type LogLine = { level: number; msg: string; reqId?: string; responseTime?: number; err?: { message: string } };

function capturingServer() {
  const lines: LogLine[] = [];
  const app = buildServer({ logDestination: { write: (line) => void lines.push(JSON.parse(line)) } });
  return { app, lines };
}

test("GET /api/hello answers Hello! as plain text", async () => {
  const { app } = capturingServer();
  const response = await app.inject({ method: "GET", url: "/api/hello" });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body, "Hello!");
  assert.match(String(response.headers["content-type"]), /^text\/plain/);
});

test("GET /hello answers 404, because every API path starts with /api/", async () => {
  const { app } = capturingServer();
  const response = await app.inject({ method: "GET", url: "/hello" });
  assert.equal(response.statusCode, 404);
});

test("an unknown path under /api/ answers 404 JSON with no stack trace", async () => {
  const { app } = capturingServer();
  const response = await app.inject({ method: "GET", url: "/api/does-not-exist" });
  assert.equal(response.statusCode, 404);
  assert.match(String(response.headers["content-type"]), /^application\/json/);
  assert.doesNotMatch(response.body, /\bat \S+ \(/);
});

// Near misses first, because they are where a prefix check goes wrong: ADR-0041 gives `/api` and
// `/apidocs` to the client.
const pathOutsideApi = fc.oneof(
  fc.constantFrom("/", "/hello", "/api", "/apidocs", "/apix/y", "/API/hello", "api/hello"),
  fc.stringMatching(/^\/[a-z0-9/-]{0,20}$/).filter((path) => !path.startsWith("/api/")),
);
const pathUnderApi = fc.stringMatching(/^[a-z0-9-]{1,10}(\/[a-z0-9-]{1,10}){0,2}$/).map((rest) => `/api/${rest}`);

test("a route outside /api/ cannot be registered", () => {
  fc.assert(
    fc.property(pathOutsideApi, (path) => {
      const { app } = capturingServer();
      assert.throws(() => app.get(path, () => "x"), new RegExp(`outside /api/: ${path}`));
    }),
  );
});

test("a route under /api/ can be registered", async () => {
  await fc.assert(
    fc.asyncProperty(pathUnderApi, async (path) => {
      const { app } = capturingServer();
      app.get(path, () => "x");
      await app.ready();
    }),
  );
});

test("a handler that throws answers 500 without the thrown message, and the server keeps answering", async () => {
  const { app } = capturingServer();
  app.get("/api/throws", () => {
    throw new Error("secret detail from deep inside");
  });

  const failed = await app.inject({ method: "GET", url: "/api/throws" });
  assert.equal(failed.statusCode, 500);
  assert.doesNotMatch(failed.body, /secret detail/);
  assert.deepEqual(failed.json(), { statusCode: 500, error: "Internal Server Error" });

  const after = await app.inject({ method: "GET", url: "/api/hello" });
  assert.equal(after.statusCode, 200);
});

test("a 500 is logged at error level with the thrown message, so it is withheld from the client and not lost", async () => {
  const { app, lines } = capturingServer();
  app.get("/api/throws", () => {
    throw new Error("secret detail from deep inside");
  });
  await app.inject({ method: "GET", url: "/api/throws" });
  const errorLines = lines.filter((line) => line.level >= 50);
  assert.equal(errorLines.length, 1);
  assert.equal(errorLines[0]?.err?.message, "secret detail from deep inside");
});

test("a request failing its declared schema answers 400 naming the field", async () => {
  const { app } = capturingServer();
  app.get("/api/count", { schema: { querystring: z.object({ n: z.coerce.number() }) } }, () => "ok");
  const response = await app.inject({ method: "GET", url: "/api/count?n=abc" });
  assert.equal(response.statusCode, 400);
  assert.match(response.json().message, /\bn\b/);
});

test("a response that does not match its declared schema is not sent", async () => {
  const { app } = capturingServer();
  // The cast gets a mismatched response past the compiler so the runtime check can be seen to catch it.
  app.get("/api/shape", { schema: { response: { 200: z.object({ a: z.string() }) } } }, () => ({ a: 1, leaked: "x" }) as never);
  const response = await app.inject({ method: "GET", url: "/api/shape" });
  assert.equal(response.statusCode, 500);
  assert.doesNotMatch(response.body, /leaked/);
});

test("each request logs an incoming and a completed line sharing a reqId, the second with a responseTime", async () => {
  const { app, lines } = capturingServer();
  await app.inject({ method: "GET", url: "/api/hello" });
  const incoming = lines.find((line) => line.msg === "incoming request");
  const completed = lines.find((line) => line.msg === "request completed");
  assert.ok(incoming?.reqId);
  assert.equal(completed?.reqId, incoming.reqId);
  assert.equal(typeof completed.responseTime, "number");
});

test("the server listens on exactly one address", async (t) => {
  const { app } = capturingServer();
  t.after(() => app.close());
  const config = parseServerConfig({ HOST: "127.0.0.1", PORT: "0" });
  assert.ok(config.ok);
  await startServer(app, config.config);
  const addresses = app.addresses();
  assert.equal(addresses.length, 1);
  assert.equal(addresses[0]?.address, "127.0.0.1");
});
