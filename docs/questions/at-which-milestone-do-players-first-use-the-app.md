---
opened: 2026-10-03
status: open
resolves_into: decision
---

# At which milestone do players first use the app?

## Why it matters

Some questions can wait exactly until there are players, and no record says when that is.
[What does a browser below the floor see?](what-does-a-browser-below-the-floor-see.md) sits at M12
because "nobody is below the floor until there are players", and
[at what hour does the machine apply updates and reboot?](at-what-hour-does-the-machine-apply-updates-and-reboot.md)
sits there for the same reason. So do privacy, what play is recorded, and the questions about
operating a store that holds player data. If players arrive earlier than M12, all of them are
answered too late; if later, too early.

[../problem.md](../problem.md) asks for "a small, genuinely public v1 within a few months", and
[ADR-0002](../decisions/0002-launch-with-sudoku-then-star-battle.md) says which games launch. Neither
names the milestone at which the app is first offered to anyone but the maintainer.

**Environments:** production only.

## What would settle it

...

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/), and the milestone list in
[README.md](README.md) moving any question keyed on players to match.

## Source

Raised on 2026-10-03 by a handoff check, while placing the update-hour question: several questions
key on "when there are players", and no milestone marks that point.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The milestone list places players at the end of M12** (2026-10-04), as a sketch the maintainer
chose without a record. M12 is where recording play, keeping a guest's work through eviction, and
privacy were all required to land before anyone arrives. This question stays open for the record,
and the list moves with whatever it settles.
