---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What handles HTTP requests on the server?

**Scoped to the HTTP layer, not the runtime.** Which runtime executes the code was settled by
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) as Node; this is
what sits on top of it to route a request and write a response — a framework, or the runtime's own
server API and nothing else.

**`node:http` is a candidate here, and a framework assuming it is no longer a constraint on
anything.** The runtime is settled, so every option below is scored against Node and nothing here can
settle a runtime by accident. The edge tier does not enter it either:
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md) removes that
runtime for every option below, so nothing is chosen or rejected on whether it would run there.

**No coupling to the renderer remains either.** The coupling was a toolchain owning both the client
build and the request path, so that choosing one settled the other by consequence, and
[ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md) removed that
class. This question now chooses a handler and nothing else, and it is answered on its own rather
than alongside [what renders the client?](what-renders-the-client.md).

## Why it matters

It is a small decision that looks like a big one, and worth recording mainly so it is not made by
whichever framework the first tutorial used. The server this project needs is a handful of endpoints
that put and fetch bytes — every candidate can do that, so the choice turns on how much it brings
with it and how reversible it is.

## What would settle it

Very little, once the runtime lands. The one criterion worth applying deliberately is reversibility:
handle requests behind an interface thin enough that swapping what implements it is a small change
rather than a rewrite.

**It was coupled to [what renders the client?](what-renders-the-client.md) and is no longer.** The
coupling was a meta-framework's own server, choosing which was also choosing the renderer.
[ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md) settles that no single tool owns both the client build and the HTTP request path, so
that option is gone and this question now chooses a handler and nothing else.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, filling in the stack decisions that had no question of their own.

## Options

*The runtime's own server API, and nothing else.* `node:http`, `Bun.serve`, `Deno.serve`. No
dependency, no upgrade treadmill, nothing to learn that is not already the runtime. Routing and
request parsing are ours to write, which for a handful of endpoints is a small amount of code and for
more than that stops being one.

*A minimal router.* Hono, itty-router and similar: routing, middleware and a request/response
abstraction, in a few kilobytes. Most of them target the web-standard `Request`/`Response` interface,
which keeps a handler portable across runtimes. That is worth something after
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) rather than nothing: it
is what this record's own **Findings** call optionality retained, not a live requirement.

*A full framework.* Express, Fastify and similar. Conventions, middleware ecosystems, and
documentation aimed at people who have not read this repo. Larger surface to keep patched, and
several assume a long-lived process — which costs nothing here, since
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md) already settles that
the server is one.

*A meta-framework's own server, serving API routes alongside a prerendered entry document.*
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) settles
that the document is a build output and explicitly does *not* exclude the framework that builds it
from also answering HTTP. SvelteKit's `adapter-node` with `prerender` on the root layout, Astro's
`output: 'static'` with `export const prerender = false` on each API endpoint, and
TanStack Start's `prerender` with server functions are all this shape. **The whole class is out**, by
[ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md): a tool that builds the client and answers HTTP is what that record rejects. The class
is kept in this list because its eliminations are worth not re-deriving, and because Next was out on
its own separate grounds before that record existed — under `output: 'export'` a route handler that
reads the request is unsupported. **Reverses if** [ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md) does.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The field was rebuilt from registries on 2026-09-16, and nothing in it is eliminated by a binding
property.** The-benchmarker's `web-frameworks` repository carries roughly fifty JavaScript
implementations; npm's keyword listings for `router`, `http-server` and `web-framework` return a long
unfiltered tail beyond them. Profiled with download counts, release dates and licences: Express, Koa,
Fastify, Hapi, Hono, h3, Restify, Restana, Polka, tinyhttp, NestJS, AdonisJS, Sails, Foal, Ts.ED,
Feathers, Moleculer, Elysia, itty-router, worktop, find-my-way, trouter, hyper-express and
ultimate-express, plus the meta-framework servers Next, Nuxt, React Router, SvelteKit, Astro, TanStack
Start, Qwik City and Analog.

That is the whole finding. [../problem.md](../problem.md) and the records ask this layer to route a
handful of endpoints and write responses, and every candidate does that, so no property in [what must
the client and the server each be able to
do?](what-must-the-client-and-server-be-able-to-do.md) separates them. The question is decided on
reversibility and on the coupling to the renderer, exactly as **What would settle it** says.

*Sourced — the npm registry search API, the-benchmarker's `javascript/` directory listing, the
WinterTC runtime-keys registry and each project's own documentation, read 2026-09-16 by a research
agent. I did not open them. The agent flagged that it queried npm only and not JSR, so Deno-native
packages distributed through JSR are absent from this field.*

**There is no registry of runtimes a framework is compatible with, and the claim that one exists is
wrong.** WinterTC maintains a registry of *runtime keys*, not of frameworks. A framework describing
itself as WinterCG-compatible is self-declaring, and nothing lists or checks it.

