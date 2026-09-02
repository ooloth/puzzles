---
updated: 2026-09-02
update_when: a decision is made, a milestone changes, a question is split, or a requirement changes
decays: fast
status: active
---

# Questions

The sibling of [../decisions/](../decisions/): the decisions not yet made, arranged by what they
stop us building.

A directory listing of this folder is the full inventory — every filename asks its question plainly,
so there is no index here. What this file holds is **what has to be shipped, what is already
established, and which questions stand between the two**. That is the part a listing cannot show, and
the part every session was otherwise reconstructing from scratch.

## Start here

**Read [../problem.md](../problem.md) and [../guarantees/](../guarantees/) in full before deciding
what to work on.** Everything below is downstream of them, and a sequence argued without them is
argued from the wrong end. This is the path most readers arrive by, which is why it says so here as
well as in [../README.md](../README.md).

**Then work M1 from the top.** Its requirements are slices you can run and look at, in the order you
would build them, each with the questions that block it. M1 is laid out this way; M2 onward are still
bare question lists, which is a gap rather than a distinction.

## How this list works

Each milestone is a list of **what has to be true to ship it**. Under each requirement sit the
**givens** — product facts, promises, constraints and records already established — and under the
givens, the **questions that must be answered** before that requirement can be built. Read left to
right: what we are shipping, what we already know, what that leaves undecided.

**Every requirement is something you can run and look at.** A vertical slice, in the order you would
build it — the thing that renders before the thing that is served, the thing that is served before
the thing that is deployed. Deploying is the last slice, not the first: a hosting choice made before
anything exists to host is made against an imagined system. "Both halves are deployed" is close to
the milestone's end state rather than a step toward it, so if a requirement reads like the milestone
restated, it is bundling slices that could each be observed on their own.

That shape does three jobs:

- **It shows what is blocked.** A requirement with no question under it can be built today. One with
  five is where the thinking has to happen first.
- **It finds missing questions.** If a requirement's givens do not reach a buildable state and no
  question says why, the question has not been written yet.
- **It finds bundled requirements.** Several unrelated groups of givens under one requirement means
  it is really several requirements, each of which could be observed separately and sequenced on its
  own. One group of givens per requirement is the target, and where that cannot be reached honestly,
  the bundling is real rather than a formatting problem.

**Deferring is the default.** An unanswered question is optionality retained, and everything learned
before it must be answered is information the answer would otherwise be made without. A question
earns its place here only by naming what breaks if it waits. When one does have to be answered, it is
made as narrow as possible, and the record says which doors it closes — closing one is clarifying and
irreversible, so it is confirmed rather than noticed afterwards.

**Sequencing lives here and only here.** Question files say what the question is and what would
settle it. They do not say what they depend on or what they block, because that is a whole-system
judgement and no single file can see it.

**A question resolves into as many records as it contains decisions** — the separability test in
[../decisions/README.md](../decisions/README.md). It is deleted once nothing is left in it that a
record has not settled; mine it first, since findings graduate to
[../constraints.md](../constraints.md) and reasoning belongs in whichever record it argues for.
**Promises are written as they fall out of records**, on the decision template's checklist, rather
than committed to in advance.

`scripts/check-docs.py` checks what is fact rather than judgement: links resolve, every question
appears in a milestone, no question file has grown a sequencing section. It does not check the
ordering, because a check that passed it would only make a wrong order look verified.

## Settled

**[../decisions/](../decisions/) is the list, and it is not repeated here.** Every record is titled by
what it settled, so the listing is the checklist of constraints in force. Records are numbered in the
order they derive from each other, so reading them in order is reading the argument being built.

## M1 — "Hello!" is live

A deployed skeleton: a client, an endpoint answering one route with a hard-coded response, and
nothing else. No database, no puzzle, no features.

