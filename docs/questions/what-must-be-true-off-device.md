---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What must be true off the device?

## Why it matters

This is the question that decides whether a server exists, and it has never been asked directly.
Every discussion so far has started from a server being assumed and argued about what it should
do — [ADR-0003](../decisions/0003-the-server-validates-puzzle-state-but-does-not-arbitrate-it.md)
specifies how it validates and merges without anything establishing that it is there.

A browser can hold a puzzle, a player's progress, and the rules. What it cannot do is hold
something the player must not be able to change, or something that has to be reachable from a
device they have not used yet. Those are the only two reasons to run anything at all, and naming
which apply is the whole decision.

## Blocked by

[How long must in-progress work survive?](how-long-must-in-progress-work-survive.md) — a promise
that outlives the device's storage is the main candidate for something that must be true
elsewhere.

## Blocks

Whether a server exists, and therefore
[what does the server store, if anything?](what-does-the-server-store-if-anything.md),
[where does this run?](where-does-this-run.md),
[what load should the server handle?](what-load-should-the-server-handle.md), and which database
if any. Also [are there user accounts?](are-there-user-accounts.md), since identity only has to
exist if something off-device has to be attributed.

## What would settle it

Listing the candidates and testing each against a single question: could the device hold this
instead, and what breaks if the player edits it? Anything that survives that test is the reason a
server exists. If nothing survives it, this is a static site.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31. Working backward from "which database" found that no question established a
server in the first place, though one decision record already describes its behaviour.

## Options

Not alternatives so much as a checklist — the answer is whichever subset applies.

*Nothing.* A static site. Puzzles ship with the app or are fetched as files; progress lives on the
device and its loss is accepted.

*A copy of progress*, so eviction and device changes are survivable.

*An entitlement* — whether this player has paid — which cannot live on the device, because the
device belongs to the person it would be charging.

*The catalogue*, if which puzzles exist changes over time rather than shipping with a build.

*Usage we need to see*, which is [its own question](what-must-we-know-about-how-the-app-is-used.md)
and which drives whether stored data must be queryable or can stay opaque.

## Findings

**Puzzle content does not need a server by itself.** Generated ahead of time, puzzles are static
files, and a daily rhythm is satisfiable by shipping a manifest. That removes the most obvious
reason to have one and leaves the less obvious ones, which is why this question is worth asking
rather than assuming.

**Entitlement is the one candidate that cannot be softened.** Progress can be lost, a catalogue
can be stale, usage can go unmeasured — all degrade gracefully. A paid tier enforced on the device
is not enforced. So [is there a paid tier?](is-there-a-paid-tier.md) is the sharpest input here,
and [../problem.md](../problem.md) records that the option must stay open rather than that it is
committed.

**A server can exist without being on the interaction path.**
[ADR-0002](../decisions/0002-the-client-holds-and-mutates-puzzle-state.md) already puts
authoritative state on the client, so anything here is a background copy or a background check.
Establishing that a server exists does not reopen that decision.
