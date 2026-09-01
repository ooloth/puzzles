---
updated: 2026-09-01
update_when: a promise about retaining a player's work is made, or an enforcement mechanism changes
decays: slow
status: active
---

# Durability

A player's work outlives the session that made it. How far it outlives it depends on whether they
have signed in, and the two bounds are set by
[ADR-0006](../decisions/0006-what-a-players-work-survives.md).

"Work" means the board in progress, every board they have played, and the record of their play. It
is one record with one shape for both personas, so signing in promotes what is already there rather
than converting it.

## A signed-in player's work survives on every device they use

The board in progress, the boards they have finished, and their play record are all there when they
return — on any device they sign in from, however long they have been away, and however the last
session ended.

**Enforced by** Nothing. Asserted only. No account, server or sync exists.

**If violated** A player who signed in specifically so their work would be kept discovers it was
not. This costs more than the guest case: they took an action to prevent it and paid for it in
friction.

**Bearing on this** [Does a server exist at all?](../questions/what-must-be-true-off-device.md) —
this promise is what forces one, and that question weighs it against the rest of the inventory.
[Are there user accounts?](../questions/are-there-user-accounts.md) decides what a player signs in
to. [How much unsynced work is acceptable?](../questions/how-much-unsynced-work-is-acceptable.md)
sets the tolerance that makes this testable, and
[how would we verify progress is never lost?](../questions/how-would-we-verify-progress-is-never-lost.md)
is unanswered, which is why the enforcement line above reads as it does.

## A guest's work survives in the browser that made it, until that browser clears it

A guest has not signed in. Their work is held on the device that made it and is reachable from
nowhere else. It survives the app being backgrounded, the tab terminated by the OS, the device
locked, the browser crashed, and the page closed deliberately. It does not survive the browser
clearing site data after a period without interaction — see [../constraints.md](../constraints.md)
for the current figure and the conditions on it.

The board a guest is working on is kept until they finish it, rather than discarded when the day
changes.

**Enforced by** Nothing. Asserted only.

**If violated** A guest loses work inside the window they were promised — which is the ordinary
write-path failure rather than eviction, and is invisible, because a device that has silently
dropped a player's work is the last thing that will report it.

**Bearing on this**
[How long does Safari really keep our storage?](../questions/how-long-does-safari-really-keep-our-storage.md)
— this bound is only as good as a figure read from browser source rather than observed on a device.
[Is home-screen install required for durability?](../questions/is-home-screen-install-required-for-durability.md)
matters for this persona alone: an installed app is exempt from the clearing described above, so a
guest who installs is durable and a guest who does not is not.

Anything else a guest accumulates — a play record, streaks, statistics — sits inside this bound and
is promised nothing beyond it. Nothing currently shows a guest any of it.

## Reopening restores the grid, notes and selection

The board comes back exactly as the player left it, with no explicit sync step and no prompt.
Selection is included deliberately: restoring the data but losing the player's place still costs
them their train of thought. This holds within whichever bound above applies to that player.

**Enforced by** Nothing. Asserted only.

**If violated** The player is punished for closing the app, which they do constantly.

**Bearing on this**
[Which client storage mechanism holds a player's work?](../questions/which-client-storage-mechanism.md)
is where this is kept or broken.
