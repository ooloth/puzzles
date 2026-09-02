---
number: 0009
status: accepted
date: 2026-09-01
---

# 0009 — The durable copy of a player's state is not on their device

## Forced by

Four things want state that a device cannot be trusted to keep. Each would be enough on its own; all
four point the same way.

**[../problem.md](../problem.md) says a player's work follows them.** "The board left on a phone is
waiting on a laptop later, and a puzzle from any past day is still where they left it." A second
device has never seen the first, so nothing held on the first can reach it.

**[../problem.md](../problem.md) says the record of their play is theirs to keep, and outlives any
one device.** That is a promise about duration, and
[../constraints.md](../constraints.md) records that the browser clears every script-writable store
after thirty days without interaction, taking the board, every past board and the play record
together. A device is not a place where something outlives a device.

**[../problem.md](../problem.md) makes the generator's quality the point of the project**, and
whether generated puzzles are actually good can only be checked against real solves — which means
solve data has to be somewhere it can be read. A device holds one player's, and only while that
player still has it.

**[../problem.md](../problem.md) keeps a paid tier uncommitted and deliberately not ruled out.**
Whether someone has paid cannot be held by the device it would be charging.

## Decision

**The authoritative durable copy of a player's state is kept off their device.**

**It does not move where state is authoritative during play.**
[ADR-0004](0004-the-client-holds-and-mutates-puzzle-state.md) put that on the client for latency and
offline reasons, and this does not reopen it. The device holds the copy a player interacts with; the
off-device copy is the one that survives the device.

**It settles that such a copy exists, not what is in it or what it is stored in.** Which fields,
which shape, and which database remain open, including
[which database, if any?](../questions/which-database.md).
[ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) constrains what the store has
to be capable of; this establishes that there is one to constrain.

**It does not say what a guest gets.** How long a guest's work lasts, how long a signed-in player's
does, and whether the two records are one shape are three open questions —
[guest](../questions/how-long-does-a-guests-work-last.md),
[signed-in](../questions/how-long-does-a-signed-in-players-work-last.md),
[shape](../questions/is-the-guest-record-the-same-shape-as-the-account-record.md). This record is
upstream of all three: it establishes that off-device durable state exists, and they decide who gets
it and on what terms.

## Rejected

- **Keep everything on the device, and accept the loss.** A genuine option and by a wide margin the
  cheapest — no store, no server, nothing kept about anyone, no privacy obligations, no operational
  surface. Several puzzle apps work this way. It is disqualified by
  [../problem.md](../problem.md)'s statement that a player's work follows them between devices, which
  no arrangement of local storage can deliver, because the second device has never seen the first.
  To choose this is to change that statement, which is a product decision rather than a technical
  one.

  *The other three reasons above would not have disqualified it alone. Eviction affects only players
  who lapse for thirty browser-active days; the generator's feedback loop could be served by the
  maintainer's own solves; and the paid tier is uncommitted. Naming which reason actually does the
  work is what stops this rejection resting on a stack of weak ones.*

- **Keep it on the device, and let the player export and import a file.** Explicit, gives the player
  full control of their own data, and costs no store at all. It fails against the same statement:
  `../problem.md` describes an audience with no assumed technical sophistication, and asks that
  nothing be reconciled by hand. A player who must remember to export before their browser forgets
  has been made responsible for the failure.

- **Keep it on the device, and sync device to device directly.** Peer-to-peer between a player's own
  devices, with no store in the middle. Real, and it would satisfy the cross-device statement without
  a server holding anything. Rejected because both devices have to be online at once for it to work
  at all — and [../constraints.md](../constraints.md) records that this app is used in tunnels and
  dead zones on one device at a time. The case it must serve is a phone put down and a laptop opened
  hours later.

- **Decide it when the second device is actually built.** The honest "not yet". Rejected because the
  first milestone that stores anything is M2, and the shape written then is the shape a migration
  would have to move. `../problem.md`'s cross-device statement is not a maybe, so deferring this
  defers nothing except the cost of doing it late.

## Risk

**This is the record that takes on every obligation that follows from holding player data.** Privacy
law, deletion requests, breach exposure, backups, and the cost of running a store — none of which
exist while everything is on the device.
[Do privacy regulations apply?](../questions/do-privacy-regulations-apply.md) is unresearched, so the
size of the first of those is unknown at the moment it is being incurred.

**It is decided from `../problem.md`'s statements rather than from any observation of players.**
Nobody has been asked whether they want their board on a second device. The statement is the
maintainer's intent for the product, which is a legitimate input and is not evidence about anyone.

**It reads as bigger than it is.** "Durable state off the device" invites building sync, accounts and
a schema. None of that is authorised here, and the three questions named above decide who gets what.

## Revisit when

- **`../problem.md` stops saying a player's work follows them.** That statement is doing all the
  work; the other three reasons would not carry this alone, and the Rejected section says so.
- **Privacy research makes holding player data materially expensive**, per
  [do privacy regulations apply?](../questions/do-privacy-regulations-apply.md). It would not reverse
  this — the cross-device statement still stands — but it would change what is stored and for how
  long.

## Also update

- [x] Nothing in `constraints.md` — this imports no facts about the world
- [x] Nothing in `guarantees/` — `guarantees/durability.md` currently promises no per-persona bound,
      and the three questions named above are where each bound is decided

Deliberately not decided here: what is stored, in what shape, in which database, who can reach it,
how it gets there, how long it is kept, and what a guest gets.
