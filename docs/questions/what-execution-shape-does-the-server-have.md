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

The generator is worth checking separately rather than assuming it colocates. Generation is batch
work and can run anywhere the *writer* of the catalogue can reach. **That is not the same as anywhere
the store can be reached**: under a local file store the generator either shares the machine and
writes the file directly, or publishes through the server's own API and runs anywhere at the cost of
an endpoint and a credential. Neither cell forces a location; what a local file forces is a choice
between those two routes. See
[are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md)
and [are puzzles and player records in one store?](are-puzzles-and-player-records-in-one-store.md).

### The order the remaining work has to happen in

The first two steps are inputs. Only after them is anything decidable.

1. **Redraw the field on the three axes below**, so that no argument reasons from a vendor name to a
   runtime constraint.
2. **Both inputs are answered, and their results are in the Findings below.** The failure-domain
   comparison across all four cells and the enumeration of what a player waits for were completed
   2026-09-02. The questions that held them are resolved and deleted; their durable output is in
   [../problem.md](../problem.md) under "Where a player waits" and in two new entries in
   [../failure-modes/](../failure-modes/). Verifying the failure enumeration by breaking things never
   blocked this and waits for a system to break, per
   [can failure conditions be injected deliberately?](can-failure-conditions-be-injected-deliberately.md).
   Whether any given platform offers a disk that survives a restart, a redeploy and a scale-to-zero
   belongs to [where does this run?](where-does-this-run.md) and is tracked there.
3. **Decide whether the store is in the process or over a network.** The trade is
   reasoning-simplicity against operational-simplicity, and it is decided on which option keeps the
   most technical properties reachable — latency, safety, portability, and the ones not yet known to
   matter — rather than on the maintainer's current appetite for operating infrastructure. That
   appetite is a short-term guess about a long-lived choice, and it is deliberately excluded until
   the technical case has been made without it.
4. **Decide whether the runtime is a constrained isolate**, which largely follows from the step above
   plus [ADR-0006](../decisions/0006-one-language-across-every-deployable.md)'s one-toolchain
   argument.
5. **Record whether a process exists between requests** — the third claim this question resolves
   into, and the one two earlier sequences dropped. A consequence or a platform setting rather than an
   argument, but recorded either way.

Only then is [what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md)
safe to answer, because store locality constrains the runtime field and a runtime chosen first can be
reversed by it.

### No spike blocks this

Each candidate measurement was checked against what its result would change, and almost none of it
changes this decision. [../constraints.md](../constraints.md) warns about that shape of error
directly: "a real number about an irrelevant quantity ends arguments it should not." What remains
belongs elsewhere or is answered:

- **What can run in-process** is settled: SQLite. The alternatives are enumerated and dropped in
  [which database, if any?](which-database.md), so the in-process branch is a known quantity and the
  open part is what it costs to leave.
- **The daily-loop comparison** is dropped. Developer ergonomics is a comfort property and this is
  being decided on which option keeps technical doors open — a different test, which ergonomics
  loses. It also needs a project to have a loop in, and there isn't one.
- **Engine suitability for analytical questions** is at M3 with
  [which database, if any?](which-database.md), because it separates engines rather than localities.
- **Fault injection** waits for a system to break, per
  [can failure conditions be injected deliberately?](can-failure-conditions-be-injected-deliberately.md).
- **Round-trip latency** moves nothing here, per
  [how long does a store round trip take?](how-long-does-a-store-round-trip-take.md).

> So the remaining input was an afternoon of writing rather than a spike, and it has been written.
> This decision is now a judgement between well-understood options rather than a research project,
> and nothing is waiting on a measurement.

*Reasoned — 2026-09-02, by asking of each measurement what decision its result would change, and
again after the in-process field closed to a single candidate. Updated 2026-09-03 once both analyses
landed.*

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

### Three axes, not two — and platform is downstream of all of them

**The cells below were drawn on two axes and that was a mistake.** The real axes are independent:

1. **Is the store in the process, or reached over a network?**
2. **Does a process exist between requests?**
3. **Is the runtime a constrained isolate, or an ordinary one?**

**Where it is hosted is a consequence of those three, not a fourth axis.** Cell 5 below was written as
"an edge runtime with an edge store", which quietly equated choosing Cloudflare with choosing an
isolate. Cloudflare Containers is generally available and runs an ordinary container, so that platform
can serve cell 3 as easily as cell 5. Any argument that reasons from a vendor name to a runtime
constraint is making this error.