*Sourced — [runtime-keys.proposal.wintertc.org](https://runtime-keys.proposal.wintertc.org/) and the
WinterTC admin repository, read 2026-09-16 by a research agent. I did not open them.*


**Targeting the web-standard `Request` and `Response` interfaces is what keeps this reversible.**
A handler written against them runs under every candidate runtime and under most routers, which makes
this choice a small change rather than a rewrite.

*Reasoned — from the interfaces being defined by the Fetch specification rather than by any runtime.*

**This is a property candidates are scored on, not a decision that gates the runtime.** Answering it
does not narrow the runtime field; it removes a constraint on it, which is the opposite. And it costs
one candidate slightly more than the others: `Bun.serve` and `Deno.serve` take a `Request` and return
a `Response` natively, while `node:http` does not and needs a thin adapter. That is a thumb on the
scale, not a disqualifier.

**Naming what the optionality is for, since keeping an option open is not free.** Two of the three
reasons are real here and one is weak.

- **Testability.** A handler called with a `Request` and asserted on its `Response` needs no socket,
  no port and no process. That holds whatever else is chosen.
- **Alignment with the service worker.**
  [ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md) puts a
  service worker on every navigation after the first, and a service worker's fetch handler *is*
  `Request` in, `Response` out. If it ever synthesises a response that mirrors a server route while
  offline, the two are already the same shape.
- **Runtime portability.** Weak, and weak for a reason worth stating precisely. It is not that the
  runtime will never change; it is that
  [ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
  makes the runtime the position whose replacement cost is priced highest, and a portable handler
  lowers the cost of a swap that is expensive for reasons the handler does not touch. It buys a small
  fraction of a large bill.

**The Next elimination holds exactly as stated, and it is the only elimination in this field.** Under
`output: 'export'`, Next's own guide says "Only the `GET` HTTP verb is supported", that a handler must
be marked `export const dynamic = 'force-static'`, and that "If you need to read dynamic values from
the incoming request, you cannot use a static export". Its Unsupported Features list names "Route
Handlers that rely on Request", along with Cookies, Headers, Rewrites, Redirects and Server Actions.

So the precise claim is that a request-reading handler is unsupported, not that route handlers are
dropped wholesale: a `GET` handler that reads nothing from the request still builds to a static file.
That distinction does not rescue Next here, because the endpoints this system needs read the request.
**Reverses if** Next supports request-reading handlers under a static export, or if this system's
document stops being a build output, which would reverse
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md).

*Sourced — [nextjs.org/docs/app/guides/static-exports](https://nextjs.org/docs/app/guides/static-exports),
opened and quoted by me on 2026-09-17 against the page's stated version 16.3.5.*

**Two of the shapes named under Options need stating more precisely than the Options section does.**

- **Astro's coexistence mechanism is the per-route override, not the adapter.** `output: 'static'` is
  still current and still the default, and `'hybrid'` no longer exists as a value. What makes an API
  endpoint live alongside a prerendered document is `export const prerender = false` on that endpoint:
  "In `static` mode, you must opt out of prerendering for each custom endpoint". The Node adapter's own
  page does not state the combination, so the adapter alone does not describe it.
- **TanStack Start is a release candidate, not a stable release.** Its overview says "TanStack Start is
  currently in the **Release Candidate** stage! This means it is considered feature-complete and its
  API is considered stable." The published version is `@tanstack/react-start@1.168.56`, with no 1.0 GA
  cut. The prerender-plus-server-functions shape is real and documented; the stability caveat is new
  information for a project weighing this field.

*Sourced — Astro's configuration reference, on-demand-rendering guide and endpoints guide, and
TanStack Start's overview plus npm registry metadata, read 2026-09-17 by a research agent. I did not
open them.*

**The field survey's npm-only gap is real, and two Deno-native frameworks fall in it.** `@oak/oak` at
17.2.0 ("A middleware framework for handling HTTP with Deno, Node.js, Bun and Cloudflare Workers") and
`@fresh/core` at 2.3.3 are published on JSR and absent from npm under those names. The unscoped npm
packages `oak` and `fresh` are unrelated projects, an Electron kiosk framework and an HTTP
freshness-header utility, so an npm-only survey searching by name would miss both or match the wrong
thing. A broader JSR search surfaced mostly small utilities rather than further frameworks, so treat
this as two verified examples rather than a complete list.

*Sourced — [jsr.io/@oak/oak](https://jsr.io/@oak/oak), [jsr.io/@fresh/core](https://jsr.io/@fresh/core),
and npm 404s for both scoped names, read 2026-09-17 by a research agent. I did not open them. This
closes the gap the 2026-09-16 survey flagged about itself.*

**This is the cheapest position in the stack to leave, so stewardship carries almost no weight here.**
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
prices a supply concern by what replacing the thing costs, and a handler written against the
web-standard `Request` and `Response` interfaces sits behind an interface thin enough that swapping
what implements it is a small change. So the facts below are recorded and none of them eliminates
anything: Hono is individual-led by Yusuke Wada with 414 commits from 132 authors; Elysia states on its
own site that it is owned by no organisation, with 437 commits from 33 authors and its top human at
69.6%; h3 is led by Pooya Parsa with 448 commits from 57 authors and npm's `latest` tag pointing at a
release candidate. **A pre-1.0 or RC version number disqualifies nothing in this class**, which is the
opposite of how the same fact read for the runtime, which
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) settled.

The meta-framework servers are not in that class, because choosing one is also choosing the renderer
and the build. There the replacement cost is the client half, and TanStack Start's release-candidate
status is worth what it is worth for that reason rather than on its own.

*Measured — `gh api --paginate repos/<owner>/<repo>/commits?since=2025-09-17` over the twelve months to
2026-09-17, grouped by author, run by a research agent that stated its command. I did not run it.*

**Confirmed against source, and worth recording because a result that changes nothing is still a
result.** WinterTC's registry is runtime keys only and describes its own purpose as "to prevent conflicts and provide a reliable, authoritative source of
runtime identifiers", with nothing about frameworks. `Bun.serve` and `Deno.serve` still take a
`Request` and return a `Response` natively, and `node:http` still passes `IncomingMessage` and
`ServerResponse` with no Fetch-style server API anywhere in core, which is why adapters exist for it.
Current versions and licences in the minimal-router class: Hono 4.13.8 MIT, Elysia 1.4.30 MIT with a
v2 in beta, and h3 with npm's `latest` tag pointing at `2.0.1-rc.32` while the last stable major is
`1.15.11` under the `1x` tag, so `npm install h3` today installs a release candidate.

*Sourced — each project's own documentation and npm registry dist-tags, read 2026-09-17 by a research
agent. I did not open them.*

**M1 needs one route returning a fixed string.** Nothing about that discriminates between the options
above, so this must be decided on what the rest of the system will need rather than on what the first
endpoint needs. What crosses the boundary is settled at M3 — see
[what crosses the client/server boundary?](what-crosses-the-client-server-boundary.md).

**Every version, licence and quoted claim above still held on 2026-09-21.** Re-checked: Hono 4.13.8
MIT, Elysia 1.4.30 MIT, Fastify 5.12.5 MIT, Express 5.2.1 MIT, Koa 3.2.1 MIT, Polka 0.5.2 MIT,
itty-router 5.0.24 MIT. h3's `latest` dist-tag still points at `2.0.1-rc.32` with `1x` at `1.15.11`,
so `npm install h3` still installs a release candidate. Next's static-export quotes and TanStack
Start's release-candidate wording are unchanged, and `@tanstack/react-start` is still `1.168.56`.
Astro still has `'static'` as the default and still has no `'hybrid'` value.

*Sourced — the npm registry API and each project's own documentation, read 2026-09-21 by a research
agent. Of this batch I opened only the registry JSON for `srvx` and `@hono/node-server` myself; the
rest are the agent's and I did not open them.*

**`node:http` still has no Fetch-style server API, and what supplies one is a maintained package
rather than code we would write.** Node 26.9.0's `http` documentation still gives
`http.createServer([options][, requestListener])` with an `IncomingMessage` and a `ServerResponse`,
and nothing on that page accepts a `Request` or returns a `Response`. Four packages close the gap and
they are not equally alive: `srvx` 1.0.5 published 2026-09-14 MIT, `@hono/node-server` 2.1.1 published
2026-08-14 MIT, `@remix-run/node-fetch-server` 0.14.1 published 2026-08-14, and
`@mjackson/node-fetch-server` 0.7.0 published 2025-06-06, which is the stale one. So the finding above
that `node:http` "needs a thin adapter" is confirmed and now priced: the thumb on the scale is one
dependency, not a piece of work.

*Sourced — [nodejs.org/api/http.html](https://nodejs.org/api/http.html) at v26.9.0, and the npm
registry JSON for `srvx` and `@hono/node-server`, opened by me on 2026-09-21. The two Remix-lineage
packages' versions and dates are a research agent's and I did not open them.*

**The axis the survey scored on cannot discriminate, and two axes it did not examine might.** The
equivalence finding above concludes that every candidate routes a handful of endpoints and writes
responses. That is true, and it is the whole content of the equivalence. It runs through
[what must the client and the server each be able to do?](what-must-the-client-and-server-be-able-to-do.md),
whose eight server properties say nothing about either of these:

- **Serving the client's files, and setting a cache header per asset class.**
  [What serves the client's files in production?](what-serves-the-clients-files-in-production.md)
  lists *the same process that answers the API* as a live option, so that option's cost is set by
  whatever is chosen here. `node:http` has no static file serving at all; Hono, Fastify and Express
  each ship a maintained one.
- **Draining in-flight requests on shutdown.** [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md)
  and [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) put a SQLite file
  beside the process, and M1 slice 4 already requires a host that can deploy without two processes
  holding one file. What closes the listener and waits for open requests before the file handle goes
  is a property of this layer.

**Neither turns this into a gate, and neither is a door.** No candidate forecloses any of the three
options in [what serves the client's files in production?](what-serves-the-clients-files-in-production.md),
because a handler can always serve no files and a static middleware can always be added. That file
also says its own binding input is what the chosen host offers, and
[where does this run?](where-does-this-run.md) is open at slice 4 — so deciding static serving here
would settle it ahead of its input. Both axes are therefore scored, not gated, in the same sense this
file already uses for `Request`/`Response`.

*Reasoned — from the three question files and two records linked above, read 2026-09-21 by me.*

**Path-routing the API under the app's own hostname discriminates nothing, and is recorded so a later
reader can see it was checked.** [../constraints.md](../constraints.md) makes that arrangement the one
that skips Safari's first-party test entirely, and a second hostname caps the cookie at seven days.
Every candidate in this field can path-route, so nothing leaves the field on it.

*Reasoned — 2026-09-21.*

### Pass of 2026-09-21 — the field rebuilt, and the first binding elimination in it

**A whole class is eliminated, and the earlier survey missed it: the decorator-based frameworks
cannot run on the line [ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md)
selects.** Node 26's own TypeScript page says decorators "are not transformed and will result in a
parser error", and that the escape hatch is gone: its history table reads "v26.0.0 — Removed
`--experimental-transform-types` flag." NestJS, Ts.ED and Foal each require decorators to declare a
route — Ts.ED: "In order to create a basic controller, we use classes and decorators"; Foal: "These
methods must be decorated by one of these decorators Get, Post, Patch, Put, Delete, Head or Options."
So each is a parse error under Node's native type stripping rather than a preference.

**The elimination is conditional, and the condition is what makes it safe to apply now.** It holds
while server TypeScript is stripped rather than transpiled, which is open at
[is server TypeScript transpiled or stripped?](is-server-typescript-transpiled-or-stripped.md) at M2.
Choosing one of these frameworks here would answer that M2 question by consequence — it would force a
transpiler at M1 — which is the out-of-order move the portable decision-making standard forbids.
Eliminating them here assumes only what M1 already does. **Reverses if** that M2 question lands on
transpilation.

*Sourced — [nodejs.org/api/typescript.html](https://nodejs.org/api/typescript.html) at v26.9.0,
opened and quoted by me on 2026-09-21. The Ts.ED and Foal quotes are a research agent's and I did not
open them.*

**AdonisJS is not eliminated with them, and the reason is worth keeping.** Its routing binds
controllers as plain classes with the route declared separately, so no decorator is required to serve
a request. Its bundled ORM, Lucid, does use `@column` decorators — which matters only if that ORM is
used, and [which driver reads and writes the store?](which-driver-reads-and-writes-the-store.md) at M3
is where that would be decided.

*Sourced — AdonisJS and Lucid documentation, read 2026-09-21 by a research agent. I did not open them.*

**Draining in-flight requests separates the field, which is the second axis nothing had scored.**
Fastify documents the most: `forceCloseConnections` taking `true`, `false` or `"idle"` — the last
"will iterate the current persistent connections which are not sending a request or waiting for a
response and destroy their sockets" — plus `return503OnClosing` and a `keepAliveTimeout` defaulting to
72000. `srvx` documents the distinction as one argument: "By default, calling close does not cancel
in-flight requests or websockets", with `server.close(true)` to terminate them. **Elysia carries an
open defect here**: elysiajs/elysia issue 1214, "SIGINT during in-flight request causes abrupt
termination in Elysia (pending handlers are aborted)", still open, filed against 1.3.1, reporting that
the process "exits instantly" where Bun's native server waits. Koa has no first-party shutdown API at
all. Bare `node:http`, Hono, Polka, h3 and itty-router all reduce to `server.close()`.

*Sourced — [fastify.dev/docs/latest/Reference/Server/](https://fastify.dev/docs/latest/Reference/Server/)
and [github.com/elysiajs/elysia/issues/1214](https://github.com/elysiajs/elysia/issues/1214), opened
and quoted by me on 2026-09-21. The srvx, Koa, Hono, Polka, h3 and itty-router readings are a research
agent's and I did not open them.*

**Static serving separates the field as well, and not in the direction the class names suggest.** Of
the candidates with a first-party or de-facto static solution, `srvx` and `@fastify/static` are the
only two a research agent could confirm implement all of ETag conditional requests, Range, traversal
protection and precompressed `.br`/`.gz` lookup. Hono's `serveStatic` sets `Last-Modified` but the
agent found no conditional-request handling in its source; h3's has no Range handling in its source;
`@elysiajs/static` has no Range handling and applies one flat header object to every file, with no
per-extension callback. Express and bare `node:http` both reach `serve-static`, which documents ETag,
Last-Modified and Range but no precompressed variants. Only Express, `node:http`, Fastify, Koa and
Polka expose a `setHeaders`-style per-file callback; `srvx` and Elysia require a second mount at a
second prefix to give the entry document a different `Cache-Control` from the hashed assets.

*Sourced — each project's documentation and, where the documentation was silent, its source, read
2026-09-21 by a research agent. I did not open any of these. Treat the source readings as the weakest
of them: an absence found by reading code is easier to get wrong than a presence.*

**The earlier field survey was incomplete, and the gap was structural rather than careless.** Options
it did not list, each invisible to an npm keyword search for `router`, `http-server` or
`web-framework`: `srvx` and `@trpc/server` and `encore.dev` all publish with empty or unrelated
`keywords`; uWebSockets.js is not published to npm at all under its real name, and the `uwebsockets.js`
that is there is a deprecated 2021 fork; `graphql-yoga` is keyworded only for GraphQL. Also absent and
ordinary: `find-my-way`, `tinyhttp`, `restana`, `0http`, `rou3`, `hyper-express`, `ultimate-express`,
`@hapi/hapi`, `restify` and `node:http2`.

*Sourced — the npm registry API's `keywords` fields, JSR, and the-benchmarker/web-frameworks'
`javascript/` listing, read 2026-09-21 by a research agent. I did not open them.*

### Pass of 2026-09-21 — the shutdown axis, measured

**Method.** A throwaway spike, since deleted, outside this repository. For each candidate: a server
opening a SQLite file through `node:sqlite` in WAL mode, one route that writes a row, sleeps 3000ms,
writes a second row and responds; a driver that fires that route on its own non-keep-alive socket,
sends `SIGTERM` 500ms in, awaits the candidate's documented graceful close, then closes the database
handle and lets the process drain with no `process.exit`. Recorded per run: whether the client
received its response, how long the close took to resolve, how many requests were still running when
the handle was released, and which rows survived. Node v26.7.0, macOS Darwin 25.6.0, Apple M2 arm64,
against `hono` 4.13.8, `@hono/node-server` 2.1.1, `fastify` 5.12.5, `express` 5.2.1 and `srvx` 1.0.5.
Two repeats per candidate without an idle keep-alive socket parked, one with.

**Seven of eight configurations drain correctly, and the differences between them are noise.** Bare
`node:http`, Express, Hono, `srvx` with its shutdown plugin disabled, and Fastify bound to an explicit
host all resolved their close at 2502–2522ms — the 2500ms the handler had left — with zero requests
in flight when the handle was released, the client holding a 200, and both rows in the store. `srvx`
with its default plugin took 3010–3028ms because that plugin polls in one-second ticks. **So this axis
does not separate the field on the thing the documentation made it look like it would.** Every
candidate reduces to `server.close()`, and `server.close()` works.

**Fastify on its default `listen({ port })` does not drain, and the way it fails is the problem.**
Across three runs its close resolved in 2, 3 and 4ms with the request still running. The database
handle was then released under the live handler; the handler resumed 2.5 seconds later, and
`insert.run(...)` threw `ERR_INVALID_STATE: statement has been finalized`. The client received
**HTTP 500** carrying that internal message, and the store kept the first row with no second —
**a half-written record, produced by an ordinary deploy, with nothing logged.** `forceCloseConnections:
'idle'` and `return503OnClosing` changed none of it.

**The cause is dual-stack listening, and it is one option to avoid.** Fastify's default listen binds
both stacks by creating a main server and a secondary one. `app.server` is only the main one, so a
request arriving over IPv4 lands on a listener that `close()` never awaits, and `app.server.
getConnections()` reports **0 while that request is being handled** — where bare `node:http`, Express
and Hono all report 1. Varying the bind host and the client's address family isolates it completely:
default bind with an IPv4 client is the only combination that fails, and `host: '0.0.0.0'`,
`host: '::'`, or an IPv6 client all wait the full 2300ms.

*Measured — by me on 2026-09-21, method and versions above, three runs of the failing case and five
runs of the bind-host matrix. This contradicts the shutdown lifecycle in Fastify 5.12.5's own bundled
`docs/Reference/Server.md`, which states at step 5 that when the promise resolves "All in-flight
requests have completed and the server is no longer listening."*

**What this does and does not settle.** It does not disqualify Fastify: binding explicitly is one
option, and a deployed server names its host anyway. What it establishes is that the graceful-shutdown
axis separates candidates by whether a framework's own default configuration keeps its server object
in sync with the sockets it accepted — not by which of them documents a shutdown API. It is also a
worked instance of the correctness promise
[../guarantees/README.md](../guarantees/README.md) lists as a candidate but has not made, that a
partial write is never observable.

**An idle keep-alive socket blocked nothing, for any candidate.** This was expected to be the trap and
is not one on this Node line: `server.close()` reaps idle connections by itself since Node 19, and
parking an idle keep-alive socket changed no timing anywhere in the matrix. Recorded because a
negative result stops the next reader spending the same hours.

*Measured — same method and runs as above, the keep-alive variant.*

**`srvx` installs a SIGTERM handler of its own, which is worth knowing before adopting it.** Its
`gracefulShutdownPlugin` registers on SIGINT and SIGTERM by default — it is skipped only when `CI` or
`TEST` is set in the environment — closes the server with a five-second budget, and prints progress to
stderr. A hand-rolled handler races it rather than replacing it. Turning it off is
`gracefulShutdown: false`.

*Measured — read from `srvx` 1.0.5's own `dist/_chunks/_plugins.mjs` and confirmed by running both
settings, by me on 2026-09-21.*

### Pass of 2026-09-21 — the axes derived from the failure modes, measured

**Where these axes came from.** Not from the candidates and not from this file. Enumerating the
moments the server touches CPU, memory, storage and network, then reading
[../failure-modes/](../failure-modes/) for what is already known to go wrong here, produces axes the
earlier survey had no reason to look for. Two failure modes supplied most of them:
[the write endpoint becomes free storage](../failure-modes/the-write-endpoint-becomes-free-storage.md),
whose named mitigation is "size limits per object", and which states that it produces "no error and no
failed request"; and
[the server hands back state the client will not accept](../failure-modes/the-server-hands-back-state-the-client-will-not-accept.md),
whose mitigations are validation and an explicit schema version.

**Method.** Same machine and Node as the previous pass — Node v26.7.0, macOS Darwin 25.6.0, Apple M2
arm64 — against `hono` 4.13.8, `@hono/node-server` 2.1.1, `fastify` 5.12.5, `express` 5.2.1,
`srvx` 1.0.5, `serve-static` 2.2.1 and `@fastify/static` 10.1.4. Each candidate served its own
routes using **its default body parser rather than a hand-written one**, which matters: a first
attempt wrote a custom Fastify content-type parser and a raw Express parser, and both bypassed the
very defaults being measured. Static serving used a directory shaped like the real build output — a
content-hashed asset, an entry document and a service worker script. The spike is deleted.

**A default request body limit is the sharpest discriminator found in this field.** Posting a 1MB,
20MB and 200MB JSON body:

- **Fastify** refuses all three with `413 FST_ERR_CTP_BODY_TOO_LARGE`. Its `bodyLimit` defaults to
  1 MiB and applies without being asked for.
- **Express** refuses all three with 413, because `express.json()` defaults to a 100kb limit.
- **Hono**, **srvx** and bare **`node:http`** accept all three, including 200MB. Each has a facility
  and none of it is on: Hono ships a `hono/body-limit` middleware, srvx takes a
  `maxRequestBodySize` option that its adapter treats as unlimited while undefined, and `node:http`
  has nothing at all.

**What being wrong here costs is measurable, and it is not the bandwidth.** After one 200MB request
the process sat at 953MB resident under `node:http` and 1346MB under both Hono and srvx, still
unreclaimed when the run ended. [../constraints.md](../constraints.md) records at the *Measured*
tier that a runtime's heap limit governs the JS heap only, so a process exceeding its container's
memory is killed by the kernel with exit 137 and no output. So the chain is one unauthenticated
request to an OOM kill of the process holding the store open, and the failure mode above already says
nobody would see an error.

*Measured — by me on 2026-09-21, method above, one run per candidate per body size.*

**What reaches the client when a handler throws separates them too, and bare `node:http` is worst.**
Throwing inside an async handler:

- **`node:http`** sends **no response at all**. The throw becomes an unhandled rejection, the process
  survives and keeps serving, and the client's socket simply hangs — the request was still open when
  the client gave up at 15 seconds. [../constraints.md](../constraints.md) records that a stalled
  connection throws no error, so this is invisible on both ends.
- **Express** returns 500 with a full stack trace rendered into HTML by default, and returns a clean
  `Internal Server Error` under `NODE_ENV=production`.
- **Fastify** returns 500 with `err.message` in the JSON body — `{"statusCode":500,"error":"Internal
  Server Error","message":"kaboom: secret internal detail"}` — and **setting `NODE_ENV=production`
  does not change it**. This is the same leak the shutdown spike produced, where the message handed to
  the client was `statement has been finalized`.
- **Hono** returns 500 with `Internal Server Error`, and **srvx** returns 500 with an empty body.
  Neither leaks.

*Measured — by me on 2026-09-21, each candidate run with `NODE_ENV` unset and Express and Fastify run
again with `NODE_ENV=production`.*

**On static serving the earlier documentation reading was right about Hono and wrong about Fastify
and srvx.** Serving the build-shaped directory with `immutable` on the hashed asset and `no-cache` on
the document and the service worker: `node:http` with `serve-static`, Express, Fastify with
`@fastify/static`, and srvx all set a different `Cache-Control` per class and answer both
`If-None-Match` and `If-Modified-Since` with a 304, out of the box. **Hono is the exception**: its
`serveStatic` emits no `ETag` and ignores `If-Modified-Since`, so every revalidation is a full
re-download on the weak mobile link [../problem.md](../problem.md) names as the modal case. Adding
Hono's own `hono/etag` middleware restores `ETag` and the 304; `If-Modified-Since` still returns 200.
srvx needed two mounts and a wrapper because its `maxAge` and `immutable` are per-mount rather than
per-file, which is roughly twenty lines against five.

*Measured — by me on 2026-09-21. Two earlier readings of this were my own instrument's fault rather
than the candidates': a Node-style `setHeader` call in `@fastify/static`'s `setHeaders`, which hands
back a Fastify `Reply`, and an import of `serveStatic` from `srvx/static`, which exports
`staticMiddleware`. Both scored full marks once corrected, so the documentation-derived table in the
pass above understates them.*

**Memory and startup do not discriminate, and are recorded so nobody measures them again.** Boot
resident set ranged from 66.1MB (`node:http`) to 77.9MB (Fastify) and grew by five to seven megabytes
across four hundred requests for every candidate. Startup from spawn to first served response ranged
from 54ms (`node:http`, srvx) to 86ms (Fastify). Nothing in
[../problem.md](../problem.md) or the records makes a twelve-megabyte or thirty-millisecond spread
matter.

*Measured — by me on 2026-09-21, with the large-body tests disabled, since buffering a 200MB body is
what produced the earlier gigabyte figures and would otherwise be read as a per-request cost.*

**Per-request CPU is not binding, and no measurement was taken.**
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) keeps the server off the
path from input to paint, so no candidate's routing overhead is on a path a player waits on, and
[../problem.md](../problem.md) sizes launch at a small number of people. A throughput benchmark here
would measure a quantity nothing in the problem asks about.

*Reasoned — 2026-09-21.*

### Pass of 2026-09-21 — validation at the boundary, measured

**Method.** The contract is the one
[the server hands back state the client will not accept](../failure-modes/the-server-hands-back-state-the-client-will-not-accept.md)
names as its own mitigation — an explicit schema version carried with every record —
`{schemaVersion: number, puzzleId: string, cells: number[]}` on a `POST /board`. Each candidate
declared it the way that candidate declares things, and the handler always returned the valid board
**plus an `internalOwnerEmail` field that must never reach a client**. Three requests: one missing
`schemaVersion`, one carrying an extra inbound field, one valid. Then a fourth question asked of the
type system rather than the wire. Node v26.7.0, `fastify` 5.12.5, `hono` 4.13.8,
`@hono/zod-validator` 0.9.1, `zod` 4.6.5, `express` 5.2.1, `typescript` 7.0.2. Express stands in for
every candidate with no validation of its own — it, srvx and `node:http` all reduce to calling a
validator by hand, and that is why they are one row rather than three.

**Rejecting a bad write is not a discriminator. Every candidate returns 400.** What differs is what
the 400 says. Fastify's built-in JSON Schema gives `body must have required property
'schemaVersion'`. `@hono/zod-validator` serialises the **entire `ZodError`** into the response body,
internal validator structure and all, which is a leak of the same kind as the error-containment
finding above. A hand-written zod check says whatever you write.

**What the response is allowed to contain is the discriminator, and only Fastify enforces it.** Given
a declared `response` schema, Fastify serialises only the declared properties, so
`internalOwnerEmail` **never left the process**. Hono and the hand-rolled zod route both returned it
to the client verbatim. That is a by-construction guarantee against a discipline, which the security
standard prefers explicitly, and it reaches the privacy theme in
[../guarantees/README.md](../guarantees/README.md) as much as it reaches the failure mode above.

**It cuts both ways, and the record should say so.** The same mechanism silently drops a field a
handler adds and a schema does not know about. The failure is a missing field rather than a leaked
one, and it is equally quiet.

*Measured — by me on 2026-09-21, method above.*

**Hono's typed client works, and catches both directions at compile time.** `hc<AppType>` under
`tsc` 7.0.2 with `strict`: reading a field the server never returns is `TS2339`, and sending
`schemaVersion: 'not-a-number'` is `TS2322`. It also types the validation-failure branch, so the
success shape is unreachable until the call is narrowed on `ok.ok` — the 400 cannot be ignored by
accident. Fastify ships no client; its type story is typed handlers through a type provider, and it
stops at the network boundary.

*Measured — by me on 2026-09-21, three deliberate errors compiled and the narrowed version compiled
clean.*

**But a compile-time client cannot address the failure mode that motivated this axis, and that is
the finding.** The version-skew case in
[the server hands back state the client will not accept](../failure-modes/the-server-hands-back-state-the-client-will-not-accept.md)
is explicitly the ordinary one — "a web client updates whenever the player loads it", and
[ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md) plus the offline guarantee mean "an
installed or cached client can be arbitrarily old while its data is current." **The two halves are
therefore routinely not compiled together**, so a guarantee established at compile time does not hold
at the moment the mismatch happens. It remains real value while developing and it does not reach the
failure mode.

Fastify's response serialisation is the opposite shape: a runtime guarantee that holds whatever
version of the client is asking.

*Reasoned — from the failure mode and the delivery record both linked above, 2026-09-21.*

### Pass of 2026-09-21 — throughput, the store, and re-pricing two claimed benefits

**The headline comparison found by searching is "Fastify is faster and Node-focused, Hono is
cross-platform and slower". The first half is true, stale in magnitude, and does not bind here.**
Measured on this hardware — Apple M2, Node v26.7.0, autocannon at 50 connections for 10s after a 5s
warmup, `fastify` 5.12.5 against `hono` 4.13.8 with `@hono/node-server` 2.1.1:

| route | Fastify | `node:http` | Hono | Fastify ahead |
| --- | --- | --- | --- | --- |
| `/hello`, JSON only | 87,072 req/s | 83,593 | 76,256 | 14.2% |
| `/board`, a `node:sqlite` row read plus JSON | 58,960 req/s | 56,455 | 54,151 | 8.9% |

Two things the published numbers cannot show. **The gap narrows once real work is attached**, from
14.2% to 8.9%, because the store starts to dominate and every published benchmark measures the first
row only — Fastify's own benchmark page says so of itself: "This is a synthetic 'hello world'
benchmark that aims to evaluate the framework overhead." And **bare `node:http` is slower than
Fastify on the first row**, which is worth keeping as a caution: less abstraction is not
automatically faster.

*Measured — by me on 2026-09-21, method above, one 10s run per cell after a warmup, on a laptop with
other processes running. The margin needed for this to change any conclusion is roughly three orders
of magnitude, so the noise does not matter.*

**The arithmetic that makes it not bind.** Mean service time on the realistic route is 0.848ms for
Fastify against 0.923ms for Hono, a difference of **0.075ms** — 0.028% of the 270ms 3G round-trip
floor [../constraints.md](../constraints.md) records, and below the resolution of the p50 and p99 this
run reported. On the load side, a deliberately generous model of ten thousand daily players making
twenty server requests each is 2.3 req/s, or 46 req/s at a twentyfold morning peak, which is **0.08%
of measured capacity and about 1,200 times of headroom**. The Fastify surplus on its own, 4,809 req/s,
is 104 times the entire projected peak. For 8.9% to matter the server would have to run above 91% of
capacity, around a thousand times this project's size, and
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) keeps it off the path a
player waits on in any case.

*Sourced for the external numbers — Fastify's own benchmark page dated 2026-09-02 (Fastify 97,595
req/s against Hono 88,525), Hono's benchmarks page, honojs/discussions 1483 and the maintainer's Zenn
article on the 2.3x Node adapter rewrite, read 2026-09-21 by a research agent. I did not open them.
The agent found no primary source showing Hono ahead of Fastify on Node, and found that the large gap
still repeated in blog posts predates that adapter rewrite.*

**Neither framework offers anything for this store, and that is the whole answer on that axis.**
There is no `@fastify/sqlite`; the registry returns not-found. The community plugins are
`fastify-sqlite`, last published 2022-09-18, and `fastify-sqlite-typed`, and both wrap `sqlite3` or
its relatives rather than Node's built-in module. `fastify-better-sqlite3` is listed on Fastify's
ecosystem page and does not exist on npm. Across all thirty-five packages in the `@hono` scope there
is nothing database-related at all. **No plugin in either ecosystem supports `node:sqlite`**, so the
store is opened by hand under either, and this axis eliminates nobody.

*Sourced — the npm registry API for each name, Fastify's ecosystem page and the `@hono` scope
listing, read 2026-09-21 by a research agent. I did not open them.*

**What does differ is the lifecycle pattern, and Fastify's documented one is the pattern the
shutdown defect breaks.** Fastify documents `decorate` plus an `onClose` hook, and its official
Postgres plugin closes its pool exactly that way. Its hooks reference says of `onClose`: "By the time
`onClose` hooks execute, the HTTP server has already stopped listening, all in-flight HTTP requests
have been completed, and connections have been drained. This makes `onClose` the safe place for
plugins to release resources such as database connection pools, as no new requests will arrive."

Running that exact pattern — `decorate('db', …)` plus an `onClose` that calls `db.close()`, nothing
hand-rolled — on Fastify's default `listen({ port })` with an IPv4 client and a request in flight:
`onClose` fired reporting **one request still running**, the handle was released, and the client
received **`500 ERR_INVALID_STATE: database is not open`** with the store holding a half-written
record. With `host: '0.0.0.0'` the same code reports zero in flight, returns 200 and writes both
rows. So the earlier finding understated itself: this is not a hand-rolled shutdown going wrong, it
is **the framework's own documented safe place for releasing a database, on the framework's own
default listen**.

Hono documents no resource-lifecycle hook at all — its Node guide covers closing the server and says
"closing it is up to you", so the store is closed in a signal handler you write, which is what the
earlier pass measured working.

*Measured — by me on 2026-09-21, both binds. The `onClose` quote is a research agent's reading of
Fastify's hooks reference and I did not open that page, though the behaviour it describes is what I
falsified.*

**Correction: the testability advantage was overstated, including by me.** Both frameworks exercise a
route with no socket, no port and no process. Hono's `app.request('/board/p7')` and Fastify's
`app.inject({ method, url })` both work. What remains is smaller and real: Hono returns a genuine
`Response` (`instanceof Response` is true, headers are a real `Headers`) and accepts a raw `Request`,
while Fastify returns a plain object that is neither, and requires `await app.ready()` first. That is
an ergonomic difference — one response API rather than two, and fixtures that are web-standard
objects — not the capability difference the bullet above implies.

*Measured — by me on 2026-09-21, both asserted in one script.*

**Re-pricing the service-worker symmetry, which is weaker than this file implies.** Hono's service
worker adapter is real and documented, and its stated purpose is running Hono as a `FetchEvent`
handler inside a browser service worker for things like offline caching. What is **not** documented
by Hono, and not demonstrated in either project's examples, is the thing this file's optimism rests
on: one handler deployed both to the Node server and to the service worker. srvx's service-worker
adapter comes closer, detecting whether it is running in the page or the worker, but its examples
still target one runtime at a time. So the symmetry is a shape the architecture permits rather than a
pattern anyone ships, and this system may never want it —
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) has the client reading its
own storage directly, so there is no established need for the worker to synthesise an API response at
all.

*Sourced — Hono's service worker guide and srvx's service-worker adapter and example, read 2026-09-21
by a research agent. I did not open them.*

**So of the three reasons this file gives for wanting Fetch-native handlers, all three are now
weaker than written.** Runtime portability it already called weak. Testability is matched by
`inject`, leaving ergonomics. Service-worker symmetry is undemonstrated and possibly unwanted here.
What survives is that a handler written against `Request` and `Response` is cheap to move, which is
the reversibility argument on its own rather than three arguments.

### Pass of 2026-09-21 — sharing a handler, code size, and telemetry

**Correction, and it reverses the entry immediately above: one handler really does run on the server
and inside a browser service worker, and building it took about twenty lines.** The pass above called
this undemonstrated on the grounds that neither project's examples show it. That was a claim about
the examples, and it was allowed to stand as a claim about the thing.

What was built: one module exporting a Hono app with `GET /api/board/:id`, imported unchanged by a
Node entry point using `@hono/node-server` and by a service-worker entry point using
`hono/service-worker`'s `handle`, bundled with esbuild and registered in headless Chromium. The
browser's fetch returned `{"schemaVersion":1,"puzzleId":"p7","cells":[9,7,5,3,1,8,6,4,2]}` with the
`x-served-by: service-worker` header the worker entry point adds, and the Node server returned a
byte-identical body for the same route. **The server logs every `/api` request it sees, and the
browser's fetch added nothing to that log**, while a control request issued afterwards did — so the
worker answered from its own copy rather than the network. `handle(app)` falls back to the network on
a 404, so an app scoped to `/api/*` composes with everything else the page loads.

This project has no established need for it: [ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md)
has the client reading its own storage, so the board in play never needs a synthesised response. The
candidate use is [how does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md)
at M9, where [ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md)
serves puzzle content from a runtime and a worker answering those routes from cache is the shape that
milestone is about.

*Measured — by me on 2026-09-21. Node v26.7.0, `hono` 4.13.8, `@hono/node-server` 2.1.1, esbuild
0.28.2, Chrome for Testing 151 headless. The spike is deleted.*

**Simplicity favours Hono at hello-world and roughly neither once the app is real.** The same
endpoint in both — validated in and out, a `node:sqlite` write, structured request-correlated logs,
a safe shutdown — came to **25 significant lines under Fastify and 35 under Hono**, and both behaved
identically on the wire, stripping the internal field and rejecting a missing one with 400.

**Nine of the ten extra lines are fixed cost rather than per route**: a `hono/request-id` middleware
and a child-logger middleware, written once. Per route the only extra is one `Board.parse(...)` on
the way out, so at twenty routes the difference is noise. What differs more than length is kind.
Fastify's per-route contract is a JSON Schema object literal, which is verbose and does not flow into
the handler's types without a type provider; Hono's is a zod schema, which is typed and composable
and whose inferred type reaches `c.req.valid('json')` for free.

*Measured — by me on 2026-09-21, both run and both asserted against the same three requests.*

**Telemetry is the clearest thing Fastify does better, and it is not close.** `{ logger: true }` is
one line and no new dependency, because pino is already in Fastify's tree. It generates a request id,
creates a pino **child logger** bound to it, exposes it as `request.log`, and emits `incoming
request`, `request completed` with `responseTime`, and an error line — with no application code. The
run above produced `{"level":30,…,"reqId":"req-1","puzzleId":"p1","msg":"board saved"}` from a
handler containing one `req.log.info` call.

**Hono's `hono/logger` is not a competitor to that.** Its source builds a formatted string —
`<-- GET /foo 200 12ms` — and passes it to `console.log`. It is unstructured, has no fields, and has
no request-id or child-logger concept. Matching Fastify means `hono/request-id`, which is core, plus
bare pino, plus the middleware counted above, or `@hono/structured-logger` at 1.0.0 with roughly
11,800 weekly downloads, which still has the caller write the logger and the message text.

This bears on [what are the server's vitals, and who watches them?](what-are-the-servers-vitals-and-who-watches-them.md)
and [how is a slow request diagnosed after the fact?](how-is-a-slow-request-diagnosed-after-the-fact.md)
at M11, where [../constraints.md](../constraints.md) records that a stalled connection throws no
error, so slowness is invisible unless something instrumented it beforehand.

**OpenTelemetry is much closer to even.** `@fastify/otel` 0.21.0, official, instruments every
lifecycle hook individually. `@hono/otel` 1.1.2, official, instruments the middleware chain as a
single span and documents that it cannot go finer. An OTel-org `@opentelemetry/instrumentation-fastify`
exists and no Hono equivalent does. `srvx`'s `./tracing` export is not OpenTelemetry at all — it
publishes to two `node:diagnostics_channel` channels and its own source marks it experimental.

*Sourced — Fastify's logging reference and its `lib/log-controller.js` and `lib/logger-factory.js` at
the 5.12.5 tag, Hono's logger middleware source, the `@hono` scope listing and npm download counts,
and both OTel packages' READMEs, read 2026-09-21 by a research agent. I did not open them; the pino
output above I produced myself.*

**A correction to something this file implied about correlation.** Fastify does not use
`AsyncLocalStorage` for it and does not need to, because `request.log` is threaded through handler
arguments. Hono offers `hono/context-storage`, a real `AsyncLocalStorage`, for code that does not
receive the context.
