import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { test } from "node:test";

type LogLine = { level: number; msg: string; reqId?: string; responseTime?: number; problems?: string[] };

const entry = new URL("./main.ts", import.meta.url).pathname;

function startMain(env: Record<string, string>) {
  const child = spawn(process.execPath, [entry], { env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "inherit"] });
  const lines: LogLine[] = [];
  const waiters: Array<() => void> = [];
  createInterface({ input: child.stdout }).on("line", (line) => {
    lines.push(JSON.parse(line));
    for (const wake of waiters.splice(0)) wake();
  });
  let hasExited = false;
  const exited = once(child, "exit").then(([code]) => {
    hasExited = true;
    for (const wake of waiters.splice(0)) wake();
    return code as number | null;
  });
  async function lineMatching(predicate: (line: LogLine) => boolean): Promise<LogLine> {
    for (;;) {
      const found = lines.find(predicate);
      if (found) return found;
      if (hasExited) throw new Error(`process exited without logging the expected line; it logged ${JSON.stringify(lines)}`);
      await new Promise<void>((resolve) => waiters.push(resolve));
    }
  }
  return { child, lines, lineMatching, exited };
}

test("the server logs JSON, answers /hello, and exits 0 on SIGTERM", { timeout: 10_000 }, async () => {
  const server = startMain({ HOST: "127.0.0.1", PORT: "0" });
  const listening = await server.lineMatching((line) => line.msg.startsWith("Server listening at "));
  const origin = listening.msg.replace("Server listening at ", "");
  assert.match(origin, /^http:\/\/127\.0\.0\.1:\d+$/);

  const response = await fetch(`${origin}/hello`);
  assert.equal(await response.text(), "Hello!");

  const completed = await server.lineMatching((line) => line.msg === "request completed");
  const incoming = server.lines.find((line) => line.msg === "incoming request");
  assert.equal(completed.reqId, incoming?.reqId);
  assert.equal(typeof completed.responseTime, "number");

  server.child.kill("SIGTERM");
  assert.equal(await server.exited, 0);
});

test("a hostname as HOST stops the server before it listens, naming HOST", { timeout: 10_000 }, async () => {
  const server = startMain({ HOST: "localhost", PORT: "0" });
  assert.equal(await server.exited, 1);
  const fatal = server.lines.find((line) => line.level === 60);
  assert.ok(fatal?.problems?.some((problem) => problem.startsWith("HOST: ")));
  assert.ok(!server.lines.some((line) => line.msg.startsWith("Server listening at ")));
});

test("a port already in use stops the server with exit 1 and a fatal line", { timeout: 10_000 }, async () => {
  const first = startMain({ HOST: "127.0.0.1", PORT: "0" });
  const listening = await first.lineMatching((line) => line.msg.startsWith("Server listening at "));
  const port = new URL(listening.msg.replace("Server listening at ", "")).port;

  const second = startMain({ HOST: "127.0.0.1", PORT: port });
  assert.equal(await second.exited, 1);
  assert.ok(second.lines.some((line) => line.level === 60 && line.msg === "server failed to start"));

  first.child.kill("SIGTERM");
  assert.equal(await first.exited, 0);
});
