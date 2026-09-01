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

**Read [../problem.md](../problem.md) and [../guarantees/](../guarantees/) in full before deciding
what to work on.** Everything below is downstream of them, and a sequence argued without them is
argued from the wrong end. This is the path most readers arrive by, which is why it says so here as
well as in [../README.md](../README.md).

**Then work [M1](#m1--hello-is-live) from the top.** Its list is numbered because the order is the
argument: each entry derives from the ones above it, and taking one early makes it arbitrary without
making it look arbitrary. Every milestone list below is numbered for the same reason.

**The next thing to do is M1's first entry: [which doors must stay
open?](which-doors-must-stay-open.md)** Both this file and
[../decisions/README.md](../decisions/README.md) instruct you to consult it before recording any
decision, and it is unanswered — so that instruction currently cannot be followed, and every decision
in M1 is one it is supposed to govern.

## How this list works

**Questions are grouped by the earliest milestone they block.** Not by how foundational they feel —
by what stops working if they stay open. A question nothing is waiting on sits at the bottom, and
that is a fine place to be.

**Milestones are deliberately small.** The point is to stop designing on paper and start deciding
against running code. Each one below is something you can look at and see working, and most of them
are a day or two apart, not a month.

**Each milestone is a thin vertical slice, not a horizontal layer.** Every one below can be run and
looked at end to end. That is what makes the doors held open in M1 checkable rather than asserted —
an optionality claim nobody can exercise against a running system is a hope.

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

**Sequencing lives here and only here.** A question file says what the question is, what would
settle it, and what has been found out. It does not say what it depends on, what it blocks, or what
it decides beyond itself. Ordering is a whole-system judgement, and a single question file has no
view of the system — sixty-odd files each holding a fragment of one graph produced a first milestone
whose hosting question waited on five later ones, and nobody noticed because noticing would have
meant re-reading all of them.

**So work out the order yourself rather than inheriting it.** The grouping below is the current
best answer and is worth arguing with. If it looks wrong, it may be wrong: say so and change it
here, where the whole picture is visible.

`scripts/check-docs.py` checks the things that are facts rather than judgement — every link
resolves, every question appears in a milestone, and no question file has grown a sequencing
section back. It deliberately does not check the *ordering*, because the ordering is the judgement
and a check that passed it would only make a wrong sequence look verified.

## Settled

[0001](../decisions/0001-launch-with-sudoku-then-star-battle.md) which games, in what order.
[0002](../decisions/0002-the-client-holds-and-mutates-puzzle-state.md) the client holds and mutates
puzzle state. [0003](../decisions/0003-this-is-delivered-over-the-web.md) this is delivered over the
web. [0004](../decisions/0004-one-implementation-of-the-puzzle-rules.md) one implementation of the
puzzle rules. [0005](../decisions/0005-typescript-across-every-deployable.md) TypeScript across every
deployable, with the rules shared as source.
[0006](../decisions/0006-what-a-players-work-survives.md) what a player's work survives, per persona.
[0007](../decisions/0007-decisions-live-in-docs-and-work-lives-in-issues.md) decisions live in docs
and work lives in issues. [0008](../decisions/0008-the-option-to-analyse-play-is-preserved.md) the
option to analyse play is preserved.
[0009](../decisions/0009-the-option-to-gate-puzzle-access-is-preserved.md) the option to gate puzzle
access is preserved.

## M1 — "Hello!" is live

A deployed skeleton: a static client, a same-origin endpoint answering one route with a hard-coded
response, and nothing else. No database, no puzzle, no features.

**These choices are meant to be permanent, not provisional.** The hosting choice is where the client
and its API both live, and same-origin is what keeps a server-set cookie alive under Safari's
first-party test — see [../constraints.md](../constraints.md). Whether that cookie is ever used is
what the two guest questions below decide, and they come before the platform choice for that reason
rather than after it.

