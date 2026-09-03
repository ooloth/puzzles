---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Which database?

## Why it matters

**It is the decision most likely to be made by reflex.** Reaching for Postgres is what one does, and
this application may need several times less machinery than that.

**Half of it is already settled and the half that is left is not the obvious half.**
[ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md)
establishes that durable player state is kept off the device, and
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) establishes that
whatever is stored can be analysed rather than only retrieved — which rules out every store that puts
bytes under a key and never reads inside them. So the answer is not "nothing" and it is not a blob
store.

**Whether the store is a file the process opens or a service it connects to is decided at M1**, by
[is the store a file or a service?](is-the-store-a-file-or-a-service.md), because
that is what sets the capability the host must have. What is left here is which engine, given that
class — and that cannot be argued without a schema, which is why it sits at M3 rather than M1.

## What would settle it

Writing down the actual access patterns — every read and every write the server performs, with the
key it does it by — and seeing what the smallest thing that serves them is. That needs a schema,
which is [what is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) plus whatever
a player's record turns out to hold.

The field below is worth checking before it is weighed. Every claim in it is unverified.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, working backward from the stack to find which product truths a database choice
actually rests on. The chain runs five deep and had a gap at every level.

Merged 2026-09-01 with "what does the server store, if anything?", whose premise [ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md) answered
and whose remaining content was about this choice.

## Options

*SQLite as a file beside the app.* No database process to run, patch or monitor, and local
development with nothing to install or start. Costs backup tooling that a managed service would have
supplied, and gives no concurrent writers and no second instance.

*Managed Postgres.* Everything, forever, for a monthly fee and a network hop. The right answer if
per-player queryable data turns out to be substantial, and considerable overhead if it does not.

*A networked SQLite — Turso, Cloudflare D1, LiteFS.* SQLite reached over a network, and in Turso's
case with a local replica that reads at local speed. A different shape from both of the above rather
than a different vendor, and the one that pairs with an edge runtime.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

### The embedded field is one candidate

**Embedded means SQLite.** The two alternatives were examined and neither survives, so a choice of
"in the process" is a choice of SQLite by construction rather than by preference. Recorded here so
the field is not re-enumerated: an option written down nowhere is indistinguishable from one nobody
thought of.

**PGlite — Postgres compiled to WebAssembly, run in the process — is out on its connection model.**
Its documentation states that it "only has a single exclusive connection to the database", which is a
harder limit than SQLite's one writer with concurrent readers: every request serialises through one
connection. Its stated use cases are unit and CI testing, local development, web containers, and
on-device AI, with serving an application not among them. What it offered over SQLite was Postgres
dialect portability, and that is a cheaper exit bought with a worse concurrency model and a tool used
off the path its maintainers describe.

*Sourced — [pglite.dev/docs](https://pglite.dev/docs/) and
[pglite.dev/docs/about](https://pglite.dev/docs/about), read 2026-09-02.*

*It would reverse if* its connection model changed, or if query portability to a network Postgres
became the deciding property of this choice rather than one input among several.

**DuckDB is out on its shape**, for the reason recorded further down: it is columnar and built for
analytical scans, and this store takes small writes and point reads.

**A measurement this question needs.** Whether an engine answers
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)'s questions —
which puzzles get finished, where players stall, whether a grade predicts anything —
acceptably at plausible volume is worth running rather than assuming. It sits with this question
rather than with
[is the store a file or a service?](is-the-store-a-file-or-a-service.md) because it
discriminates between *engines* and not between localities: both sides of that line offer SQL engines
that can express the queries. It needs a schema and a synthetic history, which is why M3 is the
earliest it can be run rather than merely where it is filed.

*Reasoned — from what separates an engine choice from a locality choice.*

**The network side spans both engine families and the embedded side does not.** Over a network the
choice is open — SQLite reached remotely as Turso, Cloudflare D1 or LiteFS, or Postgres and its
hosts. In the process it is SQLite or libSQL, which is the same engine under different governance.
So locality does not pick the engine on one side of the line and very nearly does on the other.

*Reasoned — from the field enumerated above.*

**libSQL is a SQLite fork, not an alternative to it.** Same SQL, broadly the same file format,
different governance and extra features. Choosing it is choosing SQLite with a different maintainer.

*Unverified — no source recorded.*

**Neon, Supabase and PlanetScale are hosting rather than databases.** Choosing one is choosing
Postgres or MySQL and then choosing an operator, which is
[where does this run?](where-does-this-run.md) rather than this question.

*Unverified — no source recorded.*

**DuckDB is a real embedded database and the wrong shape for this.** Columnar and built for
analytical scans, so it serves [ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)'s aggregate questions well and a per-player transactional
write path poorly. It would be a second store rather than the store.

*Unverified — no source recorded.*

**MySQL offers nothing here that Postgres does not**, which is what makes it not a real alternative
rather than a rejected one.

*Unverified — no source recorded.*

**Key-value and object stores are ruled out by
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)**, not by
preference. They store bytes under a key and cannot answer a question across rows, and that record
established the option to ask such questions.

