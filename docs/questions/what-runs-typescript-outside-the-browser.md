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

**The store's shape is settled and it did not narrow this field, under one condition.**
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md),
[ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) and
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md) settle a SQLite file
on an ordinary always-on runtime. All three candidates ship `node:sqlite`, so under that driver none
is advantaged or disqualified by the store. **No record has chosen that driver**, and it is the option
common to all three, so an equivalence argument running through it rests on its own conclusion — see
the Findings below and
[which driver reads and writes the store?](which-driver-reads-and-writes-the-store.md). What those
records do remove is the edge runtime, which is struck from the options below rather than weighed
there.

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

**The field was rebuilt from registries on 2026-09-16, and the three candidates were not the field.**
The WinterTC runtime-keys registry lists 23 keys: andromeda, arvancloud, azion, bun, convex, deno,
edge-light, edge-routine, electron, fastly, kiesel, lagon, moddable, netlify, node, quickjs,
quickjs-ng, pythonmonkey, react-native, react-server, rhino, wasmer, workerd. Beyond it: LLRT, Elide,
txiki.js, Sable and Nova, none of which appear in that registry or in JSR's five-runtime compatibility
list.

*Sourced — [runtime-keys.proposal.wintertc.org](https://runtime-keys.proposal.wintertc.org/), JSR's
package documentation, and GitHub topic listings, read 2026-09-16 by a research agent. I did not open
them.*

**Most of that list is eliminated by records already in force, in three groups.** The
constrained-isolate and edge tier goes to
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md): workerd,
edge-light, fastly, azion, arvancloud, edge-routine, wasmer, convex and LLRT. Embeddable engines are
not runtimes and have no process, package or server story of their own: quickjs, quickjs-ng, kiesel,
moddable, rhino, pythonmonkey and Nova. Application shells are not servers: electron and react-native.
`react-server` is not a runtime at all; it is a `package.json` export condition, which is a defect in
the registry rather than a candidate. **Reverses if**
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md) is reversed, for the
first group only; the other three are category errors rather than judgements.

**Three go on the language.**
[ADR-0007](../decisions/0007-that-language-is-typescript.md) requires TypeScript. Sable's README lists
among its non-goals "Native support of TypeScript/TSX/JSX (maybe will be possible in the future with
service workers)". LLRT's README states: "LLRT will not support running TypeScript without
transpilation. This is by design for performance reasons." txiki.js documents the same:
"txiki.js doesn't run TypeScript directly, `.ts` files need to be transpiled to JavaScript first."
**Reverses if** any of the three adopts TypeScript execution.