The cells are kept below because the analysis attached to them is still good. They should be redrawn
on the three axes above before anything is recorded.

### 1. An always-on process with a store it opens as a file

Node, Bun or Deno on a machine or micro-VM with a volume attached. No network hop to storage,
background work is possible, and the machine is yours to operate — which is the cost, and it is
recurring. The generator either shares the machine and writes the file directly, or publishes through
the server's API and runs anywhere; this cell forces that choice rather than forcing a location.

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

**Litestream is actively maintained; LiteFS is not.** Litestream shipped v0.5.17 on 2026-08-31, with
v0.5.13 through v0.5.17 across June–August 2026 — a release every two to four weeks. It is disaster
recovery rather than high availability and replicates asynchronously, which is a description of what
it does rather than a sign of decay. LiteFS is the deprioritised one: LiteFS Cloud was sunset in
October 2024 and LiteFS itself is pre-1.0.

Litestream is the piece that would actually be relied on, so the distinction is the whole finding.

**Fly volumes attach to exactly one machine with no replication**, so the volume is a single point of
failure.

*Sourced — [Litestream releases](https://github.com/benbjohnson/litestream/releases) and
[fly.io/docs/volumes/overview](https://fly.io/docs/volumes/overview/), both opened and read by me
2026-09-02. The LiteFS Cloud sunset date is second-hand.*

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

### What each end actually costs, over years rather than months

**Monthly cost does not discriminate.** Self-operated lands near €8/month on Hetzner once the
instance, the IPv4 address, a volume and backups are counted, or about $9.42 on a Fly machine with a
volume and a dedicated address. Managed lands at nothing on free tiers, or $10–25/month paid. Same
order of magnitude, both small against any plausible budget.

*Sourced — vendor pricing pages read 2026-09-02 by research agents; the totals are their arithmetic,
not mine.*

**Self-operating does not insulate against vendor pricing, only slows it.** Hetzner raised its entry
cloud tier 33% effective 15 June 2026 — CAX11 from €4.49 to €5.99 monthly — with no reason given in
the announcement. Existing customers keep legacy pricing unless they modify the server, which makes
the insulation conditional on never rescaling.

*Sourced — Hetzner's own price-adjustment documentation, read by me 2026-09-02. Larger figures
circulating for other tiers were not verified.*

**Every managed vendor examined changed its terms within five years, on its own schedule.**
PlanetScale announced on 2024-03-06 and retired its free plan on 2024-04-08 — about thirty-two days,
alongside layoffs, with the announcement offering "If this puts you in a difficult situation, please
email support@planetscale.com". Heroku removed free dynos and databases in 2022. Vercel wound down
its own Postgres product and force-migrated it. Neon was acquired and changed its pricing model.
Deno Deploy Classic shut down in July 2026.

*Sourced — PlanetScale's announcement read by me 2026-09-02; the rest second-hand from research
agents.*

**One licence term is easy to miss.** Vercel's free plan is "for personal, non-commercial use", which
is a licence restriction rather than a usage cap. A genuinely public v1 with any commercial character
starts at $20 per seat per month there before any store is paid for.

*Sourced — Vercel's pricing page, read by me 2026-09-02.*

**A free tier behaves like an outage at this traffic level.** Supabase pauses free projects after a
week of inactivity and Render's free Postgres expires thirty days after creation. Low traffic is this
project's design point rather than a temporary condition, so both are live failure modes rather than
edge cases.

*Sourced — second-hand from research agents.*

**No vendor's documentation claims to test-restore your data.** Restorability is asserted across
every managed store examined and demonstrated by none of them, which makes rehearsing a restore the
maintainer's job at both ends rather than only at the self-operated one.

*Reasoned — from the absence of any such claim in the documentation surveyed, which is weaker
evidence than a statement to the contrary would be.*

**The two ends fail in different shapes, and that is the durable difference.** Self-operated risk is
attention: it is unbounded, it fails silently, and its worst case is losing a player's work with no
second copy. Managed risk is timing: it is bounded, it announces itself, it arrives on somebody
else's deadline, and the data is usually portable when it does. A solo maintainer with a day job is
better placed to absorb a deadline than to notice a silence.

**Portability at the managed end holds only where the vendor's differentiator is unused.** Neon and
Supabase run real Postgres, so `pg_dump` moves the data. Neon's branching, Turso's embedded replicas
and Supabase's auth and storage layers are proprietary, and depending on them is normally the reason
to choose those vendors over plain managed Postgres. Exit cost is set by which of the two is being
bought.

*Sourced — second-hand from research agents.*

### What each cell forecloses, and what reopening costs

**Cells 2, 3 and 4 are one another's neighbours.** They share a full runtime and a network store, so
moving between them changes deployment rather than data. Turning scale-to-zero off is a platform
setting. Moving between a container and a function is a re-scaffold of handler signatures, and it is
small precisely if handlers target the web-standard `Request` and `Response` interfaces — which
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md) already
identified as the hedge that keeps this cheap.

**Cell 1 and cell 5 are the two that create a migration to leave.** Leaving cell 1 means exporting
from a file into a network store with live player data in it, plus rehoming the generator if it was
put on the same machine rather than made to publish through the server. Leaving cell 5 means
migrating the store *and* rewriting off
platform-specific runtime APIs *and* finding the generator a home it never had.

> So the asymmetry is between a middle that is cheap to change your mind about and two ends that are
> not. That is not an argument for the middle by itself — an end may be worth the cost — but it is
> the thing the record has to weigh rather than present merit.

*Reasoned — the specific later work is named above rather than asserted as a general property. The
premise it rests on is
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md): reverse the
queryability requirement and the eliminated storage tier returns and the field changes shape.*

