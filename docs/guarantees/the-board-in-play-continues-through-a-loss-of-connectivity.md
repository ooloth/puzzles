---
updated: 2026-08-30
update_when: the duration or scope of offline play is settled, or an enforcement mechanism changes
decays: slow
status: active
theme: offline
enforced: no
---

# The board in play continues through a loss of connectivity

The board a player already has open stays fully interactive, with no errors and no broken interface,
while there is no connection at all.

**Scoped to the board in play, and to no duration.** Whether anything else — an archive, a puzzle not
yet started — is reachable offline is open, and so is how long this has to hold. Both are named
below. This promise is the part that is not in doubt.

**Enforced by** Nothing. Asserted only.

**If violated** The modal use case — playing on a commute — is exactly where the app stops working.

**Bearing on this** Two questions bound this promise along different axes, and both are open.
[How long must offline play survive?](../questions/how-long-must-offline-play-survive.md) is the
duration. [What can a player do with no network?](../questions/what-can-a-player-do-with-no-network.md)
is the scope — the board already open, or a browsable archive they can start something new from — and
it is the one that sizes client storage by orders of magnitude.
[How does the app itself stay available offline?](../questions/how-does-the-app-itself-stay-available-offline.md)
covers the shell, without which neither of the others means anything.
