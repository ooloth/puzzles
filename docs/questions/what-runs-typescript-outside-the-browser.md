---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What runs TypeScript outside the browser?

## Why it matters

[ADR-0005](../decisions/0005-typescript-across-every-deployable.md) chose the language and said
nothing about what executes it. Three things need a non-browser runtime — the server, the generator,
and the tooling that runs tests and checks — and they do not have to agree, though there is little
reason for them not to.

**This is the highest-coupling choice left in the stack.** Node, Bun and Deno differ in what else
they bring: Bun is also a package manager, test runner and bundler; Deno is also a package manager,
test runner, formatter and linter; Node is none of those and expects them to be chosen separately.
So this decision either absorbs [which package manager?](which-package-manager.md),
[what runs the tests?](what-runs-the-tests.md) and part of
[what builds and serves the client?](what-provides-the-build-and-dev-server.md), or leaves all three
open. It also bounds [where does this run?](where-does-this-run.md), since hosts support these
unevenly.

**It is the thing blocking scaffolding.** Nothing can be installed or run until it is answered,
which is why it sits ahead of the questions it would otherwise derive from.

## Blocked by

N/A — [ADR-0005](../decisions/0005-typescript-across-every-deployable.md) settled the language, and
nothing else is required. Ready to work on now.

## Blocks

[Which package manager?](which-package-manager.md),
[what runs the tests?](what-runs-the-tests.md),
[what runs the server?](what-runs-the-server-if-there-is-one.md),
[where does this run?](where-does-this-run.md), and
[what runs the checks on every change?](what-runs-the-checks-on-every-change.md). Some of those it
may answer outright rather than merely constrain.

## What would settle it

Scaffolding a hello-world under each candidate and running the actual loop — install, typecheck,
test, build, run a server, run a batch script — rather than comparing feature lists. This is a
decision where prototyping is cheaper than predicting, and the cost of being wrong is a re-scaffold
rather than a migration.

What to weigh: whether the bundled tooling is good enough to remove separate choices or merely
present, how each behaves on the intended host, and how much of the ecosystem assumes Node.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, on finding that the order tracked a server runtime and a package manager
separately while nothing asked what executes TypeScript outside the browser at all.

## Options

*Node.* The default assumption of the ecosystem, and the one every host supports. Brings nothing
else, so package manager, test runner and bundler stay separate decisions.

*Bun.* Runtime, package manager, test runner and bundler in one. Fastest to scaffold and the
strongest simplification if the bundled parts hold up. Younger, and host support is narrower.

*Deno.* Runtime with tooling included and a different module and permissions model. Strong
TypeScript story natively.

*Different runtimes for different deployables.* The generator is a batch process with no host
constraints; the server has hosting constraints the generator does not. Splitting is possible and
costs a second toolchain for one maintainer.

*An edge runtime for the server specifically* — Workers and similar — which is a different execution
model rather than a different implementation of the same one, and constrains what the server can do
more than the others.

## Findings

**Nothing is recorded yet.** No candidate has been evaluated and no benchmark or trial has been run.