### Held in isolation, with cost and effort set aside, the technical analysis does discriminate

**This was run as a deliberate exercise**: assume money is no object and maintainer effort is free,
and ask what remains. The point was to find out whether a technical answer exists underneath the
operational argument, or whether the operational argument *is* the decision. It turns out to be the
former, and the result is sharper than expected.

**The edge's one advantage is useless here, and its constraints are narrower than they look. Neither
half settles the cell.**

**What holds:** its technical proposition is putting compute near the user to cut latency. This
project has recorded that the server is not on any path a player waits on, that
[input registers without waiting for the network](../guarantees/input-registers-without-waiting-for-the-network.md)
is structural rather than a duration, and that no server latency budget exists anywhere. So whatever
the edge tier costs, it is not buying anything this system needs.

**What does not hold: three constraints commonly cited against the edge tier.**

- **A filesystem exists**, though not a persistent one. `node:fs` runs over a memory-backed virtual
  filesystem with a writable `/tmp`, and "the contents of `/tmp` are not persistent and are unique to
  each request". That still rules out an embedded store, but "no filesystem" overstates it.
- **The `eval` restriction applies at Worker startup, not to request handling**, and is adjustable by
  compatibility flag. Second-hand; the flag documentation is unopened.
- **The generator has a first-class home on the same platform.** Cloudflare Containers is generally
  available on the Workers Paid plan and is positioned for "Resource-intensive applications that
  require CPU cores running in parallel, large amounts of memory or disk space" and "Applications and
  libraries that require a full filesystem, specific runtime, or Linux-like environment", which is the
  strongest thing the edge tier is said to lack.

> So an edge runtime is not dominated. It is worse on several axes and disqualified on none.

**Platform and runtime tier are not the same axis.** Cell 5 reads as "an edge runtime with an edge
store", which equates choosing Cloudflare with choosing a constrained isolate. Containers means a
platform in the edge tier can run an ordinary container — cell 3. The real question is narrower:
whether the *server* runs in a constrained isolate, which is separable from where it is hosted.

**What survives against the isolate is one argument, and it is not about capability.** Running the
server in an isolate while the generator runs in a container is two runtimes for one maintainer,
which is the cost
[ADR-0006](../decisions/0006-one-language-across-every-deployable.md) exists to avoid — its own words
are that such an arrangement satisfies it "by accident rather than by fit". That is a real argument
and a weaker one than a capability argument would be.

*Sourced — Cloudflare's `node:fs`, Containers and D1 limits documentation, read by me 2026-09-02, and
the records named. The compatibility-flag claim is second-hand.*

**D1's ceiling and its included storage are different numbers, and the pricing page gives only the
second.** The limits page gives a **maximum database size of 500 MB on the free plan** and 10 GB on
paid, against 5 GB of included storage on the pricing page. The limits page describes D1 as designed
"for horizontal scale out across multiple, smaller (10 GB) databases, such as per-user, per-tenant or
per-entity databases", which bears on whether one D1 is a sensible home for cross-player analysis.

