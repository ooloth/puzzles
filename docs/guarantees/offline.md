---
updated: 2026-08-30
update_when: a promise about degraded or absent connectivity is made, or an enforcement mechanism changes
decays: slow
status: active
---

# Offline

How the app behaves when the network is degraded or gone — which, for a game played on a
commute, is the normal case rather than an edge case. Promises about *speed* when the network
is fine belong in [latency.md](latency.md).

## Play continues through a loss of connectivity

The board stays fully interactive with no errors and no broken interface while there is no
connection at all. Neither how long that has to hold nor how much of the app it covers is
settled, so no duration and no scope are claimed here.

**Enforced by** Nothing. Asserted only.

**If violated** The modal use case — playing on a commute — is exactly where the app stops
working.

**Bearing on this** two questions bound this promise along different axes, and both are open.
[How long must offline play survive?](../questions/how-long-must-offline-play-survive.md) is the
duration. [What can a player do with no network?](../questions/what-can-a-player-do-with-no-network.md)
is the scope — the board already open, or a browsable archive they can start something new from —
and it is the one that sizes client storage by orders of magnitude.
[How does the app itself stay available offline?](../questions/how-does-the-app-itself-stay-available-offline.md)
covers the shell, without which neither of the others means anything.

## The network never blocks, delays or interrupts play

No action a player takes waits on the network, fails because of it, or is undone by it. They are
never asked to retry, reconnect, or choose between versions in order to keep solving. The network is
our problem to handle, not the player's to manage.

This promise is about what the network is allowed to *do* to a player, not about what the interface
may *show* them. Displaying that the app is offline — a small indicator, a note that a puzzle will
sync later — is permitted and is a design judgement, not a broken promise. What is forbidden is
making the player act on it.

**Enforced by** Nothing. Asserted only.

**If violated** The player is made responsible for conditions they can't affect, in the middle of
concentrating on something else.

**Bearing on this** [How long until a stalled connection surfaces as an error?](../questions/how-long-until-a-stalled-connection-surfaces-as-an-error.md)
— a stalled connection produces no thrown error, so anything built to catch errors won't notice it.
[Is the player shown anything about the network?](../questions/is-the-player-shown-anything-about-the-network.md)
is the design judgement this promise deliberately leaves open.

## Conflicts are reconciled without asking the player

When two copies of a board disagree, the app resolves it. The player is never presented with
a choice between versions.

**Enforced by** Nothing. Asserted only.

**If violated** The player is asked to arbitrate a data-model detail they have no way to
reason about, and whichever they pick, they lose something.

**Bearing on this** [What happens to a losing write when syncing?](../questions/what-happens-to-a-losing-write-when-syncing.md)
is unresolved, and it matters here: last-write-wins reconciles silently by *discarding* a
write, which sits badly beside the durability promise that work is never lost.
