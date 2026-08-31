---
updated: 2026-08-31
update_when: a question opens, or one gets settled
decays: fast
status: active
---

# Questions

Every consequential question this project still has to answer. A question belongs here if
getting it wrong would be expensive to undo, or if it gates other decisions. That rule is
what keeps this folder from filling with trivia.

A long list is healthy. This is the inventory of what's genuinely open — not a backlog to
feel bad about, and not a queue that needs draining. Questions that aren't ready to be worked
are still worth recording: keeping one here costs nothing, and rediscovering it later costs
real time.

**One question per file.** The filename asks the question as plainly as it can, so a directory
listing reads as the list of what's open. Each file carries `opened` and `status`.

Most questions leave by becoming a decision in [../decisions/](../decisions/), and `status`
records which one, so a missing question can be told apart from an abandoned one. Some resolve
into a fact rather than a choice — those say so, and land in `../constraints.md`.

Each entry below is followed by its significance: what the question is really about, which is
usually not what its title says. Dependencies live in the question files themselves.

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
The body's **Resolves into** section names the specific destination and why; the frontmatter
is the category, so it can be queried.

The first six are stable and short. **Why it matters** is what's blocked or what gets
expensive if we're wrong. **Blocked by** and **Blocks** are the two directions of dependency:
what must be answered first, and what this unblocks. **What would settle it** is the evidence,
measurement, or event that would end the question — not another question, which is what
*blocked by* is for. **Resolves into** names where the answer lands when it isn't a decision,
which is how research questions differ from choices. **Source** records where the question
came from, so provenance survives the deletion of whatever raised it.

The last two grow. **Options** holds each candidate answer with its strongest case and its
cost. **Findings** holds what we've learned so far, each with where it came from — partial
answers, sources checked, dead ends. A finding graduates to `../constraints.md` once it's
confirmed; until then it lives here.

A finding may record what a standard *implies for these options*; it may not restate the
standard itself. The first shifts a decision and belongs here. The second is a weaker local copy
of a rule already in force, competing with the real one for whoever finds it first.

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

## What blocks what

The picture below is the main thing this file maintains. It is generated from the **Blocked by**
section of every question, so it is only as true as those are — when you add or answer a
question, update it here too.

Indentation is dependency: a question sits under whatever must be answered before it. `n ↓` is
how many questions in total sit below it, directly or not. `← also` names other parents not
drawn on this branch, and `└→` points at a question already drawn elsewhere.

```
PREMISES — not filed as questions. Everything below inherits them.
════════════════════════════════════════════════════════════════════════════════
  ?  is this delivered over the web at all?      every storage fact assumes yes
  ?  is offline play a promise, how absolute?    ADR-0002 is derived from it
  ?  what does durability promise, and to whom?  ADR-0003 is derived from it
════════════════════════════════════════════════════════════════════════════════

ANSWERABLE NOW — nothing blocks these

how expensive is puzzle generation?                                       14 ↓
 ├─ one puzzle a day, or unlimited play?                                   8 ↓
 │   ├─ cross-device resume in v1?                                         6 ↓
 │   │   ├─ are there user accounts?      ← also paid tier, privacy        1 ↓
 │   │   │   └─ how does a 2nd device recognise the same person?
 │   │   ├─ what happens to a losing write?   ← also snapshot-or-log
 │   │   └─ where does this run?   ← also server store, load, install      2 ↓
 │   │       ├─ how much downtime is acceptable?
 │   │       └─ what is the acceptable running cost?   ← also load
 │   └─ is there a paid tier?             ← also privacy                   2 ↓
 │       └→ are there user accounts
 ├─ generated ahead of time, or on demand?                                 4 ↓
 │   └─ what does the server store, if anything?      ← also load          3 ↓
 │       └→ where does this run
 └─ does v1 ship generated or seeded puzzles?                              2 ↓
     └─ what makes a puzzle a joy to solve?                                1 ↓
         └─ is difficulty graded, and does a grade promise anything?

what wins when battery and durability conflict?                            6 ↓
 └─ how much unsynced work is acceptable?                                  5 ↓
     ├─ how would we verify progress is never lost?
     └─ is home-screen install required?   ← also Safari window            3 ↓
         └→ where does this run

is Safari's storage window still seven days?                               4 ↓
 └→ is home-screen install required

what load should the server handle?                                        4 ↓
 ├→ what does the server store, if anything?
 ├→ where does this run?
 └─ what is the acceptable running cost?

do privacy regulations apply?                                              3 ↓
 ├→ is there a paid tier?
 └→ are there user accounts?

is undo in scope, and how far back?                                        2 ↓
 └─ is puzzle state a snapshot or an event log?                            1 ↓
     └→ what happens to a losing write when syncing?

which component framework?                                                 2 ↓
 ├─ how is the app styled?
 └─ how is the codebase laid out?

what interactions must the grid support?                                   2 ↓
 ├─ is accessibility in scope for v1?
 └─ what latency budget makes "immediately" checkable?

what provides the build and dev server?                                    1 ↓
 └─ how does the app itself stay available offline?

BLOCKS NOTHING — answer when it matters, never to unblock something else
 · are hints in scope?
 · does craft enjoyment ever outrank user experience?
 · how does Android evict stored data?
 · how long must offline play survive?
 · how long until a stalled connection surfaces as an error?
 · how would we learn a player lost progress?
 · what are the real network conditions on transit routes?
 · what do existing puzzle apps do about offline play?
 · what wins when correctness and latency conflict?
 · which games come after sudoku and star battle?
```

