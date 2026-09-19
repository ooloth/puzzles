---
number: 0030
status: accepted
date: 2026-09-19
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

**The server, the generator and every repo script run on Node.** Source stays inside the syntax Node
can strip, which `erasableSyntaxOnly` in `tsconfig.json` makes a compile error rather than a
discipline, so no transpiler sits between the source and the runtime.

**What this does not settle.** Node ships npm but does not require it, so
[which package manager?](../questions/which-package-manager.md) stays open. So does
[what runs the tests?](../questions/what-runs-the-tests.md) and
[what handles HTTP requests on the server?](../questions/what-handles-http-requests-on-the-server.md).
A version floor exists — type stripping is unflagged from v22.18.0 and v23.6.0 — but which version
line this project tracks is not settled here.

## Enforced by

Nothing in code, because there is no code. Two artifacts would satisfy it: a field naming the Node
version so a contributor cannot silently run one below the floor, and `erasableSyntaxOnly` in
`tsconfig.json` so the subset is checked rather than remembered. Neither exists yet, and the second
is the one that fails quietly, because source using an enum runs fine under a transpiler and only
breaks when Node is what executes it.

## Rejected

- **Bun** — its case is the strongest on measurement. In a Linux container it held 56 MB under this
  system's plausible load against Node's 92 MB, started in 20 ms against 63 ms, absorbs the package
  manager and test runner, and its own SQLite driver measured no faster than the portable one, so
  nothing is given up by taking either.

  **It is disqualified because it cannot bound its heap.** In a 256 MB Linux container,
  `--max-old-space-size`, `--smol`, `BUN_JSC_forceRAMSize` and `BUN_JSC_gcMaxHeapSize` each exited
  137, killed by the kernel with no output, every one of them reaching the same allocation count as
  an unbounded run. Node and Deno given an equivalent flag exited 133 after printing GC diagnostics
  and `FATAL ERROR: ... JavaScript heap out of memory` with a native stack trace. This reproduces
  oven-sh/bun#34917, open since 2026-07-21. The method and figures are under **Findings** in
  [what runs TypeScript outside the browser?](../questions/what-runs-typescript-outside-the-browser.md).

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

**The heap-legibility advantage is a capability, not a default.** Measured: with no ceiling set below
the container limit, Node is SIGKILLed exactly as silently as Bun. The advantage exists only if
something sets `--max-old-space-size`, and nothing does yet. **No heap ceiling bounds off-heap
allocation on any runtime**, so a buffer leak is silent under all three regardless.

**The erasable subset is a real constraint with no escape hatch.** Enums, decorators, namespaces with
runtime code, parameter properties and `.tsx` are all unavailable, and
`--experimental-transform-types` was removed in v26. A dependency whose API requires decorators would
force a transpiler back into the toolchain.

**Continuous type checking is a second process.** Node has `--watch` but no typecheck-on-save, so
`tsc --noEmit --watch` runs beside it. Deno does this in one command.

## Revisit when

Bun ships a working heap bound, which removes the only disqualification in this record.

A dependency this project needs requires decorators, or ships TypeScript source inside
`node_modules`, either of which breaks the no-transpiler premise.

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