*Sourced — the Sable and LLRT READMEs fetched raw, and
[txikijs.org/docs/typescript](https://txikijs.org/docs/typescript/), all read 2026-09-17 by a research
agent quoting verbatim. I did not open them.*

**Elide goes on its licence, and it is the only candidate any licence eliminates.** Section 4.1 of its
terms grants "a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to:
(a) install and use one object code copy of the Software Bundle on a device that you own or control;
and (b) access and use the Service". Section 4.2 prohibits "reproduce, distribute, publicly display,
publicly perform, or create derivative works of the Service" and "publish benchmarks or performance
information about the Service". **The disqualifying word is "revocable"**, and it disqualifies alone:
the licence property in [what must the client and the server each be able to
do?](what-must-the-client-and-server-be-able-to-do.md) requires a licence that "cannot be revoked".
The prohibitions are not load-bearing here and are recorded only so the terms are not re-read.
**Reverses if** Elide adopts an irrevocable open-source licence.

*Sourced — [elide.dev/legal/terms](https://elide.dev/legal/terms/), opened and quoted by me on
2026-09-17.*

**Deleted from the Elide finding on 2026-09-17: that free access is nightly-only with a thirty-day
expiry and that a stable build requires a purchase per major version.** None of it appears on
elide.dev today. The words "nightly", "major version" and "stable" are absent from the terms of
service, and the live pricing page offers a "Free developer license" with "Full CLI and runtime
access, source available on GitHub" alongside an enterprise tier, with no per-version purchase. A
search snippet citing a one-time per-major-version price could not be located on the site. Recorded as
deleted rather than removed silently so it cannot return: it was found unsourced, and the elimination
never needed it.

**What survives is Node, Deno, Bun and Andromeda.** The first three are the incumbents. Andromeda is
at 0.1.14, released 2026-06-13, under MPL-2.0, with a built-in HTTP server and SQLite support; its
bundler is a separate satellite tool rather than part of the core runtime binary. It is not eliminated
by a binding property, and the attribute that would separate it from the incumbents is maturity, which
has no source here and is asked at
[what must a dependency's stewardship satisfy?](what-must-a-dependencys-stewardship-satisfy.md).

*Sourced — `gh release list --repo tryandromeda/andromeda` and the project's `Cargo.toml` and README,
read 2026-09-17 by a research agent. I did not open them.*

**txiki.js was a survivor on the 2026-09-16 pass and is not one now.** Two corrections from the
2026-09-17 re-check: its last release `v26.6.0` is dated 2026-06-22, which is three months ago rather
than "of the previous year" as recorded, and its TypeScript execution is not merely unestablished but
documented as absent, which moves it into the language group above.

*Sourced — `gh release list --repo saghul/txiki.js` for the date, which two separate summarisation
passes over the same GitHub releases page had reported wrongly as 2025 and 2024. Read 2026-09-17 by a
research agent; I did not open it.*


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

**The rewrite is connected to Anthropic and to Claude, by Bun's own disclosure.** Bun's retrospective
opens with: "Disclosure: Bun was acquired by
Anthropic in December 2025. I and others on the Bun team work at Anthropic. I used a pre-release
version of Claude Fable 5 for much of the Rust rewrite." The port ran as roughly 50 Claude Code
workflows over 11 days on a branch named `claude/phase-a-port`, and PR 30412 merged 2026-05-14. The
stated motive is memory safety: use-after-free, double-free and missed frees in error paths become
compiler errors in safe Rust.

So the rationale is memory safety rather than a Claude Code production requirement, and the rewrite
is connected to both the owner and the tool. Read Bun's own post before restating either half.

*Sourced — [bun.com/blog/bun-in-rust](https://bun.com/blog/bun-in-rust), fetched raw 2026-09-04 by a
research agent that quoted the disclosure verbatim. I did not open it. A Wikipedia article does not
carry the disclosure and cannot settle this either way.*

> **A hedge is a request for work, not a finding.** Marking a claim "treat as false unless confirmed"
> and leaving it there is how a caveat hardens into a verdict nobody tested, and this subject
> attracts it from both directions: an overstated causal story, then an overcorrection to no
> connection at all. Where a claim here carries a hedge, run the search or say plainly that nobody
> has.

**The store does not constrain this choice.** The worry was that settling a runtime early would
settle the store by convenience. The store is settled first
([ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md)) and does not advantage any runtime
under `node:sqlite`, so this is a free choice within the caveat recorded below.

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

**Deno ships it too, with one asymmetry worth stating.** Deno's Node-built-in
compatibility reference lists `node:sqlite` among its supported modules, added in Deno v2.2, with
further APIs in 2.7. It is a genuine built-in in the senses that matter for packaging: no npm
specifier, no `node_modules`, no native addon to compile. But it is **not** free of permission flags:
any file-backed database needs `--allow-read` and `--allow-write`, and
only `:memory:` runs unflagged. That boundary is real enough to have had a bypass bug
(GHSA-8vxj-4cph-c596, an `ATTACH DATABASE` escape from those checks).

> So the same data-access code runs unchanged on all three, and no runtime is disqualified by an
> embedded store. The correct claim is narrower than "no runtime is advantaged": Deno asks for two
> permission flags that Node and Bun do not. That is an ergonomic difference in the run command
> rather than a difference in what can be built, and it should not by itself decide anything.

*Sourced — [nodejs.org/api/sqlite.html](https://nodejs.org/api/sqlite.html) and
[bun.com/docs/runtime/nodejs-apis](https://bun.com/docs/runtime/nodejs-apis) read 2026-09-02, and
[Deno's Node API compatibility reference](https://docs.deno.com/runtime/reference/node_apis/) read
2026-09-03. All three opened by me. Node's stability index was re-checked on 2026-09-17 and still
reads "1.2 - Release candidate": the module went unflagged in v23.4.0 and v22.13.0 and reached
release-candidate status in v25.7.0, and it has not been promoted to "2 - Stable". An earlier agent
report that it was fully stable in Node 26 was wrong and the documentation has never said so.*

*Weakened 2026-09-17 — the Deno permission-flag claim. A re-check could not find the
`--allow-read`/`--allow-write` requirement stated on Deno's own `node:sqlite` or Node-compatibility
pages; the agent found it only in a search summary it did not open. The claim is plausible and
consistent with Deno's permissions model, and it is unverified at its source. It changes a run command
rather than what can be built, so nothing here should turn on it either way.*

**The three runtimes' governance differs, and it is a live input for a solo maintainer on a
multi-year horizon.** Node is governed by the OpenJS Foundation, with v24 in Active LTS since
2025-10-28 (Maintenance from 2026-10-20), v22 in Maintenance until 2027-04-30, and v26 Current with
LTS scheduled for 2026-10-28. Bun is owned by Anthropic and stays MIT with the same team. Deno is
Deno Land Inc., a venture-funded company rather than a foundation, and its petition against Oracle
over the "JavaScript" trademark is unresolved: the fraud claim was dismissed 2025-06-18, Oracle
answered 2025-08-06, discovery opened 2025-09-06, and the genericness and abandonment claims remain
active.

**That horizon is the thing this paragraph rests on and no document states it.** See
[what horizon is this built for?](what-horizon-is-this-built-for.md). Until it lands, this is a set of
facts with no criterion attached to it.

*Sourced — [Node's release schedule](https://raw.githubusercontent.com/nodejs/Release/main/README.md)
re-fetched raw 2026-09-17 by a research agent and matching the figures above exactly, plus Bun's
LICENSE.md (MIT confirmed) and [the acquisition post](https://bun.com/blog/bun-joins-anthropic), both
opened by the agent. The Deno trademark dates are from search summaries the agent did not open
directly and remain the weakest claim here.*

**Deleted from the paragraph above on 2026-09-17: that a decision in the Oracle matter "is not
expected before 2027".** A re-check found no source stating any expected decision date. Recorded as
deleted rather than removed silently so it cannot return: it was found unsourced.

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

**That conclusion is conditional on `node:sqlite`, and nobody has chosen it.** The argument above runs:
all three runtimes ship `node:sqlite`, therefore the same data-access code runs everywhere, therefore
the store does not narrow the runtime. Every step holds *given* that `node:sqlite` is the driver. It
is not a given. It is the option that happens to be common to all three, which is exactly what makes
it attractive to an argument trying to show they are equivalent, and that is a reason to distrust the
argument rather than to trust the driver.

If the best driver differs by runtime, the runtimes are not equivalent on the store after all. Bun
ships `bun:sqlite` natively; Node has `better-sqlite3` alongside its built-in; Deno has `@db/sqlite`
over FFI. A WASM build runs anywhere. An ORM or query builder over any of them is a further layer
nobody has considered. None of these has been weighed, and no record forecloses them.

> So the honest statement is narrower: **under `node:sqlite`, no runtime is advantaged.** Whether a
> runtime-specific driver would be preferable, and therefore whether driver quality belongs in this
> decision at all, is [which driver reads and writes the
> store?](which-driver-reads-and-writes-the-store.md). The driver itself is not needed until M3, but
> its openness is a caveat on this question's central argument today.

*Reasoned — 2026-09-04, on noticing that the equivalence argument assumes its own conclusion's
premise.*

**One incompatibility worth knowing early, and it is weaker than it was recorded as being.**
`better-sqlite3` has failed to load under Bun as a native addon with an ABI mismatch, reported across
four issues of different ages rather than one long-open ticket: oven-sh/bun 5187 (2023-09-13), 16050
(2024-12-29), 17255 (2025-02-11) and 19328 (2025-04-27). **All four are now closed.** Issue 19328 is
titled "Better-sqlite3 fails to load: 'compiled against different Node.js ABI version' when using
Bun", which is the failure mode. Recompiling against the matching ABI is a documented workaround, so
it is not that the library cannot work. Choosing that library still tilts toward Node quietly, in a
file that looks like it is about the database, but with every reported instance closed this is a
historical note rather than a live hazard. It is avoidable either way, since `node:sqlite` runs on all
three.

*Sourced — the four issues read via `gh issue view` on 2026-09-17 by a research agent, which confirmed
all four closed and quoted 19328's title. I did not open them. The agent did not see the literal
string `ERR_DLOPEN_FAILED` in the portion of 19328 it read, so that error name is removed from this
finding.*

*Corrected 2026-09-17: recorded on 2026-09-04 as a problem that "recurs across Bun releases". The
cluster of four issues is real and the dates hold; their all being closed was not checked then.*
