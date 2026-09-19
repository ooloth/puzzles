---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What handles HTTP requests on the server?

**Scoped to the HTTP layer, not the runtime.** Which runtime executes the code is
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md); this is
what sits on top of it to route a request and write a response — a framework, or the runtime's own
server API and nothing else.

**The two are answered together, and the coupling runs one way more strongly than the other.** Two of
the three candidate runtimes ship their own server API and their own bundled tooling, so choosing one
of those partly answers this question by consequence, while choosing a framework that assumes Node's
`http` module would rule that runtime out. Answering them in either order alone risks settling the
second by accident. The edge tier does not enter it:
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md) removes that
runtime for every option below, so nothing here is chosen or rejected on whether it would run there.

## Why it matters

It is a small decision that looks like a big one, and worth recording mainly so it is not made by
whichever framework the first tutorial used. The server this project needs is a handful of endpoints
that put and fetch bytes — every candidate can do that, so the choice turns on how much it brings
with it and how reversible it is.

## What would settle it

Very little, once the runtime lands. The one criterion worth applying deliberately is reversibility:
handle requests behind an interface thin enough that swapping what implements it is a small change
rather than a rewrite.

**This is also answered together with
[what renders the client?](what-renders-the-client.md).**
The fourth option below is a meta-framework's own server, and choosing it *is* choosing the renderer.
Choosing a renderer that is not a meta-framework removes the option in the other direction. So the
two constrain each other exactly as this question and the runtime do, and answering either alone
risks settling the other by accident. That makes this a chain of three rather than a pair.

**The choice underneath that pair is
[does one tool build the client and answer HTTP?](does-one-tool-build-the-client-and-answer-http.md),
and it is answered first.** It is wider than either, because it decides whether this question and the
renderer resolve into one record or two. A handler settled ahead of it answers it by consequence.

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
which is what makes a handler portable across the candidate runtimes.

*A full framework.* Express, Fastify and similar. Conventions, middleware ecosystems, and
documentation aimed at people who have not read this repo. Larger surface to keep patched, and
several assume a long-lived process — which costs nothing here, since
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md) already settles that
the server is one.

*A meta-framework's own server, serving API routes alongside a prerendered entry document.* This list
omitted the option, and its absence read as a rejection nobody had argued.
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) settles
that the document is a build output and explicitly does *not* exclude the framework that builds it
from also answering HTTP. SvelteKit's `adapter-node` with `prerender` on the root layout, Astro's Node
adapter with `output: 'static'` plus `export const prerender = false` on each API endpoint, and
TanStack Start's `prerender` with server functions are all this shape. Next is the exception: under
`output: 'export'` a route handler that reads the request is unsupported, so choosing Next means a
separate API server. Weigh it here on its merits rather than treating it as already excluded.

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
opposite of how the same fact reads in
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md).

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
