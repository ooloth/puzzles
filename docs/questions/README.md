---
updated: 2026-10-12
update_when: a decision is made, a milestone changes, a question is split, or a requirement changes
decays: fast
status: active
---

# Questions

The sibling of [../decisions/](../decisions/): the decisions not yet made, arranged by the milestone
that first needs them.

A directory listing of this folder is the full inventory, since every filename asks its question
plainly. What this file adds is **what has to be shipped next and which questions stand in the way**.
It is meant to get shorter as questions are answered and slices ship.

## Start here

**Read [../problem.md](../problem.md) and [../guarantees/](../guarantees/) in full before deciding
what to work on.** Everything below is downstream of them.

**Then work the current milestone**, the lowest-numbered one with anything still listed. Milestones
are numbered in the order they are built. Only the current milestone is broken into slices; the rest
are lists of the questions each first needs. When a milestone's list empties, the next one becomes
current and is broken into slices before work on it starts.

**How to read a slice.** Each is something you can run and look at. Under it, each **Must answer**
names a question that blocks it, with an "or else" clause saying what goes wrong in that slice
without the answer. What is already settled is the listing of [../decisions/](../decisions/), with
the facts in [../constraints.md](../constraints.md), and neither is repeated here.

**A question appears once**, under the milestone that must answer it. A slice that takes a default
meanwhile says so in its commit, not here.

**An issue is filed once nothing in its entry is still a Must answer.** A slice with no issue is
normal, and nothing here records status. A slice's entry is deleted once its issue closes, and the
slices left keep their numbers, so a list that does not start at 1 is not missing anything. A
milestone is finished when its list is empty.

How a milestone's list is built and kept, and how a question file is written, are in
[milestone-lists.md](../../.claude/skills/make-next-decision/milestone-lists.md) and
[question-files.md](../../.claude/skills/make-next-decision/question-files.md).

## M1 — "Hello!" is live

A deployed skeleton: a client, an endpoint answering one route with a hard-coded response, and
nothing else. No database, no puzzle, no features.

**What a visitor sees until players arrive.** From slice 5 the deployment serves
`pencilpuzzles.app`. Its page is a holding page, worded by the maintainer when slice 4 is built, with
the endpoint's answer in small type so a deploy can still be checked by looking. Every response
carries `X-Robots-Tag: noindex`, and `robots.txt` disallows everything. Both go when the landing page
at M11 replaces them.

4. **Both halves are deployed on a host.**
   - **Must answer:** [is-node-installed-on-the-host-or-carried-in-each-release](is-node-installed-on-the-host-or-carried-in-each-release.md) — or else slice 4's setup installs Node one way by default, which fixes what a release contains before slice 6's pipeline is designed to build it, and what a rollback at M10 restores: with Node on the host, a rollback keeps today's runtime under yesterday's code
5. **The deployment answers at an address we control.**
   - **Must answer:** [how-does-the-domain-reach-the-deployment](how-does-the-domain-reach-the-deployment.md) — or else a proxy or CDN in front changes what the browser treats as the origin, which is the same silent Safari failure reached by a different route. Costs a redeploy plus whatever sits in front
6. **A change made locally reaches the deployment.**
   - **Must answer:** [what-deploys-the-code](what-deploys-the-code.md) — or else the first deploy is done by hand and stays that way, and every later milestone verifies against something nobody can reproduce. Costs a re-scaffold, and it is what [how is a bad deploy noticed and undone?](how-is-a-bad-deploy-noticed-and-undone.md) at M10 builds on

## M2 — a grid you can fill in

A puzzle hard-coded in the client, rendered as a grid. Select a cell, enter a digit, see it. In
memory only; nothing survives a reload. Deployed the way M1 deploys.

1. [How is the app styled?](how-is-the-app-styled.md) — with the renderer settled at
   [ADR-0038](../decisions/0038-the-renderer-is-react.md), which ships no styling of its own, so the
   styling toolchain is a choice here rather than something React brings.