The database is here at the class level — embedded or network-attached — because that is what sets
the capability the host has to have. It is not needed to answer one route. It is needed for the
platform choice to be one we keep, and "do not change hosts" is the constraint the whole milestone is
organised around.

1. [Which doors must stay open?](which-doors-must-stay-open.md) — first, because every decision below
   is one it governs and both indexes already say to consult it.
2. [Does a guest see anything that accumulates?](does-a-guest-see-anything-that-accumulates.md) — the
   product question that sizes the one below. A board's value decays with absence; a streak's does not.
3. [Is guest recovery worth building?](is-guest-recovery-worth-building.md) — decides whether
   same-origin is forced or merely cheap, which is an input to hosting rather than a consequence of it.
4. [What execution shape does the server have?](what-execution-shape-does-the-server-have.md) — the
   hub. Long-lived process, ephemeral functions, or an edge runtime, each paired with the kind of
   store it can reach.
5. [Which database, if any?](which-database-if-any.md) — the class only. Embedded needs persistent
   local disk and narrows hosting to hosts that have one; network-attached does not.
6. [What runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md) — Node,
   Bun or Deno. Spike it. Under Bun or Deno it also answers the package manager and the test runner.
7. [Where does this run?](where-does-this-run.md) — from the three above.
8. [What runs the server?](what-runs-the-server-if-there-is-one.md) — mostly falls out of the runtime.
9. [How is the codebase laid out?](how-is-the-codebase-laid-out.md) — only the part M1 needs: how
   many packages, and where the shared rules module sits so both a browser and a batch process can
   reach it. What a directory is named for can settle once there are modules.
10. [Which package manager?](which-package-manager.md) — only separate if the runtime is Node.
11. [Is the client served as static files?](is-the-client-served-as-static-files.md) — derived from
    0002 and the offline guarantee, so closer to a recording than a decision.
12. [What renders the client?](what-renders-the-client.md) — framework, minimal library or neither,
    and which one.
13. [What builds and serves the client?](what-provides-the-build-and-dev-server.md)

## M2 — a puzzle comes from the store

One seeded puzzle, written to the store by hand, read back by the endpoint, and displayed however
crudely. No grid, no interaction, no generator. This is where migrations, backups and connection
handling become real, and where [ADR-0008](../decisions/0008-the-option-to-analyse-play-is-preserved.md)'s
queryability stops being a promise about a store nobody has built.

It sits here rather than at M7 because the alternative is building the client against a hard-coded
board for six milestones and meeting the store for the first time with a finished game attached.

- [What is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) — only enough of it
  to write one row and read it back. The full answer is not needed until M6.

## M3 — a grid is on the screen

The M2 puzzle, rendered as a grid. Static, no interaction. Proves the rendering approach against a
real shape rather than a page of text.

- [How is the app styled?](how-is-the-app-styled.md) — after the renderer, since a rendering
  approach that ships a build pipeline anyway changes what a styling toolchain costs.

## M4 — a player can fill it in

Select a cell, enter a digit, see it. In memory only; nothing survives a reload.

1. [How does a player enter a digit?](how-does-a-player-enter-a-digit.md)
2. [What latency budget makes a move feel immediate?](what-latency-budget-makes-immediately-checkable.md)
   — after the above, since the budget covers the input path and what an input is comes first.

## M5 — the board survives a reload

The first durability promise anything actually keeps.

1. [Is undo in scope, and how far back?](is-undo-in-scope-and-how-far-back.md) — depth is what
   decides the shape below, so it comes first even though undo itself is an M9 feature.
2. [What can a player do with no network?](what-can-a-player-do-with-no-network.md) — one board or a
   browsable archive, which sets storage volume by orders of magnitude.
