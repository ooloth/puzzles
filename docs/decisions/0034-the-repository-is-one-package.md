---
number: 0034
status: accepted
date: 2026-09-20
amended: 2026-09-22
---

# 34 — the repository is one package

## Forced by

[ADR-0005](0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) requires one
implementation of the puzzle rules, reachable by a browser build and by a process outside the
browser with no publish step between them. That is the only hard requirement any layout has to meet,
and it was measured to hold in every shape considered, so it selects none of them.

[ADR-0032](0032-the-package-manager-is-pnpm.md) settles the package manager, which is what made the
workspace mechanics knowable rather than assumed.

[ADR-0033](0033-an-import-of-an-undeclared-dependency-fails.md) was the reason to expect a workspace
was needed, and it turns out not to be: pnpm's isolated linker refuses an undeclared transitive
dependency from one manifest exactly as it does from four. That record is satisfied here without a
workspace.

[../constraints.md](../constraints.md) records that Node refuses to strip types under a
`node_modules` path. A single package never places source there, so the constraint cannot arise.

[../problem.md](../problem.md) ranks clarity over cleverness because one person maintains this, and
ranks present need over future-proofing.

The portable code-structure standard holds that a package boundary is earned by having two
consumers, and that code with a single consumer gains no compile isolation and no dependency hygiene
from its own package. The portable decision-making standard requires options to be weighed by what
each forecloses rather than by which is better today.

## Decision

**The repository is one package.** One `package.json` at the root, no workspace declared, and no
per-deployable manifests. The client, the server, the generator and the shared rules are directories
under `src/`.

Type checking is scoped per directory rather than per package: one base configuration carries the
compiler options, and `src/rules/`, `src/client/`, `src/server/` and `src/generator/` each carry a
short `tsconfig.json` differing only in `lib` and `types`. This is not a property of the choice —
`lib` and `types` cannot be scoped within one configuration, so every layout needs several
configurations. It is stated here so that the count of configuration files is not mistaken for a
cost this decision introduces.

**This preserves one option deliberately.** A workspace sibling is placed under `node_modules` by
`pnpm deploy`, which under the constraint above yields an artifact that fails at its first import.
Choosing one package leaves [what shape is the deployable?](../questions/what-shape-is-the-deployable.md)
unconstrained, where a workspace would have required the rules module to be compiled before shipping
or the deployable to be built by copying the tree.

## Enforced by

No `packages` field in `pnpm-workspace.yaml`, and no manifest below the root. The file itself may
exist: from pnpm 11 it is where a project's pnpm settings live, even in a repository that declares
no workspace, so its absence is not the test.

**What is not enforced is the boundary between the four directories**, and that is the substance of
what this record gives up rather than an incidental gap. A client module importing a server module
is refused by `tsc`, because the client's configuration carries no Node types, and is accepted by
`vite build` with a warning that the Node built-in "has been externalized for browser
compatibility". So the guard is the type check, and nothing in this repository runs any check today.
[What runs the checks on every change?](../questions/what-runs-the-checks-on-every-change.md) at M2
is what closes that, and until it lands the guard exists without running.

## Rejected

**A pnpm workspace, with the rules module consumed as raw TypeScript source.** The case for it is
real and is why this is a decision rather than a formality. It is the only shape where the tooling
refuses a cross-boundary import outright: `vite build` fails with a resolution error where the
single package merely warns. Four short manifests are not overhead but the mechanism, each stating
what one thing may reach. The entry document sits beside the client rather than at the repository
root, which reads better. Rejected because **the boundaries it buys surround three directories that
have one consumer each** — nothing imports the client, the server or the generator — and the
portable code-structure standard holds that such a boundary is not earned. The rules module is the
only code here with several consumers, and it is shared without a publish step under this record as
readily as under that one. **Reverses if** any of the three gains a second consumer, or if a
cross-boundary import reaches the tree and the type check does not catch it.

**A pnpm workspace, with the rules module compiled to JavaScript before consumers use it.** Its case
is that it keeps the enforced boundaries and removes the packaging hazard entirely, since compiled
output under `node_modules` is not something Node has to strip. Rejected for the same reason as
above, which disqualifies it on its own; the additional cost, that it puts a build step between
editing a rule and running it in the loop that runs most often, is why it is not the better of the
two workspace variants rather than why it is out. **Reverses if** the reason above reverses.

**Not yet.** Its case is the strongest of any deferral in M1: the first slice needs one file, being
wrong here costs a file move, and everything learned before deciding would be information this
decision was otherwise made without. Rejected because **there is no arrangement that defers it** —
the first manifest either sits at the repository root or beside a deployable, and writing it either
way is the choice. Deferral would mean the shape is selected by whoever writes the first file rather
than by a record. **Reverses if** a way is found to put down the first file without committing to a
manifest location.

**Separate repositories.** Rejected because it puts a publish step between the rules and their
consumers, which
[ADR-0005](0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) forbids.
**Reverses if** that record does.

**A task orchestrator over the top** — Nx, Turborepo, Moon, Rush, Wireit or Bazel. Rejected here
because none of them is a layout: each adds task caching and a task graph over whatever layout is
chosen, and `pnpm -r` with `--filter` already runs scripts recursively in dependency order and
selects what changed since a git ref. **Reverses if** a named problem appears that filters and
recursive execution do not solve, at which point it is its own decision rather than part of this
one.

## Risk

**The guard that replaces the workspace boundary does not run yet.** A cross-boundary import is
caught by `tsc` and waved through by the bundler with a warning, and nothing invokes `tsc`. The
window is M1, where the tree is a handful of files and the warning is visible in a build nobody is
ignoring. It closes at M2. Naming it is what stops the window being extended by inattention.

**The boundary that will matter most is the one deferred furthest.** The client cannot run server
code, so physics punishes that mistake whatever the layout. The server and the generator both run on
Node, so nothing punishes entanglement between them, and that is the pairing a package boundary
would genuinely protect. The generator does not exist until M8, so this record is made without the
case that would most test it.

**Reversal is cheap in both directions and was measured, not assumed.** Going either way is adding
or deleting manifests and a `pnpm-workspace.yaml` and rewriting import specifiers at every site. At
M1 that is a handful of lines, and it grows with the codebase. This is a decision that can be got
wrong.

## Revisit when

The generator exists and shares code with the server, or any of the client, the server and the
generator gains a second consumer. Either makes a package boundary earned where it is not today.

Also when a cross-boundary import lands in the tree and the type check does not catch it, which
would show the guard this record relies on to be weaker than measured.

## Also update

- [x] questions/README.md — the layout entries in slices 1 and 6 are settled by this; what lives
      inside `src/rules/`, how the rules module is reached, and whether the generator is a third
      deployable stay open in
      [how is the codebase laid out?](../questions/how-is-the-codebase-laid-out.md)
- [x] architecture.md — the deployables and the shared rules now have a stated home, added to
      "what is not decided"
- [x] constraints.md — nothing moved; the type-stripping limit it already carries is cited rather
      than restated, and this record imports no new given
- [x] glossary.md — nothing moved; this introduces no domain term
- [x] guarantees/ — nothing moved; this promises a player nothing
