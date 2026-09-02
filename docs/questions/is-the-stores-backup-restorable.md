---
opened: 2026-09-01
status: open
resolves_into: decision
---

# Is the store's backup restorable?

## Why it matters

[../guarantees/durability.md](../guarantees/durability.md) is the promise that a player's work
outlives the session that made it, and that promise is only as real as the backup behind it. A
backup that has never been restored is a belief about what it contains, not a fact — the failure
mode is a restore that silently produces an empty or corrupt database at the exact moment it is
needed, which is also the worst possible moment to discover that for the first time.

[../problem.md](../problem.md) names the solo maintainer as a stakeholder, and a restore drill that
can be run and checked on demand is what lets this promise be verified — by the maintainer or by an
agent — without waiting for an actual data loss to test it. That makes it a loop worth running
routinely, not just once after the backup is first set up.

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
