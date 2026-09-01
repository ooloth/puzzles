---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Which doors must stay open?

## Why it matters

Deferring a decision is only safe when the thing being deferred is still reachable afterwards.
Most of this project's plan is deferral — no accounts yet, no paid tier yet, no second game yet —
and that plan is sound exactly to the degree that each of those remains cheap to add. Whether it
does is a property of decisions being made now, quietly, in areas that look unrelated.

This is the question that makes "defer" a strategy rather than an omission. It is the opposite of
a v1 scope list: it does not say what ships, it says what must not become expensive.

Hosting topology is the worked example. Silent recovery after storage eviction depends on a
server-set cookie being judged first-party, which depends on how the app and its API are hosted
relative to each other — see [../constraints.md](../constraints.md). Choosing a static host with
its API elsewhere forecloses that mechanism, silently, months before anyone tries to use it.
Nothing about that choice announces itself as a door closing.

## Blocked by

N/A — nothing needs to be answered first, though each door has its own question about whether it
is wanted at all.

## Blocks

Nothing directly, and that is the point: it constrains *how* other decisions are made rather than
gating them. It should be consulted by every decision record, which is why the answer belongs in
[../decisions/README.md](../decisions/README.md) as a checklist rather than only in this folder.

## What would settle it

Listing the futures worth preserving, and for each, naming the specific present decision that
would foreclose it and the cheap thing that keeps it open. A door with no identified threat is not
a door, it is a hope.

## Resolves into

A decision record in [../decisions/](../decisions/), and a check added to the procedure in
[../decisions/README.md](../decisions/README.md).

## Source

Raised 2026-08-31, replacing a proposed "what is in v1?" question. Fixing a launch list before any
code exists is a guess; naming what must stay possible is not, and it is the artifact that makes
deferring the rest defensible.

## Options

N/A — this resolves into a list, not a choice between alternatives.

## Findings

**Four doors are already named across existing docs, none of them here.**

*A paid tier.* [../problem.md](../problem.md) records that it is uncommitted and deliberately not
ruled out. The threat is any decision that makes entitlement unenforceable or identity
retrofittable only by a rescue operation.

*Progress following a player between devices.* The threat is shipping with no stable identifier at
all, which turns a later addition into a migration for every existing player rather than a lookup.
Minting one on first visit costs almost nothing today.

> A locally-minted identifier is script-writable, so the browser's eviction takes it along with
> everything else — and it takes it from exactly the lapsed players who would need it. Only
> something a server sets survives, per [../constraints.md](../constraints.md). So this door is held
> open by a server, or by the player having signed in, rather than by a line of client code.
> [ADR-0006](../decisions/0006-what-a-players-work-survives.md) closes the gap a different way: the
> guest record and the account record are one shape, so signing in promotes what is there instead
> of needing an identifier to have survived.

*More puzzle types.* [ADR-0001](../decisions/0001-launch-with-sudoku-then-star-battle.md)
sequences star battle after sudoku. The threat is a data model that hard-codes a nine-by-nine grid
of digits.

*Silent recovery after eviction.* The threat is hosting topology, above.

**The cheap-now, expensive-later asymmetry is the whole shape of this question.** In every case
above, the door is held open by a small decision taken early — an identifier, a generic board
shape, a same-origin API — and closed by an equally small decision taken without noticing. Neither
is expensive. Only one is recoverable.

**Optionality has a cost and it is not zero.** Each door held open is a constraint on every later
decision, and a door nobody ever walks through was a tax paid for nothing. This list should stay
short, and an entry should be removed once the future it protects is genuinely abandoned.
