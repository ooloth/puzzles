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

**The two halves take different input.** Touch on the phone, keyboard on the laptop — and keyboard
there is the expectation rather than a fallback. Filling a grid by pointing at each cell is slower
than typing and nobody who can type does it. So the desktop half is keyboard-driven by default, and
that is a property of how the game is played rather than an accommodation added for anyone.

**Launch is sized small; the ceiling is not.** A genuinely public v1 is expected to be found by a
small number of people, and nothing needs designing for more than that on the day it ships. That is a
statement about what to build first, not a prediction — success is not ruled out, and a decision that
would make growing into it expensive is a decision that needs arguing rather than one that follows
from this paragraph.

The second stakeholder is the solo maintainer, and there are three distinct reasons this exists.
They pull in different directions often enough to be worth keeping separate.

**A polished interface.** An opportunity to build something visually and interactively excellent,
which day work does not provide. This is the source of the priority given to the solving
experience below.

**Puzzles generated here, seen each morning.** Not a supply mechanism — the point is opening the
app to a puzzle this project made. That makes the generator part of the reward rather than
infrastructure supporting it. It also leans toward a daily rhythm over an unlimited catalogue,
which is a lean rather than a settled answer — see
[is there one puzzle a day, or unlimited play?](questions/is-there-one-puzzle-a-day-or-unlimited-play.md).

**A demonstrable internet-facing full-stack system.** The maintainer wants a public demonstration
of his ability to build, deploy and operate an internet-facing full-stack app.

That third purpose needs a guard, because it can justify almost anything. **Would this component
still be worth building if its demonstration value were zero?** Where the answer is yes, being
able to point at it is a bonus. Where it is no, it is scope wearing an architecture costume, and
recognising which one it is at the time is much easier than unpicking it later.

## What success looks like

The product this is aiming at, not a release plan. Which parts arrive first, and in which order,
is a roadmap question settled in [decisions/](decisions/). What belongs here is the direction
those decisions should not quietly close off — so a feature described below arriving later than
another is normal, and a decision that makes one of them expensive to add is not.

A player can:

1. Tap a cell, enter a digit, or toggle a note and see it register immediately — on any
   network, including none.
2. Keep playing through a total loss of connectivity lasting several minutes.
3. Never lose in-progress work, however the session is interrupted.
4. Reopen the app and find the exact board they left, with no sync step and no conflict
   prompt.
5. Never see a loading, reconnecting, or error state during normal play.

And their work follows them. The board left on a phone is waiting on a laptop later, and a puzzle
from any past day is still where they left it. Nothing is reconciled by hand and no version is ever
chosen between.

A record of their play is theirs to keep — what they have solved, and how they are doing — and it
outlives any one device.

And every puzzle served has exactly one solution, reachable by logic alone.

A small, genuinely public v1 within a few months.

For the maintainer: an interface worth being proud of, a puzzle waiting each morning that this
project generated, and a system whose operation is worth describing to someone hiring for it.

## Not this

- **Two devices editing the same puzzle at once.** Picking a puzzle up on another device is part
  of the vision above; two people solving one board together is not. Whether *one* person's two
  devices can hold the same board open, and how well that has to work, is
  [open](questions/can-two-devices-edit-the-same-board-at-once.md) — the app cannot prevent it, so
  ruling it out here would have been a claim about intent rather than behaviour.
- **Leaderboard integrity or anti-cheat.** Nothing is ranked, and cheating only spoils the game
  for the cheater. This holds while nothing is worth gaining by cheating; a paid tier is
  uncommitted but deliberately not ruled out, so the exclusion is conditional rather than
  permanent.
- **Designing for scale, yet.** Not the same as ruling it out. Nothing is built for load that does
  not exist, and nothing should be built in a way that makes serving more people later a rewrite.
- **Anything built because it might be needed someday** rather than because it's needed now.

## What wins when things conflict

Settled so far, earlier wins:

1. **Solving experience over puzzle supply.** Borrowed puzzles with an excellent interface
   is a success; excellent generated puzzles with a mediocre interface is a failure.
2. **Play continuing over everything else the app might want to do.** Where solving competes
   with any other activity, solving wins.
3. **The interactive path over batch throughput.** A player never waits on puzzle generation,
   which can be as slow as it needs to be.
4. **Clarity over cleverness**, because one person maintains this.
5. **Present need over future-proofing.**

Scale sits below all of these and isn't designed for yet.

This ranking is incomplete on purpose. Where correctness and latency conflict — a fast local
answer that a fuller check would contradict — nothing here settles it. That question, and the
other unresolved tradeoffs, are in [questions/](questions/).

Not for per-decision analysis — that goes in an ADR.
