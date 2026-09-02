---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What execution shape does the server have?

## Why it matters

**This is the hub three separate decisions all turn on, and deciding any of them without it means
regretting one of them later.** A long-lived process on a machine with a persistent local disk can
hold an embedded database, run background work and keep things in memory between requests. An
ephemeral or edge runtime can do none of those and needs its state over a network.

The foreclosure runs one way and is invisible at the moment it happens. The consequences are
already written down in [where does this run?](where-does-this-run.md), which is cited here for its
findings rather than as something to answer first — the order lives in
[README.md](README.md) and puts this question ahead of it. So deploying a hello world to an edge
platform quietly settles [which database, if any?](which-database.md) — and nothing about that
deployment announces that a database class has just been chosen.

It reaches the runtime too. Node, Bun and Deno on a machine can all embed a database; an edge
runtime cannot, which removes a whole tier of candidates from
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md).

**The first deployment is not a throwaway.** Where the client lives and where the API lives is one
choice, made once — see [do the client and the API share an origin?](do-the-client-and-the-api-share-an-origin.md).
Getting it wrong is not a redeploy; it is a redeploy plus whichever of the three above has to move
with it.

## What would settle it

**Three of the four things this file originally said to check have been checked**, against
[../guarantees/](../guarantees/), [../failure-modes/](../failure-modes/) and every record in
[../decisions/](../decisions/). Nothing recorded requires work on a schedule. Nothing recorded
requires state held in memory between requests. Nothing puts the server on a path a player waits on.
The fourth — whether the store is a file the process opens or a service it connects to — is the one
that is genuinely open, and it is most of what this question now is.

What remains is therefore not a search for a capability that eliminates candidates. Every cell below
can do what the records require. It is a judgement about **what each cell forecloses**, what
operating it costs one person, and which of those costs is worth paying.

[../problem.md](../problem.md) supplies the scale — a deliberately small audience — so nothing here
is decided by throughput, and any argument that reaches for requests per second is answering a
question this project does not have.

The generator is worth checking separately rather than assuming it colocates. If puzzles are
produced ahead of time, generation is a batch job that can run anywhere — but only where the store is
reachable over a network. Where the store is a local file, the generator is pinned to the same
machine, and that is a consequence of the cell rather than an independent choice. See
[are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md).

## Resolves into

Several records in [../decisions/](../decisions/) rather than one. The reasoning splits into
separable claims — whether a process is alive between requests, whether the store is a file or a
service, and which runtime tier follows — and a reasonable person could decide each independently of
the others. They are worked together because what a shape can reach is most of what distinguishes
it; they are recorded apart so each is checkable on its own.

## Source

Raised 2026-09-01, after a check found that the first milestone contained
[where does this run?](where-does-this-run.md) while five of the questions it names as blockers sat
in later milestones. The coupling between database, platform and runtime had no owner, so each was
positioned as though the other two were independent.

Field rebuilt from scratch 2026-09-02. The four options previously listed here were drawn while a
local database file was treated as a fixed requirement, so a whole cell was missing rather than
rejected.

## Options

### The field, drawn as two axes

The distinguishing axes are **how long a process lives** and **where the store sits**. Crossing them
gives the cells below. Combinations absent from the list are absent because they do not exist — a
scale-to-zero container or an ephemeral function has no persistent local disk to open a file on.

### 1. An always-on process with a store it opens as a file

Node, Bun or Deno on a machine or micro-VM with a volume attached. No network hop to storage,
background work is possible, and the machine is yours to operate — which is the cost, and it is
recurring. The generator must share the machine, because it writes to the same file.

### 2. An always-on process with a network-attached store

Keeps background work and in-memory state, gives up the local file, and hands operation of the store
to somebody else. The generator can run anywhere. Hosting stays open in a way the first option
closes.

### 3. A scale-to-zero container with a network-attached store

The cell that was missing. A full runtime in a container that stops when idle — Cloud Run, Fly
Machines with auto-stop, Render, Railway. Same code and same artifact as the cell above; what
changes is that no process exists between requests, so nothing can be held in memory and background
work needs a platform scheduler. The disk is instance-scoped and does not survive.

### 4. Ephemeral functions with a network-attached store

No process between requests, cheapest at rest, least to operate. Every request pays a connection to
the store, which is why the serverless-Postgres tier ships HTTP drivers rather than expecting a
socket to be held open.

### 5. An edge runtime with an edge store

A constrained V8 isolate rather than a full runtime, with a store shaped to match it. The most
constrained and the hardest to reverse, because both the runtime and the storage layer are specific
to the platform.

### Ruled out by a record, not by preference

