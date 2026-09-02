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

**This may not survive
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md).** Two of the
candidate runtimes ship a package manager, and adopting one of those answers this question by
consequence rather than by argument. Deciding first means deciding twice.

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

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Two Bun-specific hazards were found during the toolchain research, both silent.** Its lockfile
is not forward-compatible, so an older Bun against a newer lockfile fails outright in continuous
integration rather than degrading. And its `trustedDependencies` setting *replaces* the default
allowlist rather than extending it, so trusting one package silently untrusts several hundred
others, including ones that need install scripts to work at all.

*Unverified — no source recorded.*

**Neither is disqualifying, and both argue for deciding this deliberately rather than by
habit** — which is the entire reason this file exists.
