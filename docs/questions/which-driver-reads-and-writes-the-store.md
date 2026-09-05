---
opened: 2026-09-04
status: open
resolves_into: decision
---

# Which driver reads and writes the store?

## Why it matters

[ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) chose the engine and
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) chose the shape. Neither
says what opens the file, and the gap has been filled by assumption.

**`node:sqlite` has been treated as the answer without being chosen.** The argument that the store
does not narrow the runtime, in
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md), runs
entirely through it: all three runtimes ship it, so the same data-access code runs everywhere, so
no runtime is advantaged. That holds only if `node:sqlite` is what we want. It is the option common
to all three candidates, which is what makes it convenient to an argument for their equivalence, and
that is a reason to check it rather than to lean on it.

**If the best driver differs by runtime, the runtimes are not equivalent on the store.** That would
put driver quality back inside the M1 runtime decision, which currently excludes it.

## What would settle it

The driver itself is not needed until M3, when the first row exists. What M1 needs from this question
is narrower and available now: whether any driver is good enough to make its runtime worth choosing
*for that reason*. If none is, the M1 runtime decision can say so and move on. If one is, it is an
input.

What to weigh, in the order it matters here: whether the API supports what
[what durability settings does the store run with?](what-durability-settings-does-the-store-run-with.md)
needs (journal mode, synchronous level, busy timeout), whether it supports the long reads
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) preserves,
whether it is a native addon that has to be rebuilt per runtime version, and only then throughput.
[../constraints.md](../constraints.md) puts plausible load under a hundred writes per second against
driver throughput in the tens of thousands, so performance is unlikely to decide this and should not
be allowed to.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-04, on noticing that every argument in the repo about the store and the runtime passes
through `node:sqlite` and no record chooses it. The question had no file, so the assumption was
invisible.

## Options

*`node:sqlite`.* Built into all three runtimes. No dependency, no addon to rebuild, and the same code
everywhere. Stability index is "1.2 - Release candidate" rather than stable.

*The runtime's own native driver.* `bun:sqlite` under Bun, `@db/sqlite` under Deno. Likely the fastest
path on its own runtime, at the cost of pinning data access to that runtime.

*`better-sqlite3`.* The long-standing Node choice, synchronous by design. A native addon, so it needs
rebuilding against each runtime's ABI, and it does not load under Bun without that.

*A WASM build.* Runs anywhere including the browser, which is interesting only if the client's store
ever wants the same engine — see [which client storage mechanism holds a player's
work?](which-client-storage-mechanism.md). Slower, and the durability story through a virtual
filesystem is its own question.

*A query builder or ORM over any of the above.* A separate axis rather than a fifth driver, and one
nobody has raised. It bears on
[how is the schema migrated?](how-is-the-schema-migrated.md) and on the analysis reads
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) preserves.

*Not yet.* Defer to M3 and record at M1 only that the runtime was not chosen for its driver. This is
the option that keeps the most open, and it is only available if the M1 runtime decision genuinely
does not turn on driver quality.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Nothing in this file has been researched.** The options above are the field as it appears from
adjacent work, not a survey. Treat the list as incomplete until it has been rebuilt from registries
rather than from recall.

**Absolute throughput is very unlikely to decide this.** Single keyed inserts run in the tens of
thousands per second across every candidate measured so far, against a plausible load under a hundred.
The numbers and their methods are recorded in
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md).

*Reasoned — 2026-09-04, from that question's driver figures and
[../constraints.md](../constraints.md) on how often a player acts.*

**Node's `node:sqlite` is a release candidate rather than stable**, documented at stability index
"1.2 - Release candidate" and available without a flag since v23.4.0 and v22.13.0.

*Sourced — [nodejs.org/api/sqlite.html](https://nodejs.org/api/sqlite.html), re-checked 2026-09-04.*
