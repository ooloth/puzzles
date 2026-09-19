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

**It survived the runtime.** Two of the candidate runtimes shipped a package manager and would have
answered this by consequence, but [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) chose Node, which ships npm without requiring it. So
this is still a choice, and it is now the first open question in M1's order.

**The field below is not the field.** It holds pnpm, npm and Bun. Bun is out as a package manager for
the same reason it is out as a runtime — adopting its installer means adopting its runtime — and yarn
was never listed at all. Rebuild it from the registry before deciding, or the decision is made over a
shortlist somebody assembled for a different question.

Install speed matters least. What matters is whether the lockfile stays readable to whatever
tooling runs in continuous integration, and whether the trust model has surprises.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, filling in the stack decisions that had no question of their own.

## Options

**All three deny dependency install scripts by default**, through three different configuration
shapes, so none of them is the safe one and none is the hazardous one. What separates them is which
allowlist is least likely to be got wrong, and nothing here has compared them on that.

*pnpm.* Content-addressed store, strict by default. Install scripts are governed by `allowBuilds`.

*npm.* Bundled with Node, slowest, most universally understood. Install scripts are governed by an
`allowScripts` policy on the root package.

*Bun.* **Out**, by [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md): its installer is part of its runtime and that runtime is not this
one. Its install-script model is recorded under **Findings** because the comparison of allowlist
designs is still useful, not because it is a candidate.

*yarn.* Missing from this list until 2026-09-19 and unexamined. Its presence here is a marker that the
field needs rebuilding rather than a case for it.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**`trustedDependencies` replaces the default allowlist rather than extending it, and Bun documents
this itself.** Both its lifecycle-scripts page and its install guide say: "Defining
`trustedDependencies` in your `package.json` replaces this default list rather than extending it, so
also list any packages from the default list whose lifecycle scripts you still need." The default list
is `src/install/default-trusted-dependencies.txt` in Bun's own repository and holds **367 entries**, so
trusting one package does untrust several hundred others.

*Sourced — [bun.com/docs/pm/lifecycle](https://bun.com/docs/pm/lifecycle) and
[bun.com/guides/install/trusted](https://bun.com/guides/install/trusted) for the quote, and the
default-trusted-dependencies file read directly for the count. Read 2026-09-17 by a research agent. I
did not open them.*

*This is documented behaviour rather than a hidden trap, and the distinction matters for how it is
weighed: Bun states it on the page you would be reading in order to set the field.*

**The lockfile claim is still undocumented, and the evidence for it is user reports.** Nothing on
Bun's lockfile page, its `install` CLI page or its text-lockfile announcement addresses what happens
when a lockfile was written by a different Bun version. What exists is issue reports of hard failures
rather than graceful degradation, including oven-sh/bun 15288, where a `--frozen-lockfile` run against
a lockfile from a different version fails with "error: lockfile had changes, but lockfile is frozen"
and no explanation of why.

*Unverified at its source, and corroborated by issue reports — three Bun documentation pages were
searched on 2026-09-17 by a research agent and none addresses cross-version lockfile compatibility.
Treat the behaviour as reported rather than specified, and note that an unspecified behaviour can
change without a changelog entry.*

**The comparison this file was built on has gone stale, and it is the most consequential finding
here.** The Options above frame Bun as carrying footguns that pnpm and npm do not. Both of the others
have since changed in the same direction:

- **pnpm removed `onlyBuiltDependencies`, `onlyBuiltDependenciesFile`, `neverBuiltDependencies`,
  `ignoredBuiltDependencies` and `ignoreDepScripts` in v11**, replacing all five with a single
  `allowBuilds` map. Current pnpm is 12.4.2, published 2026-09-15. The default is still deny: "Packages
  not listed in `allowBuilds` are disallowed by default and are treated as unreviewed."
- **npm reversed its default in 12.0.0, released 2026-07-08**: "Dependency lifecycle scripts are now
  blocked by default unless allowed by the root package's `allowScripts` policy." Current npm is
  12.0.2.

So all three now deny dependency install scripts by default, through three different mechanisms with
three different configuration shapes. **The question is no longer whether a candidate has a trust
footgun; it is which allowlist shape is least likely to be got wrong**, and nothing here has compared
them on that. Whether an older toolchain is in use is worth checking separately: a machine still on
npm 11 has the old permissive default and nothing announces it.

*Sourced — [pnpm.io/settings/build](https://pnpm.io/settings/build) and
[the npm 12.0.0 release notes](https://github.com/npm/cli/releases/tag/v12.0.0), plus registry metadata
for both current versions, read 2026-09-17 by a research agent. I did not open them.*

**So "neither is disqualifying" still holds, and the reason has changed.** It was that Bun's two
hazards were survivable. It is now that every candidate has an install-script policy to configure and
none of them has been compared on how easy it is to configure correctly.
