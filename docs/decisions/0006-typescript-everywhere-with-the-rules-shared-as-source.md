---
number: 0006
status: accepted
date: 2026-08-31
---

# 0006 — TypeScript everywhere, with the rules shared as source

## Forced by

[ADR-0005](0005-one-implementation-of-the-puzzle-rules.md) requires one implementation of the
puzzle rules, used by both the generator and the client. So whatever the rules are written in has
to run in a browser and in a batch process, and the browser is the constrained end.

[ADR-0002](0002-the-client-holds-and-mutates-puzzle-state.md) puts authoritative state on the
client along with local persistence, and
[ADR-0004](0004-a-component-framework-renders-the-client.md) rests on the edit-to-feedback loop
being fast. Both bear on what follows.

## Decision

TypeScript for the client, the generator, and the shared rules module. The rules are shared as
source — imported directly by everything that needs them — rather than as a compiled artifact,
which is the open half of ADR-0005 now closed.

A server, if one exists, is not bound by this. It does not need the rules today. But the door
ADR-0003 left open — position validation, once anything gated depends on a puzzle genuinely being
finished — is cheapest to walk through if it can import the same module, so the same choice is
likely to be right there too.

## Rejected

### Languages compiling to WebAssembly

Rust with Leptos or Dioxus, and similar. Rejected, but **not for the reason usually given**.

**Runtime performance is not the problem, and claiming it is would be wrong.** On the
js-framework-benchmark, Leptos and Dioxus both outperform React and land close to vanilla
JavaScript DOM performance. For a grid of eighty-one cells updating one cell per keystroke — about
as low-churn as an interactive app gets — raw rendering speed would not have been the thing that
bit us.

**The structural problem is that WebAssembly cannot reach the DOM, `localStorage` or IndexedDB
directly.** It calls JavaScript glue for all of it, and this is not a temporary gap: the core web
APIs are defined in standards committees as JavaScript APIs through WebIDL, which assumes JS
strings, objects, exceptions, promises and garbage collection. Direct access would require
enormous design and implementation effort nobody has committed to.

That matters here more than it would for most applications, because **the part WebAssembly cannot
do natively is the part this architecture is built around.** ADR-0002 makes the client the owner of
state, with local persistence; ADR-0003 makes it responsible for a deterministic merge. Persistence
is IndexedDB, and IndexedDB is reached through JavaScript. A WebAssembly client would still need a
JavaScript layer for precisely the thing that carries the most risk, and would then be maintaining
two runtimes to do it.

**The memory model leaks across that boundary in a way that threatens durability.** Exposing
unmanaged WebAssembly data to garbage-collected JavaScript is a documented abstraction leak, and
the worst part is the detection gap: some misuse is invisible to sanitizers because it happens on
the JavaScript side, surfacing only in production or after an unrelated change. Applied to this
app, a memory bug corrupting board state before it is persisted is exactly the failure recorded in
[a corrupt board becomes the canonical one](../failure-modes/a-corrupt-board-becomes-the-canonical-one.md)
— silent, propagated by the server copy, and destroying the local version that was still good.

**The bundle is the app, and the app has to load over a bad connection.** Rust-derived WebAssembly
bundles commonly exceed 300 KB uncompressed before compilation. [../constraints.md](../constraints.md)
records that a cold load on a degraded link is already several seconds of round trips before any
bytes move, and that is the only place we have established that size matters. Streaming compilation
and `wasm-opt` reduce this; they do not remove it.

**Debugging is materially worse, and this is a solo project.** Stack traces are cryptic, the
local-variable view cannot show string contents without inspecting linear memory, and console
expression evaluation cannot call functions. ADR-0004 rests on the inner loop being fast, and
debugging is part of that loop. Rust's compile times work the same way — incremental rebuilds are
tolerable, full ones are a minute or two.

### Languages compiling to JavaScript

Elm, ReScript, PureScript and similar. Stronger type systems than TypeScript, and no WebAssembly
boundary. Rejected on ecosystem rather than on language quality: ADR-0004 chose a component
framework, and the field of those narrows drastically outside the JavaScript mainstream. The
browser APIs this design leans on hardest — IndexedDB, service workers, page lifecycle — have the
thinnest wrappers exactly where we need the most support. Elm additionally has no comfortable story
for a batch generator, which ADR-0005 requires the same language to serve.

### Plain JavaScript

Rejected for the ordinary reason: the portable standards call for errors represented in the type
system and for making illegal states unrepresentable, and neither is available without types.

## Risk

**This does not answer the reliability argument; it accepts losing it.** The case for a compiled
language was always "performance and reliability", and only the performance half has been
addressed. TypeScript's type system is deliberately unsound — `any`, assertions, and structural
escape hatches are all reachable — so this decision gives up guarantees a stricter language would
have provided, in exchange for the client constraints above. That trade should be paid for
explicitly: strict compiler settings, no implicit `any`, exhaustive matching, and the runtime
assertions the correctness standard requires, since the compiler will not catch what a stricter one
would.

**A single language everywhere means a single blast radius.** A runtime bug, a supply-chain
compromise, or an ecosystem-wide breaking change touches the client, the generator and the rules at
once. That is the cost of the sharing ADR-0005 chose, and it is real rather than theoretical.

**This lands where existing strength already is.** That is the same hazard ADR-0004 recorded, and
naming it twice is not redundant: two decisions in a row landing on the familiar option is exactly
the pattern that would look like reasoning and be preference. The defence is that the chain here is
a derivation — one implementation, shared with the browser, so a language the browser runs natively
— and each link is checkable independently of what anybody already knows.

**WebAssembly's DOM situation may improve.** It is a standards problem rather than an
implementation gap, so improvement would be slow and visible rather than sudden, but this decision
is contingent on it and should not pretend otherwise.

## Revisit when

- Generation stops being batch work nobody waits on. Its cost is irrelevant today across four
  orders of magnitude; if it moves onto a path a player waits on, a compiled language becomes an
  argument again.
- WebAssembly gains direct DOM and storage access without a JavaScript layer.
- The rules module grows into something whose correctness genuinely needs a stricter type system —
  at which point sharing a compiled artifact, the option ADR-0005 left open, becomes worth its
  interop cost.

## Also update

- [x] The language question is answered, mined and retired. Its one surviving finding — that
      framework micro-benchmarks are not a criterion at this scale — moved to the framework question
- [x] [which component framework?](../questions/which-component-framework.md) is unblocked, and its
      candidate set is now the TypeScript ones
- [ ] Nothing in `guarantees/` — no new promise
- [ ] `constraints.md` — the WebAssembly facts above are properties of the platform, and belong
      there if a WebAssembly option is ever reconsidered rather than pre-emptively

## Sources

- [WebAssembly Won't Get Direct DOM Support Any Time Soon](https://danfabulich.medium.com/webassembly-wont-get-direct-dom-support-any-time-soon-a3e0ea04c688)
- [When Is WebAssembly Going to Get DOM Support? — ACM Queue](https://queue.acm.org/detail.cfm?id=3746174)
- [WebAssembly Limitations](https://qouteall.fun/qouteall-blog/2025/WebAsembly%20Limitations)
- [Leptos vs Yew vs Dioxus, 2026](https://reintech.io/blog/leptos-vs-yew-vs-dioxus-rust-frontend-framework-comparison-2026)
