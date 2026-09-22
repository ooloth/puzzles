---
updated: 2026-09-22
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

Every fact also carries how we know it, in one of three tiers. They are ordered, and the top one is
worth reaching for.

**Measured** — observed here, on hardware and under conditions we control, with the method recorded
beside the number. What was run, on what, how many times, and against what baseline. A figure
without its method is an assertion with a number in it, and reads as stronger than a sourced claim
while being weaker.

**Sourced** — checked against a named primary source: a specification, vendor documentation, or code
we read ourselves. Better than nothing and not the same as observed. Documentation describes intent;
shipped software sometimes disagrees, which is why
[how long does Safari really keep our storage?](questions/how-long-does-safari-really-keep-our-storage.md)
stays open with the constant read from the source and the behaviour unconfirmed.

**Reasoned** — derived from a property that can be checked but has not been measured here. Usable,
and the tier most likely to be quietly promoted by a later reader.

Anything asserted without one of the three doesn't belong here; it belongs in
[questions/](questions/) until somebody establishes it.

**A measurement is only worth more than a source when it measures the right thing.** Four ways one
goes wrong here, and the first two have already been avoided by accident rather than by care:

- **Measuring what does not bind.** Framework render throughput is not a criterion for an 81-cell
  grid, because the device section below leaves client CPU unconstrained by orders of magnitude for
  this workload. A real number about an irrelevant quantity ends arguments it should not.
- **Measuring where the failure cannot occur.** The storage failures below do not reproduce in a
  desktop browser, so a desktop measurement of them is a measurement of nothing. Measure on the
  device the constraint belongs to.
- **Measuring a synthetic workload.** Ten thousand inserts in a loop is not one input every one to
  three seconds from a backgrounded mobile app. Shape the spike like the real thing or state plainly
  that it is a ceiling rather than an expectation.
- **Measuring once.** A single run on a warm machine hides variance, and variance is often the
  finding.

Nothing here depends on a technology we haven't chosen. Facts that would only apply under a
particular stack arrive with the ADR that adopts it, and leave when it's superseded.

Most of what follows is deliberate design and changes slowly. A few entries are vendor
*defects* we have to build around. Those say so in their provenance, because they may be fixed
and stop being true — but a defect is a constraint while it lasts, and discovering one late
costs exactly what discovering a design late costs.

---

## Browsers — client-side storage is not durable

*Every browser fact in this file is in scope because
[decisions/0003](decisions/0003-this-is-delivered-over-the-web.md) chose web delivery. These are
the cost of that decision rather than facts of the world, and they leave with it if it is
superseded.*

**Safari's Intelligent Tracking Prevention deletes all script-writable storage after 30 days
without user interaction** — IndexedDB, localStorage, service worker registrations, the Cache
API — regardless of how much quota is unused. **Seven days is a penalty, not the default**, and it
applies only to a domain reached by a tracker-originated link carrying an unfiltered decorated
identifier.

> So we must never treat client-side persistence as durable storage. A player returning within a
> month keeps everything, so the risk falls entirely on players who lapse for longer than that.
> Any argument that durability alone forces a server is made against thirty days.

