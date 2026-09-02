---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What are the server's vitals, and who watches them?

## Why it matters

Process alive, memory, disk, request rate, error rate, latency percentiles, store size and growth
— the ordinary figures any running server has. Nothing here is unusual to want; the open part is
which of these get watched, at what cost, and by whom.

Left undecided, the answer defaults to whatever the hosting platform happens to show on its
dashboard, which is a choice made by the platform's defaults rather than one made deliberately.
[../problem.md](../problem.md) names the solo maintainer as a stakeholder, and a maintainer who
has to open a dashboard to know whether the server is healthy will do it rarely — rarely is
exactly when the answer has changed.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, extending the maintainer tooling milestone past the loops that were already
obvious.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*
