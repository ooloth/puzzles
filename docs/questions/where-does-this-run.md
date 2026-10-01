---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Where does this run?

## Why it matters

This is where the client and its API both live, and moving either later moves both. It is also
where the running cost lands and where the operational surface is set.

**The host and how the app runs on it are settled.**
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) puts the server on a
DigitalOcean Droplet, and
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) runs it as
systemd services without containers. What this question still owes is in the open entry at the end:
the front that terminates TLS, how a deploy switches between versions, and the amendment to
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md).

Two things constrain the answer from outside. The client and the API answer on one origin, per
[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md), so a platform that cannot present both halves on one hostname is not a
candidate. And whatever the browser resolves before it reaches the platform
is its own question — see
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md).

## What would settle it

**The records still owed**, in the open entry at the end. Each is scored against the numbered
properties below, extended and zoomed where a comparison leaves more than one candidate, with each
pass written into **Findings** with its date. What only running can show, such as TLS through the
front and a deploy with the real server, is observed on a Droplet before its record is written.

## Properties the answer is scored against

Derived on 2026-09-27, before any candidate was compared, from the moments the system touches the
host:

- a browser's first navigation to the app's address, and the DNS answer it resolves first;
- a returning player's first API call after a gap of hours or days;
- a request that reads or writes the store, from M3;
- a deploy, a process restart, and the machine being replaced;
- installing and starting what was built;
- the host's own probes of the server;
- a copy of the store leaving the machine, from M3;
- the same change being checked in the production-like local run first.

1. **The client's files and the API answer on one hostname, with every path under `/api/` reaching
   the server.** Rests on
   [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) and
   [ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md).
2. **The app's hostname can resolve with A/AAAA records to an address the host serves from, with no
   CNAME to a provider's domain required.** Rests on the Safari first-party comparison in
   [../constraints.md](../constraints.md): a CNAME to a provider's domain may cap the API's cookie at
   seven days even on one origin. That entry is reasoned from WebKit source and unobserved.
   [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) keeps
   that cookie reachable without relying on it, and this property is what keeps it reachable.
3. **Nothing between the browser and the server caches an API response or strips `Set-Cookie`,
   unless we configure it to.** Rests on
   [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md), Risk,
   and properties 6 and 9 of
   [ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md).
4. **The server process runs continuously and is never stopped or suspended for inactivity.** Rests
   on [ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md).
5. **It is an ordinary long-running Node process on a version we choose.** Rests on
   [ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md),
   [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) and
   [ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md).
6. **The process writes to a disk inside its own machine, not to a network filesystem or network
   block storage.** Rests on
   [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) and "Databases — SQLite
   is not safe on a network filesystem" in [../constraints.md](../constraints.md) for the filesystem,
   and on [ADR-0042](../decisions/0042-the-stores-disk-is-inside-its-machine-not-reached-over-a-network.md)
   for the disk.
7. **What the process writes survives a restart and a redeploy.** Rests on
   [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md).
8. **A deploy never has two replicators writing the store's copy at once.** Two processes on one
   machine may share the store's file, since SQLite requires only that "All processes using a
   database must be on the same host computer", and the eighth and twelfth passes measured deploys
   that overlapped two processes with no write lost. What must stay single is the replicator:
   Litestream says "It is _your_ responsibility to ensure you do not have multiple applications
   replicating concurrently". Rests on
   [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md), which rejects separate
   machines sharing the file.
9. **The file can be copied off the machine while the server runs.** Rests on
   [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md):
   surviving host replacement needs a copy that is not on the machine. How the copy is taken is M3's.
10. **The deployed dependency tree is pnpm's symlinked layout, unchanged.** Rests on
    [ADR-0032](../decisions/0032-the-package-manager-is-pnpm.md), whose Revisit when names this
    host, and
    [no package imports what it does not declare](../invariants/no-package-imports-what-it-does-not-declare.md).
11. **What the host runs can be run locally, with the same artifact and runtime.** Rests on
    [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md):
    the production-like run differs from production only where a record says why.
12. **Anything the host requests from the server can sit under `/api/`, or be switched off.** Rests on
    the Risk in
    [ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md),
    which names a health-check path fixed outside `/api/` as an exception to avoid.
13. **Whatever terminates TLS for the browser offers TLS 1.3.** Rests on "Mobile networks — setup
    cost, not bandwidth" in [../constraints.md](../constraints.md): a fresh connection costs three to
    four round trips depending on TLS version, at 270ms or more each.

**Resources.**

- **Network binds**, as round trips rather than bytes. It is covered by properties 1, 2, 4 and 13,
  and by the region, which is deferred below.
- **CPU does not bind.** "Servers — framework throughput is three orders of magnitude above this
  workload" in [../constraints.md](../constraints.md). The generator is not placed on this host by
  any record, so its CPU is not an input here.
- **Memory does not bind as a property**, but has a floor to measure: the server's resident memory
  against the smallest instance a candidate sells. "Runtimes — a heap ceiling does not bound a
  process" in [../constraints.md](../constraints.md) is why the figure is resident memory and not
  heap.
- **Storage does not bind on size.** There is no store at M1, and one board is small per "Mobile
  networks" in [../constraints.md](../constraints.md). What binds about storage is where it is and
  what it survives, which is properties 6 to 9.

**Checked and found binding on nothing:**

- **Whether the host streams responses unbuffered.** No record uses a streaming response.
- **Horizontal scaling.** [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md)
  already forecloses it.
