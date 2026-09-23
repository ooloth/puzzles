import assert from "node:assert/strict";
import { test } from "node:test";
import fc from "fast-check";
import { toErrorBody, toErrorReply } from "./errors.ts";

function errorWithStatus(message: string, statusCode: number | undefined): Error {
  return Object.assign(new Error(message), { statusCode });
}

test("an error with a 4xx status keeps its status and its message", () => {
  fc.assert(
    fc.property(fc.integer({ min: 400, max: 499 }), fc.string(), (statusCode, message) => {
      assert.deepEqual(toErrorReply(errorWithStatus(message, statusCode)), { kind: "client", statusCode, message });
    }),
  );
});

test("an error with a 5xx status keeps its status and never its message", () => {
  fc.assert(
    fc.property(fc.integer({ min: 500, max: 599 }), fc.string(), (statusCode, message) => {
      assert.deepEqual(toErrorReply(errorWithStatus(message, statusCode)), { kind: "server", statusCode });
    }),
  );
});

test("an error with no status, or one outside 400-599, becomes a 500", () => {
  const unusableStatus = fc.oneof(
    fc.constant(undefined),
    fc.integer().filter((code) => code < 400 || code > 599),
    fc.double({ min: 400, max: 599, noNaN: true }).filter((code) => !Number.isInteger(code)),
  );
  fc.assert(
    fc.property(unusableStatus, fc.string(), (statusCode, message) => {
      assert.deepEqual(toErrorReply(errorWithStatus(message, statusCode)), { kind: "server", statusCode: 500 });
    }),
  );
});

test("a thrown value that is not an Error becomes a 500, whatever it carries", () => {
  fc.assert(
    fc.property(fc.anything(), (thrown) => {
      assert.deepEqual(toErrorReply(thrown), { kind: "server", statusCode: 500 });
    }),
  );
  assert.deepEqual(toErrorReply({ statusCode: 404, message: "not an Error" }), { kind: "server", statusCode: 500 });
});

test("a server error's body names the status and nothing else", () => {
  assert.deepEqual(toErrorBody({ kind: "server", statusCode: 503 }), {
    statusCode: 503,
    error: "Service Unavailable",
  });
});

test("a client error's body carries its message", () => {
  assert.deepEqual(toErrorBody({ kind: "client", statusCode: 400, message: "querystring/n must be a number" }), {
    statusCode: 400,
    error: "Bad Request",
    message: "querystring/n must be a number",
  });
});

test("a status with no standard name is still named in the body", () => {
  fc.assert(
    fc.property(fc.integer({ min: 500, max: 599 }), (statusCode) => {
      const body = toErrorBody({ kind: "server", statusCode });
      assert.equal(typeof body.error, "string");
      assert.notEqual(body.error, "");
    }),
  );
});
