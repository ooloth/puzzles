---
opened: 2026-09-01
status: open
resolves_into: decision
---

# Is the store a file the process opens, or a service it connects to?

## Why it matters

**It is the one irreversible thing the first milestone can create.** Everything else installed at M1
costs a re-scaffold to undo. Moving player data between a file and a service, once players have work
in it, is a migration — and the data being moved is the thing
[ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md) exists to
keep.

**It does not constrain the runtime.** Node, Bun and Deno all ship `node:sqlite` as a built-in, and
all three run the portable JavaScript Postgres clients. So the same data-access code runs on every
runtime under either answer here, and nothing about this question narrows the field in
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md) — a claim
this file previously made and which was false.

*Sourced — [Deno's Node API compatibility reference](https://docs.deno.com/runtime/reference/node_apis/)
lists `node:sqlite` as fully supported since v2.2, read 2026-09-03.*

**It decides where the generator writes**, though not where it runs. Under a service the generator
writes to the store from anywhere. Under a file it either shares the machine or publishes through the
server's API — see [are puzzles and player records in one store?](are-puzzles-and-player-records-in-one-store.md).

## What would settle it

**Not a spike.** Every candidate measurement was checked against what its result would change, and
none of them changes this. [../constraints.md](../constraints.md) warns about that shape of error
directly: "a real number about an irrelevant quantity ends arguments it should not." What can run
in-process is settled as SQLite by [which database?](which-database.md); round-trip latency moves
nothing here per [how long does a store round trip take?](how-long-does-a-store-round-trip-take.md);
fault injection waits for a system to break; and developer ergonomics is a comfort property being
excluded on purpose.

**What remains is a judgement between two kinds of simplicity**, and the Findings below establish that
neither dominates. It should be decided on which option keeps the most technical properties reachable
— safety, portability, and the ones not yet known to matter.

**One input is deliberately excluded and one is missing.** The maintainer's appetite for operating
infrastructure is excluded until the technical case has been made without it, because it is a
short-term guess about a long-lived choice. What is missing is whether that appetite is itself a goal:
[../problem.md](../problem.md) names "a demonstrable internet-facing full-stack system" as one of
three maintainer purposes, and guards it with "would this component still be worth building if its
demonstration value were zero". Those pull in opposite directions here and nothing resolves them.

## Resolves into

A decision record in [../decisions/](../decisions/), and a change to
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md)'s field if it
lands on a file.

## Source

Raised 2026-09-01 as one of three claims bundled into a question about the server's execution shape.
The other two are settled:
[ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md) records that nothing on
the request path scales to zero, and
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md) records that the
server does not run in a constrained isolate. This is the third and it was always the hard one.

## Options

**Two cells remain**, both with an always-on process in an ordinary runtime, which is what the two
records above leave standing.

*A file the process opens.* SQLite on a volume attached to the machine. No network hop, no
credential, no connection pool, and no second thing that can be unreachable. The machine and its disk
are yours to operate, and that is the cost.

*A service the process connects to.* A managed store reached over a network, on a plan that does not
sleep. Operation of the store belongs to somebody else. A network path, a credential and a vendor are
added.

*Not yet — defer to M3.* The third option, and the one that costs least today. M1 is a hello world
with no store in it; M3 writes the first row. **Deferring now costs nothing**, which was not true when
this question was framed: it was thought to narrow the runtime field, and it does not, so there is no
longer a price for waiting. What deferring buys is everything learned between now and M3 — including
whatever [are puzzles and player records in one store?](are-puzzles-and-player-records-in-one-store.md)
and [what is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) settle, both of
which describe what the store will actually hold.

### Engine and locality are separate axes, and the third corner collapses on inspection

**"A file or a service" is not the same question as "SQLite or Postgres".** SQLite is available as a
network service — libSQL, hosted as Turso — so the grid has four corners rather than two:

| | file the process opens | service over a network |
| --- | --- | --- |
| **SQLite** | a file on a volume | libSQL / Turso |
| **Postgres** | pglite, young and single-connection | managed Postgres |

**The top-right corner was examined on 2026-09-03 and is not a third locality.** The pitch that made
it interesting — an embedded replica holding a local copy beside the process while the durable copy
stays managed — does not deliver what it sounds like:

- **Writes do not go local.** Turso's documentation: writes "are sent to the remote primary database
  configured at `syncUrl` by default. They are NOT written to the local file first." So a write pays
  the same network round trip as any other network store, and the local copy buys nothing on the
  write path.
- **Reads are stale by default.** The replica that made a write sees it immediately; every other
  replica sees it "when they call `sync()`, or at the next sync period".
- **It needs a writable local filesystem** — "In certain contexts, such as serverless environments
  without a filesystem, you can't use embedded replicas." So it requires the volume that the file
  option requires, without removing the network from the write path.
- **It carries a corruption footgun stated in the documentation**: "Do not open the local database
  while the embedded replica is syncing. This can lead to data corruption."

