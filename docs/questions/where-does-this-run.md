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

...

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
- Volumes "are based on the networked block storage model". A block device is not a network
  filesystem, so [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) does not
  rule them out on its own terms. The server's own disk is "local NVMe SSD".
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