*Sourced — against WebKit trunk, `ResourceLoadStatisticsStore.cpp`, read 2026-08-31: `constexpr
unsigned operatingDatesWindowLong { 30 }` and `operatingDatesWindowShort { 7 }`. The condition
separating them is stated in [WebKit PR #21120](https://github.com/WebKit/WebKit/pull/21120),
commit `274398@main`, 2024-02-09. Apple's published documentation still describes a blanket
seven-day rule, so third-party sources contradict this. Whether a shipped browser matches the
source is [an open question](questions/how-long-does-safari-really-keep-our-storage.md).*

**What resets that clock is a deliberate act, not a page view.** A tap or click, a keystroke the
page handles, an autofill, and an authentication all count. Scrolling, viewing, timers firing,
and the app writing to storage do not. The window is also counted in days the browser was
actually used rather than days on the calendar.

> So an actively playing player is never at risk — solving a puzzle is a continuous stream of
> qualifying interactions. The entire exposure is the gap between sessions, which makes eviction
> a property of the lapsed player rather than of the app, and means no amount of background
> activity can hold the clock open on their behalf.

*Sourced — WebKit's tracking-prevention documentation, checked 2026-08-31.*

**That wipe covers non-cookie website data only — cookies are a separate mechanism.** WebKit's
own wording is that "all of website.example's non-cookie website data is deleted". Cookies set by
JavaScript through `document.cookie` are separately capped at roughly 7 days. Cookies set by the
server in a `Set-Cookie` header, which JavaScript cannot write, follow their declared lifetime up
to a 400-day ceiling.

> So a server-set `HttpOnly` cookie can outlive the local data it points at, which makes it usable
> as a recovery key: local progress is wiped, the cookie survives, the server hands the state back.
> A cookie written by JavaScript cannot do this, and the difference is invisible in the code that
> reads it.

*Sourced — WebKit's Intelligent Tracking Prevention 2.3 announcement, checked 2026-08-31.*

**That exemption is lost if Safari judges the server setting the cookie not to be genuinely
first-party.** The 7-day cap applies to a subresource request that looks first-party by hostname but
resolves somewhere else — either through a CNAME pointing at a different host, or, when there is no
CNAME, to an IP address matching the first-party host's in fewer than its leading 16 bits for IPv4
or 64 bits for IPv6.

> So the recovery mechanism above depends on deployment topology, not just on code. A static host
> with the API on its own subdomain is the shape that fails, and it fails silently: the cookie
> expires in seven days alongside the storage it was meant to outlive. Two consequences are easy to
> get backwards. **Serving the API on the same hostname as the app skips the test entirely**, because
> there is then no second host to resolve and compare — which makes path-based routing, not merely
> the same registrable domain, the arrangement that is safe. And a *genuinely* cross-origin API is
> not exempt because the cap does not reach it: its cookies are blocked outright by ordinary
> third-party cookie blocking, which is worse rather than better.

*Sourced — WebKit [PR #5347](https://github.com/WebKit/WebKit/pull/5347), diff read 2026-09-02, for
[bug 246477](https://bugs.webkit.org/show_bug.cgi?id=246477) ("Cap cookie lifetimes to 7 days for
responses from third party IP addresses", filed by Wenson Hsieh 2022-10-13, resolved 2022-10-21).
`shouldCapCookieExpiryForThirdPartyIPAddress` compares `remote.matchingNetMaskLength(firstParty)`
against `4 * sizeof(struct in_addr)` and `4 * sizeof(struct in6_addr)` — 16 and 64 bits, evaluated
here rather than quoted from the source. The call sits behind `if (request.isThirdParty()) return;`,
so it runs only for requests that are not third-party, and behind `if (cnameDomain.isEmpty())`, so
the IP comparison is the fallback when no CNAME exists. Top-level navigations are excluded earlier.
Which Safari version shipped it is widely reported as 16.4 and appears in no Apple release note, so
the version is unverified while the mechanism is not. Whether current WebKit trunk still carries it
unchanged was not confirmed.*

**A home-screen-installed web app is exempt from the deletion mechanism entirely**, with storage
isolated from regular Safari. This is the only confirmed mitigation.

> So if durability depends on install, install has to be a designed and encouraged path — and
> durability then differs between installed and non-installed players. The gap install closes is
> between exempt and thirty days, which makes it a smaller lever than a seven-day window would.

*Sourced — WebKit trunk, `ResourceLoadStatisticsStore::shouldExemptFromWebsiteDataDeletion`, read
2026-08-31. It returns true for any domain in the union of app-bound domains, managed domains,
persisted domains, and the standalone-application domain, the last of which is populated from
`WKWebsiteDataStoreConfiguration.standaloneApplicationURL` — the mechanism behind Add to Home
Screen.*

**That isolation runs both ways: an installed app starts with an empty store.** Home-screen and
tab storage are separate, so nothing saved or cached while playing in Safari carries across when
the same player installs.

> So installing is a reset rather than an upgrade. Progress already made has to be carried over
> deliberately, or it is lost at the exact moment the player does the thing we asked them to do
> to keep it safe. Any promise that the app opens with no network also starts holding only on
> the installed app's *second* launch.

*Reasoned — a direct consequence of the storage isolation above.*

**Since Safari 26 any site can be installed, and the player can decline the isolated store.**
The installability requirements are gone — no manifest is needed — but the Add to Home Screen
sheet now offers an "Open as Web App" toggle, and turning it off leaves the site in ordinary
Safari with ordinary Safari's eviction.

> So install is easier to reach and less safe to infer. Whether a given player is actually
> protected has to be tested at runtime, never assumed from having shown them the prompt.

*Sourced — WebKit Features in Safari 26.0, checked 2026-08-31.*

**`navigator.storage.persist()` is a membership test, not a request.** WebKit grants it only to
origins already exempt from tracking prevention — app-bound domains, domains managed by an MDM
profile, and the domain of a home-screen-installed web app. There is no prompt and no engagement
threshold. In an ordinary Safari tab it returns `false` unconditionally.

> So calling it buys nothing that installing did not already buy, and the widely repeated advice
> to call it and branch on the result is wrong here. Its useful half is the other one:
> `navigator.storage.persisted()` is the best runtime test for whether we are in the protected
> store, because it reports the same membership that governs deletion. That makes it a better
> signal than `display-mode: standalone`, which only reports how the page was launched.

*Sourced — WebKit trunk, `NetworkStorageManager::persistOrigin`, read 2026-08-31.*

**Of the mechanisms above, a server-set cookie is the only one that carries an identifier across the
wipe without the player being asked to do anything.** Everything script-writable is deleted outright.
A cookie written by JavaScript is separately capped at roughly seven days, so it is already gone
before the thirty-day window closes. The HTTP cache survives the wipe, per the section below, but
nothing a page can execute puts a value there or reads one back, so it cannot carry one. Installing
to the home screen preserves the store and is the player doing something.

> So any recovery that has to work for a lapsed player who is asked for nothing runs through a
> `Set-Cookie` header, and the deployment topology above decides whether that cookie keeps its
> declared lifetime or is capped to seven days. The claim is scoped to the mechanisms enumerated
> here rather than to every mechanism that could exist, and it is what makes serving the client and
> its API from one hostname a product decision rather than an operational one.

*Reasoned — from the four facts above and the HTTP cache section below. Nothing new was checked to
establish it, and nothing has observed a real Safari doing it.*

**Chrome evicts whole origins, least-recently-used first**, when it is over its overall
storage limit. An origin may use up to roughly 60% of disk, much less in Incognito.

> So eviction is all-or-nothing. Any recovery path must assume the local store is simply gone
> — not stale, not partially readable.

*Sourced — Chrome's storage documentation, checked 2026-08-29.*

**Android eviction behaviour is unresearched.** No findings exist either way.

> So we must treat it as unknown rather than safe, and must not infer it from Chrome desktop's
> numbers.

*Sourced — the absence of any finding, tracked as [an open question](questions/how-does-android-evict-stored-data.md).*

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

*Sourced — Expensify's published telemetry, checked 2026-08-31.*

**IndexedDB is unavailable entirely under Lockdown Mode**, and Apple's own description of the
feature does not mention it.

> So the storage layer has to detect its own absence and degrade rather than assume a database
> it can always open. Some players get no persistence at all, and finding that out by crashing
> is the wrong way to find it out.

*Sourced — WebKit's Safari 17 feature announcement.*

**`navigator.storage.estimate()` reports a fabricated quota on iOS**, derived from a fixed
volume capacity rather than the device's real disk, as an anti-fingerprinting measure. Every
iPhone reports roughly the same number regardless of how much space it has.

> So we must build no quota management and must never show the figure to anyone. Running out of
> space is not the failure worth designing against here.

*Sourced — WebKit trunk, `WebsiteDataStoreCocoa.mm`, read 2026-08-31.*

**Letting IndexedDB generate a key currently triggers a WebKit defect.** On iOS 26 the first
write after a cold start fails when the store relies on the browser to mint the key; a WebKit
engineer attributes it to exactly that. The bug was closed once and has been reopened.

> So keys must be assigned by us rather than by the store. Doing this from the first line costs
> nothing; adopting it later costs a migration of every player's data, which is why it is
> recorded here despite being a defect.

*Sourced — WebKit bug 229178, reopened, checked 2026-08-31. This is a defect rather than a
design, so it may be fixed and stop being true. The mitigation is worth taking regardless,
because it is free and the failure it avoids is a lost first write.*

---

## Browsers — the HTTP cache is not storage

*These are about the browser's ordinary network cache, which is a different mechanism from the Cache
API above and is governed by different rules. The two are easy to conflate, and the conflation
suggests an offline mechanism that does not exist.*

**The HTTP cache sits outside the Storage Standard entirely.** The specification separates "Network:
HTTP cache, cookies, authentication entries, TLS client certificates" from "Storage: Indexed DB, Cache
API, service worker registrations, `localStorage`, `sessionStorage`". Its registered storage endpoints
are `caches`, `indexedDB`, `localStorage`, `serviceWorkerRegistrations` and `sessionStorage`. The HTTP
cache is not one of them.

> So `navigator.storage.persist()` does not cover it, and no API tests whether a URL is in it, places
> one there, or reports an eviction. Nothing a page can execute establishes that a document is
> available offline, and nothing can verify it afterwards. It is unusable as the mechanism behind a
> promise, whatever it happens to do on any given device.

*Sourced — the [WHATWG Storage Standard](https://storage.spec.whatwg.org/), "Lay of the land" and the
storage endpoints table, read 2026-09-03.*

**A cache may serve a stale response while disconnected, and is not required to.** RFC 9111 §4.2.4:
"A cache MUST NOT generate a stale response unless it is disconnected or doing so is explicitly
permitted by the client or origin server", where disconnected means it "cannot contact the origin
server or otherwise find a forward path for a request".

> So offline behaviour for an expired entry is at the browser's discretion. A design that needs a
> document offline after its freshness lifetime has elapsed is relying on permission granted to the
> implementation rather than on a behaviour anything guarantees.

*Sourced — [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html) §2 and §4.2.4, read 2026-09-03.*

**`stale-if-error` does not cover a connection failure.** RFC 5861 defines the error it responds to as
"any situation that would result in a 500, 502, 503, or 504 HTTP response status code being returned".
A device with no network produces no status code.

> So the directive that looks like it solves the case above does not reach it, and browser support for
> it appears to be absent in any case.

*Sourced — RFC 5861, read 2026-09-03 by a research agent. Browser support was investigated and not
established either way: an archived compatibility table showed no support, and a current one could not
be loaded.*

**Safari's tracking-prevention deletion does not include the HTTP cache.** The data types it removes
are Cookies, DOMCache, IndexedDBDatabases, LocalStorage, MediaKeys, SearchFieldRecentSearches,
SessionStorage, ServiceWorkerRegistrations, FileSystem, ScreenTime and EnhancedSecurityRecord.
`DiskCache` and `MemoryCache` are absent, and the branch that would delete the disk cache is gated on
a type this path never sets.

> So the HTTP cache outlives the service worker registration and the Cache API that the app itself
> controls. This does not make it a durable mechanism — it is still evicted under size pressure with
> no notice, and the entry above establishes that nothing can inspect or populate it. What it means is
> narrower: after a 30-day wipe the app is rebuilding from nothing regardless, because the registration
> that would have served a cached document is one of the things deleted.

*Sourced — WebKit trunk, `Source/WebKit/NetworkProcess/Classifier/WebResourceLoadStatisticsStore.cpp`,
`monitoredDataTypes()`, read 2026-09-03 by me. The claim that the disk-cache deletion branch in
`NetworkProcess.cpp` is gated on `WebsiteDataType::DiskCache` is second-hand from a research agent and
I did not open that file.*

**WebKit evicts HTTP cache entries under size pressure, per entry and probabilistically.** Eviction
runs only when the cache exceeds its capacity, and picks entries by a worth calculation over time
since last access relative to age. There is no calendar-age cutoff.

> So an entry's survival depends on what else the device has been browsing, which is outside our
> influence and unobservable from the page.

*Sourced — WebKit trunk, `NetworkCacheStorage.cpp`, read 2026-09-03 by a research agent. Not opened by
me.*

**HTTP cache entries evict independently of one another.** Nothing in the caching specification treats
a document and the resources it references as a unit, and Chromium's disk cache documents per-entry
eviction by last access.

> So a surviving document can reference an evicted bundle, which is a blank screen, or a differently
> versioned one, which is worse because it is silent. Any mechanism that has to deliver a document and
> its assets together needs something that installs them as a set.

*Reasoned from the specification's silence, plus Chromium's design documentation read 2026-09-03 by a
research agent. Firefox and WebKit eviction granularity was not confirmed.*

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

*Sourced — WebKit bugs 171766 (removal, 2017) and 288846 (restore request, open and unassigned),
plus browser support tables showing no Safari version through 26.6 supporting it, checked
2026-08-31.*

**Web content is capped at 60 frames per second on iOS, including inside a `WKWebView`.** ProMotion
displays run at up to 120Hz for native content. The WebKit issues tracking this have been open
since 2017 and June 2025, the capability exists behind a preference that is off by default, and
there is no public API for a page or an embedding app to opt in.

> So animation smoothness has a ceiling that native code does not have, and — unusually among the
> facts in this file — wrapping the app in a native shell does not lift it. Animation should be
> designed to read well at 60fps rather than tuned to a rate the platform will not deliver.

*Sourced — WebKit bugs 173434 and 294338, both open, checked 2026-08-31.*

---

## Browsers — a version floor is a device lifecycle, not a release history

*These decide which engine binds a support floor. They are vendor lifecycle facts rather than
storage behaviour, which is why they sit apart from the sections above.*

**Safari's version is fixed by the OS version and Chrome's is not.** Safari updates only when iOS or
macOS updates, so an iPhone that cannot take a newer iOS cannot take a newer Safari. Chrome on
Android updates through the Play Store independently of the OS, and stops only when the OS falls
below Chrome's own minimum.

> So the oldest browser in any realistic population is a Safari rather than a Chrome, and an old
> Android phone is not the same thing as an old browser. A support floor is decided on the Apple
> side; the Android side decides only who is excluded by it.

*Reasoned — from the two vendor facts below.*

**Chrome on Android requires Android 10 or later.** Google states it directly: "To use Chrome browser
on Android, you'll need: Android 10 or later." A device below that keeps whatever Chrome build it
last received, permanently.

> So what strands an Android user on an old browser is the OS falling below Chrome's minimum, not a
> manufacturer failing to push updates. What share of devices that is could not be established, and
> no figure should be cited for it.

*Sourced — [support.google.com/chrome/a/answer/7100626](https://support.google.com/chrome/a/answer/7100626),
read 2026-09-12.*

**Apple publishes its own iOS adoption, and the tail is short.** 79% of all iPhones run iOS 26, and
86% of those introduced in the last four years, "as measured by devices that transacted on the App
Store on June 7, 2026". The oldest branch still receiving security fixes is iOS 15, with 15.8.8 and
16.7.16 both released 2026-05-11, reaching back to the iPhone 6s.

> So the widest defensible floor on the Apple side is the Safari shipping with iOS 15, and anything
> below it belongs to a device Apple has stopped patching. This is a figure about the world rather
> than about this app's players, of whom nothing is known and nothing may be claimed.

*Sourced — [developer.apple.com/support/app-store](https://developer.apple.com/support/app-store/) and
[support.apple.com/en-us/100100](https://support.apple.com/en-us/100100), read 2026-09-12. The first
read here; the second by a research agent and not opened here.*

**A syntax error in a script is total and happens before any of it runs.** A script the engine cannot
parse executes nothing, so a single unsupported token costs the whole application rather than the
feature that used it.

> So a syntax floor is categorically different from the floor for any one API. A missing API fails at
> the call site, where it can be detected and worked around at runtime; an unparseable bundle cannot
> be. Anything a browser below the floor is meant to see has to reach it outside that bundle.

*Reasoned — a property of how scripts are parsed and executed.*

---

## Mobile networks — setup cost, not bandwidth

**A fresh connection costs several round trips before any payload moves** — TCP's handshake
plus TLS negotiation, three to four in total depending on TLS version and whether DNS is warm.

> So we must optimise for avoiding fresh connections, not for smaller messages.

*Reasoned — a property of the protocols.*

**Per the WICG Network Information API thresholds, `3g` has an RTT floor around 270ms, and
`2g`/`slow-2g` run 1400-2000ms or worse.** Degraded real-world signal commonly sits at or
below the 2g tier.

> So on a weak link, connection setup alone is several seconds before anything happens.
> Nothing on the interaction path may require a fresh connection.

*Sourced — the WICG Network Information API specification. The thresholds are definitional;
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

*Sourced — WebKit implements none of the three, checked 2026-08-31.*

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

## Content delivery — what reaches a device cannot be recalled

**Anything shipped to a device as part of the application can be read and replayed by whoever holds
it.** A file served to a client sits in that client's cache and on its disk, and neither HTTP nor the
browser offers a way to withdraw it or to make later access conditional on anything.

> So gating happens before bytes leave the server or not at all. Content that might ever be withheld
> — from a player who has not paid, or has not reached a date — cannot ship as static files alongside
> the application. This is a property of client-side delivery rather than of any particular host, and
> it is settled when the delivery mechanism is chosen rather than when gating is wanted.

*Reasoned — a property of how clients fetch and cache, not specific to any vendor. It follows
directly and has not been tested here because there is nothing to test it against.*

**An offline promise puts content on the device by construction.** Anything that must be usable with
no network has to be there before the network goes away, which means it is delivered and therefore
un-gateable from that moment.

> So gating can only ever apply to content a player has not been given yet. What is in play is theirs
> — that is not a leak, it is what the offline promise means — and any design that assumes otherwise
> is assuming something the platform cannot deliver.

*Reasoned — a consequence of the fact above combined with
[the board in play continues through a loss of connectivity](guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md).*

---

## Streaming over HTTP proxies

**A streaming bug can live at one specific intersection of proxy, browser and protocol.** One
delay reproduced only on iOS WebKit over HTTP/2 behind one proxy, while desktop Chromium, curl,
the same phone on a different network path, and the same browser behind a different proxy were
all instant.

> So streaming must be tested on real iOS Safari on a real network. Simulators and desktop
> browsers cannot catch this class of bug.

*Measured — observed directly while debugging, with the alternatives eliminated one at a time.*

**Without content-hashed filenames, browsers revalidate cached assets** with conditional
requests instead of skipping them.

> So every asset costs a round trip per load unless content-hashed and cached immutably. Cheap
> on desktop, expensive on a weak mobile link.

*Reasoned — HTTP caching semantics.*

**Proxies buffer a response before compressing it, which breaks streaming**, and they terminate
connections they judge idle.

> So any streaming response must set `Content-Encoding` explicitly rather than leave compression
> to an intermediary, and any long-lived stream needs a heartbeat — which collides directly with
> the radio-battery constraint above.

*Reasoned — observed on one proxy and stated in the legacy analysis to hold for Nginx,
Cloudflare and Envoy too. That generalisation is untested here.*

---

## Machines and volumes — one disk is one point of failure

**A volume attached to a machine is not replicated, and losing the drive loses the data.** Fly states
it directly: "If your app needs a volume to function, and the NVMe drive hosting your volume fails,
then that instance of your app goes down. There's no way around that." Volumes are independent of one
another — "Fly.io does not automatically replicate data among the volumes on an app" — and the
provider's own daily snapshots "shouldn't be your primary backup method."

*Sourced — [fly.io/docs/volumes/overview](https://fly.io/docs/volumes/overview/), read 2026-09-02.*

**So a store held on one machine's disk survives a restart and a redeploy, and does not survive the
machine.** Anything that has to outlive the host needs a copy that is not on it. That is what
[ADR-0022](decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md) commits
to and what [how is the store backed up?](questions/how-is-the-store-backed-up.md) has to deliver;
until it does, the third of those three events is a claim nothing can honour.

**Recovery from host loss is a rebuild, not a failover** — provision, restore, redeploy. The length of
that outage is set mostly by how automated the procedure is rather than by which provider is chosen,
which is why it bears on
[how much downtime is acceptable?](questions/how-much-downtime-is-acceptable.md) without being
answered by a hosting choice.

## Runtimes — a heap ceiling does not bound a process

**A JavaScript runtime's heap limit governs the JS heap and nothing else, so a process can exceed its
container's memory while staying inside its configured ceiling.** Measured on 2026-09-19 in Linux
arm64 containers capped at 256 MB: a script allocating through `Buffer.alloc` exited 137, killed by
the kernel with no output, under Node, Bun and Deno alike, with and without a heap ceiling set,
because a buffer is not in the space the ceiling bounds. The same script allocating on the JS heap
exited 133 under Node and Deno after printing GC diagnostics and a native stack trace, once a ceiling
below the container limit was set.

*Measured — Docker 29.0.1, linux/arm64, `node:26-slim`, `oven/bun:1.4.2-slim`, `denoland/deno:2.9.7`,
run by me. The comparative figures and their method are in
[ADR-0030](decisions/0030-typescript-outside-the-browser-runs-on-node.md).*

**So two things follow for anything that has to notice its own failure.** A ceiling set below the
container limit is what converts a JS-heap exhaustion from a silent kill into a logged abort, and
nothing sets one by default. And no ceiling helps against off-heap growth, so a buffer or native
allocation leak is invisible on every runtime and has to be caught by watching the process from
outside rather than by configuring it. That is an input to
[what are the server's vitals, and who watches them?](questions/what-are-the-servers-vitals-and-who-watches-them.md)
and to [how would we notice a problem nobody predicted?](questions/how-would-we-notice-a-problem-nobody-predicted.md),
both at M11.

## Runtimes — type stripping stops at `node_modules`

**Node refuses to strip types from a TypeScript file under a `node_modules` path, and the refusal is
deliberate rather than a gap.** From its type-stripping documentation: "To discourage package authors
from publishing packages written in TypeScript, Node.js refuses to handle TypeScript files inside
folders under a `node_modules` path." An import that resolves there throws
`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`.

*Sourced — [nodejs.org type stripping](https://nodejs.org/docs/latest-v26.x/api/typescript.html),
read 2026-09-19. Measured — reproduced on Node v26.7.0 by packing a workspace package into an
artifact's `node_modules` and importing it.*

**So a TypeScript module shared as source runs while it resolves outside `node_modules` and stops
the moment anything packs it inside one.** Inside a workspace the sibling is a symlink whose real
path is the source directory, so Node strips it and it runs. A step that copies the package into
`node_modules` to build a deployable produces an artifact that fails at its first import, and it
fails at run time rather than at build time.

That is what [ADR-0005](decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)
runs into: either the shared rules module is compiled before it ships, or the deployable keeps it
outside `node_modules`. It is an input to
[how is the codebase laid out?](questions/how-is-the-codebase-laid-out.md),
[what shape is the deployable?](questions/what-shape-is-the-deployable.md) and
[is server TypeScript transpiled or stripped?](questions/is-server-typescript-transpiled-or-stripped.md).

## Runtimes — decorators do not run, and the flag that transformed them is gone

**Node parses decorators as a syntax error rather than ignoring or transforming them.** From its
type-stripping documentation: "Since Decorators are currently a TC39 Stage 3 proposal, they are not
transformed and will result in a parser error. Node.js does not provide polyfills and thus will not
support decorators until they are supported natively in JavaScript." The same page's history table
reads "v26.0.0 — Removed `--experimental-transform-types` flag", so the escape hatch that once
transformed decorators, enums, parameter properties and import aliases no longer exists on this line.

*Sourced — [nodejs.org type stripping](https://nodejs.org/api/typescript.html) at v26.9.0, read
2026-09-21.*

**So a library whose ordinary use requires a decorator cannot be run by Node directly, and this
eliminates rather than inconveniences.** It is why
[ADR-0035](decisions/0035-the-http-handler-is-fastify.md) removes the decorator-based server
frameworks as a class rather than scoring them, and it reaches any later choice whose idiomatic API
is decorator-driven — an ORM as readily as a router. The condition that would lift it is a
transpilation step ahead of Node, which is
[is server TypeScript transpiled or stripped?](questions/is-server-typescript-transpiled-or-stripped.md)
at M2.

## Dependencies — Fastify's default listen hides a second listener from `close()`

**Fastify's `listen({ port })` binds both stacks by creating a main server and a secondary one, and
only the main one is `app.server`.** A request arriving over IPv4 lands on the secondary listener,
`app.server.getConnections()` reports zero while that request is being handled, and `close()`
therefore returns immediately. Bare `node:http`, Express and Hono all report one connection under
the same conditions and wait.

*Measured — on Node v26.7.0 with `fastify` 5.12.5, 2026-09-21. Varying the bind host and the client's
address family isolates it: the default bind with an IPv4 client is the only failing combination, and
`host: '0.0.0.0'`, `host: '::'` or an IPv6 client all wait for the request to finish.*

**So the framework's own documented pattern for releasing a database is unsafe under its own default.**
Fastify's hooks reference calls `onClose` the safe place to release a resource because "all in-flight
HTTP requests have been completed"; under the default listen it fires with a request still running,
and a store handle released there produces a 500 reading `database is not open` over a half-written
row. [ADR-0035](decisions/0035-the-http-handler-is-fastify.md) makes an explicit `host` part of the
decision for this reason, and it is the one part whose absence fails silently.

## Servers — framework throughput is three orders of magnitude above this workload

**The whole JavaScript server field answers tens of thousands of requests a second on one core, and
the spread between candidates is single-digit percent once real work is attached.** Serving a route
that reads a row through `node:sqlite` and returns JSON: Fastify 58,960 requests a second, bare
`node:http` 56,455, Hono 54,151. On a JSON-only route the same three reach 87,072, 83,593 and 76,256,
so the gap narrows as soon as the store is involved — which is what published benchmarks, measuring
the JSON-only case, cannot show.

*Measured — autocannon at 50 connections for 10 seconds after a 5 second warmup, Node v26.7.0, macOS
Darwin 25.6.0, Apple M2, 2026-09-21.*

**So per-request framework overhead does not bind, and a decision taken on it is taken on noise.**
The difference between the fastest and slowest of those is 0.075ms per request, which is 0.028% of
the 270ms 3G round-trip floor recorded above. Against a deliberately generous model — ten thousand
daily players making twenty requests each, concentrated twentyfold into a morning peak — the peak is
46 requests a second, roughly 0.08% of measured capacity. For an 8.9% difference to matter the server
would have to run above 91% of capacity, about a thousand times this workload, and
[ADR-0004](decisions/0004-the-client-holds-and-mutates-puzzle-state.md) keeps it off the path a
player waits on regardless. This is why
[ADR-0036](decisions/0036-request-and-response-bodies-are-described-with-zod.md) can give up
Fastify's `fast-json-stringify` path for a schema library that fails loudly, and why a throughput
benchmark is not among the things worth running here.

**Two neighbouring quantities were measured and do not bind either, which is worth recording so the
measurement is not repeated.** Resident memory at boot ranged from 66.1MB to 77.9MB across bare
`node:http`, Express, Fastify, Hono and srvx, and grew five to seven megabytes over four hundred
requests for every one of them. Startup from process spawn to first served response ranged from 54ms
to 86ms. Nothing in [problem.md](problem.md) or the records makes a twelve-megabyte or
thirty-millisecond spread matter.

*Measured — same machine and date as above, with the large-body tests disabled, since buffering a
200MB request body is what produces gigabyte-scale figures and would otherwise be read as a
per-request cost.*

## Toolchain — TypeScript's compiler API moved out of its root export

**A tool that loads TypeScript as a library, rather than shelling out to `tsc`, cannot use a current
release.** `typescript@7.0.2` is npm's `latest`, and its `exports` map sends the root specifier to
`./lib/version.cjs`, leaving the compiler surface reachable only under `./unstable/*`. The
type-aware linter in widest use states the consequence in its own manifest:
`typescript-eslint@8.70.0` declares a peer range of `typescript >=4.8.4 <6.1.0`.

*Measured — `npm view typescript dist-tags`, `npm view typescript@7.0.2 exports` and
`npm view typescript-eslint@8.70.0 peerDependencies`, run 2026-09-20.*

> So this binds checking and not running. Node strips types without consulting TypeScript and Vite
> transforms them with esbuild, so no execution path touches it. What it reaches is the step that
> lints with type information, and what to do about that is
> [what runs the checks on every change?](questions/what-runs-the-checks-on-every-change.md) at M2.

*Unlike the rest of this file, a claim about a tool can be overtaken by a release shipping the same
week. Re-run the three commands above before building on it.*

## Databases — SQLite is not safe on a network filesystem

**SQLite's maintainers advise against it, and the failure is corruption rather than an error.** From
the locking documentation: "POSIX advisory locking is known to be buggy or even unimplemented on many
NFS implementations (including recent versions of Mac OS X) and that there are reports of locking
problems for network filesystems under Windows. Your best defense is to not use SQLite for files on a
network filesystem."

*Sourced — [sqlite.org/lockingv3.html](https://www.sqlite.org/lockingv3.html), read 2026-09-03.*

**So an embedded store and a network-mounted disk do not combine.** This rules out Cloud Run's Cloud
Storage FUSE and NFS mounts and AWS Lambda with EFS as homes for one, whatever else they offer, and it
is why [ADR-0021](decisions/0021-the-server-and-its-store-share-a-machine.md) puts the process and the
file on the same machine rather than treating co-location as an implementation detail.

## Law and licensing

**AGPL-3.0's network-use clause generally requires releasing a hosted service's complete source
to any user of that service.** At least one prominent sudoku library is AGPL-3.0.

> So we must audit dependencies for *network* copyleft, not only distribution copyleft. AGPL is
> disqualifying for anything linked into a hosted service.

*Sourced — the licence text.*

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
