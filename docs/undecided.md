---
updated: 2026-08-30
update_when: a question opens, or one gets settled
decays: fast
status: active
---

# Undecided

Every consequential question this project still has to answer. A question belongs here if
getting it wrong would be expensive to undo, or if it gates other decisions.

A long list is healthy. This is the inventory of what's genuinely open — not a backlog to
feel bad about, and not a queue that needs draining. Questions that aren't ready to be
worked are still worth recording: keeping one here costs nothing, and rediscovering it
later costs real time.

Entries leave one way — they become a decision in [decisions/](decisions/).

---

## Architecture

These gate nearly everything else. The first three are the critical path to anything on screen.

### Does the source of truth for in-progress puzzle state live on the client or the server?

**Why it matters** Determines almost every other technical choice. Two guarantees —
instant feedback under any network condition, and staying interactive through minutes of
no connectivity — both require the client to act without a round trip.
**Gates** client framework, whether there's a server at all, sync model, data store, hosting.
**Options so far** *Client-first, server as sync target*: satisfies both guarantees by
construction; costs a real client application and a sync mechanism to build and maintain.
*Server-owns-state hypermedia* (the previous direction): one place for logic, simpler
client; but a server round trip is required for every state change, which fails the offline
guarantee by construction — and this is a property of the category, not of any one framework.
**Settled by** Possibly already settled by `problem.md` and `constraints.md` as written.
Worth confirming rather than assuming.

### Is puzzle state a snapshot or an event log?

**Why it matters** Shapes the sync protocol, the undo implementation, and what "the same
board" means when reconciling two copies.
**Gates** sync model, undo, storage schema.
**Options so far** *Versioned snapshot with last-write-wins*: small, simple, right-sized for
~81 independent scalars. *Event log*: undo falls out for free, replay is cheap at 50-300
actions per game, but it's more moving parts.

### What is the sync model, and what happens to a losing write?

**Why it matters** Last-write-wins discards the losing write. Whether silently discarding a
player's moves is compatible with "progress is never lost" is unresolved, and both claims
currently appear in our own documents.
**Gates** the durability guarantee's actual wording.

### What renders the client?

**Gates** build tooling, testing approach, dev loop.
**Settled by** the client-or-server question above; don't decide this first.

### What runs the server, if anything, and in what language?

**Why it matters** A second language means a second toolchain, dependency ecosystem, CI
setup and context switch for one maintainer. Sharing puzzle logic between generator, server
and client in one language removes duplication that would otherwise have to be kept in sync.
**Options so far** *One language everywhere* versus *a compiled language for generation*.
Note that performance is **not** a valid argument here — generation at these grid sizes isn't
compute-bound (see `constraints.md`). Any case for a second language rests on enjoyment or
on some other benefit, and should say so plainly.

### Which data store, and does the server hold puzzle state at all?

**Settled by** the client-or-server question. If the client owns state, the server's job may
be small enough to change the answer entirely.

### How is the codebase laid out — one package or several?

**Why it matters** Sharing puzzle logic across generator, server and client is the main
driver. Premature splitting costs more than it saves at this size.

---

## Product shape

### Daily puzzle, or unlimited play?

**Why it matters** Changes the generator's job, whether an archive exists, whether streaks
make sense, and whether "today" needs timezone handling. Two genuinely different products.
**Gates** generation cadence, content model, any notion of an archive.

### Are there user accounts, and if so when?

**Why it matters** Progress is currently promised without an account. Cross-device resume
may be impossible to do well without one.
**Gates** cross-device resume, any paid tier, privacy obligations.

### Is there a paid tier?

**Why it matters** It changes the stakes. "No adversarial stakes, so anti-cheat isn't a
design driver" stops being true the moment something is worth gating.
**Gates** anti-cheat posture, accounts, payment obligations.

### Are hints in scope?

**Why it matters** A technique-aware hint system (naked singles, hidden pairs, X-wing) has
been sketched in passing and used as an argument in stack discussions, but has never been
stated as something the product does.

### Is undo in scope, and how far back?

**Why it matters** It appears as an assumed input and as a side benefit of a data model, but
never as a requirement. If undo is unlimited it constrains the state model; if it's shallow
it doesn't.

### Which games after sudoku and star battle?

**Why it matters** "Other grid logic games" is the stated scope. How different the second and
third games are determines how much shared abstraction is worth building now — and the honest
default is none until a second game actually exists.

### Is accessibility in scope for v1?

**Why it matters** Never mentioned in any prior document. Grid puzzles have real keyboard and
screen-reader design questions, and retrofitting is expensive. Silence isn't a decision.

---

## Puzzles and content

### Does v1 ship generated puzzles or a seeded set?

**Why it matters** Generation is deferred in the work order but central to what this project
is. A seeded launch set needs its own validation, since nothing generated it.
**Options so far** *Hand-picked seed set*: no generator needed to launch, but every grid needs
verifying, and copyright applies to curated collections even though individual grids are free.
*Generate before launch*: no seed licensing questions, but moves generator work earlier than
the stated priority order puts it.

