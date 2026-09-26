---
opened: 2026-09-24
status: open
resolves_into: decision
---

# What implements the client's state?

## Why it matters

[ADR-0037](../decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md) puts client
state that a promise covers in code under `src/client/state/`, outside the renderer, and leaves open
how that code is built. It is the longest-lived part of the client, so what it depends on is priced by
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
at close to the cost of rewriting it.

## What would settle it

Knowing the storage mechanism, how far back undo goes and whether state is a snapshot or an event
log, because those decide how much of it a library could supply. Then a comparison of what
each option provides against what the client's state must do: apply changes synchronously, save each one in
order, merge from sync and other tabs, and be inspectable while developing.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split from the question answered by
[ADR-0037](../decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md), whose first
option had named a hand-written module without arguing it.

## Options

*Hand-written.* The subscription and snapshot machinery is about twenty lines; the rest is this
app's own logic, which no library provides.

*A framework-agnostic store library*: Zustand's vanilla store, TanStack Store, nanostores or Redux
Toolkit. Each supplies the subscription machinery, and some supply devtools integration and
persistence helpers.

*A signals library*, such as `@preact/signals-core` or `alien-signals`, so a view can subscribe to one
cell rather than to a whole snapshot.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The architecture spike's hand-written store was about 150 lines, of which about 20 were
subscription machinery.** The rest was undo, the save on every change, loading, merging remote
updates and cross-tab sync.
*Measured — the spike's `store.ts`, written by me 2026-09-24.*

**Weekly npm downloads for 2026-09-15 to 2026-09-21:** `zustand` 39.8 million, `@tanstack/store`
22.7 million, `@reduxjs/toolkit` 21.6 million, `nanostores` 6.5 million, `mobx` 2.7 million,
`valtio` 1.5 million, `@xstate/store` 0.1 million.
*Sourced — the npm downloads API, queried by me 2026-09-24.*

**Whether any library's persistence helpers meet this app's durability needs is unchecked.** The
needs are an ordered write to client storage on every change, a flush when the page is hidden, and
detecting eviction.

**A signals library adds a dependency to the most durable part of the client**, whose stewardship
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
prices at close to the cost of rewriting it, and the TC39 proposal that would standardise signals is
at Stage 1.
*Sourced — the proposal's stage is from the renderer survey in
[what renders the client?](what-renders-the-client.md), read by a research agent 2026-09-16, not
re-checked since. That it prices the dependency high is reasoned from
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md).*
