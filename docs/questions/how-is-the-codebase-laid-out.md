---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How is the codebase laid out?

## Why it matters

Nothing can be scaffolded until files have somewhere to go, so some answer is needed for M1. Not all
of it: how many packages there are and where the shared rules module sits are needed to put the
first file down, while what a directory is named for and how deep the tree goes can settle once
there are modules to organise.

[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) and
[ADR-0007](../decisions/0007-that-language-is-typescript.md) together set the one hard
constraint: the puzzle rules are one implementation, shared as source, reachable by both a browser
and a batch process without a publish step between them. Whatever shape is chosen has to allow that.

## What would settle it

Scaffolding it. Create the shape, import the rules module from a browser entry point and from a
batch script, and see whether the tooling complains. What to check while doing it: whether the
browser build resolves the import without a publish step, whether type checking works across the
boundary, and whether the batch script can run the same source the browser bundles.

Being wrong here is cheap, which is unusual for an M1 decision. Moving between one package and
several is a file move and a configuration change — no data migration, nothing a player sees. That
is an argument for the simpler option and letting the need appear.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Options ported from legacy ADR-23 (organize by domain concept, not technical layer). The sketch
below was drawn as directories at the repo root before being recorded here.

## Options

*One package.* Everything in a single project with directories for the client, the server, the
generator and the rules. Nothing to configure, no workspace tooling, no publish semantics. The
shared rules module is a directory that everything imports by relative path.

*Workspaces.* Separate packages for the deployables and the shared rules, related by whatever the
package manager provides. Real boundaries the tooling enforces, at the cost of configuration and a
class of resolution problem that does not exist in a single package.

*Separate repositories.* Listed to be dismissed: it puts a publish step between the rules and their
consumers, which ADR-0004 forbids.

Within any of those, a second axis. **By domain concept:** folders named for what the code is about
— a player and their progress, one game's rules, storage — so a name answers "where would I find X"
without the reader knowing which technical layer a concept lives in. **By technical layer:** one
`routes/`, `views/`, `models/` spanning every game. And within domain organisation, one shared
module holding every game's rules, or a module per game: a shared module keeps the tree smaller, but
editing one game recompiles the others and nothing but convention stops one game reaching into
another's internals.

### A sketch, drawn outside-in

Deployables at the top, a functional core beneath them, storage as its own concern:

```
apps/
  web-frontend/     the client
  web-backend/      imperative shell over core/
  generator/        puzzle generator workload; imperative shell over core/
core/
  sudoku/           pure domain logic, used by both generation and play
store/              storage, server-side and client-side
scripts/            lint and ops helpers
```

It reads as the architecture rather than as a framework's conventions, and a newcomer can guess
where something lives from the top level alone.

Four things it decides that are open, and it is worth being explicit that a sketch is not an
argument for any of them. It assumes **workspaces** rather than one package. It splits **frontend
from backend** as separate deployables. It puts rules in a **per-game module** (`core/sudoku`)
rather than one shared module, which the second axis above has not settled. And `store/` couples
server-side and client-side storage in one place, which is two decisions —
[which database](which-database.md) and
[which client storage mechanism](which-client-storage-mechanism.md) — that are open and may not want
the same home.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The number of consumers of a game's rules is what decides whether a shared interface is worth
having.** A server-rendered design had two, a web binary and a generator, which was too few. A
local-first design has three — generator, client, and possibly a server — across two runtimes. Three
consumers across a runtime boundary is the pressure that produces a shared interface, so this
follows from [ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) and the
runtimes it implies rather than from taste.

**The structural criteria hold whichever option wins**, so they are not inputs to the choice: where
a package boundary is earned, when repetition is acceptable, and domain logic staying free of I/O.
They live in the portable standards described in [../standards/README.md](../standards/README.md).
