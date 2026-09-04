---
updated: 2026-09-03
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

**Then work M1 from the top.** Its slices are things you can run and look at, in the order you would
build them, each with the questions that block it. Only the current milestone is laid out that way —
the rest are bare question lists on purpose, for the reason given below.

## Building a milestone's list

Seven steps. Each one exists because skipping it produced a list that had to be rebuilt.

1. **Write the milestone's end state in one sentence.**
2. **List the observable slices between nothing and that end state.** Each is one product change you
   can run and look at. Build order, not risk order — the thing that renders before the thing that is
   served, the thing that is served before the thing that is deployed. Deploying is the last slice: a
   hosting choice made before anything exists to host is made against an imagined system.
3. **Under each slice, list the givens** — the records, promises and constraints already established
   that bear on *that* slice. Link each one. Where the link is to a large file, name the single
   invariant being relied on, one bullet per invariant.
4. **Under the givens, list the questions that must be worked.** A question blocks a slice if
   building without it would be **reversed**, not only if the work is impossible. Choosing a package
   manager before the runtime is settled is possible today and wrong tomorrow. The literal blockers
   are few; the reversal risks are what decide the order.

   **One label: Must answer**, whether the answer is a choice or a fact to go and find. A research
   question earns its own entry only where nothing else tracks it — where the question it informs
   records it under **Findings**, that is where it lives.

   **Every entry carries an "or else" clause: which later decision in this slice comes out wrong, and
   what unwinding it costs.** Two costs exist here. A **re-scaffold** is a day. A **migration of live
   player data** is not, and it is the only irreversible thing M1 can create. A question whose wrong
   answer costs a re-scaffold does little work at the front of a slice.

   Three things read as clauses and are not: that work cannot start, that the choice might be made
   carelessly, and a restatement of the topic. Each is true of every open question, so none
   distinguishes anything. Where a clause names a mechanism rather than a cost — "whichever is built
   first fixes the other two" — ask "so what?" until it reaches one.

   **If you cannot complete "slice N cannot be built without this because ___", it does not block
   slice N.**

   **Defer.** Every sequencing error in this file has moved a question earlier than it belonged, never
   later. An open question keeps its options and costs nothing. Where it is unclear whether something
   blocks a slice, it does not.

5. **Repeat givens and questions across slices.** Never cross-reference — no "as in slice 1". The
   repetition is what makes step 7 possible and what lets a reader audit one slice without holding
   the others in their head.
6. **Order the questions within a slice** by what has to be answered first. Where two constrain each
   other in both directions they are answered together, and each question file says so under **What
   would settle it**. That is the only place a dependency between questions is written down.
7. **Audit, and expect to move things.** A slice with several unrelated groups of givens is several
   slices. A slice that reads like the milestone restated is bundling. A question written as a given
   is a question — never a **Given**, whatever it is blocking. Read every "or else" clause and ask
   whether it names a consequence for *this slice* or merely describes the question; the second is
   the failure this audit is most likely to find, because it reads as a reason. Then count how many
   slices each question blocks: that orders the slices, and says nothing about the order inside one.

**Everything a milestone installs is permanent.** A tracer bullet is the real stack doing the
smallest thing it can do — not scaffolding to be replaced two milestones later. Provisional is not a
category: if a choice would be redone shortly after the milestone, it is missing an input or the
milestone is drawn in the wrong place. Placeholder *values* are fine; placeholder *choices* are not.

**Deferring is the default, and it is the point.** An unanswered question is optionality retained,
and everything learned before it must be answered is information the answer would otherwise be made
without. The skill this list is trying to capture is spotting the moment a question can no longer be
put off, and making it as narrow as possible when that moment arrives. Closing a door is clarifying
and irreversible, so the record that closes one says which one.

## Milestones below the current one stay unplanned

They are a list of questions grouped by the milestone that first needs them, and nothing more.
**Expanding one into slices and givens before it is next is planning against a system that does not
exist yet** — the slices are only knowable once the preceding milestone's decisions have landed, and
a plan built earlier gets rewritten rather than followed. It is the same argument as deferring a
decision: plan it when you know the most, which is as late as possible.

