---
updated: 2026-09-02
status: active
decays: slow
update_when: the client stops being authoritative, or a second device stops being possible
---

# A player resumes from a board another device moved past

## Threatens

[Reopening restores the board in progress with notes and selection](../guarantees/reopening-restores-the-board-in-progress-with-notes-and-selection.md)
— not because work is destroyed, but because the player
watches their own progress go backwards, which is indistinguishable from work being destroyed.

## How it happens

A player solves on a phone, which syncs. They continue on a laptop, which syncs. They pick the phone
up in a tunnel, and the phone opens the board as the phone last knew it — several moves behind. Play
resumes from there.

Nothing has gone wrong. Every device did what it was asked, both copies were made by the same person,
and no write has been lost. The phone simply has no way to know that a newer copy exists, because
knowing would require asking something it cannot reach.

## Why here specifically

[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) makes the client
authoritative so that play survives a dead connection, and
[the board in play continues through a loss of connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md)
promises play continues with no network. Together those mean a
device answers from what it holds without checking. That is the correct trade against the modal case
in [problem.md](../problem.md), and this failure is its standing cost rather than a defect in it.

The window is bounded by exactly one thing: how long the stale device stays offline. Nothing else
about the design changes its size.

## How we'd notice

**We wouldn't.** No error is raised, no write fails, and no invariant over the stored data is
violated — both boards are well-formed and both are legitimate. The player notices, and what they
notice is a puzzle they remember solving further into.

The reconnect is where it becomes observable at all, and by then the divergence already exists. A
device that resumed from behind and then synced is distinguishable from one that simply played, but
only if something recorded which copy it started from.

## What reduces it

Recording, per board, which version the device started from, so a reconnect can tell "resumed from
current" apart from "resumed from behind". This is the difference between the failure being invisible
and being merely unpreventable.

Nothing prevents it while the device is offline, and no design can — the information required is on
the other side of the connection that is missing. Any mitigation therefore acts after the fact, which
makes this a question about what the player is told rather than about what the system detects. See
[how does a device know its board is behind?](../questions/how-does-a-device-know-its-board-is-behind.md).

Refusing to open an unconfirmed board would prevent it and is not available: it contradicts both the
offline promise and
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md).
