---
updated: 2026-09-02
update_when: the scope of what is shown offline is settled, or an enforcement mechanism changes
decays: slow
status: active
theme: offline
enforced: no
---

# The app never opens to a blank screen after the first visit

Opening the app with no network shows the app. Not a blank page, not the browser's own error page,
not a spinner that never resolves. Whatever is on the device is shown immediately, and where
something cannot be shown because it was never fetched, that is said in the interface rather than
left as an empty screen.

**This holds from the second load onward, not the first.** A device that has never reached the app
has nothing to show and no promise can change that. The obligation is to survive every load after one
successful visit — and, per [../constraints.md](../constraints.md), a home-screen install starts with
an empty store, so an installed app's own first launch is a first visit again.

**Enforced by** Nothing. Asserted only.

**If violated** The player cannot tell a connectivity problem from a broken app, on the platform and
in the conditions [../problem.md](../problem.md) names as the modal case. A blank screen offers
nothing to act on and nothing to distinguish "wait a moment" from "this is gone", which is the
failure this promise exists to rule out.

**Bearing on this** [How does the app itself stay available offline?](../questions/how-does-the-app-itself-stay-available-offline.md)
is the mechanism, and it is where this promise gets something enforcing it.
[What can a player do with no network?](../questions/what-can-a-player-do-with-no-network.md) sets how
much of the app is covered — this promise is the floor beneath that answer rather than a substitute
for it.