**Adding a question to a future milestone is not expanding it**, and is always welcome. A question
discovered now and parked where it belongs is what this file is for.

When a milestone becomes the next one, run the seven steps on it. Not before.

## This file and the issue tracker

**Each slice below is one GitHub issue**, per
[../decisions/0015-the-issue-tracker-is-github-issues.md](../decisions/0015-the-issue-tracker-is-github-issues.md)
and
[../decisions/0016-a-delivery-slice-is-an-issue-and-its-derivation-stays-in-docs.md](../decisions/0016-a-delivery-slice-is-an-issue-and-its-derivation-stays-in-docs.md).
The tracker holds what work exists and what state it is in. This file holds why — what each slice
rests on, what blocks it, and why they are in this order.

**So nothing here records status.** No checkboxes, no "done", no "in progress". Those change daily,
this file is already the fastest-decaying document in `docs/`, and a stale checkbox in a file whose
value is being trusted is worse than no checkbox.

**The slice title is the join key.** It appears here and in the issue, and nothing checks that the two
still match — `scripts/check-docs.py` cannot see the tracker. If they disagree, the tracker is right
about what work exists and this file is right about why.

## Housekeeping

**A question resolves into as many records as it contains decisions** — the separability test in
[../decisions/README.md](../decisions/README.md). It is deleted once nothing is left in it that a
record has not settled; mine it first, since findings graduate to
[../constraints.md](../constraints.md) and reasoning belongs in whichever record it argues for.
**Promises are written as they fall out of records**, on the decision template's checklist, rather
than committed to in advance.

`scripts/check-docs.py` checks what is fact rather than judgement: links resolve, every question
is referenced at least once from the lists below, no link points at a heading, no question file has
grown a sequencing section. A question deliberately appears under more than one milestone where it is
needed twice, so nothing checks for a single appearance.
It does not check the ordering, because a check that passed it would only make a wrong order look
verified.

**[../decisions/](../decisions/) is the list of what is settled, and it is not repeated here.** Every
record is titled by what it settled, so the listing is the checklist of constraints in force.

<!-- Template for a milestone. Links are shown as backticked pseudo-syntax so the checker does not
     try to resolve them; write them as real markdown links.

## M<N> — <the end state, in a few words>

<One sentence: what exists when this is done, and what deliberately does not.>

1. **<A slice you can run and look at.>**
   - **Given:** `[<record-promise-or-constraint>](<its-path>)`
   - **Given:** `[../constraints.md](../constraints.md)` — <the single invariant relied on>
     - **Must answer:** `[<question-filename>](<question-filename>.md)` — or else <what breaks in this slice>
     - **Must answer:** `[<question-filename>](<question-filename>.md)` — or else <what breaks in this slice>
2. **<The next slice.>**
   - **Must answer:** `[<question-filename>](<question-filename>.md)` — or else <what breaks in this slice>

Questions are always "Must answer", never "Given", whether the answer is a choice or a fact somebody
has to find. Every one carries an "or else" clause naming what breaks in *this slice* without it —
not what the question is about. Where a slice rests on no given, its questions sit at
the top level. Link text is the filename, so the list reads without opening anything.
-->

## M1 — "Hello!" is live

A deployed skeleton: a client, an endpoint answering one route with a hard-coded response, and
nothing else. No database, no puzzle, no features.

**M1 is a vertical slice through the whole system, not a front end with a stub behind it.** Both
halves ship, onto a host that has to satisfy the server and whatever its store turns out to need. The
client runs almost anywhere, so it is the half least able to discriminate between hosts and must not
be what selects one — which is why hosting is the fourth slice and not the first. The only throwaway
thing in M1 is the string the endpoint returns.

**The store does not order slice 1's questions. The toolchain does.** They were once ordered on the
claim that store locality constrains the runtime, and that claim is false: Node, Bun and Deno all ship
`node:sqlite` as a built-in, so the same data-access code runs on every runtime under either store
answer. What remains is a chain the question files state themselves — the runtime is answered together
with the HTTP handler, the package manager may be settled by consequence if the runtime ships one, and
the layout waits on whether that toolchain does workspaces. So the runtime is worked first, and not
because it is built first.

