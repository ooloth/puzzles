---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Which language do the deployables share?

## Why it matters

**One TypeScript codebase across every deployable is a web-shaped answer.** It makes sense when
the client is a browser application and much less sense when the client is Swift or Kotlin, so
this cannot be settled ahead of the platform.

What is at stake is the whole toolchain above it. The framework field, the build tooling, the
test runner and the package manager are all downstream, and a language chosen for the client
also decides what the generator and any server are written in.

## Blocked by

[Is this delivered over the web, or natively?](is-this-delivered-over-the-web-or-natively.md),
then [is there one implementation of the puzzle rules?](is-there-one-implementation-of-the-puzzle-rules.md)
— if the rules are not shared, each deployable is free and this question dissolves.

## Blocks

[What renders the client?](what-renders-the-client.md) and everything under it, plus
[what runs the server, if there is one?](what-runs-the-server-if-there-is-one.md).

## What would settle it

The two questions above. The comparison itself is done and is recorded below.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Demoted from ADR-0006 on 2026-08-31.

## Options

*TypeScript for client, generator and shared rules*, with the rules shared as source rather than
as a compiled artifact.

*A language compiling to WebAssembly* — Rust with Leptos or Dioxus, and similar.

*A language compiling to JavaScript* — Elm, ReScript, PureScript.

*Plain JavaScript.*

## Findings

**WebAssembly is not rejected on performance, and claiming otherwise would be wrong.** On the
js-framework-benchmark, Leptos and Dioxus both outperform React and land close to vanilla
JavaScript DOM performance. For a grid of eighty-one cells updating one cell per keystroke, raw
rendering speed was never going to be what bit us.

**The structural problem is that WebAssembly cannot reach the DOM or browser storage directly.**
It calls JavaScript glue for all of it, and this is not a temporary gap: the core web APIs are
defined through WebIDL, which assumes JavaScript strings, objects, exceptions, promises and
garbage collection. This holds for **every** browser storage mechanism — `localStorage`,
IndexedDB, the Cache API, OPFS — which is why the earlier record's reference to one specific
mechanism was both unsupported and unnecessary.

**That matters here more than it would elsewhere**, because the part WebAssembly cannot do
natively is the part this architecture is built around: the client owns state and persists it, so
a WebAssembly client would still need a JavaScript layer for precisely the thing carrying the most
risk, and would maintain two runtimes to do it.

**The memory model leaks across that boundary in a way that threatens durability.** Exposing
unmanaged WebAssembly data to garbage-collected JavaScript is a documented abstraction leak, and
the detection gap is the worst part: some misuse is invisible to sanitizers because it happens on
the JavaScript side, surfacing only in production. Applied here, a memory bug corrupting board
state before it is persisted is exactly
[a corrupt board becoming canonical](../failure-modes/a-corrupt-board-becomes-the-canonical-one.md).

**Bundle size is the app, and the app loads over a bad connection.** Rust-derived WebAssembly
bundles commonly exceed 300KB uncompressed. [../constraints.md](../constraints.md) records that a
cold load on a degraded link is already several seconds of round trips before any bytes move.

**Debugging is materially worse, and this is a solo project.** Stack traces are cryptic, the
local-variable view cannot show string contents without inspecting linear memory, and console
expression evaluation cannot call functions.

**Languages compiling to JavaScript lose on ecosystem rather than on language quality.** The
browser APIs this design leans on hardest — storage, service workers, page lifecycle — have the
thinnest wrappers exactly where the most support is needed, and Elm has no comfortable story for a
batch generator.

**TypeScript's type system is unsound, and choosing it accepts losing an argument rather than
winning it.** The case for a compiled language was always performance *and* reliability, and only
the performance half is answered above. That trade should be paid for explicitly: strict compiler
settings, no implicit `any`, exhaustive matching, and the runtime assertions the correctness
standard requires.

**A single language everywhere means a single blast radius.** A runtime bug, a supply-chain
compromise or an ecosystem-wide breaking change touches the client, the generator and the rules at
once.

## Sources

- [WebAssembly Won't Get Direct DOM Support Any Time Soon](https://danfabulich.medium.com/webassembly-wont-get-direct-dom-support-any-time-soon-a3e0ea04c688)
- [When Is WebAssembly Going to Get DOM Support? — ACM Queue](https://queue.acm.org/detail.cfm?id=3746174)
- [WebAssembly Limitations](https://qouteall.fun/qouteall-blog/2025/WebAsembly%20Limitations)
