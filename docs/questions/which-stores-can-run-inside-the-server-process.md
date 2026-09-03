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
question cannot be argued fairly while only one side of it is enumerated. The network side has a long
list of real, current options. The in-process side is easy to assume means SQLite, and this file is
where that assumption gets tested rather than inherited.

**The question is what an in-process store offers beyond simplicity.** SQLite works. What matters is
whether anything in-process also keeps a *portable exit* — because if not, the in-process branch is a
one-way door and leaving it costs a migration. PGlite is the only candidate that would have offered
one, and the Options section records why it does not.

**It is a different question from [which database, if any?](which-database.md)**, which picks an
engine at M3 given an access pattern and a schema. This asks what is *possible* in-process at all,
which is an input to a decision being taken now and needs neither.

## What would settle it

The field is settled by argument rather than by measurement, and the Options section carries it: each
candidate is disqualified by a documented property, not by a number nobody has. Nothing needs
running.

**What would reopen it** is a candidate nobody has considered, or a change to the concurrency model
of one already dropped. Each rejection names its own reversal condition.

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

**PGlite — dropped.** In-process Postgres compiled to WebAssembly. Three things against it, of which
the first disqualifies it alone: it holds **a single exclusive connection** to the database, a harder
limit than SQLite's
one-writer-many-readers and would serialise every request through one connection. Its stated use
cases are testing, local development, web containers and on-device AI — serving an application is not
among them. And the only thing it buys over SQLite is Postgres dialect portability, which is a
cheaper exit bought with a worse concurrency model and a tool used off its own path.

*It would reverse if* PGlite's connection model changed, or if query portability to a network
Postgres became the deciding property of the store choice rather than one input among several.

**DuckDB — dropped.** An OLAP engine: columnar, built for analytical scans, and a poor fit as a
system of record taking many small writes and point reads, which is what
[ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md)
establishes this store is for. Matching
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)'s word
"analysed" to an analytics engine is the trap: that record asks for an operational store that can
*answer* questions later, not for a warehouse.

*It would reverse if* the analytical workload grew enough to want a store of its own, at which point
it is an addition beside the system of record rather than a replacement for it.

*Nothing.* A live outcome while the field was open, and not the one that happened.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**No candidate has been run here.** Every claim rests on vendor documentation, which is enough to
disqualify on a stated architectural property and not enough to confirm one would work well. If
SQLite ever needs defending on more than reputation, that is the gap.

### What PGlite actually is

**It runs server-side, so treating it as a browser-only tool is too narrow.** Its documentation says
"PGlite can be used in both Node/Bun/Deno or the browser", and under those runtimes it persists to
the native filesystem rather than to IndexedDB.

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

**Its one selling point here is unverified.** That its queries survive a move to a network Postgres
unchanged is recorded in [which database, if any?](which-database.md) without a source. Being
genuinely Postgres in WebAssembly makes it plausible; plausible is not established, and it does not
matter unless the connection model changes.

*Reasoned — from the sourced facts above.*
