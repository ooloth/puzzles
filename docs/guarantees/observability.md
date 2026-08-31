---
updated: 2026-08-30
update_when: a promise about detecting a live failure is made
decays: slow
status: stub
---

# Observability

What we can tell about a failure that has already happened to a real player. Distinct from
the promises themselves: this is whether we would *know* one had been broken.

_No promises yet._

The motivating case is lost progress, which produces no error, no crash, and no complaint —
the player simply doesn't come back. See
[How would we learn a player lost progress?](../questions/how-would-we-learn-a-player-lost-progress.md).
It sits in direct tension with the promise in [offline.md](offline.md) that a player is never
shown the state of their network: whatever we learn, we learn without telling them.