*Sourced — [Turso's embedded replicas documentation](https://docs.turso.tech/features/embedded-replicas/introduction),
opened and read by me 2026-09-03.*

**And the product is on its legacy track.** libSQL's own README says: "If you're starting a new
project, you probably want to look into Turso. libSQL is actively maintained, but new features are
being developed in Turso." Turso Database is a from-scratch Rust rewrite whose maintainers state it
has "not yet reached 1.0" and advise keeping independent backups until it does. So adopting this
corner today means adopting the track the vendor points new projects away from, with a successor that
is not ready for the one thing this store must not do.

*Sourced — [libSQL's README](https://github.com/tursodatabase/libsql), opened and read by me
2026-09-03. The pre-1.0 status of the rewrite is second-hand from a research agent reading the Turso
repository.*

**One documented data-loss incident exists**, in December 2023: 0.07% of databases were configured
with an empty backup identifier, and the remedy discarded writes made after 1 December for those
databases. Second-hand and worth re-reading before it decides anything, but it is the exact failure
this store exists to prevent.

> So the third corner is not a third locality. Strip the embedded replica and what remains is a
> service reached over a network that happens to speak SQLite — cell C with a different engine. Which
> engine a service runs is [which database?](which-database.md) at M3, not this question.

**The bottom-left corner is not real either.** pglite is Postgres compiled to WebAssembly, running
in-process and single-connection. Young, and not a candidate for the durable copy of player work.

> So this question has two answers rather than four, and the engine question is genuinely orthogonal
> and genuinely deferred.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

### Nothing a player waits for is sensitive to the difference

**Checked against the network floor rather than assumed.** Every moment in
[../problem.md](../problem.md) under "Where a player waits" involves a fresh or resumed connection
carrying a payload, against a 3g RTT floor near 270ms and three to four round trips before payload.
An in-process read and a warm same-region network read differ by roughly a millisecond — three orders
of magnitude below the noise floor.

*Reasoned — from [../constraints.md](../constraints.md) and the enumeration in
[../problem.md](../problem.md), 2026-09-02.*

**The performance argument that originally favoured a file has been retired by an architecture
change, not by this analysis.** The earlier design was server-driven hypermedia: every interaction was
a round trip, the store sat on the interaction path, and an in-process read that skipped the network
stack was something a player would feel. That architecture is reversed —
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) gives the client state and
[ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) takes the server
off the interaction path. The speed difference is still real; nothing is waiting on it.

*Reasoned — from the records named, plus context supplied by the maintainer 2026-09-02 about why the
original preference was formed.*

### The store may be on the daily path, which is a point for the file

**The most frequent blocking moment is fetching a puzzle the device has never had**, per
[../problem.md](../problem.md). Whether that touches the store is
[are puzzles and player records in one store?](are-puzzles-and-player-records-in-one-store.md), open
until M3. If it does, store availability becomes a daily concern rather than a background one, and a
file removes one independently-failing thing from that path.

*Reasoned — from the records named, 2026-09-03.*

### Neither direction dominates, and the reason is that they buy different simplicities

**An embedded file is simpler to reason about**: one thing, in-process, always reachable, no
credential, no pool, no partition, one fewer thing that can be down. **A managed service is simpler to
operate**: no volume, no patching, no backup script you wrote, no restore you have to remember to
rehearse. A solo maintainer wants both and cannot have both.

**An enumeration that reaches dominance has filed the strongest opposing item under the wrong
heading.** Holding cost and effort at zero, every technical advantage of the embedded file either
turns on latency that does not bind or on effort that has been set aside — which looks like the
service dominating. But "no network partition between the process and its store" is not effort. The
failure domain still exists, still has to be reasoned about and debugged, and a removed failure domain
stays removed.

*Reasoned — by enumeration against the records and guarantees, 2026-09-02. The enumeration is the
argument; if an advantage is missing from it, the conclusion changes.*

### The domains a file removes are the loud ones; the domain it keeps is the silent one

**Counting favours the file and the count is not the finding.** A file store has roughly five
independent failure domains against a service's seven, and the two it lacks — the network hop and the
rotatable credential — are absent rather than mitigated.

**But the domains it removes all fail loudly**, in the sense that an operation throws. The domain it
keeps and concentrates is the disk beneath the file, and that is where silent loss lives.

**Corruption detection under SQLite is opt-in, with a sixteen-year precedent.** SQLite's own
documentation carries a section titled "The WAL-Reset Bug": a checkpoint/write race present from
3.7.0 (2010-07-21) through 3.51.2 (2026-01-09), fixed in 3.51.3 (2026-03-13), requiring "two or more
database connections open on the same file" — which a connection pool or a backup process satisfies.
Tailscale hit it 19 times in six months with nothing in application logs: "A write had vanished into
thin air without raising an error."

The bug is fixed, so citing it as live risk would be wrong. What it establishes is the shape:
detection is tooling somebody chooses to build, and its absence is invisible.

*Sourced — [sqlite.org/wal.html](https://www.sqlite.org/wal.html) §11 and
[tailscale.com/blog/sqlite-wal-reset-bug](https://tailscale.com/blog/sqlite-wal-reset-bug), both
opened and read 2026-09-02.*

**A single volume has no redundancy, stated first-party.** Fly: "If your app needs a volume to
function, and the NVMe drive hosting your volume fails, then that instance of your app goes down.
There's no way around that." Volumes are not replicated among themselves, and daily snapshots
"shouldn't be your primary backup method."

*Sourced — [fly.io/docs/volumes/overview](https://fly.io/docs/volumes/overview/), read 2026-09-02.*

**The replication tooling is healthy.** Litestream shipped v0.5.17 on 2026-08-31, releasing every two
to four weeks. It is disaster recovery rather than high availability and replicates asynchronously
with a one-second default interval, which is the recovery point objective in the common case. LiteFS
is the deprioritised one — pre-1.0, with LiteFS Cloud sunset in October 2024 — and Fly's own docs say
not to combine LiteFS with autostop.

*Sourced — [Litestream releases](https://github.com/benbjohnson/litestream/releases), read 2026-09-03.
The LiteFS claims are second-hand.*

### The operational comparison may be inverted from how it is usually framed

**The familiar framing compares a self-hosted file against a self-hosted database server**, where the
file plainly wins: one file, no daemon, no connection management. Against a *managed* service the
comparison runs the other way, and the inventory is long: a volume and its failure mode, a backup
mechanism, a restore procedure and the discipline of rehearsing it, a process manager, boot
persistence, a reverse proxy, TLS issuance and renewal, firewall and SSH hardening, unattended
security updates, log rotation before a disk fills, external uptime monitoring because a machine
cannot watch itself, and an alerting channel.

**The same inventory, written out in [../brainstorming/](../brainstorming/) for exactly this
architecture, contains no backup or restore procedure for the data.** Somebody described crash
recovery, reboot survival and three separate SSH-lockout recovery routes, and omitted the step that
protects a player's work. That is the shape of the risk rather than an argument against the option:
no single task is hard, and the list is long enough that something falls off it.

*Reasoned — from that material, which is non-authoritative and cited for what it enumerates rather
than for anything it concludes.*

### The two ends fail in different shapes, and that is the durable difference

**Self-operated risk is attention**: unbounded, silent, and its worst case is losing a player's work
with no second copy. **Managed risk is timing**: bounded, announced, arriving on somebody else's
deadline, with the data usually portable when it does.

**Every managed vendor examined changed its terms within five years.** PlanetScale announced free-tier
removal 2024-03-06 and retired it 2024-04-08 — thirty-two days. Heroku removed free dynos in 2022.
Vercel retired its own Postgres product. Neon was acquired by Databricks in May 2025. Deno Deploy
Classic shut down in July 2026.

**Portability at the managed end holds only where the vendor's differentiator is unused.** Neon and
Supabase run real Postgres, so `pg_dump` moves the data. Neon's branching, Turso's embedded replicas
and Supabase's auth layer are proprietary, and depending on them is normally the reason to choose
those vendors. Exit cost is set by which of the two is being bought.

*Sourced — the PlanetScale dates were read directly 2026-09-02; the rest is second-hand from research
agents.*

**Monthly cost does not discriminate.** Always-on with a volume and an address lands near $5.17 on
Fly or €6.59–8.09 on Hetzner. A managed store that does not sleep runs from about $5 to $25. Same
order of magnitude, both small against any plausible budget, and
[what is the acceptable running cost?](what-is-the-acceptable-running-cost.md) is not answered until
M16.

### Being industry-standard is a traceable input, and a weak one

**[../problem.md](../problem.md) names "a system whose operation is worth describing to someone
hiring for it".** Postgres is the default of most full-stack work, so experience with it converts into
something the problem statement says it wants. That makes it an input rather than taste.

**It is weak because the same purpose carries a guard** — "would this be worth building if its
demonstration value were zero" — and because neither candidate is a risky bet. The failure this
reasoning guards against is choosing something that becomes unmaintained or unaffordable, and SQLite
and Postgres are both about as far from that as software gets. So durability does not separate them
and only familiarity does.

### What is unverified

**A claim inherited from [../brainstorming/](../brainstorming/) that would have caused real harm.**
That material proposes storing event payloads as binary blobs for bandwidth and tamper resistance. A
blob is opaque to SQL, which is what
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) rules out, and
nothing in the source notices the contradiction. Recorded so the trap is visible when a schema is
designed.

**Essentially every number in that material is unsourced.** Roughly fifty numeric claims — insert
rates, cold starts, requests per second, memory footprints, costs — none carrying a method, a date or
a working link.

*Unverified — no source recorded.*
