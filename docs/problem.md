---
updated: 2026-08-30
update_when: the users, the problem, or what we optimize for changes
decays: slow
status: active
---

# Problem

## What's missing or broken

People play logic puzzles in the gaps of their day — a commute, a queue, a waiting room.
Those gaps are exactly where connectivity fails, and where puzzle apps stall on a loading
screen, drop the last few moves, or lose the board entirely when the phone reclaims the tab.
Here the interruption is the normal case, not the edge case.

The other half of the problem is the puzzles. A grid logic puzzle is only satisfying if it
has exactly one solution and that solution is reachable by reasoning rather than guessing.
Ambiguous puzzles, or ones with a leap in the middle, aren't puzzles — they're chores. This
project generates its own, so their quality is ours to earn rather than assume.

## Who has it

Casual, single-player solvers of sudoku, star battle, and other grid logic games. General
public, no assumed technical sophistication, no competitive or adversarial stakes.

Phone-first, played in transit — trains, tunnels, dead zones, cell-tower handoff — with
secondary desktop use at a different time by the same person. Sessions run minutes, are
frequently interrupted, and resume anywhere from seconds to days later. While actively
solving, a player makes a discrete input every one to three seconds.

The audience is deliberately small: a genuinely public v1 found by a few people, not many.

The second stakeholder is the solo maintainer, and there are three distinct reasons this exists.
They pull in different directions often enough to be worth keeping separate.

**A polished interface.** An opportunity to build something visually and interactively excellent,
which day work does not provide. This is the source of the priority given to the solving
experience below.

**Puzzles generated here, seen each morning.** Not a supply mechanism — the point is opening the
app to a puzzle this project made. That makes the generator part of the reward rather than
infrastructure supporting it, and it indicates a daily rhythm rather than an unlimited catalogue.

**A demonstrable internet-facing full-stack system.** The maintainer wants a public demonstration
of his ability to build, deploy and operate an internet-facing full-stack app.

That third purpose needs a guard, because it can justify almost anything. **Would this component
still be worth building if its demonstration value were zero?** Where the answer is yes, being
able to point at it is a bonus. Where it is no, it is scope wearing an architecture costume, and
recognising which one it is at the time is much easier than unpicking it later.

## What success looks like

A player can:

1. Tap a cell, enter a digit, or toggle a note and see it register immediately — on any
   network, including none.
2. Keep playing through a total loss of connectivity lasting several minutes.
3. Never lose in-progress work, however the session is interrupted.
4. Reopen the app and find the exact board they left, with no sync step and no conflict
   prompt.
5. Never see a loading, reconnecting, or error state during normal play.

And every puzzle served has exactly one solution, reachable by logic alone.

A small, genuinely public v1 within a few months.

For the maintainer: an interface worth being proud of, a puzzle waiting each morning that this
project generated, and a system whose operation is worth describing to someone hiring for it.

## Not this

- **Two devices editing the same puzzle at once.** Switching devices between sessions is in
  scope; simultaneous editing is not, so CRDT-grade conflict resolution isn't needed.
- **Leaderboard integrity or anti-cheat.** Nothing is ranked, and cheating only spoils the game
  for the cheater. This holds while nothing is worth gaining by cheating; a paid tier is
  uncommitted but deliberately not ruled out, so the exclusion is conditional rather than
  permanent.
- **Enterprise scale** — or designing for scale at all, yet.
- **Infrastructure added because it might be needed someday** rather than because it's
  needed now. No Kubernetes-grade complexity.

## What wins when things conflict

Settled so far, earlier wins:

1. **Solving experience over puzzle supply.** Borrowed puzzles with an excellent interface
   is a success; excellent generated puzzles with a mediocre interface is a failure. This
   also sets the work order — interface before generator, regardless of where launch
   content comes from.
2. **Tolerating absence over optimising transfer.** Payloads are a few KB; the cost is
   connection setup and unavailability. Design effort goes to surviving a missing network,
   not to making messages smaller.
3. **The interactive path over batch throughput.** Generation is separable and can be slow.
   It never competes with a player mid-puzzle.
4. **Clarity over cleverness**, because one person maintains this.
5. **Present need over future-proofing.**

Scale sits below all of these and isn't designed for yet.

This ranking is incomplete on purpose. Where correctness and latency conflict — a fast local
answer that a fuller check would contradict — nothing here settles it. That question, and the
other unresolved tradeoffs, are in [questions/](questions/).

Not for per-decision analysis — that goes in an ADR.
