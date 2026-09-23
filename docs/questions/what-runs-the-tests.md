---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What runs the tests?

## Why it matters

The puzzle rules and the merge are pure modules whose correctness is the whole argument for
[one implementation of the puzzle rules](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md), and the portable
standards ask for branch coverage on exactly that kind of code. A runner that cannot measure it is
the wrong instrument regardless of how fast it is.

The interface half has a different requirement: an 81-cell grid, exercised through keyboard and
pointer input, in something that behaves enough like a browser to be worth trusting.

## What would settle it

Running the two shapes of test that matter — a pure module with branch coverage, and a rendered
grid driven by simulated input — and comparing watch-mode latency and the quality of a failure
message. The second matters more than it sounds: a runner that reports a failed assertion as a
timeout costs an afternoon every time it happens.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, filling in the stack decisions that had no question of their own.

## Options

**Two of the three inputs this question was waiting on have landed.**
[ADR-0029](../decisions/0029-the-client-bundler-is-vite.md) chose Vite, and [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) chose Node. What that changes is below.

*Vitest.* Shares configuration and transforms with the bundler [ADR-0029](../decisions/0029-the-client-bundler-is-vite.md) chose, has watch mode,
branch coverage and a real-browser mode, and would cover the client and the server with one runner
and one idiom. That last point is new: it was worth little while the runtime was open, because the
runner had to work on whatever was chosen, and it is worth a lot now that both halves run on tools
that already share a config.

*`bun test`.* **Out**, by [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md), which did not choose its runtime. The findings below are
kept because they are the evidence that it would have lost here anyway, on branch coverage and on
DOM-shaped snapshots, and because a future reader should not have to re-establish that.

*Node's built-in test runner.* No extra dependency, and stronger than this list assumed: the runner
has been stable since v20 and gained snapshot testing in v23.4.0. Still the weakest for driving a
rendered grid, which is the half of this question Vitest is built for.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The server's tests already run on `node:test`, as an interim choice this question may reverse.**
M1's first slice needed tests before this was answered, so `src/server/*.test.ts` run under
`node --test` with `fast-check` 4.10.2 for the property tests. Node's runner needed no dependency and
no transform, because Node strips the types itself. Moving them to another runner is mechanical:
they use `test`, `assert` and `fc.assert` and nothing runner-specific. `fast-check` stays whichever
runner wins, because no maintained alternative exists on npm (`jsverify` and `testcheck` are
abandoned, and `@effect/vitest` re-exports `fast-check`).

*Measured — 31 tests in about 1.5s under Node v26.7.0, by me on 2026-09-22. The alternatives'
status is from `npm view`, run the same day.*

**Nothing about `bun test` can be measured here yet.** This app has no components and nothing is
installed, so any claim tagged *Measured* against its own code is impossible by construction. What
follows is established from Bun's documentation and issue tracker instead.

**`bun test` has a watch mode.** `bun test --watch` is documented and works. It reruns the whole suite
on any change rather than only affected tests (issues 4825 and 7546) and does not pick up newly added
test files (issue 8342). That is a real weakness and a small one.

*Sourced — [bun.com/docs/cli/test](https://bun.com/docs/cli/test), read 2026-09-04 by a research
agent. I did not open it.*

**It reports no branch coverage.** The reporter emits "% Funcs" and "% Lines" only, in `text` and
`lcov`; it accepts a `statements` key and does not enforce it. Issue 7100, requesting statement and
branch coverage, is open and was last active 2026-08-29. Branch coverage is what a pure rules module
most wants measured, so this is the gap that bears hardest on
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)'s
shared module.

*Sourced — [bun.com/docs/test/coverage](https://bun.com/docs/test/coverage) and oven-sh/bun issue
7100, read 2026-09-04 by a research agent. I did not open them. Any claim about what it reports for
this app's own components is impossible for the reason above.*

**Its snapshot serialisation fails catastrophically on DOM-shaped values.** Issue 39768, filed
2026-08-20, records a JSDOM fragment containing one `<button>` producing a 146,955-line, 7.5 MB
snapshot against Jest 30.3.0's 9 lines and 4 KB. Issue 40077, open, filed 2026-08-22, records
`toMatchSnapshot()` on a live DOM node attempting a ~30 GB allocation. An 81-cell grid is exactly that
shape, so the conclusion rests on the two issues above rather than on the anecdote that circulates
about this defect, which matches nothing in the tracker.

*Sourced — oven-sh/bun issues 39768 and 40077, read 2026-09-17 by a research agent which quoted
39768's comparison table verbatim. I did not open them.*

*Two things about those issues that a reader will otherwise get wrong, the same as in
[what builds the client and serves it in development?](what-builds-the-client-and-serves-it-in-development.md).
Issue 39768 is closed as a duplicate of issue 5540, which moves where the defect is tracked rather
than fixing it, so 5540 is the issue to watch. Issue 40077 is an omnibus report bundling four
findings, of which the ~30 GB allocation is one, so its state says nothing about snapshots alone. The
quantified reports cover single nodes: any figure for what a whole suite costs is unsourced wherever
it turns up.*

**Vitest under Bun is not a hedge.** It is not covered by Vitest's own test matrix, and was broken
under Bun when last checked.

*Sourced — Vitest's own test matrix, read 2026-09-04. Its currency is unknown, and claims about this
field go stale in days, so re-check it before it decides anything.*

**The `bun test` findings above are duplicated in
[what builds the client and serves it in development?](what-builds-the-client-and-serves-it-in-development.md)
and this file is the one that keeps them.** That file is answered by [ADR-0029](../decisions/0029-the-client-bundler-is-vite.md) and scheduled for
deletion, and the duplication ends there rather than needing an edit now.
