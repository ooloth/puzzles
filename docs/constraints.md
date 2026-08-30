---
updated: 2026-08-30
update_when: a platform, vendor, or regulator is adopted, changed, or dropped
decays: slow
status: draft
---

# Constraints

Facts we don't control. Not choices (→ [decisions/](decisions/)), not promises
(→ [guarantees.md](guarantees.md)). Everything here is **outside this repo** — vendor,
protocol, regulator. Traps *inside* the repo go in [gotchas.md](gotchas.md).

Every fact carries its implication. A fact alone is inert: the bug is never *not knowing*
the fact, it's not having thought through the consequence.

> **Provenance.** Ported from `@legacy/`. Only material verified against vendor documentation
> or describing protocol-level behaviour is included. Two brainstorming files
> (`why-sqlite-is-better-than-postgres-here-…`, `vps-hardening-and-monitoring-idea`) are
> pasted LLM chat transcripts dense with confident uncited figures — 20,000 req/s, 10ms
> process reboots, 10,000 writes/sec. **None of those numbers are here.** Importing them
> would be exactly the failure this file exists to prevent.

---

## Browsers — client-side storage durability

The best-verified material in the corpus; the legacy source states it was checked against
Chrome's and WebKit's own documentation rather than inferred.

| Fact | So we must |
|---|---|
| Safari's ITP imposes a **7-day cap on all script-writable storage** — IndexedDB, localStorage, service worker registrations, Cache API — deleted entirely after 7 days without user interaction, regardless of unused quota | Never treat client-side persistence as durable. Either make home-screen install a first-class, encouraged path, or bound the unsynced window so 7 idle days can't lose meaningful work |
| A **home-screen-installed web app is exempt** from the 7-day cap, with storage isolated from regular Safari. The one confirmed mitigation | Make install discoverable and desirable, not buried. Durability then differs per user depending on whether they installed |
| Whether `navigator.storage.persist()` does anything on Safari is **unconfirmed** — absent from WebKit's tracking-prevention docs despite being the commonly recommended API | Do not count it as a mitigation on iOS. Keep the sync-cadence backstop regardless of what it returns |
| Chrome evicts **whole origins, least-recently-used first**, when over its overall limit. An origin may use up to ~60% of disk (much less in Incognito) | Eviction is all-or-nothing at origin granularity. Any recovery path must assume the local store is simply *gone* — not stale, not partial |
| **No Android-specific findings exist** — the legacy source flags this as "a gap, not a 'no constraint' conclusion" | Treat Android eviction behaviour as unknown. Look it up before shipping local-first persistence; do not infer safety from Chrome-desktop numbers |

Source: `@legacy/context/constraints.md:96-125`.

---

## Mobile networks and devices

| Fact | So we must |
|---|---|
| A fresh connection costs **3-4 round trips** (TCP + TLS) before any payload moves | Optimise for avoiding fresh connections, not for payload size |
| Per the WICG Network Information API thresholds, `"3g"` has an **RTT floor ~270ms**; `"2g"`/`"slow-2g"` are **1400-2000ms+**. Degraded real-world signal commonly performs at or below the 2g tier | On a slow-2g link, connection setup alone runs several seconds before anything happens. Nothing on the interaction path may require a fresh connection |
| Transit connectivity means **total dropouts of seconds to a couple of minutes**, plus frequent multi-second latency spikes from tower handoff *while nominally connected* | "Connected" is not a usable signal. Design for a connection that is up but stalled — stall detection, not just error handlers |
| Sync payloads are **a few KB**; raw transfer time is never the bottleneck once a connection is warm | Spend zero effort on payload minimisation |
| **Mobile radios are expensive to wake.** Persistent connections and short-interval polling both cost battery via radio wake/sleep cycling, independent of data volume | Favour infrequent, bursty, batched network activity. This disqualifies both a continuously-open stream and a short poll as the default sync mechanism |
| Even a several-years-old mid-range phone has multi-core CPU and multiple GB RAM; a generous per-puzzle working set is **tens-to-hundreds of KB** | Client CPU and memory are not constraints under any plausible data model. Don't optimise for them and don't cite them as justification |
| There is **no reliable session-end hook** — sessions end by backgrounding, lock, tab kill, or OS memory purge | Durability must not depend on `unload`/`beforeunload` firing |

Source: `@legacy/context/constraints.md:10-23, 49-82`; `@legacy/context/usage.md:16-30`.

---

## Streaming over HTTP proxies — protocol-level

Retained because these hold behind any proxy, not just the one previously chosen.

| Fact | So we must |
|---|---|
| **Buffer-before-compress breaks streaming**, and it is not vendor-specific — "the same buffer-to-compress behavior exists in Nginx, Cloudflare, and Envoy" | Any streaming response must set `Content-Encoding` explicitly rather than leave compression to an intermediary |
| Proxies terminate connections they judge idle. Periodic heartbeats are "standard SSE hygiene any host requires" — cadence every **15-30s** | Any long-lived stream needs a heartbeat. Note this collides head-on with the battery constraint above |
| **Compression algorithms can buffer independently of the HTTP layer** — whether a given layer flushes per-event is an untested claim | Per-chunk flush behaviour must be benchmarked at the algorithm level, not assumed |
| Streaming bugs can live at a specific **proxy × browser × protocol intersection** — one previously-observed delay reproduced only on iOS WebKit over HTTP/2 behind one proxy, while desktop Chromium, curl, and the same phone on a different path were all instant | Streaming must be tested on real iOS Safari on a real network. Simulators and desktop cannot catch this class of bug |
| Without content-hashed filenames, browsers **revalidate cached assets** via conditional requests rather than skipping them | Every asset costs a round trip per load unless content-hashed and immutably cached. Cheap on desktop, expensive on slow-2g |

