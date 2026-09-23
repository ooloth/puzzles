import { z } from "zod";

/**
 * An IP literal rather than a hostname. A hostname such as `localhost` makes Fastify listen on every
 * address it resolves to, and `close()` does not wait for requests on the extra listeners — see
 * ADR-0035.
 */
const ListenHost = z
  .union([z.ipv4(), z.ipv6()], { error: "must be an IP address such as 127.0.0.1, not a hostname" })
  .brand<"ListenHost">();
export type ListenHost = z.infer<typeof ListenHost>;

/** `0` is valid and asks the operating system for any free port. */
const ListenPort = z
  .string()
  .regex(/^\d+$/, "must be written in digits only")
  .transform(Number)
  .pipe(z.int().min(0).max(65_535))
  .brand<"ListenPort">();
export type ListenPort = z.infer<typeof ListenPort>;

export type ServerConfig = { readonly host: ListenHost; readonly port: ListenPort };

export type ServerConfigResult =
  | { readonly ok: true; readonly config: ServerConfig }
  | { readonly ok: false; readonly problems: readonly string[] };

const ServerEnv = z.object({
  HOST: z.string().default("127.0.0.1").pipe(ListenHost),
  PORT: z.string().default("3000").pipe(ListenPort),
});

export function parseServerConfig(env: Readonly<Record<string, string | undefined>>): ServerConfigResult {
  const parsed = ServerEnv.safeParse(env);
  if (!parsed.success) {
    return { ok: false, problems: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`) };
  }
  return { ok: true, config: { host: parsed.data.HOST, port: parsed.data.PORT } };
}
