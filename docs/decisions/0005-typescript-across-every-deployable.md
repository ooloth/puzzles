---
number: 0005
status: accepted
date: 2026-08-31
---

# 0005 — TypeScript across every deployable, with the rules shared as source

## Forced by

**[ADR-0004](0004-one-implementation-of-the-puzzle-rules.md) requires the puzzle rules to run in a
browser and in a batch process from one source.** That is the whole of what this question inherits.
It leaves open whether the sharing happens by source — one language everywhere — or by a compiled
artifact with an interop boundary.

**[ADR-0003](0003-this-is-delivered-over-the-web.md) makes the browser half of that a browser.** One
codebase across every deployable is a web-shaped answer; it would make much less sense with a Swift
or Kotlin client.

**[../problem.md](../problem.md) ranks the interactive path over batch throughput**, and states that
generation is separable and can be slow. It also ranks clarity over cleverness, *because one person
maintains this*.

## Decision

TypeScript, in the client and in the generator, with the puzzle rules shared as source rather than
as a compiled artifact.

This binds the deployables that need the rules. A server, if
[one exists](../questions/what-must-be-true-off-device.md), inherits the same constraint only if it
needs the rules too — which is open, and not settled here.

## Rejected

- **A TypeScript client with the rules compiled to WebAssembly, and a native generator.** The
  strongest rejected option, and the one the earlier research did not confront: it is what "sharing
  a compiled artifact" actually means, and the usual objections to WebAssembly do not touch it. The
  rules module is pure computation and reaches neither the DOM nor storage, so the boundary problems
  that rule out a WebAssembly *client* do not apply.

  It loses on three counts. The marshalling sits on the interactive path rather than in a batch job:
  ADR-0004 established that the client and the generator converge on the human-method engine, and
  legality runs on every keystroke at one input every one to three seconds, so board state crosses a
  JavaScript-to-WebAssembly boundary constantly. Exposing unmanaged WebAssembly data to
  garbage-collected JavaScript is a documented abstraction leak whose worst property is that some
  misuse is invisible to sanitizers, surfacing only in production — which applied to board state
  before it is persisted is
  [a corrupt board becoming canonical](../failure-modes/a-corrupt-board-becomes-the-canonical-one.md).
  And the thing it buys is generator speed, which `../problem.md` has already declined to want.

- **A WebAssembly client — Rust with Leptos or Dioxus, or similar.** Not rejected on performance,
  and saying so would be false: on the js-framework-benchmark both outperform React and land near
  vanilla JavaScript. Rejected because WebAssembly cannot reach the DOM or browser storage directly
  and calls JavaScript glue for all of it. That is not a temporary gap — the core web APIs are
  defined through WebIDL, which assumes JavaScript strings, objects, exceptions, promises and
  garbage collection — and it holds for every storage mechanism, `localStorage`, IndexedDB, the
  Cache API and OPFS alike. It matters here more than elsewhere because ADR-0002 puts state
  ownership and persistence in the client, so the part WebAssembly cannot do natively is the part
  carrying the most risk, and two runtimes would be maintained to do it. Bundles commonly exceed
  300KB uncompressed, against a cold load that `../constraints.md` records as already several
  seconds of round trips on a degraded link.

- **A language compiling to JavaScript — Elm, ReScript, PureScript.** Loses on ecosystem rather than
  on language quality, and the shortfall lands exactly where this design leans hardest: storage,
  service workers and page lifecycle have the thinnest wrappers. Elm has no comfortable story for a
  batch generator, which ADR-0004 requires to share the rules.

- **Plain JavaScript.** A real option — no build step, the simplest toolchain available, and nothing
  about a grid of eighty-one cells demands a type system. It loses because the rules module is the
  one piece whose correctness two guarantees rest on, and because ADR-0004 concentrated that
  correctness into a single place where a mistake is inherited everywhere rather than caught by
  disagreement.

## Risk

**TypeScript's type system is unsound, and this decision accepts losing that argument rather than
winning it.** The case for a compiled language was performance *and* reliability. The performance
half is answered above; the reliability half is not, and choosing TypeScript concedes it. Paying for
that is explicit work rather than a disposition: strict compiler settings, no implicit `any`,
exhaustive matching, and runtime assertions at the boundaries where unvalidated data enters, as the
portable correctness standard requires. Recording the concession here is what makes its absence
noticeable later.

**A single language everywhere is a single blast radius.** A runtime bug, a supply-chain compromise,
or an ecosystem-wide breaking change reaches the client, the generator and the rules at once. This
is the direct cost of the concentration ADR-0004 chose, and it is accepted for the same reason.

**Adopting Rust was rejected partly on the cost of a second toolchain, which is a cost rather than a
disqualification.** Cargo alongside npm, two debuggers, two ecosystems, one maintainer. Stated
plainly so that it is not mistaken for a claim that TypeScript is better — it is not the argument
for TypeScript, it is the price of the alternative.

**Debugging WebAssembly is materially worse and that shaped this**: cryptic stack traces, a
local-variable view that cannot show string contents without inspecting linear memory, and console
expressions that cannot call functions. For a solo project this is a real input, and it is the kind
that looks small until the first hard bug.

## Revisit when

- **Generation becomes something a player waits on.** `../problem.md`'s ranking is what removes the
  case for a faster generator language. If generation moves onto the interactive path — see
  [are puzzles generated ahead of time or on demand?](../questions/are-puzzles-generated-ahead-of-time-or-on-demand.md)
  — that ranking no longer applies and the WebAssembly rules module deserves rearguing.
- **The measured cost of generation makes a batch run impractical rather than merely slow**, per
  [how expensive is puzzle generation?](../questions/how-expensive-is-puzzle-generation.md), which
  is unmeasured in both directions.
- **A second maintainer joins for whom the second toolchain is not a cost.**

## Also update

- [x] Nothing in `constraints.md` — this imports no new facts about the world
- [x] Nothing in `guarantees/` — this adds no promise, and the unsoundness accepted above is a risk
      rather than a commitment

Deliberately not decided here: what renders the client, what builds it, what runs the tests, which
package manager, and what a server is written in if one exists.
