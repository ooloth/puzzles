---
updated: 2026-09-02
update_when: the store arrangement is settled, or anything starts reporting write failures
decays: slow
status: active
---

# The durable copy stops being written

## Threatens

The intent in [../problem.md](../problem.md) that a player's work "follows them" and that their
record of play "outlives any one device", plus the purpose
[ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md) exists to
serve. No promise in [../guarantees/](../guarantees/) covers the server-side copy yet, so this
currently violates an intention rather than a commitment — the same position
[a player's progress vanishes after a month away](a-players-progress-vanishes-after-a-month-away.md)
is in.

## How it happens

Every step is ordinary and none of them raises anything a person sees.

1. A write to the store fails. The cause does not matter here: a full disk, an expired credential, an
   exhausted connection limit, a network path that has gone away, a store that is being maintained.
2. The client does not care. Four promises describe the app continuing while the server is
   unreachable, so by design the failure is absorbed rather than surfaced. The player is not asked to
   retry, because
   [the player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md)
   forbids it.
3. Play continues normally. The board on the device is authoritative during play
   ([ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md)), so nothing on screen
   is wrong, slow, or different.
4. Nothing reports the failure, because nothing is watching. The store may be a file or a service; in
   either case the maintainer learns nothing.
5. The first evidence arrives when someone needs the durable copy — a second device, a recovered
   player, a restore — and finds it stale by however long the failure has been running.

## Why here specifically

**The absorption that protects the player is what hides this.** Most systems reveal a broken write by
showing the user an error. This one has promised not to, for good reasons that are written down. The
promise is right and the consequence is that the write path has no human watching it by construction.

**The gap between the failure and its discovery is unbounded.** Nothing on the client depends on the
durable copy during ordinary play, so a store that has been rejecting writes for a month looks
exactly like one that has not — until the day it is needed, which is also the day it cannot be fixed
retroactively.

**This is arrangement-independent.** It holds whether the store is a file the process opens or a
service it connects to, because what makes it silent is the client absorbing failure rather than
anything about where the bytes go.

## How we'd notice

**We wouldn't.** There is no error surfaced to a player, no crash, and no complaint. This is the
infrastructure-layer twin of
[a player's progress vanishes after a month away](a-players-progress-vanishes-after-a-month-away.md),
with one difference that makes it worse: eviction hits one player at a time, and this hits every
player who syncs during the window.

[../constraints.md](../constraints.md) records that a stalled connection reports as connected, so
even a system that checked would need to distinguish "slow" from "gone" deliberately.

## What reduces it

Nothing yet, and nothing can until something exists to watch. The relevant open questions are
[how would we learn a player lost progress?](../questions/how-would-we-learn-a-player-lost-progress.md),
[what are the server's vitals, and who watches them?](../questions/what-are-the-servers-vitals-and-who-watches-them.md),
and [what invariants hold over stored data, and how are they audited?](../questions/what-invariants-hold-over-stored-data-and-how-are-they-audited.md).

The cheapest thing that would work is a check that the most recent write is more recent than some
bound, run somewhere other than the process doing the writing. That is an observation about shape
rather than a design, and it belongs to those questions.
