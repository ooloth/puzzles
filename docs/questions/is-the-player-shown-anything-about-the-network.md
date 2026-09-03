---
opened: 2026-09-01
status: open
resolves_into: decision
---

# Is the player shown anything about the network?

## Why it matters

[The network never blocks, delays or interrupts play](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md).
That is a promise about what the network may do to a player. Whether the interface
says anything about it — an offline glyph, a note that a puzzle will sync later, a quiet indication
that something is pending — is a separate judgement, and it is open.

Three things depend on this being answered deliberately rather than by default: whether a guest is
told their work is held only on this device, whether a pending sync is ever visible, and what
[observability](../guarantees/README.md) is allowed to be. The last is not really governed by
this question at all — alerts go to the maintainer, who can act on them, not to the player, who
cannot — and reading it as governed here is what has kept observability looking like a conflict.

A promise that forbids an affordance rather than a harm makes all three unreachable at once, which
is why the guarantee is scoped to what the network may do to a player and this file holds the rest.

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

*Wait state, which is neither of the above.* Say nothing about the connection and nothing about
durability, but show that a fetch is in progress when the player is genuinely blocked on one. This is
narrower than connection state — it appears only during the moments enumerated in
[../problem.md](../problem.md) under "Where a player waits", and says nothing the rest of the time.
It also survives the test in **What would settle it** differently from the others: a player cannot
*act* on it, but it is what distinguishes "working" from "broken", which is the distinction
[the app never opens to a blank screen after the first visit](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md)
already says the interface owes them.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**[Observability](../guarantees/README.md) is a theme in the guarantees README holding no promises
yet, and whether a guest is told their work is only held locally is still open** — see
[how long does a guest's work last?](how-long-does-a-guests-work-last.md), where the disclosure
question is raised and left unresolved.

**Reporting to the maintainer was never in tension with this.** It is not shown to a player, so no
promise about the player's experience reaches it. That tension is recorded in
[the guarantees README](../guarantees/README.md) and in
[how would we learn a player lost progress?](how-would-we-learn-a-player-lost-progress.md) and is
dissolved rather than resolved.

**A promise candidate exists for the wait-state option, and it is the narrowest thing here.** "The app
says when it is waiting for the network" was raised 2026-09-03 while enumerating what a player waits
for. It was not written, because promises are written as they fall out of records rather than
committed to in advance — but it is what the fourth option above would commit to.

**The waits it would cover are enumerated** in [../problem.md](../problem.md) under "Where a player
waits". Five moments, of which one —
opening a puzzle whose content has never reached the device — happens to every active player at least
daily. That changes the scale of this question: it is not only about an offline glyph on an unusual
day, it is about the ordinary daily entry into the app.

**Whether this milestone is still the right one is worth re-checking.** It sits at M9, where offline
behaviour is the point. The waits above become real at M8, when puzzles are fetched on a rhythm and a
player could sit in front of one. Nothing forces the move — M8 can complete with nothing shown — but
"nothing shown" would then be the answer by default, which is the failure this file exists to prevent.

*Reasoned — 2026-09-03, from the enumeration named.*
