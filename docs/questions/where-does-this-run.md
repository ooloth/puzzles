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
outright. The third has the candidates that were actually researched:

*A managed micro-VM platform.* TLS, health-checked restarts and built-in metrics without running
them yourself; cheapest configuration found. Shared-CPU tiers carry a real steal risk, and per-app
billing does not amortise across apps.

*A bare VPS.* More compute headroom, simpler tooling, fixed predictable cost. Full operational
ownership — patching, TLS, monitoring.

*An always-free cloud tier.* Cheap on paper; roughly three to four dollars a month once an
external IPv4 address is counted, locked to three US regions, with a tighter compute ceiling and
real console complexity.

*A mainstream cloud VPS.* Around five times the cost of a budget provider for equivalent specs,
with no capability gap relevant here.

## Findings

SQLite on a local disk is what disqualified the serverless platforms considered previously —
they offer no persistent filesystem, so a database file has nowhere to live. That disqualification
is contingent on a data-store choice nobody has made: see
[what does the server store](what-does-the-server-store-if-anything.md). If the server turns out
to need less than a database, the platforms ruled out on this basis come back into contention
before pricing is even discussed.

**The option set that was researched contained only one of the three tiers above.** Every
candidate previously weighed was a place to run a long-lived process with a disk attached, because
a local database file was treated as a fixed requirement. It was not rejected on its merits that a
server might be unnecessary — the possibility was never raised. This is the third time that shape
has appeared, after a data store question that compared two relational databases and never
considered less than a database.

**Backups cover data loss, not downtime.** One machine with one volume has zero hardware-failure
redundancy, and that holds for a bare VPS exactly as much as for a managed platform. Having
backups is not having availability — see
[how much downtime is acceptable](how-much-downtime-is-acceptable.md).

**Vendor facts from the previous research, with the confidence they deserve.** Volumes on the
managed platform are single-attach, so two processes sharing one file must sit on one machine —
which is what coupled them. One serverless platform has an ephemeral filesystem and a hard
sixty-minute request timeout; another has no persistent process and no real database file. Per-app
billing scales linearly with no bundling discount. Those are structural and durable.

The numbers are not. Pricing figures date from 2026 and carry no links, and the claim that shared
CPU tiers suffer sustained steal is sourced to unnamed community reports. Both are usable as
orientation and neither as evidence; re-check before any of them decides anything.

The rejection of the always-free tier leaned partly on needing compute headroom for generation,
which rests on an unmeasured premise — see
[how expensive is puzzle generation](how-expensive-is-puzzle-generation.md).