[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) requires the
store to answer questions later without a migration, which eliminates a set of edge storage options
that would otherwise make cell 5 attractive. Cloudflare Workers KV and Deno KV have no query
language at all. Cloudflare Durable Objects give each object its own isolated SQLite, so a question
spanning players — which is the whole point of that record — needs a fan-out layer built by hand.
Of the edge tier only D1 survives, and it survives with limits.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

### What the promises require of the server — and what they do not

**Four capabilities are required, each traceable to a record.** The server holds a durable per-player
record off the device ([ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md));
that store answers analytical questions without a migration
([ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)); it decides
per request whether to serve a piece of puzzle content
([ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md)); and it runs
TypeScript ([ADR-0006](../decisions/0006-one-language-across-every-deployable.md),
[ADR-0007](../decisions/0007-that-language-is-typescript.md)).

*Reasoned — derived from the records named, each read in full.*

**Nothing else is required, and the absences are the surprising part.** No promise or failure mode
puts the server on a path a player waits on. None states a latency bound or a duration of any kind.
None requires scheduled work. None requires state held in memory between requests. Server
unreachability is absorbed by the client rather than shown to the player, which four promises
describe from different angles.

> So this decision cannot be settled on performance, and a spike measuring request latency would be
> measuring something nothing turns on. What discriminates is capability, reversibility and
> operational cost.

*Reasoned — derived from all nine files in [../guarantees/](../guarantees/) and all of
[../failure-modes/](../failure-modes/), read 2026-09-02.*

**The sharpest of the four is the per-request content decision**, because it is the only one that
rules a delivery shape out rather than merely preferring one.
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) explicitly
rejects gating at a CDN with signed URLs, so a static-file content path is not available under any
cell.

*Sourced — per [ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md).*

### Why SQLite was favoured early, and what the architecture flip changed

**The original case for SQLite was runtime performance under an architecture this project no longer
has.** The earlier design was server-driven hypermedia: every player interaction was a round trip,
so the store sat directly on the interaction path and an in-process read that skipped the network
stack was something a player would feel. That is a coherent argument, and it was the anchor several
later choices were derived from.

**That architecture has been reversed.** The client owns state and mutates it locally
([ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md)); the server facilitates
syncing and identity and is explicitly not on the interaction path
([ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md)). So the
performance difference that motivated the original preference is no longer something a player can
feel. It has not become *false* — an in-process read is still faster than a network round trip — it
has become something nothing in the product is waiting on.

> So SQLite's case has to be re-argued on what remains: operational simplicity, cost, and the value
> of having no second service to depend on. Those are real arguments. They are different arguments,
> and the record that chooses should not inherit the performance one.

*Reasoned — from the records named, plus context supplied by the maintainer 2026-09-02 about why the
original preference was formed.*

**Performance is still worth having where it is free**, and nothing here argues for choosing a slower
option on principle. What it argues is that speed cannot be the reason, because the budget it would
be spent against does not exist.

### The ops comparison may be inverted from how it was framed

**The old framing compared a self-hosted file against a self-hosted database server**, where SQLite
plainly wins on operational surface: one file, no daemon, no connection management. Against a
*managed* network store the comparison runs the other way, and this has not been argued anywhere.

**Concretely, cell 1 owns work the managed cells do not**: a volume and its failure mode, a backup
mechanism, a restore procedure and the discipline of rehearsing it, a process manager, boot
persistence, a reverse proxy, TLS issuance and renewal, firewall and SSH hardening, unattended
security updates, log rotation before a disk fills, external uptime monitoring because a machine
cannot watch itself, and an alerting channel. That inventory is not hypothetical — it was written
out in full in [../brainstorming/](../brainstorming/) as the setup for exactly this architecture, and
it runs to roughly twenty-five distinct tasks.

**The same inventory contains no backup or restore procedure for the data.** Someone described the
whole operation — crash recovery, reboot survival, three separate SSH-lockout recovery routes — and
omitted the one step that protects a player's work. That is the shape of the risk rather than an
argument against the cell: the ops burden is not that any single task is hard, it is that the list is
long enough that something falls off it.

*Reasoned — from reading that material, which is non-authoritative and cited here for what it
enumerates rather than for anything it concludes.*

**The tooling around embedded SQLite is weaker than it was.** Litestream is disaster recovery rather
than high availability, replicates asynchronously, and has a documented corruption report and a
restore that refuses to overwrite a non-empty file. LiteFS Cloud was sunset in October 2024 and
LiteFS itself is pre-1.0 and deprioritised. Fly volumes attach to exactly one machine with no
replication, so the volume is a single point of failure.

*Sourced — vendor documentation and issue trackers read 2026-09-02 by research agents; the specific
pages were not opened by me, so treat the individual claims as second-hand and re-check any that
decide something.*

