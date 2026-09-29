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

Pricing the platforms that fit the shape, which is now known. Four records settle it: the store is a
SQLite file the server process opens
([ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md),
[ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md)), on the same machine as the process
([ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md)), on a disk that survives
restart and redeploy ([ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)),
in an ordinary runtime that never scales to zero on the request path
([ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md),
[ADR-0018](../decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md)).

**So a candidate has to offer four things**: an ordinary long-running process, a local disk beside it,
that disk surviving a redeploy, and a deploy model that never runs two processes against one volume.

**What is still genuinely open is whether that machine is managed or bare**, and that is most of what
this question now decides. Both satisfy every record above — a managed platform with a persistent
volume qualifies exactly as a rented virtual machine does — and they differ enormously in how much of
[how is the server operated?](how-is-the-server-operated.md) and
[how is the server reached and hardened?](how-is-the-server-reached-and-hardened.md) they supply.

A platform is also cheap to try. Deploying the same trivial application to two candidates costs an
afternoon and answers questions about build times, cold starts and how much of the operational
surface turns out to be yours that no comparison page will.

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

**Cost enters as a row once the technical rows stop separating candidates.** It rules nothing out
before that. Per the maintainer on 2026-09-27, recorded in
[what is the acceptable running cost?](what-is-the-acceptable-running-cost.md), free is strongly
preferred for roughly the first year. What counts as free, strictly $0 or under some yearly amount,
has not been stated.

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
published prices against the vendor. Against it: shared-CPU steal,
per-app billing that does not amortise across deployables, and volume snapshots billed with
compounding retention.

*Hetzner.* A bare VPS. Its 2 vCPU / 4GB CX23 is €5.49/month since the 15 June 2026 price
adjustment, but that line is EU-only and its order page showed it unavailable on 2026-09-27; the US
locations carry only the CPX line, whose price was not confirmed. See the 2026-09-27 pass below. Full
operational ownership — patching, TLS, monitoring — with no managed offset.

*Google Compute Engine e2-micro, "Always Free".* Not free once an external IPv4 is counted, whose fee
was not confirmed on a Google page. Locked to three US regions (`us-west1`, `us-central1`,
`us-east1`), with a tighter compute ceiling and real GCP console complexity.

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

| Candidate | Fails | Why |
|---|---|---|
| DigitalOcean App Platform | 7 | "App Platform does not currently support volumes"; "Every redeployment of your app will reset the filesystem" |
| Heroku | 7 | "Any files written get discarded the moment the dyno stops or restarts" |
| Deno Deploy | 7 | No persistent disk; its docs point to KV or object storage |
| Koyeb | 2 | "Koyeb does not support directly setting apex domains"; its workaround is a redirect to `www`, which also costs a round trip [ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md) property 4 forbids |
| Val Town | 4 | "After some inactivity with no new requests, the HTTP process is terminated" |
| Azure App Service free tier | 4 | "Always On... is not available on the Free or Shared tiers" |
| Oracle Always Free | 4 | "Idle Always Free compute instances may be reclaimed": 7 days under 20% CPU at the 95th percentile and under 20% network, which an idle small app meets. It passes only if kept artificially busy |
| Free tiers of Render, Koyeb and Zeabur | 4 | Each sleeps, and Render's and Koyeb's also refuse a persistent disk |
| PikaPods | 5 | Deploys only from its own catalogue |
| Glitch | — | App hosting shut down 2025-07-08 |
| A machine at home behind Cloudflare Tunnel | 2 | The domain must point at `<UUID>.cfargotunnel.com` and resolves to Cloudflare's proxy |

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

**Which platform volumes are local is known only for Fly and Koyeb.** Fly: "a volume exists on one
server in a single region — it is not network storage". Railway says only that "all of Railway's disks
are NVMe SSDs", and Render only that its disks "use the same high-performance SSDs as Render
Postgres". Neither says local or networked, and neither documents what happens to a volume when its
host fails. Northflank states neither the disk type nor whether its free Sandbox can attach a volume.

*Sourced — Fly's [volumes overview](https://docs.fly.io/volumes/overview/), Railway's
[Metal](https://docs.railway.com/railway-metal) and Render's [disks](https://render.com/docs/disks),
read by agents. Render's community forum could not be reached from the sandbox.*