Source: `@legacy/failure-modes/01-sse-delivery-through-flys-proxy.md`;
`@legacy/decisions/20-embed-static-assets-vendor-datastar-js.md:34`.

---

## Architectural facts about this workload

Properties of the problem itself, true regardless of implementation.

| Fact | So we must |
|---|---|
| **Any server-owns-state architecture fails the offline requirement by construction** — a server round trip is required for every state change. Not specific to one framework: LiveView and Turbo share the constraint | This rules out the whole category, not one member of it. It is not a "pick a better one" situation |
| A puzzle grid is **~81 independent scalar values** — a far lower-conflict shape than a relational graph. Even a full CRDT collapses independent scalars to last-write-wins internally | Adopting a CRDT engine here buys machinery whose output is indistinguishable from a version counter for this data shape |
| **Sudoku/star-battle generation at this grid size is not compute-constrained** — backtracking plus uniqueness verification runs in milliseconds on a JIT'd runtime; production generators do it in-browser in plain JS. Generation is also a batch job with no latency requirement | The performance argument for a compiled language does not survive scrutiny. This directly contradicts the legacy ADR-02/04 reasoning chain |
| **SQLite permits only one writing process at a time.** Multiple instances cannot share a local file without corruption | Under SQLite-on-local-disk, single-instance deployment is a correctness requirement, not a preference |
| **In WAL mode a filesystem copy is not a valid backup** — it can capture a partial write and produce a silently corrupt file | Any backup must use the online Backup API or WAL-aware streaming. A cron `cp` is worse than no backup |

Source: `@legacy/decisions/03`, `@legacy/decisions/02:13`,
`@legacy/decisions/04:25`; `brainstorming/ruthless-rearchitecture…:54-55, 74-78, 86-88, 105-110`.

---

## Legal and licensing — imposed, not a choice

| Fact | So we must |
|---|---|
| The `sudoku` crate on crates.io is **AGPL-3.0**, whose network-use clause would generally require releasing this project's complete running-service source under AGPL-3.0 to any user | AGPL is disqualifying for a dependency in a hosted service. Audit every dependency for *network* copyleft, not only distribution copyleft — this generalises well beyond one ecosystem |
| **Individual sudoku grids are not copyrightable** — merger doctrine and the idea/expression dichotomy treat a valid unique-solution arrangement as a functional fact. A publisher's *curated collection*, including its ordering, can carry compilation copyright | Individual grids from any source may be used or hand-crafted freely. A publisher's collection may not be reproduced wholesale |

Source: `@legacy/decisions/22-seed-sudoku-puzzles-statically-avoid-agpl-crate.md:14-15, 26`.

**Conspicuous gap:** the corpus contains no privacy or regulatory constraint at all — no GDPR,
CCPA, cookie consent, data residency, or age gating — for an app intended to be genuinely
public and to set a long-lived identifying cookie. That is an absence of research, not a
finding of "no constraint." Tracked in [undecided.md](undecided.md).

---

## Conditional — facts that apply only under choices not yet made

No ADR has imported these, because no stack decision is confirmed. They are decision *inputs*.
When an ADR adopts the underlying choice, its facts move up into a section of their own; when a
choice is rejected, its block is deleted.

**If SQLite-on-local-disk is kept** — Google Cloud Run (ephemeral filesystem, 60-minute hard
request timeout) and Cloudflare Workers+D1 (no persistent process, no real SQLite file) are
structurally incompatible and are off the table before pricing is discussed. Conversely, **if
the local-first pivot removes the local-disk requirement, both re-enter contention** — they
were disqualified solely on that requirement (`@legacy/decisions/12:12, :43`).

**If a single VM of any provider is chosen** — one machine with one volume has zero
hardware-failure redundancy, and backups cover data loss, not downtime. "We have backups" is
not "we have availability" (`@legacy/decisions/12:36`, explicitly generalised beyond one vendor).

**If a bare VPS is chosen** — a public SSH port is targeted by automated bots within minutes of
boot, and a provider can reboot the box without warning, returning it to a clean slate. Nothing
may depend on in-memory state surviving, and everything must restart from boot unattended.
Also: disabling SSH password auth only closes the *network* path — every mainstream provider
exposes a VNC console and a rescue mode that bypass SSH and the firewall entirely, so the
provider's original root password is the last line of defence and must be retrievable.

**If a third-party dependency is chosen from the sync-engine category** — 2026 was volatile:
Replicache archived, ElectricSQL acquired with its hosted product winding down, InstantDB
acquired and sunsetting, Legend-State in beta for 23 months. Foundational infrastructure from
this category is a live dependency risk for a solo maintainer, not a hedge
(`brainstorming/ruthless-rearchitecture…:90-94`). `decays: fast` — re-verify before relying on it.
