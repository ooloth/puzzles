---
updated: 2026-09-01
update_when: a promise about retaining a player's work is made, or an enforcement mechanism changes
decays: slow
status: active
---

# Durability

A player's work outlives the session that made it. "Work" means the board in progress, every board
they have played, and the record of their play.

## No bound is currently promised per persona

This file used to promise a signed-in player's work survives on every device they use, and a guest's
work survives in the browser that made it. Both promises rested on the durability record demoted on 2026-09-01, "What a player's work
survives," a decision record that was demoted: part of its reasoning turned out to rest on a
rejection that did not hold up, so it no longer counts as a decision this project has made. The
record itself is deleted; everything it argued is carried forward in the three questions below.

What each bound actually is, and whether a guest's record and a signed-in player's record share one
shape, are now open questions rather than settled promises:

- [How long does a guest's work last?](../questions/how-long-does-a-guests-work-last.md)
- [How long does a signed-in player's work last?](../questions/how-long-does-a-signed-in-players-work-last.md)
- [Is the guest record the same shape as the account record?](../questions/is-the-guest-record-the-same-shape-as-the-account-record.md)

[../problem.md](../problem.md) still states the intent this file cannot yet promise: a record of a
player's play is theirs to keep, and it outlives any one device. That is a statement of what success
looks like, not a guarantee this file can make until one of the three questions above settles it.

## Reopening restores the grid, notes and selection

The board comes back exactly as the player left it, with no explicit sync step and no prompt.
Selection is included deliberately: restoring the data but losing the player's place still costs
them their train of thought. This holds for as long as the player's work is held at all, whatever
that turns out to be once the questions above are answered.

**Enforced by** Nothing. Asserted only.

**If violated** The player is punished for closing the app, which they do constantly.

**Bearing on this**
[Which client storage mechanism holds a player's work?](../questions/which-client-storage-mechanism.md)
is where this is kept or broken.
