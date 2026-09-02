---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How would we notice a problem nobody predicted?

## Why it matters

Every check named so far — the runtime invariants, the stored-data audit, the deploy health check
— tests a failure somebody already thought of and wrote a check for. This asks what would surface
a failure nobody anticipated: an error rate moving that has no alert on it, a distribution
shifting, something appearing in logs with no handler written for it.

[../guarantees/observability.md](../guarantees/observability.md) is a stub, and it names lost
progress as its motivating case precisely because that failure produces no error, no crash, and no
complaint — the exact shape of a problem nobody predicted. Without something watching for the
unexpected rather than the expected, this class of failure stays invisible until a player notices
and leaves, which is also the point at which the maintainer finds out last.

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
