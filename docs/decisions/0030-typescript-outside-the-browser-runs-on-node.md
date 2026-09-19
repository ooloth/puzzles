---
number: 0030
status: accepted
date: 2026-09-19
amended: 2026-09-19
---

# 30 — TypeScript outside the browser runs on Node

## Forced by

[ADR-0007](0007-that-language-is-typescript.md) chose the language and said nothing about what
executes it. Three things need a non-browser runtime: the server
([ADR-0010](0010-the-store-needs-a-host-so-this-system-has-a-server.md)), the generator, and the
tooling that runs checks.

[ADR-0017](0017-nothing-on-the-request-path-scales-to-zero.md) and
[ADR-0018](0018-the-server-does-not-run-in-a-constrained-isolate.md) removed the edge and isolate
tier. [ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md) and
[ADR-0021](0021-the-server-and-its-store-share-a-machine.md) require a runtime that opens a file on a
local disk.

[ADR-0029](0029-the-client-bundler-is-vite.md) put the Vite dev server in the daily loop, so how a
runtime interoperates with it is a recurring cost rather than a one-time one.

[../guarantees/README.md](../guarantees/README.md) records observability as a theme with no promises
yet, whose motivating case is a failure that produces no error, no crash and no complaint.
[../problem.md](../problem.md) ranks clarity over cleverness because one person maintains this.

## Decision

**The server, the generator and every repo script run on Node.** That is the whole of it.

**What this does not settle.** Whether anything transpiles the TypeScript before Node runs it is
[its own question](../questions/is-server-typescript-transpiled-or-stripped.md). Node strips types
natively and strips only erasable syntax, but a transpiler in front restores the rest, and a
reasonable person could choose this runtime and either answer. Nothing in **Rejected** below rests
on which one, so reading this record as settling it would be reading in a decision it does not make.

Node ships npm but does not require it, so
[which package manager?](../questions/which-package-manager.md) stays open. So does
[what runs the tests?](../questions/what-runs-the-tests.md) and
[what handles HTTP requests on the server?](../questions/what-handles-http-requests-on-the-server.md).
A version floor exists — type stripping is unflagged from v22.18.0 and v23.6.0 — but which version
line this project tracks is not settled here.

## Enforced by

Nothing in code, because there is no code. One artifact would satisfy it: a field naming the Node
version, so a contributor cannot silently run one below the floor that
[which Node version line does this track?](../questions/which-node-version-line-does-this-track.md)
will set. It does not exist yet.

## Rejected

**The field was rebuilt from registries on 2026-09-16 rather than from recall, and the three
familiar names were not the field.** The WinterTC runtime-keys registry lists 23 keys: andromeda,
arvancloud, azion, bun, convex, deno, edge-light, edge-routine, electron, fastly, kiesel, lagon,
moddable, netlify, node, quickjs, quickjs-ng, pythonmonkey, react-native, react-server, rhino,
wasmer, workerd. Beyond it: LLRT, Elide, txiki.js, Sable and Nova.

