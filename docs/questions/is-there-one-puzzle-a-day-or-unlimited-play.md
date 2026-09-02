---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Is there one puzzle a day, or unlimited play?

## Why it matters

Two genuinely different products. It changes what the generator is for, whether an archive
exists, whether streaks make sense, and whether "today" needs timezone handling.

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

**If "today" is a server date with no player timezone, adding per-player local days later means
recomputing every stored streak.** [Can more than one puzzle be published per
day?](can-more-than-one-puzzle-be-published-per-day.md) is the catalogue-shape half of the same
problem: what "today" means for looking a puzzle up and what it means for a streak are two
different timezone questions, not one.

**A daily rhythm is the only thing here that would justify interrupting anyone.** A message that
reaches a closed app — web push — requires an application server by construction; there is no
serverless form of it. Whether it is wanted turns on the answer here.
