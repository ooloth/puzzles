# Ruthless rearchitecture for mobile-first, offline-resilient UX

Working record of a from-scratch critical re-evaluation of the entire stack,
triggered by noticing the original 23 ADRs were written without ever
establishing who uses this app, where, or under what conditions. Explicitly
NOT optimized for minimal diff from the existing decisions — the codebase is
still just docs and stubs, so the cost of a full rearchitecture right now is
low and the cost of carrying a wrong foundation forward is high.

Superseded once each decision below is turned into a real ADR. Do not treat
anything here as settled — it's the reasoning trail, not the destination.

## The core mistake

All 23 existing ADRs (`docs/decisions/`) and `docs/vision.md` never once
discuss mobile network conditions, offline use, or input-latency
requirements. The closest thing — `docs/failure-modes/01-sse-delivery-through-
flys-proxy.md` — treats SSE fragility as a proxy-configuration problem to
patch, not as a signal that the whole transport model was wrong for the
target environment. This is a known, recurring gap in the ADR format itself
(confirmed against Nygard's original proposal and MADR — neither forces
environment/user context), not a one-off oversight. Real precedent: Trello's
own engineering blog describes hitting this exact failure — *"it's frustrating
to lose the ability to use Trello when you enter the subway"* — and spending
~1.5 years rearchitecting because of it.

See `docs/context/usage-context.md` and `docs/context/quality-requirements.md`
for the corrected starting point: who uses this, where, under what
conditions, and the testable requirements (QR-1 through QR-6) derived from
that.

## What Things 3 (Cultured Code) validates

Researched as the reference point for "impeccable offline/multi-device UX,
sustained for a decade." Verified against their own engineering blog posts and
a podcast interview with their backend engineers (not source code — it's
proprietary):

- **Every device holds a complete local database as its actual source of
  truth**, not a cache. Founding premise since 2010, unchanged since.
- Sync is an **append-only operation log**; the server stores encrypted opaque
  blobs and does no interpretation — *"the backend is dumb storage... it's all
  up to clients how to understand data, to resolve conflicting situations."*
- **Push notifications are a wake-signal only, never a data channel** — real
  data is always pulled by the client from their own service. Deliberately
  tolerant of multi-minute delivery delays to dormant devices.
- Designed for "network is never trustworthy" from day one, not retrofitted.

What's specific to Things 3 and NOT needed here: their hardest problem
(Git-style three-way merge, field-level text diffing for co-edited notes)
exists because tasks/projects/notes/tags form a rich relational graph with
real concurrent-edit conflicts. A puzzle grid is ~81 independent scalar
values — a much lower-conflict domain. Their *posture* (full local DB,
network-distrust-by-default, dumb server) is the transferable lesson; their
*merge machinery* is overkill here (see QR-6 non-goal: concurrent multi-device
editing of the same puzzle is explicitly out of scope).

## Why Datastar (hypermedia, server-owns-state) is rejected

Not "immature for this" — structurally backwards. Datastar's entire model is
server-owns-state, pushed to a thin client over SSE, which is the literal
inverse of QR-1 (input feedback independent of network). Verified specifics:

- Each Datastar action is a discrete HTTP request; SSE patches come back over
  that same request-response cycle, connection closes after.
- Client-side signals *can* hold real state without a round trip, but
  Datastar's own philosophy and this project's ADR-01 scoped them to
  *ephemeral* UI state only — durable game state was left server-owned, with
  the persistence granularity explicitly undecided in `architecture/app.md`.
- Built-in retry/backoff only fires on a thrown fetch error, not a silent
  stall (the literal tunnel scenario) — no idle-timeout detection, no default
  reconnect UI, no offline/CRDT support in mainline.
- Datastar moved its own local-persistence primitive (`data-persist`) behind
  a paid tier in October 2025 — a concrete signal about how peripheral offline
  is to the project's own priorities.
- This isn't Datastar-specific: LiveView and Turbo share the same fundamental
  constraint (server round trip required for any server-driven state change).
  Any server-owns-state architecture fails QR-1/QR-2 by construction.

## Why the sync-engine landscape (Zero, Electric, PowerSync, Turso, Automerge,
Yjs, Jazz, TinyBase, InstantDB, Ditto) is rejected

All of these solve **concurrent multi-writer conflict resolution at
scale** — a problem this app doesn't have (QR-6: sequential, not
simultaneous, multi-device use; no real-time collaboration). Even Automerge
collapses independent scalar fields to plain last-write-wins internally —
meaning adopting a full CRDT engine here would pay for machinery whose
output, for this data shape, is indistinguishable from a version counter.

2026 has also been a genuinely volatile year for this category, which matters
for a solo maintainer choosing foundational infrastructure: Replicache
archived, ElectricSQL acquired by Databricks (hosted product winding down),
InstantDB acquired by OpenAI (sunsetting), Legend-State stuck in beta 23
months. Depending on any of them is a live risk, not a hedge.

