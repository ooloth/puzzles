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
[What execution shape does the server have?](what-execution-shape-does-the-server-have.md) settles
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
