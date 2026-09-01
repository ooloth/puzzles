---
updated: 2026-08-31
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

Most of what follows is deliberate design and changes slowly. A few entries are vendor
*defects* we have to build around. Those say so in their provenance, because they may be fixed
and stop being true — but a defect is a constraint while it lasts, and discovering one late
costs exactly what discovering a design late costs.

---

## Browsers — client-side storage is not durable

*Every browser fact in this file and the two sections below it is in scope because of
[decisions/0003](decisions/0003-this-is-delivered-over-the-web.md), which chose web delivery. They
are the price of that decision rather than facts of the world, and they leave with it if it is ever
superseded. Read them as a bill, not as weather.*

**Safari's Intelligent Tracking Prevention deletes all script-writable storage after 7 days
without user interaction** — IndexedDB, localStorage, service worker registrations, the Cache
API — regardless of how much quota is unused.

> So we must never treat client-side persistence as durable storage. Progress needs a path
> that survives a wipe.

*Verified — WebKit's tracking-prevention documentation, checked 2026-08-29. The seven-day figure
may now be conservative: WebKit's source carries a longer default with seven reserved as a
penalty for a narrower case, but the change was never announced and the reading is
[contested](questions/is-safaris-storage-window-still-seven-days.md). Seven remains the number
to plan against.*

**What resets that clock is a deliberate act, not a page view.** A tap or click, a keystroke the
page handles, an autofill, and an authentication all count. Scrolling, viewing, timers firing,
and the app writing to storage do not. The window is also counted in days the browser was
actually used rather than days on the calendar.

> So an actively playing player is never at risk — solving a puzzle is a continuous stream of
> qualifying interactions. The entire exposure is the gap between sessions, which makes eviction
> a property of the lapsed player rather than of the app, and means no amount of background
> activity can hold the clock open on their behalf.

*Verified — WebKit's tracking-prevention documentation, checked 2026-08-31.*

**That wipe covers non-cookie website data only — cookies are a separate mechanism.** WebKit's
own wording is that "all of website.example's non-cookie website data is deleted". Cookies set by
JavaScript through `document.cookie` are separately capped at roughly 7 days. Cookies set by the
server in a `Set-Cookie` header, which JavaScript cannot write, follow their declared lifetime up
to a 400-day ceiling.

> So a server-set `HttpOnly` cookie can outlive the local data it points at, which makes it usable
> as a recovery key: local progress is wiped, the cookie survives, the server hands the state back.
> A cookie written by JavaScript cannot do this, and the difference is invisible in the code that
> reads it.

*Verified — WebKit's Intelligent Tracking Prevention 2.3 announcement, checked 2026-08-31.*

**That exemption is lost if Safari judges the server setting the cookie not to be genuinely
first-party.** Since Safari 16.4 the 7-day cap applies to server-set cookies in two cases: the
setting server sits behind a CNAME resolving to a third-party host, or its A/AAAA record resolves
to an IP address whose first half does not match the first half of the IP serving the site.

> So the recovery mechanism above depends on deployment topology, not just on code. Serving the
> app from one provider and setting cookies from another — a static host with an API elsewhere —
> is the shape most likely to fail the IP test, and it fails silently: the cookie simply expires
> in seven days alongside the storage it was meant to outlive.

*Verified — WebKit's CNAME cloaking and bounce tracking defence post, plus Safari 16.4 behaviour
widely reported in 2023 and absent from Apple's release notes. The exact IP-matching rule is
described by third parties rather than by Apple.*

**A home-screen-installed web app is exempt from that 7-day cap**, with storage isolated from
regular Safari. This is the only confirmed mitigation.

> So if durability depends on install, install has to be a designed and encouraged path — and
> durability then differs between installed and non-installed players.

*Verified — WebKit's tracking-prevention documentation, checked 2026-08-29.*

**That isolation runs both ways: an installed app starts with an empty store.** Home-screen and
tab storage are separate, so nothing saved or cached while playing in Safari carries across when
the same player installs.

> So installing is a reset rather than an upgrade. Progress already made has to be carried over
> deliberately, or it is lost at the exact moment the player does the thing we asked them to do
> to keep it safe. Any promise that the app opens with no network also starts holding only on
> the installed app's *second* launch.

*Verified — a direct consequence of the storage isolation above.*

**Since Safari 26 any site can be installed, and the player can decline the isolated store.**
The installability requirements are gone — no manifest is needed — but the Add to Home Screen
sheet now offers an "Open as Web App" toggle, and turning it off leaves the site in ordinary
Safari with ordinary Safari's eviction.

> So install is easier to reach and less safe to infer. Whether a given player is actually
> protected has to be tested at runtime, never assumed from having shown them the prompt.

*Verified — WebKit Features in Safari 26.0, checked 2026-08-31.*

**`navigator.storage.persist()` is a membership test, not a request.** WebKit grants it only to
origins already exempt from tracking prevention — app-bound domains, domains managed by an MDM
profile, and the domain of a home-screen-installed web app. There is no prompt and no engagement
threshold. In an ordinary Safari tab it returns `false` unconditionally.

> So calling it buys nothing that installing did not already buy, and the widely repeated advice
> to call it and branch on the result is wrong here. Its useful half is the other one:
> `navigator.storage.persisted()` is the best runtime test for whether we are in the protected
> store, because it reports the same membership that governs deletion. That makes it a better
> signal than `display-mode: standalone`, which only reports how the page was launched.