## Reading the graph

**The premise row is the live gap.** Three choices everything else derives from are not filed as
questions at all — they exist only as assumptions inside [../guarantees/](../guarantees/) and the
decision records. Answering anything below an unexamined premise risks a correct derivation from
an unchosen starting point, which is the one error that stays invisible because the reasoning on
top of it is sound.

**Generation cost is the largest lever in the folder and one of the cheapest to settle.** It is
a measurement, it is unblocked, and fourteen questions sit under it — the whole daily-rhythm,
durability, identity and hosting chain hangs off whether generating a puzzle is cheap. Nothing
else here comes close.

**Depth is not importance.** The two client-build spines are shallow, which says only that few
questions wait on them, not that they matter less. They are also the only spines that reach code.

**Interesting is not ready.** The durability and sync questions are the most engaging here and
sit five and six levels deep. Being drawn to them is not evidence they are next.

**When two questions look like they need each other**, the edge points from what to promise
toward how to deliver it — scope precedes mechanism, and a mechanism chosen before its purpose
tends to acquire one. Four pairs pointed both ways until that was applied. If a pair still
deadlocks after it, the useful move is not to break the tie but to look for a question above both
that nobody has written down: cross-device resume and user accounts deadlocked until it became
clear neither had a settled answer to what durability promises — a premise, and unfiled.

**Why any of this is enforced.** Four decisions in this repo were made or nearly made out of
order, and all four were caught by accident rather than by process:
[ADR-0003](../decisions/0003-the-server-validates-puzzle-state-but-does-not-arbitrate-it.md)
specifies how divergent copies of a board merge while
[whether copies ever diverge](is-cross-device-resume-in-scope-for-v1.md) is still open;
[ADR-0004](../decisions/0004-a-component-framework-renders-the-client.md) rejected its
alternatives on reasoning later research contradicted;
[ADR-0006](../decisions/0006-typescript-everywhere-with-the-rules-shared-as-source.md) stated a
client storage mechanism as settled when nothing had decided it; and delivering this over the web
has never been examined, though every fact in [../constraints.md](../constraints.md) about storage
eviction assumes it.

## The list

Grouped by subject, so a question can be found by what it is about. That is a different job from
deciding what to work on, which the section above is for — subject groupings say nothing about
readiness, and several of the questions listed first are among the least ready.

---

## Architecture

Mechanism questions, mostly. Engaging, and downstream of nearly everything else in this file.

- [Is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md)
  Whether history is kept or only the current board. Decides how undo and reconciliation work.

- [What happens to a losing write when syncing?](what-happens-to-a-losing-write-when-syncing.md)
  Whether "progress is never lost" survives contact with a strategy that discards writes.

- [Which component framework?](which-component-framework.md)
  The dependency the interface is written against for years, and the choice most exposed to
  familiarity masquerading as reasoning.

- [What provides the build and dev server?](what-provides-the-build-and-dev-server.md)
  The component that delivers the inner loop ADR-0004 was decided for.



- [What does the server store, if anything?](what-does-the-server-store-if-anything.md)
  Whether the data store choice is significant or nearly irrelevant.

- [How is the codebase laid out?](how-is-the-codebase-laid-out.md)
  When sharing puzzle logic starts to justify separate packages.

## What the product is

- [Is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md)
  Two different products. Decides whether archives, streaks and timezones exist at all.

- [Are there user accounts?](are-there-user-accounts.md)
  Whether identity is anonymous and disposable, or durable and portable.

- [Is there a paid tier?](is-there-a-paid-tier.md)
  Whether anything is worth cheating for — which decides whether anti-cheat matters at all.

- [Are hints in scope?](are-hints-in-scope.md)
  Whether the solver must *explain* its reasoning or only reach an answer.

- [Is undo in scope, and how far back?](is-undo-in-scope-and-how-far-back.md)
  Whether history has to be retained, and for how long.

- [Which games come after sudoku and star battle?](which-games-come-after-sudoku-and-star-battle.md)
  How much shared abstraction is worth building before a second game exists to generalise from.

- [How is the app styled?](how-is-the-app-styled.md)
  Where a consistent design scale comes from, for a bespoke interface with no designer.