- **Surviving the machine's own failure.**
  [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
  records that no provider offers it, and that recovery speed is set by our own automation more than
  by the provider.
- **The demonstration purpose in [../problem.md](../problem.md).** Its own guard admits nothing that
  would not be worth building anyway, so it rules nothing in.

**Price enters as a row, per month.** Its target and ceiling are [ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md): about $10 a month
for hosting is a preference, and $20 is a ceiling.

**Deferred, because their inputs belong to later milestones:**

- **The region**, and so the round trip to the machine. See
  [which region does the machine run in?](which-region-does-the-machine-run-in.md) at M3. A
  candidate's region list is recorded, not scored.
- **How much downtime is acceptable.** See
  [how much downtime is acceptable?](how-much-downtime-is-acceptable.md) at M16.
- **How the machine is reached, patched and watched.** See
  [how is the server reached and hardened?](how-is-the-server-reached-and-hardened.md) at M2 and
  [how is the server operated?](how-is-the-server-operated.md) at M11. This is where a managed
  platform and a bare machine differ most. With it deferred, the list may not separate those two
  tiers at all. If it does not, that is the finding, and the choice between them is made on cost as
  stated above rather than dressed as a derivation.

### Extended 2026-09-28: the failures a host choice could cause

*Written before any candidate is scored on it, per the extend-and-zoom step. The failures are a
starting list, not a complete one.*

**How the choice could go wrong or cause harm:**

- An action on the provider's side, such as an account suspension, a billing error or an outage
  upstream of the provider, takes the machine offline. Railway's May 2026 incident, recorded below, is
  the example.
- The machine runs unpatched software beneath our code and is compromised.
- The machine is lost, and replacing it is slow because every step is manual.
- The provider changes its terms, raises its prices or shuts down, and leaving is expensive.
- The machine's public address changes without our doing anything, and the domain points nowhere.

**How it could be slow:**

- The machine is far from the players.
- Every fresh connection pays its three or four round trips to the machine itself, wherever that is.
- A neighbour on shared hardware takes the CPU the process needs.
- The smallest instance has less memory than the server uses.

**How it could be hard to use or to change:**

- Recurring chores fall on the maintainer: patching, certificate renewal, restarting a dead process.
- Leaving needs the app rewritten around the provider's own features.
- A long prepaid term makes leaving cost money.

**Properties added from that list:**

14. **Software beneath our code receives security patches without a recurring manual step.** Rests on
    the solo maintainer and "Clarity over cleverness, because one person maintains this" in
    [../problem.md](../problem.md), and the security theme in
    [../guarantees/README.md](../guarantees/README.md). How the machine is hardened is still
    [how is the server reached and hardened?](how-is-the-server-reached-and-hardened.md) at M2. This
    property asks only whether patching recurs as manual work.
15. **A replacement machine can be created and the store restored to it by a script, through the
    provider's API.** Rests on
    [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md),
    Risk: "the lever that most affects the answer is how automated the recovery is".
16. **Leaving the host costs a redeploy and a copy of the store, and nothing in the app depends on the
    provider.** Rests on
    [ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md):
    a stewardship worry is priced by what leaving costs. This property keeps that cost low. A
    prepaid term's remainder counts toward it.
17. **The TLS handshake for a fresh connection completes close to the player.** Rests on "Mobile
    networks — setup cost, not bandwidth" in [../constraints.md](../constraints.md): a fresh
    connection costs three to four round trips before any payload moves. A handshake ending at an edge
    near the player makes those round trips short, however far away the machine is. This zooms into
    property 13, which asked only which TLS version.
18. **The machine's public address does not change unless we change it.** Rests on property 2, and
    on [how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md): a
    changed address with the domain still pointing at the old one is an outage nobody triggered.

**Property 2 is split, because its wording failed hosts its purpose may not.**

- **2a. What the browser receives for the app's hostname is A/AAAA records, with no CNAME to a
  provider's domain in the answer.** This is what Safari's comparison reads, per
  [../constraints.md](../constraints.md). Cloudflare's flattening of an apex CNAME answers with A
  records, so a host that needs flattening can pass. Whether a shipped Safari agrees is reasoned, not
  observed.
- **2b. The DNS setup needs no CNAME at all.** This is what the property said before. It separates
  nothing 2a does not, once flattening passes 2a, so it binds on nothing.

**Checked and found binding on nothing:**

- **A neighbour taking CPU.** "Servers — framework throughput is three orders of magnitude above this
  workload" in [../constraints.md](../constraints.md). Even Fly's documented floor of 6.25% of a
  shared vCPU leaves that margin at this audience. This reverses if the generator runs on the same
  machine, which no record says it does.
- **Protection against attacks on the address.** The security theme in
  [../guarantees/README.md](../guarantees/README.md) records the surface as small while nothing is
  worth gating. BuyVM's protection being a paid add-on is recorded, not scored.
- **Logs and metrics.** Every candidate lets the process write logs somewhere it can be read after a
  crash. What is watched is [what are the server's vitals, and who watches them?](what-are-the-servers-vitals-and-who-watches-them.md)
  at M11.

**Measured: the server's resident memory is about 113 MB idle and about 132 MB after 5,000
requests.** The JavaScript heap stays near 18 MB. So a 256 MB instance, Fly's smallest, leaves roughly
120 MB of headroom, before the store is added at M3. A 1 GB VPS also carries its operating system.

*Measured, 2026-09-28. `src/server/app.ts`'s `buildServer` ran in a forked child process on Node
26.7.0, macOS on Apple silicon (arm64), and reported its own `process.memoryUsage()` after a forced
garbage collection. A separate parent process sent 5,000 sequential `GET /api/hello` requests. It ran
five times: idle 112.2 to 112.7 MB, loaded 131.3 to 132.1 MB. A first attempt, which sent the
requests from inside the server's own process, read about 215 MB and was discarded, because the
HTTP client's memory was counted with the server's. Not measured: Linux, which is what production
runs and which counts resident memory differently from macOS; the store, which does not exist until
M3; and serving the client's files from the same process.*

**Where the first players are is assumed, not known.** Asked on 2026-09-29, the maintainer said they
were not sure and would assume North America if they had to pick. That enters as the property
below, marked as resting on an assumption. If the assumption changes, this property changes with it.
[Which region does the machine run in?](which-region-does-the-machine-run-in.md) still decides the
region itself at M3.

19. **The host offers a North American region for the process and its disk together.** Rests on the
    maintainer's assumption above, not on a record. A host with no region near the players forces a
    change of host rather than of region, which is why this is a property and not left to M3.

**Property 17 is scored as "reachable on this host", with or without a proxy in front**, per the
maintainer on 2026-09-29. Whether a proxy sits in front is
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md), and this
question does not settle it.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Options and findings ported from legacy ADR-12 (host on Fly.io).

## Options

The candidates, and every host scored and set aside, are in
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md)'s Rejected section. The
full comparison was mined into it on 2026-09-30.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**What is here serves the records still owed** in the open entry at the end. They are the store's
design, the front, the deploy switch, the pipeline and the runbook.

**The host comparison was mined on 2026-09-30.** That covers the passes from 2026-09-27 to the seventh
pass, and the findings on platforms before them. What
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) settled went into it. What
other questions will use went into their files, each marked as mined. The rest is read with
`git show 11ac964:docs/questions/where-does-this-run.md`. The passes below refer to earlier passes by
number, and those are in that commit.

### Properties for the eighth pass, agreed 2026-09-30

*Derived before research, from the maintainer's ideal for the choice: "it just works", "it's so easy"
and "great price", all at once. The maintainer confirmed on 2026-09-30 that these capture what they
mean.*

**What is scored is a complete setup: the host plus everything built around it.** On a VPS, whether
it just works and whether it is easy depend on what we add. Scoring bare hosts would leave both
unscored.

*It just works:*

- **J1.** Every routine event completes with no failed request and no person: host maintenance, a
  crash, a deploy, a certificate renewal, an OS patch and its reboot.
- **J2.** A dead host is recovered with no person, within minutes, losing at most about a second of
  acknowledged writes.
- **J3.** A failure reaches the maintainer through a monitor that runs away from the machine it
  watches, not because they looked.

*It's so easy:*

- **E1.** The pieces the maintainer must build, listed and counted, each marked as supplied by the host
  or built once by us.
- **E2.** The pieces that need recurring attention after setup. The target is zero.
- **E3.** What the maintainer must understand to fix any one of them when it breaks.
- **E4.** The time from an empty account to "Hello!" deployed on the domain.

*Great price:*

- **P1.** The monthly total of the full setup that meets J1 to J3: the machine, the copy's storage,
  the reserved IP, monitoring, and wherever the watchdog runs.
- **P2.** How likely that total is to change without the maintainer changing anything. This is
  row 26.

**The deploy tooling this pass weighed is settled.**
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) runs the app
as systemd services with no Kamal or Coolify, and
[what deploys the code?](what-deploys-the-code.md) keeps only the pipeline.

### Eighth pass 2026-09-30: complete setups, file store against managed database

*The maintainer asked on 2026-09-30 whether the store's design should be derived from the end-to-end
hosted system rather than drive it.
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) found the runtime
comparison a tie and broke it on failure domains, judging setup "a wash" on the assumption that
recovery is a restore. So this pass scores setups that use a managed database alongside those that
use the file. [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) stands until this question resolves.*

