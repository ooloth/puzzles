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

## Which questions are foundational

The picture below is the main thing this file maintains. Update it when a question is added or
answered.

Questions are stacked by **how derived they are**, not by what they happen to block. A question
in one layer cannot be answered well until the layer above it is settled — not because a
dependency was written down somewhere, but because the answer would be arbitrary without it.
Answer downward.

A layer-3 question answered before its layer-1 input exists does not stay visible as a guess. It
becomes an assumption nobody remembers making, and it goes on being right-looking because the
reasoning built on top of it is sound. That is the failure this stack exists to catch, and it has
already happened here four times.

`?` marks a question that should exist and does not — a missing parent. Where existing questions
sit indented beneath one, they are fragments of it: each asks a piece, none asks the whole, and
answering them separately is how a foundation gets decided by accident. In layers 2 and 3 the
right-hand column names what each question derives from, so a parent that is not settled yet is
visible without leaving the page.

```
LAYER 0 · AGREED, NEVER RECORDED AS DECISIONS
════════════════════════════════════════════════════════════════════════════
Settled in problem.md or in conversation, load-bearing, and absent from
decisions/. Anyone who skips problem.md will reopen these — and has. Each
should become an ADR; until then, treat them as fixed, not as open.

   phone-first, played in transit; desktop secondary, same person
   single-player and unranked — never social
   puzzles are generated by this project rather than licensed
   solving experience outranks puzzle supply; interface before generator
   switching devices between sessions IS in scope; simultaneous editing is not
   a paid tier is uncommitted, but the option must not be foreclosed
   cross-device identity is the thing that keeps that option open
   delivered over the web              (implied by the full-stack purpose)

LAYER 1 · FOUNDATIONAL — nothing derives these; everything below does
════════════════════════════════════════════════════════════════════════════

 the experience — the primary deliverable, and the least specified thing here
   ?  what does solving feel like, move by move?                    UNFILED
      · what interactions must the grid support?
      · is undo in scope, and how far back?
      · are hints in scope?

 the promises — each bounds a guarantee that is written without a bound
   ?  how long must in-progress work survive, and on which devices?  UNFILED
      · how long must offline play survive?

 the product
   ?  what is in v1, and what is deliberately not?                   UNFILED
      · is there one puzzle a day, or unlimited play?
      · is there a paid tier?

 the puzzles
      · what makes a puzzle a joy to solve?

 the tiebreakers — problem.md's ranking is incomplete on purpose
      · what wins when correctness and latency conflict?
      · what wins when battery and durability conflict?
      · does craft enjoyment ever outrank user experience?

LAYER 2 · SHAPE — what the system must contain      derives from ↓
════════════════════════════════════════════════════════════════════════════
   is cross-device resume in scope for v1?        promises · may be layer 0
   are there user accounts?                       promises, paid tier
   what does the server store, if anything?       promises
   how much unsynced work is acceptable?          promises
   is puzzle state a snapshot or an event log?    experience (undo)
   is accessibility in scope for v1?              experience, v1
   what latency budget makes it "immediate"?      experience
   does v1 ship generated or seeded puzzles?      v1
   is difficulty graded, and does it promise?     puzzles
   which games come after sudoku, star battle?    v1
   do privacy regulations apply?                  accounts
   how much downtime is acceptable?               promises
   what is the acceptable running cost?           v1

LAYER 3 · MECHANISM — how it gets built             derives from ↓
════════════════════════════════════════════════════════════════════════════
   which component framework?                     experience
   what provides the build and dev server?        framework
   how does the app stay available offline?       offline promise, build
   how is the app styled?                         framework
   how is the codebase laid out?                  framework
   where does this run?                           server, cross-device
   what load should the server handle?            server
   is home-screen install required?               durability promise
   how does a 2nd device recognise the person?    accounts
   what happens to a losing write when syncing?   snapshot-or-log
   are puzzles generated ahead or on demand?      daily rhythm
   how would we verify progress is never lost?    unsynced work
   how would we learn a player lost progress?     durability promise

LAYER 4 · FACTS TO GO AND GET — inform the above, gate none of it
════════════════════════════════════════════════════════════════════════════
   how expensive is puzzle generation?
   is Safari's storage window still seven days?
   how does Android evict stored data?
   what are the real network conditions on transit routes?
   how long until a stalled connection surfaces as an error?
   what do existing puzzle apps do about offline play?
```

## Grooming this list

Drawing the stack once is worth little. Maintaining it is the work, and it is what makes each
decision easier than the one before rather than harder.

**Before working any question, find its layer and check the layer above it.** If the parent is not
settled, the answer will be arbitrary and — this is the part that costs — it will not look
arbitrary. File the parent and work that instead. The price of answering out of order is not a
wasted afternoon; it is a decision that reads as reasoned for months.

**A `?` is a missing parent, not a missing nice-to-have.** Each was found by taking a layer-2
question, asking what it derives from, and getting no answer. Finding more of them is a normal
outcome of using this list, not a sign it was built wrong.

**Anything agreed in conversation goes into layer 0 immediately**, or becomes an ADR, which is
better. Every entry there was re-derived at least once — sometimes more — because it lived only
in a chat log or in the middle of `../problem.md`. This is the most expensive habit visible in
this repo's history, and it is the one this file exists to break.

**When two questions deadlock**, the edge points from what to promise toward how to deliver it:
scope precedes mechanism, and a mechanism chosen before its purpose tends to acquire one. Four
pairs pointed both ways until that was applied. If a pair still deadlocks afterwards, stop trying
to break the tie and look for a parent nobody wrote down — cross-device resume and user accounts
deadlocked precisely until it became clear that neither had a settled answer to what durability
promises.

**The evidence that this is needed here.** Four decisions were made or nearly made out of order,
and all four were caught by accident rather than by process.
[ADR-0003](../decisions/0003-the-server-validates-puzzle-state-but-does-not-arbitrate-it.md)
specifies how divergent copies of a board merge, while whether copies ever diverge sits unresolved
below it. [ADR-0004](../decisions/0004-a-component-framework-renders-the-client.md) rejected its
alternatives on reasoning that later research contradicted.
[ADR-0006](../decisions/0006-typescript-everywhere-with-the-rules-shared-as-source.md) stated a
client storage mechanism as settled when nothing had decided it. And layer 0 was never written
down at all — which is how a question `../problem.md` already answers, whether switching devices
between sessions is in scope, came to be analysed at length as though it were open.

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
