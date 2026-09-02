---
opened: 2026-09-02
status: open
resolves_into: decision
---

# What belongs on the landing page?

## Why it matters

**[../problem.md](../problem.md) describes an audience that arrives without being sold to** — casual
solvers, no assumed technical sophistication, "found rather than marketed", and a v1 found by a few
people rather than many. That rules out most of what a landing page usually is, and leaves the
question of what it is instead genuinely open rather than obvious.

**The first visit is the worst moment for a bad connection.**
[../constraints.md](../constraints.md) records that a fresh connection costs three to four round
trips before any payload moves, and that degraded signal commonly sits at the 2g tier where that
alone is several seconds. Nothing is cached yet, so whatever the landing page is, it is paid for on
the slowest load this app will ever serve.

**It is where the third maintainer purpose is legible or is not.**
[../problem.md](../problem.md) names a demonstrable internet-facing full-stack system as one of three
reasons this exists, and attaches a guard to it — would this be worth building if its demonstration
value were zero. A landing page is the one surface where that purpose could quietly justify work the
product does not need, so the guard applies here more sharply than anywhere else.

**The obvious answer may be that there is no landing page.** A puzzle is the product, and a player
who arrives should probably be solving one. Whether anything sits in front of that, and what it is
for, is the question.

## What would settle it

Listing who actually arrives and what each of them needs in the first few seconds. A returning player
wants their board. A first-time player wants to understand the thing in one glance and start. Someone
sent here to evaluate the maintainer wants something else entirely, and it is worth deciding whether
that person is served at all rather than assuming they are.

Then, for anything proposed: does a player who never reads it lose something. If not, it is a cost
paid on the slowest load in the product.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02 by the maintainer, alongside the browser testing question.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Whatever this is, it does not have to be part of the app.**
[Is the entry document produced per request?](is-the-entry-document-produced-per-request.md) already records that
"anything outside the game can be a separate static deploy or a separate server; it does not require
the game itself to be rendered remotely." So the answer here cannot force the rendering decision, and
should not be allowed to look as though it does.

**Anything shown before a player can solve is on the offline path too.**
[The app never opens to a blank screen](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md) and
[the board in play continues through a loss of connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md),
and [how does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md)
records that the precache list is a build output. A landing page is either precached, in which case
it is part of the shell and its weight is permanent, or it is not, in which case a returning offline
player must not be routed through it.
