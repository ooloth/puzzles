---
updated: 2026-08-31
update_when: the storage or recovery design changes
decays: slow
status: active
---

# A player's progress vanishes after a month away

## Threatens

[Reopening restores the board in progress with notes and selection](../guarantees/reopening-restores-the-board-in-progress-with-notes-and-selection.md)
— the board does not come back at all. How long that promise is meant to hold for is itself
unsettled; nothing promises how long a player's work lasts, which is why this failure currently
violates an intention in [../problem.md](../problem.md) rather than a bound anything has
committed to.

## How it happens

Progress lives in the browser, because
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) put it there. Safari
deletes all script-writable storage after thirty days without interaction with the site. A player
starts a puzzle, life intervenes, and five weeks later they open the app to an empty board and no
explanation. Nothing failed. Every component behaved exactly as designed.

## Why here specifically

The audience is described as playing in short bursts during commutes, and a month-long gap is
uncommon for that pattern but not rare — an illness, a busy period at work, or a holiday reaches
it. A daily release does not prevent it: it protects the players who return daily, who were never
at risk, while the player who lapses for a month is both the one who loses their board and the one
most likely to be deciding whether to come back at all.

A thirty-day window makes this rarer than a seven-day one would, which lowers how often this fires
without changing what happens when it does.

## How we'd notice

**We wouldn't.** There is no error, no crash, and no report. The player sees an empty board,
concludes the app forgot them, and stops opening it. The only signal is an absence — someone who
was playing and then wasn't — which is indistinguishable from ordinary churn.

## What reduces it

A server copy keyed to something the wipe does not reach, which is the substance of
[is cross-device resume in scope for v1?](../questions/is-cross-device-resume-in-scope-for-v1.md).
Or home-screen installation, which exempts storage from the cap entirely but relies on a prompt
being accepted. Nothing else prevents it.
