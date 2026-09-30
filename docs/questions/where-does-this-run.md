---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Where does this run?

## Why it matters

This is where the client and its API both live, and moving either later moves both. It is also
where the running cost lands and where the operational surface is set — a managed platform supplies
most of what [how is the server operated?](how-is-the-server-operated.md) covers, and a bare machine
supplies none of it.

Two things constrain the answer from outside. The client and the API answer on one origin, per
[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md), so a platform that cannot present both halves on one hostname is not a
candidate. And whatever the browser resolves before it reaches the platform
is its own question — see
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md).

## What would settle it

**Scoring every candidate against the numbered properties below, in passes, until one candidate
remains**, or until a pass that zooms into the properties and extends the list changes no verdict.
That is the extend-and-zoom loop in the `make-next-decision` skill. The records a candidate must
satisfy are listed with the properties, and each pass is written into **Findings** with its date.

Two kinds of evidence settle a cell. Reading settles what a vendor documents: disk type, deploy
behaviour, routing, price. Running settles what only running shows. Deploying the same trivial
application to the last two or three candidates, then checking the DNS answer, the TLS handshake, a
redeploy and a restore, is the observation the reading narrows the field for.

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
8. **A deploy never has two processes holding the store's file at once.** Rests on
   [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md), which rejects more than
   one process sharing the file.
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

**Price enters as a row, per month or per year, once the technical rows stop separating
candidates.** It rules nothing out. All else being equal, a lower price is preferred, and that is
the whole of the preference, per the maintainer on 2026-09-28, recorded in
[what is the acceptable running cost?](what-is-the-acceptable-running-cost.md).

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

**This is an inherited list, not a shortlist.** Its figures were re-checked on 2026-09-27, in the
pass under Findings, and the field itself has not been rebuilt: an option absent here was never
considered rather than rejected.

*Fly.io.* Managed micro-VMs. TLS, health-checked restarts and Prometheus/Grafana without running any
of it yourself. An optimised configuration — one `shared-cpu-1x`, 256MB, shared IPv4, scheduled
volume snapshots disabled — starts from $2.02/month for the instance, per
[ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md), which checked Fly's
published prices against the vendor. Against it: shared CPU with a documented quota, and volume
snapshots billed by retention. Fly's reserved capacity gives a discount across all of an
organisation's apps, per the 2026-09-27 pass.

*Hetzner.* A bare VPS. Its 2 vCPU / 4GB CX23 is €5.49/month since the 15 June 2026 price
adjustment, but that line is EU-only and its order page showed it unavailable on 2026-09-27; the US
locations carry only the CPX line, whose price was not confirmed. See the 2026-09-27 pass below. Full
operational ownership — patching, TLS, monitoring — with no managed offset.

*Google Compute Engine e2-micro, "Always Free".* Out: its disk is a network-attached persistent
disk, which [ADR-0042](../decisions/0042-the-stores-disk-is-inside-its-machine-not-reached-over-a-network.md)
rules out for the store. It is also limited to three US regions (`us-west1`, `us-central1`,
`us-east1`).

*DigitalOcean or Linode.* $24/month each for 2 vCPU / 4GB, confirmed 2026-09-27; their cheapest
plans are $4 and $5.

*Cloudflare Containers.* Out: "All disk is ephemeral", so it fails
[ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md).
See the 2026-09-27 pass below.

*Cloudflare Workers and the rest of the constrained-isolate tier.* Ruled out by
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md), because the store
cannot be at the edge and edge compute reading a central store adds a hop rather than removing one.
This excludes a runtime tier rather than a vendor; Cloudflare's container tier is out on its disk,
per the entry above.

*Google Cloud Run and the rest of the serverless tier.* Ruled out on two counts.
[ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
requires a disk that survives a redeploy, and Cloud Run's local filesystem is memory-backed and
per-instance; its volume mounts are FUSE or NFS, which
[ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) rules out on SQLite's own
advice. Scale-to-zero on the request path is separately ruled out by
[ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md).

*Coolify on a VPS.* Adds a second control plane to maintain; pays off only with a genuinely
multi-app future.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Scale is not an input here.** The audience in [../problem.md](../problem.md) is deliberately small,
so [what load should the server handle?](what-load-should-the-server-handle.md) does not discriminate
between any candidate.

**Origin topology is a factor here, and it fails silently.** If sessions are carried by a cookie,
Safari caps a server-set cookie back to seven days when it judges the setting server not genuinely
first-party — which is the shape of a static host with its API on another provider, per
[../constraints.md](../constraints.md). Serving the client and its API from one origin, which
[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) requires, passes the test by comparing the host with itself. A bearer token in script-writable storage avoids it too, at the cost of living in
storage the browser evicts and being reachable by any script that runs on the page. Neither is
forced; what is forced is that this gets chosen rather than inherited from wherever the two things
happen to be deployed.

*Sourced — per [../constraints.md](../constraints.md).*

**Topology decides whether cheap recovery is possible at all.** A server-set cookie is the only
identifier that survives Safari's storage wipe without asking the player for anything. So this
question has to be settled with the recovery mechanism in mind rather than after it, which makes it
costlier to reverse than its price comparisons suggest.

*Sourced — per [../constraints.md](../constraints.md).*

**Structural platform facts** were unsourced here until 2026-09-27, and are now in the pass at the
end of this file with their sources. One of them did not survive: Fly's reserved capacity gives a
discount that pools across an organisation's apps, so "no bundling discount across apps" is false.

**A platform in the edge tier is not the same thing as a constrained runtime, and pricing this list
should not assume it is.** Cloudflare Containers is generally available on the Workers Paid plan and
is positioned for "Resource-intensive applications that require CPU cores running in parallel, large
amounts of memory or disk space" and "Applications and libraries that require a full filesystem,
specific runtime, or Linux-like environment". So that platform can run an ordinary container
alongside isolates, which removes the assumption that choosing it means accepting an isolate — and it
gives a search-heavy generator a first-class home there.

*Sourced — Cloudflare's Containers documentation, read 2026-09-02.*

**What that leaves open here, and it is a question for this file rather than for the shape:
does a container on any of these platforms get a disk that survives?** The relevant property is not
whether a filesystem exists — several offer one that lives in memory for the duration of a request —
but whether anything written survives a restart, a redeploy and a scale-to-zero. That is what decides
whether an embedded store is reachable on a given platform at all, and it is the difference between
this list having one column or two.

Check it for each candidate rather than by reputation: a container platform, a micro-VM with a
volume, a plain machine, and the managed tier. Answered for Cloudflare Containers, Cloud Run, Fly,
Railway, Render and Hetzner in the 2026-09-27 pass below; not yet for any candidate not named there.

**A claim about Fly CPU steal was found unsourced on 2026-09-27 and deleted.** It described 70% or
worse on some hosts, sourced to unnamed community reports. What Fly documents instead is in the pass
below.

**Backups cover data loss, not downtime.** One machine with one volume has zero hardware-failure
redundancy, and that holds for a bare VPS exactly as much as for a managed platform. See
[how much downtime is acceptable?](how-much-downtime-is-acceptable.md).

*Reasoned — a property of running one machine with one volume.*

**One rejection rests on an unmeasured premise.** GCE was set aside partly for a tighter compute
ceiling, which mattered only because generation was assumed to be compute-heavy — see
[how expensive is puzzle generation?](how-expensive-is-puzzle-generation.md).

**Comparison here has repeatedly narrowed the field before pricing it.** The round that produced the
candidates above weighed only places to run a long-lived process with a disk attached, because a
local database file was treated as fixed. A data store question compared two relational databases and
never considered less than a database. In both cases the excluded tier was not rejected on its
merits — it was never raised, and an option nobody listed is indistinguishable afterwards from one
that was considered and dropped.

**A practice worth keeping from the previous decision.** It named its upgrade path and the conditions
that would trigger it — generation outgrowing the compute ceiling, steal proving persistent, a
genuinely multi-app future — rather than choosing a cheap option and leaving the exit undefined.

### Platform facts established while enumerating failure domains and waiting moments

*Each of the following was verified at the tier stated; the ones marked second-hand were not opened by me.*

**Whether a platform sleeps is now a first-order property rather than a detail.** The waiting-moment
enumeration found that seven of nine blocking moments are first contact after a gap, and that this is
structural rather than a consequence of low traffic — see
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) for the
derivation. So wake-up latency lands on most waits in the product, and it does not improve with growth.

**Fly.io distinguishes suspend from stop, and only one of them is fast.** Resume from suspended is
"a few hundred ms"; cold start from fully stopped is "~2+ seconds for common apps". On resume, "the
clock can lag a few seconds until NTP syncs", and deploying new code discards the snapshot.