### Is difficulty graded, and does a grade carry a promise?

**Why it matters** "Every puzzle is solvable by logic alone" is already a guarantee. Whether
an *Easy* is guaranteed easier than a *Hard* is a separate and much harder claim.

### What makes a puzzle a joy to solve, beyond having one logical solution?

**Why it matters** This is the stated point of the whole project and it currently has a
one-line answer. Solving-path shape, technique variety, and the absence of tedious stretches
are all plausible components and none is written down. Until this is answered, the generator
has no target beyond correctness.

---

## Durability and identity

### Is cross-device resume in scope for v1?

**Why it matters** Desktop use by the same person at a different time is described as
expected, but the previous design explicitly accepted losing everything on a device switch.
Both positions are in the record. This is the sharpest unresolved contradiction inherited
from the old docs.
**Gates** accounts, sync model, what `guarantees.md` may promise.

### Without accounts, how does a second device recognise the same person?

**Settled by** the accounts question. If cross-device resume is in scope and accounts are not,
this needs an answer nobody has proposed yet.

### What is the maximum acceptable window of unsynced work?

**Why it matters** Turns "progress is never lost" from a slogan into something testable. It
also sets the sync cadence, which trades directly against battery.

### Is home-screen install required for durability to hold — and what do we promise someone who declines?

**Why it matters** Install is the only confirmed exemption from Safari's 7-day storage wipe.
Requiring it puts friction on an audience assumed to have no technical sophistication;
not requiring it means the durability guarantee is weaker for most players than for some.

---

## Platform and operations

### Where does this run?

**Why it matters** Previously settled and now reopened. If the client owns state, the
persistent-local-disk requirement that disqualified several platforms may no longer apply,
which puts them back in contention.
**Settled by** the client-or-server question; don't decide this first.

### What is the acceptable running cost, and is it a ceiling or a preference?

**Why it matters** Stated as "I don't want to lose much money running this app," which is a
direction rather than a number. A ceiling changes which platforms qualify.

### What downtime is acceptable?

**Why it matters** A single machine has no hardware redundancy, and backups protect data, not
availability. Accepting that is reasonable — but it should be accepted explicitly, with a
tolerable outage length attached.

---

## Measurement and verification

### What latency budget makes "renders feedback immediately" checkable?

**Why it matters** Currently unmeasurable, which means the most important guarantee in the
product can't be tested or regressed against. Needs a number and a measurement point —
input event to paint, on a named reference device.

### How long must offline play actually survive?

**Why it matters** "Several minutes" is sized to tunnel dropouts. Whether a flight or an
overnight is in scope changes the design substantially.

### How would "progress is never lost" ever be verified?

**Why it matters** It can't be checked by unit tests. Backgrounding, tab kill, and OS memory
purge need real devices or an instrumented harness, and no approach has been proposed.

### How would we learn that a real player lost progress?

**Why it matters** There's no error to report and the player may simply never come back. A
failure this severe with no detection path is worth designing for deliberately.

---

## Priorities not yet settled

### When correctness and latency conflict, which wins?

**Why it matters** The most consequential gap in the ranking. A fast local answer that a
fuller check would contradict is exactly the failure that hurts most here: a late error
invalidates the reasoning a player has already built on top of it.

### Battery or durability, when sync cadence has to choose?

**Why it matters** Infrequent, batched network activity is the stated preference. Bounding
worst-case unsynced work pushes the other way. Both are written down; neither yields.

### Does craft enjoyment ever outrank user experience?

**Why it matters** A legitimate motive for this project, and one that can quietly justify
technical choices on other grounds. Better answered openly than smuggled into an ADR.

---

## Facts to go and get

Cheap to answer, currently blocking or distorting real decisions.

- **Android storage eviction behaviour.** Entirely unresearched, while the whole durability
  analysis assumes an iOS-heavy audience with no evidence for that assumption.
- **Does `navigator.storage.persist()` do anything on iOS Safari?** Testable in an afternoon
  on a real device.
- **Does ITP's 7-day clock reset on any interaction, or only on a top-level navigation?**
  Decides whether a regular player is ever actually at risk.
- **Real RTT and dropout distributions on the transit routes this is designed for.** The
  architecture pivots on numbers currently taken from a spec's classification thresholds.
- **How long a stalled-but-not-failed connection takes to surface as an error on iOS Safari.**
  This is the modal failure and no timeout figure exists.
- **Whether service worker background sync fires reliably on iOS.** Assumed by any offline plan.
- **What existing puzzle apps already do about offline play.** No competitor, review, or user
  research appears anywhere in this project's history. The problem is asserted from first
  principles and one precedent from a task manager. Worth an hour before building around it.

---

## Legal

### Do GDPR, CCPA, or similar obligations apply?

**Why it matters** A genuinely public app storing per-person progress and setting a long-lived
identifier has consent, erasure, and privacy-policy questions. Nothing in this project has ever
examined them. Also unexamined: age gating, data residency for any backup, and payment
obligations if a paid tier appears.