**Two of the three claims once bundled into the server's execution shape are settled.**
[ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md) records that nothing on
the request path scales to zero, and
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md) records that the
server does not run in a constrained isolate. What is left of that question is store locality, which
is why it now asks only that.

**Nothing in M1 turns on the maintainer's appetite for operating infrastructure.** That is a
short-term guess against a long-lived choice. These are decided on which option keeps the most
technical properties reachable — performance, safety, portability, and the ones not yet known to
matter. A question that cannot be settled without a preference says so rather than inventing a
derivation.

1. **A server answers one route, observed with curl, locally.**
   - **Given:** [0006-one-language-across-every-deployable](../decisions/0006-one-language-across-every-deployable.md)
   - **Given:** [0007-that-language-is-typescript](../decisions/0007-that-language-is-typescript.md)
   - **Given:** [0010-the-store-needs-a-host-so-this-system-has-a-server](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md)
   - **Given:** [0011-stored-play-data-can-be-analysed-not-just-retrieved](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)
   - **Given:** [0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)
   - **Given:** [0019-the-store-is-a-file-the-server-process-opens](../decisions/0019-the-store-is-a-file-the-server-process-opens.md)
   - **Given:** [0020-the-stores-engine-is-sqlite](../decisions/0020-the-stores-engine-is-sqlite.md) — and it narrows no runtime, since Node, Bun and Deno all ship `node:sqlite`
   - **Given:** [0024-the-entry-document-is-a-build-output-not-a-per-request-render](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) — so nothing forces a meta-framework's server here, and nothing excludes one either: the questions below choose on their own merits
     - **Must answer:** [what-runs-typescript-outside-the-browser](what-runs-typescript-outside-the-browser.md) — or else tooling is added that the runtime already supplies, or a host is chosen that will not run it. Costs a re-scaffold, not a migration
     - **Must answer:** [what-handles-http-requests-on-the-server](what-handles-http-requests-on-the-server.md) — or else the shape of a response is set by whatever the handler makes easiest, and [what crosses the client/server boundary?](what-crosses-the-client-server-boundary.md) at M3 inherits a contract nobody argued. Costs a re-scaffold of both halves' boundary. Answered together with the runtime above, which constrains it in both directions
     - **Must answer:** [which-package-manager](which-package-manager.md) — or else the layout assumes workspaces the toolchain lacks. Costs a re-scaffold, and may not be a separate decision if the runtime ships one
     - **Must answer:** [how-is-the-codebase-laid-out](how-is-the-codebase-laid-out.md) — or else the rules module sits where one consumer needs a publish step to import it, and two copies drift until a legal move reads as illegal. [ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) forbids it
2. **A browser shows "Hello!" rendered by the client, locally.**
   - **Given:** [0004-the-client-holds-and-mutates-puzzle-state](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md)
   - **Given:** [0013-every-puzzle-cell-is-a-focusable-labelled-element](../decisions/0013-every-puzzle-cell-is-a-focusable-labelled-element.md)
   - **Given:** [0014-all-play-is-reachable-from-the-keyboard-alone](../decisions/0014-all-play-is-reachable-from-the-keyboard-alone.md)
   - **Given:** [the-board-in-play-continues-through-a-loss-of-connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md)
   - **Given:** [the-app-never-opens-to-a-blank-screen-after-the-first-visit](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md)
   - **Given:** [../constraints.md](../constraints.md) — keeping any promise offline puts the thing on the device before the network goes
   - **Given:** [0024-the-entry-document-is-a-build-output-not-a-per-request-render](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) — so the document is produced by the build, and a renderer is not also being chosen as a server
     - **Must answer:** [what-renders-the-client](what-renders-the-client.md) — or else every later client slice is written against a renderer chosen before anything was rendered, and changing it rewrites the client half rather than adjusting it. Costs a re-scaffold, and it is the largest one M1 can create
     - **Must answer:** [what-builds-the-client-and-serves-it-in-development](what-builds-the-client-and-serves-it-in-development.md) — or else the toolchain does not emit a precache manifest or content-hashed filenames, and both are build outputs rather than things that can be added later: [../constraints.md](../constraints.md) records that without hashed filenames a browser revalidates every cached asset. Costs a re-scaffold of the build
