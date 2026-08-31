---
updated: 2026-08-30
update_when: a platform, vendor, or regulator is adopted, changed, or dropped
decays: slow
status: active
---

# Constraints

Facts we don't control. Not choices (→ [decisions/](decisions/)), not promises
(→ [guarantees/](guarantees/)). Everything here is **outside this repo** — vendor, protocol,
regulator. Traps *inside* the repo go in [gotchas.md](gotchas.md).

Every fact carries its implication. A fact alone is inert: the bug is never *not knowing* the
fact, it's not having thought through the consequence.

Every fact also carries how we know it. **Verified** means checked against a named primary
source, or observed directly. **Reasoned** means derived from a property that can be checked
but hasn't been measured here — usable, and not the same as measured. Anything asserted
without either doesn't belong in this file; it belongs in [questions/](questions/) until
somebody establishes it.

Nothing here depends on a technology we haven't chosen. Facts that would only apply under a
particular stack arrive with the ADR that adopts it, and leave when it's superseded.

---

## Browsers — client-side storage is not durable

**Safari's Intelligent Tracking Prevention deletes all script-writable storage after 7 days
without user interaction** — IndexedDB, localStorage, service worker registrations, the Cache
API — regardless of how much quota is unused.

> So we must never treat client-side persistence as durable storage. Progress needs a path
> that survives a wipe.

*Verified — WebKit's tracking-prevention documentation, checked 2026-08-29.*

**A home-screen-installed web app is exempt from that 7-day cap**, with storage isolated from
regular Safari. This is the only confirmed mitigation.

> So if durability depends on install, install has to be a designed and encouraged path — and
> durability then differs between installed and non-installed players.

*Verified — WebKit's tracking-prevention documentation, checked 2026-08-29.*

**Whether `navigator.storage.persist()` does anything on Safari is unknown.** It appears
nowhere in WebKit's tracking-prevention documentation despite being the commonly recommended
API for exactly this.

> So we must not count it as a mitigation on iOS, and must treat a `true` return as unreliable.

*Verified as an absence — the API is not mentioned in the documentation. Whether it works
anyway is [an open question](questions/does-storage-persist-do-anything-on-ios-safari.md).*

**Chrome evicts whole origins, least-recently-used first**, when it is over its overall
storage limit. An origin may use up to roughly 60% of disk, much less in Incognito.

> So eviction is all-or-nothing. Any recovery path must assume the local store is simply gone
> — not stale, not partially readable.

*Verified — Chrome's storage documentation, checked 2026-08-29.*

**Android eviction behaviour is unresearched.** No findings exist either way.

> So we must treat it as unknown rather than safe, and must not infer it from Chrome desktop's
> numbers.

*Verified as a gap — [an open question](questions/how-does-android-evict-stored-data.md).*

---

## Mobile networks — setup cost, not bandwidth

**A fresh connection costs several round trips before any payload moves** — TCP's handshake
plus TLS negotiation, three to four in total depending on TLS version and whether DNS is warm.

> So we must optimise for avoiding fresh connections, not for smaller messages.

*Verified — a property of the protocols.*

**Per the WICG Network Information API thresholds, `3g` has an RTT floor around 270ms, and
`2g`/`slow-2g` run 1400-2000ms or worse.** Degraded real-world signal commonly sits at or
below the 2g tier.

> So on a weak link, connection setup alone is several seconds before anything happens.
> Nothing on the interaction path may require a fresh connection.

*Verified — the WICG Network Information API specification. The thresholds are definitional;
how often real signal falls into each tier is not, and is
[an open question](questions/what-are-the-real-network-conditions-on-transit-routes.md).*

**Transit connectivity drops out entirely in tunnels and dead zones, and stalls for seconds
during cell-tower handoff while still reporting as connected.**

> So "connected" is not a usable signal. We must design for a connection that is up but
> stalled, which needs stall detection rather than just error handlers.

