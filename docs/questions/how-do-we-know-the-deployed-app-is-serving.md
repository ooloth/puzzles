---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How do we know the deployed app is serving?

## Why it matters

Nothing today reports whether the deployed app is actually serving. A player who opens a static
client can be looking at bytes that loaded from cache while the API behind it is dead, so the app
can look fine and still be broken. The observability theme in
[the guarantees README](../guarantees/README.md)
holds no promises yet, and this is the plainest case it should cover — not a failure in a
promise about a player's data, just whether the thing is up at all.

[../problem.md](../problem.md) names the solo maintainer as a stakeholder. A check that only a
person can perform is a check that gets skipped under time pressure, right after a deploy is exactly
when it matters most, and a check an agent can run gets used every time — including by an agent
verifying its own change without the maintainer watching.

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
