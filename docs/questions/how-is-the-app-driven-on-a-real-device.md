---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How is the app driven on a real device?

## Why it matters

[../constraints.md](../constraints.md) records a streaming bug that reproduced only on real iOS
Safari over a real network — desktop Chromium, curl, and the same phone on a different network path
were all instant. A simulator would not have caught it either, because the bug lived at one specific
intersection of proxy, browser, and protocol that a simulator does not reconstruct.

[../problem.md](../problem.md) says the primary platform is a phone used in transit, with desktop as
secondary. A workflow that only ever exercises the app through a desktop browser is testing the
secondary platform and inferring the primary one, and that inference has already been wrong once.
Without a way to drive the app on a real device — install it, interact with it, read its console —
from a script or an agent's own hands, this class of bug can only be found by accident, and it is
the class this app is most exposed to.

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
