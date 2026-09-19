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

**The drivers differ on features, not only on speed, and the differences run the opposite way to the
usual framing.** Checked 2026-09-19 as part of the M1 runtime work, because the assumption that
`node:sqlite` is the driver everywhere was challenged rather than confirmed.

- **`node:sqlite`** is synchronous except for `backup()`, offers prepared statements, user-defined SQL
  functions through `database.function()`, `loadExtension()` with an `allowExtension` option, a
  constructor `timeout` option documented as the busy timeout, and `createSession()` for changesets.
  It has no `.transaction()` helper; transactions are driven through `exec()` with
  `database.isTransaction` reporting state.
- **`bun:sqlite`** has a `.transaction()` helper with nested support, `.serialize()`/`.deserialize()`,
  and `loadExtension()`. Its current API reference lists no `.function()`, so **no user-defined SQL
  functions**, and documents no dedicated busy-timeout option. On macOS it uses the system
  `libsqlite3.dylib`.
- **`better-sqlite3`** is at 13.0.3, published 2026-08-05, and is actively maintained. It has both the
  `.transaction()` helper and `.function()`.
- **`@db/sqlite`** on JSR is at 0.13.0, published 2025-11-18, with nothing shipped in ten months. It
  wraps a native SQLite build over FFI and downloads a prebuilt shared library.

**Nothing here disqualifies a driver for this system today.** Nothing in
[../problem.md](../problem.md) or any record needs a user-defined SQL function, and the analysis
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) preserves is
plain SQL. The gap is recorded so that it is not discovered later as a surprise, and because it is the
first thing found that makes the runtimes non-interchangeable on storage.

*Sourced — Bun's Node-compatibility page and `bun:sqlite` API reference opened by me on 2026-09-19;
Node's `node:sqlite` documentation, the `better-sqlite3` npm metadata and the `@db/sqlite` JSR
metadata read the same day by a research agent, which I did not open.*

**Using `node:sqlite` under Bun does not fully avoid `bun:sqlite`.** Bun's compatibility entry states
that `loadExtension()` "requires a full SQLite build, and so do `createSession()`/`applyChangeset()`
on older macOS releases", and that reaching a full build means calling
`require("bun:sqlite").Database.setCustomSQLite(path)` before opening a database. So under Bun the
data-access path acquires a runtime-specific line the moment extensions or changesets are needed.
That is the concrete form of the coupling this question was opened to check. **Reverses if** Bun ships
a full SQLite build by default on every platform.

*Sourced — [bun.com/docs/runtime/nodejs-apis](https://bun.com/docs/runtime/nodejs-apis), opened and
quoted by me on 2026-09-19.*

**One of Bun's own pages contradicts the other, and the wrong one is the more findable.**
`bun.com/reference/node/sqlite` reads "Not implemented. Consider using `bun:sqlite`", while the
Node-compatibility page marks the module fully implemented for v1.4.2 and oven-sh/bun#20412 closed as
completed on 2026-07-17. Anyone checking Bun's `node:sqlite` support should read the compatibility
page, not the reference page.

*Sourced — both pages opened by me on 2026-09-19, and the issue state read with `gh issue view`.*

**The only benchmark with a disclosed method is the vendor's own and does not measure the comparison
that matters.** Bun's docs claim `bun:sqlite` is "roughly 3-6x faster than better-sqlite3 and 8-9x
faster than deno.land/x/sqlite for read queries", benchmarked on the Northwind Traders dataset on an
M1 MacBook Pro running macOS 12.3.1, which dates it to 2022. It does not compare against
`node:sqlite`, and `deno.land/x/sqlite` is not Deno's current option. A figure of "10,000 rows in 12ms
for Bun against 45ms for Deno and 88ms for Node" circulates in secondary commentary with no hardware,
dataset or iteration count anywhere, and is unsourced wherever it turns up. No independent,
method-disclosed benchmark comparing the three current drivers was found.

*Sourced — Bun's SQLite documentation, read 2026-09-19 by a research agent; I did not open it. The
absence of an independent benchmark is that agent's search result rather than a proof of absence.*

### Every moment this system touches storage, and what is unexamined about each

Enumerated 2026-09-19, because asking about "storage" in the abstract returned nothing and asking
where the system actually touches it returned a list. Most of these are cheap to investigate and none
should delay a decision; they are here so the investigation is a choice rather than an omission.

- **The request path reads a puzzle row.** Synchronous under `node:sqlite` on every runtime, so it
  blocks the event loop for its duration. **Unexamined:** whether that duration differs by runtime,
  and what it is for a row of realistic size.
- **The request path writes player state.** Same synchronicity. How durably it lands is
  [what durability settings does the store run with?](what-durability-settings-does-the-store-run-with.md)
  at M3. **Unexamined:** write latency per runtime, and how much the durability setting changes it.
  [../constraints.md](../constraints.md) puts plausible load under a hundred writes per second
  against driver throughput in the tens of thousands, so this is very unlikely to bind, and that is a
  reason to check it cheaply rather than to skip it.
- **A backup is copied off the machine.** Three mechanisms exist and nobody has compared them: the
  driver's own `backup()`, a `VACUUM INTO`, and a filesystem copy of a WAL-mode database. Under Bun
  `backup()` blocks the event loop where Node runs it on a worker thread, which is recorded above.
  **Unexamined:** how long each takes at a realistic database size, and whether the server can keep
  answering throughout. [How is the store backed up?](how-is-the-store-backed-up.md) at M3 owns the
  choice; what is unexamined here is the cost of each option.
- **That backup is streamed to object storage.** All three runtimes can upload to an S3-compatible
  endpoint, which is established. **Unexamined:** memory during a multi-megabyte streamed upload. One
  open Bun issue reports an out-of-memory failure on streamed chunks above 500KB, which is a hint
  rather than a finding and has not been reproduced here.
- **WAL checkpointing.** Blocked by a long read, which is
  [how do analysis and play share one store?](how-do-analysis-and-play-share-one-store.md) at M11.
  **Unexamined:** nothing additional; that question owns it.
- **A migration rewrites a table.** [How is the schema migrated?](how-is-the-schema-migrated.md) at
  M3 owns the mechanism. **Unexamined:** whether a migration holds a write lock long enough for the
  server to need taking out of service, which decides whether a migration is a deploy step or an
  outage.

**Two of these bear on the runtime choice and the rest do not.** Read and write latency are the ones
a runtime could plausibly change, and they are recorded as binding in
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md). Everything
else here is a property of the driver, the settings or the mechanism rather than of what executes
them.