2. [How does a player enter a digit?](how-does-a-player-enter-a-digit.md) — bounded by
   [ADR-0014](../decisions/0014-all-play-is-reachable-from-the-keyboard-alone.md), which rules out a
   gesture with no keyboard form.
3. [What latency budget makes a move feel immediate?](what-latency-budget-makes-immediately-checkable.md)
   — after the above, since the budget covers the input path and what an input is comes first.
4. [What implements the client's state?](what-implements-the-clients-state.md) — the first puzzle
   state held in memory arrives here. How much a library could supply depends on the storage
   mechanism, undo depth and state shape at M5, so this is answered with those in view rather than
   ahead of them.

## M3 — a change can be checked before it ships

By here the app deploys and a player can fill in a grid, and either can break without anyone
noticing. Everything after this is verified using whatever gets built here, so building it now,
while little is built on the stack, is when it is cheapest and when it pays back most.

Each entry is a maintainer's problem rather than a thing a project ought to have, and each is the
difference between checking a change in a minute and checking it in an afternoon. They are used many
times a day, by the maintainer and by an agent working without them. This milestone produces nothing
a player can see, which is why it has to be a milestone rather than a habit.

**Tooling that checks something a later milestone creates waits for that milestone.** Reaching the
store in local development sits at M4, where the store first exists. Resetting state, loading an
arbitrary board, driving a real device and the cross-browser matrix are here, because the board a
player can touch exists from M2. Reaching and hardening the server sits at slice 4 of M1, because
the machine is on the public internet from then.

1. [What runs the tests?](what-runs-the-tests.md) — `node --test` runs them today as a stopgap.
2. [What runs the checks on every change?](what-runs-the-checks-on-every-change.md) — `check-docs.py`
   already exists and nothing runs it, which is the shape of the whole problem.
3. [Is server TypeScript transpiled or stripped?](is-server-typescript-transpiled-or-stripped.md) —
   It sits here rather than at M1 because this is the first point it cannot be deferred further.
   Nothing in M1 needs a construct Node cannot strip, and
   [ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md) means the runtime
   enforces the erasable subset for free: anything else fails at execution, so the constructs cannot
   spread unnoticed while this is open. What changes here is that a test runner and the repo scripts
   start executing the same source, and a second executor is the thing that makes "what transforms
   it" a real choice rather than a default. Sits after the three above because they name the
   executors.
4. [What pins the toolchain versions across machines?](what-pins-the-toolchain-versions-across-machines.md)
   — here rather than at M1 for the same reason. M1 runs on one machine, where an unstated
   version is a fact rather than a disagreement. The second machine is the CI runner that
   [what runs the checks on every change?](what-runs-the-checks-on-every-change.md) creates, and a
   pin with only one machine to bind is a file nothing reads. It carries the artifact
   [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) says is owed, and
   the rule at [ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md)
   supplies the Node value it has to hold. The package manager is
   [ADR-0032](../decisions/0032-the-package-manager-is-pnpm.md). On the development machine the
   `pnpm` command is Corepack's shim, which reads `packageManager` and runs the version it names, per
   [../gotchas.md](../gotchas.md); whether pnpm installed without Corepack switches itself the same
   way has not been observed here, and both are mechanisms this question has to weigh.
5. [What proves a vertical slice works end to end?](what-proves-a-vertical-slice-works-end-to-end.md)
   — every milestone here claims to be observable, and nothing says what observing one consists of.
   This decides whether the checks in [../../CONTRIBUTING.md](../../CONTRIBUTING.md) become something
   that runs.
6. [How is the app run locally the way it runs deployed?](how-is-the-app-run-locally-the-way-it-runs-deployed.md)
   — a bug that only appears deployed costs a deploy cycle per attempt to reproduce it.
   [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
   settled that verification happens in a production-like local run and only the fast loop may
   differ. What is left is building that run: which differences it closes, how, and what command
   runs it.
7. [How is the system reset to a known state?](how-is-the-system-reset-to-a-known-state.md) — two runs
   of a check are only comparable if they start from the same place, and the first state worth
   resetting is the board M2 creates.
8. [How does anyone load an arbitrary board state?](how-does-anyone-load-an-arbitrary-board-state.md)
   — reaching a nearly-finished grid or a specific violation by playing to it is the main thing
   standing between someone and checking whether a change works.
9. [How is the app driven on a real device?](how-is-the-app-driven-on-a-real-device.md) — the primary
   platform is a phone, M2 is the first milestone with input worth checking on one, and
   [../constraints.md](../constraints.md) records a streaming bug that reproduced only on real iOS
   Safari over a real network.
10. [How is this tested across browsers and platforms?](how-is-this-tested-across-browsers-and-platforms.md)
   — how many devices and which, and what runs where. The matrix itself is settled by
   [ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md);
   this question is the other half, which is what to run it on. It carries more weight than it looks:
   [the app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md)
   is promised against compatibility data rather than observation until this lands, and the API half
   of the floor is only partly checkable by any tool.

## M4 — a puzzle comes from the store

One seeded puzzle, written to the store by hand, read back by the endpoint, and shown in M2's grid
in place of the hard-coded puzzle. No generator. This is where connection handling becomes real, and
where [ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)'s
queryability stops being a promise about a store nobody has built.

It comes after the grid, so the client is built against a hard-coded puzzle for two milestones. Later
than this, the store would be met for the first time with a finished game attached.

**Operating the store waits for M11.** Until players arrive the store holds only puzzles, which can
be written again, so losing a row costs nothing. Backups, durability settings, migrations, recovery
from a lost machine, deploys that leave the store alone, secrets and the machine's region all become
real with the first player's data, and they sit at M11, where players arrive. So does whether
puzzles and player records share one store, since player records first arrive there.

1. [What is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) — only enough of it
   to write one row and read it back. The full answer is not needed until M6.
2. [What crosses the client/server boundary?](what-crosses-the-client-server-boundary.md) — the first
   response with content in it is the first contract, so this is where the format is set.
3. [How does the client load data from the server?](how-does-the-client-load-data-from-the-server.md)
   — after the boundary above, which is its first input. This is the first fetch of content that
   becomes the board, which [ADR-0037](../decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md)
   keeps out of the renderer, so M1's fetch of "Hello!" inside a view is not the pattern to copy. What
   implements the client's state is answered at M2 and prefetching at M8, so this may need to settle
   only where fetched content enters the client and leave when it is fetched to M8.
4. [Which driver reads and writes the store?](which-driver-reads-and-writes-the-store.md) — the
   first row is here. Its *openness* is a caveat on M1: the argument that the store does not narrow
   the runtime runs entirely through `node:sqlite`, which no record has chosen. The durability
   settings applied through it wait for M11.
5. [How is the store reached in local development?](how-is-the-store-reached-in-local-development.md)
   — the store first exists here, so this is the first milestone whose daily loop opens it. What M1
   needed was only the comparison of what each store shape would cost in the daily loop, and that is
   a finding recorded against
   [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md).

## M5 — the board survives a reload

The first durability promise anything actually keeps.

1. [Is undo in scope, and how far back?](is-undo-in-scope-and-how-far-back.md) — depth is what
   decides the shape below, so it comes first even though undo itself is an M9 feature.
2. [What can a player do with no network?](what-can-a-player-do-with-no-network.md) — one board or a
   browsable archive, which sets storage volume by orders of magnitude.
3. [Is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md) — a
   log of moves is also the raw material for recording play at M11, so this is answered with that
   use in view.
4. [Does the floor cover iOS 15 devices that never installed their updates?](does-the-floor-cover-ios-15-devices-that-never-installed-their-updates.md)
   — whether the floor is Safari 15.0 or 15.6, which decides whether a storage or cross-tab design
   may use the APIs Safari added at 15.2 and 15.4.
5. [Which client storage mechanism holds a player's work?](which-client-storage-mechanism.md) — the
   one stack choice with no clean migration path.

## M6 — the rules run

Illegal moves are recognised, and a finished board is recognised as finished.

1. [What is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) — the full answer,
   now that something depends on it.
2. [How is the codebase laid out?](how-is-the-codebase-laid-out.md) — what remains of it after
   [ADR-0034](../decisions/0034-the-repository-is-one-package.md) settled the package count. Two
   parts land here: how the rules module is reached, decided by the first import of it, which is
   this milestone; and what lives inside `src/rules/`, decided once there are rules to organise.
   Its third part, whether the generator is a third deployable, waits for M7. Nothing before this
   milestone imports the rules module, which is why none of it blocks M1.

## M7 — the puzzles are real

Not one seeded row. Something published on a rhythm, fetched and rendered.

1. [Does v1 ship generated or seeded puzzles?](does-v1-ship-generated-or-seeded-puzzles.md) — first, because
   the cost of generation and when it runs only matter for v1 if v1 ships generated puzzles.
2. [How expensive is puzzle generation?](how-expensive-is-puzzle-generation.md) — measurement, and
   the questions below turn on it when the answer above is "generated".
3. [Is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md)
4. [Can more than one puzzle be published per day?](can-more-than-one-puzzle-be-published-per-day.md)
   — beside the question above, which sets the rhythm, and a puzzle keyed by date alone can never
   have a sibling. M4 keys its seeded row before this is answered, and until players arrive at M11
   re-keying rewrites only puzzles that can be written again.
5. [Are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md)

## M8 — it works with no network

1. [How does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md)
   — narrowed by [ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md),
   which settled that a service worker answers the navigation. What is left is everything else: what
   the precache holds besides the document, how the manifest is generated, and what strategy anything
   other than a navigation uses. The manifest is a build output of
   [ADR-0029](../decisions/0029-the-client-bundler-is-vite.md)'s Vite build. The fallback to the entry document excludes `^/api/`, per
   [ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md).
2. [How long must offline play survive?](how-long-must-offline-play-survive.md)
3. [Is the player shown anything about the network?](is-the-player-shown-anything-about-the-network.md)
4. [How do we exercise offline, throttled and backgrounded conditions?](how-do-we-exercise-offline-throttled-and-backgrounded-conditions.md)
   — [../constraints.md](../constraints.md) records that the storage failures do not reproduce in a
   desktop browser, so the conditions this milestone is about are the hardest ones to create on
   purpose. It sits here rather than at M3 because there is nothing offline to exercise until now.
5. [Is a puzzle fetched before it is needed?](is-a-puzzle-fetched-before-it-is-needed.md) — the only
   answer that removes the most common wait in the product rather than dressing it, per
   [../problem.md](../problem.md) under "Where a player waits". It sits here rather than at M7 because
   prefetching is an offline capability and needs a rhythm to fetch ahead of, which M7 establishes.
6. [Can a page loaded before a deploy still fetch its files after it?](can-a-page-loaded-before-a-deploy-still-fetch-its-files-after-it.md)
   — the service worker serves an entry document from an earlier release, so its assets are asked
   for after deploys it never saw. It sits here because before this milestone the window is the
   milliseconds between the entry document and its assets. A dynamic import added earlier widens
   that window and brings it forward.

## M9 — sudoku is finished, in guest mode

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

## M10 — the running system reports its own failures

M3 is where checking a change before it ships is built. These report a failure after a change has
shipped, and they are what has to be in place before anyone arrives at M11: whether the app is
serving, whether a deploy broke it, whether a player lost progress or could, and whether the server
has stopped. They sit before M11 because the whole question there is whether players are losing
work, and nothing currently could tell us either way. What needs real traffic to mean anything, such
as vitals, alerting and diagnosing slow requests, waits for players under "Blocking nothing yet".

1. [How do we know the deployed app is serving?](how-do-we-know-the-deployed-app-is-serving.md) — a
   static client loading from cache hides a dead API for a long time.
2. [How is a bad deploy noticed and undone?](how-is-a-bad-deploy-noticed-and-undone.md) — the deploy
   is the moment a working system becomes a broken one.
3. [How would we learn a player lost progress?](how-would-we-learn-a-player-lost-progress.md) — the
   motivating case in the observability theme of
   [the guarantees README](../guarantees/README.md): it produces
   no error, no crash and no complaint.
4. [How would we verify progress is never lost?](how-would-we-verify-progress-is-never-lost.md) —
   backgrounding, tab kill and OS memory purge need real devices or an instrumented harness, and
   until one exists, nothing checks that
   [reopening restores the board in progress with notes and selection](../guarantees/reopening-restores-the-board-in-progress-with-notes-and-selection.md)
   holds through them. Beside the
   question above: that one notices a loss in production, and this one shows before players arrive
   that none happens.
5. [What invariants hold at runtime, and what checks them?](what-invariants-hold-at-runtime-and-what-checks-them.md)
   — the correctness theme in [the guarantees README](../guarantees/README.md) names "a partial
   write is never observable" and "the board on screen always matches the board in storage" as
   candidate promises. Both are ways work is lost, and neither is checkable unless something asserts
   it where it can fail.
6. [How is the server operated?](how-is-the-server-operated.md) — noticing the server has stopped,
   and alerting on a failed update. It sits here because noticing an outage is this milestone's
   theme. systemd restarts the app, per
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md), and the
   rest is ours.

## M11 — players arrive, and a guest's work and play are kept off the device

The point at which the app is offered to players, and so the point at which everything owed to a
player's data has to hold. A guest has something worth keeping, the browser is the only thing
keeping it, and play is recorded from the first player onward, per [../problem.md](../problem.md).
It sits after M9 because the size of the problem is set by how much a guest has accumulated, and
after M10 because nothing before that could tell us whether work is being lost. It sits before
signing in because the whole question is what a guest gets _without_ an account.

**Players arriving here is a sketch, not a record.**
[At which milestone do players first use the app?](at-which-milestone-do-players-first-use-the-app.md)
is still open, and moving this point moves every question below that is keyed on players.

1. [Do privacy regulations apply?](do-privacy-regulations-apply.md) — first, because recording play and
   keeping a guest's work off the device both hold data about people from the first player, and the
   answer prices everything below.
2. [What must we know about how the app is used?](what-must-we-know-about-how-the-app-is-used.md) —
   only what is recorded. Play that was never recorded cannot be analysed later, so the recording is
   settled before players arrive and the analysis can wait.
3. [Does a guest see anything that accumulates?](does-a-guest-see-anything-that-accumulates.md) — the
   product question that sizes everything below. A board's value decays with absence; a streak's does
   not.
4. [How long does a guest's work last?](how-long-does-a-guests-work-last.md) — the bound itself.
5. [Is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md) — the
   maintainer has said it comes after v1. What is left is whether v1 mints a stable identifier on
   first visit so a later account can claim it, and that is the same token guest recovery below
   would use, so it is answered first.
6. [Is guest recovery worth building?](is-guest-recovery-worth-building.md) — the mechanism. Its
   feasibility depends on M1 having held same-origin open.
7. [Is home-screen install required for durability?](is-home-screen-install-required-for-durability.md)
   — the only confirmed mitigation, and it cannot be required of anyone.
8. [What happens after a sync gives up?](what-happens-after-a-sync-gives-up.md) — a wait that ends
   has to end in something, and the player cannot be told, because
   [the player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md)
   forbids it. The first write off the device happens here, so this is the first sync that can give
   up. [The durable copy stops being written](../failure-modes/the-durable-copy-stops-being-written.md)
   is what happens if it is never answered.
9. [Are puzzles and player records in one store?](are-puzzles-and-player-records-in-one-store.md) —
   first among the store questions below, because it decides whether the first player record goes
   into the puzzles' store or a second one, and everything below assumes an answer. Before here the
   store holds only puzzles. It does not pin the generator either way: a generator can publish
   through the server's API and run anywhere under either store locality.
10. [Which region does the machine run in?](which-region-does-the-machine-run-in.md) — every wait a
    player has includes the round trip to the one machine
    [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) allows, and nothing
    says where the players are. Before here, moving the machine moves only puzzles that can be
    written again. From here it moves players' work too.
11. [How do secrets reach the running system?](how-do-secrets-reach-the-running-system.md) — the first
    real secret arrives with the store's off-machine copy, which is first worth having here.
    [What deploys the code?](what-deploys-the-code.md) records that M1 needs none.
12. [What durability settings does the store run
    with?](what-durability-settings-does-the-store-run-with.md) — journal mode, synchronous level and
    busy timeout decide whether a committed write survives a power cut, which
    [ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) deliberately left open. Answered
    here because the first player's data is the first thing that could be lost, and the question is
    framed to test whether the safest setting costs anything at all rather than to position a dial.
13. [How is the store backed up?](how-is-the-store-backed-up.md) — the first player's data exists
    here, so this is where a backup stops being hypothetical. It is set up alongside the first data
    worth keeping, and the named precedent for deferring it is an operational inventory of roughly
    twenty-five tasks written for exactly this architecture with no backup or restore procedure in
    it.
14. [Is the store's backup restorable?](is-the-stores-backup-restorable.md) — an untested restore is
    a belief. After the backup above, which is what it rehearses.
15. [How much downtime is acceptable?](how-much-downtime-is-acceptable.md) — while the server is
    down nobody starts a puzzle they have not already got, per [../problem.md](../problem.md) under
    "Where a player waits", so this is a product target. The recovery question below is the main
    lever on how long an outage lasts and needs this target first.
16. [How is the store recovered when the machine is lost?](how-is-the-store-recovered-when-the-machine-is-lost.md)
    — [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
    commits to surviving host replacement and the machine cannot deliver that alone. This is the main
    lever on how long an outage lasts, and it is ours rather than a provider's.
17. [How does a deploy avoid disturbing the store?](how-does-a-deploy-avoid-disturbing-the-store.md)
    — there is no player data before here, so nothing worth keeping can be disturbed. Two processes
    on one machine can share the file while a deploy overlaps them, as measured in the eighth and
    twelfth passes of the hosting question, read with `git show
    ed7f54e:docs/questions/where-does-this-run.md`; what must stay single is the replicator. The
    rest — checkpointing on exit, replication across a restart, rolling back past a migration — is
    real from the first player's data.
18. [How does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md) —
    without failing a request in flight, which
    [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)'s
    property 1 requires from here. Until then a deploy restarts the app, and a request that fails
    reaches only the maintainer. The spikes observed 39 POSTs failing with 502 across a restart.
19. [What does a browser below the floor see?](what-does-a-browser-below-the-floor-see.md) — what
    keeps
    [a device too old to run the app is told so rather than shown a blank screen](../guarantees/a-device-too-old-to-run-the-app-is-told-so-rather-than-shown-a-blank-screen.md).
    The fallback is carried by the entry document the build already produces, per
    [ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md),
    so adding it here costs no more than adding it at M1. It sits here because nobody is below the
    floor until there are players. Its wrong answer is invisible, since every browser above the
    floor shows the app either way, so it is settled by opening the built document in a browser
    below the floor rather than by reading.
20. [At what hour does the machine apply updates and reboot?](at-what-hour-does-the-machine-apply-updates-and-reboot.md)
    — the hour only matters once someone starts a session at it, which is from here, and it must
    avoid the release hour
    [is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md)
    may set at M7. Until then Debian's default hour harms nobody.
21. [Does the app send a Content Security Policy, and how strict is it?](does-the-app-send-a-content-security-policy-and-how-strict.md)
    — React needs neither `eval` nor injected inline styles, so nothing in the build waits on it.
    [ADR-0053](../decisions/0053-caddy-serves-the-clients-files-from-the-release-on-disk.md) settles
    that Caddy serves the client's files, so the header has a home, and a public launch is the
    latest point to decide it.
22. [What belongs on the landing page?](what-belongs-on-the-landing-page.md) — it becomes real the
    moment the app is shown to anyone who has not been told what it is, which is here. It replaces
    M1's holding page, and launch removes the `noindex` header and the `robots.txt` that blocks
    crawlers.
23. [Which encodings are the client's files precompressed in, and what writes them?](which-encodings-are-the-clients-files-precompressed-in-and-what-writes-them.md)
    — a first visit sends the client uncompressed until it is answered, which costs nobody before
    players arrive and costs every one of them after.

## M12 — a player can sign in

1. [Are there user accounts?](are-there-user-accounts.md)
2. [How does a second device recognise the same person?](how-does-a-second-device-recognise-the-same-person.md)
   — likely the same question as the one above; resolve whether they merge before answering either.
3. [How long does a signed-in player's work last?](how-long-does-a-signed-in-players-work-last.md)
4. [Is the guest record the same shape as the account record?](is-the-guest-record-the-same-shape-as-the-account-record.md)
   — decided here rather than at M11, because it is a claim about both records at once.
5. [Does the server understand puzzle content?](does-the-server-understand-puzzle-content.md)

## M13 — work follows a player between devices

1. [Can two devices edit the same board at once?](can-two-devices-edit-the-same-board-at-once.md)
2. [What happens to a losing write when syncing?](what-happens-to-a-losing-write-when-syncing.md) —
   a losing write needs two writers, so this does not arise until cross-device resume is in scope
   and the question above is answered.
3. [How does a device know its board is behind?](how-does-a-device-know-its-board-is-behind.md) — a
   different failure from the one above and easy to mistake for it. No write loses; both copies are
   legitimate; the player simply resumes from an older board on a device that cannot tell it is
   older. It is the standing cost of the client authority
   [ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) chose, and it becomes
   reachable the moment a second device does.
4. [How much unsynced work is acceptable?](how-much-unsynced-work-is-acceptable.md)
5. [What wins when battery and durability conflict?](what-wins-when-battery-and-durability-conflict.md)
6. [What does the server do with puzzle state?](what-does-the-server-do-with-puzzle-state.md)

## M14 — the puzzles are ours

1. [Which games come after sudoku and star battle?](which-games-come-after-sudoku-and-star-battle.md)

## M15 — something is paid for

1. [Is there a paid tier?](is-there-a-paid-tier.md)
2. [What load should the server handle?](what-load-should-the-server-handle.md)

## Blocking nothing yet

Real, and nothing is waiting on them. Several are research rather than choices.

[What must the client and the server each be able to do?](what-must-the-client-and-server-be-able-to-do.md)
— the property list toolchain choices are scored against. The choices it served are made; what is
left open is which `resolves_into` value its shape deserves.

[How is the questions index kept readable in one pass?](how-is-the-questions-index-kept-readable-in-one-pass.md)
— this file fits in one read again (about 39KB on 2026-10-12) since its conventions moved to the
`make-next-decision` skill, and nothing yet stops it growing back.

[Can the gotchas be prevented rather than documented?](can-the-gotchas-be-prevented-rather-than-documented.md)
— each trap in [../gotchas.md](../gotchas.md) might become a command in the contributing guide, which
would leave that file with nothing to hold.

[How long does Safari really keep our storage?](how-long-does-safari-really-keep-our-storage.md),
[how does Android evict stored data?](how-does-android-evict-stored-data.md),
[what are the real network conditions on transit routes?](what-are-the-real-network-conditions-on-transit-routes.md),
[what do existing puzzle apps do about offline play?](what-do-existing-puzzle-apps-do-about-offline-play.md)
— research.

[How long until a stalled connection surfaces as an error?](how-long-until-a-stalled-connection-surfaces-as-an-error.md),
[what wins when correctness and latency conflict?](what-wins-when-correctness-and-latency-conflict.md),
[does craft enjoyment ever outrank user experience?](does-craft-enjoyment-ever-outrank-user-experience.md).

[At which milestone do players first use the app?](at-which-milestone-do-players-first-use-the-app.md)
— the milestone list places players at M11 as a sketch, and no record settles it. Moving that
point moves the questions at M11 that are keyed on players.

[Does any page need markup a crawler can read?](does-any-page-need-markup-a-crawler-can-read.md) and
[do content and puzzle routes share an origin?](do-content-and-puzzle-routes-share-an-origin.md) —
both become real when a URL is first shared with someone, which is M11 at the earliest, and nothing
there waits on either.
No rendering choice forecloses crawler markup: a rebuild on publish and a single runtime-rendered
route are both additive, as
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md)
records. The client and the API share one origin, per
[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md), so what
is open on routes is only whether a third kind joins them.

**After players arrive.** These need real traffic to mean anything, and nothing before M11 waits on
them. M10 keeps only what has to report a failure before anyone arrives.

[What are the server's vitals, and who watches them?](what-are-the-servers-vitals-and-who-watches-them.md),
[what is worth being woken up for?](what-is-worth-being-woken-up-for.md),
[how is a slow request diagnosed after the fact?](how-is-a-slow-request-diagnosed-after-the-fact.md),
[what invariants hold over stored data, and how are they audited?](what-invariants-hold-over-stored-data-and-how-are-they-audited.md),
[how would we notice a problem nobody predicted?](how-would-we-notice-a-problem-nobody-predicted.md)
and [can failure conditions be injected deliberately?](can-failure-conditions-be-injected-deliberately.md)
— operating the system once people are using it.

[How is the schema migrated?](how-is-the-schema-migrated.md) — v1 can ship with a schema it never
migrates. [ADR-0002](../decisions/0002-launch-with-sudoku-then-star-battle.md) schedules the change
that forces the first migration, star battle, after launch, and that change is where this is needed.

[What gives the client's files a validator that changes only with their content?](what-gives-the-clients-files-a-validator-that-changes-only-with-their-content.md)
— a returning visit through the service worker revalidates the entry document and `sw.js` across
deploys, and Caddy's default validator changes with every copy. The cost is a full response where a
304 would do, never a wrong one, so it is a speed improvement that can follow players.

[How do analysis and play share one store?](how-do-analysis-and-play-share-one-store.md) — the scans
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) preserves are
long reads, and a long read blocks WAL checkpointing. Nothing is worth analysing until play has been
recorded for a while, and recording starts at M11, whose backup answer may already be the copy these
reads should run against.

[What format declares the browser floor?](what-format-declares-the-browser-floor.md) — nothing in
v1 needs a shared format: the build names the floor in its own config, and a floor left low breaks
no promise. It becomes real when a second tool has to read the floor, and the format has to suit the
tools that read it, so it is chosen with them.

[How do we learn the browser floor can rise?](how-do-we-learn-the-browser-floor-can-rise.md) —
nothing waits on it, because a floor left low breaks no promise. It becomes real when Apple stops
patching iOS 15, which nothing currently notices.

[Does a player see stats about their play?](does-a-player-see-stats-about-their-play.md) and
[can a player explore past puzzles?](can-a-player-explore-past-puzzles.md) — both are intent stated in
[../problem.md](../problem.md) that no record argues and no promise covers: "what they have solved,
and how they are doing", and a puzzle from any past day. They are here rather than at a milestone
because nothing waits on either, and because both are tracked to stop an infrastructure decision
foreclosing them without noticing. The archive question is the nearer of the two — it meets
[is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md) at M7
and [what can a player do with no network?](what-can-a-player-do-with-no-network.md) at M5, and
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) has already
constrained how an archive would be delivered.
