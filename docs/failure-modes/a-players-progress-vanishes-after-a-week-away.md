---
updated: 2026-08-31
update_when: the storage or recovery design changes
decays: slow
status: active
---

# A player's progress vanishes after a week away

## Threatens

[durability.md](../guarantees/durability.md) — that in-progress work is never lost, however a
session is interrupted.

## How it happens

Progress lives in the browser, because
[ADR-0002](../decisions/0002-the-client-holds-and-mutates-puzzle-state.md) put it there. Safari
deletes all script-writable storage after seven days without interaction with the site. A player
starts a puzzle, life intervenes, and eight days later they open the app to an empty board and no
explanation. Nothing failed. Every component behaved exactly as designed.

## Why here specifically

The audience is described as playing in short bursts during commutes, and a gap of a week is
ordinary for that pattern rather than exceptional. A daily release does not prevent it — it
protects the players who return daily, who were never at risk, while the player who lapses for
eight days is both the one who loses their board and the one most likely to be deciding whether
to come back at all.

## How we'd notice

**We wouldn't.** There is no error, no crash, and no report. The player sees an empty board,
concludes the app forgot them, and stops opening it. The only signal is an absence — someone who
was playing and then wasn't — which is indistinguishable from ordinary churn.

## What reduces it

A server copy keyed to something the wipe does not reach, which is the substance of
[is cross-device resume in scope for v1?](../questions/is-cross-device-resume-in-scope-for-v1.md).
Or home-screen installation, which exempts storage from the cap entirely but relies on a prompt
being accepted. Nothing else prevents it.
