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

*Vitest.* Shares configuration and transforms with Vite, has watch mode, branch coverage, and a
real-browser mode. The default if the build question lands where its research points.

*`bun test`.* Fast, and materially weaker for this app specifically on branch coverage and on
snapshots of anything DOM-shaped. See **Findings**.

*Node's built-in test runner.* No extra dependency; least support for component testing.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Nothing about `bun test` can be measured here yet.** This app has no components and nothing is
installed, so any claim tagged *Measured* against its own code is impossible by construction. What
follows is established from Bun's documentation and issue tracker instead.

**`bun test` has a watch mode.** `bun test --watch` is documented and works. It reruns the whole suite
on any change rather than only affected tests (issues 4825 and 7546) and does not pick up newly added
test files (issue 8342). That is a real weakness and a much smaller one than the absence recorded
before.

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

**Its snapshot serialisation fails catastrophically on DOM-shaped values.** Issue 39768, open, filed
2026-08-20 and reproduced on 1.4.0 and 1.3.14, records a JSDOM fragment containing one `<button>`
producing a 146,955-line, 7.5 MB snapshot against Jest's 9 lines and 4 KB, and a React suite growing
past 40 GB. Issue 40077, open, filed 2026-08-22, records `toMatchSnapshot()` on a live DOM node
attempting a ~30 GB allocation and dying with an uncatchable OOM. An 81-cell grid is exactly that
shape, so the conclusion the invented anecdote pointed at survives on real evidence.

*Sourced — oven-sh/bun issues 39768 and 40077, read 2026-09-04 by a research agent. I did not open
them.*

**Vitest under Bun is not a hedge.** It was shipped broken at the time of the research and is not
covered by Vitest's own test matrix.

*Sourced — Vitest's own test matrix. Not re-checked in the 2026-09-04 pass, so its currency is
unknown; every other claim in this section that was checked that day had changed or was wrong.*
