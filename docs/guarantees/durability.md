---
updated: 2026-08-30
update_when: a promise about retaining a player's work is made, or an enforcement mechanism changes
decays: slow
status: active
---

# Durability

A player's work outlives the session that made it. Whether that work is reachable from a
*second* device is not settled — see
[Is cross-device resume in scope for v1?](../questions/is-cross-device-resume-in-scope-for-v1.md).
Until it is, these promises cover one device.

## Entries and notes survive any interruption

A player's grid entries and pencil notes are still there when they return, whatever ended the
session: the app backgrounded, the tab terminated by the OS, the device locked, the browser
crashed, or the page closed deliberately.

**Enforced by** Nothing. Asserted only.

**If violated** Half an hour of a player's thinking disappears, with no error and no way to
recover it. A player who loses work once has no reason to believe it won't happen again.

**Bearing on this** [How long must in-progress work survive, and on which devices?](../questions/how-long-must-in-progress-work-survive.md)
is the question that gives this promise a bound and a scope. As written it has neither, which is
why the same sentence can be read as "until the tab closes" and as "forever, anywhere", and those
are different applications. Answer it before anything downstream.
[How much unsynced work is acceptable?](../questions/how-much-unsynced-work-is-acceptable.md)
then sets the tolerance that makes it testable, and
[how would we verify progress is never lost?](../questions/how-would-we-verify-progress-is-never-lost.md)
is unanswered, which is why the enforcement line above reads as it does. Safari's eviction of
script-writable storage can also wipe local state independently of any interruption — see
[../constraints.md](../constraints.md).

## Reopening restores the grid, notes and selection

The board comes back exactly as the player left it, with no explicit sync step and no prompt.
Selection is included deliberately: restoring the data but losing the player's place still
costs them their train of thought.

**Enforced by** Nothing. Asserted only.

**If violated** The player is punished for closing the app, which they do constantly.

**Bearing on this** [Is home-screen install required for durability?](../questions/is-home-screen-install-required-for-durability.md)
determines whether this holds for every player or only some.
