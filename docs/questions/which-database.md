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
[what execution shape does the server have?](what-execution-shape-does-the-server-have.md), because
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

Merged 2026-09-01 with "what does the server store, if anything?", whose premise ADR-0009 answered
and whose remaining content was about this choice.

## Options

*SQLite as a file beside the app.* No database process to run, patch or monitor, and local
development with nothing to install or start. Costs backup tooling that a managed service would have
supplied, and gives no concurrent writers and no second instance.

*PGlite — Postgres compiled to WebAssembly, embedded.* Same SQL as a Postgres server, running
in-process against a local directory. The one embedded option whose queries survive a later move to a
network store unchanged.

*Managed Postgres.* Everything, forever, for a monthly fee and a network hop. The right answer if
per-player queryable data turns out to be substantial, and considerable overhead if it does not.

*A networked SQLite — Turso, Cloudflare D1, LiteFS.* SQLite reached over a network, and in Turso's
case with a local replica that reads at local speed. A different shape from both of the above rather
than a different vendor, and the one that pairs with an edge runtime.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Two families span both sides of the embedded/network line, so the class does not pick the engine.**

| | Embedded | Network |
| --- | --- | --- |
| SQLite family | SQLite, libSQL | Turso, Cloudflare D1, LiteFS |
| Postgres family | PGlite | Postgres, and its hosts |

The useful consequence is that "embedded" is a strong default toward SQLite rather than a tautology,
and PGlite is the reason. Anyone reasoning that choosing embedded *is* choosing SQLite is skipping a
step.

*Unverified — no source recorded. Reasoned from training knowledge on 2026-09-01, and the maturity of
PGlite in particular is exactly the kind of fact that moves fastest.*

**libSQL is a SQLite fork, not an alternative to it.** Same SQL, broadly the same file format,
different governance and extra features. Choosing it is choosing SQLite with a different maintainer.

*Unverified — no source recorded.*

**Neon, Supabase and PlanetScale are hosting rather than databases.** Choosing one is choosing
Postgres or MySQL and then choosing an operator, which is
[where does this run?](where-does-this-run.md) rather than this question.

*Unverified — no source recorded.*

**DuckDB is a real embedded database and the wrong shape for this.** Columnar and built for
analytical scans, so it serves ADR-0011's aggregate questions well and a per-player transactional
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
