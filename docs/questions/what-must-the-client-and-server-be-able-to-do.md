---
opened: 2026-09-16
status: open
resolves_into: unsettled
---

# What must the client and the server each be able to do?

## Why it matters

Every toolchain choice in M1 is scored against something. Where that something is not written down
first, it is whichever properties the first candidate researched happened to have, and the
comparison that follows reads as an evaluation while being a search for reasons.

The list is a derivation, not a survey. Each property cites [../problem.md](../problem.md),
[../guarantees/](../guarantees/), [../constraints.md](../constraints.md) or a record in
[../decisions/](../decisions/), and no tool is named anywhere in it. Naming one is the failure this
file exists to prevent: a property written with a candidate in mind is a candidate wearing a
property's clothes, and it survives every later round because nothing distinguishes it from a real
requirement.

Two things it also produces. A property nothing in the repo supports is an assumption somebody has
been carrying, and writing the list is when it surfaces. A property that no candidate satisfies is a
constraint that has to be met some other way, and finding that before a tool is chosen is the
difference between a design and a workaround.

## What would settle it

Writing it. This is derivation from documents already here rather than research into the world, so
nothing external has to be checked and no candidate has to exist.

It is finished when a reader who does not know which candidates exist can score one against it, and
when every property names the file that establishes it. A property that cannot name one is an open
question and is asked rather than assumed.

## Resolves into

Unsettled, and deliberately left so. The three values this folder uses are `decision`, `constraint`
and `problem`. This is none of them cleanly: it settles no choice, it records no fact about the
world outside the repo, and it restates no part of the problem. What it produces is the scoring
criteria that several records in [../decisions/](../decisions/) will each cite.

Two ways out, and neither has been argued: stretch one of the three, or let the folder carry a
fourth. The frontmatter says `unsettled` until one is chosen, because a value picked to satisfy the
checker would be a wrong answer to a question nobody asked. The research backlog is found by
searching for `resolves_into: constraint` and the open choices by searching for
`resolves_into: decision`, so a guess here would land this file in a query it does not belong in.

## Source

The M1 plan in [README.md](README.md), which makes this its first phase and scores every phase after
it against the result.

## Options

N/A. This resolves into a list rather than a choice between candidate answers.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**How to read this.** Each entry is something a part of the system must be able to do, followed by
the file that establishes it. A property with no citation is an assumption somebody has been
carrying, and there are none here on purpose: anything that could not name a source was left out
rather than softened.

**No tool is named in a property, and two are already fixed by record.** The language
([ADR-0007](../decisions/0007-that-language-is-typescript.md)) and the store's engine
([ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md)) are settled choices, so citing them is
citing a decision rather than leaking a candidate into a requirement. Every other property names a
capability and leaves the technology open.

**A property that no candidate fails is still a property.** Whittling to the ones that separate
candidates is a later phase, and doing it here would mean the list was assembled with candidates in
mind, which is the thing it exists to avoid. The reverse case is worth more: a property that *no*
candidate satisfies is a constraint that has to be met some other way, and finding one here is worth
the whole exercise.

### What the client must be able to do

**Hold a complete copy of the state for any puzzle in progress and mutate it without waiting on
anything remote.** [ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md).

**Run the rules that decide whether a move is legal and whether a board is complete, on the device.**
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) puts them there and
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) says
they are the same implementation the generator uses.

**Reach the screen from local state on every player action, with no part of the path from input to
paint touching the network.** [input registers without waiting for the
network](../guarantees/input-registers-without-waiting-for-the-network.md), which is stated
structurally rather than as a duration so that it is checkable today.

**Represent every puzzle cell as an element in the document that can take focus and carry a name, a
role and a state.** [ADR-0013](../decisions/0013-every-puzzle-cell-is-a-focusable-labelled-element.md).
This is the sharpest constraint in the list on how the board is drawn, because it rules out painting
the grid rather than constructing it.

**Accept touch as the primary input on a phone and the keyboard as the primary input on a desktop,
without either being a fallback for the other.** [../problem.md](../problem.md) records that the two
halves of the audience take different input and that keyboard on the desktop is the expectation
rather than an accommodation.

