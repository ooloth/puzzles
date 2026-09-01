---
updated: 2026-09-01
update_when: a decision is made, a milestone changes, or a question is split
decays: fast
status: active
---

# Questions

The sibling of [../decisions/](../decisions/): the decisions not yet made, arranged by what they
stop us building.

A directory listing of this folder is the full inventory — every filename asks its question plainly,
so there is no index here. What this file holds is **which milestone each question blocks**, because
that is the part a listing cannot show and the part that is expensive to get wrong.

## Start here

**[What runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md)** Node,
Bun or Deno. Nothing installs or runs until it is answered, and under Bun or Deno it also answers
the package manager, the test runner and part of the build tool. Settle it by scaffolding a
hello-world under each and running the real loop, not by comparing feature lists.

## How this list works

**Questions are grouped by the earliest milestone they block.** Not by how foundational they feel —
by what stops working if they stay open. A question nothing is waiting on sits at the bottom, and
that is a fine place to be.

**Milestones are deliberately small.** The point is to stop designing on paper and start deciding
against running code. Each one below is something you can look at and see working, and most of them
are a day or two apart, not a month.

**Ordering inside a milestone is by derivation.** A decision is never taken before something it
derives from. Among decisions that derive from nothing still open, the one unblocking the most is
taken first.

**A compound question is split rather than dragged forward.** When only part of a question blocks an
early milestone, the blocking part becomes its own question and the rest moves to the milestone
where it belongs. A question that arrives early because one clause of it is urgent forces the whole
thing to be answered early, and the parts nobody needed yet get answered worst — with the least
information and the most guessing. Splitting is cheap; a decision made a milestone too soon is not.
The test is whether every part of the answer is needed to see the milestone working. If not, split
it.

**Prefer prototyping to predicting.** Where a question could be settled by building the smallest
throwaway thing that answers it, that is what "what would settle it" should say. This folder has a
bias toward reasoning on paper that has to be actively resisted.

## Settled

[0001](../decisions/0001-launch-with-sudoku-then-star-battle.md) which games, in what order.
[0002](../decisions/0002-the-client-holds-and-mutates-puzzle-state.md) the client holds and mutates
puzzle state. [0003](../decisions/0003-this-is-delivered-over-the-web.md) this is delivered over the
web. [0004](../decisions/0004-one-implementation-of-the-puzzle-rules.md) one implementation of the
puzzle rules. [0005](../decisions/0005-typescript-across-every-deployable.md) TypeScript across every
deployable, with the rules shared as source.
[0006](../decisions/0006-what-a-players-work-survives.md) what a player's work survives, per persona.

## M1 — "Hello!" is live

A deployed skeleton. Client shell, server shell, generator shell, no features. Everything below is
load-bearing for it, and several will collapse into each other depending on the first answer.