3. [Is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md)
4. [Which client storage mechanism holds a player's work?](which-client-storage-mechanism.md) — the
   one stack choice with no clean migration path.

## M6 — the rules run

Illegal moves are recognised, and a finished board is recognised as finished.

- [What is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) — the full answer,
  now that something depends on it.

## M7 — the puzzles are real

Not one seeded row. Something published on a rhythm, fetched and rendered.

1. [How expensive is puzzle generation?](how-expensive-is-puzzle-generation.md) — measurement, and
   the questions below turn on it.
2. [Does v1 ship generated or seeded puzzles?](does-v1-ship-generated-or-seeded-puzzles.md)
3. [Is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md)
4. [Are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md)
5. [What does the server hold?](what-does-the-server-hold.md) — the catalogue candidate is settled by
   [ADR-0009](../decisions/0009-the-option-to-gate-puzzle-access-is-preserved.md); what remains here
   is how much of it the server understands.

## M8 — it works with no network

1. [How does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md)
   — this looked independent of the build tool and is not: the precache list is a build output, and
   only one candidate toolchain can produce it. So it waits on M1's build choice.
2. [How long must offline play survive?](how-long-must-offline-play-survive.md)
3. [Is the player shown anything about the network?](is-the-player-shown-anything-about-the-network.md)

## M9 — sudoku is finished, in guest mode

Everything a guest gets: notes, undo, completion, whatever hints turn out to be.

1. [Are hints in scope?](are-hints-in-scope.md)
2. [What interactions must the grid support?](what-interactions-must-the-grid-support.md) — notes,
   undo, drag-select, keyboard navigation, highlighting.
3. [Is difficulty graded, and does a grade promise anything?](is-difficulty-graded-and-does-a-grade-promise-anything.md)
4. [What makes a puzzle a joy to solve?](what-makes-a-puzzle-a-joy-to-solve.md)
5. [Is accessibility in scope for v1?](is-accessibility-in-scope-for-v1.md)

## M10 — a player can sign in

1. [Do privacy regulations apply?](do-privacy-regulations-apply.md)
2. [Are there user accounts?](are-there-user-accounts.md)
3. [How does a second device recognise the same person?](how-does-a-second-device-recognise-the-same-person.md)
4. [What does the server hold?](what-does-the-server-hold.md) — the rest of the inventory.
5. [Does the server understand puzzle content?](does-the-server-understand-puzzle-content.md)

## M11 — work follows a player between devices

1. [What crosses the client/server boundary?](what-crosses-the-client-server-boundary.md)
2. [Is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md)
3. [Can two devices edit the same board at once?](can-two-devices-edit-the-same-board-at-once.md)
4. [What happens to a losing write when syncing?](what-happens-to-a-losing-write-when-syncing.md) —
   a losing write needs two writers, so this does not arise until the two above are answered.
5. [How much unsynced work is acceptable?](how-much-unsynced-work-is-acceptable.md)
6. [What wins when battery and durability conflict?](what-wins-when-battery-and-durability-conflict.md)
7. [What does the server do with puzzle state?](what-does-the-server-do-with-puzzle-state.md)

## M12 — the puzzles are ours

- [Which games come after sudoku and star battle?](which-games-come-after-sudoku-and-star-battle.md)

## M13 — something is paid for

1. [Is there a paid tier?](is-there-a-paid-tier.md)
2. [What is the acceptable running cost?](what-is-the-acceptable-running-cost.md)
3. [What load should the server handle?](what-load-should-the-server-handle.md)
4. [How much downtime is acceptable?](how-much-downtime-is-acceptable.md)
5. [How is the server operated?](how-is-the-server-operated.md) — its size is set entirely by M1's
   hosting choice: a managed platform supplies most of this and a bare machine supplies none of it.

## Blocking nothing yet

Real, and nothing is waiting on them. Several are research rather than choices.

[What runs the tests?](what-runs-the-tests.md) and
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
[is home-screen install required for durability?](is-home-screen-install-required-for-durability.md)
— bears on the two guest questions in M1 without blocking them, because install cannot be required
of anyone. [What wins when correctness and latency conflict?](what-wins-when-correctness-and-latency-conflict.md),
[does craft enjoyment ever outrank user experience?](does-craft-enjoyment-ever-outrank-user-experience.md).

## What goes in a question file

Six sections, in a fixed order. **Every section stays**, with `...` where nothing has been
recorded yet — the empty ones are the reminder of what hasn't been thought about.

`...` and `N/A` mean different things. `...` means nobody has looked. `N/A` means someone
looked and there is nothing — no blockers, or no options because the question resolves into a
fact rather than a choice.

Frontmatter carries `opened`, `status`, and `resolves_into` — `decision`, `constraint`, or
`problem`. That last one partitions the folder: `rg -l 'resolves_into: constraint'` is the
research backlog, and everything resolving into a decision is a choice waiting to be made.

The first six sections are stable and short. **Why it matters** is what's blocked or what gets
expensive if we're wrong. **There are no Blocked by, Blocks, or What this decides beyond itself
sections.** A per-file dependency list is one graph held in sixty-odd places, each of which sees a
sliver of it. It goes stale invisibly — noticing requires re-reading everything around it — and it
is trusted precisely because it reads as a fact rather than as the judgement it is. The milestone
grouping above holds the same information where every sequencing claim sits beside the others and
one file can be checked against itself. `scripts/check-docs.py` fails on the two headings that
carried this before, because they spread by being copied.

A question that genuinely cannot be worked until another is answered says so under **What would
settle it**, in prose, as part of describing what an answer requires.
**What would settle it** is the evidence, measurement, or event that would end the question — not
another question. **Resolves into** names where the answer lands. **Source** records where the
question came from, so provenance survives the deletion of whatever raised it.

The last two grow. **Options** holds each candidate answer with its strongest case and its cost.

### Findings are evidence, not fact

**Findings** holds what we've learned so far. Nothing in it is established, and nothing in it may be
cited as though it were. A finding becomes binding by graduating to [../constraints.md](../constraints.md)
or by being reasoned through in a decision record — never by sitting in a question file long enough
to look settled. Every Findings section opens with that sentence, so a reader who arrives at one file
without reading this one still knows what they are holding.

**A finding that asserts a fact about the world carries the tier it was established at**, using the
same three words [../constraints.md](../constraints.md) uses — *Measured*, *Sourced*, *Reasoned* —
plus a fourth this folder needs and that file does not:

- ***Unverified — no source recorded.*** Somebody wrote it down and nobody can say why it is true.
  This is the most useful tag in the set, because an unsourced number reads exactly like a sourced
  one and this is what tells them apart. Several arrived here from legacy documents and none of them
  should decide anything.

A finding that is a judgement, a product opinion, or an implication for the options here carries no
tier, because there is nothing to have established.

A finding may record what a standard *implies for these options*; it may not restate the standard
itself. The first shifts a decision and belongs here. The second is a weaker local copy of a rule
already in force, competing with the real one for whoever finds it first.

**Findings should say when a decision would close a door**, and that is the one forward-looking claim
they are for. It is not sequencing — it does not say what to answer first — it says what stops being
reachable. [Which doors must stay open?](which-doors-must-stay-open.md) is where the list of them
lives.

**One question per file**, and the filename asks the question as plainly as it can, so a directory
listing reads as the list of what is open.

**A question is split when only part of it blocks an early milestone.** The blocking part becomes
its own file and the rest stays where it belongs. Both halves keep the format below, and the
question that was split says what it no longer covers so a reader does not go looking for it here.


<!-- Template:

---
opened: YYYY-MM-DD
status: open
resolves_into: decision | constraint | problem
---

# <The question, asked in plain words?>

## Why it matters

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

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**<A claim about the world.>** <What it means for the options here.>

*Sourced | Measured | Reasoned | Unverified — <how we know, or that we do not>.*

**<A judgement or an implication for the options.>** <No tier: there is nothing to have established.>

-->
