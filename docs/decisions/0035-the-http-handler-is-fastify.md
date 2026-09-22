---
number: 0035
status: accepted
date: 2026-09-22
amended: 2026-09-22
---

# 0035 — The HTTP handler is Fastify

## Forced by

The field was bounded before it was scored.
[ADR-0030](0030-typescript-outside-the-browser-runs-on-node.md) settles that this runs on Node, so
every candidate is scored against Node and source stays inside the syntax Node can strip.
[ADR-0028](0028-the-client-build-and-the-http-server-are-separate-tools.md) removes the class of
toolchains that build the client and answer HTTP together.
[ADR-0018](0018-the-server-does-not-run-in-a-constrained-isolate.md) removes the edge tier, so a
long-lived process costs nothing.

What the layer is scored on comes from what it has to prevent rather than from what it has to do.
Every surveyed candidate routes a handful of endpoints and writes responses, so the eight server
properties this system needs do not separate the field. Four recorded failure modes do, because each
names something the HTTP layer contributes:
[the write endpoint becomes free storage](../failure-modes/the-write-endpoint-becomes-free-storage.md),
whose mitigations include a size limit per object and which states that it produces "no error and no
failed request";
[the durable copy stops being written](../failure-modes/the-durable-copy-stops-being-written.md),
where "nothing reports the failure, because nothing is watching";
[a corrupt board becomes the canonical one](../failure-modes/a-corrupt-board-becomes-the-canonical-one.md),
whose remedy is "validation at the write boundary"; and
[the server hands back state the client will not accept](../failure-modes/the-server-hands-back-state-the-client-will-not-accept.md),
which is a response not matching what the client believes a board is.

