---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What is the repo's top-level shape?

## Why it matters

Nothing can be scaffolded until files have somewhere to go. This is the smallest version of that:
how many packages exist, and whether the shared rules module is one of them.

[ADR-0004](../decisions/0004-one-implementation-of-the-puzzle-rules.md) requires one implementation
of the puzzle rules reachable by both a browser and a batch process, and
[ADR-0005](../decisions/0005-typescript-across-every-deployable.md) requires it shared as source
rather than as a compiled artifact. That is a real constraint on the answer: whatever shape is
chosen has to let two runtimes import the same files without a publish step between them.

It is separated from [how is the codebase laid out?](how-is-the-codebase-laid-out.md), which asks
how modules are organised *within* whatever this decides. That question is not blocking anything —
there are no modules yet — and answering it now would mean guessing at a tree nobody has needed.

## Blocked by

[What runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md) —
workspace support differs between runtimes and package managers, and one of them may make this
choice for us.

## Blocks

Every other M1 question, since none of them can be scaffolded without somewhere to put the files.

## What would settle it

Scaffolding it. This is a question where the smallest real attempt beats any amount of comparison:
create the shape, import the rules module from a browser entry point and from a batch script, and
see whether the tooling complains.

What to check while doing it: whether the browser build resolves a workspace import without a
publish step, whether type checking works across the boundary, and whether the batch script can run
the same source the browser bundles.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split from [how is the codebase laid out?](how-is-the-codebase-laid-out.md) on 2026-09-01, because
one clause of it blocks scaffolding and the rest does not.

## Options

*One package.* Everything in a single project with directories for the client, the server, the
generator and the rules. Nothing to configure, no workspace tooling, no publish semantics. The
shared rules module is a directory that everything imports by relative path.

*Workspaces.* Separate packages for the deployables and the shared rules, related by whatever the
package manager provides. Real boundaries the tooling enforces, at the cost of configuration and a
class of resolution problem that does not exist in a single package.

*Separate repositories.* Listed to be dismissed rather than because anyone would choose it: it
breaks the one-implementation requirement in ADR-0004 by putting a publish step between the rules
and their consumers.

## Findings

**The number of consumers is what usually decides this, and here it is three across two runtimes.**
The rules module is imported by the client, by the generator, and possibly by a server — see
[does the server understand puzzle content?](does-the-server-understand-puzzle-content.md). Three
consumers spanning a browser and a non-browser runtime is the pressure that ordinarily earns a
package boundary. Whether it earns one at this size, with one maintainer and no code yet, is the
actual question.

**Being wrong here is cheap, which is unusual for an M1 decision.** Moving from one package to
workspaces is a file move and a configuration change, with no data migration and no player-visible
effect. That is an argument for choosing the simpler option and letting the need appear, rather than
predicting it.