**Setups.** Each is the least that meets J1 to J3.

- **A. File store, Kamal.** SQLite and Litestream on a DigitalOcean or Linode VPS, deployed with
  Kamal. An external monitor watches it, and for J2 a scheduled function at another provider rebuilds
  through the provider's API.
- **B. File store, built by hand.** The same, with the socket-holding supervisor, drain and proxy of
  the fifth pass in place of Kamal. **Dominated by A.** Kamal supplies the proxy, TLS and deploy
  that B builds, and A's deploys dropped nothing when observed, below.
- **C. Fly, two machines, Fly Managed Postgres.**
- **D. DigitalOcean App Platform and DigitalOcean Managed PostgreSQL.**
- **E. Render web service and Render Postgres.**
- **F. Fly, two machines, and Neon Postgres always on.**
- **Out, each on one property:**
  - **Railway Postgres** fails E2: "they are considered unmanaged, meaning you have total control over
    their configuration and maintenance", so patching is ours.
  - **Supabase** fails J2 at any modest price: automatic failover is reported to be Enterprise-only,
    per search summaries.
  - **Turso** is unknown on J2: no failover behaviour was found.

**Observed: Kamal's deploy with a file store drops nothing**, 2026-09-30.

- **The setup.** kamal-proxy, taken from the `basecamp/kamal-proxy` image, and Litestream 0.5.17 in
  `node:24-bookworm`, Node 24.21.0, Linux arm64 under Docker. The server opened SQLite in WAL mode with
  `busy_timeout=5000`, `wal_autocheckpoint=0` and `synchronous=FULL`, following Litestream's tips. One
  Litestream process replicated to a local file replica. 20 clients alternated GET and POST for 40
  seconds.
