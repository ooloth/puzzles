---
updated: 2026-08-30
update_when: a platform, vendor, or regulator is adopted, changed, or dropped
decays: slow
status: active
---

# Constraints

Facts we don't control. Not choices (→ [decisions/](decisions/)), not promises
(→ [guarantees/](guarantees/)). Everything here is **outside this repo** — vendor,
protocol, regulator. Traps *inside* the repo go in [gotchas.md](gotchas.md).

Every fact carries its implication. A fact alone is inert: the bug is never *not knowing*
the fact, it's not having thought through the consequence.

Nothing here depends on a technology we haven't chosen. Facts that would only apply under a
particular stack arrive with the ADR that adopts it, and leave when it's superseded.

---

## Browsers — client-side storage is not durable

Verified against Chrome's storage documentation and WebKit's tracking-prevention
documentation.

**Safari's Intelligent Tracking Prevention deletes all script-writable storage after 7 days
without user interaction** — IndexedDB, localStorage, service worker registrations, the Cache
API — regardless of how much quota is unused.

> So we must never treat client-side persistence as durable storage. Progress needs a path
> that survives a wipe.

**A home-screen-installed web app is exempt from that 7-day cap**, with storage isolated from
regular Safari. This is the only confirmed mitigation.

> So if durability depends on install, install has to be a designed and encouraged path — and
> durability then differs between installed and non-installed players.

**Whether `navigator.storage.persist()` does anything on Safari is unconfirmed.** It appears
nowhere in WebKit's tracking-prevention documentation despite being the commonly recommended
API for exactly this.

> So we must not count it as a mitigation on iOS, and must treat a `true` return as unreliable.

**Chrome evicts whole origins, least-recently-used first**, when it is over its overall
storage limit.

> So eviction is all-or-nothing. Any recovery path must assume the local store is simply gone
> — not stale, not partially readable.

**Android eviction behaviour is unresearched.** No findings exist either way.

> So we must treat it as unknown rather than safe, and must not infer it from Chrome desktop's
> numbers.

---

## Mobile networks — setup cost, not bandwidth

**A fresh connection costs 3-4 round trips** (TCP plus TLS) before any payload moves.

> So we must optimise for avoiding fresh connections, not for smaller messages.

**Per the WICG Network Information API thresholds, `3g` has an RTT floor around 270ms, and
`2g`/`slow-2g` run 1400-2000ms or worse.** Degraded real-world signal commonly sits at or
below the 2g tier.

> So on a weak link, connection setup alone is several seconds before anything happens.
> Nothing on the interaction path may require a fresh connection.

**Transit connectivity means total dropouts of seconds to a couple of minutes**, plus
multi-second latency spikes from tower handoff *while nominally connected*.

> So "connected" is not a usable signal. We must design for a connection that is up but
> stalled, which needs stall detection rather than just error handlers.

**Working-set payloads are a few KB.** Transfer time is never the bottleneck once a connection
is warm.

> So we must spend no effort on payload minimisation.

**Mobile radios are expensive to wake.** Persistent connections and short-interval polling
both cost battery through radio wake/sleep cycling, independent of how much data moves.

> So we must favour infrequent, bursty, batched network activity. This rules out both a
> continuously-open stream and a short poll as a default sync mechanism.

**There is no reliable session-end hook.** Sessions end by backgrounding, lock, tab kill, or
OS memory purge.

> So durability must never depend on `unload` or `beforeunload` firing.

---

## Devices

**Even a several-year-old mid-range phone has a multi-core CPU and multiple GB of RAM.** A
generous per-puzzle working set — full grid, notes, long undo history — is tens to hundreds
of KB.

> So client CPU and memory are not constraints under any plausible data model. We must not
> optimise for them, and must not cite them to justify anything.

**Grid generation at these sizes is not compute-bound.** Backtracking plus uniqueness
verification runs in milliseconds on a JIT'd runtime, and generation is batch work with no
latency requirement anyway.

> So performance is not a valid argument for a compiled language here.

---

## Streaming over HTTP proxies

True behind any proxy, not one vendor's.

**Buffer-before-compress breaks streaming**, and it isn't vendor-specific — the behaviour
exists in Nginx, Cloudflare and Envoy alike.

> So we must set `Content-Encoding` explicitly on any streaming response rather than leaving
> compression to an intermediary.

**Proxies terminate connections they judge idle.** Heartbeats every 15-30 seconds are standard
hygiene that any host requires.

> So any long-lived stream needs a heartbeat — which collides directly with the radio-battery
> constraint above.

**Compression layers can buffer independently of the HTTP layer.** Whether one flushes per
event is not safe to assume.

> So we must benchmark per-chunk flush behaviour at the algorithm level, not just the transport
> level.

**Streaming bugs can live at a proxy × browser × protocol intersection** — a delay reproducing
only on iOS WebKit over HTTP/2 behind one proxy, while desktop, curl, and the same phone on
another path are all instant.

> So streaming must be tested on real iOS Safari on a real network. Simulators and desktop
> browsers cannot catch this class of bug.

**Without content-hashed filenames, browsers revalidate cached assets** with conditional
requests instead of skipping them.

> So every asset costs a round trip per load unless content-hashed and cached immutably.
> Cheap on desktop, expensive on a weak mobile link.

---

## Law and licensing

**AGPL-3.0's network-use clause generally requires releasing a hosted service's complete
source to any user of that service.** At least one prominent sudoku library is AGPL-3.0.

> So we must audit dependencies for *network* copyleft, not only distribution copyleft. AGPL
> is disqualifying for anything linked into a hosted service.

**Individual puzzle grids are not copyrightable.** The merger doctrine and the idea/expression
dichotomy treat a valid unique-solution arrangement as a functional fact. A publisher's
*curated collection*, including its ordering and presentation, can carry compilation copyright.

> So individual grids may be used or hand-crafted freely from any source, but a publisher's
> collection may not be reproduced wholesale.

---

Privacy and data-protection obligations are unresearched. See [questions/](questions/).
