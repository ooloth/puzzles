---
number: 0009
status: accepted
date: 2026-09-01
amended: 2026-10-04
---

# 0009 — The durable copy of a player's state is not on their device

## Forced by

Four things want state that a device cannot be trusted to keep. The first two bind from the first
player; the last two bind later, and each would force the same answer on its own.

**[../problem.md](../problem.md) says a player never loses in-progress work, and that the record of
their play outlives any one device.** That is a promise about duration, and
[../constraints.md](../constraints.md) records that the browser clears every script-writable store
after thirty days without interaction, taking the board, every past board and the play record
together. A player who lapses for a month and comes back has lost everything. A device is not a
place where something outlives a device.

**[../problem.md](../problem.md) says play is recorded from the first player onward.** Which puzzles
get finished, where players stall, and whether a difficulty grade predicts anything can only be
answered from real solves, so solve data has to be somewhere the maintainer can read it. A device
holds one player's, and only while that player still has it. Play that was never recorded cannot be
recovered later, so this binds from the day players arrive rather than from the day analysis
starts.

**[../problem.md](../problem.md) says a player's work follows them.** "The board left on a phone is
waiting on a laptop later, and a puzzle from any past day is still where they left it." A second
device has never seen the first, so nothing held on the first can reach it. This comes after v1, at
[is cross-device resume in scope for v1?](../questions/is-cross-device-resume-in-scope-for-v1.md),
and does not need to be in scope for this record to hold.

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
[ADR-0020](0020-the-stores-engine-is-sqlite.md).
[ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) constrains what the store has
to be capable of; this establishes that there is one to constrain.

**It does not say what a guest gets.** How long a guest's work lasts, how long a signed-in player's
does, and whether the two records are one shape are three open questions —
[guest](../questions/how-long-does-a-guests-work-last.md),
[signed-in](../questions/how-long-does-a-signed-in-players-work-last.md),
[shape](../questions/is-the-guest-record-the-same-shape-as-the-account-record.md). This record is
upstream of all three: it establishes that off-device durable state exists, and they decide who gets
it and on what terms.

## Enforced by

**Nothing. Asserted only, and no durable copy exists.** What would make it true is state written
somewhere other than the player's device and readable back from it. It needs the store at M3 and a
path that writes a player's state to it after that, and until then every durability promise in
[../guarantees/](../guarantees/) rests on a device this record says is not authoritative.

## Rejected

- **Keep everything on the device, and accept the loss.** A genuine option and by a wide margin the
  cheapest — no store, no server, nothing kept about anyone, no privacy obligations, no operational
  surface. Several puzzle apps work this way. It is disqualified by
  [../problem.md](../problem.md)'s statement that a player never loses in-progress work. The browser
  clears local storage after thirty days without interaction, so a player who lapses for that long
  comes back to nothing, and no arrangement of local storage prevents it. To choose this is to
  change that statement, which is a product decision rather than a technical one.

  *The other reasons above would each disqualify it too. Recording play needs a copy the maintainer
  can read, and cross-device needs a copy a second device can reach. Naming the lost-work promise as
  the one doing the work means that deferring cross-device or deferring analysis leaves this record
  standing.*

- **Keep it on the device, and let the player export and import a file.** Explicit, gives the player
  full control of their own data, and costs no store at all. It fails against the same statement:
  `../problem.md` describes an audience with no assumed technical sophistication, and asks that
  nothing be reconciled by hand. A player who must remember to export before their browser forgets
  has been made responsible for the failure.

- **Keep it on the device, and sync device to device directly.** Peer-to-peer between a player's own
  devices, with no store in the middle. It fails the lost-work promise for a player with one device,
  who has no peer to copy from. For a player with two, it would satisfy the cross-device statement
  without a server holding anything, but both devices have to be online at once for it to work at
  all — and [../constraints.md](../constraints.md) records that this app is used in tunnels and
  dead zones on one device at a time. The case it must serve is a phone put down and a laptop opened
  hours later.

- **Decide it when players arrive.** The honest "not yet". Rejected because play is recorded from
  the first player onward, and the shape the first player's state is written in is the shape a
  migration would have to move. Deferring this defers nothing except the cost of doing it late.

## Risk

**This is the record that takes on every obligation that follows from holding player data.** Privacy
law, deletion requests, breach exposure, backups, and the cost of running a store — none of which
exist while everything is on the device.
[Do privacy regulations apply?](../questions/do-privacy-regulations-apply.md) is unresearched, so the
size of the first of those is unknown at the moment it is being incurred.

**It is decided from `../problem.md`'s statements rather than from any observation of players.**
Nobody has been asked whether losing a board after a month away would bother them. The statement is
the maintainer's intent for the product, which is a legitimate input and is not evidence about
anyone.

**It reads as bigger than it is.** "Durable state off the device" invites building sync, accounts and
a schema. None of that is authorised here, and the three questions named above decide who gets what.

## Revisit when

- **`../problem.md` stops saying a player never loses in-progress work.** That statement is doing
  the work, as the Rejected section says. The statements that play is recorded from the first
  player and that work follows a player between devices would each hold it up as well, so reversing
  it takes all three changing.
- **Privacy research makes holding player data materially expensive**, per
  [do privacy regulations apply?](../questions/do-privacy-regulations-apply.md). It would not reverse
  this, because the lost-work promise still stands, but it would change what is stored and for how
  long.

## Also update

- [x] Nothing in `constraints.md` — this imports no facts about the world
- [x] Nothing in `guarantees/` — nothing promises how long a player's work lasts, and the three
      questions named above are where each bound is decided
- [x] `../problem.md` states that play is recorded from the first player onward
- [x] [ADR-0010](0010-the-store-needs-a-host-so-this-system-has-a-server.md) names the lost-work
      promise where it says why a static site was rejected
- [x] [is cross-device resume in scope for v1?](../questions/is-cross-device-resume-in-scope-for-v1.md)
      no longer says this record rules out declining cross-device

Deliberately not decided here: what is stored, in what shape, in which database, who can reach it,
how it gets there, how long it is kept, and what a guest gets.