*Sourced — Cloudflare's D1 limits documentation, read by me 2026-09-02.*

**A network-attached store dominates a store opened as a file, under the same assumption.** The
honest way to test this is to enumerate what an embedded file buys *technically* and see what
survives:

- **Lower read and write latency.** Does not bind: nothing is waiting on it.
- **No network partition between the process and its store.** Real, but a partition surfaces as
  server unavailability, which four promises already describe the client absorbing without showing a
  player anything.
- **Transactions spanning everything in the file.** Real, but this is one-store-versus-two rather
  than file-versus-service — a single managed Postgres gives the same thing.
- **No connection pooling or connection limits.** Real under per-request compute; trivial under a
  long-lived process.
- **Backup is one file; local development is deterministic; there is no external dependency at
  boot.** All three are maintainer effort, which this exercise holds at zero.
- **Fast analytical scans over local data.** Real, and the analysis
  [ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) preserves is
  maintainer-facing and offline, so it has no budget either.

> So every technical advantage of the embedded file either turns on latency that does not bind, or on
> effort that has been set aside. **The entire remaining case for it is cost and maintainer effort** —
> which is a clarifying result rather than a dismissive one, because those are real. It means the
> SQLite question is not a technical question for this project. It is an economic one wearing
> technical clothes, and the performance argument that originally justified it was retired by the
> architecture flip rather than by anything in this analysis.

*Reasoned — by enumeration against the records and guarantees, 2026-09-02. The enumeration is the
argument; if an advantage is missing from that list, the conclusion changes.*

**An always-on process and a scale-to-zero container are technically indistinguishable here.** They
differ in whether a process exists between requests, and nothing recorded needs one to — no scheduled
work, no state held in memory. Moving between them is a platform setting rather than a change to
anything written.

**Ephemeral functions differ from both in one real way**: no process between requests means no
in-process background work at all, and every request pays a store connection. Neither binds today.
Both are constraints the other two do not carry.

### The store's latency can be felt — but the thing that decides it is not in-process versus network

**There are moments where a player waits on the server.** The claim that nothing waits on it covers
the *input* path only. Picking up a second device that must fetch newer state, refreshing a stale
archive on regaining connectivity, and signing in are all moments where the client is blocked on a
response. None is promised anything, and all would be felt.

**The arithmetic says the store's contribution is invisible next to the network — unless the store
was asleep.** [../constraints.md](../constraints.md) records a 3g RTT floor around 270ms, 2g at
1400–2000ms, and three to four round trips before any payload moves on a fresh connection. Against
that floor:

- **In-process versus a warm network store in the same region** is a difference of roughly a
  millisecond. Under half a percent of the smallest plausible client-perceived wait. Not detectable.
- **A warm store versus one that has scaled to zero** is a difference of hundreds of milliseconds.
  Neon suspends after five minutes of inactivity and reactivates "within a few hundred milliseconds",
  and free plans cannot disable it. That roughly doubles the perceived wait, and it is very
  detectable.

> So the discriminator is **whether the store sleeps**, not whether it is in the process. An
> always-on network store is indistinguishable from an embedded one at the client. A scale-to-zero
> store is not.

**And the alignment is the worst possible one for this project.** Traffic is deliberately tiny, so
five minutes of inactivity is the normal state rather than an exception — the store would be cold for
most first touches. The three moments named above are all *first touch after a gap*, which is exactly
the case that pays the wake-up. Stacking a scale-to-zero compute in front of a scale-to-zero store
pays it twice.

> So this is a real argument, and it argues against **sleeping**, which is a property both an
> always-on managed store and an embedded file happen to have. It does not by itself argue for
> SQLite.

*Sourced — Neon's scale-to-zero documentation read by me 2026-09-02; RTT figures per
[../constraints.md](../constraints.md). The one-millisecond same-region figure is an order-of-magnitude
estimate and has not been measured here — which is what the spike is for.*

### Being industry-standard is a legitimate input, and it is traceable rather than a preference

**[../problem.md](../problem.md) names "a system whose operation is worth describing to someone
hiring for it" as one of three maintainer purposes.** Postgres is the default of most full-stack
work, so experience with it converts into something the problem statement already says it wants. That
makes this an input rather than taste — but a weak one, because that same purpose carries the guard
"would this be worth building if its demonstration value were zero", and the answer for a store is
plainly yes either way.

