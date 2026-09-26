---
opened: 2026-09-26
status: open
resolves_into: decision
---

# How are API paths kept apart from client paths on one origin?

## Why it matters

[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) puts the
client's files and the API on one origin, so every path on that origin belongs to one of them and
something has to tell which. That rule is what every client call is written against, what a proxy,
platform or CDN routes on, and what the service worker's navigation fallback excludes at M9.

It fails silently when it is wrong. A catch-all that returns `index.html` for unknown paths answers a
mistyped or removed API path with 200 and HTML, so the client sees a parse error rather than a 404. A
CDN rule written for the files can cache an API response or strip its `Set-Cookie`. Neither produces
an error on the server.

It shows up in production, where whatever serves the origin routes on it, and in local runs, where the
fast loop has to send API paths to the server process and everything else to the dev server. The
local rule is derived from the production one, per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md).

## What would settle it

Knowing which routing layers have to apply the rule, which is partly
[what serves the client's files in production?](what-serves-the-clients-files-in-production.md), and
what each can match on: a path prefix, an explicit list of routes, or a request property such as
`Sec-Fetch-Mode`. Then which rule every layer can apply the same way, so a path cannot be the API's in
one layer and the client's in another.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-26 while working
[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md), whose
research found the single-origin traps and no question covering them. The server answers `/hello` at
the root today, which is the first instance.

## Options

*A prefix for the API*, such as `/api/`. Every layer matches one string, and anything under it that
has no route is a 404 from the server. Every API URL carries the prefix, and a client route can never
use it.

*A prefix for the client*, with the API at the root. The same mechanism turned around. A player's URLs
all carry the prefix, which is the part they see and share.

*An explicit list of API routes.* No prefix on anything. Every layer holds the list, so adding a
route means updating each of them, and a route missing from one is served the client.

*Split by request mode.* A navigation, whose `Sec-Fetch-Mode` is `navigate`, gets the client and
everything else gets the API. Needs no naming rule. Every layer has to be able to match on a request
header, and a static file host or CDN may not.

*Not yet.* Leave `/hello` at the root and choose when M3 adds real routes. The pattern M3 copies is
then whatever `/hello` happened to be.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The service worker's navigation fallback only matches navigations.** Workbox's `NavigationRoute`
"will only match incoming Requests whose `mode` is set to `navigate`", so `fetch` calls to the API
are not intercepted by it. An API URL opened as a navigation, such as a download link, would be.

*Sourced — Workbox `workbox-routing` reference, read by a research agent 2026-09-26. Not re-opened.*

**`@fastify/static` can serve the files beside API routes without swallowing unknown paths.** Its
README documents registering it with `wildcard: false` and a not-found handler, so an unregistered
path under the API's routes gets the server's own 404 rather than a file.

*Sourced — `@fastify/static` README, read by a research agent 2026-09-26. Not re-opened.*
