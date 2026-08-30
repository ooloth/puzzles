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
feel bad about, and not a queue that needs draining. Questions that aren't ready to be worked
are still worth recording: keeping one here costs nothing, and rediscovering it later costs
real time.

**One question per file.** The filename asks the question as plainly as it can, so a directory
listing reads as the list of what's open. Each file carries `opened` and `status`; entries
leave by becoming a decision in [../decisions/](../decisions/), and `status` records which one
so a missing question can be told apart from an abandoned one.

Some questions resolve into a fact rather than a decision — those say so, and land in
`../constraints.md`.

---

## Architecture

These gate nearly everything else. The first is the critical path to anything on screen.

| Question | What it's really about | Blocks |
|---|---|---|
| [Does puzzle state live on the client or the server?](does-puzzle-state-live-on-the-client-or-the-server.md) | Whether the app can act without a network round trip — which is what the offline and instant-feedback guarantees require | almost everything below |
| [Is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md) | Whether history is kept or only the current board; decides how undo and reconciliation work | sync, undo |
| [What happens to a losing write when syncing?](what-happens-to-a-losing-write-when-syncing.md) | Whether "progress is never lost" survives contact with a conflict-resolution strategy that discards writes | durability wording |
| [What renders the client?](what-renders-the-client.md) | Build tooling, testing approach, speed of the inner loop | codebase layout |
| [What runs the server, and in what language?](what-runs-the-server-and-in-what-language.md) | Whether one maintainer carries one toolchain or two — performance is *not* a live argument here | codebase layout |
| [What does the server store, if anything?](what-does-the-server-store-if-anything.md) | Whether a data store choice is significant or nearly irrelevant | hosting |
| [How is the codebase laid out?](how-is-the-codebase-laid-out.md) | When sharing puzzle logic starts justifying separate packages | — |

## What the product is

| Question | What it's really about | Blocks |
|---|---|---|
| [Is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md) | Two different products — decides whether archives, streaks and timezones exist at all | generation cadence, paid tier |
| [Are there user accounts?](are-there-user-accounts.md) | Whether identity is anonymous and disposable or durable and portable | cross-device resume, paid tier, privacy |
| [Is there a paid tier?](is-there-a-paid-tier.md) | Whether anything is worth cheating for — which decides if anti-cheat matters | anti-cheat, accounts |
| [Are hints in scope?](are-hints-in-scope.md) | Whether the solver must *explain* its reasoning or only reach an answer | solver design |
| [Is undo in scope, and how far back?](is-undo-in-scope-and-how-far-back.md) | Whether history has to be retained, and for how long | state model |
| [Which games come after sudoku and star battle?](which-games-come-after-sudoku-and-star-battle.md) | How much shared abstraction is worth building before a second game exists | — |
| [Is accessibility in scope for v1?](is-accessibility-in-scope-for-v1.md) | Keyboard and screen-reader support for a grid, which is expensive to retrofit | interaction design |

## Puzzles

| Question | What it's really about | Blocks |
|---|---|---|
| [What makes a puzzle a joy to solve?](what-makes-a-puzzle-a-joy-to-solve.md) | The generator's actual target. Uniqueness and logical solvability are the floor, not the goal | generator design, difficulty |
| [Does v1 ship generated or seeded puzzles?](does-v1-ship-generated-or-seeded-puzzles.md) | Whether the generator is on the launch path, and who validates a seed set | launch scope |
| [Is difficulty graded, and does a grade promise anything?](is-difficulty-graded-and-does-a-grade-promise-anything.md) | Whether we need a difficulty model or only a solver | generator design |

## Durability and identity

| Question | What it's really about | Blocks |
|---|---|---|
| [Is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md) | The sharpest contradiction inherited from the old docs — currently why `guarantees.md` promises only same-device resume | accounts, sync |
| [How does a second device recognise the same person?](how-does-a-second-device-recognise-the-same-person.md) | Whether identity can live anywhere the browser can't unilaterally delete | — |
| [How much unsynced work is acceptable?](how-much-unsynced-work-is-acceptable.md) | The number that turns "never lost" into something testable, and sets sync cadence | battery tradeoff, verification |
| [Is home-screen install required for durability?](is-home-screen-install-required-for-durability.md) | Whether the durability promise is weaker for players who don't install | onboarding, guarantee wording |

