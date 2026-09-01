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

Three questions are ready — every input they have is answered, and none derives from another. Take
0007 first: it is the only one blocking any code being written at all.

1. **[What runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md)**
   Node, Bun or Deno. Nothing can be installed or run until this is answered, and depending on the
   answer it absorbs the package manager, the test runner and part of the build tool rather than
   leaving them open. Cheaper to prototype than to predict.
2. **[Is the client served as static files?](is-the-client-served-as-static-files.md)**
   Derived from ADR-0002 and the offline guarantee, so it is closer to a recording than a decision.
   Short, and it unblocks the rendering chain.
3. **[Does a server exist at all?](what-must-be-true-off-device.md)**
   ADR-0006 forces one, so what is live is what it holds. Worked whole against its inventory.

## The order

Twenty-two records, in four layers, ending at a deployed hello world. Each layer's inputs are settled by the layers above it, so the
numbering in [../decisions/](../decisions/) reads as depth: a low number is a decision more things
rest on.

Ordering is by derivation. A decision is never taken before something it derives from, whatever
that would unblock. Among decisions that derive from nothing still open, the one unblocking the
most is taken first.

**What the generator's product questions do not gate.** Whether puzzles are a joy to solve, whether
difficulty is graded, how expensive generation is, and whether v1 ships generated or seeded puzzles
all decide whether the puzzles are *good*. None of them decides what the generator is *built with* —
that follows from the shared language in ADR-0005. They are real and they are not on this road.

**What the data model does not gate either.** What a puzzle is across game types, what a player's
state on it looks like, and what crosses the client/server boundary are the decisions that force
deletion when they are wrong — a representation assuming a nine-by-nine grid of digits cannot be
swapped the way a framework can. They still do not block scaffolding: no shell decision, and not
which database, turns on whether a puzzle is a grid or a region graph. So they are worked against
running code rather than ahead of it, and the storage interface ADR-0003 requires is what keeps that
safe.

### Layer 0 — settled

[0001](../decisions/0001-launch-with-sudoku-then-star-battle.md) which games, in what order.
[0002](../decisions/0002-the-client-holds-and-mutates-puzzle-state.md) the client holds and mutates
puzzle state. [0003](../decisions/0003-this-is-delivered-over-the-web.md) this is delivered over the
web. [0004](../decisions/0004-one-implementation-of-the-puzzle-rules.md) one implementation of the
puzzle rules. [0005](../decisions/0005-typescript-across-every-deployable.md) TypeScript across every
deployable, with the rules shared as source.
[0006](../decisions/0006-what-a-players-work-survives.md) what a player's work survives, per persona.

### Layer 1 — ready now

0007. **[What runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md)** —
      from ADR-0005. Node, Bun or Deno. Nothing installs or runs until this is answered, and it may
      absorb 0011, 0019 and part of 0015 rather than leaving them open.

0008. **[Is the client served as static files?](is-the-client-served-as-static-files.md)** — from
      0002 and [../guarantees/offline.md](../guarantees/offline.md). The narrow question is whether
      the client boots and navigates with no network, which is not the same as ruling out every
      meta-framework — only their server-per-navigation modes.

0009. **[Does a server exist at all?](what-must-be-true-off-device.md)** — from ADR-0006, plus
      entitlement, the catalogue, push and observability. ADR-0006 forces one, so the live part is
      what it holds. Still worked whole against the inventory in that file.

### Layer 2 — what scaffolding needs

0010. **[How is the codebase laid out?](how-is-the-codebase-laid-out.md)** — from 0007. One package
      or several, and where the shared rules module sits, which ADR-0004 requires to be reachable
      from both the client and a batch process.

0011. **[Which package manager?](which-package-manager.md)** — from 0007, which may answer it
      outright.

0012. **[What renders the client?](what-renders-the-client.md)** — from ADR-0005 and 0008.
      Framework, minimal library, or neither; the class, not the member.

0013. **[What runs the server?](what-runs-the-server-if-there-is-one.md)** — from 0007 and 0009.

### Layer 3 — the first install and the first deploy

0014. **[Which component framework?](which-component-framework.md)** — from 0012. Researched;
      shortlisted to React, Preact and Svelte.

0015. **[What builds and serves the client?](what-provides-the-build-and-dev-server.md)** — from
      0007 and 0014. **Software gets installed here.**

0016. **[Where does it deploy?](where-does-this-run.md)** — from 0007, 0009 and 0013. **A hello
      world is live here.** One trap: a session cookie is capped back to seven days if Safari judges
      the server setting it not genuinely first-party, which is the shape of a static host with its
      API elsewhere — see [../constraints.md](../constraints.md).

### Layer 4 — once there is running code to decide against

0017. **[Which client storage mechanism?](which-client-storage-mechanism.md)** — from ADR-0006 and
      0009. The only stack choice with no clean migration path, which is why ADR-0003 requires one
      narrow interface with a single implementation behind it and nothing reaching around it.

0018. **[Which database, if any?](which-database-if-any.md)** — from 0009 and
      [what must we know about how the app is used?](what-must-we-know-about-how-the-app-is-used.md),
      which decides whether the store is queryable or holds opaque bytes.

0019. **[What runs the tests?](what-runs-the-tests.md)** — from 0007 and 0015.

0020. **[How is it styled?](how-is-the-app-styled.md)** — from 0014.

0021. **[How does the app stay available offline?](how-does-the-app-itself-stay-available-offline.md)**
      — from 0015, since the precache list is a build output.

0022. **[What runs the checks on every change?](what-runs-the-checks-on-every-change.md)** — from
      0019. Fills the [../verification.md](../verification.md) stub.

Numbers are the intended sequence, not reservations. A record takes the next free number when it is
written, and if this order changes the numbers here change with it.

Also open, and gating puzzle quality rather than the stack:
[what makes a puzzle a joy to solve](what-makes-a-puzzle-a-joy-to-solve.md),
[is difficulty graded](is-difficulty-graded-and-does-a-grade-promise-anything.md),
[how expensive is generation](how-expensive-is-puzzle-generation.md),
[does v1 ship generated or seeded puzzles](does-v1-ship-generated-or-seeded-puzzles.md).

Also open, and worked against running code rather than ahead of it:
[what is a puzzle across game types](what-is-a-puzzle-across-game-types.md),
[is puzzle state a snapshot or an event log](is-puzzle-state-a-snapshot-or-an-event-log.md),
[what crosses the client/server boundary](what-crosses-the-client-server-boundary.md),
[does the server understand puzzle content](does-the-server-understand-puzzle-content.md).

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
