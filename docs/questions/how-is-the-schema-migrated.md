---
opened: 2026-09-03
status: open
resolves_into: decision
---

# How is the schema migrated?

## Why it matters

**A schema change will happen, and one of them is already scheduled.**
[ADR-0002](../decisions/0002-launch-with-sudoku-then-star-battle.md) guarantees a second game type,
and [ADR-0008](../decisions/0008-a-stored-puzzle-describes-its-own-size-regions-and-values.md) settles
that a stored puzzle carries its own dimensions, regions, vocabulary and type — a shape that exists
precisely so it can absorb star battle. Absorbing it is a migration.

**The store now holds the last copy of a player's work**
([ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md)), so a
migration that goes wrong is the failure this whole chain of records exists to prevent. This is the
one routine operation that touches every row.

**The engine makes it sharper than it would otherwise be.**
[ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) settles on SQLite, whose `ALTER TABLE` is
narrower than the alternative's: historically no dropping columns, no changing a column's type, no
adding a constraint to an existing table. The sanctioned route for anything beyond adding a column is
the twelve-step procedure in SQLite's own documentation — build a new table, copy, drop, rename —
which is more surface for a mistake and more time holding a write lock.

**The goal is that this stops being frightening.** A migration that is scary is one that gets deferred,
and deferred migrations accumulate into a change nobody wants to make. What is wanted is a routine
somebody runs on a Tuesday without a knot in their stomach: reversible where possible, verified
before it is trusted, and rehearsed against real data rather than against an empty table.

## What would settle it

Deciding the mechanism and, more importantly, what surrounds it. Five things any answer has to cover:

- **What runs a migration** — a library, a hand-rolled runner, or the application on start. Each has a
  different failure mode when two processes start at once.
- **How it is verified before it is trusted.** A migration that ran without error and a migration that
  did the right thing are different claims.
- **Whether it is reversible**, and if not, what stands in for reversibility. Under SQLite the honest
  answer may be a copy taken immediately before, which makes this depend on
  [how is the store backed up?](how-is-the-store-backed-up.md).
- **How it is rehearsed** — against a copy of real data rather than a fresh schema, since the
  migrations that fail are the ones that meet data nobody anticipated.
- **What happens if it fails halfway.** SQLite has transactional DDL, which is a genuine advantage
  here and should be relied on deliberately rather than by accident.

**It is not urgent and it is not late.** The first row is written at M3, and the first schema change
worth calling a migration arrives when the store's shape settles. Deciding the routine before there is
data to lose is when it is cheapest.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-03, on noticing that "migration" and "schema" appear across a dozen question files and
that nothing asked how one runs. Surfaced by
[ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md), which makes the mechanics narrower than
they would have been.

## Options

*A migration library.* Whatever the runtime ecosystem offers. Least to build, and inherits somebody
else's opinion about ordering, checksums and failure.

*A hand-rolled runner over numbered SQL files.* Small, legible, and the whole thing fits in a file
somebody can read. More to get right — ordering, idempotency, what happens when two processes race.

*The application applies pending migrations on start.* Simplest to operate and the most dangerous
under more than one process, which
[ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) makes less likely rather
than impossible.

*Not yet.* Defensible until the schema changes for the first time, and the risk is that the first
change is then made by hand under pressure.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**SQLite has transactional DDL**, so a failed migration can roll back rather than leaving a
half-changed schema. This is a real advantage over some alternatives and it is worth designing around
explicitly.

*Reasoned — from SQLite's documented behaviour; not re-checked against a primary source here.*

**Client storage is the harder half of this problem and is a different question.**
[Is the guest record the same shape as the account record?](is-the-guest-record-the-same-shape-as-the-account-record.md)
records why: a server migration runs once under supervision and can be retried, and a client migration
runs in somebody's browser with no server to retry from.
