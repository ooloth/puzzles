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

Two things constrain the answer from outside. Same-origin serving keeps a server-set cookie inside
Safari's first-party exemption, per [../constraints.md](../constraints.md), so a platform that
cannot serve the client and the API from one origin is not a candidate. And whatever the browser
resolves before it reaches the platform is its own question — see
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md).

## What would settle it

Knowing the execution shape, then pricing only the platforms that fit it.
[Is the store a file or a service?](is-the-store-a-file-or-a-service.md) settles
whether the store is a file the process opens or a service it connects to, and that is what decides
which platforms can host this at all.

**The field has not been rebuilt since that became a separate question.** The candidates below were
gathered while a local database file was treated as a fixed requirement, so the list is shaped by an
assumption that is no longer in force, and platforms that would have been excluded by it were never
written down. Rebuild the field from scratch once the shape is known rather than pricing this list.

A platform is also cheap to try. Deploying the same trivial application to two candidates costs an
afternoon and answers questions about build times, cold starts and how much of the operational
surface turns out to be yours that no comparison page will.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Options and findings ported from legacy ADR-12 (host on Fly.io).

## Options

**Everything below is prior research, not a shortlist.** It records what one round of comparison
looked at, under an assumption that has since been removed. Every figure dates from 2026 with no
link recorded, and every reputational claim is sourced to unnamed community reports. None of it
decides anything until it has been re-checked against the vendor.

*Fly.io.* Managed micro-VMs. TLS, health-checked restarts and Prometheus/Grafana without running any
of it yourself. An optimised configuration — one `shared-cpu-1x`, 256MB, shared IPv4, scheduled
volume snapshots disabled — was costed at roughly $2.40-3/month. Against it: shared-CPU steal,
per-app billing that does not amortise across deployables, and volume snapshots billed with
compounding retention.

*Hetzner.* A bare VPS, roughly $4.59/month for 2 vCPU and 4GB. More compute headroom, simpler
tooling, fixed predictable cost. Full operational ownership — patching, TLS, monitoring — with no
managed offset.

*Google Compute Engine e2-micro, "Always Free".* Roughly $3-4/month once its external IPv4 fee is
counted, so not free. Locked to three US regions, with a tighter compute ceiling and real GCP
console complexity.

*DigitalOcean or Linode.* Roughly $24/month for specs equivalent to Hetzner's — around five times
the cost with no capability gap relevant here.

*Cloudflare, Google Cloud Run, and the rest of the serverless and edge tier.* Previously set aside
on the assumption that a database file on a local disk was required. That assumption is not in
force: [ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) requires
the store to be queryable, which several managed and edge databases are. These are candidates again,
and they have not been researched.

*Coolify on a VPS.* Adds a second control plane to maintain; pays off only with a genuinely
multi-app future.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Scale is not an input here.** The audience in [../problem.md](../problem.md) is deliberately small,
so [what load should the server handle?](what-load-should-the-server-handle.md) does not discriminate
between any candidate.

**Origin topology is a factor here, and it fails silently.** If sessions are carried by a cookie,
Safari caps a server-set cookie back to seven days when it judges the setting server not genuinely
first-party — which is the shape of a static host with its API on another origin, per
[../constraints.md](../constraints.md). Serving the client and its API from one origin avoids the
test entirely. A bearer token in script-writable storage avoids it too, at the cost of living in
storage the browser evicts and being reachable by any script that runs on the page. Neither is
forced; what is forced is that this gets chosen rather than inherited from wherever the two things
happen to be deployed.

*Sourced — per [../constraints.md](../constraints.md).*

**Topology decides whether cheap recovery is possible at all.** A server-set cookie is the only
identifier that survives Safari's storage wipe without asking the player for anything. So this
question has to be settled with the recovery mechanism in mind rather than after it, which makes it
costlier to reverse than its price comparisons suggest.

*Sourced — per [../constraints.md](../constraints.md).*

**Structural platform facts, which need re-checking but are not price claims.** Fly volumes are
single-attach without LiteFS, so two processes sharing one file must sit on one machine. Cloud Run
has an ephemeral filesystem and a hard sixty-minute request timeout. Cloudflare Workers has no
persistent process and no local filesystem. Fly's per-app billing scales roughly linearly per
deployable with no bundling discount across apps.

*Unverified — no source recorded.*

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
volume, a plain machine, and the managed tier. Cloudflare Containers specifically was not checked for
this — its documentation was read for what it is *for*, not for what its disk guarantees.

*Unverified — the question has been posed and not answered.*

**Figures and reputational claims.** Every price above dates from 2026 research with no links
recorded. The claim that Fly's `shared-cpu-1x` tier suffers sustained CPU steal — described as 70%
or worse on some hosts, with a free destroy-and-reclone as the first remedy and `performance-1x` a
3-10x cost jump — is sourced to unnamed community reports. Useful as orientation about what to look
into; not evidence.

*Unverified — no source recorded.*

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

*Mined 2026-09-02 from two question files since resolved and deleted. Each was verified at the tier
stated; the ones marked second-hand were not opened by me.*

**Whether a platform sleeps is now a first-order property rather than a detail.** The waiting-moment
enumeration found that seven of nine blocking moments are first contact after a gap, and that this is
structural rather than a consequence of low traffic — see
[is the store a file or a service?](is-the-store-a-file-or-a-service.md) for the
derivation. So wake-up latency lands on most waits in the product, and it does not improve with growth.

**Fly.io distinguishes suspend from stop, and only one of them is fast.** Resume from suspended is
"a few hundred ms"; cold start from fully stopped is "~2+ seconds for common apps". Stopping a
suspended machine invalidates its snapshot, forcing a cold boot next start. Fly's own docs warn that
resuming from suspend can produce clock skew affecting JWT validation, cron and TLS checks, and
recommend `stop` over `suspend` for clock-sensitive apps.

*Sourced — [fly.io/docs/reference/suspend-resume](https://fly.io/docs/reference/suspend-resume/),
second-hand from a research agent 2026-09-02.*

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
the production of the project, including a paid employee or consultant writing the code." Donations
are named as commercial usage.

*Sourced — Vercel's pricing and fair-use pages, second-hand from a research agent 2026-09-02.*

**Cloudflare began hard-enforcing D1's free-tier daily limits on 2026-09-01.** Exceeding them returns
errors rather than billing: "When your account hits the daily read and/or write limits, you will not be
able to run queries against D1." Free plan is 5 GB storage, 5 million rows read/day, 100,000 rows
written/day.

*Sourced — [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) opened and read by me
2026-09-02 for the limits and the failure behaviour. The 2026-09-01 enforcement date is second-hand
from a research agent citing Cloudflare's changelog, and I did not open it.*

**A managed platform's control plane can take its own backups down with it.** In May 2026 Google Cloud
auto-suspended Railway's production GCP account; customer databases went offline and customers could
not retrieve their backups, because backup storage sat behind the same control plane. Blast radius was
set by a dependency the customer did not choose and could not see.

*Sourced — second-hand from a research agent cross-referencing InfoQ and Railway's status history. Not
opened by me; re-check before this decides anything.*

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
