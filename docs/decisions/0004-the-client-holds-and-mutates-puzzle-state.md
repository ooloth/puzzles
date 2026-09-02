---
number: 0004
status: accepted
date: 2026-08-31
amended: 2026-09-01
---

# 0004 — The client holds and mutates puzzle state

## Forced by

Two promises in [../guarantees/](../guarantees/), in order of weight.

**[Play continues through a loss of
connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md).**
With no network there is nothing to ask, so the only state that can change is state already on the
device. Nothing else satisfies this — it is a property of the arrangement rather than of any
framework, and no amount of optimism about round trips substitutes for a board that is already
there.

**[Input registers without waiting for the
network](../guarantees/input-registers-without-waiting-for-the-network.md).** Even with a good
connection, a remote source of truth leaves two options: wait for it, which violates the promise,
or render immediately from a local copy — which means local state exists and the first reason has
already decided this.

## Decision

The client holds a complete copy of the state for any puzzle in progress, and mutates it locally
without waiting on anything remote. The rules needed to validate a move run on the client.

## Rejected

- **The server holds state and the client renders it.** Fails both promises — [play continues
  through a loss of connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md)
  and [input registers without waiting for the
  network](../guarantees/input-registers-without-waiting-for-the-network.md) — by construction.
  Every state change needs a round trip, so there is no version of this that works in a tunnel.
  This is true of the whole category of server-owned-state approaches, not of any particular one,
  so it cannot be rescued by choosing a better framework.
- **The client caches but defers mutation to the server.** Reads work offline, writes do not, which
  fails [play continues through a loss of
  connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md)'s promise for
  exactly the case it exists to cover: a player mid-puzzle underground.

One argument for server-owned state deserves an answer, because it is true. A hypermedia
framework's local signals can handle transient interaction — a drag in progress, a hover, a
keyboard selection — entirely on the device, with no round trip. Interaction under that
arrangement really can feel instant.

It does not follow that the app works offline. A signal can change what is on screen, but
committing a move still requires the server. So hypermedia can deliver low latency and cannot
deliver offline play, and this decision rests on the second. The latency argument is correct and
does not apply.

## Risk

**This decision creates the durability problem rather than solving it.** State on the client is
state in evictable storage: Safari deletes script-writable storage after thirty days without
interaction, and Chrome evicts whole origins under pressure. Losing a player's work no longer needs
a server failure — the browser can do it unprompted, with nothing to appeal to. Everything in
[is cross-device resume in scope for v1?](../questions/is-cross-device-resume-in-scope-for-v1.md)
about recovery exists because of this choice.

**It forecloses client-side enforcement permanently.** Rules that run on the device can be read and
changed by whoever holds the device. `../problem.md` disclaims anti-cheat today, and that
disclaimer is conditional on nothing being worth gaining — so if a paid tier ever gates something a
player would rather not pay for, enforcement has to happen somewhere else or not at all.

**It commits to a real client application**, with local persistence, its own state model, and its
own failure modes. That is the larger share of this project's complexity, and it is being taken on
before the alternative has been proven unnecessary in practice rather than on paper.

## Revisit when

Either promise above is weakened. This decision is derived from them and is exactly as solid as
they are — and they are choices rather than facts. If "instant under any network condition"
softens to "instant when online", or if offline play stops being a promise and becomes a nice-to-
have, the forcing disappears and this should be argued again from scratch.

## Also update

- [x] Nothing in `constraints.md` — this imports no new facts about the world
- [x] Nothing in `guarantees/` — this is derived from existing promises rather than adding one

Deliberately not decided here: who wins when two copies of a board disagree, whether a server
exists at all, and what renders the client. Each is its own question.