Conclusion: a **hand-rolled, versioned last-write-wins sync** (client holds
full local state in IndexedDB, syncs a snapshot with a version counter to the
server on an interval/reconnect/completion, server just stores whichever
version is newest) is simpler, has zero third-party dependency risk, and is
the right-sized solution for an 81-cell grid with one writer at a time.

## Why Rust (and WASM) is rejected too — not just Datastar

Initially kept Rust for the puzzle generator/solver on the assumption that
generation is compute-heavy enough to need it. Doesn't survive scrutiny:

- Sudoku/star-battle generation at this grid size is not actually
  compute-constrained — backtracking + uniqueness verification runs in
  milliseconds on a JIT'd runtime (V8/JSC); plenty of production sudoku
  generators run this in-browser in plain JS.
- Even if TS were meaningfully slower, it wouldn't matter: generation is an
  offline batch job with no latency requirement (ADR-22 already establishes
  static seeding).
- Keeping Rust anywhere reintroduces the exact duplicated-logic problem this
  whole exercise was trying to eliminate, just relocated: the hint-technique
  hierarchy (naked singles → hidden pairs → X-wing) needs to run both at
  generation time (difficulty grading) and client-side (live hints, possibly
  offline) — in Rust-for-generator + TS-for-client, that's two implementations
  to keep in sync, or a WASM toolchain/interop boundary to avoid it. One
  TypeScript module, imported by the generator script, the server, and the
  client, has zero duplication and zero interop tax.
- The remaining cost of keeping Rust anywhere is real and ongoing: a second
  toolchain, a second dependency ecosystem, a second CI setup, a second
  language to context-switch into as a solo maintainer — for a compute
  problem that doesn't need it.

## The recommended stack

One language, one runtime, everywhere: **Bun + TypeScript.**

- **Client**: Vite + React (or Svelte — open, secondary, taste-level choice)
  holding live game state in memory during play.
- **Local persistence**: Dexie.js over IndexedDB as the client's durable
  local store — the actual source of truth during play, mirroring Things 3's
  "full local database per device" posture.
- **PWA shell**: `vite-plugin-pwa` / Workbox for service worker, offline
  app-shell caching, and installability.
- **Sync**: a small hand-rolled endpoint doing versioned last-write-wins
  upsert — no third-party sync engine.
- **Server**: Bun, same language as the client, sharing the game-engine
  module directly.
- **Generator/solver**: a Bun script, same shared `game-engine` package as the
  client and server import — no separate language, no WASM.

## Draft ADR supersession table

| ADR | Verdict |
|---|---|
| 01 (Datastar hypermedia) | Superseded — client-owned state (React/Svelte + Dexie/IndexedDB) |
| 02 (Rust backend) | Superseded — Bun/TypeScript |
| 03 (SQLite) | Likely survives, re-justified independently — revisit during hosting/DB discussion |
| 04 (separate generation from serving) | Survives, re-scoped to same-language-different-process |
| 05 (Axum + Datastar SDK) | Superseded |
| 06 (hypertext templating) | Superseded — no server-side HTML templating in a client-rendered app |
| 07 (anyhow) | Superseded — Rust-specific |
| 08 (dev feedback loop tooling) | Rewritten for Bun/Vite |
| 09 (mixed-strategy route testing) | Rewritten for TS/Bun test tooling |
| 10 (GitHub Actions CI) | Survives, pipeline contents change |
| 11 (server-side sessions, single-browser-only) | Superseded — state is client-owned + locally persisted first, synced opportunistically; sequential multi-device resume becomes supported rather than an explicit non-goal |
| 12 (Fly.io) | Open — revisit on its own merits |
| 13 (Litestream) | Open, depends on 12 |
| 14 (no reverse proxy) | Open, depends on 12 |
| 15 (hand-written Dockerfile) | Rewritten for Bun |
| 16 (secrets mgmt) | Survives conceptually, mechanics may shift with hosting |
| 17/18 (tracing/Sentry) | Survive, TS-equivalent tooling |
| 19 (Tailwind v4 standalone CLI) | Superseded — Tailwind runs naturally in the Vite pipeline now |
| 20 (embed static assets, vendor datastar.js) | Superseded |
| 21/22 (launch content, static seed puzzles) | Survive, content-level, stack-independent |
| 23 (crate-per-game organization) | Rewritten as package-per-game in a Bun workspace, same underlying principle |

## Documentation pattern to prevent this happening again

No standard ADR template (Nygard, MADR) forces environment/user context to be
established first — confirmed gap in the format itself. Adopted arc42's
ordering (Goals/Stakeholders → Constraints → Context and Scope → Solution
Strategy → decisions) and SEI's quality-attribute-scenario format, collapsed
to solo scale:

```
docs/
  context/
    usage-context.md        # who, where/how used, expectations, non-goals — written first
    quality-requirements.md # testable scenarios (QR-N) derived from usage-context.md
  decisions/                # ADRs must cite QR-N ids, never restate them
```

Already written: `docs/context/usage-context.md`,
`docs/context/quality-requirements.md`.
