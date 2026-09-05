---
number: 0020
status: accepted
date: 2026-09-03
amended: 2026-09-04
---

# 0020 — The store's engine is SQLite

## Forced by

**[ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md) makes the store a file the process
opens.** That eliminates every engine that is a server, which is most of them.

**[ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) requires the store to answer
questions later** — across players, without a migration — which eliminates everything without a query
language.

**[ADR-0007](0007-that-language-is-typescript.md) and
[ADR-0006](0006-one-language-across-every-deployable.md) mean the engine has to be reachable from
TypeScript** without adding a second toolchain.

## Decision

**The store is a SQLite database.**

**This follows necessarily from [ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md) and
is recorded anyway**, because a constraint that lives only inside another record's reasoning is
invisible to anyone reading the listing, and because the alternatives below are real enough that
somebody will otherwise re-open them.

**It is reachable from every candidate runtime without a native addon.** Node, Bun and Deno all ship
`node:sqlite` without an npm specifier or an addon to compile — Deno since v2.2, and there it
additionally needs `--allow-read` and `--allow-write` for a file-backed database. So this settles
nothing about
[what runs TypeScript outside the browser?](../questions/what-runs-typescript-outside-the-browser.md),
which stays open with its field intact.

**That reasoning holds for `node:sqlite` and no record has chosen it.** `node:sqlite` is the driver
common to all three candidates, which is what makes it convenient to an argument that they are
equivalent — so the argument rests on the thing it concludes. If the best driver differs by runtime,
the runtimes are not equivalent on the store. Which driver opens the file is
[its own question](../questions/which-driver-reads-and-writes-the-store.md), and this record does not
answer it.

**It does not settle how the database is configured.** Journal mode, synchronous level and busy
timeout determine whether a write survives a power cut, and they are durability decisions rather than
configuration details.

## Rejected

- **An embedded key-value store** — LMDB, RocksDB, or a plain file format. Genuinely simpler, faster
  for point lookups, and enough for storing and retrieving a board by key, which is most of what this
  store does. Rejected on the single reason that it has no query language, so
  [ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md)'s requirement could only be
  met by writing the analysis by hand over a scan. **Reverses if** that record is withdrawn.

- **DuckDB.** Embedded like SQLite, with a real query language, and substantially better at exactly
  the analytical scans [ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md)
  preserves — it is columnar and vectorised where SQLite is neither. A serious candidate that a
  competent person could choose. Rejected on the single reason that it is built for analytical
  workloads rather than transactional ones, and this store's dominant traffic is small point writes
  from many sessions, which is the pattern it is least suited to. **Reverses if** the analytical work
  becomes the dominant use of the store rather than an occasional offline one — at which point the
  better answer is probably both, with DuckDB reading a copy.

- **pglite** — PostgreSQL compiled to WebAssembly and run in-process. It satisfies the shape of
  [ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md) while keeping Postgres semantics
  and the exit path that comes with them. Rejected on the single reason that it is single-connection
  and young, and this store holds the last copy of a player's work. **Reverses if** it matures to the
  point where its durability story is comparable to SQLite's, which is a matter of years rather than
  releases.

- **Reversing [ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md) to reach a different
  engine.** The only route to Postgres or MySQL from here, since both are servers. That is a decision
  about locality rather than about engines, it is argued in full in that record, and reversing it is
  what the **Revisit when** conditions there describe.

## Risk

**Corruption detection is opt-in, and the precedent is not reassuring.** SQLite's own documentation
carries a section titled "The WAL-Reset Bug": a checkpoint race present from 2010 until March 2026
that lost committed writes with no error raised. It is fixed. What it establishes is the shape —
`PRAGMA integrity_check` runs when somebody schedules it, and a corrupt page otherwise surfaces only
when a read happens to touch it. Postgres has page checksums on by default from version 18; this does
not.

**The replication tooling is smaller than the engine.** SQLite is about as battle-tested as software
gets, and Litestream is one project with a much shorter history. That asymmetry is the substance of
[how is the store backed up?](../questions/how-is-the-store-backed-up.md) and it is the risk this
record inherits rather than creates.

**Dynamic typing is a real difference from the alternative that was not chosen.** SQLite's type
affinity accepts values a stricter engine would reject, so constraints that Postgres would enforce in
the schema have to be enforced by the application or by explicit `CHECK` clauses. `STRICT` tables
exist and narrow this. It is a standing cost at every write site rather than a one-time one.

## Revisit when

- **[ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md) is reversed.** This record has no
  independent life; reversing the locality decision reopens the engine field entirely.
- **[ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) is withdrawn**, which
  would return the key-value option and make this a much smaller decision.
- **Analytical work becomes the store's dominant use**, at which point the honest answer is a second
  engine reading a copy rather than a different single engine.

## Also update

- [x] `questions/README.md` — the engine question is answered by this record; its eliminations are
      mined into the Rejected section above and it is deleted
- [x] Nothing in `constraints.md` — the SQLite facts that bear on this are recorded against
      [how is the store backed up?](../questions/how-is-the-store-backed-up.md), where the design that
      depends on them lives
- [x] Nothing in `guarantees/` — this promises a player nothing
- [x] `questions/what-runs-typescript-outside-the-browser.md` — unaffected, and that is worth stating:
      under `node:sqlite` this record narrows no runtime. Whether that driver is the one we want is
      [which driver reads and writes the store?](../questions/which-driver-reads-and-writes-the-store.md)

Deliberately not decided here: the journal mode, the synchronous level, the schema, how migrations
run, and how the database is backed up.
