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

**The rewrite is connected to Anthropic and to Claude, by Bun's own disclosure.** The claim recorded
here — that neither Bun's announcement nor the public record connects the Zig-to-Rust rewrite to
Anthropic or Claude Code — is false. Bun's retrospective opens with: "Disclosure: Bun was acquired by
Anthropic in December 2025. I and others on the Bun team work at Anthropic. I used a pre-release
version of Claude Fable 5 for much of the Rust rewrite." The port ran as roughly 50 Claude Code
workflows over 11 days on a branch named `claude/phase-a-port`, and PR 30412 merged 2026-05-14. The
stated motive is memory safety: use-after-free, double-free and missed frees in error paths become
compiler errors in safe Rust.

What the earlier record got right is that memory safety, not a Claude Code production requirement, is
the stated rationale. What it got wrong is the stronger claim that nothing connects the two, which
one primary source refutes outright.

*Sourced — [bun.com/blog/bun-in-rust](https://bun.com/blog/bun-in-rust), fetched raw 2026-09-04 by a
research agent that quoted the disclosure verbatim. I did not open it. The superseded claim was
tagged Sourced against a Wikipedia article that does not carry the disclosure.*

> **A hedge is a request for work, not a finding.** Marking a claim "treat as false unless confirmed"
> and leaving it there is how a caveat hardens into a verdict nobody tested. This entry is the second
> time that has happened on this exact subject: the brainstorming document was right about the fact
> and wrong about the reason, and the correction over-swung into a claim of no connection at all,
> tagged Sourced, against a source that would not have shown one either way. Where a claim carries a
> hedge, run the search or say plainly that nobody has.

**The coupling to the database ran the other way and has now been cut.** The concern was that
settling a runtime early would settle the store by convenience. The store is settled first
([ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md)), and it turned out not to advantage any
runtime, so this is now a free choice rather than a constrained one.

**Driver performance is a live input here, and it is this question's to weigh rather than the store's.**
`node:sqlite` and `better-sqlite3` sit between 1.1x and 1.7x of each other depending on the query,
with better-sqlite3 ahead on reads and `node:sqlite` ahead on inserts. Bun's own published claim —
"roughly 3-6x faster than `better-sqlite3`" — is a read-only benchmark on the Northwind dataset run
on an M1 MacBook Pro under macOS 12.3.1, which dates it to 2022 and therefore predates `node:sqlite`
entirely; it is disputed on its own tracker as measuring JS object-conversion overhead rather than
query performance, with a counter-benchmark showing better-sqlite3 ahead on a realistic query.
Deno's implementation is widely described as native Rust over `rusqlite`, and that link is not
confirmed from Deno's source. No published numbers exist for it.

Absolute throughput for single keyed inserts is in the tens of thousands per second, against a
plausible load under a hundred, so none of this binds and it should not decide the runtime.

*Sourced — [sqg.dev/blog/sqlite-driver-benchmark](https://sqg.dev/blog/sqlite-driver-benchmark/),
2026-01-19, method disclosed: i9-12900K, 24 cores, 31GB RAM, Linux x64, Node v25.3.0, 10,000 users
and 500,000 posts, WAL with 64MB cache. Iteration count is not disclosed, which is a real gap in the
best-sourced number here. Bun's figure and its method are from
[bun.com/docs/runtime/sqlite](https://bun.com/docs/runtime/sqlite); the dispute is oven-sh/bun issue
4776. All read 2026-09-04 by a research agent; I did not open them.*

**Writing data access against `node:sqlite` keeps that coupling loose, and this is now established.**
Node's own documentation gives `node:sqlite` a stability of "1.2 - Release candidate", available
without a flag since v23.4.0 and v22.13.0. Bun's Node-compatibility documentation says the module is
"Fully implemented", noting only that `backup()` blocks the event loop where Node runs it on a worker
thread. So the same data-access code runs on both runtimes unchanged.

**Deno ships it too, with one asymmetry the earlier wording denied.** Deno's Node-built-in
compatibility reference lists `node:sqlite` among its supported modules, added in Deno v2.2, with
further APIs in 2.7. It is a genuine built-in in the senses that matter for packaging: no npm
specifier, no `node_modules`, no native addon to compile. But it is **not** free of permission flags,
as this file previously claimed. Any file-backed database needs `--allow-read` and `--allow-write`;
only `:memory:` runs unflagged. That boundary is real enough to have had a bypass bug
(GHSA-8vxj-4cph-c596, an `ATTACH DATABASE` escape from those checks).

> So the same data-access code runs unchanged on all three, and no runtime is disqualified by an
> embedded store. The correct claim is narrower than "no runtime is advantaged": Deno asks for two
> permission flags that Node and Bun do not. That is an ergonomic difference in the run command
> rather than a difference in what can be built, and it should not by itself decide anything.

*Sourced — [nodejs.org/api/sqlite.html](https://nodejs.org/api/sqlite.html) and
[bun.com/docs/runtime/nodejs-apis](https://bun.com/docs/runtime/nodejs-apis) read 2026-09-02, and
[Deno's Node API compatibility reference](https://docs.deno.com/runtime/reference/node_apis/) read
2026-09-03. All three opened by me. The permission-flag correction is from a research agent's review
of Deno's permissions documentation 2026-09-04, which I did not open. Node's stability index was
re-checked 2026-09-04 and still reads "1.2 - Release candidate"; a research agent reported it as
fully stable in Node 26 and the documentation does not say so.*

**The three runtimes' governance differs, and it is a live input for a solo maintainer on a
multi-year horizon.** Node is governed by the OpenJS Foundation, with v24 in Active LTS since
2025-10-28 (Maintenance from 2026-10-20), v22 in Maintenance until 2027-04-30, and v26 Current with
LTS scheduled for 2026-10-28. Bun is owned by Anthropic and stays MIT with the same team. Deno is
Deno Land Inc., a venture-funded company rather than a foundation, and its petition against Oracle
over the "JavaScript" trademark is unresolved: the fraud claim was dismissed 2025-06-18, the
genericness and abandonment claims remain active, and a decision is not expected before 2027.

*Sourced — [Node's release schedule](https://raw.githubusercontent.com/nodejs/Release/main/README.md)
fetched raw 2026-09-04 by a research agent, plus Bun's LICENSE.md and the acquisition post. Deno's
version numbers and the trademark timeline come from search summaries the agent did not open
directly, so treat the Deno specifics as the weakest claim in this paragraph.*

### The store was checked as an input here and is not one

**Neither the engine nor the locality narrows this field.** The engine was the weaker candidate for
mattering and never did: drivers are the runtime's business, not the engine's. Locality looked like it
mattered — under a store opened as a file, a runtime's embedded-driver and native-addon story is on
the path — and the finding above settles that it does not, because all three ship `node:sqlite`
without an npm specifier or a native addon to compile. Deno additionally requires `--allow-read` and
`--allow-write`, which changes a run command and nothing else.

> So the store questions are answered and they left three candidates standing. Nothing in
> [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md),
> [ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) or
> [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) advantages or disqualifies
> Node, Bun or Deno. Spike all three.

*Reasoned — 2026-09-03, from the driver facts above.*

**One incompatibility worth knowing early, stated more precisely than before.** `better-sqlite3` does
not load under Bun out of the box: it is a native addon and fails with ABI mismatches
(`ERR_DLOPEN_FAILED`, "compiled against different Node.js ABI version"). Recompiling against the
matching ABI is a documented workaround, so "does not work" is too absolute, and the problem recurs
across Bun releases rather than sitting in one long-open ticket — the tracker holds a cluster of
issues of different ages (19328, 17255, 5187, 16050) rather than a single three-year-old one.
Choosing that library still tilts toward Node quietly, in a file that looks like it is about the
database. It is avoidable rather than decisive, since `node:sqlite` runs on all three.

*Sourced — oven-sh/bun issues 19328, 17255, 5187 and 16050, surveyed 2026-09-04 by a research agent.
I did not open them. The "three years" duration previously recorded here could not be attached to any
single issue.*
