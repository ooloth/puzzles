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

## The order

Each entry names what it derives from, so the order is checkable rather than asserted. If an
entry's inputs are all answered, it is ready. If they are not, working it produces an answer that
is arbitrary and will not look arbitrary.

Ordering is by derivation only. Nothing is placed because it is quick, cheap or unblocking; that is
why the package manager is last in its chain rather than first.

[ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md) chose web delivery. It was the root
of this order, so it is now a standing input cited as `ADR-0003` rather than by position.

### There are two chains, and they do not depend on each other

ADR-0003 unblocked the whole client chain at once. Nothing in it needs a product decision, because
the promises that are still open — how long work survives, what we must learn from play — do not
discriminate between any of the candidates. Every framework under consideration can render a grid,
hold state locally and work offline.

The server chain is different. It cannot start until two promises are made, because whether a
server exists at all depends on them.

So this is not one list worked top to bottom. It is two lists, and the client chain is ready now
while the server chain is not.

**Three things this does not license.**

Being unblocked is not permission to skip the derivation. Each entry below still gets its inputs
checked and still produces a record, and an entry whose inputs are answered is *ready to argue*,
not already decided.

Nothing gets installed because one question was answered. The client chain ends at a package
manager for a reason: installing is what happens after the chain, not during it.

One chain is worked at a time. They are independent, which means either can be picked up — not
that both should be in flight. Two open chains is two contexts to hold, and the roots in the
server chain are the harder thinking.

### The client chain — ready now

Every entry here derives from ADR-0003 or from another entry in this chain. None of it waits on
anything in the server chain.

C1. **[Is there one implementation of the puzzle rules?](is-there-one-implementation-of-the-puzzle-rules.md)**
    — from ADR-0003. Its force is that one language must serve both a browser and a batch process.
    ADR-0003 gives it a second job: a rules engine that stays a pure module is what keeps a native
    shell cheap to add later. Start here — it is the most upstream entry in this chain.

C2. **[Is the client served as static files?](is-the-client-served-as-static-files.md)** — from
    ADR-0003. Implied by ADR-0002 plus the offline guarantee, and decided nowhere. Rules
    meta-frameworks in or out, which prunes C4 and C5 substantially.

C3. **[Which language do the deployables share?](which-language-do-the-deployables-share.md)** —
    from ADR-0003 and C1.

C4. **[What renders the client?](what-renders-the-client.md)** — from C2 and C3. Framework, minimal
    library, or neither; the class, not the member.

C5. **[Which component framework?](which-component-framework.md)** — from C3 and C4. Researched;
    shortlisted to React, Preact and Svelte.

C6. **[What builds and serves the client?](what-provides-the-build-and-dev-server.md)** — from C5.
    Researched.

C7. **[How does the app stay available offline?](how-does-the-app-itself-stay-available-offline.md)**
    — from C6, since the precache list is a build output.

C8. **[What runs the tests?](what-runs-the-tests.md)** — from C6.

C9. **[How is it styled](how-is-the-app-styled.md) and
    [laid out](how-is-the-codebase-laid-out.md)?** — from C5.

C10. **[What runs the checks on every change?](what-runs-the-checks-on-every-change.md)** — from
     C8. Fills the [../verification.md](../verification.md) stub.

### The server chain — twelve deep, and only its first entries are ready

Whether a server exists is decided at S8, and S8 needs two promises. One of them, S7, sits on top
of five generator questions that nobody has worked. **This chain is much further from its stack
decisions than the client chain is**, and the depth is the reason to expect it to take longer
rather than a reason to skip ahead inside it.

S1, S2 and S6 are ready now. Nothing derives them.

**No entry before S8 concludes that a server exists.** Each answers only what must be true. That
conclusion is drawn once, at S8, with every candidate in view — the inventory lives in that file,
and the reason it is gathered rather than settled piecemeal is recorded there.

S1. **[How long must in-progress work survive, and on which devices?](how-long-must-in-progress-work-survive.md)**
    [../guarantees/durability.md](../guarantees/durability.md) with a bound and a device scope.
    Written without either, it has been read as anything. ADR-0003 makes this expensive rather than
    free: the platform ceiling in [../constraints.md](../constraints.md) binds, where a native app
    would have made "indefinitely, on this device" close to free.

S2. **[How expensive is puzzle generation?](how-expensive-is-puzzle-generation.md)** — the base of
    the generator chain.

S3. **[Does v1 ship generated or seeded puzzles?](does-v1-ship-generated-or-seeded-puzzles.md)** —
    from S2.

S4. **[What makes a puzzle a joy to solve?](what-makes-a-puzzle-a-joy-to-solve.md)** — from S3.
    The stated point of the project, currently answered in one line.

S5. **[Is difficulty graded, and does a grade promise anything?](is-difficulty-graded-and-does-a-grade-promise-anything.md)**
    — from S4, and a promise, so it outranks what derives from it. If a grade promises the player
    something, keeping it honest requires calibrating the generator against real solves, which is
    S7's strongest demand. If a grade promises nothing, that demand is curiosity and fails the
    guard question in [../problem.md](../problem.md).

S6. **[Do privacy regulations apply?](do-privacy-regulations-apply.md)** — ready now, and
    independent of S2 through S5. Recording how puzzles are solved is collecting behavioural data
    about players. [../constraints.md](../constraints.md) closes by recording that these obligations
    are unresearched, so S7 cannot decide to collect anything before this is known.

S7. **[What must we know about how the app is used?](what-must-we-know-about-how-the-app-is-used.md)**
    — from S5 and S6. Including what the maintainer wants to learn from historical play, which is
    the argument for a store that can be queried rather than one that holds opaque bytes.

S8. **[Does a server exist at all?](what-must-be-true-off-device.md)** — from S1 and S7, and from
    [is there a paid tier?](is-there-a-paid-tier.md), since entitlement is the one thing a device
    cannot be trusted to hold. Holds the full inventory of candidates; worked whole, in one sitting.

S9. **[What does the server do with puzzle state?](what-does-the-server-do-with-puzzle-state.md)**
    — from S8.

S10. **[What runs the server?](what-runs-the-server-if-there-is-one.md)** — from S8.

S11. **[Which database, if any?](which-database-if-any.md)** — from S8 and S7. A non-decision only
     if both queryable-store candidates in S8 lose.

S12. **[Where does it deploy?](where-does-this-run.md)** — from S8, S10 and S11. Late on purpose;
     it was decided first last time. One trap: silent recovery after eviction depends on the app
     and its API being hosted so a server-set cookie is judged first-party — see
     [../constraints.md](../constraints.md).

### Where the chains meet

Neither of these can be worked until both chains reach the entries they name.

J1. **[Which client storage mechanism?](which-client-storage-mechanism.md)** — from S1 and S8, plus
    [what a player can do with no network](what-can-a-player-do-with-no-network.md) for volume and
    [snapshot or event log](is-puzzle-state-a-snapshot-or-an-event-log.md) with
    [undo depth](is-undo-in-scope-and-how-far-back.md) for shape. The only stack choice with no
    clean migration path. ADR-0003 adds a constraint on how it is reached rather than on what is
    chosen: one narrow interface, one implementation behind it, nothing reaching around it.

J2. **[Which package manager?](which-package-manager.md)** — from C6 and S10. Last because it is
    derived from both runtimes, not first because it is easy.

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
