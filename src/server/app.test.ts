import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { buildServer, startServer } from "./app.ts";
import { parseServerConfig } from "./config.ts";

type LogLine = { level: number; msg: string; reqId?: string; responseTime?: number; err?: { message: string } };

function capturingServer() {
  const lines: LogLine[] = [];
  const app = buildServer({ logDestination: { write: (line) => void lines.push(JSON.parse(line)) } });
  return { app, lines };
}

test("GET /hello answers Hello! as plain text", async () => {
  const { app } = capturingServer();
  const response = await app.inject({ method: "GET", url: "/hello" });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body, "Hello!");
  assert.match(String(response.headers["content-type"]), /^text\/plain/);
});

test("an unknown path answers 404 with no stack trace", async () => {
  const { app } = capturingServer();
  const response = await app.inject({ method: "GET", url: "/does-not-exist" });
  assert.equal(response.statusCode, 404);
  assert.doesNotMatch(response.body, /\bat \S+ \(/);
});

test("a handler that throws answers 500 without the thrown message, and the server keeps answering", async () => {
  const { app } = capturingServer();
  app.get("/throws", () => {
    throw new Error("secret detail from deep inside");
  });

  const failed = await app.inject({ method: "GET", url: "/throws" });
  assert.equal(failed.statusCode, 500);
  assert.doesNotMatch(failed.body, /secret detail/);
  assert.deepEqual(failed.json(), { statusCode: 500, error: "Internal Server Error" });

  const after = await app.inject({ method: "GET", url: "/hello" });
  assert.equal(after.statusCode, 200);
});

test("a 500 is logged at error level with the thrown message, so it is withheld from the client and not lost", async () => {
  const { app, lines } = capturingServer();
  app.get("/throws", () => {
    throw new Error("secret detail from deep inside");
  });
  await app.inject({ method: "GET", url: "/throws" });
  const errorLines = lines.filter((line) => line.level >= 50);
  assert.equal(errorLines.length, 1);
  assert.equal(errorLines[0]?.err?.message, "secret detail from deep inside");
});

test("a request failing its declared schema answers 400 naming the field", async () => {
  const { app } = capturingServer();
  app.get("/count", { schema: { querystring: z.object({ n: z.coerce.number() }) } }, () => "ok");
  const response = await app.inject({ method: "GET", url: "/count?n=abc" });
  assert.equal(response.statusCode, 400);
  assert.match(response.json().message, /\bn\b/);
});

test("a response that does not match its declared schema is not sent", async () => {
  const { app } = capturingServer();
  // The cast gets a mismatched response past the compiler so the runtime check can be seen to catch it.
  app.get("/shape", { schema: { response: { 200: z.object({ a: z.string() }) } } }, () => ({ a: 1, leaked: "x" }) as never);
  const response = await app.inject({ method: "GET", url: "/shape" });
  assert.equal(response.statusCode, 500);
  assert.doesNotMatch(response.body, /leaked/);
});

test("each request logs an incoming and a completed line sharing a reqId, the second with a responseTime", async () => {
  const { app, lines } = capturingServer();
  await app.inject({ method: "GET", url: "/hello" });
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
