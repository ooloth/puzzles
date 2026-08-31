---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Is there a paid tier?

## Why it matters

It changes the stakes. "Nothing is ranked or money-involved, so anti-cheat isn't a design
driver" stops being true the moment something is worth gaining by cheating.

The status is **not committed, but deliberately not foreclosed**. The likely shape is a
subscription gating access to an archive of past puzzles, possibly with other perks — the model
used by the New York Times games, Inkwell, and Circle9. Nothing needs building for it now. What
matters now is that no architectural choice makes adding it later prohibitive, which makes this a
question about reversibility rather than about features.

## Blocked by

[Do privacy regulations apply](do-privacy-regulations-apply.md),
[Is there one puzzle a day, or unlimited play](is-there-one-puzzle-a-day-or-unlimited-play.md).

## Blocks

anti-cheat posture, [are there user accounts](are-there-user-accounts.md), payment and tax
obligations.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

...

## Findings

**The requirement today is optionality, not capability.** Nothing needs to be gated now, so no
option is ruled out by lacking entitlement machinery. What matters is what each option costs to
*add* it to later, which is a question about how reversible each choice is rather than what each
one currently supports.

**Gating needs three things**, and they can be acquired separately: a way to tell players apart,
a record of who has paid, and a point where content is withheld from those who haven't. The first
two are ordinary. The third is the one an architecture can foreclose: content that ships as static
files alongside the app cannot be withheld from anyone who already has the app.

**So the archive is where the cost sits, not the gameplay.** Gating decides who may receive a
past puzzle. It has no bearing on who is authoritative over the board a player is filling in
right now — see
[what the server does with puzzle state](what-does-the-server-do-with-puzzle-state.md), whose
leading option keeps the server out of gameplay entirely. Those are
separate objects and separate authorities, and conflating them would import a server into
gameplay to solve a content-delivery problem.