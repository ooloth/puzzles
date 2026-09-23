---
updated: 2026-09-19
update_when: the linker changes, or a dependency forces an exception that has to be configured
decays: slow
status: active
---

# No package imports what it does not declare

Every package here reaches only what its own manifest names. An import of anything else fails when
it is written, rather than resolving through a dependency that some other package happens to have
pulled in.

## Why it holds

A hoisted `node_modules` puts every transitive dependency in scope for every package, so an import
of something never declared resolves and works. It keeps working until a dependency somewhere else
in the tree moves, drops or renames that package. Then it breaks, in a package that did not change,
because of a change nobody connected to it.

That is the whole cost: not that the import is wrong, but that the moment it is wrong is separated
from the moment it was written, by months and by an unrelated edit.
[ADR-0033](../decisions/0033-an-import-of-an-undeclared-dependency-fails.md) chose the layout that
collapses that gap to zero.

**It has no sanctioned exception**, which is why it is here rather than in
[../standards/](../standards/). A package that needs to import something it has not declared does
not have an unusual manifest; it has a wrong one, and the fix is to declare the thing.

## What it costs, and why that is small

Nothing in ordinary work. A package that uses something adds it to its own manifest, which is what
the manifest is for.

The real cost lands on third-party packages that rely on reaching something they never declared.
Those fail here and work elsewhere, and the fix is per-package configuration rather than abandoning
the property. That is the reason a hoisted mode exists at all, and it is why
[ADR-0033](../decisions/0033-an-import-of-an-undeclared-dependency-fails.md) is a decision with a
live alternative rather than a formality.

## Enforced by

**The linker, and only while it stays at its default.** pnpm's isolated layout enforces this itself,
at import time, loudly: an undeclared import throws `ERR_MODULE_NOT_FOUND` rather than resolving. No
test is needed to catch a violation in application code, because the runtime is the test.

**What nothing enforces is the configuration.** Setting `node-linker: hoisted` in
`pnpm-workspace.yaml` withdraws this invariant in one line, and that line looks exactly like a fix
when somebody is debugging a deployment that cannot follow symlinks. Nothing would report it, and
every undeclared import written afterwards would resolve quietly.

**So the check this owes is a check on the configuration, not on the code**: assert that the linker
is not hoisted, or equivalently that a known transitive dependency is unreachable from a package
that has not declared it. The second is better, because it tests the property rather than the
setting that currently provides it, and so survives a change of package manager.

Neither exists yet.
[What runs the checks on every change?](../questions/what-runs-the-checks-on-every-change.md) at M2
is where the runner gets decided, and this check is part of that slice's definition of done. This
file is what says so.

## Where it came from

Measured while choosing the package manager: declaring only `vite` and importing `esbuild`, one of
its transitive dependencies, resolved under a hoisted layout and threw under an isolated one. That
observation is the largest single reason for
[ADR-0032](../decisions/0032-the-package-manager-is-pnpm.md), and the full working is in the question
file that record deleted, readable at
`git show f182e0b:docs/questions/which-package-manager.md`.