[../problem.md](../problem.md) states the maintainer's intent to give this active attention for
years, which is the horizon
[ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
prices supply risk against.

**Of CPU, memory, storage and network, three do not bind and the fourth binds in one specific
place.** CPU does not: the measured spread across the field is 8.9% on a route that reads the store,
which is 0.075ms per request against the 270ms round-trip floor in
[../constraints.md](../constraints.md), and
[ADR-0004](0004-the-client-holds-and-mutates-puzzle-state.md) keeps the server off the path a player
waits on. Memory does not: boot resident set spans twelve megabytes across the whole field and grows
five to seven megabytes over four hundred requests, and the same file records both measurements with
their method. Storage binds the store rather than this layer — what this layer owes it is releasing
the file handle only after the last request is done, which is why an explicit host is part of the
Decision rather than a deployment detail. Network binds at the request body: an endpoint accepting
an unbounded one is
[the write endpoint becomes free storage](../failure-modes/the-write-endpoint-becomes-free-storage.md),
and one 200MB request leaves the process holding over a gigabyte, against a container limit whose
breach is an exit-137 kill with no output.

## Decision

Fastify handles HTTP requests, configured three ways that are part of this decision rather than
incidental to it.

**It binds an explicit host.** Fastify's default `listen({ port })` is dual-stack, `app.server` is
only the main listener, and a request arriving over IPv4 lands on a secondary listener that `close()`
never awaits. Under the default, `onClose` — which Fastify's own hooks reference calls the safe place
to release a database — fires while a request is still running, so the store's handle is released
under a live handler. With an explicit host the same code drains correctly.

**It replaces the default error handler.** Fastify puts `err.message` in the response body and
`NODE_ENV=production` does not change it.

**Its logger is on.** `logger: true` yields a pino child logger per request bound to a generated id,
plus an automatic line for each request and each error, which is what
[the durable copy stops being written](../failure-modes/the-durable-copy-stops-being-written.md) asks
for and what nothing else in the field supplies without assembly.

**Its shutdown reaps connections that fall idle while it is closing.** An explicit host is necessary
and not sufficient. A keep-alive connection that becomes idle after `close()` has begun is never
collected, so the close waits out `keepAliveTimeout`, which Fastify sets to 72,000ms against Node's
own 5,000. Neither `forceCloseConnections` setting helps: `'idle'` is inert and `true` destroys the
request instead of draining it. Reaping while the close runs drains in about 1,100ms with the
handler completing and the client receiving its response.

## Enforced by

Nothing yet. No code exists. What must be true when it does, and the milestone each part lands in:

- The server calls `listen` with an explicit `host`, never the bare `{ port }` form. **M1 slice 1.**
  This is the one item whose absence fails silently, so it is worth a check rather than a habit.
- An error handler is registered that does not place `err.message` in a response body. **M1 slice 1.**
- The shutdown path reaps connections that become idle while it runs, rather than relying on
  `forceCloseConnections`. **M1 slice 1.** Without it a deploy stalls for 72 seconds per shutdown,
  which is visible rather than silent but is long enough to overlap two processes on one store —
  the thing [how does a deploy avoid disturbing the
  store?](../questions/how-does-a-deploy-avoid-disturbing-the-store.md) at M3 exists to prevent.
- The server is constructed with `logger: true`. **M1 slice 1.**
- Routes declare a body schema and a response schema. **M3**, where the first response with content
  in it exists — see [what crosses the client/server
  boundary?](../questions/what-crosses-the-client-server-boundary.md). Until then there is no contract
  to declare, so this half of the record is deliberately unbuilt rather than overlooked.
- A request rate limit, which `@fastify/rate-limit` supplies and which this record does not schedule.
  It belongs with the write endpoint that creates the exposure, not with the handler.

## Rejected

- **Hono** — because the one obligation that cannot be met by adding a package is a response that
  cannot be sent unless it matches its declared shape. Hono checks a declared response at compile
  time and not at run time: with a response schema declared through `@hono/zod-openapi`, a handler
  returning an undeclared field and a wrong type answered 200 with both, so the generated OpenAPI
  document describes a shape the wire does not carry. `hono-openapi`'s `describeRoute` is a
  pass-through that attaches metadata. The gap is closable per route by hand and not by declaration,
  which makes it a discipline that has to hold across every route ever added. Everything else Hono
  lacked did close: `hono/body-limit`, `hono/etag`, and roughly nine lines of middleware over
  `hono/request-id` and pino.

  *Measured — by me on 2026-09-21 against `hono` 4.13.8 and `@hono/zod-openapi` 1.6.3. A route
  declaring `Board` as its 200 response returned
  `{"schemaVersion":1,"puzzleId":"p1","cells":"not-an-array","internalOwnerEmail":"LEAKED@example.com"}`
  with status 200. The same handler is `error TS2345` under `tsc` 7.0.2, which is what makes the gap
  compile-time-only. `hono-openapi`'s `describeRoute` was read at source and is a pass-through.*
- **Bare `node:http`** — because a throwing async handler sends no response at all. The throw becomes
  an unhandled rejection, the process keeps serving, and the client's socket stays open until the
  client gives up. The server sees an unhandled rejection rather than a failed request, and the
  client sees a connection that is still open rather than an error, which is the same shape
  [../constraints.md](../constraints.md) records for a transit stall: it "reports as connected"
  rather than surfacing anything to catch. How long a client waits before calling it is
  [how long until a stalled connection surfaces as an error?](../questions/how-long-until-a-stalled-connection-surfaces-as-an-error.md),
  still open.

  *Measured — by me on 2026-09-21, Node v26.7.0: a `throw` inside an async `createServer` handler
  left the request open until the client's own 15s timeout, with `UNHANDLED` on the server's stdout
  and no response on the wire.*
- **NestJS, Ts.ED and FoalTS** — because each requires decorators to declare a route, and Node's
  TypeScript page states decorators "are not transformed and will result in a parser error", with
  `--experimental-transform-types` removed in v26.0.0. On the line
  [ADR-0031](0031-node-runs-on-the-newest-line-committed-to-lts.md) selects this is a parse failure
  rather than a preference. Reverses if [is server TypeScript transpiled or
  stripped?](../questions/is-server-typescript-transpiled-or-stripped.md) lands on transpilation.
- **The meta-framework servers** — SvelteKit, Astro, TanStack Start, Nuxt, Next and the rest — because
  [ADR-0028](0028-the-client-build-and-the-http-server-are-separate-tools.md) rejects a tool that
  builds the client and answers HTTP.
- **Express, Koa, hapi, restify, Polka, tinyhttp, restana, h3, srvx, itty-router and the
  uWebSockets.js wrappers** — none is disqualified, and saying so is more useful than inventing a
  reason. Each was dropped on the comparison rather than on a defect: none declares a response
  contract, and Express additionally emits a stack trace by default outside production. Where a
  candidate was not measured it is named as such — Elysia's shutdown defect is elysiajs/elysia issue
  1214, filed against its Bun path, and it was not reproduced on its Node adapter here, so Elysia is
  unpursued rather than eliminated.

  *Measured for Express — by me on 2026-09-21: a throwing handler returned a 500 whose HTML body
  contained the thrown message and stack with `NODE_ENV` unset, and a clean `Internal Server Error`
  with `NODE_ENV=production`. Sourced for Elysia — the issue's own text, read by a research agent on
  2026-09-21; I did not open it.*

## Risk

**Thirty-nine installed packages against Hono's one**, which declares no dependencies at all. Most of
Fastify's are `@fastify/*` or pino, whose author leads Fastify, so the third-party surface is narrower
than the count suggests — but it is the larger surface either way, and
[ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md) is the
record that cares.

**A conceptual surface that has already produced one error here.** Encapsulation contexts, decorators,
hooks, avvio's load ordering and the cases needing `fastify-plugin` are five interacting ideas against
Hono's one, and [../problem.md](../problem.md) ranks clarity over cleverness because one person
maintains this. The `onClose` failure above was found by running a spike built to look for it, not by
reading, and it broke a guarantee the framework's own documentation makes.

**Three defaults have to be corrected and the record depends on remembering all of them.** They are
not the same kind of thing. The dual-stack listen and the unreachable `'idle'` setting are defects,
filed upstream as fastify/fastify#7043 and fastify/fastify#7044, and they may be fixed. The error
body is not a defect: Fastify's errors documentation states the message is "`error.message`
verbatim… This applies to every status code, including `500`", warns that "a database driver error,
for example, can leak schema details and query text", and recommends `setErrorHandler` — so it is a
deliberate default with a documented remedy rather than something to report. What the three share is
that the out-of-the-box configuration is the wrong one here, and nothing catches any of them.

**A community package in a load-bearing position.** `fastify-type-provider-zod` is not maintained in
the `fastify` organisation, and [ADR-0036](0036-request-and-response-bodies-are-described-with-zod.md)
rests on it.

## Revisit when

- Hono gains a first-party way to reject a response that does not match its declared schema at run
  time. That is the single property this record turns on, and it would remove the reason.
- Fastify's published support window lapses without a successor, or its default `listen` stops
  reaching a secondary listener that `close()` ignores — the second would remove a stated risk rather
  than the decision.
- The server grows beyond a handful of endpoints into something whose composition the plugin model
  serves rather than taxes, which would turn a recorded cost into a benefit and is worth noticing
  either way.

## Also update

- [x] questions/README.md — removes the HTTP handler from M1's open list; the renderer, the floor
      format and what a browser below the floor sees remain
- [x] architecture.md — names what answers HTTP, which it previously listed as undecided
- [x] constraints.md — imports the fact that decorators are a parse error on this Node line
- [x] glossary.md — no new domain terminology
- [x] guarantees/ — no promise to players falls out of this; the obligations it creates are recorded
      under **Enforced by** and in [../failure-modes/](../failure-modes/)