**The counter is that neither candidate is a risky bet.** The failure this reasoning guards against is
choosing something that becomes unmaintained, deprecated or unaffordable. SQLite and Postgres are both
about as far from that as software gets, so the durability argument does not separate them and only
the familiarity argument does.

### Neither direction dominates

**The enumeration that appears to make a network store dominant has a gap, and it is a tempting
one.** "No network partition between the process and its store" looks disposable, because a partition
surfaces as server unavailability and the client absorbs that. But that is an argument about *player
impact*. The failure domain still exists, and still has to be reasoned about, monitored and debugged
— which is architecture rather than effort, so holding effort at zero does not remove it.

**The honest shape of the trade is two different kinds of simplicity.** An embedded store is simpler
to *reason about*: one file, in-process, always reachable, no credentials, no pool, no partition, one
fewer thing that can be down. A managed network store is simpler to *operate*: no volume, no
patching, no backup script you wrote yourself, no restore you have to remember to rehearse. A solo
maintainer wants both and cannot have both.

> So there is no dominance in either direction. An enumeration that reaches one has filed the
> strongest opposing item under the wrong heading.

### Why hosting kept dominating the discussion, and what that indicated

**The requirement turned out to be thin, so nothing capability-shaped was left to discriminate on.**
Once every candidate can do everything the records require, the only remaining differences are
operational — and operations is mostly a property of the host. That is why a question about
execution shape kept resolving into an argument about hosting, and it was a signal rather than a
digression.

**The question as originally framed bundled two decisions along that seam.** One is technically
derivable now, from records already in force: not an edge runtime, and a store reached over a
network. The other — how much operational surface to own, and whether cost overturns the first — is
economic, currently fuzzy, and does not become answerable by thinking harder. Bundling them is what
made this feel circular.

### Store locality has to be settled before the runtime, not after it

**The old coupling between store and runtime ran through performance and is gone; a different
coupling remains and runs through locality.** Under a network-attached store the drivers are portable
JavaScript and no runtime is advantaged. Under a store opened as a file the runtime's embedded-driver
and native-addon story matters. So a runtime chosen while locality is open can be reversed by the
locality answer, which makes any sequence that settles the runtime first unsound.

**The coupling is much weaker than it was, and the residue is one candidate.** `node:sqlite` is
available in Node without a flag and Bun implements it fully, so data access written against it runs
on both — see
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md) for the
sourcing. What an embedded store still costs is Deno, whose route to native addons carries a
lifecycle-script caveat the other two do not.

> So the practical choice is between settling locality now — which frees all three runtimes if it
> lands on a network store — and deferring locality at the price of narrowing the runtime field to
> the two that survive either branch. Those trade different optionality against each other, and the
> second forecloses Deno on a hypothetical rather than on its merits.

*Reasoned — 2026-09-02, from the driver facts recorded in the runtime question.*

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

### Both blocking inputs are now answered, and they moved things

*Mined 2026-09-02 from the two question files this one was waiting on, both now resolved and deleted.
Their durable output is in [../problem.md](../problem.md) under "Where a player waits" and in two new
entries in [../failure-modes/](../failure-modes/).*

**Seven of the nine blocking moments are cold touches, and that is structural.** The enumeration found
nine moments where the client is blocked on a response. Only two — browsing an uncached archive and
viewing a stats screen — arrive mid-session with other requests flowing. The rest are first contact
after a gap.

It follows from [ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) keeping
solving local: the server is reached at the *edges* of a session rather than throughout it. And
[../problem.md](../problem.md) makes the gaps long by design — sessions "resume anywhere from seconds
to days later".

> So anything on the request path that sleeps is cold for most waits in the product rather than a
> minority of them. **This does not improve as the audience grows**, because it is a property of the
> session shape rather than of traffic volume. It argues against scale-to-zero on both axes, and it
> weakens the network store's own optionality case — keeping scale-to-zero reachable is worth less
> than it looked, because the evidence says do not use it.

*Reasoned — from the enumeration and the records named, 2026-09-02.*

