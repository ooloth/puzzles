# Constraints

Derived from `usage.md`. Read-only input to architecture decisions —
decisions should cite specific facts here by heading, not restate them.

These are order-of-magnitude engineering reasoning, not measured benchmarks.
Treat them as a sound starting frame, not precise numbers — revisit if a
future decision turns out to hinge on a figure that needs tightening.

## Client device capability

Even a several-years-old, mid-range phone has a multi-core CPU and multiple
GB of RAM — uncontroversial, and doesn't depend on any data model. What a
puzzle grid's working state actually consists of does depend on a data
model we don't have yet (see `domain-vocabulary.md`, not yet written), so a
point estimate isn't available. What can be stated without one is a
robustness bound: even a deliberately generous per-puzzle working set (full
grid, notes, a long undo history) lands in the tens-to-hundreds of KB range —
several orders of magnitude below available device RAM.

**Conclusion:** CPU and memory are not meaningful constraints on the client
for this workload, under any data model we'd plausibly choose. Revisit only
if a future decision needs an actual figure rather than a bound.

## Server-side storage

No data model exists yet, so a specific volume estimate isn't available.
What can be stated instead is a robustness bound: even a
deliberately generous worst case — 10,000 users, 100 puzzles each, a full
move-by-move event log per puzzle (~500 events × 100 bytes) — comes to
roughly 50GB total. That's still trivial for any modern datastore or
hosting tier.

**Conclusion:** storage capacity is not a constraint at any realistic scale,
under any data model we'd plausibly choose. This is a bound, not a number to
plan around. No concrete ceiling actually exists yet either way — that would
come from a hosting/infrastructure choice, and hosting (ADR-12/13/14) is
still open, not decided.

## Server-side compute

Serving and persisting small records is not CPU-intensive. Puzzle generation
is the one genuinely heavier task, but it's structurally separable from
request-serving and can run offline/batch — it never has to compete with the
interactive path, regardless of how it's implemented.

**Conclusion:** server compute is not a constraint on the interactive path.

## Network: bandwidth/throughput vs. availability/latency

Sync payloads (current grid state) are a few KB — small enough that raw
transfer time is never the bottleneck once a connection is warm and
flowing. What actually stalls a request on a degraded connection is
round-trip accumulation: establishing a fresh connection costs 3-4 round
trips (TCP handshake + TLS) before any payload moves at all, and on a
connection merely classified "3g" (RTT floor ~270ms, per the WICG Network
Information API spec's effective-connection-type thresholds), that alone is
under a second — but real-world degraded signal commonly performs at or
below the "2g"/"slow-2g" tier (RTT 1400-2000ms+ per the same spec), where
connection setup alone runs several seconds before anything happens. This is
the actual mechanism behind a frozen loading screen: not bandwidth, but
round-trip cost multiplied by connection setup, on links where each round
trip is already expensive.

Separately, from real subway/transit connectivity research: total dropouts
lasting seconds to a couple of minutes in tunnels/dead zones, plus frequent
multi-second latency spikes from cell-tower handoff even while nominally
connected.

**Conclusion:** bandwidth/throughput is not the constraint here — connection
setup cost and network availability/latency variance are. Design effort
belongs on tolerating absence and avoiding unnecessary fresh-connection
round trips, not on minimizing payload size.

## Battery

Mobile radios are expensive to wake. A persistent open connection and
frequent short polling both cost real battery over a multi-minute session —
via radio wake/sleep cycling, independent of how much data actually moves.

**Conclusion:** favor infrequent, bursty, batched network activity over
continuous connections or frequent polling.

## Client-side persistent storage

Distinct from device CPU/memory above — this is about durable,
offline-surviving storage (e.g. IndexedDB), which matters directly for a
local-first design. Capacity isn't the constraint here (the same
robustness-bound logic as server storage applies and clears easily); the
real constraint is **durability under inactivity** — data can be evicted
even while well within quota.

Verified against Chrome's own storage documentation and WebKit's own
tracking-prevention documentation directly (not inferred):

- **Chrome:** an origin can use up to ~60% of total disk space (much less
  in Incognito, or with "clear on close" enabled); when the browser is over
  its overall storage limit, it evicts whole origins, least-recently-used
  first.
- **Safari:** Intelligent Tracking Prevention (ITP) imposes a **7-day cap on
  all script-writable storage** — IndexedDB, localStorage, service worker
  registrations, the Cache API — deleted entirely after 7 days of no user
  interaction with that site, regardless of how much quota remains unused.
  Reported storage quota is ~1GB with 200MB-increment prompts, though Apple
  doesn't officially document the exact figure.
- **The one confirmed mitigation:** WebKit's own documentation states the
  first-party domain of a home-screen-installed web app is *exempt* from
  the 7-day cap entirely, with its storage isolated from regular Safari
  browsing.
- **Unconfirmed:** whether `navigator.storage.persist()` does anything on
  Safari — it isn't mentioned anywhere in WebKit's own tracking-prevention
  documentation, despite being the API commonly recommended for this
  purpose elsewhere. Treat as unverified, not as a working mitigation.
- No Android-specific findings surfaced in this pass — a gap, not a
  "no constraint" conclusion.

**Conclusion:** client-side storage capacity is not a binding constraint,
but durability is — specifically for Safari users who haven't installed the
app to their home screen, where locally-persisted progress can be silently
wiped after 7 days of inactivity on that puzzle. Given a likely-iOS-heavy
mobile audience, this is a real constraint the rest of this document doesn't
otherwise surface: a local-first design needs either PWA installation to be
a first-class, encouraged part of the experience, or a sync cadence tight
enough that 7 days of inactivity can't cause meaningful loss even for
non-installed users.

## Net effect

CPU, memory, and storage capacity are non-issues on both client and server,
at any scale this project is likely to reach — that holds even under
generous worst-case assumptions, independent of the (not yet decided) data
model. Three real constraints remain: **network availability and connection
setup cost** (not bandwidth), **battery cost from how often/continuously the
radio is touched**, and **client-side storage durability on Safari
specifically**, where non-installed usage risks silent data eviction after 7
days of inactivity. Architecture decisions should treat the network as an
intermittent, expensive-to-touch resource that state ownership should not
depend on, and should not assume client-side persistence is durable by
default for the likely-dominant mobile browser without either encouraging
installation or bounding how long anything can go unsynced.

## Status

Last reviewed: 2026-08-29.
