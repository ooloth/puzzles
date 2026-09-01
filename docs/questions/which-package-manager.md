---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Which package manager?

## Why it matters

The smallest decision on the stack list, recorded because it is the one most likely to be made by
typing whatever came to mind, and because two of its failure modes are quiet rather than loud.

## What would settle it

Install speed matters least. What matters is whether the lockfile stays readable to whatever
tooling runs in continuous integration, and whether the trust model has surprises.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, filling in the stack decisions that had no question of their own.

## Options

*pnpm.* Content-addressed store, strict by default, no surprises found.

*npm.* Bundled with Node, slowest, most universally understood.

*Bun.* Fastest by a wide margin, and carrying the two footguns below.

## Findings

**Two Bun-specific hazards were found during the toolchain research, both silent.** Its lockfile
is not forward-compatible, so an older Bun against a newer lockfile fails outright in continuous
integration rather than degrading. And its `trustedDependencies` setting *replaces* the default
allowlist rather than extending it, so trusting one package silently untrusts several hundred
others, including ones that need install scripts to work at all.

**Neither is disqualifying, and both argue for deciding this deliberately rather than by
habit** — which is the entire reason this file exists.
