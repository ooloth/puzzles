---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How is the app run locally the way it runs deployed?

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

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, when a milestone for maintainer tooling was added and the feedback loops nobody
had asked about were enumerated.

## Options

...

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
