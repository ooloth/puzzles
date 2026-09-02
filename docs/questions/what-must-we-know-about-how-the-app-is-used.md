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
with durability, and it holds regardless of how
[how long does a guest's work last?](how-long-does-a-guests-work-last.md) and
[how long does a signed-in player's work last?](how-long-does-a-signed-in-players-work-last.md) are
eventually answered. It is the one input that can make
[which database, if any?](which-database.md) a real decision rather than a formality.

It also decides whether several promises are checkable.
[Reopening restores the board in progress with notes and selection](../guarantees/reopening-restores-the-board-in-progress-with-notes-and-selection.md)
is currently enforced by nothing; whether that is being kept is a usage question, and
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

A decision record in [../decisions/](../decisions/), and probably a new promise under the
Observability theme in [the guarantees README](../guarantees/README.md).

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

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A privacy cost arrives with the third option, not the first.** An identifier that singles out a
person is likely personal data even with no name attached, so anything per-player reaches
[do privacy regulations apply?](do-privacy-regulations-apply.md). Errors and aggregate counts do
not.

*Unverified — no source recorded.*

**Three of this project's four recorded failure modes answer "how would we notice" with
"we wouldn't."** See [../failure-modes/](../failure-modes/). That is the strongest argument that
the answer here is not "nothing", independent of any appetite for product analytics.

**[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) settles that whatever is stored is analysable, not whether anything about usage is
collected at all.**
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) settles the
shape of [which database, if any?](which-database.md) — that stored data can be queried
rather than only retrieved. Whether anything about usage is collected in the first place is this
question, and it is a different one.
