---
opened: 2026-09-02
status: open
resolves_into: constraint
---

# Which stores can run inside the server process?

## Why it matters

**One half of the store decision is a field nobody has established.** Whether the store sits in the
process or across a network is the hub of
[what execution shape does the server have?](what-execution-shape-does-the-server-have.md), and that
question cannot be argued fairly while only one side of it has been enumerated. The network side has
a long list of real, current options. The in-process side has been treated as though it means SQLite,
which is an assumption inherited from an architecture this project no longer has.

**The specific gap is what an in-process store can offer beyond simplicity.** SQLite works and
nobody doubts it; what is unknown is whether anything in-process also keeps a *portable exit*.
PGlite — Postgres compiled to WebAssembly and run in the process — is recorded in
[which database, if any?](which-database.md) as "the one embedded option whose queries survive a
later move to a network store unchanged". If that is true and it is usable, the in-process branch
stops being a one-way door and the whole trade changes shape. If it is not, the in-process branch
means SQLite and a migration, which is what has been assumed without checking.

**It is a different question from [which database, if any?](which-database.md)**, which picks an
engine at M3 given an access pattern and a schema. This asks what is *possible* in-process at all,
which is an input to a decision being taken now and needs neither.

## What would settle it

Running each candidate, briefly, rather than reading about it. For each: does it start, does it hold
a schema, does it answer a query, what does it cost in memory and start-up time, and does anything
about the runtime it needs conflict with
[ADR-0007](../decisions/0007-that-language-is-typescript.md).

Three things worth checking rather than assuming, because each would change the answer on its own:
whether PGlite's WebAssembly runtime is available under every candidate TypeScript runtime, whether
its resource cost is plausible for a small deployment, and whether the claim that its queries port
unchanged to a network Postgres survives contact with anything real.

**Budget hours.** This is a viability check, not a comparison — the question is which candidates are
alive, not which is best.

## Resolves into

Entries in [../constraints.md](../constraints.md) for what each candidate requires and costs, and
material the store record reasons from. The harness is deleted afterwards; the observation is the
artifact.

## Source

Raised 2026-09-02. The spike that blocks
[what execution shape does the server have?](what-execution-shape-does-the-server-have.md) was scoped
in that file's prose and had no question of its own, so a directory listing did not show it and
nothing tracked whether it had been done.

## Options

**The field is closed and the answer is SQLite.** Both alternatives were examined and dropped, and
both rejections are recorded below rather than deleted — an option that is simply absent looks
identical to one that was considered, and this file exists so that nobody re-opens either.

*SQLite*, via `node:sqlite` or `bun:sqlite`. Viability was never in doubt. What it costs to leave is
the open part, and that belongs to the locality decision rather than here.

**PGlite — dropped 2026-09-02.** In-process Postgres compiled to WebAssembly, and the candidate this
file was largely opened for. Three things against it, of which the first would disqualify it alone:
it holds **a single exclusive connection** to the database, which is a harder limit than SQLite's
one-writer-many-readers and would serialise every request through one connection. Its stated use
cases are testing, local development, web containers and on-device AI — serving an application is not
among them. And the only thing it buys over SQLite is Postgres dialect portability, which is a
cheaper exit bought with a worse concurrency model and a tool used off its own path.

*It would reverse if* PGlite's connection model changed, or if query portability to a network
Postgres became the deciding property of the store choice rather than one input among several.

**DuckDB — dropped 2026-09-02.** An OLAP engine: columnar, built for analytical scans, and a poor fit
as a system of record taking many small writes and point reads, which is what
[ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md)
establishes this store is for. It was listed by pattern-matching
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)'s word
"analysed" to an analytics engine, when that record asks for an operational store that can *answer*
questions later rather than for a warehouse.

*It would reverse if* the analytical workload grew enough to want a store of its own, at which point
it is an addition beside the system of record rather than a replacement for it.

*Nothing.* Recorded because it was a live outcome while the field was still open, and it did not
happen: SQLite survives.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Nothing has been run.** No candidate has been started here, and every claim above about what they
can do comes from documentation or from another question file rather than from observation.

*Unverified — the question has been posed and not answered.*

### PGlite is weaker than it was described as, and the reasons are checkable

**It does run server-side, so the common assumption that it is a browser tool is too narrow.** Its
documentation says "PGlite can be used in both Node/Bun/Deno or the browser", and under those
runtimes it persists to the native filesystem rather than to IndexedDB.

*Sourced — [pglite.dev/docs](https://pglite.dev/docs/), read 2026-09-02.*

**It has a single exclusive connection, which is a harder constraint than SQLite's.** The
documentation states plainly that "PGlite only has a single exclusive connection to the database",
which is why it ships a worker to share one instance between browser tabs. SQLite's limit is one
*writer* with concurrent readers; this is one connection full stop.

> So a server would serialise every request through one connection. At this project's traffic that
> may well be survivable, but it is a real architectural property and it makes this candidate
> strictly more constrained than SQLite on the axis where embedded stores are usually questioned.

*Sourced — [pglite.dev/docs](https://pglite.dev/docs/), read 2026-09-02.*

**Its stated use cases do not include serving an application.** The four given are unit and CI
testing, local development, remote development or local web containers, and on-device or edge AI and
RAG. Absence from a use-case list is weaker evidence than a warning would be, and it is not nothing:
it means using it this way is off the path the maintainers describe and test for.

*Sourced — [pglite.dev/docs/about](https://pglite.dev/docs/about), read 2026-09-02.*

**So the question this candidate actually poses is narrower than "does it work".** It is whether a
single exclusive connection can serve this app, and whether query portability to a network Postgres
is worth accepting that plus a tool used outside its stated purpose — when SQLite is in-process, less
constrained on concurrency, and battle-tested for exactly this shape.

**The premise that makes it worth asking at all remains unverified.** That its queries survive a move
to a network Postgres unchanged is recorded in [which database, if any?](which-database.md) without a
source. It is more plausible now that the thing is confirmed to be Postgres in WebAssembly rather
than a reimplementation, but plausible is not established.

*Reasoned — from the sourced facts above.*