*Sourced — [runtime-keys.proposal.wintertc.org](https://runtime-keys.proposal.wintertc.org/), JSR's
package documentation and GitHub topic listings, read 2026-09-16 by a research agent. I did not open
them.*

Most of that list falls to records already in force, in four groups.

- **The constrained-isolate and edge tier** — workerd, edge-light, fastly, azion, arvancloud,
  edge-routine, wasmer, convex and LLRT — because
  [ADR-0018](0018-the-server-does-not-run-in-a-constrained-isolate.md) rules the tier out and
  [ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md) puts the store on a local disk,
  so edge compute reading a central store adds a network hop rather than removing one.
  **Reverses if** [ADR-0018](0018-the-server-does-not-run-in-a-constrained-isolate.md) is reversed.
- **Embeddable engines** — quickjs, quickjs-ng, kiesel, moddable, rhino, pythonmonkey and Nova —
  because they are engines rather than runtimes and have no process, package or server story.
  **Reverses if** one of them grows those, which would make it a different thing.
- **Application shells** — electron and react-native — because they are not servers. Same reversal.
- **`react-server`** is not a runtime at all; it is a `package.json` export condition, which is a
  defect in the registry rather than a candidate.

The first group is a judgement that follows from a record. The other three are category errors, and
they are listed so that nobody re-derives them.

- **Sable, LLRT and txiki.js** — because
  [ADR-0007](0007-that-language-is-typescript.md) requires TypeScript and each documents that it
  does not execute it. Sable's README lists among its non-goals "Native support of TypeScript/TSX/JSX
  (maybe will be possible in the future with service workers)". LLRT's states: "LLRT will not support
  running TypeScript without transpilation. This is by design for performance reasons." txiki.js
  documents: "txiki.js doesn't run TypeScript directly, `.ts` files need to be transpiled to
  JavaScript first." That reason disqualifies each alone. **Reverses if** any of them adopts
  TypeScript execution. txiki.js is otherwise live — its `v26.6.0` released 2026-06-22 — so it is out
  on the language and not on age.

  *Sourced — the Sable and LLRT READMEs fetched raw and
  [txikijs.org/docs/typescript](https://txikijs.org/docs/typescript/), read 2026-09-17 by a research
  agent quoting verbatim; the txiki.js release date from `gh release list`. I did not open them.*

- **Elide** — because its licence can be withdrawn, and it is the only candidate any licence removes.
  Section 4.1 of its terms grants "a limited, non-exclusive, non-transferable, non-sublicensable,
  revocable license". The disqualifying word is "revocable", and it disqualifies alone: the licence
  property in [what must the client and the server each be able to
  do?](../questions/what-must-the-client-and-server-be-able-to-do.md) requires one that cannot be
  revoked, because the terms rather than the code then decide whether the thing can keep being used.
  **Reverses if** Elide adopts an irrevocable open-source licence.

  *Sourced — [elide.dev/legal/terms](https://elide.dev/legal/terms/), opened and quoted by me on
  2026-09-17. Claims circulating about nightly-only builds, thirty-day expiry or per-major-version
  pricing correspond to nothing on the site and are unsourced wherever they turn up; the revocable
  licence needs none of them.*

- **Andromeda** — because the runtime is the position with no cheap exit, and its supply rests on
  seven authors. It is at 0.1.14 under MPL-2.0 with a built-in HTTP server and SQLite support, has
  never crossed 1.0, and its repository was last pushed 2026-06-15. Over the twelve months to
  2026-09-17 it took 89 commits from 7 distinct authors, against Node's 3,496 from 428, Deno's 3,055
  from 200 and Bun's 4,610 from 103.
  [ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
  requires an elimination on stewardship to name the replacement cost that made the concern binding:
  here the server, the generator and every script sit on the runtime, so leaving means re-scaffolding
  all four rather than swapping a module behind an interface. The same figures about a router would
  disqualify nothing. **Reverses if** Andromeda reaches a stable release with a contributor base that
  does not depend on one person.

  *Measured — commit and author counts from `gh api --paginate repos/<owner>/<repo>/commits?since=2025-09-17`
  grouped by author, run by a research agent that stated its command; release counts from the releases
  API, and Andromeda's version, licence and `pushed_at` from `gh api`, both run by me on 2026-09-18.
  Distinct authors are counted by GitHub login falling back to commit email, so one person using two
  addresses counts twice. **Any argument reaching for these numbers excludes bots first and nothing
  does that automatically**: the most prolific committer is an automation account in three of the four
  — Bun's `robobun` at 60.9%, Node's `nodejs-github-bot` at 8.2% — while the most prolific human is a
  different account with a different share, Bun's at 14.7%, Node's at 8.1% and Deno's at 36.8%, which
  makes Deno the most human-concentrated of the incumbents. The raw figure looks like a measurement
  either way, which is what makes the omission silent.*

**That left Node, Bun and Deno**, and the rest of this section is why the two that lost, lost.

- **Bun** — its case is the strongest on measurement. In a Linux container it held 56 MB under this
  system's plausible load against Node's 92 MB, started in 20 ms against 63 ms, absorbs the package
  manager and test runner, and its own SQLite driver measured no faster than the portable one, so
  nothing is given up by taking either.

  **It is disqualified because it cannot bound its heap.** In a 256 MB Linux container,
  `--max-old-space-size`, `--smol`, `BUN_JSC_forceRAMSize` and `BUN_JSC_gcMaxHeapSize` each exited
  137, killed by the kernel with no output, every one of them reaching the same allocation count as
  an unbounded run. Node and Deno given an equivalent flag exited 133 after printing GC diagnostics
  and `FATAL ERROR: ... JavaScript heap out of memory` with a native stack trace. This reproduces
  oven-sh/bun#34917, open since 2026-07-21.

  *Measured — Docker 29.0.1, linux/arm64 containers capped with `--memory=256m --memory-swap=256m` on
  an Apple M2, images `node:26-slim`, `oven/bun:1.4.2-slim` and `denoland/deno:2.9.7`. A script
  allocated 200,000-element arrays of small objects on the JS heap until the process died, with a
  `try`/`catch` around every allocation. Run by me on 2026-09-19.*

  That reason disqualifies alone: a runtime that cannot be made to say why it died turns every
  memory bug into the failure the observability theme above names, and the portable decision-making
  standard ranks an option that fails loudly over one that fails silently. **Reverses if** Bun ships
  a heap bound that works.

- **Deno is not disqualified, and this record says so rather than inventing a reason.** It is as
  legible as Node at the heap ceiling, measured lighter than Node under load, replaces four separate
  installs with `fmt`, `lint`, `check` and `task`, ships a first-party standard library Node has no
  equivalent for, and gives HTTP tracing for one environment variable.

  What decided against it is an accumulation, each part small. denoland/deno#28850 has been open
  since 2025-04-11 and logs `[vite] ws proxy error: AbortError` on every request the Vite dev server
  proxies to a `Deno.serve` backend, which is the shape
  [ADR-0028](0028-the-client-build-and-the-http-server-are-separate-tools.md) settled, and the
  documented workaround suppresses all of Vite's output rather than that line. `deno lint` has no
  type-aware rules and Deno's own documentation says to add typescript-eslint for them, which puts
  back the tool the built-in was meant to remove. `deno test` has no module mocking, which a
  maintainer has said is not planned, and no `test.each`; Vitest cannot substitute because running it
  under Deno is an open tracking issue, so one test runner cannot cover both halves of a codebase
  whose client is already built by Vite. And denoland/deno#31077 reports that workspace import maps
  do not merge, which is the shape
  [ADR-0005](0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) creates.

  So this is a preference between viable options, and it is recorded as one. **Reverses if**
  denoland/deno#28850 closes and Vitest becomes usable under Deno, which together remove most of the
  above.

- **A different runtime per deployable** — because the generator and the server share the rules
  module, and two toolchains for one maintainer costs more than the split saves.
  [../problem.md](../problem.md) ranks clarity over cleverness for exactly this reason.
  **Reverses if** the generator acquires a requirement the server's runtime cannot meet.

- **Not yet** — because nothing can be installed or run until this is answered, so M1 slice 1 cannot
  start. Deferring does not keep the option open here; it stops the milestone.

## Risk

**Node is the heaviest and slowest-starting of the three, knowingly.** 92 MB against Bun's 56 MB
under load, and 63 ms to listening against 20 ms. All three fit a 256 MB machine with over 150 MB
free, so the cost is headroom and a few dollars rather than a tier, but it is a standing cost and it
grows with the app rather than shrinking.

*Measured — the same Linux containers as above, running a `node:http` server over `node:sqlite` in
WAL with `synchronous=NORMAL`, RSS from `process.memoryUsage().rss` at idle, after a 20,000-request
burst, and under ten requests per second for 90 seconds. Startup is the p50 of fifteen runs to the
listening callback after three warmups. Write and read latency did not separate the candidates: p50
write fell between 0.011 and 0.013 ms across all three, against the plausible load under a hundred
writes per second in [../constraints.md](../constraints.md). The same measurements on macOS
overstated the memory spread by roughly double and should not be used; the host was the larger
variable, which is why these were re-run on the platform that ships.*

**The heap-legibility advantage is a capability, not a default.** Measured: with no ceiling set below
the container limit, Node is SIGKILLed exactly as silently as Bun. The advantage exists only if
something sets `--max-old-space-size`, and nothing does yet. **No heap ceiling bounds off-heap
allocation on any runtime**, so a buffer leak is silent under all three regardless.

**Node's own type stripping handles only erasable syntax**, so enums, decorators, namespaces with
runtime code, parameter properties and `.tsx` do not run under it, and
`--experimental-transform-types` was removed in v26 so the runtime offers no way round that. This is
a property of the runtime rather than a constraint this record imposes: it is the cost of taking
Node's stripping, and whether to take it is [open](../questions/is-server-typescript-transpiled-or-stripped.md).

**Continuous type checking is a second process.** Node has `--watch` but no typecheck-on-save, so
`tsc --noEmit --watch` runs beside it. Deno does this in one command.

## Revisit when

Bun ships a working heap bound, which removes the only disqualification in this record.

denoland/deno#28850 closes and Vitest becomes usable under Deno, which removes most of what decided
against Deno.

## Also update

- [x] questions/README.md — the runtime leaves the ordered list, the package manager takes its
      place at the front, and slice 1 carries this record as a given
- [x] constraints.md — gains "Runtimes — a heap ceiling does not bound a process": a ceiling bounds
      the JS heap only, so off-heap growth is killed silently on every runtime. A platform limit
      rather than evidence about a named project, unlike the comparative figures, which stay in the
      question file
- [x] architecture.md — nothing moved; this names no boundary
- [x] glossary.md — nothing moved
- [x] guarantees/ — nothing moved; this promises a player nothing, though it is an input to the
      observability theme when that theme gains its first promise
