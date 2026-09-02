---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What runs TypeScript outside the browser?

## Why it matters

[ADR-0007](../decisions/0007-that-language-is-typescript.md) chose the language and said
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

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Nothing has been measured.** No candidate has been run here.

**The intent is to spike this rather than research it**, and it is the first place in the project
where that applies. Scaffold the same trivial thing under each candidate — a client entry point, a
server that answers one route, a batch script, and the shared rules module imported by two of them —
then run install, typecheck, test, build, serve and the batch script, and record what each took and
what broke. Budget hours. Delete the spikes afterwards; the observation is the artifact.

Deciding this by reading would be choosing on the strength of numbers produced by other people, on
other hardware, for other workloads — which is exactly what
the portable decision-making standard now says not to do where a measurement is
available.

**A Bun preference already exists in [../brainstorming/](../brainstorming/) and it does not survive
inspection.** It rests almost entirely on `bun:sqlite` being a native in-process driver, with
figures like ten thousand inserts in 12ms against Deno's 45ms. Those numbers carry no method, no
hardware, no date and no link. The comparison also never includes Node, and Node now ships a
built-in `node:sqlite`, so the premise that only Bun has fast in-process SQLite is stale on its own
terms. Nothing from it should be imported without being re-run here.

*Unverified — no source recorded.*

> The same document asserts that Bun was acquired by Anthropic and that Claude Code is powered by
> it, and uses that as a reason to consider Bun corporately safe to depend on. Treat this as false
> unless independently confirmed. It is the clearest example of why that folder is marked
> non-authoritative, and of why a claim that flatters a preferred option deserves more scrutiny
> rather than less.

*Unverified — no source recorded.*

**This is coupled to the database choice more than its position suggests.** SQLite performance is a
real difference between these runtimes, and
[which database, if any?](which-database.md) is not decided and does not need to be for a
hello world. The honest handling is to note what each runtime does to the later options rather than
to settle the database early to justify a runtime — which is the direction the brainstorming
document argues in, and it is backwards.
