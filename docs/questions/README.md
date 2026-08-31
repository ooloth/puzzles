---
updated: 2026-08-31
update_when: a decision is made, or the order changes
decays: fast
status: active
---

# Questions

The sibling of [../decisions/](../decisions/): the decisions not yet made, in the order they
should be made.

A directory listing of this folder is the full inventory — every filename asks its question
plainly, so there is no index here and nothing to keep in step. What this file holds is the
**order**, because that is the part a listing cannot show and the part that is expensive to get
wrong.

Nothing is installed yet. The list below is how that gets fixed without any of it being chosen by
reflex: each stack decision has the foundational calls it rests on placed ahead of it, so no tool
is picked before the thing it is supposed to serve is known.

## The order

Work it top to bottom. Indented entries are the questions that genuinely block the decision above
them — not everything related to it, only what makes the difference between a derivation and a
preference. Where a decision has no indented entries, nothing is stopping it today.

1. **Which package manager.**
   [which-package-manager.md](which-package-manager.md) — no prerequisites, reversible in an
   afternoon, and the one decision that turns an empty repository into a project.

2. **How much the app helps a player solve.**
   [how-much-does-the-app-help-you-solve.md](how-much-does-the-app-help-you-solve.md) — assistive
   or austere. A taste call rather than a derivation, so nothing blocks it. It decides what state
   exists in a cell and whether the client needs the puzzle rules at all, which is why
   [ADR-0005](../decisions/0005-one-implementation-of-the-puzzle-rules.md) and
   [ADR-0006](../decisions/0006-typescript-everywhere-with-the-rules-shared-as-source.md) are
   currently unsupported at their root.

3. **How long in-progress work must survive, and on which devices.**
   [how-long-must-in-progress-work-survive.md](how-long-must-in-progress-work-survive.md) — the
   promise in [../guarantees/durability.md](../guarantees/durability.md) written with a bound.
   Also nothing blocks it, and everything about servers and storage descends from it.

4. **Which component framework.**
   [which-component-framework.md](which-component-framework.md) — researched and shortlisted;
   what it waits on is knowing what the interface has to do.
   1. Decision 2 above.
   2. [what-interactions-must-the-grid-support.md](what-interactions-must-the-grid-support.md)

5. **What builds and serves the client.**
   [what-provides-the-build-and-dev-server.md](what-provides-the-build-and-dev-server.md) —
   researched, and narrowed on grounds that hold regardless of framework.
   1. Decision 4 above, weakly.

6. **How the frontend is organised.**
   [how-is-the-app-styled.md](how-is-the-app-styled.md) and
   [how-is-the-codebase-laid-out.md](how-is-the-codebase-laid-out.md) — the remaining frontend
   installs, paired because both are downstream of the same thing and neither blocks anything.
   1. Decision 4 above.

7. **What runs the tests.**
   [what-runs-the-tests.md](what-runs-the-tests.md) — a real choice rather than a formality: the
   runner has to measure branch coverage on a pure module and drive a rendered grid, and the
   obvious candidates differ on both.
   1. Decision 5 above.

8. **Whether a server exists at all.**
   [what-must-be-true-off-device.md](what-must-be-true-off-device.md) — the most-assumed decision
   in the repo. [ADR-0003](../decisions/0003-the-server-validates-puzzle-state-but-does-not-arbitrate-it.md)
   already describes how a server behaves without anything establishing there is one.
   1. Decision 3 above.
   2. [is-there-a-paid-tier.md](is-there-a-paid-tier.md) — the one thing a device cannot be
      trusted to hold, since entitlement enforced on the player's hardware is not enforced.

9. **Which client storage mechanism.**
   [which-client-storage-mechanism.md](which-client-storage-mechanism.md) — the only stack choice
   with no clean migration path, so it is the one worth slowing down for.
   1. Decisions 2 and 3 above, which give shape and lifetime.
   2. [what-can-a-player-do-with-no-network.md](what-can-a-player-do-with-no-network.md) — one
      board or a browsable archive, which is orders of magnitude of volume.
   3. [is-undo-in-scope-and-how-far-back.md](is-undo-in-scope-and-how-far-back.md) and
      [is-puzzle-state-a-snapshot-or-an-event-log.md](is-puzzle-state-a-snapshot-or-an-event-log.md)

10. **How the app itself stays available offline.**
    [how-does-the-app-itself-stay-available-offline.md](how-does-the-app-itself-stay-available-offline.md)
    — the service worker and its tooling. Every option here has a maintenance problem, so the
    choice is which one to own rather than which to avoid.
    1. Decision 5 above, because the list of files to precache is a build output.
    2. Decision 9's second prerequisite, which decides how much content is cached.

11. **What runs the server, and which database if any.**
    [what-runs-the-server-if-there-is-one.md](what-runs-the-server-if-there-is-one.md) and
    [which-database-if-any.md](which-database-if-any.md) — paired because each constrains the
    other's hosting. The database may be close to a non-decision: ADR-0003 keeps the server from
    reading inside what it stores, and a store that never reads a value has one job.
    1. Decision 8 above.
    2. [what-must-we-know-about-how-the-app-is-used.md](what-must-we-know-about-how-the-app-is-used.md)
       — queryable or opaque, which is most of what "which database" means.

12. **Where it deploys.**
    [where-does-this-run.md](where-does-this-run.md) — deliberately late; it was decided first
    last time and the record says so. One trap: recovery after storage eviction depends on the
    app and its API being hosted so that a server-set cookie is judged first-party — see
    [../constraints.md](../constraints.md) — and a static host with its API elsewhere fails that
    silently.
    1. Decisions 8 and 11 above.

13. **What runs the checks on every change.**
    [what-runs-the-checks-on-every-change.md](what-runs-the-checks-on-every-change.md) — what
    fills the [../verification.md](../verification.md) stub, and what makes any standard in
    [../standards/](../standards/) enforced rather than intended.
    1. Decision 7 above.

Read [which-doors-must-stay-open.md](which-doors-must-stay-open.md) before recording any of them.
Deferring is only safe while the deferred thing stays cheap to add, and whether it does is decided
by choices made in areas that look unrelated.

Everything else in this folder is real and is not next. It will be, in its turn.

## Already settled, never written down as a decision

From [../problem.md](../problem.md) or from conversation. **Treat these as fixed.** Each has been
re-derived at least once by someone reasoning from the decision records alone, and each should
become a record of its own.

- Phone-first, played in transit; desktop secondary, by the same person at another time.
- Single-player and unranked. Never social.
- Puzzles are generated by this project rather than licensed.
- The solving experience outranks puzzle supply, which sets the work order: interface first.
- Two devices editing one board at once is permanently out of scope.
- A paid tier is uncommitted, and the option must not be foreclosed.
- Delivered over the web.

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

The first six sections are stable and short. **Why it matters** is what's blocked or what gets
expensive if we're wrong. **Blocked by** and **Blocks** are the two directions of dependency.
**What would settle it** is the evidence, measurement, or event that would end the question — not
another question, which is what *blocked by* is for. **Resolves into** names where the answer
lands. **Source** records where the question came from, so provenance survives the deletion of
whatever raised it.

The last two grow. **Options** holds each candidate answer with its strongest case and its
cost. **Findings** holds what we've learned so far, each with where it came from. A finding
graduates to `../constraints.md` once it's confirmed; until then it lives here.

A finding may record what a standard *implies for these options*; it may not restate the
standard itself. The first shifts a decision and belongs here. The second is a weaker local copy
of a rule already in force, competing with the real one for whoever finds it first.

**One question per file**, and the filename asks the question as plainly as it can, so a directory
listing reads as the list of what is open.

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
