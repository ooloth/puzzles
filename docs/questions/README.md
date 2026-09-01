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

Nothing is installed yet. What follows is how that gets fixed without any of it being chosen by
reflex: each stack decision has the foundational calls it rests on placed ahead of it, so no tool
is picked before the thing it is supposed to serve is known.

## Start here

Three questions are ready — every input they have is answered. None derives from another, so take
whichever you like; the bracketed count is how many later decisions each one unblocks.

1. **[Which language do the deployables share?](which-language-do-the-deployables-share.md)**
   [8] ADR-0004 requires the rules to run in a browser and in a batch process from one source. This
   settles what the client, the generator and any server are written in.
2. **[How long must in-progress work survive, and on which devices?](how-long-must-in-progress-work-survive.md)**
   [8] The durability promise with a bound and a device scope. Decides whether a server is forced.
3. **[Is the client served as static files?](is-the-client-served-as-static-files.md)**
   [7] Decides whether the client can boot and navigate with no network, which prunes the rendering,
   build and hosting choices together.

## The order

Twenty records, in four layers. Each layer's inputs are settled by the layers above it, so the
numbering in [../decisions/](../decisions/) reads as depth: a low number is a decision more things
rest on.

Ordering is by derivation. A decision is never taken before something it derives from, whatever
that would unblock. Among decisions that derive from nothing still open, the one unblocking the
most is taken first.

**What the generator's product questions do not gate.** Whether puzzles are a joy to solve, whether
difficulty is graded, how expensive generation is, and whether v1 ships generated or seeded puzzles
all decide whether the puzzles are *good*. None of them decides what the generator is *built with* —
that follows from the shared language in 0005. They are real and they are not on this road.

### Layer 0 — settled

[0001](../decisions/0001-launch-with-sudoku-then-star-battle.md) which games, in what order.
[0002](../decisions/0002-the-client-holds-and-mutates-puzzle-state.md) the client holds and mutates
puzzle state. [0003](../decisions/0003-this-is-delivered-over-the-web.md) this is delivered over the
web. [0004](../decisions/0004-one-implementation-of-the-puzzle-rules.md) one implementation of the
puzzle rules.

### Layer 1 — ready now

0005. **[Which language do the deployables share?](which-language-do-the-deployables-share.md)** —
      from 0003 and 0004. Also settles what the generator is written in. ADR-0004 leaves open
      whether sharing is by source or by a compiled artifact; this decides it.

0006. **[Is the client served as static files?](is-the-client-served-as-static-files.md)** — from
      0002 and [../guarantees/offline.md](../guarantees/offline.md). The narrow question is whether
      the client boots and navigates with no network, which is not the same as ruling out every
      meta-framework — only their server-per-navigation modes.

0007. **[How long must in-progress work survive, and on which devices?](how-long-must-in-progress-work-survive.md)**
      — from [../guarantees/durability.md](../guarantees/durability.md), which states no bound and
      names no device. ADR-0003 makes this expensive rather than free: the platform ceiling in
      [../constraints.md](../constraints.md) binds.

### Layer 2

0008. **[Does a server exist at all?](what-must-be-true-off-device.md)** — from 0007, plus
      entitlement, push and observability. That file holds the full inventory of candidates and is
      worked whole, because each candidate can be declined on its own and the sum of those refusals
      is a static site nobody chose.

0009. **[What renders the client?](what-renders-the-client.md)** — from 0005 and 0006. Framework,
      minimal library, or neither; the class, not the member.

### Layer 3

0010. **[Which component framework?](which-component-framework.md)** — from 0009. Researched;
      shortlisted to React, Preact and Svelte.

0011. **[Which client storage mechanism?](which-client-storage-mechanism.md)** — from 0007 and 0008.
      The only stack choice with no clean migration path. ADR-0003 adds a constraint on how it is
      reached: one narrow interface, one implementation behind it, nothing reaching around it.

0012. **[What runs the server?](what-runs-the-server-if-there-is-one.md)** — from 0008 and 0005.

0013. **[Which database, if any?](which-database-if-any.md)** — from 0008, and from
      [what must we know about how the app is used?](what-must-we-know-about-how-the-app-is-used.md),
      which decides whether the store must be queryable or can hold opaque bytes. That usage
      question gates the *shape* of this decision only. It does not gate 0008.

0014. **[Where does it deploy?](where-does-this-run.md)** — from 0008, 0012 and 0013. One trap:
      silent recovery after eviction depends on the app and its API being hosted so a server-set
      cookie is judged first-party — see [../constraints.md](../constraints.md).

### Layer 4 — follows from the above

0015. **[What builds and serves the client?](what-provides-the-build-and-dev-server.md)** — from
      0010. Software gets installed here.

0016. **[What runs the tests?](what-runs-the-tests.md)** — from 0015.

0017. **[How is it styled?](how-is-the-app-styled.md)** — from 0010.

0018. **[How does the app stay available offline?](how-does-the-app-itself-stay-available-offline.md)**
      — from 0015, since the precache list is a build output.

0019. **[Which package manager?](which-package-manager.md)** — from 0015 and 0012. Derived from both
      runtimes.

0020. **[What runs the checks on every change?](what-runs-the-checks-on-every-change.md)** — from
      0016. Fills the [../verification.md](../verification.md) stub.

Numbers are the intended sequence, not reservations. A record takes the next free number when it is
written, and if this order changes the numbers here change with it.

Also open, and gating puzzle quality rather than the stack:
[what makes a puzzle a joy to solve](what-makes-a-puzzle-a-joy-to-solve.md),
[is difficulty graded](is-difficulty-graded-and-does-a-grade-promise-anything.md),
[how expensive is generation](how-expensive-is-puzzle-generation.md),
[does v1 ship generated or seeded puzzles](does-v1-ship-generated-or-seeded-puzzles.md),
[how is the codebase laid out](how-is-the-codebase-laid-out.md).

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