**Nothing on the list is sensitive to a millisecond, checked rather than assumed.** Every moment
involves at least one fresh or resumed connection carrying a payload, against the 270ms 3g floor and
three to four round trips in [../constraints.md](../constraints.md). An in-process read and a warm
same-region network read are three orders of magnitude below the noise floor. This confirms the
arithmetic already in this file rather than adding to it.

**The most frequent blocking moment was missing from the earlier list, and it may put the store on
the daily path.** Opening a puzzle whose content has never reached this device happens to every active
player at least daily, because
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) rules out shipping
content as static files. Whether it touches the *store* is undecided — that same record's closing
line lists "what the catalogue is stored in" among what it deliberately does not settle.

> So [ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md)'s "not on the
> interaction path" is true of solving and not of session entry. If the catalogue lives in the store,
> store availability becomes a daily concern rather than a background one, and a store outage means
> nobody starts today's puzzle. That is the sharpest open sub-question under this one, and it is asked
> at [are puzzles and player records in one store?](are-puzzles-and-player-records-in-one-store.md).

*Reasoned — from the records named, each opened and checked 2026-09-02.*

**A local file store does not pin the generator, and the argument that it did has been withdrawn.**
It pins the *writer* of the catalogue, and the writer can be the server: a generator that publishes
over HTTP runs anywhere under a file store exactly as under a network one. The cost of that route is
an endpoint and a credential, needed only in this branch; the slower bulk write does not bind,
because [../problem.md](../problem.md) ranks the interactive path over batch throughput and says
generation "can be as slow as it needs to be".

**What survives is narrower.** If the generator *is* put on the server's machine, search-heavy batch
work competes with request serving, and that same ranking is violated by consequence rather than by
anyone deciding it. That is an argument against one particular arrangement of cell 1, not against
cell 1.

*Reasoned — 2026-09-03, correcting a claim carried here since 2026-09-02. It was never sourced to a
record; it was inferred from "the generator writes to the same file", which nothing established. See
[are puzzles and player records in one store?](are-puzzles-and-player-records-in-one-store.md) for the
derivation.*

### The failure-domain comparison, and why it did not go where it was expected to

**Counting independent failure domains: A ≈ 5, B ≈ 7, C ≈ 10, D ≈ 11** (cells 1, 2, 3 and 4 above).
A's list is short structurally rather than through resilience — no network hop and no rotatable
credential means two domains are absent rather than mitigated. C adds the platform scheduler as
something that fails while process and store are both healthy. D adds connection-limit exhaustion
under concurrency, which is probabilistic and does not reproduce at low traffic, plus the
HTTP-to-Postgres proxy as a component that fails while the vendor's status page shows green.

**Fewest-domains and fewest-silent-failures name the same cell, which was not expected.** The question
that produced this predicted they would diverge, and that the divergence would be the finding. Both
name cell 1, because with no monitoring built every failure everywhere is silent — the premise
flattens the comparison. So "which fails more quietly" is currently a question about monitoring rather
than about architecture.

**The sharper asymmetry is which domains each cell removes.** The ones an embedded file removes — the
network hop, the credential, the pool, the vendor — all fail loudly, in the sense that an operation
throws. The domain it keeps and concentrates is the disk beneath the file, and that is where silent
loss lives.

> So the strongest argument on the embedded side — that a removed failure domain stays removed — holds
> but buys less than it appeared to. What it removes is the noisy half.

*Reasoned — from the enumeration across all four cells, 2026-09-02.*

**Corruption detection under SQLite is opt-in, with a sixteen-year precedent.** SQLite's own
documentation now carries a section titled "The WAL-Reset Bug": a checkpoint/write race present from
3.7.0 (2010-07-21) through 3.51.2 (2026-01-09), fixed in 3.51.3 (2026-03-13), requiring "two or more
database connections open on the same file" — which a connection pool or a backup process satisfies.
Tailscale hit it 19 times in six months and saw nothing in application logs: "A write had vanished
into thin air without raising an error." They found it by building transaction-replay tooling and
running `PRAGMA integrity_check` against offsite backups.

The bug is fixed and citing it as a live risk would be wrong. What it establishes is the shape:
detection is tooling somebody chooses to build, and its absence is invisible.

*Sourced — [sqlite.org/wal.html](https://www.sqlite.org/wal.html) §11 and
[tailscale.com/blog/sqlite-wal-reset-bug](https://tailscale.com/blog/sqlite-wal-reset-bug), both
opened and read by me 2026-09-02.*