- [What runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md)
- [Which package manager?](which-package-manager.md) — only separate if the answer above is Node.
- [What is the repo's top-level shape?](what-is-the-repos-top-level-shape.md) — one package or
  several, and where the shared rules module sits so both a browser and a batch process can reach it.
- [Is the client served as static files?](is-the-client-served-as-static-files.md) — derived from
  0002 and the offline guarantee, so closer to a recording than a decision. It decides whether the
  scaffold is Vite-shaped or meta-framework-shaped, and whether a file host is enough.
- [What renders the client?](what-renders-the-client.md) — framework, minimal library or neither,
  and which one.
- [What builds and serves the client?](what-provides-the-build-and-dev-server.md)
- [What runs the server?](what-runs-the-server-if-there-is-one.md) — mostly falls out of the runtime.
- [Where does this run?](where-does-this-run.md)

## M2 — a grid is on the screen

Static, no interaction. Proves the rendering approach against a real shape rather than a page of
text.

- [What is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) — only enough of it
  to render one. The full answer is not needed until M5.
- [How is the app styled?](how-is-the-app-styled.md)

## M3 — a player can fill it in

Select a cell, enter a digit, see it. In memory only; nothing survives a reload.

- [How does a player enter a digit?](how-does-a-player-enter-a-digit.md)
- [What latency budget makes a move feel immediate?](what-latency-budget-makes-immediately-checkable.md)

## M4 — the board survives a reload

The first durability promise anything actually keeps.

- [Which client storage mechanism holds a player's work?](which-client-storage-mechanism.md) — the
  one stack choice with no clean migration path.
- [Is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md)

## M5 — the rules run

Illegal moves are recognised, and a finished board is recognised as finished.

- [What is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) — the full answer,
  now that something depends on it.
- [Which games come after sudoku and star battle?](which-games-come-after-sudoku-and-star-battle.md)
  — an input to the above, since a model that fits two game types is often a model that fits two.

## M6 — a real puzzle appears

Not a hard-coded board. Something published, fetched and rendered.

- [What does the server hold?](what-does-the-server-hold.md) — the catalogue candidate specifically.
- [Does v1 ship generated or seeded puzzles?](does-v1-ship-generated-or-seeded-puzzles.md)
- [Is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md)

## M7 — it works with no network

- [How does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md)
- [What can a player do with no network?](what-can-a-player-do-with-no-network.md)
- [How long must offline play survive?](how-long-must-offline-play-survive.md)
- [Is the player shown anything about the network?](is-the-player-shown-anything-about-the-network.md)

## M8 — sudoku is finished, in guest mode

Everything a guest gets: notes, undo, completion, whatever hints turn out to be.

- [Is undo in scope, and how far back?](is-undo-in-scope-and-how-far-back.md)
- [Are hints in scope?](are-hints-in-scope.md)
- [What interactions must the grid support?](what-interactions-must-the-grid-support.md) — notes,
  undo, drag-select, keyboard navigation, highlighting.
- [Is difficulty graded, and does a grade promise anything?](is-difficulty-graded-and-does-a-grade-promise-anything.md)
- [What makes a puzzle a joy to solve?](what-makes-a-puzzle-a-joy-to-solve.md)
- [Is accessibility in scope for v1?](is-accessibility-in-scope-for-v1.md)

## M9 — a player can sign in

- [Are there user accounts?](are-there-user-accounts.md)
- [How does a second device recognise the same person?](how-does-a-second-device-recognise-the-same-person.md)
- [Do privacy regulations apply?](do-privacy-regulations-apply.md)
- [What does the server hold?](what-does-the-server-hold.md) — the rest of the inventory.
- [Which database, if any?](which-database-if-any.md)
- [Does the server understand puzzle content?](does-the-server-understand-puzzle-content.md)

## M10 — work follows a player between devices

- [What crosses the client/server boundary?](what-crosses-the-client-server-boundary.md)
- [Is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md)
- [Can two devices edit the same board at once?](can-two-devices-edit-the-same-board-at-once.md)
- [What happens to a losing write when syncing?](what-happens-to-a-losing-write-when-syncing.md)
- [How much unsynced work is acceptable?](how-much-unsynced-work-is-acceptable.md)
- [What does the server do with puzzle state?](what-does-the-server-do-with-puzzle-state.md)

## M11 — the puzzles are ours

- [How expensive is puzzle generation?](how-expensive-is-puzzle-generation.md)
- [Are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md)

## M12 — something is paid for

- [Is there a paid tier?](is-there-a-paid-tier.md)
- [What is the acceptable running cost?](what-is-the-acceptable-running-cost.md)
- [What load should the server handle?](what-load-should-the-server-handle.md)
- [How much downtime is acceptable?](how-much-downtime-is-acceptable.md)

## Blocking nothing yet

Real, and nothing is waiting on them. Several are research rather than choices.

[How is the codebase laid out?](how-is-the-codebase-laid-out.md) — module organisation, once there
are modules. [What runs the tests?](what-runs-the-tests.md) and
[what runs the checks on every change?](what-runs-the-checks-on-every-change.md) — both likely
answered by the runtime. [How long does Safari really keep our storage?](how-long-does-safari-really-keep-our-storage.md),
[how does Android evict stored data?](how-does-android-evict-stored-data.md),
[what are the real network conditions on transit routes?](what-are-the-real-network-conditions-on-transit-routes.md),
[what do existing puzzle apps do about offline play?](what-do-existing-puzzle-apps-do-about-offline-play.md)
— research. [How long until a stalled connection surfaces as an error?](how-long-until-a-stalled-connection-surfaces-as-an-error.md),
[how would we learn a player lost progress?](how-would-we-learn-a-player-lost-progress.md),
[how would we verify progress is never lost?](how-would-we-verify-progress-is-never-lost.md),
[what must we know about how the app is used?](what-must-we-know-about-how-the-app-is-used.md),
[what does the server store, if anything?](what-does-the-server-store-if-anything.md),
[is home-screen install required for durability?](is-home-screen-install-required-for-durability.md),
[what wins when correctness and latency conflict?](what-wins-when-correctness-and-latency-conflict.md),
[what wins when battery and durability conflict?](what-wins-when-battery-and-durability-conflict.md),
[does craft enjoyment ever outrank user experience?](does-craft-enjoyment-ever-outrank-user-experience.md),
[which doors must stay open?](which-doors-must-stay-open.md),
[why did unfinished.md go stale?](why-did-unfinished-md-go-stale.md),
[why was problem.md not read before prioritising?](why-was-problem-md-not-read-before-prioritising.md).

Read [which-doors-must-stay-open.md](which-doors-must-stay-open.md) before recording any decision.
Deferring is only safe while the deferred thing stays cheap to add, and whether it does is decided
by choices made in areas that look unrelated.

## What goes in a question file

Eight sections, in a fixed order. **Every section stays**, with `...` where nothing has been
recorded yet — the empty ones are the reminder of what hasn't been thought about.

`...` and `N/A` mean different things. `...` means nobody has looked. `N/A` means someone
looked and there is nothing — no blockers, or no options because the question resolves into a
fact rather than a choice. The distinction matters most under **Blocked by**, where `N/A`
means the question is ready to work on right now:

```
rg -A2 '## Blocked by' docs/questions/ | rg -B2 'N/A'
```

Frontmatter carries `opened`, `status`, and `resolves_into` — `decision`, `constraint`, or
`problem`. That last one partitions the folder: `rg -l 'resolves_into: constraint'` is the
research backlog, and everything resolving into a decision is a choice waiting to be made.

The first six sections are stable and short. **Why it matters** is what's blocked or what gets
expensive if we're wrong. **Blocked by** and **Blocks** are the two directions of dependency.
**What would settle it** is the evidence, measurement, or event that would end the question — not
another question, which is what *blocked by* is for. **Resolves into** names where the answer
lands. **Source** records where the question came from, so provenance survives the deletion of
whatever raised it.

The last two grow. **Options** holds each candidate answer with its strongest case and its
cost. **Findings** holds what we've learned so far, each with where it came from. A finding
graduates to `../constraints.md` once it's confirmed; until then it lives here.

A finding may record what a standard *implies for these options*; it may not restate the
standard itself. The first shifts a decision and belongs here. The second is a weaker local copy
of a rule already in force, competing with the real one for whoever finds it first.

**One question per file**, and the filename asks the question as plainly as it can, so a directory
listing reads as the list of what is open.

**A question is split when only part of it blocks an early milestone.** The blocking part becomes
its own file and the rest stays where it belongs. Both halves keep the format below, and the
question that was split says what it no longer covers so a reader does not go looking for it here.


<!-- Template:

# <The question, asked in plain words?>

## Why it matters

...

## Blocked by

...

## Blocks

...

## What would settle it

...

## Resolves into

...

## Source

...

## Options

...

## Findings

...
-->
