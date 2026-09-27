import assert from "node:assert/strict";
import { test } from "node:test";
import fc from "fast-check";
import { readHello } from "./hello.ts";

// 204 and 205 cannot carry a body, so the Response constructor rejects them with one.
const statusWithBody = fc.integer({ min: 200, max: 299 }).filter((status) => status !== 204 && status !== 205);
const plainTextContentType = fc.constantFrom("text/plain", "text/plain; charset=utf-8", "text/plain;charset=UTF-8", "TEXT/PLAIN");

test("any 2xx text/plain reply is answered with its exact body", async () => {
  await fc.assert(
    fc.asyncProperty(statusWithBody, plainTextContentType, fc.string(), async (status, contentType, body) => {
      const outcome = await readHello(new Response(body, { status, headers: { "content-type": contentType } }));
      assert.deepEqual(outcome, { kind: "answered", text: body });
    }),
  );
});

test("any status outside 2xx is an error-status carrying that status", async () => {
  await fc.assert(
    fc.asyncProperty(fc.integer({ min: 300, max: 599 }), async (status) => {
      const outcome = await readHello(new Response(null, { status }));
      assert.deepEqual(outcome, { kind: "error-status", status });
    }),
  );
});

test("a 200 text/html reply, which is what the entry document looks like, is not plain text", async () => {
  const entryDocument = new Response('<div id="root"></div>', { status: 200, headers: { "content-type": "text/html" } });
  assert.deepEqual(await readHello(entryDocument), { kind: "not-plain-text", contentType: "text/html" });
});

test("a 200 reply with no content type is not plain text", async () => {
  assert.deepEqual(await readHello(new Response(null, { status: 200 })), { kind: "not-plain-text", contentType: null });
});