3. **The client calls that route and shows the answer, locally.**
   - **Given:** [input-registers-without-waiting-for-the-network](../guarantees/input-registers-without-waiting-for-the-network.md)
     - **Must answer:** [what-handles-http-requests-on-the-server](what-handles-http-requests-on-the-server.md) — or else the first call across the boundary is shaped by the handler rather than by the contract, which is the thing this slice exists to exercise. Costs a re-scaffold of the boundary
     - **Must answer:** [what-renders-the-client](what-renders-the-client.md) — or else the renderer is chosen without knowing it has to fetch and display asynchronously, which is the one thing this slice adds over the last. Costs a re-scaffold of the client half
4. **Both halves are deployed on a host.**
   - **Given:** [../constraints.md](../constraints.md) — a server-set cookie is the only identifier surviving Safari's storage wipe unaided
   - **Given:** [../constraints.md](../constraints.md) — that exemption is capped to seven days when the API answers on a *second hostname* resolving elsewhere, and the test is skipped entirely when the API is path-routed on the app's own hostname
   - **Given:** [../constraints.md](../constraints.md) — a genuinely cross-origin API is blocked outright rather than capped, so it is worse and not exempt
   - **Given:** [../constraints.md](../constraints.md) — without content-hashed filenames a browser revalidates every cached asset
   - **Given:** [0021-the-server-and-its-store-share-a-machine](../decisions/0021-the-server-and-its-store-share-a-machine.md) — the host must run an ordinary process with a local disk beside it
   - **Given:** [0022-the-machines-disk-survives-restart-redeploy-and-host-replacement](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md) — and that disk must survive a redeploy, which platforms vary on
     - **Must answer:** [do-the-client-and-the-api-share-an-origin](do-the-client-and-the-api-share-an-origin.md) — or else the deployment topology caps or destroys the only identifier that survives Safari's storage wipe, per the givens above, and [is guest recovery worth building?](is-guest-recovery-worth-building.md) at M12 finds the mechanism already gone. It fails silently, and unwinding it is a redeploy plus a topology change
     - **Must answer:** [what-serves-the-clients-files-in-production](what-serves-the-clients-files-in-production.md) — or else assets ship without content-hashed filenames and every cached asset is revalidated on every visit, on the network [../problem.md](../problem.md) names as the modal case. Costs a re-scaffold of the build and the serving path together
     - **Must answer:** [where-does-this-run](where-does-this-run.md) — or else the host cannot deploy without briefly running two processes against one volume, and some deploy models cannot be made single-writer-safe at all. Discovering that at M3 is a change of host rather than of configuration
5. **The deployment answers at an address we control.**
   - **Given:** [../constraints.md](../constraints.md) — the first-party test turns on what the domain resolves to, and fails silently
     - **Must answer:** [where-does-this-run](where-does-this-run.md) — or else the platform's own hostname is what the browser resolves, and the first-party test in the given above turns on exactly that. Costs a redeploy, and the failure is silent
     - **Must answer:** [how-does-the-domain-reach-the-deployment](how-does-the-domain-reach-the-deployment.md) — or else a proxy or CDN in front changes what the browser treats as the origin, which is the same silent Safari failure reached by a different route. Costs a redeploy plus whatever sits in front