- [What interactions must the grid support?](what-interactions-must-the-grid-support.md)
  Drag-select, keyboard navigation and live highlighting were asserted as requirements by the
  previous architecture with nothing corroborating them.

- [Is accessibility in scope for v1?](is-accessibility-in-scope-for-v1.md)
  Keyboard and screen-reader support for a grid, which is expensive to retrofit.

## Puzzles

- [What makes a puzzle a joy to solve?](what-makes-a-puzzle-a-joy-to-solve.md)
  The generator's actual target. Uniqueness and logical solvability are the floor, not the goal.

- [Are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md)
  Whether generation ever sits on a path a player is waiting on. Assumed, never decided.

- [Does v1 ship generated or seeded puzzles?](does-v1-ship-generated-or-seeded-puzzles.md)
  Whether the generator is on the launch path, and who validates a seed set if it isn't.

- [Is difficulty graded, and does a grade promise anything?](is-difficulty-graded-and-does-a-grade-promise-anything.md)
  Whether we need a difficulty model or only a solver.

## Durability and identity

- [Is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md)
  The sharpest contradiction inherited from the old docs, and currently why `guarantees/`
  promises only same-device resume.

- [How does a second device recognise the same person?](how-does-a-second-device-recognise-the-same-person.md)
  Whether identity can live anywhere the browser can't unilaterally delete.

- [How much unsynced work is acceptable?](how-much-unsynced-work-is-acceptable.md)
  The number that turns "never lost" into something testable, and sets the sync cadence.

- [Is home-screen install required for durability?](is-home-screen-install-required-for-durability.md)
  Whether the durability promise is quietly weaker for players who don't install.

## Platform and operations

- [Where does this run?](where-does-this-run.md)
  Reopened. If the client owns state, previously-disqualified platforms come back into play.

- [What load should the server handle?](what-load-should-the-server-handle.md)
  The number every performance argument so far has been made without.

- [What is the acceptable running cost?](what-is-the-acceptable-running-cost.md)
  Whether cost is a ceiling that rules platforms out, or a preference that doesn't.

- [How much downtime is acceptable?](how-much-downtime-is-acceptable.md)
  Accepting no redundancy deliberately, with a number, rather than discovering it during an outage.

## Measurement and verification

- [What latency budget makes "immediately" checkable?](what-latency-budget-makes-immediately-checkable.md)
  Making the most important guarantee testable instead of rhetorical.

- [How does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md)
  Every offline discussion so far has been about data. If the shell isn't cached, there is
  nothing to play.

- [How long must offline play survive?](how-long-must-offline-play-survive.md)
  Minutes, a flight, or a night. Decides how much content is cached ahead of time.

- [How would we verify progress is never lost?](how-would-we-verify-progress-is-never-lost.md)
  There is no unit test for an OS memory purge.

- [How would we learn a player lost progress?](how-would-we-learn-a-player-lost-progress.md)
  Detecting a failure that produces no error and no complaint.

## Priorities not yet settled

- [What wins when correctness and latency conflict?](what-wins-when-correctness-and-latency-conflict.md)
  The missing rung in the ranking. A late error invalidates reasoning already built on it.

- [What wins when battery and durability conflict?](what-wins-when-battery-and-durability-conflict.md)
  Sync cadence, where two stated preferences pull in opposite directions.

- [Does craft enjoyment ever outrank user experience?](does-craft-enjoyment-ever-outrank-user-experience.md)
  Answering openly once, rather than smuggling it into decisions as a technical argument.

## Facts to go and get

Cheap to answer, currently blocking or distorting real decisions. These resolve into
`../constraints.md` rather than into a decision.

- [How expensive is puzzle generation?](how-expensive-is-puzzle-generation.md)
  A claim that it's cheap was carrying the language argument and was never measured.

- [How does Android evict stored data?](how-does-android-evict-stored-data.md)
  An entire platform's durability behaviour, unresearched while we assume an iOS-heavy
  audience on no evidence.

- [Is Safari's storage window still seven days?](is-safaris-storage-window-still-seven-days.md)
  What counts as interaction is now known. Whether the window is still seven days is not, and
  the difference decides how exposed a lapsed player really is.

- [What are the real network conditions on transit routes?](what-are-the-real-network-conditions-on-transit-routes.md)
  Whether the offline design is sized to reality or to a specification's classification thresholds.

- [How long until a stalled connection surfaces as an error?](how-long-until-a-stalled-connection-surfaces-as-an-error.md)
  The modal tunnel failure, which retry logic built around thrown errors never sees.

- [What do existing puzzle apps do about offline play?](what-do-existing-puzzle-apps-do-about-offline-play.md)
  Whether offline is a differentiator or table stakes. No competitor research exists at all.

## Legal

- [Do privacy regulations apply?](do-privacy-regulations-apply.md)
  Consent, erasure, age gating and data residency, none of which have ever been examined.
