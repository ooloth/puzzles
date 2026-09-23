import assert from "node:assert/strict";
import { STATUS_CODES } from "node:http";

/**
 * What a failed request is answered with. A server error carries no message, so the text of whatever
 * was thrown cannot reach the client — see ADR-0035. A client error keeps its message, because that
 * is how a rejected request body names the field at fault — see ADR-0036.
 */
export type ErrorReply =
  | { readonly kind: "client"; readonly statusCode: number; readonly message: string }
  | { readonly kind: "server"; readonly statusCode: number };

export type ErrorBody =
  | { readonly statusCode: number; readonly error: string; readonly message: string }
  | { readonly statusCode: number; readonly error: string };

function isStatusBetween(statusCode: unknown, lowest: number, highest: number): statusCode is number {
  return typeof statusCode === "number" && Number.isInteger(statusCode) && statusCode >= lowest && statusCode <= highest;
}

/**
 * Only an `Error` carrying a 4xx or 5xx status keeps that status. Anything else thrown is a bug on
 * this side of the boundary, so it becomes a 500.
 */
export function toErrorReply(thrown: unknown): ErrorReply {
  if (!(thrown instanceof Error)) return { kind: "server", statusCode: 500 };
  const statusCode = "statusCode" in thrown ? thrown.statusCode : undefined;
  if (isStatusBetween(statusCode, 400, 499)) return { kind: "client", statusCode, message: thrown.message };
  if (isStatusBetween(statusCode, 500, 599)) return { kind: "server", statusCode };
  return { kind: "server", statusCode: 500 };
}

export function toErrorBody(reply: ErrorReply): ErrorBody {
  const error = STATUS_CODES[reply.statusCode] ?? (reply.kind === "client" ? "Client Error" : "Server Error");
  switch (reply.kind) {
    case "client":
      assert.ok(reply.statusCode >= 400, `client error status ${reply.statusCode} is below 400`);
      assert.ok(reply.statusCode <= 499, `client error status ${reply.statusCode} is above 499`);
      return { statusCode: reply.statusCode, error, message: reply.message };
    case "server":
      assert.ok(reply.statusCode >= 500, `server error status ${reply.statusCode} is below 500`);
      assert.ok(reply.statusCode <= 599, `server error status ${reply.statusCode} is above 599`);
      return { statusCode: reply.statusCode, error };
    default: {
      const unreachable: never = reply;
      return unreachable;
    }
  }
}