- **The deploy.** Five times, in Kamal's order: a new server was started on the other port, `kamal-proxy
  deploy` switched to it once `/up` answered, and the old one was then stopped with SIGTERM. So two
  processes had the file open at each switch.
- **Result, three runs:** 0 failed requests out of about 232,000 to 238,000 per run, and no request
  slower than 82ms. Every acknowledged write was in the live file and in a Litestream restore, and
  `PRAGMA integrity_check` returned `ok` on both. Litestream logged one `database is locked` at start
  and recovered.
- **The same run with the file on a macOS folder mounted into the container** crashed the server with
  a bus error, and in one run acknowledged ids that were missing from the file. That folder is shared
  from macOS by Docker Desktop, where SQLite's shared-memory index does not work. A file store must
  sit on the machine's own disk, which [ADR-0042](../decisions/0042-the-stores-disk-is-inside-its-machine-not-reached-over-a-network.md) already requires in production. This belongs as a trap
  for [how is the store reached in local development?](how-is-the-store-reached-in-local-development.md).

So row 8, "A deploy never has two processes holding the store's file at once", was stricter than the
store needs. SQLite supports several processes on one machine: "All processes using a database must be
on the same host computer", with "only one writer at a time" (*opened by me,
[WAL](https://www.sqlite.org/wal.html)*). [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md)
rejects machines sharing the file, not processes. What must stay single is the replicator: "It is
_your_ responsibility to ensure you do not have multiple applications replicating concurrently"
(*opened by me, [tips](https://litestream.io/tips/)*). Litestream therefore runs as its own process
beside the app, never inside each app container.

*Measured: three runs of five deploys each, in one Linux container on a laptop. Not measured: a real
VPS, TLS, and Kamal itself driving the deploy rather than its proxy driven by hand.*

**Scored.** Prices are monthly, for about 10 GB of storage, in North America.

| | A. File store, Kamal | C. Fly + Fly Postgres | D. DO App Platform + DO Postgres | E. Render + Render Postgres | F. Fly + Neon |
| --- | --- | --- | --- | --- | --- |
| J1: deploys | pass, observed | pass with two machines ("at least two Machines to avoid downtime") | reported, not confirmed | pass, documented for one instance | pass with two machines |
| J1: patches | OS updates automatic; a kernel reboot drops the site for about a minute unless Livepatch covers it | Fly patches its hosts; database patching is "not there yet" | provider's, with brief disconnects | provider's, notified by email and schedulable | provider's, restarts of "a few seconds" about weekly |
| J2: dead host | only with our watchdog and fencing; otherwise a person restores | supplied: "All plans include high availability" | supplied with a standby, $60 for the database | supplied with a standby, "a few seconds" | supplied without a standby: compute replaced in "1-2 minutes" on node failure |
| J3: monitor | external, free tier | external, free tier | external, free tier | external, free tier | external, free tier |
| E1: pieces we build | Kamal config, Litestream, update settings, monitor, and a watchdog for J2 | Fly config, monitor | app spec, monitor | service config, monitor | Fly config, Neon project, monitor |
| E2: recurring attention | Kamal and Litestream upgrades; watchdog and fencing if built | database major upgrades, once "not there yet" is filled | database major upgrades, user-started | database major upgrades, up to an hour of downtime | little found |
| E3: to understand | Linux, Docker, SQLite WAL, Litestream, the watchdog | Fly, Postgres | DO, Postgres | Render, Postgres | Fly, Neon, Postgres |
| P1: price | about $10 to $11 | about $50 | about $70, or $20 without failover | about $124, not verified | about $31 |
| P2: terms | the VPS provider's only | Fly's rise on 1 October; Managed Postgres is young | no rise found | free database expiry cut from 90 to 30 days in 2024 | Neon cut prices in 2025; two vendors |

*Sources. Fly Managed Postgres: Basic "$38", "All plans include high availability, backups, and
connection pooling", and "Security patches and version upgrades" listed under "What's not there yet",
opened by me at [Fly Managed Postgres](https://docs.fly.io/mpg/). DigitalOcean's database: "High
availability clusters begin at $30.00 per month … with at least one $30.00 per month matching standby
node", opened by me at [pricing](https://docs.digitalocean.com/products/databases/postgresql/details/pricing/).
Kamal's deploy order and "without downtime", opened by me at
[deploy](https://kamal-deploy.org/docs/commands/deploy/). The rest is an agent's reading on
2026-09-30. Render's database prices are search summaries only.*

**What the table yields.**

- **No setup reaches all three of the maintainer's words.**
  - **Price:** the file store, at about a fifth of the cheapest managed setup that recovers without
    a person.
  - **Just works, for a dead host:** every managed setup, which supplies J2. The file store needs a
    watchdog with fencing, which is the most delicate thing any setup here asks us to build.
  - **Easy:** the managed setups, with fewer pieces and less to understand.
- **Where the file store closes the gap, and where it does not.** Kamal closes J1 for deploys, as
  observed. It does not close J2, and it leaves reboots after kernel patches as brief planned outages.
- **Among the managed setups, F is cheapest at about $31**, recovering in minutes without a standby.
  C costs about $50 with a standby, but its database patching is unfinished.

The maintainer said on 2026-09-30 that a system that stays up while they sleep "is obviously much more
reliable", but that price is "so appealing that it's not enough by itself to decide". So the choice
left is the maintainer's weighing of J2, about $20 a month (A against F), and the pieces A asks them to
build. It is a stated preference, and it enters as a row citing them.

### Ninth pass 2026-09-30: variants of the file-store setup

**Setup A was put together to show that a file store could meet the properties, not tuned part by
part.** On 2026-09-30 the maintainer asked for its variants to be scored, and gave a price target.

**Rows added before research.**

- **P0. The whole setup costs about $10 a month or less.** Settled in [ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md): about $10 is a
  preference and $20 is a ceiling, in US dollars, for hosting only.
- **L1. The hosted setup can be run on the maintainer's Mac, the same way it runs deployed.** Where two
  setups are otherwise equal, the one that is much easier to simulate locally wins. The maintainer
  said so on 2026-09-30, for the developer's experience. Rests on
  [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md):
  the production-like run "runs the production artifacts in the production topology", and it may
  differ only where a record says why. This zooms into row 11. The eighth pass found one trap
  already: a SQLite file on a macOS folder mounted into Docker crashes.
- **The challenge to row 30.**
  - **The promise.** [The player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md)
    forbids asking the player to act on the network. It does not forbid a request failing. The
    network is "our problem to handle rather than theirs to manage".
  - **What the client already absorbs.** On a train, the client must retry silently through failures
    far worse than a 502 during a deploy.
  - **So** a deploy that fails a request may be invisible to the player, provided the client's own
    retries absorb it.
  - **What still matters is how long.** A deploy that holds requests for 15 seconds, as Fly's did, is
    a wait at the start of a session. A deploy that fails them fast is retried within a second.
  - **What the pass does with it.** It asks whether row 30 still separates the variants once the
    client's retries are counted, and it scores the length of any hold, not just whether a request
    failed.

**Variants.**

| | Variant |
| --- | --- |
| A1 | DigitalOcean $6, Kamal, Litestream copying to another provider's object storage, Livepatch, an external monitor, DigitalOcean's monitoring, and a scheduled function elsewhere as the watchdog |
| A2 | The same on Linode $5 |
| A3 | A1 with Dokku, or Docker Compose and Caddy, in place of Kamal |
| A4 | Fly, one machine, SQLite with Litestream copying to another provider |
| A5 | RackNerd and Kamal, restoring by hand, since there is no API to order a machine |

**Research, 2026-09-30.** Agents read vendor pages. "Opened by me" marks what the session that wrote
this pass fetched itself.

- **Where the copy goes.**
  - Backblaze B2: "First 10GB storage is always free", and "Class A, B, and C API calls are free for
    pay-as-you-go customers". *Opened by me, [pricing](https://www.backblaze.com/cloud-storage/pricing).*
    Litestream detects B2 endpoints itself, per its [B2 guide](https://litestream.io/guides/backblaze/).
  - Cloudflare R2: its free tier includes "1 million requests / month" of Class A. *Opened by me,
    [pricing](https://developers.cloudflare.com/r2/pricing/).* Litestream's default 1-second sync makes
    "approximately 2.6 million PUT requests monthly" under constant writes. *Opened by me,
    [config](https://litestream.io/reference/config/).* So R2 would cost money, or need a longer sync
    interval. A longer interval widens the loss on a dead host.
  - **B2 is the copy's home that costs nothing at this size**, and it sits with a provider other than
    the machine's, so losing the machine's account does not lose the copy.
- **Kernel patches.** Livepatch "is available free for up to 5 machines, for personal use". But it
  "is not a replacement for rebooting". Whether DigitalOcean's Ubuntu 24.04 kernel is covered is
  unknown. On Linode, a 2018 answer, seen in search only, says its own kernel was "not eligible for
  livepatch updates" until Ubuntu's kernel is booted instead.
- **The watchdog.** Cloudflare Workers' free plan allows 5 cron triggers. Secrets are stored
  encrypted. No page forbids calling an outside API. Community threads in 2026 report that
  every-minute triggers on free accounts do not fire, so every five minutes is the safe assumption.
  Healthchecks.io's free plan monitors 20 jobs, which covers alerting when Litestream's copy goes
  stale.
- **Deploy tools.**
  - **Kamal** can skip an outside registry: "If the registry server starts with `localhost`, Kamal
    will start a local Docker registry on that port and push the app image to it" (*opened by me,
    [registry](https://kamal-deploy.org/docs/configuration/docker-registry/)*). Litestream runs as an
    accessory, "not updated when you deploy".
  - **Dokku** builds on the server when you `git push`, and needs "1GB of system memory, or add swap".
    By default it waits 10 seconds after starting a container and does not check its health. It has
    no sidecar, so Litestream becomes a Procfile process. Renewing certificates needs a cron job added
    by hand.
  - **Docker Compose with `docker-rollout`** needs a health check, a proxy that routes by service name
    (no page confirms Caddy does), and a service without `ports` or `container_name`.
  - **Kamal dominates both on J1 and E1**, and A3 leaves the field.
- **L1, running it on the Mac.**
  - A Multipass VM takes the same cloud-init user data as the VPS: `--cloud-init` accepts "Path or URL
    to a user-data cloud-init configuration". Kamal deploys to it over SSH as it would to the VPS, per
    [a walkthrough](https://alexpeattie.com/blog/testing-kamal-locally-with-multipass/). The VM's own
    disk avoids the trap the eighth pass found. Reports of Multipass failing on some Apple silicon
    machines are search results only.
  - **Two gaps.** Let's Encrypt cannot issue for a local VM, so a local certificate is loaded in its
    place. And the Mac runs arm64 while DigitalOcean and Linode run amd64, so the local image is built
    for a different architecture. Node's built-in `node:sqlite` has no native module to compile per
    architecture, which keeps that gap small, but the driver is still open at
    [which driver reads and writes the store?](which-driver-reads-and-writes-the-store.md).
  - **Fly has no local emulator.** Its docs say to "Build the image locally with `docker build` and
    test it with `docker run`". The proxy, TLS termination, volume pinning and Firecracker cannot be
    run locally.
  - Litestream's copy can target a separate B2 bucket from the Mac. MinIO is reported to be in
    maintenance mode.

**The row 30 challenge, answered.** Once the client's retries are counted, a request that fails fast is
invisible. What still separates the variants is how long a request is held: Kamal's deploys held none
longer than 82ms, and Fly's held some for about 15 seconds. That is a wait on opening the app during a
deploy, and deploys are rare, so row 30 now weighs little.

**Scored.**

| | A1: DigitalOcean + Kamal | A2: Linode + Kamal | A4: Fly, one machine | A5: RackNerd + Kamal |
| --- | --- | --- | --- | --- |
| P0/P1: a month | about $6 | about $5 | about $2.50 to $4.50 | about $1.83 |
| J1: deploys | pass, observed | pass | holds of about 15s, observed | pass |
| J1: host maintenance | live migration | live migration, or power off and on with notice | volume pinned; Fly migrates on its own schedule | unknown |
| J1: kernel patches | reboot at a set hour, fewer if Livepatch covers the kernel | same; Livepatch doubtful | Fly patches; applied on our next deploy | reboot at a set hour |
| J2: dead host | watchdog on a Worker calling the API, built by us; loss about 1s | same | same, through Fly's API | by hand: no API to order a machine |
| J3: alerts | external monitor, Healthchecks, and DigitalOcean's memory and disk alerts | external monitor and Healthchecks | external monitor and Healthchecks | external monitor and Healthchecks |
| E1: pieces we build | cloud-init, Kamal config, Litestream, monitors, watchdog | same | fly config, Litestream, monitors, watchdog | same as A1, no watchdog |
| E3: to understand | Linux, Docker, Kamal, SQLite WAL, Litestream | same | Fly, SQLite WAL, Litestream | same as A1 |
| L1: on the Mac | Multipass with the same cloud-init; local certificate and arm64 differ | same | `docker run` only | same as A1 |
| P2: terms | no rise found | no rise found | a rise on 1 October | "lifetime recurring"; terms disclaim data integrity |

**What the table yields.**

- **A1 fits all three of the maintainer's words**, within the price target at about $6.
  - It just works: deploys observed dropping nothing, maintenance absorbed by the provider, and alerts
    reaching the maintainer.
  - It is easy enough: its pieces are few and documented, and the whole setup runs on the Mac.
  - Its one gap is J2. Recovering a dead host without a person means building the watchdog, and that
    can come after launch. Until then, a dead host is a scripted restore that a person starts.
- **A2 ties A1 on nearly everything and is $1 cheaper.** It loses on J3, having no memory or
  disk-space alert of its own, and on Livepatch coverage. The maintainer called $1 insignificant.
- **A4 is the easiest to operate and the cheapest after A5.** It is the worst on L1, which the
  maintainer weighted for the developer's experience. It also pins the volume to a host and raises its
  price tomorrow.
- **A5 is cheapest.** It is the only variant where J2 can never be removed from the maintainer's hands,
  and its terms disclaim data integrity.

### Tenth pass 2026-09-30: pressure-testing A1

*The maintainer asked what could go wrong with the Droplet itself, and with Kamal. Agents read vendor
docs and GitHub issues. Their quotes came through a page summariser, so re-open any page before a
record relies on it. The memory figures below were measured here.*

**Measured: memory during deploys**, 2026-09-30.

- **The setup.** A minimal server using `node:sqlite` in WAL mode, kamal-proxy and Litestream 0.5.17 ran
  in `node:24-bookworm`, Node 24.21.0, Linux arm64 under Docker. 20 clients loaded it for 40 seconds.
  It went through five Kamal-style overlapping deploys, with the health check at `/api/up`.
  Resident memory was sampled every half second from `/proc`.
- **Result:** 254,329 requests, none failed.

  | Process | Median | Max |
  | --- | --- | --- |
  | App, both processes during overlap | 80 MB | 143 MB |
  | kamal-proxy | 20 MB | 20 MB |
  | Litestream | 34 MB | 34 MB |
  | All three together | | 197 MB |

- *One run. Not measured: Docker's own daemons, Ubuntu itself, DigitalOcean's agent, amd64, and the
  real Fastify server, whose macOS figure was 113 MB idle in the fourth pass.*

**The Droplet.**

- **Memory is enough at launch.**
  - Docker's daemons are reported at about 100 to 170 MB idle. That comes from one blog, measured on
    Ubuntu 26.04, and is weak.
  - Ubuntu's stated minimum for a cloud image is 1 GB.
  - So the total is likely under half the machine. Only the 197 MB is measured.
- **No swap, reportedly.** Community sources, weak, say Droplets ship without swap. When memory then
  runs out, the kernel's out-of-memory killer ends a process, possibly `dockerd`, rather than the
  machine slowing down. Fix: a small swap file and a memory limit on the app container, both set in
  cloud-init. DigitalOcean's old tutorials warned against swap on SSD. Those pages are from 2012 to
  2019 and were not opened.
- **CPU only spikes on deploy if the image is built on the Droplet.**
  - Kamal builds on the laptop or in CI, and deploys held no request longer than 82ms in the eighth
    pass.
  - The Droplet must not be Kamal's remote builder. Kamal issue
    [#1794](https://github.com/basecamp/kamal/issues/1794), seen in search only, reports BuildKit data
    reaching 40 to 50 GB after weeks of deploys.
- **Growth.**
  - A CPU-heavy generator on the one shared vCPU would compete with requests, against "The interactive
    path over batch throughput" in [../problem.md](../problem.md).
  - It can run away from the request path at no cost, on the laptop or in CI, since generation "can
    be as slow as it needs to be". It can also run on a second $6 Droplet.
  - A resize that changes only CPU and RAM keeps the disk, so it can be reversed. It needs the Droplet
    powered off, for about a minute per GB of disk used.
- **Found, each with its fix:**
  - **The disk fills from logs.** Docker's `json-file` logs grow without limit: max-size "Defaults to
    -1 (unlimited)". A full disk fails the store's writes. Fix: `max-size` and `max-file` in
    `daemon.json`.
  - **Docker bypasses the machine's own firewall.** "traffic to and from that container gets diverted
    before it goes through the ufw firewall settings". Fix: DigitalOcean's Cloud Firewall, which is
    network-based and separate from the machine.
  - **Docker is not patched automatically.** "Just adding another package repository to an Ubuntu
    system WILL NOT make `unattended-upgrades` consider it for updates!" Fix: add Docker's origin to
    the allowed list.
  - **The WAL can grow without limit.** With `wal_autocheckpoint=0`, which the eighth pass's spike
    used from Litestream's advice for heavy load, the file grows without bound if Litestream stops.
    Fix: keep SQLite's default at this load, and alert on disk use and on a stale copy.
    *Reasoned from Litestream's docs.*
  - **A failed card can stop and then delete the machine.** "We power down the account's resources",
    then "we may permanently delete the account's resources", and "DigitalOcean does not publish fixed
    timelines for these stages". The copy in B2 is what survives it.
  - **No ARM Droplets were found**, so images are built for amd64 on an arm64 Mac. Weak.

**Kamal's costs, and how much each matters.**

| Cost | Weight |
| --- | --- |
| Docker on the server: its memory, the three Docker findings above, and an OS to own. Fly has none of this. | The largest. Each finding is fixed once in setup |
| Upgrading Kamal can require a newer kamal-proxy. v2.11.0: "This version requires kamal-proxy v0.9.2 or higher". `kamal proxy reboot` causes "a small outage", and rolling does not help on one server | Low: seconds, a few times a year, and absorbed by the client's retries |
| Accessories "do not have zero-downtime deployments", so replication pauses while Litestream restarts | Low: it catches up afterwards |
| amd64 images built on an arm64 Mac | Moderate for the developer. Emulated build speed is unmeasured. Building in CI belongs to [what deploys the code?](what-deploys-the-code.md) |
| SSH as root by default. A non-root user in the docker group is still effectively root | Low: key-only SSH and the Cloud Firewall |
| The local registry is new, since v2.8.0 in October 2025. Two bugs are closed and one Apple silicon to amd64 issue, [#1690](https://github.com/basecamp/kamal/issues/1690), is of unknown status | Moderate. GitHub's registry is the fallback |
| Rough edges: disk filling with images ([#1655](https://github.com/basecamp/kamal/issues/1655)), unhelpful health-check errors ([#1667](https://github.com/basecamp/kamal/issues/1667)), and flaky health checks in 2024 ([kamal-proxy #71](https://github.com/basecamp/kamal-proxy/issues/71)) | Low to moderate |

Its health-check path can be set, as in `healthcheck: {path: ...}`, so `/api/up` keeps
[ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md). No cost
here disqualifies A1.

**The Droplet traps above are in the questions that will use them**: the logs and the firewall in
[how is the server reached and hardened?](how-is-the-server-reached-and-hardened.md), the WAL in
[what durability settings does the store run with?](what-durability-settings-does-the-store-run-with.md),
and billing in [../constraints.md](../constraints.md), "Hosting — DigitalOcean has no spending cap",
which [ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md) to
[ADR-0048](../decisions/0048-production-runs-in-its-own-digitalocean-team-apart-from-experiments.md)
rest on.
The Docker traps do not apply, since
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) installs no
Docker.

### Eleventh pass 2026-09-30: running the host without Kamal

*The maintainer asked for alternatives to Kamal for running the host, with DigitalOcean held fixed.*

**What the host must do, whatever runs it:**

- build and ship a release;
- switch traffic with nothing dropped;
- terminate TLS and renew certificates;
- restart what crashes and start it on boot;
- deliver secrets;
- roll back;
- rotate logs;
- patch everything beneath the app;
- let a replacement machine be built from nothing;
- reproduce all of it on the Mac.

**Docker's usual reasons barely apply here.** A container's usual reasons are freezing native
dependencies and building for the target's CPU. This server is plain JavaScript on Node, using Node's
built-in `node:sqlite`, so neither applies while no production dependency has a native addon.

**Surveyed and set aside**, per an agent's reading of each project on 2026-09-30:

- **Kamal-like tools** (Uncloud, Haloy, Dewy, `docker-rollout`) all keep Docker on the server. They
  are younger than Kamal. Uncloud is before 1.0 and has breaking releases.
- **Control panels** (Dokploy, Coolify, CapRover) state minimums of 1 to 2 GB for themselves.
- **PM2's reload** waits for a process to listen or say it is ready, not for a health check to pass.
  It adds a second supervisor beside systemd.
- **Podman with Quadlet** restarts the unit on update, so old and new never overlap.
- **NixOS** has the most to learn, and no zero-downtime deploy of its own.
- **Release tools** for this pattern are stale or in another language. Shipit's last commit was in
  2020, and Mina's in 2023.

**Candidate N: systemd, Caddy and a deploy script, with no Docker.** Two systemd instances of the app
sit on two ports behind Caddy, and Caddy checks `/api/up` on each. A deploy:

1. starts the new instance on the idle port;
2. waits for its `/api/up` to answer;
3. signals the old instance, whose `/api/up` then returns 503, and waits a second while Caddy stops
   routing to it;
4. stops the old instance, which finishes what it was serving.

**Observed, 2026-09-30.**

- **The setup.** Caddy 2.11.4 with `lb_policy first`, `health_uri /api/up`, `health_interval 250ms`,
  `health_fails 1`, `lb_try_duration 5s` and upstream keep-alive off. Litestream 0.5.17 ran as one
  process. The runtime was `node:24-bookworm`, Linux arm64 under Docker. 20 clients ran for 40 seconds
  through five deploys.
- **A first version stopped the old instance without draining it first.** It failed 39 POSTs with 502
  in one run. Requests queued on the old instance's socket were cut after Caddy had sent them, and
  Caddy does not retry a POST.
- **The four-step order above:** 0 failed requests in each of three runs, about 221,000 each. No request
  took longer than 49ms. Every acknowledged write was in the live file and in a Litestream restore,
  and both passed `integrity_check`. Caddy's resident memory was about 56 MB.
- *Three runs. Not measured: amd64, a real Droplet, TLS, and systemd itself starting and stopping the
  instances.*

**What becomes ours without Kamal and Docker, and how each is set so it keeps working:**

| What Docker or Kamal did | Without them | Set once in | Recurring work |
| --- | --- | --- | --- |
| An immutable image per version | A release directory per version, built on the laptop or in CI with its `node_modules`. The pnpm layout travels in the archive with its symlinks, per row 10. The last few are kept | the deploy script | none |
| The runtime pinned in the image | Node on the host, from NodeSource's repository for the major line [ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md) names, patched by `unattended-upgrades` once its origin is added. The alternative is an exact Node binary inside each release, patched only by deploying | cloud-init | none if patched by apt; a deploy per Node patch if pinned |
| Isolation | systemd sandboxing: `DynamicUser`, `ProtectSystem=strict`, `ReadWritePaths` limited to the store's directory, `NoNewPrivileges`, `PrivateTmp` | the unit file | none |
| Memory limits | `MemoryHigh` and `MemoryMax` on each unit, plus a swap file | the unit file and cloud-init | none |
| Restart on crash | `Restart=always`, with a start limit | the unit file | none |
| Start on boot, in order | Litestream's unit starts first, restoring on a fresh machine with `-if-db-not-exists -if-replica-exists`, and the app's units follow it | the unit files | none |
| A switch that drops nothing | The deploy script and Caddy's health checks, observed above. The app returns 503 from `/api/up` on a signal, about three lines of code | the script and the app | none |
| Aborting an unhealthy deploy | If the new instance never answers, the script stops it and the old one keeps serving, safe by construction | the script | none |
| Deploy lock | `flock` on the server | the script | none |
| TLS | Caddy, automatic, with its certificate state on disk | the Caddyfile | none |
| Secrets | A root-only environment file, or systemd credentials | the script | when a secret rotates |
| Logs | journald, capped by `SystemMaxUse`. It replaces Docker's unlimited logs | cloud-init | none |
| Reading logs | `journalctl -u 'app@*'` over SSH, in place of `kamal app logs` | none | none |
| Patching Caddy | Its apt repository, added to `unattended-upgrades` | cloud-init | none |
| Patching Litestream | Pinned `.deb` from GitHub. It has no apt repository, so it is upgraded by hand or by the script | the script | a few times a year |
| Kernel patches | Livepatch, plus a set reboot hour for what it cannot patch | cloud-init | none |
| Firewall | ufw works, since nothing bypasses it, plus the Cloud Firewall | cloud-init and the account | none |
| Knowing a unit failed | `OnFailure=` pings Healthchecks.io, beside the external monitor and DigitalOcean's alerts | the unit files | none |
| Rebuilding the machine | The same cloud-init, then the script restores from B2 and deploys. No Docker install, no registry | cloud-init and the script | none |
| Reproducing on the Mac | The same cloud-init and script in a Multipass VM. The same JavaScript runs on arm64 and amd64 | none | none |

**What N costs that Kamal does not:**

- **We own the deploy script.** It is small, but its bugs are ours. It needs tests and a run in the
  Multipass VM before every change. Whether it is written in shell or in TypeScript is for
  [what deploys the code?](what-deploys-the-code.md).
- **No immutable image.** What sits beneath the app changes with patches. Pinned versions and release
  directories narrow this without removing it.
- **It relies on no native addon in production.** A future dependency with one would bring back
  building per architecture. A check that fails on one would make that loud.
- **No community recipe** for this exact arrangement, where Kamal has one.

**Where N and Kamal stand, reasoned before the Droplet measurement:**

| | Kamal | N |
| --- | --- | --- |
| Deploys that drop nothing | observed | observed |
| Memory beyond the app | Docker's daemons, reported at 100 to 170 MB, plus 20 MB | about 56 MB |
| Building | an amd64 image on an arm64 Mac, and a registry | an archive of JavaScript |
| Reproducing on the Mac | with a CPU architecture gap | the same script, no gap for the app |
| Recurring work | Kamal and proxy upgrades | the script, and Litestream upgrades |
| Known traps | Docker's logs, firewall bypass and patch origin | none of those three |

**N and the deploy question.** N was recorded as
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md).
[What deploys the code?](what-deploys-the-code.md) takes it as a Given and answers only the pipeline.

### Twelfth pass 2026-09-30: N and Kamal measured on DigitalOcean

**The setup.**

- **Machines.** Two `s-1vcpu-1gb` Droplets in `tor1`, Ubuntu 24.04, one for each stack. A third,
  `s-2vcpu-4gb`, played the laptop: it ran Kamal 2.12.0 with Docker 29.8.1, and it generated the load
  over DigitalOcean's private network so the internet's noise stayed out of the counts.
- **The app.** The same minimal `node:sqlite` server on Node 24.21.0, with Litestream 0.5.17 copying to
  a file on the Droplet. HTTP only.
- **N.** Caddy 2.11.4 from its apt repository. A systemd template unit `puzzles@.service` with
  `MemoryMax`, `ProtectSystem=strict` and `Restart=always`, and the four-step deploy script run on the
  Droplet.
- **Kamal.** kamal-proxy, the app in `node:24-slim`, Litestream as an accessory, and the local registry.
- **The load and the deploys.** 20 clients, five deploys each. Resident memory was sampled every half
  second. Every acknowledged write was then checked on the Droplet, and each copy was restored.
- Everything was deleted afterwards: the Droplets and the uploaded SSH key.

**Before anything was installed, on both Droplets:**

- 961 MB of memory in total, about 320 MB used, about 640 MB available.
- **No swap.** `swapon --show` printed nothing. This settles the tenth pass's weak claim.
- Kernel `6.8.0-142-generic`. `pro status` reports Livepatch as available.
- A 24 GB disk and one vCPU.

**Results.**

| | N: systemd + Caddy | Kamal |
| --- | --- | --- |
| Failed requests across 5 deploys | 0 of 20,254 | 0 of 52,628 |
| Acknowledged writes missing | 0 | 0 |
| Slowest request | 219ms | 964ms |
| Each deploy | 2.7 to 2.9s, run on the Droplet | 13 to 19s, including building, pushing and pulling |
| Memory used, stack idle | 360 MB | 424 MB |
| Memory used, peak during deploys | 373 MB | 470 MB |
| Beyond the app and Litestream | Caddy 47 to 51 MB | dockerd 51 to 70, containerd 32 to 35, docker-proxy 18 and kamal-proxy 14 to 31 MB |
| App, median and peak | 78 and 149 MB | 76 and 152 MB |
| Litestream restore | complete, `integrity_check` ok | complete, `integrity_check` ok |
| Disk used afterwards | 2.3 GB | 3.1 GB, with 777 MB of images |

**What this settles.**

- **Both stacks meet J1 on a real Droplet.** Neither dropped a request or lost a write during deploys.
- **N uses about 70 to 100 MB less memory** and 0.8 GB less disk.
- **N's deploys are about five times faster**, and its slowest request under deploy is a quarter of
  Kamal's.
- **The eleventh pass's prediction holds.** The measured Docker overhead, about 120 MB, sits inside the
  range reported earlier.
- **1 GB is enough for either** at launch. The peak used was under half the machine. Without swap, a
  memory limit on the app, such as N's `MemoryMax`, is what keeps a leak from reaching the rest.

*Measured: one run of five deploys per stack, on 2026-09-30. Not measured: TLS, the real Fastify
server, and deploys driven from a laptop over the internet.*

**Steps confirmed on the way, for the runbook:**

- **Node.** The official tarball, unpacked to `/opt/node-<version>-linux-x64`, with `/opt/node` linked
  to it.
- **Caddy.** From its Cloudsmith apt repository, which needs `debian-keyring`,
  `debian-archive-keyring` and `apt-transport-https`.
- **Litestream.** The `.deb` from its GitHub release (`litestream-<version>-linux-x86_64.deb`), which
  installs `litestream.service` reading `/etc/litestream.yml`.
- **The app.** A system user `puzzles`, owning `/var/lib/puzzles`.
- **First deploy, then Litestream.** The first deploy creates the store, and only then is
  `litestream.service` enabled.
- **Listen address.** The app listens on `127.0.0.1` under N. Inside a container it must listen on
  `0.0.0.0`, or kamal-proxy's health check times out, as the first `kamal setup` here did.
- **Process name.** Node 24 names its process `MainThread`, not `node`. A memory monitor matching on
  `node` misses it.
- **The token.** It needs no `account:read`. Creating a tagged Droplet needs `tag:create`, so the
  Droplets here were left untagged.

### The twelfth pass's N scripts, as run

*Kept here as evidence for the runbook, per the maintainer on 2026-09-30. They are spike code, not
the product's. They ran once, on Ubuntu 24.04 (`ubuntu-24-04-x64`), and their package steps assume
it until [which OS does the Droplet run?](which-os-does-the-droplet-run.md) is answered.
`server.mjs` is the minimal spike server, not the Fastify server in `src/server/`.*

**Faults known before any reuse:**

- **`deploy.sh` never enables the new instance at boot, or disables the old.** After a reboot, systemd
  starts whichever instance was enabled first, which may be the older release. Enable the new
  instance and disable the old one at each switch.
- **`deploy.sh` copies a directory already on the Droplet.** Getting a release there is for
  [what deploys the code?](what-deploys-the-code.md).
- **The Caddyfile serves plain HTTP on port 80.** TLS was not part of the spike.
- **Litestream replicated to a file on the same disk.** A real copy leaves the machine.
- **Node came from the official tarball.** Whether it comes from a package manager instead is
  [what shape is the deployable?](what-shape-is-the-deployable.md).

`setup.sh` ran as root, with the other files copied to `/root/n/`:

```sh
#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
NV=$(curl -s https://nodejs.org/dist/index.json | python3 -c 'import sys,json;print([r["version"] for r in json.load(sys.stdin) if r["version"].startswith("v24.")][0])')
curl -sL https://nodejs.org/dist/$NV/node-$NV-linux-x64.tar.xz | tar xJ -C /opt && ln -sfn /opt/node-$NV-linux-x64 /opt/node
apt-get -qq install -y debian-keyring debian-archive-keyring apt-transport-https curl >/dev/null
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
apt-get -qq update >/dev/null && apt-get -qq install -y caddy >/dev/null
curl -sL -o /tmp/ls.deb https://github.com/benbjohnson/litestream/releases/download/v0.5.17/litestream-0.5.17-linux-x86_64.deb && dpkg -i /tmp/ls.deb >/dev/null
useradd --system --no-create-home puzzles || true
mkdir -p /var/lib/puzzles /var/lib/puzzles-replica /srv/puzzles/releases /tmp/rel && chown puzzles /var/lib/puzzles
cp /root/n/Caddyfile /etc/caddy/Caddyfile && cp /root/n/litestream.yml /etc/litestream.yml && cp /root/n/puzzles@.service /etc/systemd/system/
cp /root/n/server.mjs /tmp/rel/ && cp /root/n/deploy.sh /usr/local/bin/deploy && chmod +x /usr/local/bin/deploy
systemctl daemon-reload && systemctl restart caddy
# first deploy creates the DB, then litestream can replicate it
deploy /tmp/rel && systemctl enable --now litestream
/opt/node/bin/node --version; caddy version; litestream version
```

`/etc/systemd/system/puzzles@.service`, where the instance name is the port:

```ini
[Unit]
Description=puzzles app on port %i
After=network.target litestream.service
[Service]
User=puzzles
Environment=PORT=%i DB=/var/lib/puzzles/store.db
ExecStart=/opt/node/bin/node /srv/puzzles/current/server.mjs
Restart=always
MemoryMax=300M
TimeoutStopSec=15
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/var/lib/puzzles
PrivateTmp=true
[Install]
WantedBy=multi-user.target
```

`/etc/caddy/Caddyfile`. These are the health-check settings that measured no failed request:

```
:80 {
  reverse_proxy 127.0.0.1:3001 127.0.0.1:3002 {
    lb_policy first
    lb_try_duration 5s
    lb_try_interval 100ms
    health_uri /api/up
    health_interval 250ms
    health_fails 1
    fail_duration 2s
    transport http {
      keepalive off
    }
  }
}
```

`/etc/litestream.yml`:

```yaml
dbs:
  - path: /var/lib/puzzles/store.db
    replica:
      url: file:///var/lib/puzzles-replica
```

`/usr/local/bin/deploy`, in the four-step order the eleventh pass describes:

```sh
#!/bin/bash
# usage: deploy.sh <release-dir-with-server.mjs>
set -euo pipefail
exec 9>/run/puzzles-deploy.lock; flock -n 9 || { echo "another deploy is running"; exit 1; }
SRC=$1; ID=$(date +%s%N); REL=/srv/puzzles/releases/$ID
mkdir -p $REL && cp -a $SRC/. $REL/
if systemctl is-active -q puzzles@3001; then OLD=3001; NEW=3002; elif systemctl is-active -q puzzles@3002; then OLD=3002; NEW=3001; else OLD=; NEW=3001; fi
ln -sfn $REL /srv/puzzles/current
systemctl start puzzles@$NEW
for i in $(seq 1 100); do curl -sf http://127.0.0.1:$NEW/api/up >/dev/null && break; sleep 0.1; done
curl -sf http://127.0.0.1:$NEW/api/up >/dev/null || { echo "new instance unhealthy; keeping $OLD"; systemctl stop puzzles@$NEW; exit 1; }
if [ -n "$OLD" ]; then systemctl kill -s SIGUSR2 puzzles@$OLD; sleep 1; systemctl stop puzzles@$OLD; fi
ls -1dt /srv/puzzles/releases/* | tail -n +4 | xargs -r rm -rf
echo "deployed $ID on $NEW"
```

The spike's `server.mjs`. The draining signal is the part the real server needs: on `SIGUSR2`,
`/api/up` answers 503.

```js
import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
const PORT = Number(process.env.PORT);
const db = new DatabaseSync(process.env.DB, { timeout: 5000 });
db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS w(id INTEGER PRIMARY KEY, v TEXT)");
const ins = db.prepare('INSERT INTO w(v) VALUES (?) RETURNING id'); const cnt = db.prepare('SELECT count(*) c FROM w');
let draining = false; process.on('SIGUSR2', () => { draining = true; });
const server = http.createServer((req, res) => {
  if (req.url === '/api/up') { res.writeHead(draining ? 503 : 200); return res.end(draining ? 'draining' : 'ok'); }
  if (req.url === '/api/ids') { res.writeHead(200); return res.end(JSON.stringify(db.prepare('SELECT id FROM w').all().map(r => r.id))); }
  if (req.method === 'GET') { res.writeHead(200, {'content-type':'application/json'}); return res.end(JSON.stringify(cnt.get())); }
  let b = ''; req.on('data', c => b += c); req.on('end', () => { res.writeHead(200, {'content-type':'application/json'}); res.end(JSON.stringify(ins.get(b))); });
});
server.listen(PORT, '127.0.0.1', () => console.log(`up ${PORT}`));
const stop = () => { server.close(() => { db.close(); process.exit(0); }); setTimeout(() => server.closeAllConnections(), 5000).unref(); };
process.on('SIGTERM', stop); process.on('SIGINT', stop);
```

### Open at the end of the twelfth pass

*The next pass replaces this entry rather than adding beneath it. This is the list of records and
tasks still owed, in order, kept here so that none is lost if a session ends partway.*

1. **Settled.**
   - [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md): the server runs on a
     DigitalOcean Droplet.
   - [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md): it runs
     as systemd services, without containers.
2. **Settled since: how the hosting account is protected from unexpected charges.**
   [ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md),
   [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md) and
   [ADR-0048](../decisions/0048-production-runs-in-its-own-digitalocean-team-apart-from-experiments.md),
   with the account's settings in
   [../runbooks/set-up-the-hosting-account.md](../runbooks/set-up-the-hosting-account.md).
3. **Next: [which OS does the Droplet run?](which-os-does-the-droplet-run.md)** The spikes used Ubuntu
   24.04 and nothing chose it. The records below rest on it.
4. **Record: Caddy is the front.** It terminates TLS and routes between the app's instances, rather
   than nginx or another proxy. It is scored from the eleventh and twelfth passes. It does not settle
   who serves the client's files, which is
   [what serves the client's files in production?](what-serves-the-clients-files-in-production.md).
5. **Discuss whether the deploy switch needs a record.** The switch is two instances, Caddy's health
   checks, and the order enable, drain, stop. The maintainer asked whether it is an implementation
   detail rather than an architectural decision, so settle that before drafting anything. It draws on
   [how does a deploy avoid disturbing the store?](how-does-a-deploy-avoid-disturbing-the-store.md),
   which answers the store's part at M3. Wherever the switch is settled, it carries
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)'s Risk:
   the script enables the new instance at boot and disables the old.
6. **Coordinate with [what deploys the code?](what-deploys-the-code.md).** It takes the systemd record,
   and whatever item 5 settles, as Givens. It answers only the pipeline: the trigger, whether checks
   gate a deploy, and where a release is built.
7. **Amend [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md)** with the
   eighth and ninth passes' scoring. The file store stays, because no managed-database setup fits
   the price target.
8. **A runbook** of every setup step learned here, including the twelfth pass's scripts, with the
   granular considerations behind each, per the maintainer. It goes in [../runbooks/](../runbooks/),
   beside the account's setup, as "Where a new fact goes" in [../README.md](../README.md) now says.
9. **Work that belongs to other steps**, and is not filed as issues from here:
   - the check that fails on a native addon in production dependencies, named in
     [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)'s
     Enforced by, guards a release built on the arm64 Mac and shipped to the amd64 Droplet. Whether
     it is needed depends on where releases are built, which is
     [what deploys the code?](what-deploys-the-code.md): a release built on Linux x64 compiles any
     addon for the right CPU. The driver, at
     [which driver reads and writes the store?](which-driver-reads-and-writes-the-store.md), is the
     likeliest source of an addon. The check is drafted as an issue once the build location is known;
   - tests for the deploy script are written with the script itself, when M1 slice 4 is built. No
     deploy script exists for the product yet; the twelfth pass's is spike code;
   - the server's draining contract and the re-measurement with the real server belong to item 5.
10. **Caveats for the next decisions.**
    - The measurements on Droplets and in Linux containers ran on Node 24, while
      [ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md) names the 26 line.
      Only the fourth pass's memory measurement, on macOS, ran on Node 26.
    - The Droplet facts and the scripts are Ubuntu 24.04's, so another OS means measuring again.
    - TLS, certificate issuance and serving the client's files were never measured.
11. **A possible standard.** The maintainer's ideal of "it just works, it's so easy, great price",
    scored over complete setups, may be how every operations choice is judged. Whether it becomes a
    standard in [../standards/](../standards/) is for the maintainer to decide.
12. **Delete this file** once items 4 to 8 have landed and nothing in it is left unsettled.
