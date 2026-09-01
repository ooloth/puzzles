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

Work it top to bottom. Each entry names what it derives from, so the order is checkable rather
than asserted — if an entry's inputs are all above it and answered, it is ready, and if they are
not, working it produces an answer that is arbitrary and will not look arbitrary.

Ordering is by derivation only. Nothing here is placed because it is quick, cheap or unblocking;
that is why the package manager is nineteenth rather than first.

**Above the list.** [ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md) settled web
delivery on 2026-08-31. It was the root of this order and is now the standing input that several
entries below derive from, so it is cited as `ADR-0003` rather than by position.

**The two roots.** Nothing derives these, and almost everything derives from them.

1. **[How long must in-progress work survive, and on which devices?](how-long-must-in-progress-work-survive.md)**
   [../guarantees/durability.md](../guarantees/durability.md) with a bound and a device scope.
   Written without either, it has been read as anything. ADR-0003 makes this expensive rather than
   free: on the web the platform ceiling in [../constraints.md](../constraints.md) binds, where a
   native app would have made "indefinitely, on this device" close to free.

2. **[What must we know about how the app is used?](what-must-we-know-about-how-the-app-is-used.md)**
   Including what the maintainer wants to learn from historical play — an argument for a server
   and a queryable store that survives whatever 1 answers.

**Then, in this order.**

3. **[Is the client served as static files?](is-the-client-served-as-static-files.md)** — from
   ADR-0003. Implied by ADR-0002 plus the offline guarantee, and decided nowhere. Rules
   meta-frameworks in or out.

4. **[Is there one implementation of the puzzle rules?](is-there-one-implementation-of-the-puzzle-rules.md)**
   — from ADR-0003. Its whole force is that one language must serve a browser and a batch process.
   ADR-0003 also gives it a second job: a rules engine that stays a pure module is what keeps a
   native shell cheap to add later.

5. **[Which language do the deployables share?](which-language-do-the-deployables-share.md)** —
   from ADR-0003 and 4. One TypeScript codebase everywhere is a web-shaped answer, and the shape
   is now chosen.

6. **[What renders the client?](what-renders-the-client.md)** — from 3 and 5. Framework, minimal
   library, or neither; the class, not the member.

7. **[Does a server exist at all?](what-must-be-true-off-device.md)** — from 1 and 2, and from
   [is there a paid tier?](is-there-a-paid-tier.md), since entitlement is the one thing a device
   cannot be trusted to hold.

8. **[What does the server do with puzzle state?](what-does-the-server-do-with-puzzle-state.md)**
   — from 7.

9. **[Which component framework?](which-component-framework.md)** — from 5 and 6. Researched;
   shortlisted to React, Preact and Svelte.

10. **[Which client storage mechanism?](which-client-storage-mechanism.md)** — from 1 and 7, plus
    [what a player can do with no network](what-can-a-player-do-with-no-network.md) for volume and
    [snapshot or event log](is-puzzle-state-a-snapshot-or-an-event-log.md) with
    [undo depth](is-undo-in-scope-and-how-far-back.md) for shape. The only stack choice with no
    clean migration path. ADR-0003 adds a constraint on *how* it is reached rather than on what is
    chosen: one narrow interface, one implementation behind it, nothing reaching around it.

11. **[What builds and serves the client?](what-provides-the-build-and-dev-server.md)** — from 9.
    Researched.

12. **[What runs the server?](what-runs-the-server-if-there-is-one.md)** — from 7.

13. **[Which database, if any?](which-database-if-any.md)** — from 7 and 2. Possibly a
    non-decision, if the server never reads inside what it holds.

14. **[Where does it deploy?](where-does-this-run.md)** — from 7, 12 and 13. Late on purpose; it
    was decided first last time. One trap: silent recovery after eviction depends on the app and
    its API being hosted so a server-set cookie is judged first-party — see
    [../constraints.md](../constraints.md).

15. **[How does the app stay available offline?](how-does-the-app-itself-stay-available-offline.md)**
    — from 11, since the precache list is a build output.

16. **[What runs the tests?](what-runs-the-tests.md)** — from 11.

17. **[How is it styled](how-is-the-app-styled.md) and
    [laid out](how-is-the-codebase-laid-out.md)?** — from 9.

18. **[Which package manager?](which-package-manager.md)** — from 11 and 12. Last because it is
    derived from both runtimes, not first because it is easy.

19. **[What runs the checks on every change?](what-runs-the-checks-on-every-change.md)** — from
    16. Fills the [../verification.md](../verification.md) stub.

Read [which-doors-must-stay-open.md](which-doors-must-stay-open.md) before recording any of them.
Deferring is only safe while the deferred thing stays cheap to add, and whether it does is decided
by choices made in areas that look unrelated.

Everything else in this folder is real and is not next. It will be, in its turn.

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
