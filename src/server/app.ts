import assert from "node:assert/strict";
import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import type { ServerConfig } from "./config.ts";
import { toErrorBody, toErrorReply } from "./errors.ts";

/** Where log lines go. Always stdout outside tests; the logger itself is never off. */
export type LogDestination = { write(line: string): void };

export type BuildServerOptions = { readonly logDestination?: LogDestination };

export function buildServer(options: BuildServerOptions = {}) {
  const app = Fastify({
    logger: options.logDestination ? { stream: options.logDestination } : true,
  }).withTypeProvider<ZodTypeProvider>();

  // Wired before any route declares a schema, so no route is ever written against an unwired
  // serializer — see ADR-0036.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Fastify's default puts the thrown error's message in the body at every status — see ADR-0035.
  app.setErrorHandler((error, request, reply) => {
    const errorReply = toErrorReply(error);
    if (errorReply.kind === "server") request.log.error({ err: error }, "request failed");
    else request.log.info({ err: error }, "request rejected");
    return reply.status(errorReply.statusCode).send(toErrorBody(errorReply));
  });

  app.get("/hello", () => "Hello!");

  return app;
}

export type PuzzleServer = ReturnType<typeof buildServer>;

export async function startServer(app: PuzzleServer, config: ServerConfig): Promise<void> {
  // Always an explicit host, never the bare `{ port }` form: the default listens on every address
  // `localhost` resolves to, and `close()` waits only for the first — see ADR-0035.
  await app.listen({ host: config.host, port: config.port });
  assert.equal(app.addresses().length, 1, "the server is listening on more than one address");
}