## Platform and operations

| Question | What it's really about | Blocks |
|---|---|---|
| [Where does this run?](where-does-this-run.md) | Reopened. If the client owns state, previously-disqualified platforms return | cost, downtime, backups |
| [What is the acceptable running cost?](what-is-the-acceptable-running-cost.md) | Whether cost is a ceiling that rules platforms out, or a preference that doesn't | hosting |
| [How much downtime is acceptable?](how-much-downtime-is-acceptable.md) | Accepting no redundancy deliberately, with a number, rather than discovering it during an outage | hosting |

## Measurement and verification

| Question | What it's really about | Blocks |
|---|---|---|
| [What latency budget makes "immediately" checkable?](what-latency-budget-makes-immediately-checkable.md) | Making the most important guarantee testable instead of rhetorical | enforcement of responsiveness |
| [How long must offline play survive?](how-long-must-offline-play-survive.md) | Minutes, a flight, or a night — decides how much content is cached ahead | local caching |
| [How would we verify progress is never lost?](how-would-we-verify-progress-is-never-lost.md) | There is no unit test for an OS memory purge | enforcement of durability |
| [How would we learn a player lost progress?](how-would-we-learn-a-player-lost-progress.md) | Detecting a failure that produces no error and no complaint | observability |

## Priorities not yet settled

| Question | What it's really about | Blocks |
|---|---|---|
| [What wins when correctness and latency conflict?](what-wins-when-correctness-and-latency-conflict.md) | The missing rung in the ranking. A late error invalidates reasoning already built on it | validation architecture |
| [What wins when battery and durability conflict?](what-wins-when-battery-and-durability-conflict.md) | Sync cadence — both stated preferences pull opposite ways | sync design |
| [Does craft enjoyment ever outrank user experience?](does-craft-enjoyment-ever-outrank-user-experience.md) | Answering openly once, rather than smuggling it into decisions as a technical argument | language choice, and others |

## Facts to go and get

Cheap to answer, currently blocking or distorting real decisions. These resolve into
`../constraints.md` rather than into a decision.

| Question | What it's really about | Blocks |
|---|---|---|
| [How does Android evict stored data?](how-does-android-evict-stored-data.md) | An entire platform's durability behaviour, unresearched while we assume an iOS-heavy audience with no evidence | durability design |
| [What resets Safari's seven-day storage clock?](what-resets-safaris-seven-day-storage-clock.md) | Whether a regular player is ever actually at risk — decides how much the eviction problem deserves | install requirement |
| [Does `storage.persist()` do anything on iOS Safari?](does-storage-persist-do-anything-on-ios-safari.md) | Whether a second mitigation exists, or whether calling it is false reassurance | durability design |
| [What are the real network conditions on transit routes?](what-are-the-real-network-conditions-on-transit-routes.md) | Whether the offline design is sized to reality or to a spec's classification thresholds | offline design |
| [How long until a stalled connection surfaces as an error?](how-long-until-a-stalled-connection-surfaces-as-an-error.md) | The modal tunnel failure, which retry logic built around thrown errors never sees | stall detection |
| [Does background sync fire reliably on iOS?](does-background-sync-fire-reliably-on-ios.md) | Whether progress can sync without the player reopening the app | durability promise |
| [What do existing puzzle apps do about offline play?](what-do-existing-puzzle-apps-do-about-offline-play.md) | Whether offline is a differentiator or table stakes — no competitor research exists at all | the premise of the product |

## Legal

| Question | What it's really about | Blocks |
|---|---|---|
| [Do privacy regulations apply?](do-privacy-regulations-apply.md) | Consent, erasure, age gating and data residency, none of which have ever been examined | accounts, paid tier |