**M1 is a vertical slice through the whole system, not a front end with a stub behind it.** Both
halves ship, onto a host that has to satisfy the server and whatever its store turns out to need. The
client runs almost anywhere, so it is the half least able to discriminate between hosts and must not
be what selects one.

**The hosting choice is permanent, and it is the eighth slice rather than the first.** Discovering
later that the server needs something the host cannot give does not cost a redeploy — it moves both
halves, plus whatever else was chosen to fit. That is an argument for reaching it with its inputs
answered, not for reaching it early: requirements 1 to 6 are what produce those inputs, and each can
be run and looked at on the way.

**Check the order rather than trusting it.** Two things would move a requirement: a given it needs
that sits under a later one, or a question under it that another requirement turns out to need
first.

1. **The repository builds and runs a TypeScript program.**
   - **Given:** [ADR-0006](../decisions/0006-one-language-across-every-deployable.md)
   - **Given:** [ADR-0007](../decisions/0007-that-language-is-typescript.md)
     - **Must answer:** [what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md)
     - **Must answer:** [which package manager?](which-package-manager.md)
2. **The repository holds both halves, with one rules module both can reach.**
   - **Given:** [ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)
     - **Must answer:** [how is the codebase laid out?](how-is-the-codebase-laid-out.md)
3. **A browser shows "Hello!" rendered by the client.**
   - **Given:** [ADR-0013](../decisions/0013-every-puzzle-cell-is-a-focusable-labelled-element.md)
   - **Given:** [ADR-0014](../decisions/0014-all-play-is-reachable-from-the-keyboard-alone.md)
     - **Must answer:** [what renders the client?](what-renders-the-client.md)
     - **Must answer:** [what builds and serves the client?](what-provides-the-build-and-dev-server.md)
