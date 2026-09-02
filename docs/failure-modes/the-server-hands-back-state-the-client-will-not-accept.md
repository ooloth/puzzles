---
updated: 2026-09-01
update_when: validation, the storage format, or the sync design changes
decays: slow
status: active
---

# The server hands back state the client will not accept

## Threatens

[Reopening restores the board in progress with notes and selection](../guarantees/reopening-restores-the-board-in-progress-with-notes-and-selection.md)
— the work is intact on the server and unreachable by
the player. Also
[the app never opens to a blank screen after the first visit](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md),
because a board that will not open is exactly the presentation that promise forbids — though the
cause here is a version disagreement rather than the network.

## How it happens

The server holds a board. The client asks for it, gets it, and finds it does not match what the
client believes a board is: a field it does not recognise, a field it requires that is missing, a
value outside the range it expects, or a game type it has no renderer for.

Three ways the data got there, and they need different answers.

**The client wrote it that way.** A bug serialised something malformed and it was stored faithfully.
The data is wrong at rest.

**The client was a different version.** An older client wrote a shape a newer one no longer accepts,
or a newer client wrote a shape an older one has never seen. Both copies are correct for the version
that produced them, and neither is a bug. This is the ordinary case, and it happens without anything
going wrong.

**The server changed underneath it.** A schema migration or a validation rule was introduced that
existing rows do not satisfy.

## Why here specifically

[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) makes the client
authoritative, so there is nothing to appeal to. The server cannot re-derive a correct board,
because it may not know what one is — see
[does the server understand puzzle content?](../questions/does-the-server-understand-puzzle-content.md).
[ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) establishes that
the server holds a durable per-player record, which makes this at minimum a *signed-in* player's
problem — the persona who took an action to protect their work. Whether it also reaches a guest's
depends on [is guest recovery worth building?](../questions/is-guest-recovery-worth-building.md),
which is still open.

The version case is guaranteed to occur rather than merely possible. A web client updates whenever
the player loads it, and [ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md) plus the
offline guarantee mean an installed or cached client can be arbitrarily old while its data is
current. Two devices belonging to one player will routinely run different versions.

## What we'd see

Nothing, unless something is built to look. The likely surface is a board that fails to open or
opens empty, on one device, for one player, with the good copy sitting in the database. A player who
sees an empty board where their work was does not report a schema mismatch; they conclude the app
lost their puzzle.

## What reduces it

Nothing yet. The candidates each need deciding rather than assuming, and they belong to different
questions.

An explicit schema version stored with every record, so a mismatch is detected rather than inferred
from a parse failure — named as a cheap constraint in
[ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md), and unclaimed by any record since.

A rule that the client never discards state it cannot read, so a future version can recover what a
present one cannot. Discarding is the tempting fix and it converts a recoverable problem into the
permanent one.

Deciding whether the server validates on write, which narrows the first cause and does nothing about
the second — see
[does the server understand puzzle content?](../questions/does-the-server-understand-puzzle-content.md).
