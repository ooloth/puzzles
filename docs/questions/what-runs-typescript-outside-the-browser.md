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

*Bun.* Runtime, package manager, test runner and bundler in one. The strongest simplification if the
bundled parts hold up. Younger, and host support is narrower.

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

**Elide's commercial terms are not part of the elimination, and claims about them do not hold.** The
words "nightly", "major version" and "stable" are absent from the terms of service, and the pricing
page offers a "Free developer license" with "Full CLI and runtime access, source available on GitHub"
alongside an enterprise tier, with no per-version purchase. Search snippets citing a one-time
per-major-version price do not correspond to anything on the site, so a nightly-only, thirty-day-expiry
or paid-per-major-version claim is unsourced wherever it turns up. The revocable licence disqualifies
Elide on its own and needs none of it.

*Sourced — the terms of service opened by me; the pricing page read 2026-09-17 by a research agent,
which I did not open. The absence of those three words from the terms is mine; the pricing quotes are
the agent's.*

**What survives is Node, Deno and Bun, and Andromeda is eliminated on replacement cost.** Andromeda is
at 0.1.14, released 2026-06-13, under MPL-2.0, with a built-in HTTP server and SQLite support; its
bundler is a separate satellite tool rather than part of the core runtime binary. No release has ever
crossed 1.0: the releases run 0.1.0 to 0.1.14 with 0.1.11 absent, preceded by a 0.1.0 draft series.
The repository carries 68 tags, most of them `0.1.0-draft1` through `0.1.0-draft52`, so a count of
tags is not a count of releases here and the two should not be read for each other.

**Its repository has been quiet for three months**, with the most recent push on 2026-06-15. That is
a different fact from the commit count below, which averages a year, and it is the one that bears on
whether the supply exists at all.

The disqualifying reason is the one
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
names: **the runtime is the least reversible position in the stack**, because the server, the
generator, the test runner and every script sit on it, so leaving it means re-scaffolding all four
rather than swapping a module behind an interface. A runtime whose supply rests on seven authors and
89 commits a year is a bet taken in the one place with no cheap exit. The same facts about a router
would disqualify nothing. **Reverses if** Andromeda reaches a stable release with a contributor base
that does not depend on one person, or if the spike shows leaving a runtime is cheaper than assumed.

*Measured — over the twelve months to 2026-09-17, Node took 3,496 commits from 428 distinct authors
across 59 releases; Deno 3,055 from 200 across 47; Bun 4,610 from 103 across 19; Andromeda 89 from 7
across 26. Commit and author counts are from `gh api --paginate
repos/<owner>/<repo>/commits?since=2025-09-17`, grouped by author, run by a research agent that stated
its command; I did not run it. The release counts are from `gh api --paginate
repos/<owner>/<repo>/releases` filtered to `published_at >= 2025-09-17`, which I ran on 2026-09-18 and
which returns 59, 47, 19 and 26 in that order. Distinct-author counts are by GitHub login falling back
to commit email, so one person using two unlinked addresses counts twice.*

*Sourced — `gh release list --repo tryandromeda/andromeda`, `gh api --paginate
repos/tryandromeda/andromeda/tags`, and the repository's `Cargo.toml` and metadata through
`gh api repos/tryandromeda/andromeda`. Run and read by me on 2026-09-18. Latest release 0.1.14,
`version = "0.1.14"`, `license = "Mozilla Public License 2.0"`, `pushed_at` 2026-06-15.*

*The **Reverses if** clause above has been checked against these and has not fired: there is no
stable release. Re-running those three commands is what checks it again, and it takes a minute.*

**Read raw, single-author concentration says the opposite of what it appears to say.** The most
prolific committer across twelve months is an automation account in three of these four: Bun's is
`robobun` at 60.9%, Node's is `nodejs-github-bot` at 8.2%. The most prolific human is a different
account with a different share: Bun's is Jarred-Sumner at 14.7%, Node's is aduh95 at 8.1%, and Deno's
is Bartek Iwańczuk at 36.8%, which makes Deno the most human-concentrated of the three incumbents.

**Any argument reaching for this number excludes bots first**, and nothing does that automatically.
The failure is silent, because the raw figure looks like a measurement either way.

*Measured — as above. The bot-versus-human split was made by reading account names and sampling
commits, which is judgement rather than measurement.*

