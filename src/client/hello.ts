/** Relative, so the browser asks the page's own origin — see ADR-0040 and ADR-0041. */
export const helloPath = "/api/hello" satisfies `/api/${string}`;

/**
 * What asking the server for the greeting came to. Only `answered` carries text, so an error body,
 * a proxy's error page or the entry document can never be shown as if it were the answer.
 */
export type HelloOutcome =
  | { readonly kind: "answered"; readonly text: string }
  | { readonly kind: "error-status"; readonly status: number }
  | { readonly kind: "not-plain-text"; readonly contentType: string | null }
  | { readonly kind: "unreachable"; readonly cause: unknown };

/** A media type's essence ignores parameters such as `charset`, and its case. */
function isPlainText(contentType: string): boolean {
  const essence = contentType.split(";")[0] ?? "";
  return essence.trim().toLowerCase() === "text/plain";
}

/**
 * The status and content type are checked before the body is read. A dev server with no proxy
 * rule, or a fallback that answers every path, sends the entry document with a 200.
 */
export async function readHello(response: Response): Promise<HelloOutcome> {
  if (!response.ok) return { kind: "error-status", status: response.status };
  const contentType = response.headers.get("content-type");
  if (contentType === null || !isPlainText(contentType)) return { kind: "not-plain-text", contentType };
  return { kind: "answered", text: await response.text() };
}

/**
 * A request that fails, or a body cut off while it is read, becomes an outcome rather than a
 * rejection, so the caller handles one type.
 */
export async function loadHello(signal: AbortSignal): Promise<HelloOutcome> {
  try {
    return await readHello(await fetch(helloPath, { signal }));
  } catch (cause) {
    return { kind: "unreachable", cause };
  }
}
