---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How do we exercise offline, throttled, and backgrounded conditions on demand?

## Why it matters

[../constraints.md](../constraints.md) records that the storage failures this app has to survive do
not reproduce in a desktop browser, and that a streaming bug reproduced only on real iOS Safari over
a real network — desktop Chromium, curl, and the same phone on a different network path were all
instant. So the conditions this app is designed for, per [../problem.md](../problem.md)'s
transit-riding, connectivity-dropping audience, are exactly the conditions hardest to create on
purpose at a desk.

Without a way to force the app offline, throttle its bandwidth, and background the tab on demand,
every check of interrupted or degraded play either waits for the right conditions to happen by
chance on a real commute, or gets skipped. That is also a check an agent cannot currently run at
all, and interruption is close to the center of what this app promises, so it is one of the loops
most needed many times a day rather than occasionally.

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