6. **A change made locally reaches the deployment.**
   - **Must answer:** [where-does-this-run](where-does-this-run.md) — or else the deploy is built against a platform whose deploy model it does not have; a managed platform supplies most of this and a bare machine supplies none of it. Costs a re-scaffold of the pipeline
   - **Must answer:** [how-is-the-codebase-laid-out](how-is-the-codebase-laid-out.md) — or else the pipeline cannot build two deployables from one repository without a publish step between them, which [ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) forbids for the rules module. Costs a re-scaffold of both the layout and the pipeline
   - **Must answer:** [what-deploys-the-code](what-deploys-the-code.md) — or else the first deploy is done by hand and stays that way, and every later milestone verifies against something nobody can reproduce. Costs a re-scaffold, and it is what [how is a bad deploy noticed and undone?](how-is-a-bad-deploy-noticed-and-undone.md) at M11 builds on

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
5. [How is the store reached in local development?](how-is-the-store-reached-in-local-development.md)
   — the specific instance of the question above that M1's store choice creates. It sits here rather
   than at M1 because the decision is downstream of the store's shape; what M1 needs is only the
   comparison of what each shape would cost in the daily loop, and that is a finding recorded against
   [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md).
6. [How is the system reset to a known state?](how-is-the-system-reset-to-a-known-state.md) — two runs
   of a check are only comparable if they start from the same place.
7. [How does anyone load an arbitrary board state?](how-does-anyone-load-an-arbitrary-board-state.md)
   — reaching a nearly-finished grid or a specific violation by playing to it is the main thing
   standing between someone and checking whether a change works.
8. [How is the app driven on a real device?](how-is-the-app-driven-on-a-real-device.md) — the primary
   platform is a phone, and [../constraints.md](../constraints.md) records a streaming bug that
   reproduced only on real iOS Safari over a real network.
9. [How is the server reached and hardened?](how-is-the-server-reached-and-hardened.md) — getting onto
   the machine, and the baseline that stops it being trivially compromised. It sits here because a
   restore drill, a look at a log and a check of what actually shipped all need access, and because
   [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) put the data on a
   machine rather than behind a vendor. Its size depends entirely on
   [where does this run?](where-does-this-run.md) — a managed platform supplies most of this and a
   bare machine supplies none of it.
10. [How is this tested across browsers and platforms?](how-is-this-tested-across-browsers-and-platforms.md)
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

1. [Are puzzles and player records in one store?](are-puzzles-and-player-records-in-one-store.md) —
   first, because it decides whether the first row goes into one store or two, and everything below
   assumes an answer. It does not block M1: a store opened as a file does not pin the generator to
   the server's machine, because a generator can publish through the server's API and run anywhere
   under either store locality.
2. [What is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) — only enough of it
   to write one row and read it back. The full answer is not needed until M7.
3. [Can more than one puzzle be published per day?](can-more-than-one-puzzle-be-published-per-day.md)
   — this is when the first row is keyed, and a puzzle keyed by date alone can never have a sibling.
4. [What crosses the client/server boundary?](what-crosses-the-client-server-boundary.md) — the first
   response with content in it is the first contract, so this is where the format is set.
