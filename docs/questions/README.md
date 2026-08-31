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

When two questions each look like they need the other first, the edge points from the decision
about *what to promise* to the decision about *how to deliver it*. Scope precedes mechanism, and a
mechanism chosen before its purpose tends to acquire one. Four pairs pointed both ways until that
rule was applied to them.

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

## The list

---

## Architecture

These gate nearly everything else. The first is the critical path to anything on screen.

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