**Make every action a player takes while solving operable from the keyboard alone**, where operable
means the action can be performed with no pointer at all rather than merely that nothing prevents it.
[ADR-0014](../decisions/0014-all-play-is-reachable-from-the-keyboard-alone.md) and [every action
while solving is reachable from the
keyboard](../guarantees/every-action-while-solving-is-reachable-from-the-keyboard.md).

**Answer a navigation from a document held on the device, from the second load onward.**
[ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md) and [the
app never opens to a blank screen after the first
visit](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md). The underlying
capability is narrower than "cache the document": the store holding it has to be one the application
code can populate, test for presence, and notice an eviction from, which is the property
[../constraints.md](../constraints.md) records the browser's own network cache lacks.

**Stay fully interactive with no connection at all, showing no error state and asking the player to
do nothing about the network.** [the board in play continues through a loss of
connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md) and [the
player is never asked to retry or
reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md).

**Restore the board on reopen exactly as it was left, including notes and the player's selection,
with no sync step and no prompt.** [reopening restores the board in progress with notes and
selection](../guarantees/reopening-restores-the-board-in-progress-with-notes-and-selection.md).
Selection is named separately in that promise because restoring the values and losing the player's
place still costs them their train of thought.

**Reconcile two copies of a board that disagree, without presenting the player a choice between
versions.** [conflicts are reconciled without asking the
player](../guarantees/conflicts-are-reconciled-without-asking-the-player.md). Which copy wins is
[open](what-happens-to-a-losing-write-when-syncing.md); that it is decided without the player is not.

**Run the whole app on every browser at or above the declared floor, rather than a reduced build.**
[the app runs on any device still receiving security
updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md) says "not a
subset of its features, not a degraded mode". The mechanics are that the emitted bundle parses at the
floor and the code does not call APIs the floor lacks, per
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md) and
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md);
the promise is the stronger claim that no feature is dropped to get there.

**Assign the keys for anything it stores rather than letting the store mint them.**
[../constraints.md](../constraints.md) records a defect where the first write after a cold start
fails when the store generates the key. Doing this from the first line costs nothing and adopting it
later costs a migration of every player's data.

**Detect that its own storage is absent and carry on, rather than assuming a database it can always
open.** [../constraints.md](../constraints.md) records that one platform mode removes the database
entirely.

**Test at runtime whether it is in the protected store, rather than inferring it from how the app was
launched or from having shown an install prompt.** [../constraints.md](../constraints.md) records
that a player can decline the isolated store while still installing, and that the membership test is
a better signal than how the page was launched.

**Treat local storage as wholly gone rather than partially readable when it fails.**
[../constraints.md](../constraints.md) records that one major browser evicts whole origins at a time,
so every recovery path assumes the store is simply absent rather than stale or half-present.

**Treat a rejected write as loss rather than as a condition that resolves itself, and not branch
recovery on the error's name.** [../constraints.md](../constraints.md) records a production dataset
of millions of write failures across fifty-two error types, where the largest category misidentified
its own cause and nearly every affected session exhausted every retry.

**Write each change durably as it happens rather than deferring to a moment that may never arrive.**
[../constraints.md](../constraints.md) records that no page-lifecycle event is guaranteed to fire and
that the primary platform runs no background execution for web apps at all. Whatever is written on
the way out is fire-and-forget rather than a request anything waits on, because nothing guarantees
the app is still running to see the response.

**Send to the server in infrequent batches rather than over a held-open connection or a short poll.**
[../constraints.md](../constraints.md) records that mobile radios are expensive to wake regardless of
payload size, and rules out both a continuously-open stream and a short poll as a default sync
mechanism.

### What the server must be able to do

**Run as an ordinary long-lived process with the full platform API surface**, deployed that way
rather than merely capable of it. [ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md)
rules out the sandboxed-isolate tier and
[ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) establishes that
the process exists at all.

**Answer a request without first waking**, and read a store that has not gone to sleep either.
[ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md).

**Open its store as a file on a disk attached to the same machine**, not over a network.
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md),
[ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) and
[../constraints.md](../constraints.md), which records that the engine's own maintainers advise
against a network filesystem and that the failure is corruption rather than an error.

**Keep that disk across a process restart and a redeploy, and hold a copy off the machine sufficient
to rebuild the store when the machine is gone.**
[ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md) and
[../constraints.md](../constraints.md), which records that one volume is one point of failure and
that a provider's own snapshots are not a backup.

