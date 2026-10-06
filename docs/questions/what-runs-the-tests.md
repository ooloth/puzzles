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

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, filling in the stack decisions that had no question of their own.

## Options

*Vitest.* Shares configuration and transforms with the bundler [ADR-0029](../decisions/0029-the-client-bundler-is-vite.md) chose, has watch mode,
branch coverage and a real-browser mode, and would cover the client and the server with one runner
and one idiom. Both halves run on tools that already share a config.

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

*Measured — 32 tests in about 1.5s under Node v26.7.0, by me on 2026-09-22. The alternatives'
status is from `npm view`, run the same day.*

**Client modules that need no DOM are tested under the same interim runner.** M1's third slice
tests how the client reads the server's reply before this is answered, so `src/client/*.test.ts`
run under `node --test` with real `Response` objects, which Node provides. The client tsconfig has
`"types": []`, so those files are excluded from it and typechecked by the root `tsconfig.json`,
which has Node's types. Moving them is as mechanical as moving the server's. Views still have no
runner, which is the half of this question a DOM-capable runner exists for.

*Reasoned — from `src/client/tsconfig.json` and `package.json`, 2026-09-27.*

**Some checks are done by hand only because nothing here can render a view, and the runner this
question chooses owes each of them a test.** Moving the existing tests to another runner brings
none of these along, since they were never written. Each slice that leaves a view check by hand adds
it here:

- `src/client/app.tsx` shows the text of an `answered` outcome from `/api/hello`, and nothing for
  any other outcome (M1's third slice).
- It logs one `console.error` naming the outcome when the greeting cannot be shown, and nothing when
  the view unmounts mid-request (M1's third slice).
- `loadHello` in `src/client/hello.ts` turns a rejected `fetch`, or a body cut off while it is read,
  into an `unreachable` outcome rather than a rejection (M1's third slice).

*Reasoned — from the design comment on issue #7 and `src/client/`, 2026-09-27.*