*Sourced — [docs.fly.io/reference/suspend-resume](https://docs.fly.io/reference/suspend-resume/),
re-read by a research agent 2026-09-27. Two claims previously here were not found on the page and
were deleted: that stopping a suspended machine invalidates its snapshot, and that Fly recommends
`stop` over `suspend` for clock-sensitive apps.*

**Fly volumes are not replicated, stated first-party.** "If your app needs a volume to function, and
the NVMe drive hosting your volume fails, then that instance of your app goes down. There's no way
around that." Also: "Fly.io does not automatically replicate data among the volumes on an app", and
daily snapshots "shouldn't be your primary backup method."

*Sourced — [fly.io/docs/volumes/overview](https://fly.io/docs/volumes/overview/), opened and read by me
2026-09-02.*

**Cloud Run scales to zero at no cost, and its cold-start latency is not published by Google.**
Min-instances defaults to 0 and costs nothing at rest; setting it above 0 "will incur cost even when
the service is not actively serving requests." No official cold-start figure exists — Google's docs
describe it as dependent on runtime and init code without giving a number. Third-party estimates
cluster at 200ms–2s for Node, which is not a measurement.

*Sourced for the cost claim — Google's instance-autoscaling documentation, second-hand from a research
agent 2026-09-02. The latency figure is explicitly unverified.*

**Vercel's free plan restriction is stricter than "do we charge users".** The pricing page says the
Hobby plan "is for personal, non-commercial use", and the Fair Use Guidelines define commercial usage
as "any Deployment that is used for the purpose of financial gain of anyone involved in any part of
the production of the project, including a paid employee or consultant writing the code." Donations are
not: the same page says "Asking for Donations does not fall under commercial usage."

*Sourced — [Hobby plan](https://vercel.com/docs/plans/hobby) and
[fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines), re-read by a research agent
2026-09-27. This file said until then that donations counted as commercial usage, which the page
contradicts.*

**Cloudflare began hard-enforcing D1's free-tier daily limits on 2026-09-01.** Exceeding them returns
errors rather than billing: "When your account hits the daily read and/or write limits, you will not be
able to run queries against D1." Free plan is 5 GB storage, 5 million rows read/day, 100,000 rows
written/day.

*Sourced — [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) opened and read by me
2026-09-02 for the limits and the failure behaviour. The 2026-09-01 enforcement date is second-hand
from a research agent citing Cloudflare's changelog, and I did not open it.*

**A managed platform's control plane can take its own backups down with it.** In May 2026 Google Cloud
auto-suspended Railway's production GCP account, which "took our API, control plane and databases
offline". With the dashboard and API down, customers could not retrieve their backups during the
incident. Blast radius was set by a dependency the customer did not choose and could not see.

*Sourced — Railway's [incident report](https://blog.railway.com/p/incident-report-may-19-2026-gcp-account-outage)
and [InfoQ](https://www.infoq.com/news/2026/05/railway-gcp-account-outage/), read by a research agent
2026-09-27. Not opened by me. The earlier wording here said backup storage sat behind the same control
plane; neither source says that, and it was removed.*

**Free tiers behave like outage modes at this traffic level.** Supabase pauses free projects after
7 days of low activity, restorable for up to a year; Render's free Postgres expires 30 days after
creation with a 14-day grace period before deletion. Low traffic is this project's design point rather
than a temporary condition, so both are live failure modes.

*Sourced — second-hand from a research agent reading each vendor's documentation 2026-09-02.*

### What was searched for and not found, so nobody researches it twice

*Each of these is an absence rather than a fact. They are recorded because an unanswered question
looks identical to an unasked one, and the second invites a repeat search.*

**No official Cloud Run cold-start figure exists.** Google's documentation describes it as dependent
on runtime, image and init code without giving a number. Third-party estimates cluster at 200ms–2s
for Node, which is not a measurement and should not be cited as one.

**No official Supabase figure for how long unpausing takes.** The pause behaviour is documented; the
duration is not. A related GitHub issue title suggests it is not always instant, and that was not
opened or corroborated.

**Render's paid Postgres price was not confirmed.** A figure near $6/month for the entry tier appears
in search summaries, and the pricing page did not render to the agent that tried. Treat it as unknown
rather than as $6.

**Railway has no fixed cheapest tier to quote**, because it prices by consumption rather than by named
plan. Third-party breakdowns land somewhere in $8–25/month for a small Postgres, which is a range
rather than a price.

**No documented unrecoverable data-loss incident was found at Neon, Supabase, Railway, Render or
PlanetScale.** Extended outages are documented and several have public post-mortems; permanent loss is
not. This is an absence of evidence — small providers do not always publish their worst incidents, and
"no data was lost" is self-reported in every case examined.

**Neither Supabase's nor Neon's terms address keep-alive pinging**, in either direction. Neon's
acceptable-use policy bars excessive consumption in general terms and says nothing about a scheduled
ping. So whether the common workaround for scale-to-zero is permitted is genuinely unsettled rather
than permitted-by-silence.

**One anecdote was deliberately discarded**: a forum comment claiming Supabase now pauses projects
despite cron pings. Single uncorroborated source, not opened by me, recorded here only so that
finding it later is not mistaken for new information.

*Sourced — a research agent searched for each of these 2026-09-02 and reported the absence. I did not
repeat the searches.*

### Facts established while settling the package manager

**Build-from-repo platforms do not favour one lockfile over another as much as assumed.** Heroku's
Node support documents `package-lock.json`, `pnpm-lock.yaml` and `yarn.lock` as equal triggers, and
states that only one package manager may be used per application. Railway's builders detect the
`packageManager` field first and a lockfile second. Render and Fly could not be established: Render
appears to want an explicit build command rather than inferring one, and no Fly document was found
describing lockfile precedence.

*Sourced — the Heroku and Railway/Railpack documentation, read 2026-09-19 by a research agent. I did
not open them, and the two gaps are recorded as gaps rather than guesses.*

**A host that cannot deploy symlinks is now a real constraint on this choice rather than a
preference.** [ADR-0032](../decisions/0032-the-package-manager-is-pnpm.md) chose pnpm, whose default
layout symlinks into a content-addressed store, and pnpm's own docs name "deployment to serverless
providers that don't support symlinks" as the reason its hoisted mode exists. Taking that escape
hatch withdraws
[no package imports what it does not declare](../invariants/no-package-imports-what-it-does-not-declare.md).

**So this question can make that record uncomfortable**, and
[ADR-0032](../decisions/0032-the-package-manager-is-pnpm.md) names it under **Revisit when** for
exactly that reason. A host that runs an ordinary process on an ordinary disk — which
[ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) already requires — does not
have this problem, so the two constraints point the same way.

### Re-checked 2026-09-27, before the properties were derived

*Tier per claim. "Opened by me" means the session that wrote this pass read the page itself; the rest
were read by research agents that day and are passed on as theirs.*

**Cloudflare Containers cannot hold the store.** "All disk is ephemeral. When a Container instance
goes to sleep, the next time it is started, it will have a fresh disk as defined by its container
image." Instances sleep after 10 minutes by default, and "Cloudflare does not guarantee that any
container instance will run for any set period of time." That fails
[ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
and [ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md). The product went GA
on 2026-04-13 on Workers Paid, and its docs list disk snapshots as "coming soon".

*Sourced — [Containers FAQ](https://developers.cloudflare.com/containers/faq/), opened by me
2026-09-27. GA date from the [changelog](https://developers.cloudflare.com/changelog/post/2026-04-13-containers-sandbox-ga/),
read by an agent. Reverses if a persistent disk ships.*

**Cloud Run has no persistent local disk.** "It is an in-memory file system, so writing to it uses the
instance's memory." "Data written to the file system doesn't persist when the instance stops." Its
volume types are Cloud Storage FUSE, NFS and in-memory. The request timeout is at most 60 minutes, and
min-instances defaults to 0.

*Sourced — [container contract](https://docs.cloud.google.com/run/docs/container-contract) opened by
me 2026-09-27; volume types, timeout and min-instances read by an agent.*

**Cloudflare Workers can write files now, and nothing persists.** `node:fs` shipped 2025-08-15 as "a
virtual file system [that] is ephemeral with each individual request having its own isolated
temporary file space."

*Sourced — [changelog](https://developers.cloudflare.com/changelog/post/2025-08-15-nodejs-fs/), read
by an agent 2026-09-27.*

**Every volume-backed platform checked stops the old instance before starting the new one, so none
runs two processes against one file during a deploy.**

- **Fly.** Rolling is "the default strategy for apps with or without volumes. One by one, each running
  Machine is taken down and replaced by a new release Machine." Canary and bluegreen "cannot be used
  for Machines with attached volumes". "A volume can be attached to only one Machine."
- **Railway.** "To prevent data corruption, we prevent multiple deployments from being active and
  mounted to the same service. This means that there will be a small amount of downtime when
  re-deploying a service that has a volume attached."
- **Render.** "Adding a disk to a service prevents zero-downtime deploys." "Render stops the existing
  instance before bringing up the new instance." Disk data is preserved across deploys and restarts.
- **Hetzner**, or any bare machine, has no deploy model of its own, so single-writer safety is
  whatever the deploy we write does.

*Sourced — Fly's [configuration reference](https://docs.fly.io/reference/configuration/) and Railway's
[volumes reference](https://docs.railway.com/reference/volumes) opened by me 2026-09-27; Fly's
[volumes overview](https://docs.fly.io/volumes/overview/) and Render's
[disks page](https://render.com/docs/disks) read by an agent.*

**So the price of single-writer safety is a few seconds of downtime per deploy**, on every managed
platform checked. It is reasoned from the four entries above.

**Fly documents its shared-CPU quota.** "For each 80ms period of time, we set a quota of 5ms for each
shared vCPU", which is a 6.25% baseline with a burst balance above it, and throttling is reported as
its own metric, `fly_instance_cpu_throttle`.

*Sourced — [CPU performance](https://docs.fly.io/machines/cpu-performance/), read by an agent
2026-09-27.*

**Fly's shared-cpu-1x prices could not be re-read on 2026-09-27.** The pricing page renders its table
in script, and successive agent fetches returned different numbers. The last verified figures are
the ones [ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md) records from
2026-09-04. Re-read them in a browser before cost decides anything. A shared IPv4 is free and a
dedicated one is "$2/month". Fly's reserved capacity gives "a 40% discount" and applies "in any of your
organisation's apps".

*Sourced — Fly's cost-management and pricing pages, read by an agent 2026-09-27.*

**Fly recommends A and AAAA records at the apex, not a CNAME.** "In general, we recommend setting
A/AAAA records on the apex domain." That bears on the Safari CNAME comparison in
[../constraints.md](../constraints.md), and on
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md).
Cloudflare DNS, where the domain is registered, flattens a CNAME at the apex and returns "the final IP
address instead of a CNAME record". Whether a flattened answer satisfies Safari's comparison is
reasoned rather than observed.

*Sourced — Fly's [custom domain docs](https://docs.fly.io/networking/custom-domain/) and Cloudflare's
[CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/), read by agents
2026-09-27.*

**Hetzner: prices moved, US stock differs, and its volumes are network block storage.**

- CX23 €5.49, CAX11 €5.99 and CX33 €8.49 since "15 June 2026". The Cost-Optimized page showed "This
  product is currently unavailable" for every plan on 2026-09-27, and that line is EU-only.
- Ashburn and Hillsboro carry only the CPX line. A US CPX11 price of about $20.49 is from third-party
  trackers and is unverified.
- Locations are Falkenstein, Nuremberg, Helsinki, Ashburn, Hillsboro and Singapore.
- Volumes "are based on the networked block storage model", which
  [ADR-0042](../decisions/0042-the-stores-disk-is-inside-its-machine-not-reached-over-a-network.md)
  rules out for the store. The server's own disk is "local NVMe SSD".
- The primary IPv4 fee was found at €1.70 on a dedicated-server page. A Cloud-specific figure was not
  confirmed.

*Sourced — Hetzner's price-adjustment, locations, volumes and architecture docs, read by an agent
2026-09-27. The $4.59 figure previously here matched the pre-April-2026 CX22 and was replaced.*

**GCE's free e2-micro regions are `us-west1`, `us-central1` and `us-east1`, with a 30 GB-month
standard persistent disk.** Its external IPv4 fee is about $2.92/month from secondary sources only,
because Google's pricing page did not render for the agent.

*Sourced for the regions and disk — [free-tier features](https://docs.cloud.google.com/free/docs/free-cloud-features),
read by an agent 2026-09-27. The IPv4 figure is unverified.*

**DigitalOcean and Linode both charge $24/month for 2 vCPU / 4GB**, and their cheapest plans are $4
and $5.

*Sourced — both pricing pages, read by an agent 2026-09-27.*

**Railway's services do not sleep unless its opt-in Serverless setting is on, and Hobby is
$5/month.** Render's always-on Starter tier is said to be $7/month, and its pricing page did not render
to the agent, so that price is unverified.

*Sourced for Railway — [app sleeping](https://docs.railway.com/reference/app-sleeping) and
[plans](https://docs.railway.com/reference/pricing/plans), read by an agent 2026-09-27.*

**Confirmed unchanged on 2026-09-27**, each read by an agent:

- D1's free limits, and their enforcement from 2026-09-01, per the
  [changelog](https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/).
- Supabase's 7-day pause, restorable for 1 year.
- Render's 30-day free Postgres expiry with a 14-day grace period.
- Heroku's one-package-manager rule.
- Railpack reading `packageManager` before lockfiles.
- pnpm naming serverless providers without symlink support as a reason for `hoisted`.

### Scored against the properties, 2026-09-27

*"Opened by me" means the session that wrote this pass read the page itself. Everything else was read
by research agents that day and is passed on as theirs. One agent claimed that Oracle's and Azure's
free VMs have local disks. The pages below contradict it, so that claim was discarded.*

**The field was rebuilt from scratch before scoring.** Beyond the inherited list, these were checked:

- **PaaS:** Koyeb, Northflank, DigitalOcean App Platform, Heroku, Sliplane, Zeabur, Clever Cloud,
  Scalingo, Upsun, Azure App Service and Replit.
- **VMs:** AWS Lightsail and EC2, Oracle Always Free, Azure's B1s, Vultr, RackNerd, OVHcloud,
  Scaleway, Contabo, netcup, IONOS, BuyVM, Kamatera, Hostinger and Alibaba ECS.
- **Other:** PikaPods, Deno Deploy, Val Town, Glitch, a machine at home behind Cloudflare Tunnel, and
  Coolify or Dokku, which are control planes to run on one of the VMs rather than hosts.

**Out, each on one property:**

- **DigitalOcean App Platform** fails property 7: "App Platform does not currently support
  volumes", and "Every redeployment of your app will reset the filesystem".
- **Heroku** fails property 7: "Any files written get discarded the moment the dyno stops or
  restarts".
- **Deno Deploy** fails property 7. It has no persistent disk, and its docs point to KV or object
  storage.
- **Koyeb** fails property 2: "Koyeb does not support directly setting apex domains". Its workaround
  is a redirect to `www`, which also costs a round trip that
  [ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md)
  property 4 forbids.
- **Val Town** fails property 4: "After some inactivity with no new requests, the HTTP process is
  terminated".
- **Azure App Service's free tier** fails property 4: "Always On... is not available on the Free or
  Shared tiers".
- **Oracle Always Free** fails property 4: "Idle Always Free compute instances may be reclaimed"
  after 7 days under 20% CPU at the 95th percentile and under 20% network. An idle small app meets
  that, so it passes only if kept artificially busy.
- **The free tiers of Render, Koyeb and Zeabur** fail property 4. Each sleeps, and Render's and
  Koyeb's also refuse a persistent disk.
- **PikaPods** fails property 5. It deploys only from its own catalogue.
- **Glitch** shut down its app hosting on 2025-07-08.
- **A machine at home behind Cloudflare Tunnel** fails property 2. The domain must point at
  `<UUID>.cfargotunnel.com`, so it resolves to Cloudflare's proxy.

*Sourced — Oracle's [Always Free resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)
opened by me. The rest from each vendor's docs, read by agents: DigitalOcean's
[store data](https://docs.digitalocean.com/products/app-platform/how-to/store-data/), Heroku's
[dynos](https://devcenter.heroku.com/articles/dynos), Koyeb's
[domains](https://www.koyeb.com/docs/run-and-scale/domains) and
[volumes](https://www.koyeb.com/docs/reference/volumes), Render's [free](https://render.com/docs/free),
Val Town's [http-preview](https://blog.val.town/http-preview), Cloudflare's
[tunnel DNS](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/dns/).
Each reverses if the quoted behaviour changes. Oracle also reverses if a paid account's use of Always
Free shapes is exempt from reclaim, which was not checked.*

**No platform-as-a-service offers an always-on free instance with a persistent disk, with one
possible exception.** Northflank's free Sandbox is "Always-on-compute – no sleeping", but no page read
confirmed that a volume can be attached on it.

- Fly has "no permanent free tier". Its trial gives "2 hours of machine runtime or 7 days of access,
  whichever comes first".
- Railway's free plan is about $1 of credit a month, which does not roll over.

*Sourced — Fly's [free trial](https://docs.fly.io/about/free-trial/) opened by me; Northflank's
[pricing](https://northflank.com/pricing) and Railway's plans read by agents.*

**The only free always-on VMs have network-attached disks.**

- **Google's e2-micro:** "they are network-attached devices that transmit data over Google's
  networks", and the free allowance is "30 GB-months standard persistent disk". It is limited to
  `us-west1`, `us-central1` and `us-east1`, with 1GB of free egress a month. Whether its external
  IPv4 is free was not confirmed.
- **Oracle's free VM:** its boot volume is "a detachable boot volume device" in the Block Volume
  service, counted against the 200GB block allowance. That a detachable, reattachable volume is
  network storage is reasoned; no page opened says so in those words. It is out on property 4 in any
  case.
- **Azure's B1s** is free for 12 months, and **AWS's** new-account credits last 6 months. Neither is
  free after that.

So on 2026-09-27, whether a free host qualified at all turned on property 6 and the block-device
clause of [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md). That clause was
removed on 2026-09-28, and network block storage was ruled out on other grounds by
[ADR-0042](../decisions/0042-the-stores-disk-is-inside-its-machine-not-reached-over-a-network.md), so
neither free VM qualifies.

*Sourced — Google's [disks](https://docs.cloud.google.com/compute/docs/disks) and
[free tier](https://docs.cloud.google.com/free/docs/free-cloud-features), and Oracle's
[Block Volume overview](https://docs.oracle.com/en-us/iaas/Content/Block/Concepts/overview.htm),
opened by me. Azure and AWS terms read by an agent.*

**Local disks, per the vendor:**

- Hetzner: "local NVMe SSD".
- DigitalOcean Droplets: "the Droplet's local disk".
- Linode: "local storage... built entirely on enterprise-grade SSDs".
- Vultr: "directly attached to the instance".
- RackNerd: "PURE SSD's in RAID-10".
- Fly: "a slice of an NVMe drive on the same physical server".
- Koyeb: "on the same physical machine".

Railway, Render and Northflank's managed cloud do not say whether their disks are local or
networked. Northflank on your own cloud uses EBS or Persistent Disk, which are network-attached.

*Sourced — each vendor's docs, read by agents.*

**RackNerd's specials** run from $21.99 a year for 1 vCPU, 1 GB of RAM, 20 GB of SSD and one IPv4
address, to $119.99 a year for 8 GB. They are billed annually, under KVM virtualisation, and "You can
renew at the same rate for as long as you decide." Locations include Los Angeles, San Jose, Utah,
Chicago, Dallas, New York, Atlanta, Ashburn and Toronto. IPv6 is not mentioned. No snapshot or backup
product was found, and nothing is published about host failure.

*Sourced — [specials](https://www.racknerd.com/specials/) opened by me; the disk wording from its
[KVM page](https://www.racknerd.com/kvm-vps), read by an agent.*

**Apex domains on the platforms that pass property 7:**

- **Fly:** A and AAAA records.
- **Render:** an A record to `216.24.57.1` and no AAAA, but with Cloudflare DNS, Render's guide asks
  for a CNAME.
- **Railway:** "does not publish a static IP, so A records are not supported". The apex needs CNAME
  flattening.
- **Northflank:** "must support CNAME flattening".

Cloudflare's flattening answers with A records, so the browser never sees a CNAME. Whether Safari's
comparison then passes is reasoned from the rule in [../constraints.md](../constraints.md), and not
observed.

*Sourced — each vendor's domain docs, read by agents.*

**TLS 1.3** is documented for Fly ("TLSv1.2 and TLSv1.3") and Railway, and is selectable on
DigitalOcean. Render states no minimum TLS version anywhere found, so property 13 is unknown there
until it is scanned. On a VM, whatever we run terminates TLS.

*Sourced — vendor docs, read by an agent.*

**Every platform checked that offers a volume limits a service using one to a single instance** and
gives up zero-downtime deploys: Render, Northflank, Koyeb, Railway and Fly. That is the mechanism
behind property 8 passing everywhere it was checked.

*Sourced — Render's [disks](https://render.com/docs/disks) and Northflank's
[persistent storage](https://northflank.com/docs/v1/application/production-workloads/persistent-storage-in-production),
read by an agent.*

**Properties an agent suggested that bind on nothing here:**

- **Edge idle and response timeouts**: Heroku's 30 seconds, Koyeb's 100. No record uses a long-lived
  connection.
- **Egress pricing**: a cost, so it breaks ties only.

**No primary source gives a Fastify server's resident memory.** It has to be measured, per the
resources paragraph under the properties.

### Local disk against network block storage, 2026-09-28

*Gathered to settle whether [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md)'s
block-device clause held. It was settled by
[ADR-0042](../decisions/0042-the-stores-disk-is-inside-its-machine-not-reached-over-a-network.md).
"Opened by me" means the session that wrote this pass read the page itself.*

**What SQLite needs from storage is locks that work, one host, and honest syncs.** Its corruption page
names "network filesystems and NFS in particular" for lock bugs, and says "SQLite must believe whatever
the operating system and hardware tell it about the status of sync requests". WAL requires "all
processes using a database must be on the same host computer". None of SQLite's reference pages
mentions block devices, iSCSI or SANs. Posts on SQLite's own forum say a remote block device under a
local filesystem is fine, because locking stays local. Those posts are community discussion and not
reference documentation.

*Sourced — [howtocorrupt](https://www.sqlite.org/howtocorrupt.html) and [wal](https://www.sqlite.org/wal.html)
opened by me; forum posts found by an agent and not opened by me.*

**How many syncs a commit costs.** In WAL mode, "Writers sync the WAL on every transaction commit if
PRAGMA synchronous is set to FULL but omit this sync if PRAGMA synchronous is set to NORMAL", and with
NORMAL "transactions are no longer durable and might rollback following a power failure or hard
reset". Rollback-journal mode at FULL syncs three times per commit. Reads never sync, and a page
already in the OS cache is read without touching the disk.

*Sourced — [wal](https://www.sqlite.org/wal.html) opened by me; [atomiccommit](https://www.sqlite.org/atomiccommit.html)
and [pragma](https://www.sqlite.org/pragma.html#pragma_synchronous) read by an agent.*

**The storage round trip therefore lands on each durable write, not on reads.** Solving never waits
on a server write, per [ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md). So
the latency added to a commit is not on any wait [../problem.md](../problem.md) names, unless a player
is waiting on a write to be acknowledged. Reasoned.

**Latency figures.**

- AWS: "The average latency between EC2 instances and EBS is single-digit milliseconds" for general
  SSD volumes.
- Google: "SSD Persistent Disk is designed for single-digit millisecond latencies". No figure is
  published for the HDD-backed standard disk the free tier includes. Google also says local SSD
  offers "very low latency compared to the persistent storage provided by... Persistent Disk"
  because it is "physically attached to the server".
- No vendor opened publishes local and network latency side by side in numbers. What a local NVMe
  `fsync` costs here is unmeasured.

*Sourced — AWS [EBS features](https://aws.amazon.com/ebs/features/), Google
[local SSD](https://docs.cloud.google.com/compute/docs/disks/local-ssd), read by agents.*

**Google's free disk caps writes by size.** Standard persistent disk is "Write IOPS per GiB: 1.5", so
the free 30 GB is 45 write operations a second. Balanced is 6 per GiB, but the free tier names only
"standard persistent disk". So the free disk is also the slowest disk type Google sells.

*Sourced — [performance](https://docs.cloud.google.com/compute/docs/disks/performance) opened by me.
The e2-micro per-VM cap could not be read by the agent.*

**Single attachment holds by default.** Google's standard and balanced persistent disks are single
writer. Multi-writer mode is available only on some Hyperdisk types, and Google warns that ext4 or XFS
there "might experience data loss". Hetzner Volumes: "you can only attach a Volume to one server at a
time".

*Sourced — Google's [disk sharing](https://docs.cloud.google.com/compute/docs/disks/sharing-disks-between-vms)
and Hetzner's [volumes FAQ](https://docs.hetzner.com/cloud/volumes/faq/), read by agents.*

**No vendor found states that a write acknowledged to the OS is durable**, for network block storage
(Google, AWS) or for local disks. That leaves the honest-sync condition resting on reputation on both
sides, so it separates neither.

*Sourced as an absence — agents searched Google's persistent-disk and AWS's EBS pages for cache,
flush, fsync and acknowledge, 2026-09-28.*

**What survives the host failing is where the two differ.**

- **Local disks die with their host.** Fly: "Volumes are pinned to physical hosts, so when there's a
  host outage the volume is unreachable". Recovery is from a daily snapshot, and "Any data stored
  between the time when the snapshot was taken and the time when the restore is made will not be
  included". DigitalOcean calls its RAID "a single point of failure". Hetzner documents a live copy
  off a host that is failing but still readable, and nothing for a drive that has died.
- **Network block storage outlives its host.** Hetzner Volumes are stored "on three different
  physical servers". DigitalOcean Volumes are "replicated across multiple hosts". AWS EBS is
  "replicated across multiple servers in an Availability Zone". Google's disk "has built-in
  redundancy to protect your data against equipment failure".

*Sourced — Fly's [host unavailable](https://docs.fly.io/apps/trouble-host-unavailable/) opened by me;
the rest read by agents.*

**Among the platforms, which volumes are local is known only for Fly, and for Koyeb per the
2026-09-27 pass.** Fly: "a volume exists on one
server in a single region — it is not network storage". Railway says only that "all of Railway's disks
are NVMe SSDs", and Render only that its disks "use the same high-performance SSDs as Render
Postgres". Neither says local or networked, and neither documents what happens to a volume when its
host fails. Northflank states neither the disk type nor whether its free Sandbox can attach a volume.

*Sourced — Fly's [volumes overview](https://docs.fly.io/volumes/overview/), Railway's
[Metal](https://docs.railway.com/railway-metal) and Render's [disks](https://render.com/docs/disks),
read by agents. Render's community forum could not be reached from the sandbox.*

### Scored on the remaining properties, 2026-09-28

*This pass scores properties 1, 3, 9, 10, 11 and 12, resolves property 6 where it could, and screens
candidates found earlier but never scored. "Opened by me" means the session that wrote this pass read
the page itself. The rest was read by research agents that day. Several agents lost web search partway
through, and several vendor pages render only in a browser, so more cells are unknown than the
evidence would otherwise leave. An unknown is not a pass.*

**Out, each on one property:**

- **Kamatera** fails property 6: its servers are "based on SSD SAN storage array". *Opened by me,
  [pricing](https://www.kamatera.com/pricing/).*
- **Scalingo** fails property 7: "when you redeploy your application or if your application is
  restarted, SQLite data would be lost". *Opened by me, [SQLite](https://doc.scalingo.com/databases/sqlite).*
- **Replit's Reserved VM** fails property 7: "The file system in published apps is not persistent and
  resets every time you publish". *Opened by me,
  [troubleshooting](https://docs.replit.com/build/troubleshooting).*
- **Clever Cloud** fails property 7: "you will lose anything on the local disk after a rebuild or a
  restart". Its persistent option, FS Buckets, is "a network-based storage solution", which fails
  property 6. *Opened by me, [FS Buckets](https://www.clever.cloud/developers/doc/deploy/storage/fs-bucket/).*

**Upsun was reported out and is not.** Its `storage` mounts point at "an external network directory",
which fails property 6. But its `instance` mounts "are local mounts", and no page says whether one
survives a redeploy. So Upsun is unknown on property 7. *Opened by me,
[mounts](https://developer.upsun.com/docs/configure-apps/image-properties/mounts).*

**Property 6, where it was resolved:**

- **Local:**
  - Fly: "a slice of an NVMe drive on the same physical server".
  - Linode: "This local storage is built entirely on enterprise-grade SSDs", opened by me at
    [manage disks](https://techdocs.akamai.com/cloud-computing/docs/manage-disks-on-a-compute-instance).
  - Hetzner, DigitalOcean and Vultr, per the 2026-09-27 pass.
  - RackNerd: "RAID-10 protected Pure SSD storage".
  - BuyVM: "Pure SSD storage".
  - Scaleway's cheapest types: "Dynamic local: 1 x SSD".
  - The RackNerd and BuyVM wording describes a disk array without saying "local". Local is the
    reasonable reading, not a stated one.
- **Unknown:** Railway, Render, Northflank and Sliplane, where no vendor page says whether a volume is
  on its host or networked. Also AWS Lightsail, OVHcloud, netcup, Contabo, IONOS and Hostinger, where
  no page describes the root disk either way.
  - Railway's hardware post mentions "12 drives of NVMe per box, and 4x 100G NICs" for its storage
    offering, which fits either reading.
  - Render's community forum, one place a staff answer might have been, "was sunset on March 24,
    2026".
  - Sliplane runs "on infrastructure from Hetzner GmbH" in Europe and "on Datapacket and Latitude" in
    the US.

**Property 2 turns out to need zooming in.** Northflank says "Your DNS provider must support CNAME
flattening in order to link an apex domain", and Railway says the same in effect. The property as
written, "no CNAME to a provider's domain required", fails them. But what Safari's comparison reads is
the DNS answer the browser gets, and Cloudflare's flattening answers with A records. So what the
property protects may survive flattening. That is reasoned, not observed, and it is the next pass's
work to split the property into what the browser resolves and what the DNS setup requires.

**Properties 1, 3, 9, 10, 11 and 12 for the managed platforms still standing:**

- **Property 1:** every platform checked routes all paths on the domain to the one process unless
  told otherwise. Fly: "When you add a `[[statics]]` section… the Fly Proxy intercepts requests
  matching your `url_prefix`", so without one nothing is intercepted.
- **Property 3:**
  - Render: edge caching "None… is the default", and a response carrying `Set-Cookie` is never
    cached even when caching is on.
  - Northflank's CDN is opt-in, but one page says to "disable Northflank's CDN on the subdomain" in
    one workflow, so its default is unclear.
  - Fly's and Railway's documentation is silent. Unknown.
- **Property 9:** passes on Fly (`fly ssh sftp`), Railway (`railway service files download`), Render
  (SCP and Magic Wormhole), Northflank (SSH and a transfer command) and Sliplane (SSH).
- **Property 10:** every one of them can deploy a Docker image built with pnpm, which keeps its
  symlinked layout. None states this in so many words.
- **Property 11:** passes on Fly, Railway, Render, Northflank and Sliplane, which all deploy a
  Dockerfile or an image.
- **Property 12:**
  - Fly's checks take a `path`, and no page says they can be turned off.
  - Railway checks only at deploy time: "Railway does not monitor the healthcheck endpoint after the
    deployment has gone live".
  - Render's default is a TCP probe, and an HTTP path is optional.
  - Northflank's checks are opt-in.
  - Sliplane mentions "automatic healthchecks" with no configuration found.
- **Price, cheapest always-on setup with about 1 GB of volume:**
  - Fly: $2.02 a month for 256 MB, as verified on 2026-09-04, plus $0.15 per GB of volume. A fetch
    on 2026-09-28 read $1.94, from a page whose figures changed between fetches, so it is
    unverified.
  - Northflank: about $2.85.
  - Railway: $5 plus usage.
  - Render: not readable, because its pricing page renders in script.
  - Sliplane: €9, with 20 GB included.

**Properties 1, 3, 9, 10, 11 and 12 on a VPS** are ours to satisfy by construction. Nothing sits in
front of the machine unless we put it there, and we reach it over SSH. What remains per provider is
whether anything the provider adds breaks one of them:

- BuyVM's DDoS protection is a paid add-on at $3 a month per IP.
- Scaleway bills its IPv4 separately, at €0.004 an hour.
- Hetzner's IPv4 fee is unconfirmed: €1.70 was found on a dedicated-server page, and €0.50 was
  reported for Cloud with no source.
- Lightsail's IPv4 changes on every stop unless a static IP is attached, which is free while
  attached.

None of these fails a property.

**Price, cheapest VPS with at least 1 GB of RAM:**

- RackNerd: $21.99 a year, "lifetime recurring".
- BuyVM: $3.50 a month.
- Linode: $5 a month.
- DigitalOcean: $6 a month.
- Lightsail: $7 a month.
- Hostinger: $6.49, renewing at $11.99 on a two-year term.
- IONOS: $2 a month for three months, then $6.
- OVHcloud: $4.54 a month on a 12-month prepay.
- Contabo: €5.50 a month on a 24-month term.
- netcup: €8.26 a month on a 12-month term.
- Hetzner: CX23 at €5.49 a month in the EU, per the 2026-09-27 pass. Its US price could not be read,
  because the page renders in script.

**Regions are recorded, not scored**, per the deferral to M3. Scaleway has none in North America:
"Paris (France), Amsterdam (Netherlands), and Warsaw (Poland)".

**Two properties an agent surfaced:**

- **A platform's health check can itself be traffic the app never asked for.** Fly checks
  continuously, while Railway and Render check only at deploy.
- **Every platform with a volume limits a service using one to a single instance, and gives up
  zero-downtime deploys.** That is already property 8.

### Scored 2026-09-29: the unknowns, properties 14 to 19, and a rebuilt field

*Research agents read vendor pages on 2026-09-29, and a browser agent read the pages that render only
in script. Their page reads came back as a small model's summary, so a quote from them may not be
verbatim. "Opened by me" means the session that wrote this pass fetched the page itself: Upsun's cache
page, Koyeb's volumes page and Fly's services page. Everything else is the agents' reading and is
Sourced at that strength. An unknown is not a pass.*

**One agent verdict was overturned.** An agent reported Upsun failing property 3 because "Caching is
enabled by default". The same page says responses with no `Cache-Control` header use `default_ttl`,
and "The default `default_ttl` value is `0`", so nothing is cached unless the app asks. Responses with
`Set-Cookie` are "not cached". Upsun passes property 3. *Opened by me,
[cache](https://developer.upsun.com/docs/routes/cache).*

**Property 18 needs the same split property 2 got.** Railway's staff say "inbound uses anycast IPs that
can change", and Upsun's docs say that when "a router's IP address changes… if you use `A` records…
you need to update your `A` records manually". Both fail 18 as written. But the harm 18 guards
against is the domain pointing at an old address. A CNAME, or Cloudflare's flattening of one, follows
the change, so the harm does not happen under the DNS setup those hosts ask for. Split it:

- **18a. Under the DNS setup the host asks for, a change of the host's address never leaves the
  domain pointing at the old one.** This is what the property protects.
- **18b. The address is fixed unless we change it.** This is what the property said. It matters only
  where the setup is hand-written A records, which on these hosts is the setup they advise against.

*Railway's quote is from a search result summarising a May 2026 staff answer on
[Central Station](https://station.railway.com/questions/does-railway-provide-static-ip-also-d-ec2ed437),
not opened. Upsun's is an agent's read of
[DNS](https://fixed.docs.upsun.com/domains/steps/dns.html).*

**Property 17 separates nothing under the reading chosen for it.** A proxy in front of any candidate
ends TLS near the player, so every candidate can reach 17. Fly ("The Fly Proxy will terminate TLS on
the host a client connects to", opened by me at
[services](https://docs.fly.io/networking/services/)), Railway ("The edge proxy terminates TLS", with
anycast) and Northflank ("HTTPS requests are terminated at the edge load-balancer") do it without one.
Whether one is placed in front belongs to
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md).

**Property 14 on a VPS is ours by construction**, in the same way as 1, 3 and 9. Automatic security
updates are an operating-system setting. No provider page checked offers them or prevents them.
Whether they cover the kernel without a manual reboot is reasoned, not checked, and it belongs to
[how is the server reached and hardened?](how-is-the-server-reached-and-hardened.md) at M2.

**Managed platforms:**

- **Fly.io**
  - 3: still unknown. No docs page speaks to caching or `Set-Cookie`. The nearest is a staff answer
    from 2021-08-18, "We don't do normal HTTP caching", at
    [community.fly.io](https://community.fly.io/t/static-cache-not-caching/2245/2). Five years old
    and not a docs page.
  - 13 passes: "The Fly proxy only supports TLSv1.2 and TLSv1.3".
  - 14 passes for what sits beneath us. Fly patches "the operating system, other 3rd-party software";
    the image's own packages stay ours.
  - 15 passes: the Machines API creates apps, machines and volumes, and `fly ssh sftp` puts a file on
    a volume.
  - 16 passes on the runtime: a Dockerfile or a prebuilt image. Whether `fly.toml` is required was not
    read.
  - 18a and 18b pass. Every app gets a shared IPv4 and anycast IPv6, and a dedicated IPv4 is $2 a
    month.
  - 19 passes: seven North American regions, including Toronto.
  - Price, read twice in a browser on 2026-09-29 with identical figures: $1.94 a month for
    `shared-cpu-1x` with 256 MB, plus $0.15 per GB-month of volume. That settles the figure the
    2026-09-28 pass left unverified.
- **Railway**
  - 3 passes: "It's off by default and enabled per service", of its CDN. A third-party report of a
    March 2026 incident that cached uncached GETs was not verified.
  - 6: still unknown. Its hardware post describes separate storage servers with "4x 100G NICs", which
    suggests network volumes but does not say so.
  - 18a passes through a CNAME. 18b fails.
  - 19 passes: California and Virginia.
- **Render**
  - 6, 13 and 17: still unknown.
  - 15 is partial: the API creates a service with a disk, and whether the SSH setup for copying a file
    can be scripted was not found.
  - 18: the apex points at `216.24.57.1`, whose stability is not stated. "Render uses IPv4", and its
    docs say to remove AAAA records.
  - 19 passes: Oregon, Ohio and Virginia.
  - Price: $7 a month for 512 MB, plus $0.25 per GB-month of disk, read in a browser.
- **Northflank**
  - 3: its CDN is opt-in per subdomain ("You must configure each subdomain individually"). How the
    CDN treats cookies when it is on was not found. The earlier "disable Northflank's CDN" quote was
    not found again.
  - 6, 13 and 18: still unknown.
  - 14 and 15 pass.
  - 19 passes, though whether every North American region takes a volume was not confirmed.
- **Sliplane**
  - 3, 4, 6, 13, 14 and 17: still unknown.
  - 12 passes: "set a route that returns a 2XX response", default `/`, so it can be set under `/api/`.
  - 15: an agent marked it failing, because uploading to a volume is documented only through a web
    file browser. But the 2026-09-28 pass found SSH access for property 9, which a script can copy
    over. Unknown, not failing.
  - 18: a CNAME is preferred, and a guide says it "automatically tracks Sliplane IP changes", so 18b
    likely fails and 18a passes through the CNAME.
- **Upsun**
  - 3 passes, per the overturned verdict above. 13 passes, since `min_version: TLSv1.3` can be set.
  - 7: still unknown. An `instance` mount is stated to be local, "local mounts; set to 8 GB", but no
    page says it survives a redeploy. Only `tmp` mounts are documented as removable.
  - 16: an agent marked it failing because config lives in `.upsun/config.yaml` and a Docker app must
    be a prebuilt image. A deploy config file is not the app depending on the provider, which is what
    16 asks, so that is not a failure. Whether a private image can be pulled is undocumented. Unknown.
  - 18a passes through a CNAME. 18b fails.

**VPS providers:**

- **Property 15:**
  - Passes on DigitalOcean (`POST /v2/droplets` with `ssh_keys` and `user_data`), Linode (with
    `authorized_keys` and `metadata.user_data`), Hetzner (Terraform provider and cloud-init) and
    Contabo (`POST /v1/compute/instances` with `userData`).
  - Partial on Vultr (a Terraform provider with `user_data`, and API parameters seen only in search)
    and Lightsail (`--user-data` and `--key-pair-name` on the CLI).
  - RackNerd has only its control panel's API, and cloud-init was reported unavailable in 2023. Both
    were seen in search only. Unknown, leaning fail.
  - BuyVM, OVHcloud, netcup, IONOS and Hostinger: unknown.
- **Property 16, the prepaid term:**
  - Billed by the hour or second with a monthly cap: Hetzner, DigitalOcean, Linode and Lightsail.
  - RackNerd sells yearly, and its terms say "no refunds are provided once payment is received". An
    annual remainder is a cost of leaving.
  - netcup's shown price is a 12-month contract, IONOS's promotional price a one-year term,
    Hostinger's cheapest plan a two-year term, OVHcloud's a 12-month prepay, and Contabo's
    discounted price a 24-month term.
- **Property 18b:**
  - Lightsail: "The default dynamic public IP address… changes every time you stop and restart the
    instance". A static IP is free while attached, which passes once attached.
  - DigitalOcean: a reserved IP is free while assigned.
  - Linode: reserved IPs keep the address through a rebuild or migration in the region, at a flat
    hourly rate that was not read.
  - Vultr: a reserved IP is $3 a month.
  - Hetzner: a Primary IP is its own resource at €0.50 or $0.60 a month, per its docs. Its plan pages
    say "Price incl. IPv4", so the two pages disagree.
  - RackNerd charges $3 to change an IP after 72 hours, which implies it is fixed.
- **Property 6:**
  - Still unknown for Lightsail, OVHcloud, netcup, Contabo, IONOS and Hostinger. None of their pages
    says local or network. Lightsail's add-on disks are "automatically replicated within its
    Availability Zone", which describes the add-on, not the system disk.
  - Vultr's pages on 2026-09-29 say "regular SSD" for its cheapest 1 GB plan, and do not say whether
    the disk is local. Its Block Storage is "Network-attached NVMe SSD storage", which is a separate
    product. The 2026-09-27 pass is what records Vultr as local.
- **Property 19:**
  - Passes on Hetzner (Ashburn, Hillsboro), DigitalOcean, Linode, Vultr, Lightsail, RackNerd, BuyVM
    (Las Vegas, New York), netcup (Manassas) and Contabo ("United States").
  - Scaleway fails, as recorded on 2026-09-28.
- **Hetzner's prices have moved.** Read in a browser on 2026-09-29:
  - Every Cost-Optimized plan, the CX23 among them, shows "not available". CX23 is listed at
    "€ 5.99 /month", up from the €5.49 recorded on 2026-09-27.
  - The cheapest plan in a US location is CPX11, 2 vCPU and 2 GB, at "$ 21.09 /month".
  - The agent flagged these as far above past prices and suggested confirming them in Hetzner's
    console.
- **RackNerd's $21.99-a-year plan was not found again.** Its page showed $26.99 a year for 512 MB
  and $17.99 a month for 1 GB. The "lifetime recurring" price is only in third-party reviews.

**Candidates added by rebuilding the field.** One agent listed hosts not yet considered and screened
each on never sleeping, a disk that survives a redeploy, and whether that disk is local:

- **Koyeb.** Its volumes are "local and as such they might fail as they are bound to a single
  machine", and they survive redeploys. They are "currently only suitable for testing", in public
  preview. They attach only to a service at a scale of one, and in North America only in Washington,
  D.C. *Opened by me, [volumes](https://www.koyeb.com/docs/reference/volumes).* Mistral AI announced
  it would acquire Koyeb on 2026-02-17, per an agent's search, not opened. Not yet scored beyond 6, 7
  and 19. Whether a vendor's own "only suitable for testing" label fails a property is for the next
  pass to decide.
- **Out, each on one property, per the agent's reading:**
  - DigitalOcean App Platform fails 7: "App Platform does not currently support volumes".
  - Heroku fails 7: its dyno filesystem is ephemeral. Search summary only.
  - Porter fails 6: its persistent disks are Amazon EFS.
  - Azure VMs fail 6: managed disks are replicated three times.
  - UpCloud fails 6, inferred from its clustered storage design.
- **Unknown on 6:** Zeabur, Sevalla, RamNode, InterServer, HostHatch, Hostwinds and Cherry Servers.
  Oracle's free tier is also unknown on 4, because an idle instance may be reclaimed.
- **Not relevant:** Latitude.sh and Hivelocity sell bare metal starting well above this workload.
  Elestio provisions on providers already listed. Equinix Metal was reported sunset on 2026-06-30.
  PikaPods runs only a fixed catalogue of apps.
- **Not researched:** Bunny Magic Containers, Leapcell and Back4app.

### Second pass 2026-09-29: the remaining unknowns, observed where possible

*Research agents read vendor pages and, where a public app on the platform's default domain could be
found, ran `openssl s_client -tls1_3` and `curl -sI` against it from the maintainer's machine near
Toronto. "Opened by me" marks what the session that wrote this pass fetched itself.*

**Out, each on one property:**

- **Northflank** fails property 6: "New PaaS workloads are now deployed with high-performance
  network-attached NVME with low latency". *Opened by me,
  [November 2025 release](https://northflank.com/changelog/platform-november-2025-release).*

**Observed, TLS 1.3 (property 13):** Render (`corsmirror.onrender.com`), Northflank's `*.code.run`
edge, Sliplane (`mordhaus.sliplane.app`) and Koyeb's `*.koyeb.app` edge each answered `Protocol:
TLSv1.3`. Render, Sliplane and Koyeb pass 13. *Observed by agents, OpenSSL 3.6.3, one host each
except Render and Sliplane with two.*

**Render:**

- 17 passes: its default domain resolves through `cdn.cloudflare.net`, and the response carried
  `server: cloudflare`, `cf-ray: …-YYZ` and `cf-cache-status: DYNAMIC`. So Cloudflare ended the
  connection in Toronto and did not cache the response. No Render page says so. *Observed.*
- 15 is partial: SSH keys are added in the dashboard ("click + Add SSH Public Key"), and the API
  reference has no SSH-key endpoint. Once a key is added, `scp` runs from a script.
- 6: still unknown. No Render statement names the disk's type or location beyond "the same
  high-performance SSDs as Render Postgres".

**Sliplane:**

- 3: its proxy is Caddy (`server: Caddy`), and an app's own `cache-control: private, no-cache…` reached
  the client unchanged. Whether `Set-Cookie` passes was not tested. Still unknown.
- 4 leans pass: pausing is manual ("Pausing a service stops the container"), and no page mentions an
  idle stop. Absence is not a statement, so still unknown.
- 6: still unknown. Its European servers are on Hetzner, and a resolved address's whois reads
  `CLOUD-NBG1`, which suggests Hetzner Cloud. Its pricing calls the disk "NVMe Block Storage", which
  could mean either.
- 15: the API creates servers, volumes and services, and registers SSH keys. Copying a file to a
  volume over SSH was not tried.
- 17 fails without a proxy: TLS ends on the server itself. `*.sliplane.app` resolves straight to
  Hetzner addresses. Under the reading chosen for 17, a proxy in front can still reach it, so it
  passes.
- 14: still unknown.

**Upsun:**

- 7 leans fail. The mounts page says "`tmp` and `instance` are meant to restrict data to build time
  and runtime of a single application instance, respectively", and "Upsun will provide new local
  mounts in the near future". No page says `instance` data survives a redeploy. Still unknown.
- 16 passes on what it asks. Upsun does not build a Dockerfile ("Upsun Cloud does not build a
  Dockerfile from the repository for this app type"), but runs a prebuilt image from a registry.
  Pulling from a private registry is undocumented, so the image would be public.

**Railway:** 6 is still unknown. Its hardware post describes separate storage servers ("12 drives of
NVMe per box, and 4x 100G NICs"), and its volumes are capped at 3,000 IOPS. Both suggest network
storage, and neither says so.

**Koyeb**, scored on the rest:

- Passes 1, 4 (scale-to-zero is opt-in), 5, 9 (`koyeb instances cp`), 12 (a TCP check by default, or
  an HTTP path), 13, 16, 17 (Cloudflare edge, `cf-ray: …-YYZ`) and 18a.
- 8 passes by inference: "Services that have volumes attached may experience downtime during
  redeployment while the volume is detached".
- 2a: subdomains take a CNAME to `<org>.cname.koyeb.app`, and "Koyeb does not support directly
  setting apex domains for most DNS providers" (*opened by me,
  [domains](https://www.koyeb.com/docs/run-and-scale/domains)*). Flattening is not mentioned. Unknown,
  with the apex unsupported.
- 3, 14 and 15: unknown. A volume "cannot currently be detached except if the Service is deleted", and
  snapshots are also in preview.
- Price: new users "will only be able to sign up for" the Pro plan or above (*opened by me,
  [announcement](https://www.koyeb.com/blog/koyeb-is-joining-mistral-ai-to-build-the-future-of-ai-infrastructure)*).
  The agent read Pro as $29 a month with $10 of compute included. Koyeb says it will "double down on
  our Inference, Sandboxes and serverless capabilities".

**Fly.io, property 3: not observed.** A throwaway app was created with three routes under `/api/`: one
with no cache headers, one setting a cookie, and one allowing caching as a control. The deploy
stopped at "We require your billing information", because the maintainer's Fly account has no
payment method. The app was destroyed. Property 3 stays unknown until an account with billing runs
the same spike.

### Extend and zoom, 2026-09-29

**Extended: one property from a moment not yet listed**, the vendor's own statement of what its
storage is fit for.

20. **The vendor offers the storage the store sits on for production data.** Rests on
    [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
    and "Never lose in-progress work" in [../problem.md](../problem.md). A disk the vendor calls fit
    only for testing is a disk it may change or withdraw without the notice a production product gets.

Koyeb fails 20: its volumes are "currently only suitable for testing". No other standing candidate
labels its storage that way on the pages read. That is an absence found while reading for other
properties, not a separate search.

**Zoomed: property 6 on the managed platforms.** Two passes of reading have not settled it on Railway,
Render or Sliplane, and none of them publishes the fact. Reading will not resolve it. What would is a
vendor's written answer, or a measurement that can tell local from network storage. A measurement
here is weaker than it sounds, because latency suggests where a disk is without proving it. Until one
of those, they stand unresolved rather than out.

**Zoomed: the price row, now that two vendors sell something other than their list price.**

- Hetzner's cheapest orderable plan in a US location is CPX11, 2 vCPU and 2 GB, at $21.09 a month.
  Its CX line is shown "not available" everywhere.
- Koyeb's entry is the Pro plan, which the agent read as $29 a month.

**What the table yields at the end of this pass:**

| Candidate | Unknown or failing | Price per month, smallest fit |
| --- | --- | --- |
| DigitalOcean | none | $6, 1 GB |
| Linode | none | $5, 1 GB |
| Hetzner | none | $21.09, 2 GB, US |
| Fly.io | 3, not observed | $1.94 for 256 MB, plus $0.15 per GB of volume |
| Railway | 6 | $5 plus usage |
| Render | 6, and 15 partial | $7 for 512 MB, plus $0.25 per GB of disk |
| Sliplane | 3, 4, 6, 14, 15 | €9 |
| Upsun | 7, leaning fail | not read |
| Vultr | 6 | $5, 1 GB, "regular SSD" |
| Lightsail, OVHcloud, netcup, Contabo, IONOS, Hostinger | 6 | as in the 2026-09-28 pass |
| RackNerd | 15, leaning fail | $17.99 a month for 1 GB, or yearly |
| Northflank | out on 6 | |
| Koyeb | out on 20 | |

**On the technical rows, the complete VPS candidates and Fly do not separate.** On a VPS every
property is ours to satisfy by construction, and Fly passes every property it has been scored on. The
2026-09-27 properties said this might happen, because the questions where a managed platform and a
bare machine differ most were deferred: how the machine is reached, patched and watched. This pass
therefore stops without one candidate, and the next section says what would finish it.

### Third pass 2026-09-29: Fly observed, the field cut, and the maintainer's reasons as rows

**Fly passes property 3, observed.** A throwaway app on Fly served three routes under `/api/` from one
256 MB machine in `yyz`. Each was requested three times from near Toronto:

- One route had no cache headers. Every response was new: its timestamp and UUID changed each time.
- One set a cookie. `set-cookie: sid=abc123; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`
  arrived unchanged all three times.
- One allowed caching with `cache-control: public, max-age=300, s-maxage=300`. Every response was
  still new, so the proxy does not cache even when allowed to.

The proxy added only `server: Fly/…`, `via: 2 fly.io` and `fly-request-id`. The app was destroyed
afterwards. *Measured, 2026-09-29: one run of nine requests, flyctl v0.4.110, Node 24 on Alpine,
requests served by the `yyz` edge.*

**Railway, Render and Sliplane are dropped, on the maintainer's instruction of 2026-09-29.** Each was
held on property 6, which their vendors do not publish. The maintainer said to drop them unless their
price was very compelling, and it is not:

- Railway: $5 plus usage.
- Render: $7 plus $0.25 per GB of disk.
- Sliplane: €9.
- Against: Fly at $2.19 plus $0.15 per GB from 1 October, Linode at $5, and RackNerd at $21.99 a year.

What would reverse it: any of them publishing that its volumes are on local disk at a price below
Linode's.

**Property 15 is split, and the maintainer judged which half binds.**

- **15a. Everything after the machine exists is scripted:** the runtime installed, the store
  restored, the app started. This binds.
- **15b. The machine itself is ordered through an API.** The maintainer judged on 2026-09-29 that
  this does not bind: one manual order, followed by a script, passes. [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)'s Risk is about how
  fast recovery is, and an order that takes minutes changes that little.

RackNerd fails 15b and passes 15a, over SSH:

- Its API manages only a server that already exists. A RackNerd representative pointed to the
  SolusVM client API on LowEndTalk, seen in search only.
- Its terms say a KVM VPS is provisioned "within 30 minutes".
- *The terms were read by an agent, [terms](https://www.racknerd.com/terms-of-service).*

**RackNerd's price, corrected.** $21.99 a year for 1 vCPU, 1 GB and 20 GB of SSD: "These RackNerd VPS
specials are lifetime recurring. You can renew at the same rate". *Opened by me,
[specials](https://www.racknerd.com/specials/).* The second pass's "$17.99 a month" was the regular
plan and is wrong for this candidate.

**Fly's price rises on 1 October 2026.** A draft pull request in Fly's own docs repository, "Machine
prices for 1 October 2026", lists `shared-cpu-1x` at "$ 2.19/mo". *Opened by me,
[superfly/docs#2507](https://github.com/superfly/docs/pull/2507).* Memory rises 20% and CPU does not,
per a Layerbase post that paraphrases Fly's email of 2026-09-21. Layerbase sells a migration off Fly.
Volume snapshots also became billable from 1 January 2026, per an agent's read of Fly's pricing
page.

**Extended: the maintainer's reasons, as rows.** On 2026-09-29 the maintainer said a VPS appeals for
price and because "it's stable and mine", and a managed platform because "it's easy and reasonably
priced". The candidates should be compared on the best combination of those, not by category. Price
is already a row. The rest enter as properties citing that statement. The "easy" rows also rest on
"one person maintains this" in [../problem.md](../problem.md).

*Easy: what the host supplies, so the maintainer need not build, know or keep it working.*

21. **The host issues and renews the custom domain's TLS certificate.**
22. **The host restarts a crashed process.**
23. **The host patches the software beneath our code, and the patch reaches the running machine
    without our step.** This zooms into property 14.
24. **Nothing on the machine is reachable from the internet except what the app serves, without our
    configuring a firewall.**

*Stable and mine.*

25. **A maintenance or hardware event on the host does not take the store offline beyond a
    migration.** This is distinct from the downtime budget deferred to M16. It asks whether the
    host's routine events cost minutes or can cost days, not how many minutes are acceptable.
26. **The price of what we run changes only when we change it.**
27. **We hold root on the whole machine the store sits on**, including its kernel and what sits in
    front of it.

**Scored.** Evidence is an agent's read of vendor pages on 2026-09-29, except where marked "opened by
me". "Ours" means we would build it on this candidate, which fails a row that asks what the host
supplies.

| | Fly.io | DigitalOcean | Linode | Hetzner | RackNerd |
| --- | --- | --- | --- | --- | --- |
| 21 TLS | pass | ours | ours | ours | ours |
| 22 restart | pass | ours | ours | ours | ours |
| 23 patching | partial | ours | ours | ours | ours |
| 24 exposure | pass | ours | ours | ours | ours |
| 25 host events | **fail** | pass | pass | pass | unknown |
| 26 price | **fail** | pass, by absence | pass, by absence | partial | pass |
| 27 root | partial | pass | pass | pass | pass |
| Price per month | $2.19 + $0.15/GB | $6 | $5 | $21.09 | $1.83 ($21.99 a year) |

The sources for each cell:

- **Fly:**
  - 21: "Fly.io uses Let's Encrypt to issue TLS certificates for custom domains". Renewal is implied
    by its rate-limit note rather than stated.
  - 22: "`on-fail` is the default", with up to 10 restarts in 5 minutes.
  - 23: Fly patches the kernel, but "a machine update or application deploy is sufficient to trigger
    the upgrade". So a patch reaches a running machine only on our step.
  - 24: SSH is served on the private network and reached over WireGuard.
  - 25: "Volumes are pinned to physical hosts, so when there's a host outage the volume is
    unreachable", and "A host can be down for an hour, or a day, or sometimes longer". Recovery is
    restoring a daily snapshot into a new volume, losing what was written since. *Opened by me,
    [host unavailable](https://docs.fly.io/apps/trouble-host-unavailable/).* Fly also migrates a
    machine with its volume to another host on its own initiative, stopping it first.
  - 26: the rise on 1 October, above.
  - 27: root inside our micro-VM. Fly owns the kernel and the proxy.
- **DigitalOcean:**
  - 25: live migration is used for "normal infrastructure and network maintenance, software upgrades,
    and hardware failures", with the string `live_migrate` "at least 10 minutes before". *Opened by
    me, [live migration](https://docs.digitalocean.com/products/droplets/details/live-migration/).*
    What happens when a host dies outright is not stated.
  - 26: no change to the entry plans found for 2025 or 2026.
- **Linode:**
  - 25: a host's maintenance migrates the machine live, or powers it off and on, with 3 hours' to
    7 days' notice.
  - 26: the 2023 rise left the $5 plan "unchanged", and no change has been found since.
- **Hetzner:**
  - 25: live migration, including after "a hardware failure on the physical host", after which the
    server "is automatically powered on".
  - 26: a rise on 15 June 2026 applied to new orders only: "Existing servers are not affected by the
    price adjustment, as long as no rescaling is performed."
- **RackNerd:**
  - 25: its maintenance and failure behaviour is not documented. Its terms say "RackNerd.com is not
    responsible for data integrity, regardless of circumstance", and its hardware support is
    "best-effort".
  - 26: the "lifetime recurring" wording above.
  - 6: still "RAID-10 protected Pure SSD", which says neither local nor network.

**What the table yields: a tradeoff between rows 21 to 24 and rows 25 and 26, split along the managed
and VPS line.** No candidate passes both groups. By the decision-making standard, the next step is to
state what the most of each would be, then look for a design that reaches both before accepting the
trade.

- **Most of the easy rows:** nothing to build, know or keep working for TLS, restarts, patching or
  exposure.
- **Most of the stable rows:** the host's own events cost the store minutes, not days, and nothing
  about it changes unless we change it.
- **Designs that might reach both:**
  - **A VPS with the four easy rows automated once.** That means a proxy that renews its own
    certificates, a service manager that restarts the process, automatic security updates including
    reboots, and a firewall allowing only the web ports. This turns "ours" into "built once and
    known", not "supplied". The gap left is the knowing and the fixing when one breaks, which a
    managed host carries instead.
  - **Fly, with row 25's cost lowered by the copy M3 will take.** With a continuous copy off the
    machine, a lost host becomes a restore to a new volume in minutes, not a wait. That depends on
    [how is the store backed up?](how-is-the-store-backed-up.md) at M3, so it cannot be scored now.
    Row 26 has no design fix.
- **Not a design fix:** hosting the store on more than one Fly volume. It needs the store copied
  between machines, which
  [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) does not allow.

### Fourth pass 2026-09-29: Fly's host outage re-read, the maintainer's bar, and uptime without intervention

**Fly's row 25 is re-scored from fail to partial.** Fly's recovery steps can be run while the host is
down: `fly volumes create <volume name> --snapshot-id <snapshot id>`, then `fly scale count 1`, which
creates "a Machine on healthy infrastructure". *Opened by me,
[host unavailable](https://docs.fly.io/apps/trouble-host-unavailable/).* So a host that is down for a
day means the site is down until we notice and run the restore, not for a day. What the restore costs
is data: "We take snapshots once every 24 hours. Any data stored between the time when the snapshot
was taken and the time when the restore is made will not be included." With a continuous copy off
the machine, which [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
requires on any host and [how is the store backed up?](how-is-the-store-backed-up.md) designs at M3,
the loss shrinks to that copy's lag. What stays worse than on a VPS is that more of the host's
problems become a restore we run. DigitalOcean, Linode and Hetzner migrate a machine off a sick host
themselves, while a Fly volume stays pinned to it.

**The maintainer's bar for a VPS.** On 2026-09-29 the maintainer said: "a vps with great observability
and setup scripts could work for me if low maintainance overall". That enters as a row:

28. **Recurring maintenance is near zero after setup. Whatever the host does not supply is done by
    setup scripts and watched by our own monitoring.** Rests on that statement.

Every standing candidate can reach 28, a VPS by scripting rows 21 to 24 once and Fly by scripting
fewer. So 28 separates nothing on its own. Its effect is on rows 21 to 24: per the maintainer, "ours"
on those rows no longer disqualifies a VPS, provided the scripts and the monitoring exist. What is left
between the two tiers on those rows is who fixes a supplied piece when it breaks.

**Asked the same day: is near-100% uptime, needing no interaction from the maintainer, reachable?**
That is [how much downtime is acceptable?](how-much-downtime-is-acceptable.md) at M16 and
[how is the store recovered when the machine is lost?](how-is-the-store-recovered-when-the-machine-is-lost.md),
and neither is settled here. What this question owes them is not to choose a host that forecloses the
answer. So the failures were listed by what causes them, and each host was checked for what it keeps
reachable.

**Each cause of downtime, and what removes it without a person:**

1. **A deploy or restart.** One process at a time holds the store, per
   [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md), so a restart leaves a
   gap.
   - On a VPS, a proxy in front can hold requests across that gap. Caddy's `lb_try_duration` is "how
     long to try selecting available backends for each request if the next available host is down",
     retried every 250ms by default. Connection failures are retried for any method. Untested with a
     single upstream.
   - On Fly, an app with a volume deploys only `rolling` or `immediate`, and no page says the proxy
     holds requests while the one machine restarts. It "might start returning 503 Service
     Unavailable".
   - This is what [the player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md)
     turns on, so it becomes row 30 below.
2. **A crash.** systemd on a VPS and Fly's `on-fail` policy both restart the process without anyone.
3. **Maintenance on the host, or a failing host.** Removed by the provider on DigitalOcean, Linode and
   Hetzner, per the third pass. On Fly it becomes cause 4.
4. **A dead host.** Two designs remove the person:
   - **Automated rebuild.**
     - Litestream streams every write off the machine. Its `sync-interval` "Defaults to `1s`", per
       an agent's read of [config](https://litestream.io/reference/config/). Litestream v0.5.17 was
       released on 2026-08-31, and five releases in two months suggest it is maintained.
     - A watchdog running somewhere else sees the machine gone, creates a new one through the API,
       restores the store and moves the address.
     - The outage is the time this takes, in minutes. The loss is about a second of writes.
     - It needs machine creation by API and an address that can move.
   - **Warm standby.**
     - A second machine keeps a copy current with `litestream restore -f`, which "Continuously
       restores new data as it becomes available" every second by default, opened read-only. *Opened
       by me, [restore](https://litestream.io/reference/restore/).*
     - When the primary is lost, the standby stops following, opens the store for writing, and
       takes the address.
     - Linode moves the address itself: "If the primary Linode becomes inaccessible, the shared IP
       address is automatically routed to the secondary Linode", over BGP with `lelastic` or FRR, and
       both machines need IPv6. *Opened by me,
       [failover](https://techdocs.akamai.com/cloud-computing/docs/configure-failover-on-a-compute-instance).*
     - On DigitalOcean and Hetzner, a script moves a reserved or floating IP through the API.
     - The outage is seconds, and the cost is a second machine.
     - [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) allows this, since
       it "says nothing about redundancy or replication", and [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)'s Revisit when names a warm
       standby as what an outage budget under about ten minutes needs.
5. **The whole provider or region goes down.** Nothing above removes this. Only a second provider or
   region would, and no record asks for one.

**Three safety costs come with removing the person, and each is a design question later, not a host
property now:**

- **Split brain.** If the primary is cut off rather than dead, an automatic promotion can leave two
  machines writing. Litestream's docs name no fencing, and LiteFS, which had it through Consul
  leases, is one Fly says it is "not able to provide support or guidance for" (agent's read,
  [docs.fly.io/litefs](https://docs.fly.io/litefs/)).
- **Acknowledged writes lost in the lag.** Replication is asynchronous, so a write the server confirmed
  can be missing after failover. Whether the client keeps its copy until the write is safe off the
  machine is a question for how syncing works.
- **A monitor that decides wrongly.** It must run away from the machine it watches, and a false alarm
  triggers a failover nobody wanted.

**Provider uptime commitments**, recorded rather than scored:

- DigitalOcean: "Monthly Uptime Percentage of 99.99% for each individual Droplet instance", excluding
  "Scheduled maintenance". *Opened by me, [SLA](https://www.digitalocean.com/sla/cpu-droplets).*
- Linode: "99.99% monthly uptime for Covered Services in general availability".
- Hetzner: "economically reasonable efforts to achieve an annual average network availability of
  99.9%". This covers the network, not each server.
- Fly: 99.9% a month for Enterprise customers.
- All but DigitalOcean's were read by an agent.

**Properties added from this:**

29. **Recovery from a lost host can run with no person: a machine is created through the API, and the
    address moves to it by API or by routing.** Rests on the maintainer's goal of 2026-09-29 and on
    [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)'s
    Risk, that how automated recovery is decides the outage. This makes 15b bind again, for this goal,
    after the maintainer judged earlier the same day that it did not. That judgement was made before
    this goal was stated, so it is raised with the maintainer rather than overturned here.
30. **A deploy or restart of the one process does not fail a request.** Rests on
    [the player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md).

| | Fly.io | DigitalOcean | Linode | Hetzner | RackNerd |
| --- | --- | --- | --- | --- | --- |
| 25 host events | partial | pass | pass | pass | unknown |
| 26 price | fail | pass, by absence | pass, by absence | partial | pass |
| 27 root | partial | pass | pass | pass | pass |
| 28 low maintenance | reachable | reachable | reachable | reachable | reachable |
| 29 no-person recovery | pass: API, anycast | pass: API, reserved IP | pass: API, BGP failover | pass: API, floating IP | **fail**: no API to order |
| 30 restarts drop nothing | unknown, no hold documented | reachable, proxy in front | reachable | reachable | reachable |
| Price per month | $2.19 + $0.15/GB | $6 | $5 | $21.09 | $1.83 |

**What the table yields, and how firmly:**

- **Out:** RackNerd, on 29, if the maintainer confirms 29.
- **Hetzner separates from Linode only by price**, four times higher in the US.
- **Fly** fails 26, is partial on 25 and 27, and is unknown on 30.
- **DigitalOcean and Linode pass every row.** Linode alone moves its address to a standby itself.
- **How firm it is:**
  - Row 26's passes for DigitalOcean and Linode are an absence of any rise found, not a promise.
  - Row 30 is reasoned from Caddy's documentation, not observed.
  - Row 29's warm standby has not been built on any candidate.

### Fifth pass 2026-09-30: row 29 weighed rather than disqualifying, and an extend-and-zoom on what stands

**Row 29 does not disqualify.** The maintainer said on 2026-09-30: "let's not fail purely because of
29; let's factor it in; a system that stays up while i'm sleeping is obviously much more reliable than
one that waits for me to react but the price is so appealing that it's not enough by itself to
decide". So RackNerd stays in the field, and its fail on 29 counts against it without removing it.

**Extended, before any research: the properties from moments not yet listed.** The maintainer asked
the same day that DigitalOcean and Linode be separated on "how performance and especially
safety/reliability will affect DX and UX if relying on those platforms to host the site and
potentially its future background workloads", and said the $1 difference is insignificant. Fly,
Hetzner and RackNerd are scored where the same evidence covers them.

The moments:

- a background job, such as puzzle generation, running beside the server;
- a write committing to the store's disk;
- the provider's own incident, or an action on the account;
- a copy of the store leaving for somewhere that survives losing the provider;
- a second machine joining, as a standby or a worker;
- the maintainer finding out something is wrong, and looking into it.

The properties:

31. **A CPU-heavy background job can run without slowing the request path.** Either the host sells
    dedicated CPU at a modest price, or a second machine can sit beside the first on a private
    network. Rests on "The interactive path over batch throughput" in [../problem.md](../problem.md)
    and the maintainer's mention of future background workloads. No record places the generator on
    this host. That is why this is scored as reachable, not as a present need. It reverses the
    earlier "A neighbour taking CPU" non-binding only in the case where a job does run here.
32. **A committed write reaches durable storage quickly on the smallest plan.** Every write the store
    takes waits on it. Rests on [ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) and
    [ADR-0042](../decisions/0042-the-stores-disk-is-inside-its-machine-not-reached-over-a-network.md).
    A figure found in reading is a hypothesis until measured here.
33. **The provider's incidents are rare, disclosed and short, and an action on the account comes with
    notice before the machine stops.** Rests on the maintainer's "stable" and on the failure list of
    2026-09-28: "An action on the provider's side, such as an account suspension, a billing error or
    an outage upstream of the provider, takes the machine offline."
34. **The host offers the pieces a no-person recovery and a standby are built from, at modest cost:**
    a private network between machines, object storage for a continuous copy, and a firewall set
    outside the machine. Rests on row 29, and on
    [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md).
    Whether the copy should live with another provider, so that losing the account does not lose the
    copy, belongs to [how is the store backed up?](how-is-the-store-backed-up.md).
35. **The host watches the machine and alerts on it without our running anything, as a floor beneath
    our own monitoring.** Rests on the maintainer's "great observability" bar in row 28.
36. **The provider's stewardship of the small plan looks durable.** Rests on
    [ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md).
    Leaving costs a redeploy and a copy, per row 16, so this weighs little, and it enters as a row
    only to be scored.

**Checked and found binding on nothing:** each provider's region count, since both have Toronto and
several US regions. Also the uptime commitment, recorded in the fourth pass as 99.99% for each.

**Row 30, observed locally**, on 2026-09-30:

- **The setup.** A Node 26 server held a SQLite file with an exclusive lock and answered a GET that
  read and a POST that wrote. A load generator ran 20 concurrent clients for 20 seconds, alternating
  GET and POST, while the process was restarted five times, once every 4 seconds. Each acknowledged
  write was then checked against the file.
- **Every run lost no acknowledged write.**
- **The counts of failed requests, on macOS (Apple silicon):**
  - Straight to Node: about 28,800 refused connections.
  - Through Caddy 2.11.4 with `lb_try_duration 10s`: 10 to 32 failed POSTs per run, across three
    runs. They are `read: connection reset by peer`, and Caddy does not retry a POST once it has sent
    it.
  - With the listening socket held across restarts by a supervisor, as systemd socket activation
    does: still 18 to 31.
  - Held socket and Caddy's upstream keep-alive off: 1 to 3, across five runs.
- **The counts on Linux**, in `node:24-bookworm` under Docker (kernel 6.12, Node 24.21.0):
  - Caddy alone: 45 to 58 failed POSTs.
  - Held socket, keep-alive off, and the old process draining its connections on SIGTERM instead of
    closing idle ones: **0 failures in each of three runs**, about 326,000 requests and 15 restarts.
  - A crash (SIGKILL) under the same setup: 5 failed POSTs, and one write committed that its client
    never saw acknowledged.

So on a VPS, row 30 is reachable for a planned restart, with three pieces: a supervisor that holds the
socket, a proxy that does not reuse upstream connections, and a server that drains. A crash still
fails what was in flight, and can commit a write whose client retries it. That makes writes needing
to be safe to retry a finding for
[what happens to a losing write when syncing?](what-happens-to-a-losing-write-when-syncing.md), not a
host property. *Measured on one laptop, one Linux container and three to five runs per setup. The
Linux runs are the ones that count, since production runs Linux. Not measured: a real VPS, TLS, and
the real server.*

**Row 30, observed on Fly**, on 2026-09-30:

- **The setup.** The same server ran on one `shared-cpu-1x` 256 MB machine in `yyz`, with its store
  on a Fly volume and `kill_signal = "SIGTERM"`. A laptop near Toronto ran 10 concurrent clients for
  100 seconds while the machine was restarted three times with `fly machine restart` and replaced
  once with `fly machine update`, as a deploy does.
- **Run 1:** 7 failed requests, 4 GET and 3 POST, all `502`.
- **Run 2:** 13 failed requests, 4 GET and 9 POST.
- **Both runs:** the longest request took about 15.2 seconds, so the proxy held some requests through
  a restart and gave up on others. No acknowledged write was lost.
- **Fly fails row 30.** A single machine with a volume can deploy only `rolling` or `immediate`, so
  nothing on Fly's side keeps a socket open across the restart. The app was destroyed afterwards.

*Measured, two runs, flyctl v0.4.110, Node 24 on Alpine.*

**Research on rows 31 to 36**, by agents reading vendor pages and status histories on 2026-09-30.
"Opened by me" marks what the session that wrote this pass fetched itself.

- **31, a CPU-heavy job beside the server:**
  - Private networking between machines is free on both. DigitalOcean: "Network traffic is free within
    a VPC network". Linode: "VPCs are provided at no additional cost".
  - Linode's shared CPU "should remain below 80% sustained usage on average" (*opened by me,
    [shared CPU](https://techdocs.akamai.com/cloud-computing/docs/shared-cpu-compute-instances)*), so
    a generator pinned at 100% belongs on a dedicated plan or its own machine. DigitalOcean documents
    no ceiling, which is an unknown rather than a pass.
  - The cheapest dedicated CPU is $36 a month on Linode (2 vCPU, 4 GB) and $42 on DigitalOcean.
  - Both reach 31 through a second machine on the private network.
- **32, a committed write reaching disk:**
  - Neither vendor publishes an fsync latency.
  - The only published disk figures are single VPSBenchmarks runs in 2024, of fio without fsync, in
    different regions. DigitalOcean's 1 GB plan read about 26,400 random-write IOPS and Linode's
    about 25,400. They do not measure what 32 asks.
  - DigitalOcean's cheapest plans are "Regular" SSD. Its NVMe is on "Premium" plans, per an agent's
    read and a search summary.
  - Unknown on both. Only a measurement on a real machine in Toronto settles it.
- **33, incidents and account actions:**
  - An agent counted each provider's status history for 2025 and 2026 and reported a Linode incident
    on "Cloud Manager, API, and CLI - All Regions" as seven days long, 26 August to 2 September 2025.
  - The incident itself shows about an hour of total loss on 26 August, partial service after it, a
    recurrence of under half an hour overnight, and maintenance that closed it out. *Opened by me,
    [incident](https://status.linode.com/incidents/10wt69vh152l).*
  - So the time between an entry opening and closing is not how long the impact lasted, and neither
    provider's counts can be scored on duration without opening each one.
  - What does separate them is disclosure. Linode posted about 30 postmortems between April and
    September 2026, against one DigitalOcean postmortem in its last 50 incidents.
  - Neither promises notice before stopping a machine for an account action. DigitalOcean emails the
    account owner when a payment is past due and publishes no timeline before it powers down.
    Akamai's policy says it will notify "where appropriate". Both are the agent's reading.
- **34, the pieces recovery is built from:**
  - DigitalOcean offers object storage in Toronto, "Minimum Monthly Price: $5/month". A reserved IP
    moves by one API call and is free while assigned.
  - Akamai's object storage table lists no Toronto region (*opened by me,
    [endpoint types](https://techdocs.akamai.com/cloud-computing/docs/endpoint-types)*), so a Toronto
    Linode's copy would go to Chicago or Newark. That is a different failure domain, which may be
    what [how is the store backed up?](how-is-the-store-backed-up.md) wants anyway.
  - Linode's IP Sharing moves the address itself, in Toronto among other regions, but needs `lelastic`
    or FRR on both machines and IPv6.
  - Both offer free firewalls outside the machine.
  - On DigitalOcean the standby can watch the primary itself and move the reserved IP with one API
    call. So the gap on 29 between Linode moving the address and DigitalOcean moving it is a script
    of similar size, not a missing capability.
- **35, the host watching the machine:**
  - DigitalOcean's free Monitoring alerts on CPU, load, memory, disk use, disk I/O and bandwidth, by
    email or Slack, through an agent on the machine. It also sells uptime checks run from outside:
    "Each Uptime check costs $1.00 per month", with one credited free. *Pricing opened by me,
    [uptime](https://docs.digitalocean.com/products/uptime/details/pricing/).*
  - Linode's alerts cover CPU, disk I/O, traffic and the transfer quota, with no memory or disk-space
    alert, and no uptime check was found. Its Cloud Pulse monitoring does not yet cover compute.
  - DigitalOcean passes and Linode is partial.
- **36, stewardship:**
  - DigitalOcean is a public company whose growth is in AI. Its $4 and $6 plans are unchanged.
  - Akamai held the $5 Nanode through a 20% rise in 2023, has closed its Washington region to new
    customers, and talks about its cloud in terms of AI inference.
  - Neither has said anything since about its smallest plan. With row 16 keeping leaving cheap, this
    weighs little, and it does not separate them.

**Scored, 2026-09-30:**

| | DigitalOcean | Linode |
| --- | --- | --- |
| 29 no-person recovery | pass: API, reserved IP | pass: address moved by the provider |
| 30 restarts drop nothing | reachable, observed on Linux | reachable, observed on Linux |
| 31 CPU job beside the server | pass through a second machine; shared-CPU ceiling unknown | pass through a second machine; 80% sustained ceiling on shared CPU |
| 32 fsync latency | unknown | unknown |
| 33 incidents and account actions | no separation; one postmortem seen | no separation; about 30 postmortems |
| 34 recovery pieces | pass, object storage in Toronto | pass, object storage elsewhere |
| 35 host monitoring | pass | partial |
| 36 stewardship | no separation | no separation |

**What the table yields.**

- DigitalOcean leads on 35, the observability the maintainer named as their bar.
- Linode leads on disclosure under 33, and moves the address itself under 29, though the second
  shrank to a script of similar size once the standby can call DigitalOcean's API.
- 32 is unknown on both, and it is the one row every write depends on.
- The maintainer's own monitoring, required by 28, lowers what 35 is worth. That is why DigitalOcean's
  lead there is a lead, not a decision.

### Sixth pass 2026-09-30: row 32 dropped, and what recovery costs

**Row 32 is dropped, per the maintainer on 2026-09-30**, because measuring it is hard and nothing
showed it could matter.

- **Performance.** At one input every one to three seconds per player, even 10ms per fsync allows
  about 100 commits a second in series. Those 10ms sit inside a mobile round trip of 270ms or more,
  per "Mobile networks" in [../constraints.md](../constraints.md). *Reasoned.*
- **The case that would matter is network storage**, which row 6 already excludes.
- **What remains is whether an fsync is honest, not how fast it is.** A virtualised disk whose write
  cache acknowledges before the data is durable loses those writes when the host loses power. No
  latency measurement detects that, and it applies equally to every candidate. The continuous copy
  off the machine is what covers it. It belongs to
  [what durability settings does the store run with?](what-durability-settings-does-the-store-run-with.md).

**What recovery costs, by design.** The fourth pass's two designs for row 29 differ in what they cost,
and the price rows so far showed only one machine.

- **Automated rebuild.** One machine, plus object storage for the continuous copy. The outage is
  minutes and the loss about a second of writes.
  - DigitalOcean: about $11 a month ($6 plus Spaces at $5).
  - Linode: about $10 ($5 plus Object Storage at $5).
  - The copy could sit with another provider for less. That is not priced here.
- **Warm standby.** A second machine following the copy. The outage is seconds and the compute cost
  doubles: about $17 on DigitalOcean and $15 on Linode, storage included. Linode's provider-run
  address failover exists only in this design.
- **What the extra machine buys** is minutes against seconds on a dead host. That event is rare,
  since host maintenance on both is already handled by live migration.

**Vultr is next.** It is the one mainstream VPS left unresolved on row 6, and the maintainer asked on
2026-09-30 for its reliability and price stability to be compared with the others.

### Seventh pass 2026-09-30: Vultr

*Vultr's main site, status page, SLA and terms returned 403 to the research agent's fetches, so those
cells rest on search summaries unless marked. Its docs site and its public API were readable.
"Opened by me" marks what the session that wrote this pass fetched itself.*

**Scored on the rows that separated DigitalOcean and Linode:**

- **Row 6 passes.**
  - Local storage "is directly attached to the instance", the "inbuilt storage of your compute
    instances". Its drawback: "Lower data reliability as the data is not replicated across a highly
    available cluster". Block Storage is the replicated product. *Opened by me,
    [storage types](https://docs.vultr.com/introduction-to-object-block-file-system-and-local-storage).*
  - The High Frequency page calls its disk "local NVMe storage", read by the browser agent.
  - The same docs say "All servers, except entry-level options, feature high-performance NVMe disks".
  - The maintainer found "local" on Vultr's High Frequency page, a MassiveGRID post and a Reddit post.
    MassiveGRID sells a competing product. The Reddit post has one upvote and contradicts itself.
- **Row 19 passes.** Vultr's public plans API lists `vc2-1c-1gb` at $5 ("SSD"), and `vhf-1c-1gb`,
  `vhp-1c-1gb-amd` and `vhp-1c-1gb-intel` at $6, all available in Toronto. *Queried by me,
  `api.vultr.com/v2/plans`.*
- **Row 25 leans fail.**
  - No Vultr page found says it live-migrates a machine. DigitalOcean, Linode and Hetzner each
    document that they do.
  - A maintenance notice quoted by a third party reads "this reboot will not be as clean as if it were
    done from within your OS", which describes a host reboot.
  - The Reddit post reports two maintenance reboots of about 30 seconds in eight months on High
    Frequency. MassiveGRID claims "no live migration, no automatic VM restart on a healthy host".
  - Neither is strong evidence, and Vultr documents nothing either way. Unknown, leaning fail.
- **Row 29 passes.**
  - The API creates an instance with cloud-init user data: "Vultr API requires base64-encoded
    user-data in the JSON payload".
  - A reserved IP moves between instances, and costs "$0.004 per hour ($3/month)" whether attached or
    not. DigitalOcean's is free while attached.
- **Row 34 is partial.** Vultr's object storage lists no Toronto cluster. The nearest are `ewr`, `ord`
  and `atl`. *Queried by me, `api.vultr.com/v2/object-storage/clusters`.* Its price is $18 a month
  for the standard tier, per a search summary, against $5 at DigitalOcean and Linode. A copy with
  another provider would avoid it.
- **Row 35 is partial, the weakest of the three.** Built-in monitoring shows "vCPU Usage", "Disk
  Operations" and "Network", with no memory and no threshold alerts found.
- **Row 33 is unscored.** The status page could not be read. The SLA is reported as a "100% uptime
  guarantee", with scheduled maintenance on 24 hours' notice excluded. Payment failure can lead to
  suspension with no grace period stated: "Vultr may suspend or terminate your subscription, access
  to services, or account if payment is not received on time or your payment method fails."
- **Row 26 passes by absence**, as DigitalOcean and Linode do. No price increase to Cloud Compute was
  found. Its object storage was relaunched in March 2025 at two to three times the old price, per
  third-party reports only.
- **Row 36.** Vultr raised $333 million at a $3.5 billion valuation in December 2024, led by LuminArx
  and AMD Ventures, its first outside equity. Its focus since is GPUs, per CNBC and Vultr's blog, as
  summarised by search. Nothing was found about its small plans.

**Against DigitalOcean and Linode, Vultr is equal on rows 6, 19, 26 and 29 and behind on 25, 34 and
35.** The row 25 gap is the one that matters, since it decides whether routine host maintenance costs
an unannounced reboot. It rests on an absence of documentation, not on a statement. A written answer
from Vultr on live migration would settle it.

**Vultr is dropped, per the maintainer on 2026-09-30**, as trailing DigitalOcean and Linode on rows
25, 34 and 35. What would reverse it: Vultr stating in writing that it live-migrates machines for
host maintenance, at a price below Linode's.

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

**A dependency to keep visible.** A VPS setup's E1 to E4 turn on deploy tooling, such as Kamal or
Coolify, which [what deploys the code?](what-deploys-the-code.md) owns and which waits on this
question. The pass scores a VPS setup both with and without such a tool, rather than choosing the tool
here.

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

- **P0. The whole setup costs about $10 a month or less.** The maintainer said on 2026-09-30: "$10
  usd / month is about as high as I would ideally want to go if possible; not a hard line, but $20
  usd/month becomes likely too expensive". That rules out every managed-database setup in the eighth
  pass unless their prices change. It is not a hard line, so a setup over it is marked rather than
  dropped.
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

### Open at the end of the ninth pass

*The next pass replaces this entry rather than adding beneath it.*

1. **The maintainer confirms A1**, or weighs A2 or A4 differently.
2. **Then the records.**
   - [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) is amended with
     the eighth pass's scoring.
   - A record is drafted for this question.
   - Row 8's over-strict reading is corrected wherever it appears.
   - Two findings go to their own questions: the Docker Desktop mount trap to
     [how is the store reached in local development?](how-is-the-store-reached-in-local-development.md),
     and B2 as the copy's home to [how is the store backed up?](how-is-the-store-backed-up.md).
