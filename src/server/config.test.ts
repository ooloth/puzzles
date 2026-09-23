import assert from "node:assert/strict";
import { test } from "node:test";
import fc from "fast-check";
import { parseServerConfig } from "./config.ts";

function problemsFor(env: Record<string, string>): readonly string[] {
  const result = parseServerConfig(env);
  assert.equal(result.ok, false, `expected ${JSON.stringify(env)} to be rejected`);
  return result.ok ? [] : result.problems;
}

test("with no HOST or PORT set, the server listens on 127.0.0.1:3000", () => {
  assert.deepEqual(parseServerConfig({}), { ok: true, config: { host: "127.0.0.1", port: 3000 } });
});

test("any IPv4 literal is accepted as HOST", () => {
  fc.assert(
    fc.property(fc.ipV4(), (host) => {
      assert.deepEqual(parseServerConfig({ HOST: host }), { ok: true, config: { host, port: 3000 } });
    }),
  );
});

test("any IPv6 literal is accepted as HOST", () => {
  fc.assert(
    fc.property(fc.ipV6(), (host) => {
      assert.deepEqual(parseServerConfig({ HOST: host }), { ok: true, config: { host, port: 3000 } });
    }),
  );
});

test("a hostname is rejected as HOST, because it can make the server listen on more than one address", () => {
  const hostname = fc.oneof(fc.constant("localhost"), fc.domain());
  fc.assert(
    fc.property(hostname, (host) => {
      assert.match(problemsFor({ HOST: host }).join("\n"), /^HOST: /);
    }),
  );
});

test("an empty HOST is rejected rather than treated as absent", () => {
  assert.match(problemsFor({ HOST: "" }).join("\n"), /^HOST: /);
});

test("any port from 0 to 65535 written in digits is accepted as PORT", () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 65_535 }), (port) => {
      assert.deepEqual(parseServerConfig({ PORT: String(port) }), {
        ok: true,
        config: { host: "127.0.0.1", port },
      });
    }),
  );
});

test("any port above 65535 is rejected", () => {
  fc.assert(
    fc.property(fc.integer({ min: 65_536 }), (port) => {
      assert.match(problemsFor({ PORT: String(port) }).join("\n"), /^PORT: /);
    }),
  );
});

test("a PORT containing anything but digits is rejected rather than coerced", () => {
  const notDigits = fc.string().filter((value) => !/^\d+$/.test(value));
  fc.assert(
    fc.property(notDigits, (port) => {
      assert.match(problemsFor({ PORT: port }).join("\n"), /^PORT: /);
    }),
  );
  for (const port of ["", "3.5", "80abc", " 80", "-1", "0x50", "1e3"]) {
    assert.match(problemsFor({ PORT: port }).join("\n"), /^PORT: /, `PORT=${JSON.stringify(port)}`);
  }
});

test("when both are wrong, both are reported", () => {
  const problems = problemsFor({ HOST: "localhost", PORT: "abc" });
  assert.equal(problems.length, 2);
  assert.ok(problems.some((problem) => problem.startsWith("HOST: ")));
  assert.ok(problems.some((problem) => problem.startsWith("PORT: ")));
});
