---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Is puzzle state a snapshot or an event log?

## Why it matters

Shapes the sync protocol, how undo works, and what "the same board" means when two copies have
to be reconciled.

## What would settle it

Writing both for one board and seeing which is smaller. The pair that matters is applying a move and
restoring from cold, and the honest comparison includes undo, since
[how far back it goes](is-undo-in-scope-and-how-far-back.md) is what makes a log pay for itself or
not.

Two things to size while doing it: what a session's worth of actions costs in bytes under each, and
what replay costs at the upper end of a game's length. Both are cheap to measure and neither has
been.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Finding drawn from legacy ADR-11 (track progress via anonymous server-side sessions).

## Options

*Versioned snapshot with last-write-wins.* Small and simple; right-sized for roughly 81
independent scalar values.

*Event log.* Undo falls out for free and replay is cheap at 50-300 actions per game, but it
is more moving parts to build and keep correct.

*An event log adopted as part of [LiveStore](https://livestore.dev/)*, which builds on one and does
not offer the alternative. It is recorded as a candidate under
[which client storage mechanism?](which-client-storage-mechanism.md), where what it bundles and what
it costs are set out. It matters here because choosing it settles this question as a side effect
rather than on the merits below, and this question also constrains
[how far back undo goes](is-undo-in-scope-and-how-far-back.md). If the event log wins on its own
terms, that is an argument for LiveStore. The reverse is not an argument for the event log.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Things 3 has run an operation log for over a decade, which is the strongest existence proof either
option has.** Cultured Code will not describe their algorithm beyond saying its foundation is
"inspired by operational transformations and Git's internals", but three independent
reverse-engineering efforts between 2020 and 2025 all found the same shape: an endpoint returning
discrete update objects with types rather than full snapshots, and a server-assigned index the client
uses as a cursor. One of those efforts observed forty-odd semantic event types — `TaskCompleted`,
`TaskMovedToToday`, `TaskTitleChanged` — rather than generic edits.

*Sourced — the OT and Git framing is Cultured Code's own, via
<https://www.swift.org/blog/how-swifts-server-support-powers-things-cloud/>. The protocol shape is
reverse-engineered and unofficial: <https://ziyang.io/blog/2020-03-things-3-cloud-api>,
<https://github.com/disrupted/things-cloud-api>,
<https://github.com/nicolai86/things-cloud-sdk>. Checked 2026-09-02.*

**They moved one part of it from snapshot to log after nine years, and said why.** Until 2021, editing
a note re-synced the entire note; the "Fractus" release changed it so "only the text you modify is
synced". That is the snapshot-to-log move made in production on a live product, for a specific data
type, long after launch — which is evidence that the two can coexist and that the choice can be
revisited per field rather than taken once for everything.

*Sourced — <https://www.macrumors.com/2021/08/11/things-3-14-update-markdown-find-in-text/>, checked
2026-09-02.*

**A claim widely attributed to them is not theirs.** "The local database is the source of truth, and
the app never blocks on the network" appears in this project's own brainstorming material as a Things
3 fact. Cultured Code has never written it. It is a reasonable inference from how the app behaves and
it is not a citable statement, and it should not be used as though somebody established it.

*Unverified — searched for and not found in Cultured Code's blog, the Apple and Swift.org case
studies, or any interview, 2026-09-02.*

**LiveStore is the closest current implementation of the log option, and it is worth reading rather
than installing.** Its write model is an ordered log of events and its SQLite database is explicitly
"a projection of this eventlog" that can be rebuilt by replay. Three ideas in it are worth taking
whatever this question decides: event names carry their version in the name (`v1.TodoCreated`) rather
than in a separate field; event IDs are client-generated so an offline device can create one, while
ordering comes from a server-assigned sequence number, so **the id is not the order**; and its docs
tell you to avoid delete events in favour of soft deletes.

*Sourced — <https://docs.livestore.dev/understanding-livestore/event-sourcing/> and
<https://docs.livestore.dev/building-with-livestore/events/>, checked 2026-09-02.*

**The reducer purity problem is real, and one project enforces it rather than documenting it.**
LiveStore's materialisers must be pure because they are replayed, and version 0.4.0 added a
development-time hash check that detects an impure one. Any event log has this hazard — a reducer
that reads the clock or a random value produces a different state on replay than it did when the
event was first applied.

*Sourced — <https://docs.livestore.dev/building-with-livestore/state/materializers/> and
<https://docs.livestore.dev/changelog/>, checked 2026-09-02.*

**Log compaction is the unsolved half.** LiveStore has no eventlog compaction; the design proposal has
been open since August 2024. An append-only log of every cell entry on every puzzle grows without
bound, and nothing in the field surveyed here has a cheap answer.

*Sourced — <https://github.com/livestorejs/livestore/issues/136>, checked 2026-09-02.*

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

The two options start from opposite defaults on derived state. An event log makes every visible
value — the current board, whether a puzzle is complete, how many cells remain — derived by
construction, because the log holds moves rather than conclusions. A snapshot stores the board
directly, and every additional value kept beside it is a second thing that can disagree with the
first.

That matters because deriving rather than storing is the default the portable standards prefer,
and denormalisation is the case that has to be argued. An event log satisfies it without effort;
a snapshot satisfies it as long as nothing accumulates around it, which is a discipline rather
than a property. See [../standards/README.md](../standards/README.md) for where those live.