5. [How is the store backed up?](how-is-the-store-backed-up.md) — the first row exists here, so this
   is where a backup stops being hypothetical. It sits at this milestone rather than later because
   setting it up alongside the store is when it is cheapest, and because the named precedent for
   deferring it is an operational inventory of roughly twenty-five tasks written for exactly this
   architecture with no backup or restore procedure in it. Distinct from
   [is the store's backup restorable?](is-the-stores-backup-restorable.md) at M11, which asks whether
   anyone has actually rehearsed one.
6. [What durability settings does the store run with?](what-durability-settings-does-the-store-run-with.md)
   — journal mode, synchronous level and busy timeout decide whether a committed write survives a
   power cut, which [ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) deliberately left
   open. Answered here because the first row is the first thing that could be lost, and the question
   is framed to test whether the safest setting costs anything at all rather than to position a dial.
7. [How is the schema migrated?](how-is-the-schema-migrated.md) — deciding the routine before there is
   data to lose is when it is cheapest, and
   [ADR-0002](../decisions/0002-launch-with-sudoku-then-star-battle.md) already schedules the change
   that forces one.
8. [How is the store recovered when the machine is lost?](how-is-the-store-recovered-when-the-machine-is-lost.md)
   — [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
   commits to surviving host replacement and the machine cannot deliver that alone. This is the main
   lever on how long an outage lasts, and it is ours rather than a provider's.
9. [How does a deploy avoid disturbing the store?](how-does-a-deploy-avoid-disturbing-the-store.md) —
    there is no store at M1, so nothing can be disturbed there. What M1 owes this question is only
    that the host it picks *can* deploy without two processes holding one file, and that is recorded
    against [where does this run?](where-does-this-run.md) in that milestone. The rest —
    checkpointing on exit, replication across a restart, rolling back past a migration — is real from
    the first row.
10. [How do secrets reach the running system?](how-do-secrets-reach-the-running-system.md) — the first
   real secret exists here, because this is where the store gains a row and, if it is reached over a
   network, a credential. [What deploys the code?](what-deploys-the-code.md) records that M1 needs
   none.

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
   — narrowed by [ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md),
   which settled that a service worker answers the navigation. What is left is everything else: what
   the precache holds besides the document, how the manifest is generated, and what strategy anything
   other than a navigation uses. The manifest is a build output, so this still waits on M1's build
   choice.
2. [How long must offline play survive?](how-long-must-offline-play-survive.md)
3. [Is the player shown anything about the network?](is-the-player-shown-anything-about-the-network.md)
4. [How do we exercise offline, throttled and backgrounded conditions?](how-do-we-exercise-offline-throttled-and-backgrounded-conditions.md)
   — [../constraints.md](../constraints.md) records that the storage failures do not reproduce in a
   desktop browser, so the conditions this milestone is about are the hardest ones to create on
   purpose. It sits here rather than at M2 because there is nothing offline to exercise until now.
5. [Is a puzzle fetched before it is needed?](is-a-puzzle-fetched-before-it-is-needed.md) — the only
   answer that removes the most common wait in the product rather than dressing it, per
   [../problem.md](../problem.md) under "Where a player waits". It sits here rather than at M8 because
   prefetching is an offline capability and needs a rhythm to fetch ahead of, which M8 establishes.

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
12. [How is the server operated?](how-is-the-server-operated.md) — restarting it, patching it, and
    noticing it has stopped. It sits here because noticing an outage is this milestone's theme, and
    its size depends on whether [where does this run?](where-does-this-run.md) lands on a managed
    platform or a bare machine. Its access-and-hardening half is
    [a separate question](how-is-the-server-reached-and-hardened.md) at M2, because that half is
    needed to check a change rather than to survive one.
13. [How do analysis and play share one store?](how-do-analysis-and-play-share-one-store.md) — the
    scans [ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)
    preserves are long reads, and a long read blocks WAL checkpointing. It sits here rather than at M3
    because there is nothing worth analysing until there is play to analyse, and because whatever the
    backup answer produces may already be the copy these reads should run against.
12. [What happens after a sync gives up?](what-happens-after-a-sync-gives-up.md) — a wait that ends
    has to end in something, and the player cannot be told, because
    [the player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md)
    forbids it. So a failed write exists only inside the client where nothing is watching, which is
    this milestone's theme reached from the client side.
    [The durable copy stops being written](../failure-modes/the-durable-copy-stops-being-written.md)
    is what happens if it is never answered.

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

[Does a player see stats about their play?](does-a-player-see-stats-about-their-play.md) and
[can a player explore past puzzles?](can-a-player-explore-past-puzzles.md) — both are intent stated in
[../problem.md](../problem.md) that no record argues and no promise covers: "what they have solved,
and how they are doing", and a puzzle from any past day. They are here rather than at a milestone
because nothing waits on either, and because both are tracked to stop an infrastructure decision
foreclosing them without noticing. The archive question is the nearer of the two — it meets
[is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md) at M8
and [what can a player do with no network?](what-can-a-player-do-with-no-network.md) at M6, and
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) has already
constrained how an archive would be delivered.

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

### While a question is being worked, its file is where the work goes

Findings are written in as they are established, not gathered at the end. Research left in a
conversation gets redone next session from a summary, and a summary is the part that has already
lost its sources.

Results that changed nothing count. A candidate checked and dropped, a claim checked and confirmed,
and a claim checked and found unsupported are all findings, and an option written down nowhere is
indistinguishable from one nobody thought of.

Options and Findings take subheadings once they outgrow a flat list.


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
