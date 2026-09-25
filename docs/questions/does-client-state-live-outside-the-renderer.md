---
opened: 2026-09-24
status: answered
resolves_into: decision
---

# Does client state live outside the renderer?

## Why it matters

**How much the renderer choice costs to reverse depends on this answer.**
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) puts puzzle state on the
client, and [ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)
shares the rules as one plain implementation. Neither says where the client's state lives inside
the client. If the renderer owns it, the state, the save on every change, undo and sync are all
written in that renderer's idiom, and replacing the renderer means rewriting them. If a plain
TypeScript module owns it and the renderer only draws it, replacing the renderer means rewriting
the views and nothing else.

**It is a prerequisite of [what renders the client?](what-renders-the-client.md).** That question
found no difference a player can see between React, Vue and Svelte, so it turns on what each costs
to live with, and how much a wrong pick costs is set here.

## What would settle it

Weighing the options below against the guarantees on durability and input, using the architecture
spike recorded in [what renders the client?](what-renders-the-client.md) as evidence of option A.
Nothing further needs running to decide it; what option A needs next is a rule for which state goes
where, stated in the record.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised while working [what renders the client?](what-renders-the-client.md), when all three
renderers ran unchanged over one shared store and the choice between them stopped being about what
a player sees.

## Options

*A. Code outside the renderer owns durable state, and the renderer is a view over it.* That code
holds the board, the selection, undo, the save on every change and sync, and exposes actions and a
subscription. The renderer subscribes, draws and calls actions. State that no guarantee covers, such
as a drag in progress or whether a dialog is open, stays in the renderer. How the module is built,
by hand or on a library, is a separate question:
[what implements the client's state?](what-implements-the-clients-state.md).

*B. The renderer's own state tools own it.* A reducer and context in React, a Pinia store in Vue, a
runes module in Svelte, with saving and sync written as that renderer's effects or plugins.

*C. As A, with the module built on a framework-agnostic reactive library* such as
`@preact/signals-core` or `alien-signals`, so views can subscribe to one cell's state rather than to
the whole snapshot. This is a way of building option A, and moved to
[what implements the client's state?](what-implements-the-clients-state.md).

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Option A ran unchanged under React, Vue and Svelte.** One store module served all three builds of
the architecture spike, and every scenario behaved identically in each: a remote update mid-drag,
cross-tab sync, keyboard undo, touch drag-select and an offline restore.
*Measured — recorded with its method in [what renders the client?](what-renders-the-client.md),
2026-09-24.*

**Option A removed both renderer traps the earlier spike hit.** React's first build dropped drag
input because a handler read state from the last render while React deferred the next one, and
Solid's cost fifteen times more when its reactive store reached the rules. With the store outside,
every change is applied synchronously by plain code before any renderer schedules anything, and the
rules only ever receive plain data.
*Measured for the traps, in the same file; that the store removes them is reasoned from where the
state lives.*

### What option A costs

**Store updates cannot be deferred by React's concurrent features.** React's own documentation says
that "if the store is mutated during a non-blocking Transition update, React will fall back to
performing that update as blocking", and advises against suspending on a store value. So a large
update arriving from sync always renders at once. At the grid sizes measured that costs one or two
milliseconds, and a view that ever needs deferral can hold a derived copy in React state.
*Sourced — [react.dev/reference/react/useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore),
opened by me 2026-09-24.*

**Every change notifies every subscriber.** The store publishes one immutable snapshot, so each view
re-derives from the whole of it, and Vue's and Svelte's fine-grained tracking only works below the
snapshot. At 15 by 15 this measured under 2ms per change in all three; screens added later, such as
an archive or stats, would subscribe to a selected slice. Option C exists to remove this cost.

**Every new piece of state needs a decision about where it lives, and getting it wrong fails
quietly.** State a guarantee covers that is left in the renderer is lost on reload; state that only
the view needs, put in the store, gets saved and synced for nothing. The spike already has an
instance: the store carries `remoteChanged` and `remoteVersion` only so a view can animate, which is
a view concern inside the store. So the record needs a rule for what goes where, and the likeliest
rule is that anything a promise in [../guarantees/](../guarantees/) covers lives in the store.

**It builds what renderers bundle.** Framework devtools show component state, and some show a
timeline of store changes. State held outside is invisible to them, so inspecting it needs its own
hooks, such as logging each action. Each renderer also needs a small adapter to subscribe, which
took one call in React and about ten lines in Vue and Svelte.

**Snapshots must be immutable.** React requires it of `useSyncExternalStore`, and every change
allocates a new board. The board is already immutable by design, and the allocation measured small.

### What option B costs

**The renderer's scheduling reaches the durable path.** The save on every change and the merge of a
remote update run inside the renderer's update cycle, which is where React's dropped input came
from. **Replacing the renderer means rewriting the state, saving, undo and sync.** And the logic
can only be tested through the renderer, where option A tests it as plain functions under Node.
*The first is measured, above; the other two are reasoned.*

**What option B buys:** each renderer's own devtools and idioms, fine-grained updates without a
snapshot, React transitions, and less code of our own. These are the costs of option A seen from the
other side.

### What each keeps open

**Option A keeps the renderer cheap to replace,** at about the size of the view code, and lets the
same store run somewhere else later: under a test runner without a browser, in a worker, or behind a
different shell. **Option B closes that,** and makes the renderer choice close to permanent.
**Option C adds a dependency to the most durable part of the client,** whose stewardship
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
would price, and whose standard, the TC39 signals proposal, is at Stage 1.
*Reasoned. The proposal's stage is from the renderer survey in
[what renders the client?](what-renders-the-client.md), not re-checked here.*
