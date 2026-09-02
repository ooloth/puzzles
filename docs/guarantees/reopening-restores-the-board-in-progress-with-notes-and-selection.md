---
updated: 2026-09-01
update_when: an enforcement mechanism changes, or the bound on how long work is held is settled
decays: slow
status: active
theme: durability
enforced: no
---

# Reopening restores the board in progress with notes and selection

The board comes back exactly as the player left it, with no explicit sync step and no prompt.
Selection is included deliberately: restoring the data but losing the player's place still costs them
their train of thought.

**Scoped to the board in progress.** Boards a player has already finished, and their record of play,
are not covered — nothing promises anything about those yet. No duration is promised either: this
says what comes back, not for how long it remains available to come back to.

**Enforced by** Nothing. Asserted only.

**If violated** The player is punished for closing the app, which they do constantly.

**Bearing on this**
[Which client storage mechanism holds a player's work?](../questions/which-client-storage-mechanism.md)
is where this is kept or broken.
