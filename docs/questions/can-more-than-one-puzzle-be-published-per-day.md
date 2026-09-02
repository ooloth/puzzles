---
opened: 2026-09-01
status: open
resolves_into: decision
---

# Can more than one puzzle be published per day?

## Why it matters

A puzzle keyed by date alone can never have a sibling. Two difficulties for the same day, or a mini
alongside a full one — the commonest shape in this category — need two rows for one day, and a date
key cannot hold them. Changing the key later means migrating every stored puzzle and every player's
record that references a date. Keying by id instead, with a publication date carried as a field,
costs nothing now. This closes at M3, when the first row is written: whatever key that row uses is
the key every later row inherits.

## What would settle it

Whether the catalogue is ever expected to hold two puzzles for one day — two difficulties, or a
second game type publishing on the same rhythm. That is a product question, not a technical one; the
technical cost is already known and is the same regardless of the answer.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01.

## Options

*Key a puzzle by its date.* The date is the natural primary key for a daily catalogue: one row per
day, looked up directly by the day being played. Cheapest to build, and matches every
single-daily-puzzle product. Forecloses ever publishing a second puzzle for the same day without a
migration that touches every stored row and every player's record that references a date.

*Key a puzzle by id, and carry a publication date as a field.* The id is opaque; a day can hold as
many rows as it wants, each with its own publication date. No more expensive to build than the
date-keyed version — the difference is one extra column and one extra index — and it is what lets a
second difficulty or a second puzzle type exist later without migrating anything.

*Defer the decision.* Ship the date-keyed version now and revisit if a second daily puzzle is ever
wanted. This is not actually cheaper: the migration cost described above is what deferring costs,
so this option and the first are the same option under a different name.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**If "today" is a server date with no player timezone, adding per-player local days later means
recomputing every stored streak.** [Is there one puzzle a day, or unlimited
play?](is-there-one-puzzle-a-day-or-unlimited-play.md) is where that timezone handling itself gets
decided; this is what it costs to get it wrong first.
