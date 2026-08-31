---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Who is authoritative over puzzle state?

## Why it matters

Determines almost every other technical choice, and determines what happens when two copies of a
board disagree — which is where two existing promises, that progress is never lost and that a
player is never asked to resolve a conflict, either hold or quietly stop holding.

The question was previously framed as whether state lives on the client or the server. That
framing is answered before it is asked: the offline and instant-input guarantees require the
client to hold state under every surviving option, so state lives on the client either way. What
is open is who wins when copies disagree.

## Blocked by

[Is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md) — if a
second device never reads the same board, no two copies ever disagree and most of this question
dissolves.

## Blocks

[What renders the client?](what-renders-the-client.md),
[What runs the server, and in what language?](what-runs-the-server-and-in-what-language.md),
[What does the server store, if anything?](what-does-the-server-store-if-anything.md),
[Where does this run?](where-does-this-run.md),
[Is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md),
[What load should the server handle?](what-load-should-the-server-handle.md),
[How does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md).

## What would settle it

Mostly derivation rather than measurement. Each position can be checked against the promises in
[../guarantees/](../guarantees/) by construction — whether it puts a round trip in the input
path, whether it can lose a write, whether it forces a prompt nobody is allowed to show. What
remains after that elimination is decided by whether cross-device resume is in scope, and by
whether anything ever needs to be enforced rather than merely stored.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30. Reframed 2026-08-31 after the original
framing turned out to ask something already settled.

Findings drawn from legacy ADR-01 (render with server-driven hypermedia).

## Options

*The client holds the only copy.* No server state at all. Nothing to sync, no conflict possible,
no identity to establish, and hosting reduces to serving static files. Progress cannot follow a
player to a second device, and there is no second copy when the browser evicts the first — which
Safari does after seven days without interaction.

*The client is authoritative; the server holds a copy it never overrules.* The server is
durability and portability insurance: it stores what the client tells it and hands it back.
Recovers from eviction, and carries progress between devices. Requires identity of some kind, and
a rule for the case where two devices both wrote — but the rule can live on the server without
the server having any opinion about gameplay.

*The server is authoritative; the client holds an optimistic replica.* The client acts
immediately and reconciles afterwards, so offline play still works, but the server can overrule
and a player's moves can be undone. Buys the ability to enforce rather than merely store:
validation the client cannot bypass, entitlement checks, generation on demand.

## Findings

**The original framing asked a question the guarantees had already answered.** Input registering
without waiting for the network, and play continuing through minutes of no connectivity, both
require the client to hold and mutate state locally. No option that keeps those promises can put
authority-in-the-round-trip on the input path. So state lives on the client in every surviving
option, and the real choice is about authority, not location.

**Conflict is a multi-device problem, not an authority problem.** No position produces a
disagreement while only one device ever writes a given board — and
[../problem.md](../problem.md) describes exactly that usage: the same person switching devices
between sessions, never editing from two at once. Under single-writer use, all three options
behave identically at the moment of writing. This is why the question is blocked by cross-device
resume rather than the other way around.

**Every justification for server authority is either disclaimed or contingent, and each
contingency currently leans away from it.** Validation the client cannot bypass matters only
against an adversary, and `problem.md` states there are no adversarial stakes and anti-cheat is
not a design driver. Entitlement checks are a real prospect — [a paid tier](is-there-a-paid-tier.md) is uncommitted
but deliberately not foreclosed — but they concern authority over *which content a player may
receive*, not over the board they are filling in. A server can refuse to hand over an archived
puzzle while having no opinion about the digits being typed into today's.
Generation on demand depends on
[are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md),
which currently leans ahead of time. A canonical copy for recovery is provided equally by the
second option, without any authority attached.

This is falsifiable rather than final: a paid tier, on-demand generation, or a decision that
cheating matters would each restore a real reason for server authority. None of those is decided,
and the finding should be revisited when any of them is.

**Server authority is in direct tension with two promises we have already made.** If the server
overrules, either the player's work disappears — violating the promise that progress is never
lost — or they are asked to choose between versions, violating the promise that no conflict
prompt is ever shown. Both appear in [../guarantees/](../guarantees/). That tension only bites in
the multi-device case, which is the same case that makes the question live at all.

**So the space collapses further than it looks.** If cross-device resume is out of scope, the
first two options are behaviourally identical and the third has no benefit. If it is in scope, the
third conflicts with two existing guarantees. Either way the residual choice is between the first
two, and that difference is exactly
[what does the server store, if anything?](what-does-the-server-store-if-anything.md).

**A prior argument that does not settle this.** Legacy ADR-01 held that a hypermedia framework's
local signals give zero-round-trip interaction without giving up server-owned state — that
instant feel and server ownership are not in conflict. That claim is about interaction *latency*
and is not refuted by anything here. It says nothing about *persistence*, which is what this
question turns on: local signals can make a drag feel instant while the board still cannot be
played in a tunnel or reopened after the tab is killed.

**And a prior rejection that never happened on the merits.** ADR-01 rejected a client-heavy
application for abandoning "the server-owned-state philosophy the project wants from v1" — a
premise, not a constraint, and one the pivot has since dropped. The option now leading was never
argued against; it was excluded by an assumption.

Pure puzzle logic runs anywhere, which removes one further argument for server ownership: keeping
the rules in a single trusted place. A pure module is a single trusted place wherever it executes.