*Verified — WebKit trunk, `NetworkStorageManager::persistOrigin`, read 2026-08-31.*

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

## Browsers — the store also fails for ordinary reasons

The facts above are about storage being *taken away* by policy. These are about it failing while
it is still there, which turns out to be the more common case.

**A write can fail for reasons that have nothing to do with quota, and the error misidentifies
its own cause.** One published production dataset recorded 3.36 million storage-write failures
across four weeks in 52 distinct error types. The largest single category was WebKit reporting
the connection to the database server lost — the network process being killed under memory
pressure, which is the ordinary lifecycle of a backgrounded mobile app, not an exceptional
event. Firefox raised a quota error 865,703 times at an average of zero percent quota used.

> So we must not branch recovery on the error's name, and must never treat a rejected write as a
> condition that will resolve itself. A swallowed rejection here is silent data loss, and this is
> the ordinary way that loss happens rather than an exotic one. Retrying immediately against a
> dead connection is also useless: in the same dataset, 97.5% of affected sessions exhausted
> every retry.

*Verified — Expensify's published telemetry, checked 2026-08-31.*

**IndexedDB is unavailable entirely under Lockdown Mode**, and Apple's own description of the
feature does not mention it.

> So the storage layer has to detect its own absence and degrade rather than assume a database
> it can always open. Some players get no persistence at all, and finding that out by crashing
> is the wrong way to find it out.

*Verified — WebKit's Safari 17 feature announcement.*

**`navigator.storage.estimate()` reports a fabricated quota on iOS**, derived from a fixed
volume capacity rather than the device's real disk, as an anti-fingerprinting measure. Every
iPhone reports roughly the same number regardless of how much space it has.

> So we must build no quota management and must never show the figure to anyone. Running out of
> space is not the failure worth designing against here.

*Verified — WebKit trunk, `WebsiteDataStoreCocoa.mm`, read 2026-08-31.*

**Letting IndexedDB generate a key currently triggers a WebKit defect.** On iOS 26 the first
write after a cold start fails when the store relies on the browser to mint the key; a WebKit
engineer attributes it to exactly that. The bug was closed once and has been reopened.

> So keys must be assigned by us rather than by the store. Doing this from the first line costs
> nothing; adopting it later costs a migration of every player's data, which is why it is
> recorded here despite being a defect.

*Verified — WebKit bug 229178, reopened, checked 2026-08-31. This is a defect rather than a
design, so it may be fixed and stop being true. The mitigation is worth taking regardless,
because it is free and the failure it avoids is a lost first write.*

---

## Browsers — capabilities withheld on iOS

These are not defects and not policy. They are capabilities the platform has and does not expose to
web content, which makes them a ceiling on how the interface can feel rather than a problem to
engineer around.

**There is no haptic feedback available to web content on iOS.** Apple implemented the Vibration
API and then deliberately removed it in 2017, and the standing request to restore even a
permission-gated version is unassigned with no milestone. A home-screen-installed web app makes no
difference, because it is the same engine. Android exposes `navigator.vibrate()`, but only as raw
on/off durations rather than the named, device-tuned effects native code can request.

> So a tactile response to entering a digit is unavailable on the platform this app is primarily
> aimed at, and no amount of effort inside the web platform changes that. Any design that leans on
> tactile confirmation has to work without it on iOS, and must not be built and then retrofitted.
> Recovering it requires a native shell — see
> [decisions/0003](decisions/0003-this-is-delivered-over-the-web.md).

*Verified — WebKit bugs 171766 (removal, 2017) and 288846 (restore request, open and unassigned),
plus browser support tables showing no Safari version through 26.6 supporting it, checked
2026-08-31.*

**Web content is capped at 60 frames per second on iOS, including inside a `WKWebView`.** ProMotion
displays run at up to 120Hz for native content. The WebKit issues tracking this have been open
since 2017 and June 2025, the capability exists behind a preference that is off by default, and
there is no public API for a page or an embedding app to opt in.

> So animation smoothness has a ceiling that native code does not have, and — unusually among the
> facts in this file — wrapping the app in a native shell does not lift it. Animation should be
> designed to read well at 60fps rather than tuned to a rate the platform will not deliver.

*Verified — WebKit bugs 173434 and 294338, both open, checked 2026-08-31.*

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

**iOS runs no background execution for web apps at all** — Background Sync, Periodic Background
Sync and Background Fetch are all absent, with no partial substitute.

> So there is no moment to flush pending work other than while the app is on screen, and nothing
> can be deferred to "later" in any sense the platform will honour. Combined with the missing
> session-end hook above, the last chance to persist or upload is whatever we manage on
> `visibilitychange` — which has to be fire-and-forget rather than a request we wait on, because
> nothing guarantees we are still running to see the response.

*Verified — WebKit implements none of the three, checked 2026-08-31.*

---

## How the app gets used

**A player makes a discrete input every one to three seconds while actively solving** — select a
cell, enter a digit, toggle a note, undo. Sessions run minutes, are interrupted often, and resume
anywhere from seconds to days later.

> So this is the figure any estimate of write volume or request rate starts from. It is the only
> quantity about player behaviour we have, and it multiplies by whatever the architecture decides
> an input costs.

*Reasoned — an expectation drawn from the intended audience and the way the game is played, not a
measurement of anyone.*

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
