---
opened: 2026-08-30
status: open
resolves_into: decision
---

# What runs the server, and in what language?

## Why it matters

Spans every deployable — the client, a server if there is one, and the generator — because the
interesting part is not what each is written in but whether they share.

A browser runs JavaScript and WebAssembly; that much is forced. Everything above it is a choice,
and component frameworks with build steps exist for several languages that compile to either. So
"one language everywhere" does not necessarily mean a JavaScript-family one — it could equally
mean a compiled language reaching the browser through WebAssembly.

Underneath sits a more foundational question this has to answer first: **is there one
implementation of the puzzle rules, or more than one?** If one, the language choice is constrained
to something every deployable that needs the rules can run. If more than one, each deployable
chooses freely and the constraint disappears.

## Blocked by

the client holding state, settled by [ADR-0002](../decisions/0002-the-client-holds-and-mutates-puzzle-state.md).

[How expensive is puzzle generation?](how-expensive-is-puzzle-generation.md).

[What load should the server handle?](what-load-should-the-server-handle.md).

## Blocks

[how the codebase is laid out](how-is-the-codebase-laid-out.md).

## What would settle it

The sharing question first, since it constrains the rest. Then, for whichever languages remain
in play, the two measurements already named elsewhere:
[how expensive is puzzle generation](how-expensive-is-puzzle-generation.md) and
[what load should the server handle](what-load-should-the-server-handle.md). Neither has been run,
and both were the grounds on which the previous answer was reached.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Findings drawn from legacy ADR-01 (render with server-driven hypermedia).

Options and findings ported from legacy ADR-02 (use Rust for the backend).

Finding drawn from legacy ADR-05 (use Axum with the official Datastar SDK).

## Options

The first choice is about sharing rather than syntax.

*One implementation of the rules, one language.* Everything that needs the rules is written in the
same language — either a JavaScript-family one with generation running on the same runtime, or a
compiled one reaching the browser through WebAssembly. Simplest to reason about; constrains every
deployable to a language that works everywhere.

*One implementation, two host languages, shared as a compiled module.* Rules compiled to
WebAssembly once, imported by a client written in something else and used natively by the
generator. One implementation without one language — at the cost of a WebAssembly artifact in the
client and an interop boundary to maintain.

*More than one implementation, kept in agreement by tests.* Each deployable uses whatever suits
it, with differential testing — the generator's output validated by the client's validator —
catching divergence. Maximum freedom per deployable, and an ongoing obligation that never ends.

## Findings

**The pressure to share is between the client and the generator, not the server.**
[ADR-0003](../decisions/0003-the-server-validates-puzzle-state-but-does-not-arbitrate-it.md) keeps
the server out of gameplay: it checks that a payload is a well-formed board, not that the position
is legal. So the server does not need the rules and is nearly free to differ. The client needs
them to give feedback on a move and to recognise completion; the generator needs them to produce
puzzles at all. That is where duplication would hurt.

The server may join that set later. ADR-0003 defers position validation with a stated trigger —
the moment anything gated depends on a puzzle genuinely being finished — so a language choice that
makes the server unable to run the rules is closing a door rather than declining to open one.

**Divergence between two implementations breaks a promise silently.** If the generator's
uniqueness check and the client's validator disagree, a puzzle can ship that one considers sound
and the other does not. [../guarantees/puzzles.md](../guarantees/puzzles.md) promises exactly one
solution reachable by deduction, and nothing would surface the violation — the generator would
believe it had succeeded.

**A WebAssembly client is a real option and carries a real cost.** It puts a substantially larger
artifact on the initial load, which is the one place
[../constraints.md](../constraints.md) says size does matter: transfer time stops being the
bottleneck once a connection is warm, and a cold load over a degraded link is the case that is
already several seconds of round trips before any bytes move.

**A performance argument for a compiled language is unestablished in both directions.** Nobody has
measured generation cost, and both the claim that it is cheap and the previous decision's claim
that it is compute-bound are expectations rather than measurements.

**The reliability half of the previous argument was never addressed.** Its stated driver was
"performance/reliability"; everything since has attacked performance. Stricter types, exhaustive
matching and the absence of null are a real argument independent of speed, and this is the other
benefit any case for a second language would have to rest on.

**The previous decision preserved a performance ceiling for a component that did not exist**, on
the grounds of future compute-heavy generation work. Whether that reads as prudence or prematurity
is what the cost measurement decides.

**Framework and runtime micro-benchmarks are not a criterion at this scale**, and a previous
decision that leaned on one said so itself while leaning on it anyway.

**The maintainer has strong TypeScript and React experience and only moderate Rust experience**,
alongside recorded enthusiasm for "easy mode Rust". Both are on record; one is about capability
and the other about enjoyment, and per the standards the first is a cost of adopting the
unfamiliar option rather than a merit of the familiar one.