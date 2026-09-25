---
number: 37
status: accepted
date: 2026-09-24
---

# 37 — The renderer draws client state and does not own it

## Forced by

- [ADR-0004](0004-the-client-holds-and-mutates-puzzle-state.md) puts a complete copy of puzzle state
  on the client and has it mutated there, without saying where inside the client it lives.
- [ADR-0005](0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) shares the
  rules as one implementation that a browser and a batch process both run, so the rules take plain
  data and cannot depend on any renderer's state model.
- [Reopening restores the board in progress with notes and
  selection](../guarantees/reopening-restores-the-board-in-progress-with-notes-and-selection.md),
  [input registers without waiting for the
  network](../guarantees/input-registers-without-waiting-for-the-network.md) and [conflicts are
  reconciled without asking the
  player](../guarantees/conflicts-are-reconciled-without-asking-the-player.md) each depend on how a
  change is applied, saved and merged. Where that code runs decides what can break them.
- [What renders the client?](../questions/what-renders-the-client.md) found no difference a player
  can see between React, Vue and Svelte, so how much a wrong choice of renderer costs to reverse is
  set by this record rather than by the renderer.
- The architecture spike recorded in that question ran one state module unchanged under all three
  renderers, and every scenario behaved identically: a remote update mid-drag, cross-tab sync,
  keyboard undo, touch drag-select and an offline restore. Held outside, every change is applied by
  plain code before any renderer schedules anything, and the rules only ever receive plain data,
  which removes the two traps the earlier spike measured: React dropping drag input, and Solid
  costing fifteen times more when its reactive store reached the rules.

## Decision

**Client state that a promise in [../guarantees/](../guarantees/) covers is held outside the
renderer, by code under `src/client/state/`.** That code holds the puzzle state in memory, meaning
the board, the selection and undo history; applies every change; saves every change to client
storage; and merges updates from sync and from other tabs. It exposes an immutable snapshot, a
subscription and a set of actions, and it imports nothing from any renderer.

**The renderer subscribes, draws and calls actions.** It never copies durable state into its own
state tools and mutates it there. State that no promise covers, called view state, such as a drag in
progress, whether a dialog is open or a hover highlight, may live in the renderer.

**The rule for new state is the guarantee test.** State that a promise covers goes in
`src/client/state/`. Anything else goes where it reads best, and a view concern does not move into
the client's state only to make a view easier to write.

**This record does not choose how the client's state is built.** Hand-written, or on a library such
as Zustand's framework-agnostic store, TanStack Store, nanostores, Redux Toolkit or a signals
library, is open at [what implements the client's
state?](../questions/what-implements-the-clients-state.md), which M5 needs and M1 does not.

**What it keeps open:** the renderer can be replaced at the cost of rewriting the view code, and the
client's state can run where no renderer does: under a test runner without a browser, in a worker,
or behind a different shell.

**Resources.** CPU does not bind: every change hands each subscribed view a new snapshot to
re-derive from, which measured under 2ms per change at a 15 by 15 grid on an Apple M2 in every
renderer tried, and a floor device is unmeasured. Memory does not bind: each change allocates a new
board of tens of kilobytes, inside the device bound in [../constraints.md](../constraints.md).
Storage and network are where this earns its place rather than where it costs: the client's state
owns the write on every change and the merge from sync, so no renderer's scheduling sits between an
input and its write. The storage mechanism is open at M6.

## Enforced by

**Nothing. Asserted only.** No client code exists. It is satisfied when `src/client/state/` exists,
and view code reaches it only through its snapshot, subscription and actions. An import boundary
check could enforce the second half once M2 chooses the checks.

## Rejected

- **The renderer's own state tools own it** — a reducer and context in React, a Pinia store in Vue,
  a runes module in Svelte, with saving and sync as that renderer's effects. The case for it is
  real: each renderer's devtools see the state, fine-grained updates need no snapshot, React's
  transitions can defer a large update, and there is less code of our own. It is rejected because
  it puts the save on every change and the merge from sync inside the renderer's update scheduling,
  and the renderer spike measured that path dropping input: React's first build lost cells from a
  fast drag because a handler read state from its last render while React deferred the next one.
  **Reverses if** a renderer is chosen whose state tools apply every change synchronously and the
  renderer is accepted as permanent, so that keeping it replaceable buys nothing.
- **Not yet** — leave where state lives until real state lands at M5. It is rejected because the
  renderer is chosen at M1, and whether that choice costs a view rewrite or a client rewrite to
  reverse is this answer. **Reverses if** the renderer question is moved past M5.

A third option, the client's state built on a framework-agnostic signals library, is not rejected.
It is a way of building it and moves to [what implements the client's
state?](../questions/what-implements-the-clients-state.md).

## Risk

**React cannot defer an update that comes from the client's state.** Its
[documentation](https://react.dev/reference/react/useSyncExternalStore) says a store mutated during
a transition makes React "fall back to performing that update as blocking", so a large update from
sync always renders at once. At measured grid sizes that costs one to two milliseconds.

**Every change notifies every subscribed view,** so a renderer's fine-grained tracking only works
below the snapshot. Screens added later, such as an archive or stats, subscribe to a selected slice
rather than the whole.

**Placing state wrongly fails silently.** Durable state left in the renderer is lost on reload
without an error, and view state put in the client's state is saved and synced for nothing. The
architecture spike did the second: its store carries `remoteChanged` and `remoteVersion` only so a
view can animate.

**The client's state is invisible to renderer devtools.** Inspecting it needs hooks of its own, such
as a log of actions, unless the library chosen at M5 supplies them. Each renderer also needs a small
adapter to subscribe: one hook call in React and about ten lines in Vue and Svelte in the spike.

## Revisit when

- A view needs to defer an update driven by the client's state and the one-to-two-millisecond cost
  is measured as a dropped frame on a floor-class device.
- The cost of re-deriving from a whole snapshot is measured binding on a real screen.
- The renderer is accepted as permanent, which removes most of what this record buys.

## Also update

- [x] questions/README.md — the renderer question takes this as a given rather than a must-answer,
  and [what implements the client's state?](../questions/what-implements-the-clients-state.md) opens
  at M5.
- [x] architecture.md — the client box shows the client's state held apart from the renderer.
- [x] constraints.md — nothing imported.
- [x] glossary.md — adds puzzle state, its three copies and where each lives, and view state.
- [x] guarantees/ — no new promise; the record routes existing ones.
