---
opened: 2026-09-01
status: open
resolves_into: decision
---

# Is the guest record the same shape as the account record?

## Why it matters

This question has two halves, and they are not the same kind of claim.

**The decision half:** whether a guest's stored record and a signed-in player's stored record share
one shape. If they do, signing in promotes what is already there — attaches an identity to a record
that already exists in the right form — rather than converting it from one representation to
another.

**The promise half:** [../problem.md](../problem.md) says a record of a player's play is theirs to
keep, and
[conflicts are reconciled without asking the player](../guarantees/conflicts-are-reconciled-without-asking-the-player.md):
nothing is reconciled by hand and no version is ever chosen between. A guest who signs in and finds
their board reset, or their notes gone, has had a version chosen for them silently. Whether the
decision half is answered "same shape" or "different shape" determines whether that promise is
cheap to keep or something a conversion step has to get right, every time, for every player, with
no dry run against real data before it matters.

**The decision half is the one that cannot be revised cheaply.** The bounds can be revised later at
ordinary cost, and the shape cannot. Revising how long a bound lasts changes no stored byte.
Revising the shape those bytes are in touches every one of them. Changing a shape after real
players' data already exists in it means migrating that data with code that runs once, in the
field, correctly, with nothing to retry from if it fails. The same reasoning applies to which client
storage mechanism holds a guest's work.

## What would settle it

Whether the storage design chosen in
[which client storage mechanism?](which-client-storage-mechanism.md), and whatever the server-side
schema turns out to be once what the server holds is answered, can represent a guest and a
signed-in player identically except for an identity field attached on sign-in. If it can, without
contortions, that is evidence for one shape. If representing a guest cleanly requires fields or
constraints a signed-in record does not need, or vice versa, that is evidence the two should diverge.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Opened 2026-09-01 by demoting the durability record, "What a player's work survives", which is
deleted. This question, its two siblings
([how long does a guest's work last?](how-long-does-a-guests-work-last.md) and
[how long does a signed-in player's work last?](how-long-does-a-signed-in-players-work-last.md)) and
the Findings below carry forward everything in it. The demotion was for its guest-bound reasoning, a
different half of that record. Its reasoning on shape is kept below as an option rather than a
settled answer.

## Options

*Same shape. Signing in promotes rather than converts.* A guest's storage holds
*a player's record that currently contains one board*, not *a board* — the same shape a signed-in
player's record has, just without an identity attached to it yet. Signing in attaches the identity;
nothing about the record's contents is transformed. The case for this is the promise half above: no
conversion step means nothing can go wrong in a conversion step. It is also forward-compatible for
free — if a play record, streaks or stats are ever shown to a guest, they already fit the shape that
exists for a signed-in player, and the only open question is which bound covers them (see
[how long does a guest's work last?](how-long-does-a-guests-work-last.md)), not whether the shape can
hold them. The cost is that guest storage has to be designed as if it might always become an account
record, even while only guests exist, which is more shape to carry at M1 than a guest-only build
strictly needs.

*Different shapes, converted on sign-in.* Guest storage is designed for exactly what a guest needs
today, independently of what an account record needs. Signing in runs a conversion step that reads
the guest shape and writes the account shape. The case for this is that guest storage can stay
minimal and simple for as long as only guests exist, and never has to anticipate fields it does not
yet use. The cost is the conversion step itself: it has to be written, it has to be correct for every
field a guest record can contain, and it is exactly the kind of one-run, no-retry, in-the-field
migration the reasoning above says is expensive — except it runs on every sign-up rather than once,
which does not make it cheaper, it makes the failure recur.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Answering this "same shape" does not answer either bound question.** The two are separable by
design: one shape underneath, two different bounds on top. A shared shape says nothing
about how long a guest's copy of it survives, or how long a signed-in player's does — those are
[how long does a guest's work last?](how-long-does-a-guests-work-last.md) and
[how long does a signed-in player's work last?](how-long-does-a-signed-in-players-work-last.md), and
neither depends on how this one is answered.

**"Same shape" would close a door if decided before the shape itself is written down.** Committing to
one representation for both personas, before what the server holds and
[which client storage mechanism?](which-client-storage-mechanism.md) have actually produced a
candidate shape, risks locking in a structure nobody has stress-tested against what a guest record
and an account record each need. This question is better settled once a shape exists to check the
options against, per What would settle it above, than argued from first principles alone.
