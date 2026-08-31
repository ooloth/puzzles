---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Where does this run?

## Why it matters

Previously settled and now reopened. If the client owns state, the persistent-local-disk
requirement that disqualified several platforms may no longer apply, which puts them back in
contention.

## Blocked by

[where puzzle state lives](does-puzzle-state-live-on-the-client-or-the-server.md) and
[what the server stores](what-does-the-server-store-if-anything.md). Don't decide this one
first — it was decided first last time.

[Are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md).

[What load should the server handle?](what-load-should-the-server-handle.md).

[Is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md) and
[is home-screen install required for durability?](is-home-screen-install-required-for-durability.md)
— together these decide whether a server is needed at all, which comes before where one runs.

## Blocks

[how much downtime is acceptable](how-much-downtime-is-acceptable.md),
[what the acceptable running cost is](what-is-the-acceptable-running-cost.md), backup and
recovery approach.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Finding drawn from legacy ADR-03 (use SQLite as the data store).

Options and findings ported from legacy ADR-12 (host on Fly.io).

## Options

This is two questions stacked, and the previous round of thinking only asked the second. **What
kind of thing is needed** comes first; **where that thing runs** only becomes meaningful once it
is answered.

### What is needed

*Nothing beyond static hosting.* Pre-generated puzzles ship as static data alongside the app;
progress lives in client storage; there is no request to make. Every promise in
[../guarantees/](../guarantees/) that has been made so far survives this — instant input, offline
play, same-device resume, no account — because none of them requires a round trip. What it cannot
do is move progress between devices, and it has no second copy of a player's work when the browser
evicts the first.

*A storage endpoint with no application logic.* Somewhere to put an opaque blob per player and get
it back. Enough for cross-device resume and for surviving eviction; not enough to validate,
generate, or know anything about a puzzle. Buildable on object storage or a small function with a
key-value store behind it.

*A full application server.* Runs logic, holds a database, can generate on demand, can enforce
things. Everything the previous design assumed, and the only option the previous round considered.

### Where it runs

Only the third of those needs a long-lived process with a disk. The first is any static host or
CDN. The second is compatible with serverless platforms, which the previous reasoning excluded
outright. The third has the candidates that were actually researched, named below with the
figures they were researched with — all from 2026, none carrying a source, all needing re-checking
before they decide anything.

*Fly.io.* Managed micro-VMs. TLS, health-checked restarts and free Prometheus/Grafana without
running any of it yourself. An optimised configuration — one `shared-cpu-1x`, 256MB, shared IPv4,
scheduled volume snapshots disabled — was costed at roughly $2.40-3/month, the cheapest viable
option found. Against it: shared-CPU steal, per-app billing that does not amortise, and volume
snapshots billed with compounding retention.

*Hetzner.* A bare VPS, roughly $4.59/month for 2 vCPU and 4GB. More compute headroom, simpler
tooling, fixed predictable cost. Full operational ownership — patching, TLS, monitoring — with no
managed offset. Previously kept as the named upgrade path rather than the starting choice.

*Google Compute Engine e2-micro, "Always Free".* Roughly $3-4/month once its external IPv4 fee is
counted, so not free. Locked to three US regions, with a tighter compute ceiling and real GCP
console complexity.

*DigitalOcean or Linode.* Roughly $24/month for specs equivalent to Hetzner's — around five times
the cost with no capability gap relevant here.

*Google Cloud Run, or Cloudflare Workers with D1.* Excluded previously for architectural
mismatch rather than price. Back in contention if the server needs less than a database.

*Coolify on a VPS.* Adds a second control plane to maintain; pays off only with a genuinely
multi-app future.

## Findings

**The option set that was researched contained only one of the three tiers above.** Every
candidate weighed was a place to run a long-lived process with a disk attached, because a local
database file was treated as a fixed requirement. That a server might be unnecessary was not
rejected on its merits — it was never raised. This is the third time that shape has appeared,
after a data store question that compared two relational databases and never considered less than
a database.

**SQLite on a local disk is what disqualified the serverless platforms**, since they offer no
persistent filesystem for a database file to live on. That disqualification is contingent on a
data-store choice nobody has made — see
[what does the server store](what-does-the-server-store-if-anything.md). If the server needs less
than a database, those platforms return before pricing is discussed.

**Structural platform facts, which survive re-checking.** Fly volumes are single-attach without
LiteFS, so two processes sharing one file must sit on one machine — which is what coupled the web
app and the generator in the previous design. Cloud Run has an ephemeral filesystem and a hard
sixty-minute request timeout. Cloudflare Workers with D1 has no persistent process and no real
SQLite file. Fly's per-app billing scales roughly linearly per deployable with no bundling
discount across apps.

**Figures and reputational claims, which do not.** Every price above dates from 2026 research
with no links recorded. The claim that Fly's `shared-cpu-1x` tier suffers sustained CPU steal —
described as 70% or worse on some hosts, with a free destroy-and-reclone as the first remedy and
`performance-1x` a 3-10x cost jump — is sourced to unnamed community reports. Useful as
orientation about what to look into; not evidence.

**Backups cover data loss, not downtime.** One machine with one volume has zero hardware-failure
redundancy, and that holds for a bare VPS exactly as much as for a managed platform. See
[how much downtime is acceptable](how-much-downtime-is-acceptable.md).

**One rejection rests on an unmeasured premise.** GCE was set aside partly for a tighter compute
ceiling, which mattered only because generation was assumed to be compute-heavy — see
[how expensive is puzzle generation](how-expensive-is-puzzle-generation.md).

**A practice worth keeping from the previous decision.** It named its upgrade path and the
conditions that would trigger it — generation outgrowing the compute ceiling, steal proving
persistent, a genuinely multi-app future — rather than choosing a cheap option and leaving the
exit undefined.
