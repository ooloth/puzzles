---
updated: 2026-09-03
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

**This holds for 30 idle days on Safari, and then stops.** Safari's tracking-prevention deletion
removes service worker registrations after 30 days without a qualifying interaction, per
[../constraints.md](../constraints.md), and
[ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md) makes a
service worker the thing that answers the navigation. A player who lapses longer than that is a first
visit again, offline or not. The limit is stated here because a promise with an unstated boundary
reads to a player as the promise simply being false.

**Enforced by** Nothing. Asserted only.
[ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md) fixes what
the mechanism will be — a service worker answering from a document on the device, rather than the
browser's HTTP cache — but no code exists.

**If violated** The player cannot tell a connectivity problem from a broken app, on the platform and
in the conditions [../problem.md](../problem.md) names as the modal case. A blank screen offers
nothing to act on and nothing to distinguish "wait a moment" from "this is gone", which is the
failure this promise exists to rule out.

**Bearing on this** [How does the app itself stay available offline?](../questions/how-does-the-app-itself-stay-available-offline.md)
is the mechanism, and it is where this promise gets something enforcing it.
[What can a player do with no network?](../questions/what-can-a-player-do-with-no-network.md) sets how
much of the app is covered — this promise is the floor beneath that answer rather than a substitute
for it.
