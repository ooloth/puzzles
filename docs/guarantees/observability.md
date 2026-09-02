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
[offline.md](offline.md) permits telling a player the network is down and forbids making them act
on it, so there is no tension there. The constraint is narrower and still real: anything reporting
home has to fail invisibly, because a failed report must not surface as an error the player has to
deal with.
