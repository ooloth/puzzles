import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout as sleep } from "node:timers/promises";
import { buildServer, startServer } from "./app.ts";
import { parseServerConfig } from "./config.ts";
import { closeGracefully, exitCodeFor } from "./shutdown.ts";

async function listeningServer() {
  const app = buildServer({ logDestination: { write: () => {} } });
  let release = () => {};
  const released = new Promise<void>((resolve) => (release = resolve));
  app.get("/slow", async () => {
    await released;
    return "finished";
  });
  const config = parseServerConfig({ HOST: "127.0.0.1", PORT: "0" });
  assert.ok(config.ok);
  await startServer(app, config.config);
  const address = app.addresses()[0];
  assert.ok(address);
  return { app, release, url: `http://${address.address}:${address.port}/slow` };
}

// fetch keeps its connection alive by default, which is what leaves a connection falling idle
// after close() has begun — the case a single reap misses.
test("a request in flight when shutdown begins completes, and shutdown drains promptly after it", { timeout: 5_000 }, async () => {
  const { app, release, url } = await listeningServer();
  const response = fetch(url);
  await sleep(200);

  const startedAt = performance.now();
  const outcome = closeGracefully(app, { reapIntervalMs: 100, ceilingMs: 4_000 });
  await sleep(300);
  release();

  const answered = await response;
  assert.equal(answered.status, 200);
  assert.equal(await answered.text(), "finished");
  assert.deepEqual(await outcome, { kind: "drained" });
  assert.ok(performance.now() - startedAt < 1_000, "shutdown took longer than the request it waited for");
});

test("a request still running at the ceiling ends shutdown as ceiling-exceeded", { timeout: 5_000 }, async () => {
  const { app, release, url } = await listeningServer();
  const response = fetch(url);
  await sleep(200);

  const outcome = await closeGracefully(app, { reapIntervalMs: 100, ceilingMs: 500 });
  assert.deepEqual(outcome, { kind: "ceiling-exceeded", afterMs: 500 });

  // The reaper stops with the ceiling, so the test collects the connection the request leaves idle.
  release();
  await (await response).text();
  app.server.closeAllConnections();
});

test("a reap interval of zero or less is a programming error", async () => {
  const app = buildServer({ logDestination: { write: () => {} } });
  await assert.rejects(closeGracefully(app, { reapIntervalMs: 0, ceilingMs: 1_000 }), /reapIntervalMs/);
});

test("a ceiling no longer than the reap interval is a programming error", async () => {
  const app = buildServer({ logDestination: { write: () => {} } });
  await assert.rejects(closeGracefully(app, { reapIntervalMs: 100, ceilingMs: 100 }), /ceilingMs/);
});

test("only a drained shutdown exits 0", () => {
  assert.equal(exitCodeFor({ kind: "drained" }), 0);
  assert.equal(exitCodeFor({ kind: "ceiling-exceeded", afterMs: 10_000 }), 1);
  assert.equal(exitCodeFor({ kind: "close-failed", error: new Error("x") }), 1);
});
