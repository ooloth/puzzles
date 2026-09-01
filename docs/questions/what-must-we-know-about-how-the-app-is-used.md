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

There is a second reader here besides the running system: the maintainer. Wanting to look at
historical play — which puzzles people finish, where they stall, whether a difficulty grade
predicts anything — is a reason for both a server and a queryable store that has nothing to do
with durability, and it survives
[ADR-0006](../decisions/0006-what-a-players-work-survives.md) having settled how long a player's
work lasts. It is the one input that can make
[which database, if any?](which-database-if-any.md) a real decision rather than a formality.

It also decides whether several promises are checkable.
[../guarantees/durability.md](../guarantees/durability.md) says work is never lost and is
currently enforced by nothing; whether that is being kept is a usage question, and
[how would we learn a player lost progress?](how-would-we-learn-a-player-lost-progress.md) has no
answer without one.

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

*Historical play, kept for the maintainer to look at.* Distinct from the above: not a dashboard
that has to answer questions quickly, but a record complete enough to interrogate later. Cheaper
than analytics in machinery and more expensive in retention and privacy, since it means keeping
per-player detail indefinitely rather than aggregating it away.

## Findings

**What this decides beyond itself.** Which database, if any — see [what does the server hold?](what-does-the-server-hold.md) and
[what does the server store, if anything?](what-does-the-server-store-if-anything.md). Also
[how would we learn a player lost progress?](how-would-we-learn-a-player-lost-progress.md) and
[how would we verify progress is never lost?](how-would-we-verify-progress-is-never-lost.md),
neither of which is answerable while this is open.

**A privacy cost arrives with the third option, not the first.** An identifier that singles out a
person is likely personal data even with no name attached, so anything per-player reaches
[do privacy regulations apply?](do-privacy-regulations-apply.md). Errors and aggregate counts do
not.

**Three of this project's four recorded failure modes answer "how would we notice" with
"we wouldn't."** See [../failure-modes/](../failure-modes/). That is the strongest argument that
the answer here is not "nothing", independent of any appetite for product analytics.