**Decide at request time whether to serve a piece of puzzle content.**
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md), forced by
[../constraints.md](../constraints.md): anything shipped to a device can be read and replayed, so
gating happens before bytes leave or not at all.

**Hold the durable copy of a player's state off their device and hand it back.**
[ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md). What
that state covers beyond the board currently in progress is open, and the durability promises in
[../guarantees/](../guarantees/) reach only the board in progress today.

**Answer questions that span players and puzzles without a migration first.**
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md). A request path
only ever sees its own rows, so this is a property of how data is stored rather than of any endpoint.

**Set a cookie in a response header that the page's own scripts cannot write.**
[../constraints.md](../constraints.md) records that such a cookie follows its declared lifetime while
script-writable storage is deleted wholesale, and that of the mechanisms it enumerates this is the
only one carrying an identifier across the wipe with nothing asked of the player. That makes it the
basis of any recovery for a lapsed player, and it is why the deployment topology is a product
question rather than an operational one.

*Reasoned — per [../constraints.md](../constraints.md), which derives it from the storage and cookie
facts it records rather than from an observation of a shipped browser.*

### What the code both halves use must be able to do

**Exist as one implementation of the puzzle rules, imported by a browser build and by a process
outside the browser, with no publish step between them.**
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) and
[ADR-0006](../decisions/0006-one-language-across-every-deployable.md), which is also what makes every
deployable one language, fixed by [ADR-0007](../decisions/0007-that-language-is-typescript.md).

**Answer, from that one implementation: whether a move is legal, whether a board is complete, whether
a board has exactly one solution, and which techniques a solve requires at a given state.**
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md),
[every puzzle has exactly one solution](../guarantees/every-puzzle-has-exactly-one-solution.md) and
[every puzzle is solvable by deduction
alone](../guarantees/every-puzzle-is-solvable-by-deduction-alone.md).

**Describe a stored puzzle by its own dimensions, region map, cell vocabulary and game type, none of
them inferred from the game being sudoku.**
[ADR-0008](../decisions/0008-a-stored-puzzle-describes-its-own-size-regions-and-values.md).

### What the generator must be able to do

**Produce puzzles for more than one game type against the same rules interface.**
[ADR-0002](../decisions/0002-launch-with-sudoku-then-star-battle.md) schedules a second game, and
[ADR-0008](../decisions/0008-a-stored-puzzle-describes-its-own-size-regions-and-values.md) is the
data shape that keeps the first one from being assumed.

**Validate its own output for uniqueness before anything is stored or served.** [every puzzle has
exactly one solution](../guarantees/every-puzzle-has-exactly-one-solution.md) names this as the
obvious mechanism, and the promise holds for a hand-picked set as much as a generated one.

### What the toolchain must be able to do

**Emit the entry document as a build output rather than rendering it per request.**
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md).

**Put content in that document which the bundle does not deliver**, because
[../constraints.md](../constraints.md) records that a browser below the floor parses none of the
script, so anything it is meant to see has to reach it outside the bundle. [A device too old to run
the app is told so rather than shown a blank
screen](../guarantees/a-device-too-old-to-run-the-app-is-told-so-rather-than-shown-a-blank-screen.md)
is what needs it, and what goes in the document is
[open](what-does-a-browser-below-the-floor-see.md).

**Lower emitted syntax to a declared floor rather than passing through whatever the source used.**
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md).

**Read that floor from one declaration, shared by three consumers: the build's lowering target, a
check that the emitted bundle parses at the floor, and a check that source does not call APIs the
floor lacks.**
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
names the three and requires that the declaration state its versions rather than derive them when it
is read, because a line that moves on its own cannot be the scope of a promise. What format carries
it is [open](what-format-declares-the-browser-floor.md), and so is how much adapting each consumer
needs.

**Emit content-hashed filenames.** [../constraints.md](../constraints.md) records that without them a
browser revalidates every cached asset, which costs a round trip per load on the link
[../problem.md](../problem.md) names as the modal case.

**Emit a manifest naming the document and every asset it needs, so they can be installed together.**
[../constraints.md](../constraints.md) records that cache entries evict independently of one another,
so a surviving document can reference an evicted bundle, and that is a blank screen or, worse, a
silently mismatched one. Whether the toolchain generates the manifest or something else reads its
output to build one is open; that the set is nameable from the build is what this requires.