*Reasoned — uncontroversial as a qualitative fact. How long dropouts actually last on the
routes this is designed for is
[unmeasured](questions/what-are-the-real-network-conditions-on-transit-routes.md), and no
figure should be relied on until it is.*

**Transfer time is not the bottleneck once a connection is warm.** A board's worth of state is
small relative to the cost of the round trips carrying it.

> So we must spend no effort on payload minimisation.

*Reasoned — no data model exists yet, so this is a bound rather than a measurement. It clears
by orders of magnitude under any plausible model.*

**Mobile radios are expensive to wake.** Persistent connections and short-interval polling both
cost battery through radio wake and sleep cycling, independent of how much data moves.

> So we must favour infrequent, bursty, batched network activity. This rules out both a
> continuously-open stream and a short poll as a default sync mechanism.

*Reasoned — a property of how cellular radios manage power state. The magnitude for our sync
cadence is unmeasured.*

**There is no reliable session-end hook.** Sessions end by backgrounding, lock, tab kill, or
OS memory purge, none of which guarantee a page-lifecycle event fires.

> So durability must never depend on `unload` or `beforeunload` firing.

*Reasoned — well-established browser behaviour on mobile, not checked against a specification
here.*

---

## Devices

**A several-year-old mid-range phone has a multi-core CPU and multiple GB of RAM**, while a
generous per-puzzle working set — full grid, notes, long undo history — lands in the tens to
hundreds of kilobytes.

> So client CPU and memory are not constraints under any plausible data model. We must not
> optimise for them, and must not cite them to justify anything.

*Reasoned — the legacy source states plainly that this is an order-of-magnitude bound rather
than a measured benchmark. It clears by several orders of magnitude, which is why the bound is
enough.*

---

## Streaming over HTTP proxies

**A streaming bug can live at one specific intersection of proxy, browser and protocol.** One
delay reproduced only on iOS WebKit over HTTP/2 behind one proxy, while desktop Chromium, curl,
the same phone on a different network path, and the same browser behind a different proxy were
all instant.

> So streaming must be tested on real iOS Safari on a real network. Simulators and desktop
> browsers cannot catch this class of bug.

*Verified — observed directly while debugging, with the alternatives eliminated one at a time.*

**Without content-hashed filenames, browsers revalidate cached assets** with conditional
requests instead of skipping them.

> So every asset costs a round trip per load unless content-hashed and cached immutably. Cheap
> on desktop, expensive on a weak mobile link.

*Verified — HTTP caching semantics.*

**Proxies buffer a response before compressing it, which breaks streaming**, and they terminate
connections they judge idle.

> So any streaming response must set `Content-Encoding` explicitly rather than leave compression
> to an intermediary, and any long-lived stream needs a heartbeat — which collides directly with
> the radio-battery constraint above.

*Reasoned — observed on one proxy and stated in the legacy analysis to hold for Nginx,
Cloudflare and Envoy too. That generalisation is untested here.*

---

## Law and licensing

**AGPL-3.0's network-use clause generally requires releasing a hosted service's complete source
to any user of that service.** At least one prominent sudoku library is AGPL-3.0.

> So we must audit dependencies for *network* copyleft, not only distribution copyleft. AGPL is
> disqualifying for anything linked into a hosted service.

*Verified — the licence text.*

**Individual puzzle grids are unlikely to be copyrightable**, on the reasoning that the merger
doctrine and the idea/expression dichotomy treat a valid unique-solution arrangement as a
functional fact. A publisher's *curated collection*, including its ordering and presentation,
can carry compilation copyright.

> So individual grids may be used or hand-crafted freely from any source, but a publisher's
> collection may not be reproduced wholesale.

*Reasoned — legal argument recorded in the legacy analysis without citation to case law. Sound
enough to act on for hand-crafted grids; get advice before reproducing anything sourced.*

---

Privacy and data-protection obligations are unresearched. See [questions/](questions/).