### The Safari topology constraint does not discriminate between these cells

**It constrains how the client and API are deployed, not what shape the server has.** The cap applies
only when a second hostname is resolved, so serving the API path-routed on the app's own hostname
avoids the test under every cell here. The finding is now recorded at the *Sourced* tier in
[../constraints.md](../constraints.md) and the decision it bears on is
[do the client and the API share an origin?](do-the-client-and-the-api-share-an-origin.md).

> So it should not be cited in a record about execution shape. It was tempting to, because it is
> vivid and newly established, and that is exactly when a fact gets used where it does not belong.

*Sourced — per [../constraints.md](../constraints.md).*

### The edge tier weakened materially in the last eighteen months

**Vercel now recommends moving off its own edge runtime.** Its documentation says "We recommend
migrating from edge to Node.js for improved performance and reliability", and records that from
Next.js 16.3 setting `runtime = 'edge'` is no longer supported. The company that popularised
edge-first has reversed on it for general workloads.

*Sourced — Vercel's Edge Runtime documentation, read by me 2026-09-02.*

**Deno Deploy Classic's shutdown date of 2026-07-20 has passed**, existing projects and KV data were
not migrated automatically, and the replacement platform serves from two regions where the old one
served six.

*Sourced — Deno's own migration guide, read by me 2026-09-02.*

**Cloudflare Workers has no filesystem at all**, and the Vercel edge runtime disables `eval`,
`new Function` and dynamic WebAssembly compilation. D1's free tier is 5 GB with 5 million rows read
and 100,000 rows written per day, and exceeding them fails queries rather than billing.

*Sourced — Cloudflare's D1 pricing page and Vercel's edge runtime documentation, both read by me
2026-09-02.*

**[ADR-0006](../decisions/0006-one-language-across-every-deployable.md) anticipated this**: "An edge
runtime that only executes one language would satisfy this by accident rather than by fit." The
generator is search-heavy batch work and cannot run in an isolate, so cell 5 needs a second home for
it — which is the second-toolchain cost that record exists to avoid.

*Sourced — per [ADR-0006](../decisions/0006-one-language-across-every-deployable.md).*

### Free tiers are not a stable input

**A currently-generous free tier is not a durable property of a vendor.** PlanetScale removed its only
free tier in April 2024. Supabase pauses free projects after seven days of inactivity, which for a
deliberately small audience is an outage mode rather than an edge case. Both matter more here than
they would elsewhere, because low traffic is the design point rather than a temporary condition.

*Sourced — second-hand from research agents, not opened by me. Re-check before either decides
anything.*

### What each cell forecloses, and what reopening costs

**Cells 2, 3 and 4 are one another's neighbours.** They share a full runtime and a network store, so
moving between them changes deployment rather than data. Turning scale-to-zero off is a platform
setting. Moving between a container and a function is a re-scaffold of handler signatures, and it is
small precisely if handlers target the web-standard `Request` and `Response` interfaces — which
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md) already
identified as the hedge that keeps this cheap.

**Cell 1 and cell 5 are the two that create a migration to leave.** Leaving cell 1 means exporting
from a file into a network store with live player data in it, plus rehoming the generator that was
pinned to the same machine. Leaving cell 5 means migrating the store *and* rewriting off
platform-specific runtime APIs *and* finding the generator a home it never had.

> So the asymmetry is between a middle that is cheap to change your mind about and two ends that are
> not. That is not an argument for the middle by itself — an end may be worth the cost — but it is
> the thing the record has to weigh rather than present merit.

*Reasoned — the specific later work is named above rather than asserted as a general property. The
premise it rests on is
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md): reverse the
queryability requirement and the eliminated storage tier returns and the field changes shape.*

### What is unverified

**A claim inherited from [../brainstorming/](../brainstorming/) that would have caused real harm.**
That material proposes storing event payloads as binary blobs for bandwidth and tamper resistance.
A blob is opaque to SQL, which is exactly what
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) rules out, and
nothing in the source notices the contradiction. Recorded here so the trap is visible when a schema
is designed.

**Essentially every number in that material is unsourced.** Roughly fifty numeric claims were
catalogued across it — insert rates, cold starts, requests per second, memory footprints, costs — and
none carries a method, a date or a working link. One file contradicts itself on whether copying a
SQLite file under WAL mode is a safe backup.

*Unverified — no source recorded.*

**The maintainer's appetite for operating infrastructure is an input to this and is recorded
nowhere.** [../problem.md](../problem.md) names a demonstrable full-stack system as a purpose, and
separately ranks clarity over cleverness because one person maintains this. Those pull in opposite
directions here, and the file does not resolve them. Deliberately left out of that file for now, and
to be settled when this decision is taken rather than in advance.
