---
number: 38
status: accepted
date: 2026-09-25
---

# 38 — The renderer is React

## Forced by

- [ADR-0037](0037-the-renderer-draws-client-state-and-does-not-own-it.md) makes the renderer a view
  over state held under `src/client/state/`, so replacing it costs a rewrite of the views and not of
  the client. That is what makes this choice reversible at a known price.
- [ADR-0028](0028-the-client-build-and-the-http-server-are-separate-tools.md) and
  [ADR-0029](0029-the-client-bundler-is-vite.md) rule out a meta-framework and fix Vite as the
  bundler, so the renderer runs client-only on Vite.
- [ADR-0007](0007-that-language-is-typescript.md) makes the client TypeScript, and the repository
  pins TypeScript 7.
- [What renders the client?](../questions/what-renders-the-client.md) built all eighteen surviving
  candidates against the same board and disqualified none. Measured speed at realistic grid sizes
  separated only the minimal libraries from the rest, so the field was narrowed on what each costs to
  live with: the minimal libraries, Marko and Ripple have thin ecosystems, single maintainers and
  little code for AI assistants to have learned from; Solid has a rewrite of its reactivity in
  release candidate and one employer behind it; Preact stays as React's alternative, below. That
  narrowing is the maintainer's judgement on those rows rather than a measurement. React, Vue and
  Svelte were then built as the same slice of the intended client and showed no difference a player
  can see. [../problem.md](../problem.md) weights what remains by one maintainer building it for years
  with an interface worth being proud of.

## Decision

**The client renders with React**, on Vite, without a React framework.

**No candidate was disqualified, so this is a weighing, and the weights are stated.** In order:

1. **Tooling.** React's markup is JSX, which TypeScript and every tool built on it read natively.
   Vue's and Svelte's single-file components need a separate language layer that each new tool
   supports later, and the question file records the current instance: `vue-tsc` fails on TypeScript
   7, `svelte-check` needs TypeScript 6 beside it, Biome marks both formats experimental and oxlint
   does not lint their templates. The cause is structural, so the gap recurs with each new tool.
   This is the weight the decision rests on.
2. **What a long life will need beyond the board.** React, Vue and Svelte each have a maintained
   library for gestures, dialogs, charts, internationalisation and testing, so existence does not
   separate them. React leads where the question file compares them: first-party bindings from most
   local-first storage libraries, the largest body of code AI assistants learned from, which is
   reasoned from usage rather than measured, and foundation governance since 2026-02-24.
3. **Tie-breakers, stated as such.** The maintainer knows React, which is recorded as the cost of
   learning Vue or Svelte rather than as a merit of React. And React is what the demonstration
   purpose in [../problem.md](../problem.md) is most likely to be read against. That purpose's guard
   asks whether a component would be worth building with no demonstration value; a renderer is needed
   either way, so demonstration value decides nothing here beyond breaking a tie.

**What it keeps open:** Preact runs React's programming model at a ninth of the bytes and was faster
on every board path measured, so moving to it is the cheapest change available if React's size or
speed ever binds.

**This record does not settle** whether React Compiler is used, which router, how the app is styled
or how view code is tested. Each is its own decision, taken when a slice needs it.

**Resources.** CPU does not bind at the grid sizes that matter: a drag step at 15 by 15 cost 3.2ms as
first written and 2.1ms with React Compiler on an Apple M2, and a floor device is unmeasured. Memory
does not bind: the heap after load at 15 by 15 was 2.2 to 2.3MB for React, against 2.0MB for Vue
and 3.3MB for Svelte, in Chromium. Network is where React costs most:
about 58KB of JavaScript after brotli compression against 23KB for Vue and 16KB for Svelte in the
same spike, downloaded once and parsed on every cold start. Storage does not bind.

## Enforced by

**Nothing. Asserted only.** No client code exists. It is satisfied when `react` and `react-dom`
are the client's rendering dependencies and the entry point mounts a React root, which slice 2 of M1
builds.

## Rejected

- **Vue** — the strongest alternative. Its case: fastest of the three with no tuning, an official
  router and devtools, scoped styles and transitions built in, and a single-page app on Vite is its
  own default path. Nothing disqualifies it. It loses on the first weight: its templates depend on a
  language layer that lags each new TypeScript tool, which this repository meets today on TypeScript
  7. **Reverses if** single-file component tooling reaches parity with TSX and holds it through a
  TypeScript major release, or if React's cost on a floor device binds and Preact does not fix it.
- **Svelte** — its case: the least ceremony, built-in transitions, compiler accessibility warnings
  and the smallest mainstream bundle. It loses because its own documentation names SvelteKit as the
  official router, and [ADR-0028](0028-the-client-build-and-the-http-server-are-separate-tools.md)
  rules SvelteKit out, so a client-only Svelte app routes with community packages. **Reverses if**
  Svelte ships an official router for apps without SvelteKit.
- **Preact** — its case: React's model, 6.5KB against 58KB, and faster on every measured path. It
  loses on the second weight: much of its library ecosystem is React's reached through a
  compatibility layer that trails React's releases, and 83% of its commits in the last year came
  from one author. **Reverses if** React's size or speed is measured binding on a floor-class
  device, which is the case this record keeps it open for.
- **The rest of the field** — Solid, Marko, Ripple, the minimal libraries and hand-written DOM —
  were weighed in [what renders the client?](../questions/what-renders-the-client.md), which records
  each one's measurements and the reasons they fell behind.
- **Not yet** — slice 2 of M1 renders "Hello!" on the client and cannot be built without a renderer.

## Risk

**React is the heaviest candidate.** About 58KB after brotli, parsed on every cold start. On a slow
transit connection the first visit takes roughly a second longer than with Vue or Svelte, which is
arithmetic rather than a measurement.

**Floor-device speed is unmeasured.** A 15 by 15 drag step costs 2 to 3ms on an M2, and a device
five to ten times slower would sit near a 60Hz frame for the largest grids.

**The concrete instance of the first weight rests on a pin nothing has chosen.** `vue-tsc` fails
here because `package.json` pins TypeScript 7.0.2, and which versions are pinned is open at
[what pins the toolchain versions across machines?](../questions/what-pins-the-toolchain-versions-across-machines.md).
The structural part of that weight does not depend on the pin: Biome, oxlint and ast-grep treat
single-file components as secondary whatever TypeScript version is installed.

**This app is off React's main path.** React recommends starting with a framework, and a client-only
app on Vite leaves routing, data loading and styling to be chosen here.

**React's own model allows the input bug the spike hit**, a handler reading state from its last
render while the next is deferred. [ADR-0037](0037-the-renderer-draws-client-state-and-does-not-own-it.md)
keeps that away from durable state, and view state still needs updater functions.

**Familiarity is a known pull on this decision**, which is why it counts only as a tie-breaker. The
first weight does not depend on it.

## Revisit when

- A floor-class device shows React's cold start or a drag step binding; Preact is tried first.
- Single-file component tooling holds parity with TSX through a TypeScript major release.
- React's ecosystem stops supporting client-only apps on a bundler without a React framework.

## Also update

- [x] questions/README.md — the renderer question is answered; slices 2 and 3 take this as a given,
  and [ADR-0028](0028-the-client-build-and-the-http-server-are-separate-tools.md)'s Nuxt condition
  cannot arise.
- [x] architecture.md — names React as the renderer.
- [x] constraints.md — nothing imported.
- [x] glossary.md — nothing introduced.
- [x] guarantees/ — no new promise.
