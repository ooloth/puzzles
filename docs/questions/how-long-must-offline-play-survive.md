---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How long must offline play survive?

## Why it matters

"Several minutes" is sized to tunnel dropouts. Whether a flight or an overnight is in scope
changes the design substantially — particularly how much content has to be available locally
ahead of time.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Retrofitting offline onto a shipped product is expensive, and there is one well-known account of
it.** Trello's engineering writing describes hitting exactly this — "it's frustrating to lose the
ability to use Trello when you enter the subway" — and spending roughly a year and a half
rearchitecting because of it. It changes nothing here, because [../problem.md](../problem.md)
already makes offline the modal case rather than an edge case. It is recorded as the only outside
evidence in this repo about what the retrofit costs.

*Unverified — no source recorded. Ported from a brainstorming document on 2026-09-01, which
attributed it to Trello's engineering blog without a link.*
