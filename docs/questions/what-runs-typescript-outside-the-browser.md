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
[what builds and serves the client?](what-builds-the-client-and-serves-it-in-development.md), or leaves all three
open. It also bounds [where does this run?](where-does-this-run.md), since hosts support these
unevenly.

**It is the thing blocking scaffolding.** Nothing can be installed or run until it is answered,
which is why it sits ahead of the questions it would otherwise derive from.

## What would settle it

**This cannot be worked until
[is the store a file or a service?](is-the-store-a-file-or-a-service.md) lands.**
An edge runtime removes a whole tier of candidates, and a long-lived process keeps them, so the field
is not knowable before the shape is. Scaffolding under candidates that the shape would have
disqualified is the wasted half of this work.

It is also answered together with
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md) rather than
before it, because the two constrain each other in both directions.

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

**Bun is owned by Anthropic, and Claude Code runs on it.** Announced 2 December 2025: Anthropic
acquired Oven, the company behind Bun, and describes Bun as "the infrastructure powering Claude Code,
Claude Agent SDK, and future AI coding products & tools". Bun stays MIT-licensed with the same team,
and Bun's own wording on the dependency is "Claude Code ships as a Bun executable to millions of
users. If Bun breaks, Claude Code breaks."

That is a real answer to the ordinary worry about a young runtime — the largest user of this one has
a direct incentive to keep it working. It cuts the other way too, and the record should say so: the
runtime's priorities now answer to an AI coding company's needs, which are not this project's, and a
dependency that is safe because one corporation needs it is safe for exactly as long as that holds.

*Sourced — <https://bun.com/blog/bun-joins-anthropic>, read 2026-09-02.*

**The document's causal story about the Rust rewrite is not supported.** It claimed the Zig-to-Rust
rewrite was "a production requirement for Anthropic's flagship CLI". The rewrite is real and began in
May 2026, and the stated rationale is memory safety. Neither Bun's announcement nor the public record
connects it to Anthropic or to Claude Code.

*Sourced — <https://en.wikipedia.org/wiki/Bun_(software)>, read 2026-09-02. The rewrite's own
announcement was not opened.*

> **A hedge is a request for work, not a finding.** Marking this claim "treat as false unless
> confirmed" and leaving it there is how a caveat hardens into a verdict nobody tested: the
> brainstorming document turned out to be right about the fact and wrong about the reason, and both
> halves were assumed rather than checked. Where a claim carries a hedge, run the search or say
> plainly that nobody has.

**This is coupled to the database choice more than its position suggests.** SQLite performance is a
real difference between these runtimes, and
[which database, if any?](which-database.md) is not decided and does not need to be for a
hello world. The honest handling is to note what each runtime does to the later options rather than
to settle the database early to justify a runtime — which is the direction the brainstorming
document argues in, and it is backwards.

**Writing data access against `node:sqlite` keeps that coupling loose, and this is now established.**
Node's own documentation gives `node:sqlite` a stability of "1.2 - Release candidate", available
without a flag since v23.4.0 and v22.13.0. Bun's Node-compatibility documentation says the module is
"Fully implemented", noting only that `backup()` blocks the event loop where Node runs it on a worker
thread. So the same data-access code runs on both runtimes unchanged.

> So the old premise that only Bun has good in-process SQLite is stale, and with it the strongest
> version of the Bun preference. What survives is narrower: an embedded store disadvantages *Deno*
> specifically, because its npm route to native addons carries the lifecycle-script caveat that Node
> and Bun do not.

*Sourced — [nodejs.org/api/sqlite.html](https://nodejs.org/api/sqlite.html) and
[bun.com/docs/runtime/nodejs-apis](https://bun.com/docs/runtime/nodejs-apis), both read by me
2026-09-02. Note that a research agent reported `node:sqlite` as fully stable in Node 26; the
documentation says release candidate, so that claim is corrected here rather than carried.*

### The store constrains this question through locality, not through engine

**Which engine the store runs is not an input here; whether the store is a file or a service is.**
Under a network-attached store the drivers are portable JavaScript and every candidate runtime is
equal, so the coupling is severed. Under a store opened as a file the runtime's embedded-driver and
native-addon story matters, and the field narrows — by one candidate, per the finding above, rather
than to a single winner.

> So [is the store a file or a service?](is-the-store-a-file-or-a-service.md) has
> to settle store locality *before* this question is answered, not after. Answering this first and
> locality later risks a runtime chosen under an assumption that the later answer reverses.

*Reasoned — 2026-09-02, from the driver facts above.*

**One incompatibility worth knowing early.** `better-sqlite3` does not work under Bun and has not for
three years. Choosing that library is therefore choosing Node, quietly, in a file that looks like it
is about the database.

*Unverified — no source recorded.*
