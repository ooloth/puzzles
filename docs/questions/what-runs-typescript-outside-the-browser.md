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

**The store's shape is settled and it did not narrow this field.**
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md),
[ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) and
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md) settle a SQLite file
on an ordinary always-on runtime. All three candidates here ship `node:sqlite` as a built-in, so none
is advantaged or disqualified by the store. What those records do remove is the edge
runtime, which is struck from the options below rather than weighed there.

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

*An edge runtime for the server specifically* — Workers and similar. **Ruled out** by
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md): the store cannot
be at the edge, so edge compute reading a central store adds a network hop rather than removing one.
Kept in the list because it is the option somebody would otherwise reach for, and knowing it was
considered is worth more than a shorter list.

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

**The coupling to the database ran the other way and has now been cut.** The concern was that
settling a runtime early would settle the store by convenience. The store is settled first
([ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md)), and it turned out not to advantage any
runtime, so this is now a free choice rather than a constrained one.

**Driver performance is a live input here, and it is this question's to weigh rather than the store's.**
The runtimes are not interchangeable on it: `node:sqlite` and `better-sqlite3` sit within about 1.5x
either way on the one comparison with a disclosed method, Bun's larger published claim is a read-only
benchmark from 2022 predating `node:sqlite`, and Deno's implementation is native Rust over rusqlite
with no published numbers at all. Bun also ships a native Postgres client, `Bun.SQL`, which is not
relevant to a SQLite store but is evidence about where its effort goes. Absolute throughput for single
keyed inserts is in the tens of thousands per second, against a plausible load under a hundred — so
none of this binds, and it should not be allowed to decide the runtime by itself.

*Sourced — second-hand from a research agent, 2026-09-03; the Deno rusqlite basis is from a Deno
GitHub discussion not opened by me.*

**Writing data access against `node:sqlite` keeps that coupling loose, and this is now established.**
Node's own documentation gives `node:sqlite` a stability of "1.2 - Release candidate", available
without a flag since v23.4.0 and v22.13.0. Bun's Node-compatibility documentation says the module is
"Fully implemented", noting only that `backup()` blocks the event loop where Node runs it on a worker
thread. So the same data-access code runs on both runtimes unchanged.

**Deno ships it too, so the coupling is not loose — it is absent.** Deno's own Node-built-in
compatibility reference lists `node:sqlite` among its fully supported modules, added in Deno v2.2,
with further APIs in 2.7. It is a genuine built-in: no npm specifier, no `node_modules`, no FFI
permission flag, no native addon.

> So no runtime is disadvantaged by an embedded store, and the store's locality does not narrow the
> runtime field at all. The same data-access code runs unchanged on all three.

*Sourced — [nodejs.org/api/sqlite.html](https://nodejs.org/api/sqlite.html) and
[bun.com/docs/runtime/nodejs-apis](https://bun.com/docs/runtime/nodejs-apis) read 2026-09-02, and
[Deno's Node API compatibility reference](https://docs.deno.com/runtime/reference/node_apis/) read
2026-09-03. All three opened by me. A research agent reported `node:sqlite` as fully stable in
Node 26; the documentation says release candidate, so that is what is recorded.*

### The store was checked as an input here and is not one

**Neither the engine nor the locality narrows this field.** The engine was the weaker candidate for
mattering and never did: drivers are the runtime's business, not the engine's. Locality looked like it
mattered — under a store opened as a file, a runtime's embedded-driver and native-addon story is on
the path — and the finding above settles that it does not, because all three ship `node:sqlite` as a
genuine built-in.

> So the store questions are answered and they left three candidates standing. Nothing in
> [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md),
> [ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) or
> [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) advantages or disqualifies
> Node, Bun or Deno. Spike all three.

*Reasoned — 2026-09-03, from the driver facts above.*

**One incompatibility worth knowing early.** `better-sqlite3` does not work under Bun and has not for
three years. Choosing that library is therefore choosing Node, quietly, in a file that looks like it
is about the database. It is avoidable rather than decisive, since `node:sqlite` runs on all three.

*Unverified — no source recorded.*
