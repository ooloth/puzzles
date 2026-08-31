---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What must we know about how the app is used?

## Why it matters

It decides whether anything stored off the device has to be *queryable* or can stay opaque, and
that is the difference between needing a database and needing a place to put bytes. A key and a
blob is satisfied by almost anything. "How many players finished today's puzzle", "how many lost
progress last week", "where do people abandon a grid" are questions a blob store cannot answer at
all.

It also decides whether several promises are checkable.
[../guarantees/durability.md](../guarantees/durability.md) says work is never lost and is
currently enforced by nothing; whether that is being kept is a usage question, and
[how would we learn a player lost progress?](how-would-we-learn-a-player-lost-progress.md) has no
answer without one.

## Blocked by

N/A — nothing needs to be answered first.

## Blocks

Which database, if any — see [what must be true off-device?](what-must-be-true-off-device.md) and
[what does the server store, if anything?](what-does-the-server-store-if-anything.md). Also
[how would we learn a player lost progress?](how-would-we-learn-a-player-lost-progress.md) and
[how would we verify progress is never lost?](how-would-we-verify-progress-is-never-lost.md),
neither of which is answerable while this is open.

## What would settle it

Naming the specific things that would change a decision if known, and discarding the rest. The
test is whether an answer would cause a different action — a number nobody would act on is a cost
with no return, and for a solo maintainer that cost is ongoing.

Worth separating three kinds that get discussed as one: whether the app is working (errors,
failed writes), whether the promises hold (progress lost, latency missed), and whether people
enjoy it (completion rates, abandonment). The first two argue for themselves. The third is a
product appetite question.

## Resolves into

A decision record in [../decisions/](../decisions/), and probably an entry in
[../guarantees/observability.md](../guarantees/observability.md).

## Source

Raised 2026-08-31. Working backward from "which database" found this branch entirely unexamined
alongside the durability one.

## Options

*Nothing.* No measurement. Cheapest, no privacy exposure, and every promise stays unenforced and
unfalsifiable.

*Errors only.* Client-side failures reported when they happen. Answers "is it broken" and nothing
else. Compatible with opaque storage.

*Errors plus promise checks.* Adds the events that would show a guarantee being broken — a failed
write, a lost board, a slow input. Still mostly opaque storage, plus a small stream of events.

*Product analytics.* Completion, abandonment, difficulty response. The only option that needs
queryable per-player data, and the only one that materially changes the database question.

## Findings

**A privacy cost arrives with the third option, not the first.** An identifier that singles out a
person is likely personal data even with no name attached, so anything per-player reaches
[do privacy regulations apply?](do-privacy-regulations-apply.md). Errors and aggregate counts do
not.

**Three of this project's four recorded failure modes answer "how would we notice" with
"we wouldn't."** See [../failure-modes/](../failure-modes/). That is the strongest argument that
the answer here is not "nothing", independent of any appetite for product analytics.