**Resolve an import of the shared rules module from a browser entry point and from a process outside
the browser, in one repository, with no publish step.**
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) and
[ADR-0006](../decisions/0006-one-language-across-every-deployable.md). This is the property a spike
settles rather than a feature list.

**Build two deployables from that one repository.**
[ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) establishes the
second one.

### What anything adopted must be able to do

**Carry a licence that permits use inside a hosted service without obliging us to release our own
source, and that cannot be revoked.** [../constraints.md](../constraints.md) records that a network
copyleft licence is disqualifying for anything linked into a hosted service, and that dependencies
are audited for network copyleft rather than only for distribution copyleft. The same test reaches a
source-available licence that reserves the right to withdraw permission, because the exposure is the
same shape: the terms rather than the code decide whether the thing can keep being used.

**Nothing in the repository supports a property about how well maintained a candidate is, and one is
missing.** How many people author a project's commits, whether it has shipped in a year, and whether
it is pre-1.0 all separate the surveyed candidates sharply, and none of them is derivable from
[../problem.md](../problem.md), [../constraints.md](../constraints.md),
[../guarantees/](../guarantees/) or any record. The nearest thing is the ranking in
[../problem.md](../problem.md) that puts clarity over cleverness because one person maintains this,
and that is about the code written here rather than what it depends on. Until it has a source, an
elimination on maintenance is an elimination on taste, and this file's rule is that a property
without a citation is an assumption somebody has been carrying.

### What must stay reachable rather than be delivered now

These are not requirements. They are futures [../problem.md](../problem.md) or a record says are
worth keeping, and a choice that closes one is a choice that has to say so.

**Serving the client and the API on one hostname.** [../constraints.md](../constraints.md) records
that this arrangement skips the first-party test entirely, that a second hostname resolving elsewhere
caps the cookie to seven days, and that the failure is silent. Whether this system takes that
exemption is [open](do-the-client-and-the-api-share-an-origin.md), so it is a door rather than a
requirement.

**Being installed to a home screen as a designed path.** [../constraints.md](../constraints.md)
records installation as the only confirmed mitigation against the thirty-day wipe, and that an
installed app starts with an empty store, so carrying progress across is deliberate work. Whether
durability is allowed to depend on it is [open](is-home-screen-install-required-for-durability.md).

**Work following a player between devices, and a puzzle from a past day still being where they left
it.** [../problem.md](../problem.md) describes both, and says plainly that a sentence there is an
intention until a record argues it into a promise. So neither is owed today and a decision that makes
either expensive is one that has to be argued.

**A record of a player's play that outlives any one device.** [../problem.md](../problem.md) names it
and [../guarantees/README.md](../guarantees/README.md) records that nothing promises it yet.

**Running solving or generation work off the main thread.** Nothing has decided against it, and
[../problem.md](../problem.md) ranks the solving experience above everything else the app might do.

**Adding per-route rendering later.**
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) states
that it preserves this, and [does any page need markup a crawler can
read?](does-any-page-need-markup-a-crawler-can-read.md) is where it gets asked.

**Serving more people without a rewrite.** [../problem.md](../problem.md) rules out designing for
scale now and rules out, separately, a decision that makes growing into it expensive.

### What is deliberately not a property

Each of these is something a comparison reaches for first and none of them binds here. Scoring a
candidate on one is measuring what does not decide anything.

**How fast a renderer updates a cell.** [../constraints.md](../constraints.md) names framework render
throughput as its worked example of measuring what does not bind, because client CPU and memory clear
this workload by orders of magnitude.

**How fast generation runs.** [../problem.md](../problem.md) ranks the interactive path above batch
throughput, so a player never waits on generation and it can be as slow as it needs to be.

**How small the payload is.** [../constraints.md](../constraints.md) records that transfer time is not
the bottleneck once a connection is warm, and that the cost to optimise for is avoiding fresh
connections instead.

**How much storage quota is available.** [../constraints.md](../constraints.md) records that the
figure is fabricated on the primary platform, so there is no quota management to build and running out
of space is not the failure worth designing against.

**How well it scales.** [../problem.md](../problem.md) places scale below every other ranking and
rules out designing for load that does not exist.

**How familiar it already is.** [../decisions/README.md](../decisions/README.md) and the portable
decision-making standard both hold that familiarity is a cost of adopting the alternative and never a
merit of the choice.
