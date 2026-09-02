---
number: 0011
status: accepted
date: 2026-09-01
---

# 0011 — Stored play data can be analysed, not just retrieved

## Forced by

**[../problem.md](../problem.md) names a generator whose puzzles have to be good**, and [every
puzzle is solvable by deduction
alone](../guarantees/every-puzzle-is-solvable-by-deduction-alone.md) is promised. Whether generated
puzzles actually satisfy that, and whether a difficulty grade predicts anything, can only be
checked against real solves. That is the maintainer's feedback loop, and it is not a metrics
dashboard — it is the only signal that the thing the project exists to build is working.

**The observability theme in [the guarantees README](../guarantees/README.md) names the case this
also covers**: lost progress produces no error and no complaint. A device that silently dropped a
player's work is the last thing that will report it.

**The cost of preserving the option is nearly zero, and the cost of recovering it later is not.**
Whether stored data can be asked questions of is a property of how it is stored, and it is decided
by the database and the shape written into it. Discovering the need afterwards means migrating.

## Decision

Anything the server stores is stored so that it can be queried later — questions like which puzzles
get finished, where players stall, and whether a difficulty grade predicts anything have to be
answerable without a migration.

**The option this preserves is analysing play**, and it is the rationale rather than the rule. What
binds implementation is the sentence above: a store that cannot be asked questions is ruled out,
whether or not anyone ever asks one.

**This preserves an option; it does not schedule the work.** Nothing is collected, no analysis is
built, and no telemetry ships because of this record. What is ruled out is a storage choice that
makes those questions unanswerable.

**It does not decide what is collected.**
[What must we know about how the app is used?](../questions/what-must-we-know-about-how-the-app-is-used.md)
remains open, and [do privacy regulations apply?](../questions/do-privacy-regulations-apply.md) is
unresearched. Collecting anything about a player waits on both. What this settles is that the store
will not be the reason they cannot be answered.

## Rejected

- **Deciding it when the analysis is wanted.** The honest "not yet", and it fails on the one thing
  that matters under the portable decision-making standard's deferral test: by then
  there is player data in whatever shape was chosen, and changing it is a migration rather than a
  decision. The option costs almost nothing now precisely because there is nothing stored yet.

- **An opaque blob store, queried never.** Genuinely simpler, and it was the live possibility that
  made [which database, if any?](../questions/which-database.md) describable as a
  non-decision: bytes under a key, no schema, nothing to keep in step. Rejected because it forecloses
  the generator's feedback loop, which is not a nice-to-have — without it there is no way to tell
  whether generated puzzles are good, and `../problem.md` makes that the point of the project.

- **Collecting now, deciding later what it was for.** Cheap to build and the worst of the three. It
  incurs the privacy obligations, the storage, and the player-trust exposure immediately, in
  exchange for data whose purpose nobody has stated — and `../problem.md` names the guard against
  exactly this: would this be worth building if its demonstration value were zero.

## Risk

**A queryable store is a larger commitment than a blob store, and this is the moment it is taken
on.** Schemas, migrations, and a shape that has to stay coherent as game types are added. That is
real ongoing cost bought against an option nobody has yet exercised, and if the analysis is never
done it will have been paid for nothing.

**"Queryable later" invites collecting more than is needed.** The cheapest way to guarantee a future
question can be answered is to store everything, which is how privacy obligations arrive without
anyone deciding to take them on. Nothing here licenses that — the option preserved is about the
store's shape, not about what goes into it.

**It pre-empts part of a question that is still open.**
[Which database?](../questions/which-database.md) was describable as a possible
non-decision only while an opaque store was live. It is now a real choice, and this record is why.

## Revisit when

- **The generator is abandoned, or its puzzles are never generated here.** The strongest reason for
  this disappears with it, and what remains is observability alone, which is a weaker case.
- **Privacy research makes collecting solve data materially expensive**, per
  [do privacy regulations apply?](../questions/do-privacy-regulations-apply.md). The option would
  still be preserved; the case for exercising it would change.

## Also update

- [x] Nothing in `constraints.md` — this imports no facts about the world
- [x] Nothing in `guarantees/` — this promises a player nothing, and deliberately promises the
      maintainer nothing either

Deliberately not decided here: which database, what is collected, when any of it is built, and
whether a difficulty grade promises a player anything.
