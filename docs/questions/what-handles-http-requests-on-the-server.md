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

**The two are still answered together, and the reason is no longer the edge tier.**
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md) removed that
runtime tier, so the old argument — an edge runtime rules out frameworks assuming a long-lived
process, and vice versa — no longer distinguishes anything. What couples them now is narrower and
runs one way more strongly than the other: two of the three candidate runtimes ship their own server
API and their own bundled tooling, so choosing one of those partly answers this question by
consequence, while choosing a framework that assumes Node's `http` module would rule that runtime out.
Answering them in either order alone risks settling the second by accident.

## Why it matters

It is a small decision that looks like a big one, and worth recording mainly so it is not made by
whichever framework the first tutorial used. The server this project needs is a handful of endpoints
that put and fetch bytes — every candidate can do that, so the choice turns on how much it brings
with it and how reversible it is.

## What would settle it

Very little, once the runtime lands. The one criterion worth applying deliberately is reversibility:
handle requests behind an interface thin enough that swapping what implements it is a small change
rather than a rewrite.

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
which is the property that decides whether an edge runtime stays reachable.

*A full framework.* Express, Fastify and similar. Conventions, middleware ecosystems, and
documentation aimed at people who have not read this repo. Larger surface to keep patched, and
several assume a long-lived process in ways that foreclose the edge tier.

*A meta-framework's own server, serving API routes alongside a prerendered entry document.* This list
omitted the option, and its absence read as a rejection nobody had argued.
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) settles
that the document is a build output and explicitly does *not* exclude the framework that builds it
from also answering HTTP — SvelteKit's `adapter-node` with `prerender` on the root layout, Astro's
Node adapter with `output: 'static'`, and TanStack Start's `prerender` with server functions are all
this shape. Next is the exception: its `output: 'export'` drops route handlers that read the request,
so choosing Next means a separate API server. Weigh it here on its merits rather than treating it as
already excluded.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Targeting the web-standard `Request` and `Response` interfaces is what keeps this reversible.**
A handler written against them runs under every candidate runtime and under most routers, which makes
this choice a small change rather than a rewrite — and keeps the edge tier reachable without
committing to it.

*Reasoned — from the interfaces being defined by the Fetch specification rather than by any runtime.*

**M1 needs one route returning a fixed string.** Nothing about that discriminates between the options
above, so this must be decided on what the rest of the system will need rather than on what the first
endpoint needs. What crosses the boundary is settled at M3 — see
[what crosses the client/server boundary?](what-crosses-the-client-server-boundary.md).
