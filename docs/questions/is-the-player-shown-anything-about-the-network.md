---
opened: 2026-09-01
status: open
resolves_into: decision
---

# Is the player shown anything about the network?

## Why it matters

[../guarantees/offline.md](../guarantees/offline.md) promises the network never blocks, delays or
interrupts play. That is a promise about what the network may do to a player. Whether the interface
says anything about it — an offline glyph, a note that a puzzle will sync later, a quiet indication
that something is pending — is a separate judgement, and it is open.

Three things depend on this being answered deliberately rather than by default: whether a guest is
told their work is held only on this device, whether a pending sync is ever visible, and what
[observability](../guarantees/observability.md) is allowed to be. The last is not really governed by
this question at all — alerts go to the maintainer, who can act on them, not to the player, who
cannot — and reading it as governed here is what has kept observability looking like a conflict.

A promise that forbids an affordance rather than a harm makes all three unreachable at once, which
is why the guarantee is scoped to what the network may do to a player and this file holds the rest.

## Blocked by

N/A — nothing needs to be answered first.

## What would settle it

Naming what a player could *do* with each piece of information. Anything they cannot act on is
decoration at best and anxiety at worst; anything they can act on has a case for being shown.

The guest case is the sharp one. A guest's work is bounded by what the browser keeps, and the action
available to them is signing in. That is information they can act on, which is a different thing
from a spinner.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01 by the maintainer, on finding that the offline guarantee had settled this by
prescription rather than leaving it to be decided.

## Options

*Nothing at all.* The original position. Simplest, and it means a guest is never told their work is
at risk.

*Connection state only.* An offline indicator, shown while there is no connection and never
demanding anything.

*Durability state, not connection state.* Say nothing about the network, but tell a player when
their work is held only on this device and what would change that. Distinguishes the thing they can
act on from the thing they cannot.

*Both, at different moments.* Connection state passively; durability state when there is something
worth protecting.

## Findings

**What this decides beyond itself.** [../guarantees/observability.md](../guarantees/observability.md), which is a stub, and
[how would we learn a player lost progress?](how-would-we-learn-a-player-lost-progress.md).
Also whether a guest is told their work is only held locally, which
[ADR-0006](../decisions/0006-what-a-players-work-survives.md) leaves open.

**Reporting to the maintainer was never in tension with this.** It is not shown to a player, so no
promise about the player's experience reaches it. That tension is recorded in
[../guarantees/observability.md](../guarantees/observability.md) and in
[what does the server hold?](what-does-the-server-hold.md) and is dissolved rather than
resolved.
