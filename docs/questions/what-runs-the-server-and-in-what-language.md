---
opened: 2026-08-30
status: open
resolves_into: decision
---

# What runs the server, and in what language?

## Why it matters

A second language means a second toolchain, dependency ecosystem, CI setup and context switch —
for one maintainer. Sharing puzzle logic between generator, server and client in a single
language removes duplication that otherwise has to be kept in sync by hand.

## Blocked by

[where puzzle state lives](does-puzzle-state-live-on-the-client-or-the-server.md).

[How expensive is puzzle generation?](how-expensive-is-puzzle-generation.md).

[What load should the server handle?](what-load-should-the-server-handle.md).

## Blocks

[how the codebase is laid out](how-is-the-codebase-laid-out.md).

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Findings drawn from legacy ADR-01 (render with server-driven hypermedia).

Options and findings ported from legacy ADR-02 (use Rust for the backend).

Finding drawn from legacy ADR-05 (use Axum with the official Datastar SDK).

## Options

*One language across generator, server and client.* Leverages the maintainer's existing
strength, unifies the stack, and gives one implementation of the puzzle rules rather than two
kept in agreement by hand. Forgoes whatever reliability a stricter language buys.

*A compiled language for the backend and generator.* Recorded in legacy ADR-02 as Rust written
"Easy Mode" — owned data, liberal cloning, avoiding lifetimes and trait complexity — to keep
authoring speed near a GC'd language while retaining a performance ceiling. Costs a second
toolchain, a second dependency ecosystem, a second CI setup, slower authoring at moderate
fluency, and two implementations of the rules unless the client runs it too.

## Findings

A pure puzzle module is portable, so one language means the solver and the validator are the
same implementation of the rules rather than two copies that must agree. Two languages means
maintaining that agreement by hand, forever, with no compiler checking it.

The maintainer has strong TypeScript and React experience and only moderate Rust experience.
Alongside that, enthusiasm for "easy mode Rust" is also on record.
Both are in the record and they are not the same claim — one is about capability, the other
about enjoyment.

A performance argument for a compiled language is **unestablished in both directions**. Nobody
has measured how expensive generation is, and both the claim that it's cheap and legacy ADR-02's
claim that it's CPU-bound are expectations rather than measurements — see
[how expensive is puzzle generation](how-expensive-is-puzzle-generation.md).

The reliability half of ADR-02's argument has never been addressed. Its stated driver was
"performance/reliability"; everything since has attacked performance and left reliability
standing. Stricter types, exhaustive matching and the absence of null are a real argument,
independent of speed, and this is the "some other benefit" a case for a second language would
have to rest on.

ADR-02 chose to preserve a performance ceiling for a component that did not exist. Its driver
was "future compute-heavy puzzle-generation and validation workloads" — future, unbuilt, and
unmeasured. Whether that reads as prudence or prematurity is what the cost question decides.

ADR-02 noted the rendering choice was "backend-language-agnostic, so it didn't force this choice
either way". That held under server-owned state. It stops holding under a shared pure puzzle
module: if the client runs the rules too, the client and server languages want to be the same.
Two independent choices become one — an argument for a single language that appears nowhere in
the old reasoning.

The language was "reopened for reconsideration rather than inherited", so the previous choice was
deliberate rather than drift.

Legacy ADR-05 chose a web framework partly on the grounds that a rival's 10-15% raw throughput
advantage "doesn't matter for an I/O-bound, low-traffic, SSE-heavy workload". That may be true,
but low-traffic was never quantified and the claim can't be checked — see
[what load should the server handle](what-load-should-the-server-handle.md). It is not evidence
that benchmarks are irrelevant here; it is evidence that nobody has worked out which ones would
apply.
