---
opened: 2026-08-30
status: open
resolves_into: decision
---

# What happens to a losing write when syncing?

## Why it matters

Last-write-wins discards the losing write. Whether silently discarding a player's moves is
compatible with what this project intends is unresolved. **No promise about progress never being lost
exists** — [../guarantees/README.md](../guarantees/README.md) names "that no move is lost when a
connection fails" as one of two nearby claims deliberately not promised, precisely because no record
has argued it. What does exist is the intention in [../problem.md](../problem.md) that a player never
loses in-progress work, and this question is one of the things standing between that intention and a
promise.

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

**There may be no losing write.**
[what the server does with puzzle state](what-does-the-server-do-with-puzzle-state.md)
settles that merges are deterministic and per cell, which means two devices that edited different
cells both keep their work — the union is the answer, and nothing is discarded. A write is only
lost where both devices changed the *same* cell, and then only the older one, which is a single
value rather than a session.

What remains open is narrower than the title suggests: whether losing one cell's value silently is
acceptable, or whether that case deserves surfacing somehow — bearing in mind that
[conflicts are reconciled without asking the player](../guarantees/conflicts-are-reconciled-without-asking-the-player.md)
forbids asking the player to choose.

**Every sync engine somebody would plausibly reach for solves a problem this app does not have, and
four of them died or stalled inside eighteen months.** They exist for concurrent multi-writer
conflict resolution at scale. This app has sequential single-writer use — a phone put down, a laptop
opened hours later — which is the case none of that machinery is for.

The dependency picture, checked 2026-09-02:

| Project | State |
| --- | --- |
| Replicache | Archived 2026-06-10; maintenance mode, users pointed at Zero |
| ElectricSQL | Team joined Databricks 2026-08-11; Electric Cloud winding down with no stated shutdown date; the open-source projects continue |
| InstantDB | Team joined OpenAI 2026-08-22; signups closed, cloud apps shut down 2027-08-31, backups retained to 2028-08-31 |
| Legend-State | In 3.0 beta since 2024-09-22 with no stable release; npm `latest` still 2.1.15 from 2024-08-30 |
| Triplit | Last pushed 2026-01-19, roughly seven months stale; AGPL-3.0, which `../constraints.md` records as disqualifying for a hosted service |
| LiveStore, TinyBase, Evolu | Healthy and actively released, and each effectively one person |

That pattern is the strongest argument in the research for hand-rolling. It is not an argument that
these are bad projects.

*Sourced — <https://github.com/rocicorp/replicache>,
<https://electric.ax/blog/2026/08/11/electric-joining-databricks>,
<https://www.instantdb.com/essays/instant_team_joins_openai>, the npm registry for
`@legendapp/state`, and GitHub push dates. Checked 2026-09-02.*

**A grid of independent cells is the case per-cell last-write-wins was designed for, and it has a
name.** The CRDT literature separates LWW-Set, which carries one timestamp for a whole collection and
therefore discards a losing write's untouched elements along with the contested one, from
LWW-element-Set, which carries a timestamp per element and merges by union so untouched elements are
never lost. Cassandra ships the second at production scale — "a Last-Write-Wins Element-Set
conflict-free replicated data type for each CQL row", with "separate mutation timestamps to every
column of every row". A worked write-up applies exactly this to a spreadsheet, with a parallel
versions table holding one timestamp per cell and a measured cost of eight bytes per cell version.

An eighty-one cell grid with per-cell timestamps is structurally the same thing. The cost, stated
plainly by PowerSync, is "extra complexity... more timestamp columns, and your backend has to compare
fields one by one".

*Sourced — Shapiro et al., INRIA RR-7506, <https://hal.inria.fr/inria-00555588/document>;
<https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html>;
<https://www.bartoszsypytkowski.com/crdt-tables/>;
<https://docs.powersync.com/handling-writes/custom-conflict-resolution>. Checked 2026-09-02.*

**The claim that a CRDT would buy nothing here is plausible and was not confirmed.** This project's
brainstorming material asserts that Automerge collapses independent scalar fields to last-write-wins
internally, so adopting a full CRDT for this data shape would produce output indistinguishable from a
version counter. Automerge's exact scalar tie-break rule could not be retrieved from its
documentation. The conclusion may well be right; nobody has established it.

*Unverified — searched and not found, 2026-09-02.*

**Whole-document last-write-wins loses data that nobody edited, and there is a production example.**
DynamoDB Global Tables resolve at item level, so a later write to one attribute overwrites the entire
item and silently reverts a concurrent update to a different attribute. Their own mitigations are to
route all writes for an item to one region, and to prefer absolute writes over relative ones —
`Bookmark = 25` rather than `Bookmark = Bookmark + 1`.

*Sourced —
<https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables_HowItWorks.html>,
checked 2026-09-02.*

**A single server-assigned counter is enough here, and it is worth saying exactly when it stops
being.** It suffices when one writer is effectively active per record at a time and you only need to
know *that* a client is stale, not *why* two writes conflicted. Both hold. Lamport clocks give a
total order consistent with causality but cannot detect that two writes were concurrent; hybrid
logical clocks solve causal ordering without a central sequencer, and this app has a central
sequencer, so they solve a problem it does not have. The same mechanism runs in production as
DynamoDB's `ConditionExpression` on a version attribute and as HTTP's `ETag` with `If-Match`.

*Sourced — Lamport 1978, <https://dl.acm.org/doi/10.1145/359545.359563>; Kulkarni et al.,
<https://cse.buffalo.edu/tech-reports/2014-04.pdf>; RFC 7232,
<https://www.rfc-editor.org/rfc/rfc7232.html>. Checked 2026-09-02.*

**Comparing client wall-clock timestamps instead is the documented way to lose data silently.**
`Date.now()` is tied to the OS clock and is explicitly non-monotonic — it can go backwards if the
user changes their clock — which is why `performance.now()` exists as a separate monotonic reading.
Riak's own writing reports nodes up to thirty seconds out of sync, with the consequence that "if two
updates to the same object occur within 30 seconds in such an environment, the end result is
unpredictable". HTTP's specification prefers `ETag` over `If-Unmodified-Since` for the related reason
that timestamp conditionals have one-second resolution and two rapid updates in the same second
collide unnoticed.

*Sourced — <https://developer.mozilla.org/en-US/docs/Web/API/Performance/now>;
<https://riak.com/clocks-are-bad-or-welcome-to-distributed-systems/>; RFC 7232. Checked 2026-09-02.*

**Deletes are the trap, and this app has one place where they bite.** A reconnecting client cannot
distinguish "never existed here" from "existed and was deleted elsewhere while I was offline" —
absence looks identical either way. Obsidian Sync hit exactly this in 2026: a desktop deleted around
eighty files while an Android device was offline for four weeks, and on reconnect the deleted files
reappeared and duplicated, because the reconnecting device found local files with no remote
counterpart and assumed they were new local creations. Cassandra's version of the same failure has a
name — records that come back are "zombies" — and its defence is repairing every table inside the
tombstone retention window.

Cells cannot be deleted, so the grid is safe. A play record can be: abandoning an attempt, or
deleting an account. That is where a stale device resurrects something.

*Sourced — <https://forum.obsidian.md/t/obsidian-sync-silently-resurrects-deleted-moved-files-when-offline-device-reconnects/113242>;
<https://docs.datastax.com/en/dse/6.9/architecture/database-internals/architecture-tombstones.html>.
Checked 2026-09-02.*