**SQLite permits one writing process at a time, and multiple instances cannot share a local file**
without corrupting it. Under SQLite, single-instance deployment stops being a preference and becomes
a correctness requirement — which is what couples this choice to hosting, and what disqualifies the
platforms that give no persistent disk.

*Unverified — no source recorded. Ported from a legacy decision record.*

**In WAL mode a filesystem copy is not a valid backup.** It can capture a partial write and produce a
silently corrupt file, which is worse than no backup because it looks like one. Any backup would have
to use SQLite's online backup API or WAL-aware streaming.

*Unverified — no source recorded. Ported from a legacy decision record.*

Both SQLite facts above are about the world rather than about us, but they apply only if SQLite is
chosen. They move to [../constraints.md](../constraints.md) with the record that adopts it, and are
deleted with the record that does not — and either way they need verifying first.

**Anything stored server-side brings a recovery point with it.** How much recent work disappears when
that storage is gone is decided by the backup mechanism rather than discovered during the incident:
continuous replication and a nightly copy differ by exactly that amount. See
[is the store's backup restorable?](is-the-stores-backup-restorable.md).

**The runtime candidates differ in how well they embed SQLite.**
[What runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md) is a reason
to note what each runtime costs for this decision — not a reason to settle this question early so a
runtime can be justified by it.

**The legacy record this inherits from compared two relational databases and nothing else**, and
dismissed SQLite's single-writer limit as "not a real constraint for infrequent, small per-user
progress writes at this audience size". That is reasoning from expected scale rather than
measurement, and the write pattern depends on a sync model that is undecided.

**The client's data representation does not constrain this.** Snapshot or event log, the store holds
whichever one it is handed.

**[What the server does with puzzle state](what-does-the-server-do-with-puzzle-state.md) would make
this decision smaller.** Under its leading option the server checks that a payload is a well-formed
board and never interprets its contents, which every option above does equally well.

### Engine-level facts established while resolving the store's failure domains

*Mined 2026-09-02 from the failure-domain enumeration, whose durable output is in
[../failure-modes/](../failure-modes/) and in the Findings of
[is the store a file or a service?](is-the-store-a-file-or-a-service.md). The
question file that held it is resolved and deleted. These are recorded here because they separate
engines rather than localities, which is this question's job.*

**SQLite's corruption detection is opt-in, and its own documentation now says so by example.**
[sqlite.org/wal.html](https://www.sqlite.org/wal.html) carries a section titled "The WAL-Reset Bug" —
a checkpoint/write race present from 3.7.0 (2010-07-21) through 3.51.2 (2026-01-09), fixed in 3.51.3
(2026-03-13). It requires "two or more database connections open on the same file, in separate threads
or processes". Tailscale hit it 19 times over six months with no error raised, finding it only via
`PRAGMA integrity_check` against offsite backups plus custom transaction-replay tooling.

The bug is fixed. What survives is that nothing runs `integrity_check` unless somebody schedules it,
and a corrupt page returns wrong data rather than an error until a read happens to touch it.

*Sourced — [sqlite.org/wal.html](https://www.sqlite.org/wal.html) §11 and
[tailscale.com/blog/sqlite-wal-reset-bug](https://tailscale.com/blog/sqlite-wal-reset-bug), opened and
read by me 2026-09-02.*

**Backing up a live SQLite file is conditionally unsafe, and the condition is easy to summarise
wrongly.** The WAL file "is part of the persistent state of the database and should be kept with the
database if the database is copied or moved. If a database file is separated from its WAL file, then
transactions that were previously committed to the database might be lost, or the database file might
become corrupted." SQLite names `sqlite3_rsync`, `VACUUM INTO` and the C backup API as the sanctioned
alternatives.

This resolves the contradiction noted in [../brainstorming/](../brainstorming/): both "copying the
file is fine" and "copying the file is dangerous" are true, depending on which files travel together
and whether a write is in flight.

*Sourced — [sqlite.org/wal.html](https://www.sqlite.org/wal.html) §4 and
[howtocorrupt.html](https://www.sqlite.org/howtocorrupt.html), read by me 2026-09-02.*

**Postgres connection limits on the cheapest paid tiers, and the failure symptom.** All four reject
new connections outright once the cap is reached — standard `FATAL: too many connections` — rather
than queueing or degrading. Neon ~104 direct with 10,000 pooled via built-in PgBouncer; Supabase 60
direct with 200 via Supavisor; Render 100 with no pooler by default; Railway ~100 with no pooler by
default. Whether a pooler ships is the discriminator, not the raw number.

*Sourced — second-hand from a research agent reading each provider's documentation 2026-09-02. Not
opened by me; re-check before this decides anything.*

**Turso's free tier advertises no sleeping**, which is unusual in the managed field and matters given
the cold-touch finding recorded against
[is the store a file or a service?](is-the-store-a-file-or-a-service.md). Its
embedded-replica feature is proprietary, so relying on it sets the exit cost.

*Sourced — second-hand from a research agent, 2026-09-02.*
