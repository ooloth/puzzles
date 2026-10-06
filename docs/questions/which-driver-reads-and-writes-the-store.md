---
opened: 2026-09-04
status: open
resolves_into: decision
---

# Which driver reads and writes the store?

## Why it matters

[ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) chose the engine,
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) chose the shape, and
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) chose Node as the runtime.
None of them says what opens the file.

**`node:sqlite` has been treated as the answer without being chosen.** It is built into Node, so
it is the convenient assumption, and it is a release candidate rather than stable. The first row
is written at M3, so the choice is needed by then and should be made on the driver's merits.

## What would settle it

The driver itself is not needed until M3, when the first row exists.

What to weigh, in the order it matters here: whether the API supports what
[what durability settings does the store run with?](what-durability-settings-does-the-store-run-with.md)
needs (journal mode, synchronous level, busy timeout), whether it supports the long reads
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) preserves,
whether it is a native addon that has to be rebuilt per Node version, and only then throughput.
[../constraints.md](../constraints.md) puts plausible load under a hundred writes per second against
driver throughput in the tens of thousands, so performance is unlikely to decide this and should not
be allowed to.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-04, on noticing that every argument in the repo about the store and the runtime passes
through `node:sqlite` and no record chooses it. The question had no file, so the assumption was
invisible.

## Options

*`node:sqlite`.* Built into Node. No dependency and no addon to rebuild.
Stability index is "1.2 - Release candidate" rather than stable.

*`better-sqlite3`.* The long-standing Node choice, synchronous by design. A native addon, so it needs
rebuilding for each Node version.

*A WASM build.* Runs in the browser too, which is interesting only if the client's store
ever wants the same engine — see [which client storage mechanism holds a player's
work?](which-client-storage-mechanism.md). Slower, and the durability story through a virtual
filesystem is its own question.

*A query builder or ORM over any of the above.* A separate axis rather than a further driver, and one
nobody has raised. It bears on
[how is the schema migrated?](how-is-the-schema-migrated.md) and on the analysis reads
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) preserves.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Absolute throughput is very unlikely to decide this.** Single keyed inserts run in the tens of
thousands per second across every candidate measured so far, against a plausible load under a hundred.
The numbers and their methods are recorded in
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md).

*Reasoned — 2026-09-04, from that question's driver figures and
[../constraints.md](../constraints.md) on how often a player acts.*

**Node's `node:sqlite` is a release candidate rather than stable**, documented at stability index
"1.2 - Release candidate" and available without a flag since v23.4.0 and v22.13.0.

*Sourced — [nodejs.org/api/sqlite.html](https://nodejs.org/api/sqlite.html), re-checked 2026-09-04.*

**Still a release candidate on the version this project runs, re-checked 2026-09-19.** The marker
reads "Stability: 1.2 - Release candidate" on both the v24 and v26 documentation trees, so
[ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md) did not change it.
v26 adds four `StatementSync` methods that v24 lacks — `close()`, `resetStats()`, `stat()` and
`[Symbol.dispose]()` — none of which anything here currently needs.

*Sourced — the stability marker grepped from <https://nodejs.org/docs/latest-v24.x/api/sqlite.html>
and <https://nodejs.org/docs/latest-v26.x/api/sqlite.html> by me on 2026-09-19. The API-difference
list is second-hand from a research agent diffing the two pages.*

**Opening a database, preparing statements and reading rows back works unflagged on Node 26.** A
single `.ts` file importing `node:sqlite`, run directly with no transpiler, created a table, ran
prepared statements and returned rows. This says the module is reachable, not that it is the right
driver — it eliminates nobody.

*Measured — by me on 2026-09-19, Apple M2, macOS 26.6.2, Node v26.9.0.*

**The Node drivers differ on features, not only on speed.** Checked 2026-09-19.

- **`node:sqlite`** is synchronous except for `backup()`, offers prepared statements, user-defined SQL
  functions through `database.function()`, `loadExtension()` with an `allowExtension` option, a
  constructor `timeout` option documented as the busy timeout, and `createSession()` for changesets.
  It has no `.transaction()` helper; transactions are driven through `exec()` with
  `database.isTransaction` reporting state.
- **`better-sqlite3`** is at 13.0.3, published 2026-08-05, and is actively maintained. It has both the
  `.transaction()` helper and `.function()`.

**Nothing here disqualifies a driver for this system today.** Nothing in
[../problem.md](../problem.md) or any record needs a user-defined SQL function, and the analysis
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) preserves is
plain SQL.

*Sourced — Node's `node:sqlite` documentation and the `better-sqlite3` npm metadata, read
2026-09-19 by a research agent, which I did not open.*

### Every moment this system touches storage, and what is unexamined about each

Enumerated 2026-09-19. Most of these are cheap to investigate and none should delay a decision.

- **The request path reads a puzzle row.** Synchronous under `node:sqlite`, so it
  blocks the event loop for its duration. **Unexamined:** what that duration is for a row of
  realistic size.
- **The request path writes player state.** Same synchronicity. How durably it lands is
  [what durability settings does the store run with?](what-durability-settings-does-the-store-run-with.md)
  at M12. **Unexamined:** write latency, and how much the durability setting changes it.
  [../constraints.md](../constraints.md) puts plausible load under a hundred writes per second
  against driver throughput in the tens of thousands, so this is very unlikely to bind, and that is a
  reason to check it cheaply rather than to skip it.
- **A backup is copied off the machine.** Three mechanisms exist and nobody has compared them: the
  driver's own `backup()`, a `VACUUM INTO`, and a filesystem copy of a WAL-mode database.
  **Unexamined:** how long each takes at a realistic database size, and whether the server can keep
  answering throughout. [How is the store backed up?](how-is-the-store-backed-up.md) at M12 owns the
  choice; what is unexamined here is the cost of each option.
- **That backup is streamed to object storage.** **Unexamined:** memory during a multi-megabyte
  streamed upload from Node.
- **WAL checkpointing.** Blocked by a long read, which is
  [how do analysis and play share one store?](how-do-analysis-and-play-share-one-store.md), which waits
  for players.
  **Unexamined:** nothing additional; that question owns it.
- **A migration rewrites a table.** [How is the schema migrated?](how-is-the-schema-migrated.md) at
  M12 owns the mechanism. **Unexamined:** whether a migration holds a write lock long enough for the
  server to need taking out of service, which decides whether a migration is a deploy step or an
  outage.

Read and write latency were measured for
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) across runtimes. Everything
else here is a property of the driver, the settings or the mechanism.