**txiki.js is eliminated on the language, not on age.** Its last release `v26.6.0` is dated
2026-06-22, so it is a live project rather than a dormant one, and a claim placing that release in an
earlier year is wrong. What removes it is the documentation above: its TypeScript execution is
documented as absent.

*Sourced — `gh release list --repo saghul/txiki.js`, read 2026-09-17 by a research agent; I did not
open it. Take the date from the release API rather than from a reading of the releases web page, which
has produced wrong years more than once.*


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
release-candidate status in v25.7.0, and it has not been promoted to "2 - Stable". The documentation
has never described it as stable, so a claim that it is, in Node 26 or any other version, is
unsourced.*

*Sourced as an example rather than as a rule, re-checked 2026-09-19 — Deno's own `node:sqlite` API
reference still says nothing about permissions, which I confirmed by opening
[docs.deno.com/api/node/sqlite](https://docs.deno.com/api/node/sqlite/) myself. What does show the
flags is Deno's own v2.2 announcement, whose file-backed example is followed by
`deno run --allow-read --allow-write db.ts`; a research agent opened that post and quoted the command
and I did not. So the requirement is Deno's own documented example rather than a normative statement,
which is better than the search summaries this claim previously rested on and still short of a rule.
It changes a run command rather than what can be built, so nothing here should turn on it either way.*

**The three runtimes' governance differs, and it is a live input for a solo maintainer on a
years of active attention.** Node is governed by the OpenJS Foundation, with v24 in Active LTS since
2025-10-28 (Maintenance from 2026-10-20), v22 in Maintenance until 2027-04-30, and v26 Current with
LTS scheduled for 2026-10-28. Bun is owned by Anthropic and stays MIT with the same team. Deno is
Deno Land Inc., a venture-funded company rather than a foundation, and its petition against Oracle
over the "JavaScript" trademark is unresolved: the fraud claim was dismissed 2025-06-18, Oracle
answered 2025-08-06, discovery opened 2025-09-06, and the genericness and abandonment claims remain
active.

**What these facts are worth here is set by
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md).**
The runtime is the least reversible position in the stack, so supply risk is priced highest here of
anywhere. That is what gives a governance difference weight in this file and almost none in
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md). None of the
three is disqualified by it: all three carry irrevocable MIT licences and stable releases, and the
differences below are between kinds of backing rather than between backed and unbacked.

