---
updated: 2026-09-03
update_when: the recovery procedure changes, or prefetching lands
decays: slow
status: active
---

# Nobody can start today's puzzle

## Threatens

No promise, and that is part of the finding. [../guarantees/](../guarantees/) covers the board already
in play and says nothing about getting a new one. What this violates is the intention in
[../problem.md](../problem.md) that a player opens the app to a puzzle this project generated — the
thing the product is *for*, rather than a property of it.

## How it happens

1. The machine holding the store fails, or is being replaced, or a deploy goes wrong.
   [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) puts the server and its
   store on one machine, so this takes both.
2. Recovery is a rebuild rather than a failover —
   [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
   — so it takes tens of minutes at best, and hours if the procedure has not been rehearsed.
3. Players mid-puzzle notice nothing. The client owns the board
   ([ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md)) and four promises
   describe play continuing while the server is unreachable.
4. **Players arriving get nothing.** Opening a puzzle whose content has never reached the device is
   the most frequent blocking moment in the product, per
   [../problem.md](../problem.md) under "Where a player waits", and it needs the server.
5. The window lands wherever it lands. If that is a weekday morning, it is the commute — which
   [../problem.md](../problem.md) names as the modal case.

## Why here specifically

**The product is a daily puzzle, so its traffic is a spike rather than a plateau.** An hour of
downtime is not an hour's worth of lost sessions; it is whichever fraction of the day's players tried
during it, and they were all trying at roughly the same time.

**And the failure is silent in the way that matters.** A player who opens the app, sees that today's
puzzle cannot be fetched, and closes it has not filed anything. They may simply not come back —
which is the same shape as
[a player's progress vanishes after a month away](a-players-progress-vanishes-after-a-month-away.md),
arriving by a different route.

**It is the product cost of a choice taken deliberately.** The single-machine arrangement was chosen
on the strength of having fewer things that can break, and this is what it costs when the one thing
does. Recording it here is what stops "the client absorbs server unavailability" being read as
"outages are cheap".

## How we'd notice

**Nothing would tell us, today.** No monitoring exists.
[How do we know the deployed app is serving?](../questions/how-do-we-know-the-deployed-app-is-serving.md)
records the sharper version: a static client loading from cache hides a dead API for a long time, so
even a person checking the site might see it working.

## What reduces it

**Prefetching is the cheapest mitigation and it does not shorten the outage.** A player who already
holds tomorrow's puzzle does not notice the machine is being rebuilt. See
[is a puzzle fetched before it is needed?](../questions/is-a-puzzle-fetched-before-it-is-needed.md).

**A rehearsed, automated recovery shortens it.** That is
[how is the store recovered when the machine is lost?](../questions/how-is-the-store-recovered-when-the-machine-is-lost.md),
and it is the main lever on how long this lasts — more than the choice of host.

**Naming a tolerable length would size both.**
[How much downtime is acceptable?](../questions/how-much-downtime-is-acceptable.md) is where that is
decided, and it is unanswered.