4. **The client reaches a browser that has no network.**
   - **Given:** [the board in play continues through a loss of connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md)
   - **Given:** [the app never opens to a blank screen after the first visit](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md)
   - **Given:** [ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md)
   - **Given:** [../constraints.md](../constraints.md) — keeping any promise offline puts the thing on the device before the network goes
   - **Given:** [../constraints.md](../constraints.md) — without content-hashed filenames a browser revalidates every cached asset
     - **Must answer:** [is the entry document produced per request?](is-the-client-served-as-static-files.md)
     - **Must answer:** [what serves the client's files?](what-serves-the-clients-files.md)
5. **A server answers one route with a hard-coded response.**
   - **Given:** [ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md)
   - **Given:** [ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)
     - **Must answer:** [what execution shape does the server have?](what-execution-shape-does-the-server-have.md)
     - **Must answer:** [what runs the server?](what-runs-the-server.md)
6. **The client calls that route and shows the answer.**
   - **Given:** [../constraints.md](../constraints.md) — a server-set cookie is the only identifier surviving Safari's storage wipe unaided
   - **Given:** [../constraints.md](../constraints.md) — that exemption is withdrawn when the setting server is not judged genuinely first-party
   - **Given:** [is guest recovery worth building?](is-guest-recovery-worth-building.md)
     - **Must answer:** [do the client and the API share an origin?](do-the-client-and-the-api-share-an-origin.md)
7. **Both halves run on a host that suits them.**
   - **Given:** [what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md)
   - **Given:** [is the entry document produced per request?](is-the-client-served-as-static-files.md)
   - **Given:** [what serves the client's files?](what-serves-the-clients-files.md)
   - **Given:** [what execution shape does the server have?](what-execution-shape-does-the-server-have.md)
   - **Given:** [do the client and the API share an origin?](do-the-client-and-the-api-share-an-origin.md)
     - **Must answer:** [where does this run?](where-does-this-run.md)
8. **The deployment answers at an address we control.**
   - **Given:** [../constraints.md](../constraints.md) — the first-party test turns on what the domain resolves to, and fails silently
     - **Must answer:** [how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md)
9. **A change made locally reaches the deployment.**
   - **Given:** [where does this run?](where-does-this-run.md)
     - **Must answer:** [what deploys the code?](what-deploys-the-code.md)

## M2 — a change can be checked before it ships

M1 is the first thing that exists and the first thing that can be wrong without anyone noticing.
Everything after this is verified using whatever gets built here, so building it once now — while the
stack is chosen and nothing is built on it — is when it is cheapest and when it pays back most.

Each entry is a maintainer's problem rather than a thing a project ought to have, and each is the
difference between checking a change in a minute and checking it in an afternoon. They are used many
times a day, by the maintainer and by an agent working without them. This milestone produces nothing
a player can see, which is why it has to be a milestone rather than a habit.

1. [What runs the tests?](what-runs-the-tests.md) — likely answered by M1's runtime.
2. [What runs the checks on every change?](what-runs-the-checks-on-every-change.md) — `check-docs.py`
   already exists and nothing runs it, which is the shape of the whole problem.
3. [What proves a vertical slice works end to end?](what-proves-a-vertical-slice-works-end-to-end.md)
   — every milestone here claims to be observable, and nothing says what observing one consists of.
   This is where [../verification.md](../verification.md) gets its content.
4. [How is the app run locally the way it runs deployed?](how-is-the-app-run-locally-the-way-it-runs-deployed.md)
   — a bug that only appears deployed costs a deploy cycle per attempt to reproduce it.
5. [How is the system reset to a known state?](how-is-the-system-reset-to-a-known-state.md) — two runs
   of a check are only comparable if they start from the same place.
6. [How does anyone load an arbitrary board state?](how-does-anyone-load-an-arbitrary-board-state.md)
   — reaching a nearly-finished grid or a specific violation by playing to it is the main thing
   standing between someone and checking whether a change works.
7. [How is the app driven on a real device?](how-is-the-app-driven-on-a-real-device.md) — the primary
   platform is a phone, and [../constraints.md](../constraints.md) records a streaming bug that
   reproduced only on real iOS Safari over a real network.
8. [How is this tested across browsers and platforms?](how-is-this-tested-across-browsers-and-platforms.md)
   — how many devices and which, and what runs where. It cannot be answered before
   the compatibility theme in [the guarantees README](../guarantees/README.md) says what the matrix
   is, and that theme holds no promises yet, admitting every promise in the folder is scoped to
   something nobody has written down.

## M3 — a puzzle comes from the store

One seeded puzzle, written to the store by hand, read back by the endpoint, and displayed however
crudely. No grid, no interaction, no generator. This is where migrations, backups and connection
handling become real, and where
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)'s queryability
stops being a promise about a store nobody has built.

It sits here rather than at M8 because the alternative is building the client against a hard-coded
board for six milestones and meeting the store for the first time with a finished game attached.

1. [What is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) — only enough of it
   to write one row and read it back. The full answer is not needed until M7.
2. [Can more than one puzzle be published per day?](can-more-than-one-puzzle-be-published-per-day.md)
   — this is when the first row is keyed, and a puzzle keyed by date alone can never have a sibling.
3. [What crosses the client/server boundary?](what-crosses-the-client-server-boundary.md) — the first
   response with content in it is the first contract, so this is where the format is set.
4. [Which database?](which-database.md) — the class was settled at M1 as part of the execution shape;
   the engine waits until here, because choosing between them without an access pattern is choosing
   by reputation.

## M4 — a grid is on the screen

The M3 puzzle, rendered as a grid. Static, no interaction.

- [How is the app styled?](how-is-the-app-styled.md) — after the renderer, since a rendering approach
  that ships a build pipeline anyway changes what a styling toolchain costs.

## M5 — a player can fill it in

Select a cell, enter a digit, see it. In memory only; nothing survives a reload.

1. [How does a player enter a digit?](how-does-a-player-enter-a-digit.md) — bounded by
   [ADR-0014](../decisions/0014-all-play-is-reachable-from-the-keyboard-alone.md), which rules out a
   gesture with no keyboard form.
2. [What latency budget makes a move feel immediate?](what-latency-budget-makes-immediately-checkable.md)
   — after the above, since the budget covers the input path and what an input is comes first.

## M6 — the board survives a reload

The first durability promise anything actually keeps.

1. [Is undo in scope, and how far back?](is-undo-in-scope-and-how-far-back.md) — depth is what
   decides the shape below, so it comes first even though undo itself is an M10 feature.
2. [What can a player do with no network?](what-can-a-player-do-with-no-network.md) — one board or a
   browsable archive, which sets storage volume by orders of magnitude.
3. [Is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md)
4. [Which client storage mechanism holds a player's work?](which-client-storage-mechanism.md) — the
   one stack choice with no clean migration path.

## M7 — the rules run

Illegal moves are recognised, and a finished board is recognised as finished.

- [What is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) — the full answer,
  now that something depends on it.

## M8 — the puzzles are real

Not one seeded row. Something published on a rhythm, fetched and rendered.

1. [How expensive is puzzle generation?](how-expensive-is-puzzle-generation.md) — measurement, and
   the questions below turn on it.
2. [Does v1 ship generated or seeded puzzles?](does-v1-ship-generated-or-seeded-puzzles.md)
3. [Is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md)
4. [Are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md)
5. [Does any page need markup a crawler can read?](does-any-page-need-markup-a-crawler-can-read.md) —
   the first URL worth sharing or indexing exists here. It sits at this milestone rather than at M1
   because no rendering choice forecloses it: a rebuild on publish and a single runtime-rendered
   route are both additive. The record that settles M1's rendering shape should say so explicitly.
6. [Do content and puzzle routes share an origin?](do-content-and-puzzle-routes-share-an-origin.md) —
   the assumption in play is one host with everything under paths, and it is an assumption rather
   than a decision. M1 already places the client and the API on one origin, so what is open here is
   only whether a third kind of route joins them.

## M9 — it works with no network

1. [How does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md)
   — the precache list is a build output, so this waits on M1's build choice.
2. [How long must offline play survive?](how-long-must-offline-play-survive.md)
3. [Is the player shown anything about the network?](is-the-player-shown-anything-about-the-network.md)
4. [How do we exercise offline, throttled and backgrounded conditions?](how-do-we-exercise-offline-throttled-and-backgrounded-conditions.md)
   — [../constraints.md](../constraints.md) records that the storage failures do not reproduce in a
   desktop browser, so the conditions this milestone is about are the hardest ones to create on
   purpose. It sits here rather than at M2 because there is nothing offline to exercise until now.

## M10 — sudoku is finished, in guest mode

Everything a guest gets: notes, undo, completion, whatever hints turn out to be.

1. [Are hints in scope?](are-hints-in-scope.md)
2. [What interactions must the grid support?](what-interactions-must-the-grid-support.md) — notes,
   undo, drag-select, keyboard navigation, highlighting.
3. [Is difficulty graded, and does a grade promise anything?](is-difficulty-graded-and-does-a-grade-promise-anything.md)
4. [What makes a puzzle a joy to solve?](what-makes-a-puzzle-a-joy-to-solve.md)
5. [Is screen reader support in scope for v1?](is-screen-reader-support-in-scope-for-v1.md) — the
   structural and keyboard halves are already settled by
   [ADR-0013](../decisions/0013-every-puzzle-cell-is-a-focusable-labelled-element.md) and
   [ADR-0014](../decisions/0014-all-play-is-reachable-from-the-keyboard-alone.md); what is left is
   what a cell announces.

## M11 — the running system reports its own failures

M2 built what checks a change before it ships. These are for after it has shipped, and they need what
M2 did not have: a store with rows in it, a deployed thing with traffic, and a product somebody could
be using. They sit before the guest durability work below because the whole question there is whether
players are losing work, and nothing currently could tell us either way.

1. [How do we know the deployed app is serving?](how-do-we-know-the-deployed-app-is-serving.md) — a
   static client loading from cache hides a dead API for a long time.
2. [How is a bad deploy noticed and undone?](how-is-a-bad-deploy-noticed-and-undone.md) — the deploy
   is the moment a working system becomes a broken one.
3. [What are the server's vitals, and who watches them?](what-are-the-servers-vitals-and-who-watches-them.md)
   — the ordinary ones, decided rather than inherited from whatever the platform happens to show.
4. [What is worth being woken up for?](what-is-worth-being-woken-up-for.md) — an alert nobody acts on
   trains everyone to ignore all of them, and a solo maintainer has no rotation.
5. [How is a slow request diagnosed after the fact?](how-is-a-slow-request-diagnosed-after-the-fact.md)
   — [../constraints.md](../constraints.md) records that a stalled connection throws no error, so
   something slow is invisible unless it was instrumented before it happened.
6. [How would we learn a player lost progress?](how-would-we-learn-a-player-lost-progress.md) — the
   motivating case in the observability theme of
   [the guarantees README](../guarantees/README.md): it produces
   no error, no crash and no complaint.
7. [What invariants hold at runtime, and what checks them?](what-invariants-hold-at-runtime-and-what-checks-them.md)
   — the correctness theme in [the guarantees README](../guarantees/README.md) names "a partial write is never
   observable" and "the board on screen always matches the board in storage" as candidate promises,
   and neither is checkable unless something asserts it where it can fail.
8. [What invariants hold over stored data, and how are they audited?](what-invariants-hold-over-stored-data-and-how-are-they-audited.md)
   — a different question: not what one write asserts, but what stays true across every row. A
   request path only ever sees its own rows.
9. [How would we notice a problem nobody predicted?](how-would-we-notice-a-problem-nobody-predicted.md)
   — everything above tests a failure someone imagined.
10. [Can failure conditions be injected deliberately?](can-failure-conditions-be-injected-deliberately.md)
    — write failures that misidentify their own cause, IndexedDB absent under Lockdown Mode, a
    connection that stalls while reporting as connected. Every one is a code path that never executes
    unless it is forced to.
11. [Is the store's backup restorable?](is-the-stores-backup-restorable.md) — an untested restore is
    a belief.

## M12 — a guest's work survives eviction

The point at which a guest has something worth keeping and the browser is the only thing keeping it.
It sits after M10 because the size of the problem is set by how much a guest has accumulated,
and after M11 because nothing before that could tell us whether work is being lost. It sits
before signing in because the whole question is what a guest gets _without_ an account.

1. [Does a guest see anything that accumulates?](does-a-guest-see-anything-that-accumulates.md) — the
   product question that sizes everything below. A board's value decays with absence; a streak's does
   not.
2. [How long does a guest's work last?](how-long-does-a-guests-work-last.md) — the bound itself.
3. [Is guest recovery worth building?](is-guest-recovery-worth-building.md) — the mechanism. Its
   feasibility depends on M1 having held same-origin open.
4. [Is home-screen install required for durability?](is-home-screen-install-required-for-durability.md)
   — the only confirmed mitigation, and it cannot be required of anyone.

## M13 — a player can sign in

1. [Do privacy regulations apply?](do-privacy-regulations-apply.md) — first, because it prices
   everything else here.
2. [Are there user accounts?](are-there-user-accounts.md)
3. [How does a second device recognise the same person?](how-does-a-second-device-recognise-the-same-person.md)
   — likely the same question as the one above; resolve whether they merge before answering either.
4. [How long does a signed-in player's work last?](how-long-does-a-signed-in-players-work-last.md)
5. [Is the guest record the same shape as the account record?](is-the-guest-record-the-same-shape-as-the-account-record.md)
   — decided here rather than at M12, because it is a claim about both records at once.
6. [Does the server understand puzzle content?](does-the-server-understand-puzzle-content.md)

## M14 — work follows a player between devices

1. [Is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md)
2. [Can two devices edit the same board at once?](can-two-devices-edit-the-same-board-at-once.md)
3. [What happens to a losing write when syncing?](what-happens-to-a-losing-write-when-syncing.md) —
   a losing write needs two writers, so this does not arise until the two above are answered.
4. [How does a device know its board is behind?](how-does-a-device-know-its-board-is-behind.md) — a
   different failure from the one above and easy to mistake for it. No write loses; both copies are
   legitimate; the player simply resumes from an older board on a device that cannot tell it is
   older. It is the standing cost of the client authority
   [ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) chose, and it becomes
   reachable the moment a second device does.
5. [How much unsynced work is acceptable?](how-much-unsynced-work-is-acceptable.md)
6. [What wins when battery and durability conflict?](what-wins-when-battery-and-durability-conflict.md)
7. [What does the server do with puzzle state?](what-does-the-server-do-with-puzzle-state.md)

## M15 — the puzzles are ours

- [Which games come after sudoku and star battle?](which-games-come-after-sudoku-and-star-battle.md)

## M16 — something is paid for

1. [Is there a paid tier?](is-there-a-paid-tier.md)
2. [What is the acceptable running cost?](what-is-the-acceptable-running-cost.md)
3. [What load should the server handle?](what-load-should-the-server-handle.md)
4. [How much downtime is acceptable?](how-much-downtime-is-acceptable.md)
5. [How is the server operated?](how-is-the-server-operated.md) — its size is set entirely by M1's
   hosting choice: a managed platform supplies most of this and a bare machine supplies none of it.

## Blocking nothing yet

Real, and nothing is waiting on them. Several are research rather than choices.

[How long does Safari really keep our storage?](how-long-does-safari-really-keep-our-storage.md),
[how does Android evict stored data?](how-does-android-evict-stored-data.md),
[what are the real network conditions on transit routes?](what-are-the-real-network-conditions-on-transit-routes.md),
[what do existing puzzle apps do about offline play?](what-do-existing-puzzle-apps-do-about-offline-play.md)
— research.
[How long until a stalled connection surfaces as an error?](how-long-until-a-stalled-connection-surfaces-as-an-error.md),
[how would we verify progress is never lost?](how-would-we-verify-progress-is-never-lost.md),
[what must we know about how the app is used?](what-must-we-know-about-how-the-app-is-used.md),
[what wins when correctness and latency conflict?](what-wins-when-correctness-and-latency-conflict.md),
[does craft enjoyment ever outrank user experience?](does-craft-enjoyment-ever-outrank-user-experience.md).

[What belongs on the landing page?](what-belongs-on-the-landing-page.md) — nothing waits on it, and
it becomes real the moment the app is shown to anyone who has not been told what it is. Placed here
rather than at a milestone because no milestone in this list is the one where somebody arrives.

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
same three words [../constraints.md](../constraints.md) uses — _Measured_, _Sourced_, _Reasoned_ —
plus a fourth this folder needs and that file does not:

- **_Unverified — no source recorded._** Somebody wrote it down and nobody can say why it is true.
  This is the most useful tag in the set, because an unsourced number reads exactly like a sourced
  one and this is what tells them apart. Several arrived here from legacy documents and none of them
  should decide anything.

A finding that is a judgement, a product opinion, or an implication for the options here carries no
tier, because there is nothing to have established.

A finding may record what a standard _implies for these options_; it may not restate the standard
itself. The first shifts a decision and belongs here. The second is a weaker local copy of a rule
already in force, competing with the real one for whoever finds it first.

**Findings should say when a decision would close a door**, and that is the one forward-looking claim
they are for. It is not sequencing — it does not say what to answer first — it says what stops being
reachable. There is no register of open doors: a future worth keeping reachable is kept reachable by
a record in [../decisions/](../decisions/) that says what is now binding, and a list of them
elsewhere would be a second copy nobody updates.

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
