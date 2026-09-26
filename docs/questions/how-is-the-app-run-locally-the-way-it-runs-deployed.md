---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How is the app run locally the way it runs deployed?

**Narrowed by [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)**,
which settled that local work has two modes: a fast loop that may differ from production, and a
production-like run that changes are verified in. What is still open is how the production-like run
is built: which differences from production it closes, how it closes each, and what command runs it.

## Why it matters

A bug that only shows up once the app is deployed costs a deploy cycle for every attempt to
reproduce it, and a deploy is slower than a local edit-and-reload loop by design. Without parity
between the two, "does this fix it" can only be answered by deploying again and waiting.

[../problem.md](../problem.md) names the solo maintainer as a stakeholder alongside players, and
every minute spent redeploying to chase a bug is a minute not spent on the app. The same gap blocks
an agent trying to verify a change on its own: without a local environment that behaves like the
deployed one, an agent either trusts an untested assumption or pushes to production to find out, and
neither should happen without the maintainer watching.

## What would settle it

Listing every difference between a local run and production that [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)'s test says matters, one
that can change what a player sees or whether a guarantee holds, and for each one naming how the
production-like run closes it or why it cannot.

This also covers what the developer sees when one of the two processes is not running, such as a
client calling an API that was never started. What a *player* sees when the API cannot be reached is
[is the player shown anything about the network?](is-the-player-shown-anything-about-the-network.md).

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, when a milestone for maintainer tooling was added and the feedback loops nobody
had asked about were enumerated. Narrowed 2026-09-26 by [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md).

## Options

Nothing recorded yet.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The first instance of this gap exists already, and a record names it.**
[ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md) puts the
client build and the HTTP server in separate tools, and says under Risk that "the dev server does not
proxy the API for free". So from M1's third slice onward the client is served by one local process
and the API answers on another port, and to the browser those are two origins unless something
proxies them into one. Whatever closes that gap decides whether local development is same-origin,
which is the arrangement
[do the client and the API share an origin?](do-the-client-and-the-api-share-an-origin.md) settles
for production. Proxied in development and split in production is parity failing in the direction
that hides the fault: everything cross-origin works locally and shows up for the first time once
deployed.

*Reasoned — from [ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md)
and M1's slices in [README.md](README.md), 2026-09-20.*

**The dev server does not lower syntax to the floor, so the production-like run has to serve the
built client.** With Vite 8.3.1 and this repository's `vite.config.ts`, a class with a `static { }`
block is served by the dev server unchanged and emitted by the build lowered.

*Measured — 2026-09-26, recorded with its method in [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md).*

**`pnpm preview` serves the built client with no API behind it**, so it is not the production-like
run even though it serves the build. It is one of the pieces such a run would be assembled from.

*Reasoned — from `vite.config.ts` and `package.json`, 2026-09-26.*