*Sourced — [Node's release schedule](https://raw.githubusercontent.com/nodejs/Release/main/README.md)
re-fetched raw 2026-09-17 by a research agent and matching the figures above exactly, plus Bun's
LICENSE.md (MIT confirmed) and [the acquisition post](https://bun.com/blog/bun-joins-anthropic), both
opened by the agent. The Deno trademark dates are from search summaries the agent did not open
directly and remain the weakest claim here.*

**No source states when the Oracle matter will be decided.** Any expected-decision date attached to
it is unsourced wherever it turns up.

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

**One incompatibility worth knowing early, and it is weaker than its reputation.**
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


### The equivalence under `node:sqlite` is narrower than this file has been stating

**Bun does implement `node:sqlite`, and one of its own reference pages says otherwise.** Bun's
Node-compatibility page for v1.4.2 marks the module fully implemented, and oven-sh/bun#20412, "Add
support for node:sqlite", closed as completed on 2026-07-17. Bun's separate API reference at
`bun.com/reference/node/sqlite` still reads "Not implemented. Consider using `bun:sqlite` for Bun's
built-in high-performance SQLite driver", and is stale. A reader landing on that page first will
conclude the opposite of what is true, which is worth recording because it has already happened once
here.

*Sourced — [bun.com/docs/runtime/nodejs-apis](https://bun.com/docs/runtime/nodejs-apis) and
[bun.com/reference/node/sqlite](https://bun.com/reference/node/sqlite) opened by me on 2026-09-19,
and the issue state read by me with `gh issue view`.*

**The compatibility entry carries four caveats, and one of them reaches back into `bun:sqlite`.**
Quoted from that page: `backup()` "runs synchronously and blocks the event loop for the duration of
the copy (Node runs it on a worker thread)"; a Buffer or Uint8Array database path "must be valid
UTF-8"; "On macOS, Bun uses the system libsqlite3.dylib"; and `loadExtension()` "requires a full
SQLite build, and so do `createSession()`/`applyChangeset()` on older macOS releases", for which the
documented remedy is to call `require("bun:sqlite").Database.setCustomSQLite(path)` before opening a
database.

**That last caveat is what narrows the equivalence claim.** The argument this file has been making is
that the same data-access code runs unchanged on all three runtimes, so the store advantages none of
them. Under Bun, reaching a full SQLite build means importing `bun:sqlite` to configure the engine
that `node:sqlite` then runs on. That is runtime-specific code in the data-access path, which is the
thing the equivalence was claiming there would not be. It is a small amount of code and it is
avoidable if no extension, session or changeset is ever needed. It is not nothing.

**The blocking `backup()` is the caveat most likely to bind.**
[ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
commits to a copy off the machine, and a server that stops answering for the duration of a copy is a
different operational proposition from one that does not.
[How is the store backed up?](how-is-the-store-backed-up.md) at M3 is where that lands, and what M1
owes it is only that the runtime record says whether it was an input. **Reverses if** Bun moves
`backup()` off the event loop, or if the backup mechanism turns out not to use the driver's API at
all.

*Sourced — the caveat text quoted verbatim from Bun's Node-compatibility page, opened by me on
2026-09-19. The implication for
[ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md) is
mine and is reasoning rather than a finding.*

**So the honest statement is narrower again.** Under `node:sqlite`, no runtime is disqualified and all
three run the same API. What is no longer true is that the code is identical everywhere: Deno adds two
permission flags to the run command, and Bun adds a `bun:sqlite` call if the full SQLite build is ever
needed. Neither is a disqualifier and neither should decide this on its own. Both belong in
[which driver reads and writes the store?](which-driver-reads-and-writes-the-store.md), which is
where the remaining driver differences are now recorded.

### The criteria this is scored against, derived rather than inherited

The properties below are derived from what this server actually does rather than from what earlier
passes of this file happened to discuss. Three earlier rounds scored only behavioural capabilities,
licensing, stewardship and hosting availability, and never asked what the thing costs to run.

**Binds, and is unmeasured.**

- **Baseline and drifting memory.** It sets the hosting tier and therefore a recurring bill, and
  [../problem.md](../problem.md) rules out a decision that makes growing expensive. No published
  figure survives a method check: the blog comparisons disclose no hardware, tool or iteration count
  and do not agree on direction; the one benchmark with disclosed hardware is Bun's own ecosystem
  repo comparing Bun's server against Node running `uws` rather than stock Node; the one
  disclosed-method startup benchmark is Deno measuring Deno and shows Deno winning every case.
- **Latency of one synchronous SQLite write.** `node:sqlite` is synchronous on every runtime, so a
  write blocks the event loop for its duration, and this server's whole job is small reads and
  writes. Nobody has measured whether the duration differs by runtime.

**Does not bind, and here is why rather than silence.**

- **Request throughput.** [../constraints.md](../constraints.md) puts plausible load under a hundred
  writes per second against driver throughput in the tens of thousands.
- **Network bandwidth.** Payloads are small and [../constraints.md](../constraints.md) records that
  transfer time is not the bottleneck once a connection is warm.
- **Storage capacity.** A SQLite file of puzzles and player state is small, and the disk is sized by
  the host rather than by the runtime.
- **Object-storage interaction.** All three upload a backup file to an S3-compatible endpoint today.
  Bun ships `Bun.s3` and needs no dependency; Node and Deno use `@aws-sdk/client-s3`, which Deno's
  own documentation demonstrates against R2 directly, and which is replaceable under either by
  `aws4fetch` at 2.5 kB gzipped with no dependencies. What this did **not** examine is recorded in
  [which driver reads and writes the store?](which-driver-reads-and-writes-the-store.md).

**Judgement rather than measurement.**

- **Vite interop.** [ADR-0029](../decisions/0029-the-client-bundler-is-vite.md) chose Vite on the
  development loop. Under Deno, denoland/deno#35942 is open and reports Rolldown's vendored signal
  handler killing every Vite 8 dev server under `deno run --watch`. Under Bun, oven-sh/bun#29368 is
  open and reports Bun workspaces breaking the Vite dev server. Under Node there is no equivalent.
  Both are conditional and both are upstream, so neither disqualifies.
- **Porting cost if the runtime changes later.** Source written to the subset all three execute ports
  by changing a run command. Source using one runtime's conveniences does not.
- **Tooling absorbed.** Bun brings a package manager and test runner, Deno those plus a formatter and
  linter, Node neither. Discounted for Bun by its test runner's documented gaps, recorded in
  [what builds the client and serves it in development?](what-builds-the-client-and-serves-it-in-development.md),
  and unknown for Deno, which has not been researched.
- **Governance and supply.** Priced low by
  [ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md),
  because nothing separates the three on a binding property, so there is no bad answer to be stuck
  with and the position is cheap to leave.

### TypeScript ergonomics: Node's are the narrowest of the three, and the gap does not bite here

**Node runs TypeScript at "Stability: 2 - Stable", by stripping types rather than transpiling.** It
has been on by default since v22.18.0 and v23.6.0. Enums, `namespace` with runtime code, parameter
properties and import aliases each error. Decorators "are not transformed and will result in a parser
error". "Node.js ignores `tsconfig.json` files and therefore features that depend on settings within
`tsconfig.json`, such as paths... are intentionally unsupported." File extensions "are mandatory in
`import` statements", so `import './file.ts'` rather than `./file`. No type checking is performed.

*Sourced — [nodejs.org/api/typescript.html](https://nodejs.org/api/typescript.html), opened and quoted
by me on 2026-09-19.*

**Bun's and Deno's are supersets.** Bun reads `tsconfig.json`, honours `paths`, transpiles rather than
strips, and supports every construct above. Deno supports the same language features natively and
replaces `paths` with an `imports` map in `deno.json`. Deno's own friction is at the other end, where
`tsc --noEmit` does not resolve `npm:` and `jsr:` specifiers, so CI type checking is `deno check`
rather than the command used everywhere else.

*Sourced — Bun's and Deno's TypeScript documentation, read 2026-09-19 by a research agent. I did not
open them.*

**"Ignores tsconfig" is narrower than it reads.** Type checking under all three is `tsc --noEmit`,
which reads `tsconfig.json` normally, so `strict`, `target` and every type-level setting still govern
the codebase. What Node ignoring the file costs at runtime is path mapping and syntax downleveling,
and downleveling is irrelevant for a runtime we choose. The remaining loss is path aliases, for which
Node's answer is `package.json` subpath imports, a different syntax for the same capability.

**The constructs Node cannot run are ones this project does not want.** Enums, decorators, namespaces
with runtime code and parameter properties are each declined rather than sacrificed, and no record or
promise needs any of them. `erasableSyntaxOnly` in `tsconfig.json` makes staying inside that subset a
compiler error at write time rather than a discipline anyone has to remember. **Reverses if** this
codebase adopts a library whose API requires decorators.

### What a spike would settle, and what it would not

It settles the two binding properties above and nothing else: baseline and drifting memory, and
synchronous SQLite write latency, for a minimal server close in shape to the real one, since
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) keeps this server thin by
design. It does not settle throughput, which does not bind, and it cannot settle the Vite interop or
porting questions, which are judgements about upstream bugs and future work rather than observations.

### Measured, 2026-09-19

*Method — Apple M2, 24GB, macOS 26.6.2, arm64. Node v26.7.0, Bun 1.4.2, Deno 2.7.14. One identical
TypeScript source per test, run unmodified under all three through `node:sqlite` and `node:http`,
WAL journal mode, `synchronous=NORMAL` unless stated. Latency: 2,000 warmup then 20,000 timed
operations, three runs per runtime per mode, percentiles over the timed set. RSS from
`process.memoryUsage().rss`. Commands and scaffolds were deleted after the run; the numbers below are
what survives.*

**`node:sqlite` requires Bun 1.4 or later, and this file has been asserting it unversioned.** Bun
1.3.13 answers `No such built-in module: node:sqlite` and fails to resolve the import. Bun 1.4.2
runs the same file unchanged and exposes `database.function()`. Node and Deno both ran it. So the
equivalence this question has leaned on is real and carries a version floor that was never stated,
and a machine with an older Bun is a machine where the shared data-access code does not load at all.

**Write and read latency do not separate the runtimes, which is what was predicted.** At
`synchronous=NORMAL` the p50 write is 0.024 to 0.026 ms under Deno, 0.031 to 0.035 ms under Node and
0.035 to 0.038 ms under Bun. Reads are under 0.005 ms everywhere. Against the plausible load under a
hundred writes per second in [../constraints.md](../constraints.md), none of this binds. Bun's p99
write is about 0.7 ms against Node's 0.07 ms, a tenfold tail difference that is still 0.7 ms.

**Full durability costs roughly double on the write and is affordable.** p50 write at
`synchronous=FULL` against `NORMAL`: Node 0.056 against 0.033, Deno 0.061 against 0.025, Bun 0.066
against 0.036. This is an input to
[what durability settings does the store run with?](what-durability-settings-does-the-store-run-with.md)
at M3, and it says the safest setting is close to free at this load.

**At `synchronous=FULL`, Node and Deno each showed one stall of 283 to 421 ms per 20,000 writes.
Bun's worst was 14 ms.** Reproduced on all three runs of each. Not explained, and recorded because a
single sub-half-second stall in a request path is the kind of thing that is easier to find now than
after it is reported.

**Memory separates them, by less than macOS suggested.** Measured again inside Linux arm64 containers
capped at 256 MB, which is the deployment shape. Idle server RSS: Bun 29.7 MB, Deno 48.0 MB, Node
62.4 MB. Under this system's plausible load of ten requests per second for 90 seconds: Bun 56.1 MB,
Deno 86.3 MB, Node 91.6 MB. Under a 20,000-request burst: Bun 60.9 MB, Node 93.1 MB, Deno 96.2 MB.

**The same measurement on macOS overstates the gap by roughly double, and the macOS figures should
not be used.** There it read Bun 21.9 MB, Deno 54.4 MB and Node 90.3 MB idle, and under a burst Bun
66.8 MB against Node 163.9 MB and Deno 207 MB. On Linux the spread under load is Node 91.6 against
Bun 56.1, about 1.6 times rather than the 2.4 times macOS showed, and all three leave over 150 MB
free on a 256 MB machine. The host operating system was the larger variable, which is the reason to
measure on the platform that ships.

**The remaining gap is structural rather than a default anyone can tune.** Capping V8's old space at
96 MB and at 48 MB left Node's RSS unchanged, so the memory is not old-space heap a ceiling would
constrain.

**Startup to the listening callback: Bun 20 ms, Deno 25 ms, Node 63 ms**, p50 of fifteen runs after
three warmups. It does not bind on the request path, because
[ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md) keeps the process up. It
is felt by every repo script, batch run and test process instead.

**Three limits on all of the above, and the first is the one that matters.** This ran on macOS and
this system deploys to Linux; Docker was unavailable on the machine, so the deployment platform is
unmeasured. A 150-second run cannot see the multi-hour growth the open Bun issues describe, so those
are neither confirmed nor refuted here. And Bun's `node:http` is a compatibility layer over its own
server, so a Bun-native server was not what was measured.

### Measured on Linux, 2026-09-19: how each runtime fails when it runs out of memory

*Method — Docker 29.0.1, linux/arm64, containers capped with `--memory=256m --memory-swap=256m` on
the same Apple M2. Images `node:26-slim`, `oven/bun:1.4.2-slim`, `denoland/deno:2.9.7`. A script
allocates 200,000-element arrays of small objects on the JS heap until the process dies, with a
`try`/`catch` around every allocation. Exit 137 is the kernel's SIGKILL; a V8 abort exits 133 after
printing to stderr.*

**Bun cannot bound its heap, and the consequence is a silent kill.** With
`--max-old-space-size=128`, Node exited 133 and Deno exited 133, both after printing GC diagnostics
and `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out
of memory` followed by a native stack trace. Bun given the same flag exited 137 with no output at
all. Bun's own mechanisms do no better: `--smol`, `BUN_JSC_forceRAMSize=134217728`,
`BUN_JSC_gcMaxHeapSize=134217728` and `--smol` combined with `forceRAMSize` each exited 137 silently,
every one of them reaching the same 30 chunks as an unbounded run. The flag is accepted and ignored.

This reproduces oven-sh/bun#34917, open since 2026-07-21 with four comments and no fix. Two issues
cited alongside it, oven-sh/bun#25487 and denoland/deno#30043, are both closed and should not be
carried as corroboration.

**Without a ceiling below the container limit, all three die silently**, which is ordinary and is the
operator's problem to configure rather than a property of any runtime. Node and Deno can be
configured out of it. Bun cannot.

**No heap ceiling protects against off-heap allocation on any of them.** The same test allocating
through `Buffer.alloc` rather than on the JS heap exited 137 under all three, with and without a cap,
because the flag bounds V8's old space and a buffer is not in it. So a heap ceiling is worth setting
and is not a guarantee.

**What this is worth here.** [../problem.md](../problem.md) ranks clarity for a solo maintainer, and
[../guarantees/README.md](../guarantees/README.md) records observability as a theme with no promises
yet, whose motivating case is a failure that produces no error and no complaint. A runtime that can
be made to say why it died is worth more to one person operating this than a runtime that is lighter,
and the portable standards rank a loud failure over a silent one directly. **Reverses if** Bun ships
a working heap bound.

### Measured on Linux, 2026-09-19: best driver per environment

*Same containers and method as the latency test above, 2,000 warmup and 20,000 timed operations.*

**Bun's own driver is indistinguishable from the portable one, so there is no speed being left on the
table by either choice.** Under Bun, `bun:sqlite` wrote at p50 0.0115 ms and read at 0.0020 ms;
`node:sqlite` under the same Bun wrote at 0.0114 ms and read at 0.0020 ms. Bun's published claim of
being three to six times faster is made against `better-sqlite3` on read queries, benchmarked on
macOS 12.3.1 and therefore predating `node:sqlite` entirely, so it is not a claim about this
comparison and this measurement does not contradict it.

**Across runtimes on their own best built-in, the spread is under twenty percent and does not bind.**
Write p50: Node with `node:sqlite` 0.0112 ms, Bun with `node:sqlite` 0.0114 ms, Bun with `bun:sqlite`
0.0115 ms, Deno with `node:sqlite` 0.0132 ms. Reads 0.0019 to 0.0025 ms. The macOS run had shown Bun
roughly ten percent slower on writes and with a tenfold worse tail; on Linux that difference is gone,
which is a second reason to treat the macOS figures as an artifact of the host.

### Developer ergonomics, Node against Deno, 2026-09-19

Bun is out of this comparison. Scored on writing TypeScript, interoperating with the Vite dev server
[ADR-0029](../decisions/0029-the-client-bundler-is-vite.md) settled, and not being interrupted.

**Node's TypeScript setup is a six-line config written once, not a tooling problem.** Its own
documentation recommends `noEmit`, `target: esnext`, `module: nodenext`,
`rewriteRelativeImportExtensions`, `erasableSyntaxOnly` and `verbatimModuleSyntax` against TypeScript
5.8 or newer. `rewriteRelativeImportExtensions` is what lets `tsc` accept the literal `.ts` specifiers
Node requires, and `erasableSyntaxOnly` turns the unsupported constructs into compile errors rather
than runtime surprises. Path aliases work through `package.json` `imports`, which TypeScript resolves
by default under `nodenext`, so aliases need no added tool either. `.tsx` is unsupported and
`--experimental-transform-types` was removed in v26, so the erasable subset is the whole story and
there is no flag to escape it.

*Sourced — [nodejs.org/api/typescript.html](https://nodejs.org/api/typescript.html), opened and quoted
by me on 2026-09-19.*

**Deno removes three or four installs and Node does not.** `deno fmt`, `deno lint`, `deno check` and
`deno test` replace Prettier, ESLint, `tsc` and a test runner. Deno can also typecheck and run in one
command, `deno run --check`, where Node has `--watch` but no typecheck-on-save, so continuous checking
under Node is `tsc --noEmit --watch` in a second terminal. That is the one daily ergonomic difference
in Deno's favour and it is real.

**Two of those built-ins are not parity.** `deno lint` has no type-aware rules, and Deno's own
documentation says to add typescript-eslint for them, which reintroduces what the built-in was meant
to remove. And `deno test` lacks module mocking, which a Deno maintainer has said is not planned,
lacks `test.each`, and parallelises across files rather than within one. Mocking, snapshots and fake
timers come from `@std/testing` rather than the runtime. Vitest cannot substitute: running it under
Deno is an open tracking issue with a panic regression against Vitest 4.0.10.

**The Vite interoperation is where Node is clearly better, and it lands on this project's exact
shape.** denoland/deno#28850, open since 2025-04-11, reports that every request proxied from the Vite
dev server to a `Deno.serve` backend logs `[vite] ws proxy error: AbortError`. A contributor first
attributed it to Node parity and then retracted: "Indeed, I got my node testing wrong, sorry.
Something is not right." The documented workaround is `logLevel: "silent"`, which suppresses all of
Vite's output rather than that error. A client proxying to a separately-run server is precisely what
[ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md) settled, so
this fires on the daily loop.

Alongside it, denoland/deno#35942 remains open, and Deno's Node-API layer broke Rolldown twice in five
months, at denoland/deno#33137 and #33787. **Both of those are closed**, in seven weeks and one day
respectively, so the pattern is regress-and-repair rather than an outstanding defect. Roughly ten
open issues in denoland/deno touch Vite.

**In fairness, Vite 8 on Rolldown is churning under Node too**, so some of what a Deno user would
attribute to Deno is Vite's own instability. What is not symmetric is that Deno carries the burden of
keeping the pairing working, and its compatibility layer is the part that has regressed.

*Sourced — issue states, dates and comment threads read by me with `gh` on 2026-09-19. The Deno
tooling comparisons are a research agent's reading of Deno's own documentation; I did not open those
pages.*

### Measured, 2026-09-19: Node's `node_modules` restriction does not reach the shared rules module

Node's documentation states: "To discourage package authors from publishing packages written in
TypeScript, Node.js refuses to handle TypeScript files inside folders under a `node_modules` path."
That reads as a threat to
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md),
because a workspace package is symlinked into `node_modules` and the rules module is imported by
three consumers with no publish step. It is not.

Built as an npm workspace with a `packages/rules` exporting `./index.ts` and an `apps/server`
importing it by bare specifier, Node v26.7.0 ran it: **`workspace import OK`**. Node resolves the
symlink to its real path, which is not under `node_modules`, so the restriction never fires. A
relative import across packages worked identically. Creating a genuine, non-symlinked `.ts` file
under `node_modules` and importing it failed as documented, with
`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`.

**So the boundary is consuming a published package that ships TypeScript, which is the thing the
restriction exists to discourage, and not a workspace.**
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) is
satisfiable under Node with no build step and no extra tooling. **Reverses if** a dependency this
project needs ships `.ts` source.

### Deno's developer-experience claims, checked against Node plus its best ecosystem tool

**Genuinely better under Deno, and it is two things.** Its standard library covers YAML, TOML, CSV,
UUID, ULID and formatting as first-party, independently versioned, mostly stable packages, and Node
has no equivalent or plan for one. And its OpenTelemetry support is one environment variable against
assembling several npm packages and initialising them before anything else loads.

**The OpenTelemetry win is narrower than it sounds**, because Deno's own page lists what is
auto-instrumented as incoming `Deno.serve` requests, outgoing `fetch`, `node:http2` traffic and
`Deno.cron` invocations. **Database calls are not on that list**, so the SQLite work this server
mostly does needs hand-written spans on either runtime.

*Sourced — [docs.deno.com/runtime/fundamentals/open_telemetry](https://docs.deno.com/runtime/fundamentals/open_telemetry/),
opened by me on 2026-09-19. That page carries no stability warning; a claim that the feature is
unstable came from an agent's search summary and I could not confirm it.*

**Closed, or never a runtime difference at all.** Web-standard APIs are the pitch Deno was founded on
and Node has caught up: `fetch`, `WebSocket`, Web Streams, Web Crypto and `BroadcastChannel` are all
stable in Node 26, leaving only `URLPattern` at experimental and `localStorage` at release candidate,
neither of which a server needs. Safe-by-default package installation is Deno against npm rather than
Deno against Node, and pnpm has blocked build scripts by default since v10 in January 2025.

**Node is ahead on diagnostics**, which matters here because the memory-legibility finding above is
what disqualified Bun. Node has `--cpu-prof` and `--heap-prof` both stable, plus
`--heapsnapshot-near-heap-limit`, which writes a snapshot as the process approaches its ceiling.
Deno's documentation describes `--cpu-prof` with nicer flamegraph and Markdown output and no
`--heap-prof` equivalent.

**Deno's workspace support is the weak point for this architecture.** denoland/deno#31077 is open and
reports that import maps do not merge, so a workspace root's `deno.json` can silently remove a
member's path aliases. One shared module with three consumers on different build targets is exactly
that shape, and pnpm workspaces have carried it for years.

**Deno Desktop is a different product**, three months old, for packaging native desktop binaries. It
bears on nothing here.

*Sourced — a research agent's reading of Deno's and Node's documentation on 2026-09-19, except the
OpenTelemetry page and the `node_modules` test above, which are mine. The pnpm, npm and workspace
issue claims are the agent's and I did not open them.*
