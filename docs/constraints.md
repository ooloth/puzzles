---
updated: 2026-10-03
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

- **Measuring what does not bind.** The time to update one cell of an 81-cell grid is the example:
  it is a few elements changed once per input, whatever renders them. A real number about an
  irrelevant quantity ends arguments it should not. Which client paths do bind is open, per the
  device section below.
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
first-party.** The check runs on every subresource request to the same site as the page, including
one to the page's own hostname. Safari compares the request against what it recorded about the page's
host from that host's top-level navigation. If the request resolved through a CNAME, the CNAME
target's registrable domain must match the page's domain or the host's own recorded CNAME. With no
CNAME, the request's IP address must share its leading 16 bits (IPv4) or 64 bits (IPv6) with the
host's recorded address. A cookie on a response that fails is capped to 7 days.

> So the recovery mechanism above depends on deployment topology, not just on code, and it fails
> silently: the cookie expires in seven days alongside the storage it was meant to outlive. A static
> host with the API on a subdomain served by a different provider is the shape that fails. An API on
> the page's own hostname passes, because it is compared with itself. Two subdomains CNAMEd to the
> same provider's registrable domain also pass, so the same hostname is sufficient but not the only
> safe arrangement. And a *genuinely* cross-site API is not exempt because the cap does not reach it:
> its cookies are blocked outright by ordinary third-party cookie blocking, which is worse rather
> than better.

*Sourced — WebKit [PR #5347](https://github.com/WebKit/WebKit/pull/5347), diff read 2026-09-02, for
[bug 246477](https://bugs.webkit.org/show_bug.cgi?id=246477) ("Cap cookie lifetimes to 7 days for
responses from third party IP addresses", filed by Wenson Hsieh 2022-10-13, resolved 2022-10-21).
`shouldCapCookieExpiryForThirdPartyIPAddress` compares `remote.matchingNetMaskLength(firstParty)`
against `4 * sizeof(struct in_addr)` and `4 * sizeof(struct in6_addr)` — 16 and 64 bits, evaluated
here rather than quoted from the source. The call sits behind `if (request.isThirdParty()) return;`,
so it runs only for requests that are not third-party, and behind `if (cnameDomain.isEmpty())`, so
the IP comparison is the fallback when no CNAME exists. Top-level navigations are excluded earlier.
Which Safari version shipped it is widely reported as 16.4 and appears in no Apple release note, so
the version is unverified while the mechanism is not. WebKit trunk still carries it: re-read 2026-09-26 in `NetworkTaskCocoa.mm`
`setCookieTransformForFirstPartyRequest`, at `2eb570e1d735` (2026-09-23), the last commit touching
the file, which is also the source for the same-hostname comparison and the registrable-domain
match described above.*

**What Safari compares against is kept in memory and recorded only from a network response to a
top-level navigation.** It sits in two in-memory maps on the network session, filled when a top-level
navigation's response arrives. A navigation answered by a service worker, which
[ADR-0023](decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md) makes the
normal case, may never record it in that browser session. With nothing recorded, the IP comparison
lets the cookie through, but the CNAME comparison caps it: a request whose hostname is a CNAME to a
provider's domain fails even when that hostname is the page's own.

> So a hostname that is a CNAME to a platform's domain may cap even a same-hostname API's cookies,
> on any visit after a browser restart where the service worker answered the navigation. An apex
> domain served by A records has no CNAME and does not hit this. Whether it happens in a shipped
> Safari is unobserved, so it bears on
> [how does the domain reach the deployment?](questions/how-does-the-domain-reach-the-deployment.md)
> as a risk to test rather than a fact to design around.

*Reasoned from source, not observed. WebKit trunk read 2026-09-26 at the last commit touching the
file, `2eb570e1d735` (2026-09-23): `NetworkDataTaskCocoa::updateFirstPartyInfoForSession` is called
from `didReceiveResponse` only when `isTopLevelNavigation()`, and writes
`m_firstPartyHostCNAMEDomains` and `m_firstPartyHostIPAddresses`, both `HashMap`s declared in
`NetworkSession.h`. In `NetworkTaskCocoa.mm`, a missing recorded address returns the cookies
uncapped, and the CNAME branch caps when `!cnameDomain.matches(firstPartyURL) && (!firstPartyHostCNAME
|| ...)`. Whether a service-worker-answered navigation reaches `didReceiveResponse` as a top-level
navigation was not traced.*

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

## Browsers — a cached script still costs a compile, and nobody publishes when a page is discarded

**Chrome compiles scripts eagerly into its code cache only when they are classic scripts cached during
a service worker's install.** A module script loses that cache and falls back to the ordinary one,
which compiles lazily and caches on later loads. Vite emits module scripts, so a cold start under
Chrome pays the ordinary path. Whether Safari persists compiled bytecode for page scripts is not
documented anywhere found.

*Sourced — [v8.dev/blog/code-caching-for-devs](https://v8.dev/blog/code-caching-for-devs), opened
2026-09-24: "If the page ends up loading it as an ES module instead then the code cache will be
discarded and replaced with a 'normal' code cache." The Safari half is a research agent's report of
finding nothing, recorded in the renderer question, read with `git show b931fb7:docs/questions/what-renders-the-client.md`.*

**Neither iOS nor Android publishes when it discards a backgrounded page.** WebKit releases memory in
stages under pressure and iOS kills the page's process with no published threshold, and
`document.wasDiscarded` exists only in Chrome. So a page cannot learn it was discarded on iOS, only
that it was hidden.

*Sourced by a research agent from WebKit's `MemoryPressureHandler.cpp` and caniuse, both opened by it
2026-09-24, and recorded in the renderer question, read with `git show b931fb7:docs/questions/what-renders-the-client.md`.*

> So every JavaScript byte is paid for in compilation on each cold start, not only on the first
> download, and the last write before a page is hidden has to complete on `pagehide` or
> `visibilitychange`, because nothing reliably says afterwards that the page was thrown away.

---

## Browsers — touch and focus do not behave the way a mouse test shows

**A touch drag keeps reporting to the element it started on.** On touch, the browser captures the
pointer to the element the finger went down on, so `pointerenter` never fires on the elements a
finger drags across, and a drag-select built on it selects one cell. Releasing the capture on
`pointerdown`, or finding the cell under the finger's coordinates in `pointermove`, restores it, and
`touch-action: none` on the board stops the page scrolling instead.

*Measured — a six-cell drag sent as touch events through Chromium's DevTools protocol against three
builds of the board, 2026-09-24: one cell selected by the builds relying on `pointerenter`, six
after the fix. Recorded in the renderer question, read with `git show b931fb7:docs/questions/what-renders-the-client.md`.*

**WebKit does not focus a button when it is clicked.** So code that remembers
`document.activeElement` when a dialog opens remembers the page body, and focus is lost when the
dialog closes.

*Measured — Playwright's WebKit 26.6, 2026-09-24: focus returned to the body after closing a dialog
in the build that remembered the active element, and to the button in the builds that named it.*

> So every drag gesture is tested with real touch events rather than a mouse, and focus is always
> returned to a named element rather than to whatever was focused before. Neither fault shows in a
> test driven by a mouse in Chromium.

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

> So the size of a puzzle's data does not bind: no plausible data model holds enough to strain the
> memory of such a phone.

*Reasoned — the legacy source states plainly that this is an order-of-magnitude bound rather
than a measured benchmark. It clears by several orders of magnitude, which is why the bound is
enough.*

**That bound covers the size of the data and nothing else, and it is taken on the wrong device.**
[The app runs on any device still receiving security updates](guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md)
reaches phones well below mid-range. And what the client spends CPU and memory on is mostly not its
data: parsing and running the app's code on every cold launch, work and allocation on each update
during high-frequency input, updates that touch hundreds of elements at once, grids much larger than
81 cells, and a resident heap large enough that the operating system discards a backgrounded page.

> So whether client CPU and memory bind on those paths on a floor device is open, and nothing may
> cite this section to say they do not. The renderer was chosen against them measured on an Apple M2
> only, and a measurement on a floor-class device is what
> [ADR-0038](decisions/0038-the-renderer-is-react.md) names as its reason to revisit.

*Reasoned — from the floor guarantee and from what a renderer spends CPU and memory on. Nothing here
has been measured.*

---

## Browsers — a second origin costs round trips

*In scope because [decisions/0003](decisions/0003-this-is-delivered-over-the-web.md) chose web
delivery.*

**A cross-origin request that sends JSON waits for a preflight, and a same-origin request never
does.** `Content-Type: application/json` is not a CORS-safelisted value, so a cross-origin POST
carrying it sends an `OPTIONS` request and waits for the answer before the request itself leaves. A
GET with no custom headers does not preflight. A same-origin request never reaches the preflight
step.

> So on a split topology every JSON write pays one more round trip, on links where one costs 270ms
> to 2s. Avoiding it cross-origin means never sending a non-safelisted header, a rule on the API's
> whole write contract.

*Sourced — WHATWG Fetch, `fetch.bs` in whatwg/fetch, the CORS-safelisted request-header and HTTP
fetch algorithms, read 2026-09-26.*

**A preflight is cached per exact URL, for at most ten minutes in Safari.** The cache entry is keyed
on the request's URL, so each distinct path preflights on its own. WebKit caps a cached preflight at
600 seconds, Chromium at 2 hours and Firefox at 24 hours, and all three default to 5 seconds when the
server sends no `Access-Control-Max-Age`.

> So a preflight is not a one-time cost. A player on Safari pays it again on every session more than
> ten minutes after the last, and on every new URL.

*Sourced — `fetch.bs` cache entry definition, and WebKit
`Source/WebCore/loader/CrossOriginPreflightResultCache.cpp`, `maxPreflightCacheTimeout = 600_s`,
both opened 2026-09-26. Chromium `services/network/cors/preflight_result.cc` (`kMaxTimeout =
base::Hours(2)`) and Firefox `netwerk/protocol/http/nsCORSListenerProxy.cpp` (cap of 86400) were
read by a research agent the same day.*

**A beacon always sends cookies, and preflights when its body is not a safelisted type.** WebKit's
`sendBeacon` sets credentials to include unconditionally and switches to CORS mode for a body such as
JSON. A `fetch` with `keepalive` behaves the same. In Chromium and WebKit the load moves to the
network process when the page goes away, so the preflight delays the send rather than losing it.

> So the fire-and-forget send on `visibilitychange`, which the mobile-networks section above makes
> the last chance to persist, carries a preflight ahead of its data when it crosses origins.

*Sourced — W3C Beacon `index.bs`, and WebKit `Source/WebCore/Modules/beacon/NavigatorBeacon.cpp`
lines 138 to 157, opened 2026-09-26. WebKit `NetworkResourceLoader::abort` and Chromium
`content/browser/loader/keep_alive_url_loader.h` were read by a research agent the same day.*

**A second hostname needs its own connection unless the browser coalesces it, and Chromium never
coalesces across credentials modes.** HTTP/2 and HTTP/3 allow a connection to be reused for another
hostname when the certificate covers both, and Chrome and Firefox also require the addresses to
overlap. The Fetch spec keys its connection pool on credentials as well as origin, and Chromium's
connection key carries the same distinction, so an uncredentialed cross-origin `fetch` does not
share the document's connection. Safari coalesces by Apple's account and publishes no conditions.

> So a separate API hostname adds DNS, TCP and TLS setup, three to four round trips, to the first
> call after the page loads, unless coalescing applies, and a same-origin call adds none.

*Sourced — RFC 9113 §9.1.1 via httpwg/http2-spec, RFC 9114 §3.3, `fetch.bs` connection pool
definition, Chromium `net/base/privacy_mode.h` and `net/spdy/spdy_session_key.h`, Firefox
`StaticPrefList.yaml` (`network.http.http2.coalesce-hostnames`), and WWDC 2020 session 10111, read by
a research agent 2026-09-26. Not re-opened by the agent that recorded them.*

---

## Browsers — fetch metadata headers are missing below Safari 16.4

*In scope because [decisions/0003](decisions/0003-this-is-delivered-over-the-web.md) chose web
delivery.*

**Safari and iOS Safari before 16.4 send no `Sec-Fetch-Mode`, `Sec-Fetch-Dest` or `Sec-Fetch-Site`
header.** browser-compat-data records `Sec-Fetch-Mode` from Chrome 76, Firefox 90 and Safari 16.4,
with iOS mirroring Safari. Inside a service worker, `request.mode` is available far earlier; the gap
is only in what reaches the server.

> So below 16.4 the server cannot tell a navigation from any other request by its headers, and the
> declared floor includes Safari and iOS 15. A rule that routes on the header routes those browsers'
> navigations as whatever a missing header means.

*Sourced — [`Sec-Fetch-Mode.json`](https://raw.githubusercontent.com/mdn/browser-compat-data/main/http/headers/Sec-Fetch-Mode.json)
in mdn/browser-compat-data, read 2026-09-26. Re-check if the floor moves.*

---

## Hosting — some routing layers choose a backend by path alone

*In scope because [decisions/0040](decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md)
puts the client and the API on one origin, so something in front may have to route between them.*

**Cloudflare Pages' `_routes.json` matches on path only.** Its schema has three fields: `version`,
`include` ("Defines routes that will be invoked by Functions. Accepts wildcard behavior.") and
`exclude`. Nothing in it reads a request header.

**CloudFront picks an origin by path pattern only.** Each cache behavior names one origin, and "the
requested path is compared with path patterns in the order in which cache behaviors are listed in the
distribution. The first match determines which cache behavior is applied to that request." Its
header settings change what is cached, not where a request goes; choosing by header needs a function
running at the edge.

> So a rule that tells the API from the client by a request header cannot be applied by either
> without extra code, and a rule on a path prefix can be applied by both.

*Sourced — [Pages Functions routing](https://developers.cloudflare.com/pages/functions/routing/) and
[CloudFront cache behavior settings](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistValuesCacheBehavior.html),
read 2026-09-27. Vendor documentation; re-check when either is chosen.*

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

**A cached asset is used without a request only while it is fresh, and with no explicit expiry the
browser may guess one.** Per RFC 9111 §4.2.2, a cache may assign heuristic freshness when no
explicit expiration is sent, typically a fraction (10% is the example) of the time since
`Last-Modified`.

> So with no `Cache-Control`, an asset may be served stale after a deploy, or revalidated, at the
> browser's discretion. Content-hashed filenames are what make a long explicit `max-age` safe,
> because a changed file gets a new name. Without them the choice is between a round trip per asset
> per load, cheap on desktop and expensive on a weak mobile link, and the risk of running stale
> files.

*Sourced — RFC 9111 §4.2.2, read 2026-10-04.*

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

## Hosting — a DigitalOcean Droplet starts with no swap

**A fresh Basic Droplet has no swap.** When its memory runs out, the kernel's out-of-memory killer
ends a process rather than the machine slowing down. So each long-running service carries a memory
limit of its own, and the app's limit is what keeps a leak from ending something else. Adding swap is
a setup step, not a default.

**How much of the machine the base system takes.** The 1 GB Droplet reports 961 MB in total. About
320 MB was in use just after first boot, before anything was installed, while first-boot services such
as `unattended-upgrades` and `packagekitd` were still running. So that figure overstates the steady
state: with the app, Caddy and Litestream running, about 360 MB was in use in all.

**On Ubuntu, Livepatch is available for its kernel**, so most kernel fixes can be applied without a
reboot. The Droplet runs Debian 13, per
[ADR-0049](decisions/0049-the-droplet-runs-debian-13.md), which offers no live patching of its own.

*Measured — two `s-1vcpu-1gb` Droplets in `tor1` running Ubuntu 24.04, kernel `6.8.0-142-generic`,
created 2026-09-30. Read with `swapon --show` (it printed nothing), `free -m` after `cloud-init
status --wait`, and `pro status`. The figure with the app, Caddy and Litestream running comes from
the twelfth pass of where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`), which records its
method.*

**DigitalOcean moves a Droplet off a host being maintained or failing while it keeps running.** It
uses live migration "during events like normal infrastructure and network maintenance, software
upgrades, and hardware failures", and marks one "at least 10 minutes before" in the Droplet's
metadata. What happens when a host dies outright is not stated. That case is left to
[how is the store recovered when the machine is lost?](questions/how-is-the-store-recovered-when-the-machine-is-lost.md).

*Sourced — [live migration](https://docs.digitalocean.com/products/droplets/details/live-migration/),
read 2026-09-29.*

## Hosting — Debian 13 updates itself on its own clock, and asks for a reboot only after a kernel

**Debian 13 installs updates every morning unless told otherwise.** apt 3.0.3's
`apt-daily-upgrade.timer` runs at 06:00 machine time with up to an hour's random delay, and
`unattended-upgrades` acts on Debian's own archive and security archive only. A repository added by
hand, such as Caddy's or NodeSource's, is left alone until its origin is allowed. Caddy's repository
names its origin `cloudsmith/caddy/stable`; NodeSource's names `. nodistro`, shared by every major
line it publishes.

*Sourced — `sources.debian.org/data/main/a/apt/3.0.3/debian/apt-daily-upgrade.timer`, and the
`Release` files of `dl.cloudsmith.io/public/caddy/stable/deb/debian` and `deb.nodesource.com`,
fetched 2026-10-03; the allowed origins from `unattended-upgrades` 2.12's shipped configuration, read by a
research agent and seen in a run's log on a local Debian 13 VM, 2026-10-03.*

**Only a kernel install marks the machine as needing a reboot.** `unattended-upgrades` installs a
kernel hook that creates `/var/run/reboot-required`, and its automatic reboot waits for that file. An
upgrade of `libc6` creates no marker, and nothing restarts the processes still using the replaced
library unless something like `needrestart` is installed. Set to restart automatically,
`needrestart` restarts every affected unit, the app's included. Old kernels are removed by default.

*Sourced — the hook's text in `unattended-upgrades` 2.12 and its path in Debian 13's package file
list, and `Remove-Unused-Kernel-Packages` defaulting to true in its source, opened 2026-10-03.
Measured on a local Debian 13 arm64 VM on 2026-10-03: a kernel install created the marker, and
`needrestart` in automatic mode ran `systemctl restart app.service ssh.service ...` after a libc6
upgrade.*

**An upgrade run draws about 114 MB.** Upgrading libc6, OpenSSL and a kernel together lowered
`MemAvailable` from 751 MB to 637 MB on a 1 GB VM.

*Measured once, on a local Debian 13 arm64 VM, 2026-10-03, sampling every 0.2 seconds.*

**A pin to a snapshot of Debian's archive expires after about six days.** `apt -S <timestamp>`
installs the archive as it stood then, security included, but apt refuses a pin whose `Release`
file is past its `Valid-Until`: 4 days old was accepted, 7 days was refused, unless that check is
turned off. Repositories outside Debian's archive have no snapshot service.

*Measured on a local Debian 13 arm64 VM, 2026-10-03.*

**A repository that fails to download is hidden by the daily run.** In apt's `apt.systemd.daily`, a
failed `apt-get update` is reported only through `debug_echo` as "download updated metadata
(error)", and `unattended-upgrade` then runs anyway on the package lists already on disk. So a
repository that is unreachable, has moved, or fails its signature check leaves the machine on old
versions with nothing outside the journal saying so.

*Sourced: `debian/apt.systemd.daily` on apt's main branch, opened 2026-10-03. That apt 3.0.3 in
Debian 13 has the same flow is assumed from the branch, not checked against its tag.*

## Hosting — Debian 13's Caddy trails upstream's security fixes by months, and only Caddy's own repository keeps pace on both architectures

**Debian 13 ships Caddy 2.6.2 with fixes backported by its security team, months after upstream.**
`2.6.2-12+deb13u1` was uploaded to `trixie-security` on 10 August 2026 with fixes for eight CVEs that
upstream had fixed in 2.11.1 (23 February), 2.11.3 (12 May) and 2.11.4 (3 June): 68 to 168 days
later. CVE-2026-77281, fixed upstream in 2.11.4, is marked `<no-dsa> (Minor issue)` for trixie and
waits for a point release.

*Sourced: the package's `debian/changelog` on `sources.debian.org`, Caddy's GitHub releases API, and
Debian's security tracker pages for CVE-2026-45692 and CVE-2026-77281, opened 2026-10-03. Which
upstream release fixed each of the other CVEs was read from the tracker's descriptions by a research
agent and not re-opened for each.*

**Debian's backports have no security support.** The backports FAQ answers "Is there security support
for packages from backports.debian.org?" with "Unfortunately not. This is done on a best effort basis
by the people who track the package". Caddy in `trixie-backports` is `2.11.2-1~bpo13+1`, built for
amd64 only.

*Sourced: `backports.debian.org/FAQ/` and `qa.debian.org/madison.php?package=caddy`, opened
2026-10-03. That its arm64 build failed and was not retried is a research agent's reading of
`buildd.debian.org`, not re-opened.*

**Caddy's own apt repository, on Cloudsmith, publishes each release within hours, for amd64 and arm64
alike, and keeps old versions.** Both architectures' `Packages` indexes list the same 39 versions,
ending at 2.11.7. The 2.11.4 arm64 package was uploaded at 04:38 UTC on 3 June 2026, before the GitHub
release at 06:52. The repository's sources line scopes its key with
`signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg`. No published policy says whether its
`stable` channel would carry a Caddy 3, and Caddy's security policy supports only the latest 2.x.
The hosting is Cloudsmith's free open-source plan, whose policy says it "may have to suspend the
open-source repository" if eligibility is questioned.

*Sourced: both `Packages` indexes, Cloudsmith's package API for 2.11.4 and
`dl.cloudsmith.io/public/caddy/stable/debian.deb.txt`, opened 2026-10-03. The other releases' upload
times, the security policy and the hosting terms are a research agent's reading of Cloudsmith's API, its open-source hosting policy and Caddy's
`SECURITY.md`, not re-opened.*

**Every Caddy package restarts Caddy on upgrade.** Caddy's `postinstall.sh` runs
`deb-systemd-invoke try-restart caddy.service` when upgrading, and Debian's package copies that
script. Caddy 2 has no graceful binary upgrade.

*Sourced: `scripts/postinstall.sh` in `caddyserver/dist`, opened 2026-10-03. Debian's copy and the
lack of a graceful upgrade are a research agent's reading of Debian's `debian/rules` and Caddy's
forum, not re-opened.*

## Hosting — providers raise prices, and differ in whether existing machines are spared

**A host's price can rise under a running machine.** So a setup priced close to
[ADR-0045](decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md)'s
ceiling has less margin than its bill suggests.

- **DigitalOcean** raised its prices once, from 1 July 2022, the 1 GB Droplet going from $5 to $6:
  "for the first time there will be a price change on some of our products". *Sourced —
  [DigitalOcean's blog](https://www.digitalocean.com/blog/new-4-dollar-droplet-updated-pricing),
  opened 2026-09-30.* Existing Droplets were included, per third-party coverage not opened.
- **Linode** kept its $5 plan through a 20% rise on its other shared plans in 2023, per an agent's
  read of Akamai's announcement on 2026-09-30.
- **Hetzner** raised its prices for new orders on 15 June 2026, and "Existing servers are not affected
  by the price adjustment, as long as no rescaling is performed", per an agent's read of Hetzner's
  docs on 2026-09-30.
- **Fly** raises its memory prices from 1 October 2026, per a draft change to its own docs opened
  2026-09-30.

## Hosting — DigitalOcean has no spending cap

**Nothing DigitalOcean offers stops a charge without stopping the machine.** So a large bill is
prevented by what can create resources, and noticed by alerts, rather than capped.
[ADR-0046](decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md) and
[ADR-0047](decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md) follow
from this.

- "A spend alert budget is not a spending cap and does not limit how much you can use." Alerts go by
  email to a team's owners and billers, "within an hour of your spend crossing a threshold", and
  "Each threshold notifies once per billing cycle". *Sourced —
  [spend alerts](https://docs.digitalocean.com/platform/billing/billing-alerts/), opened 2026-09-30.*
- Spend alerts do not see transfer until it is invoiced: "projections of Droplet transfer in excess
  of the transfer pool do not trigger an alert until they are applied to the invoice". So traffic is
  watched with a Monitoring alert instead. *Same source.*
- "Droplets incur charges for as long as they remain on the platform, even if they are powered
  down." Only deleting one stops its charge, and deleting the production Droplet deletes the store.
  *Sourced — [unrecognised charges](https://docs.digitalocean.com/support/i-dont-recognize-a-charge-on-my-invoice/),
  opened 2026-09-30.*
- Prepayment caps nothing: "Prepayment does not waive the Customer's obligation to pay for usage
  exceeding the credit balance." *Sourced —
  [prepayment terms](https://www.digitalocean.com/legal/prepayments-and-resource-tier-terms), opened
  2026-09-30.*
- Serverless inference is the exception. It needs "a positive prepaid account balance before you can
  send inference requests", and "When your balance reaches $0, DigitalOcean suspends your access".
  Auto-reload is off by default. *Sourced —
  [inference prepayment](https://docs.digitalocean.com/products/inference/how-to/manage-serverless-inference-prepayment/),
  opened 2026-09-30.*
- Outbound transfer beyond the team's pooled allowance costs "$0.01 per GiB", and "Traffic dropped by
  DigitalOcean firewall rules is not billed". A Droplet adds to the pool as it runs: "For every second
  a Droplet exists, it accrues 1/2,419,200 of its total transfer allowance". *Sourced —
  [bandwidth](https://docs.digitalocean.com/platform/billing/bandwidth/), opened 2026-09-30.* The $6
  Droplet's allowance is "1,000 GiB" a month. *Sourced —
  [Droplet pricing](https://www.digitalocean.com/pricing/droplets), opened 2026-09-30.* So using the
  whole pool within a month takes about 3 Mbps sustained. *Reasoned from those two figures.*

**Some charges sit outside a Droplet's price, and outlive the Droplet.** A forgotten one shows up
only on the bill or a spend alert.

- A reserved IPv4 costs "$5.00 per month ($0.01 per hour) when reserved but not assigned to a
  Droplet"; reserved IPv6 is free. *Sourced —
  [reserved IP pricing](https://docs.digitalocean.com/products/networking/reserved-ips/details/pricing/),
  opened 2026-09-30.*
- Uptime checks cost $1 a month each after the first. *Sourced —
  [uptime pricing](https://docs.digitalocean.com/products/uptime/details/pricing/), opened 2026-09-30.*
- Spaces costs from $5 a month once enabled, and backups 20 or 30% of the Droplet's price. *Agents'
  reading of [Spaces pricing](https://www.digitalocean.com/pricing/spaces-object-storage) and
  [backup pricing](https://docs.digitalocean.com/products/backups/details/pricing/), 2026-09-29 and
  30; not opened.*

**A declined payment leads to suspension, and then possibly deletion.** For a failed monthly charge,
"We email the account owner" and "We place the account on hold, which prevents creating new
resources", while "existing resources continue to run". Then "We power down the account's
resources", and then "we may permanently delete the account's resources". "DigitalOcean does not
publish fixed timelines for these stages." "If the default payment method fails, we try charging
other payment methods on file." *Sourced —
[late payments](https://docs.digitalocean.com/platform/billing/late-payments/), opened 2026-09-30.* A
failed mid-month auto-charge is harsher: DigitalOcean "reserves the right to suspend account access
and resource availability immediately". The auto-charge applies to a team that "does not have a
payment history yet", at $25 for tier 1 and $50 for tier 2. *Sourced — the
[prepayment terms](https://www.digitalocean.com/legal/prepayments-and-resource-tier-terms) and
[paying bills](https://docs.digitalocean.com/platform/billing/pay-bills/), opened 2026-09-30.* So a
limited card cannot cap spending without risking the store, and a backup payment method is the
defence against a card that expires or is replaced.

**A team's limits rise by themselves.** "As you build payment history over time with successful,
non-zero invoices, your tier and limits can increase automatically." No way to lower them was found.
Tier 1 allows 3 Droplets of up to $48; tier 2 allows 10, of up to $56 with shared CPUs or $84 with
dedicated ones, and 4 database clusters. *Sourced —
[paying bills](https://docs.digitalocean.com/platform/billing/pay-bills/) and
[resource limits](https://docs.digitalocean.com/platform/resource-limits/), opened 2026-09-30.* A team
the maintainer created on 2026-09-30 showed tier 1 and then tier 2 the same day, with 4 database
clusters. *Measured — read in the control panel by the maintainer, 2026-09-30.* The largest single database node listed
is "$975.24" a month. *Sourced —
[database pricing](https://www.digitalocean.com/pricing/managed-databases), opened 2026-09-30.* So a
token that can create databases is worth thousands of dollars a month to whoever holds it.

**A token's scopes are per product and per action, never per resource.** The Droplet scopes are
`droplet:read`, `droplet:create`, `droplet:update`, `droplet:delete` and `droplet:admin`, and the
aliases `api:read` and `api:write` "automatically expand to include new API endpoints". Nothing limits
a token to a project or a tag. *Sourced — [scopes](https://docs.digitalocean.com/reference/api/scopes/),
opened 2026-09-30.* Droplets have no deletion protection; a request for it has been open on
DigitalOcean's ideas board since 2021, per an agent's reading on 2026-09-30. So any token that can
delete a Droplet can delete the production one.

**Teams are billed separately.** "Each team has separate billing and its own payment information
unless it belongs to an organization." *Agent's reading of
[teams](https://docs.digitalocean.com/platform/teams/), 2026-09-30, not opened.* Creating a second
team can need a request to support. *Measured — a message the maintainer saw in the control panel,
2026-09-30.* Team settings, Secure Sign-In among them, can be changed only in the control panel: "The
DigitalOcean API and CLI client, doctl, do not support teams." *From a search summary of
[require secure sign-in](https://docs.digitalocean.com/platform/teams/how-to/require-secure-sign-in/),
2026-09-30; not opened at the page.*

**Secure Sign-In does not check a GitHub or Google sign-in for 2FA.** "DigitalOcean does not detect
or enforce 2FA for these sign-in methods." *From a search summary of
[require secure sign-in](https://docs.digitalocean.com/platform/teams/how-to/require-secure-sign-in/),
2026-09-30; not opened at the page.* So the account is as hard to take over as the GitHub account.
Losing GitHub means DigitalOcean's recovery, which asks for "a photo of your government-issued ID"
and states no turnaround. *Sourced —
[lost GitHub access](https://docs.digitalocean.com/support/i-lost-access-to-the-github-account-i-use-to-sign-into-digitalocean/),
opened 2026-09-30.* And "GitHub Support will not be able to restore access to accounts with
two-factor authentication enabled if you lose your two-factor authentication credentials." *Sourced —
[recovering 2FA](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/recovering-your-account-if-you-lose-your-2fa-credentials),
opened 2026-09-30.*

## Hosting — the domain's DNS is Cloudflare's while Cloudflare is its registrar

**The app's domain was bought through Cloudflare Registrar, which requires Cloudflare's nameservers.**
So its DNS is answered by Cloudflare for as long as it is registered there. What stays open is how
each record is served, which is
[how does the domain reach the deployment?](questions/how-does-the-domain-reach-the-deployment.md).

- "all domains on Cloudflare Registrar use Cloudflare nameservers", and those nameservers "must
  remain in place for the domain to be Active." *Sourced —
  [Registrar FAQ](https://developers.cloudflare.com/registrar/faq/), opened 2026-10-02.*
- A record set to DNS-only puts nothing of Cloudflare's in the path: "Cloudflare responds with your
  server's actual IP address and does not route HTTP/HTTPS traffic through its network." A proxied
  record does the opposite, so the choice between them decides whether anything sits between the
  browser and the Droplet. *Sourced —
  [proxy status](https://developers.cloudflare.com/dns/proxy-status/), opened 2026-10-02.*
- The domain was bought through Cloudflare by the maintainer, who said so on 2026-10-02. Which
  domain it is is not recorded here.

## Hosting — Let's Encrypt certificates are getting shorter

**Let's Encrypt's default certificates go from 90 days to 64 on 2027-02-10 and to 45 on
2028-02-16.** So a certificate renews about eight times a year from 2028, and whatever renews it runs
that often unattended. Let's Encrypt recommends ACME Renewal Information so that clients renew when
it asks rather than at a fixed point.

- "Let's Encrypt will switch our default classic ACME profile to issuing 64-day certificates" on
  February 10, 2027, and "We will further update the classic profile to issue 45-day certificates
  with a 7 hour authorization reuse period" on February 16, 2028. "To ensure your ACME client renews
  on time, we recommend using ACME Renewal Information (ARI)." *Sourced —
  [From 90 to 45](https://letsencrypt.org/2025/12/02/from-90-to-45/), opened 2026-10-03.*
- It issues certificates for bare IP addresses since 2026-01-15, "valid for 160 hours, just over six
  days", and "IP address certificates must be short-lived certificates." *Sourced —
  [general availability](https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability/),
  opened 2026-10-02.*

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
both of which wait for players.

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
decision for this reason, and it is the one part whose absence fails silently. Reported as
[fastify/fastify#7043](https://github.com/fastify/fastify/issues/7043), so this entry may stop being
true.

## Dependencies — a connection going idle mid-shutdown is never reaped

**Node's `server.close()` collects connections that are already idle when it is called, and nothing
collects one that falls idle afterwards.** A keep-alive client whose request is still in flight when
shutdown begins therefore holds the close open until `keepAliveTimeout` expires. Measured with the
request finishing 1,100ms into a shutdown: bare `node:http` closed after 7,110ms against its 5,000ms
default, and Fastify after 74,111ms against the 72,000ms it sets. Neither `forceCloseConnections`
value helps — `'idle'` produced 74,113ms because the branch implementing it is unreachable without a
user-supplied `serverFactory`, and `true` returned in 4ms by destroying the in-flight request rather
than draining it.

*Measured — Node v26.7.0, `fastify` 5.12.5, macOS Darwin 25.6.0, Apple M2, 2026-09-22. The
unreachable branch is at `fastify.js:392` of the v5.12.5 tag, and the default that cannot reach it at
`lib/server.js:136`; both carry `istanbul ignore` comments. Reported as
[fastify/fastify#7044](https://github.com/fastify/fastify/issues/7044).*

**So a graceful shutdown has to reap repeatedly rather than once, and a deploy that does not is
slow rather than broken — which is the worse failure here.** Calling `closeIdleConnections()` on an
interval while the close is in progress drains in roughly 1,100ms with the handler completing and
the client receiving its response. Without it the process lingers for over a minute holding the
store open, which is long enough for a deploy to run two processes against one file — the situation
[ADR-0021](decisions/0021-the-server-and-its-store-share-a-machine.md) and
[how does a deploy avoid disturbing the store?](questions/how-does-a-deploy-avoid-disturbing-the-store.md)
are both about. The remedy is part of
[ADR-0035](decisions/0035-the-http-handler-is-fastify.md)'s decision rather than an operational
detail, because it is not visible in any single route.

## Dependencies — React can run a handler against state from its last render

**React defers rendering for continuous events such as `pointerenter`, so a second event can reach a
handler before the first one's update has rendered.** A handler that computes the next state from
the value it closed over then overwrites the earlier update, and in a drag-select a cell drops out
of the selection. An updater function computes from the latest queued state instead.

*Measured — a fast drag across a 30 by 30 board in Playwright's WebKit against a React 19.3.0 build,
2026-09-24: cells dropped with a closure, none with an updater function. Recorded in the renderer
question, read with `git show b931fb7:docs/questions/what-renders-the-client.md`.*

> So state a view changes during continuous input is set with updater functions, and durable state
> never lives in React at all, per
> [ADR-0037](decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md).

---

## Dependencies — React Compiler's Babel preset and Workbox need different Babel majors

**Enabling React Compiler through `@vitejs/plugin-react`'s Babel preset brings `@babel/core` 8, and
`vite-plugin-pwa`'s Workbox build needs Babel 7.** With both installed, the build fails until a
package-manager override keeps Workbox on its own Babel.

*Measured — a spike build with `@vitejs/plugin-react` 6.1.1, `babel-plugin-react-compiler` 1.0.0 and
`vite-plugin-pwa` 1.3.0 under npm, 2026-09-24, fixed by an `overrides` entry nesting
`@rollup/plugin-babel` under `workbox-build`. Recorded in the renderer question, read with `git show b931fb7:docs/questions/what-renders-the-client.md`.*

> So adopting React Compiler and a service worker together costs an override until the two agree.
> Whether to adopt the compiler at all is not decided.

*Unlike most of this file, a claim about a tool can be overtaken by a release shipping the same
week. Rebuild with both before relying on it.*

---

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

## Servers — a static file server's validator and defaults decide what a returning visit gets

**Caddy's ETag for a file is its modification time and size, so it changes when a file is copied and
can stay the same when its content changed.** `calculateEtag` builds
`"<mtime.UnixNano() base 36>-<size base 36>"`. A spike on 2026-10-04 got different ETags for two
byte-identical copies, and a revalidation against the other copy returned 200.

> So copying a release costs a full response where a 304 would do, and giving every release one fixed
> modification time is unsafe: an `index.html` differing only in a same-length hashed asset name
> keeps the old ETag and earns a false 304. Which validator to use is
> [what gives the client's files a validator that changes only with their content?](questions/what-gives-the-clients-files-a-validator-that-changes-only-with-their-content.md).

*Sourced: `modules/caddyhttp/fileserver/staticfiles.go` at v2.11.7, opened 2026-10-04; the copies
measured the same day. The false 304 is reasoned, not observed.*

**Caddy's `header` directive also reaches the 404 its file server returns.** A rule giving
`/assets/*` an immutable header put it on a 404 for a missing asset, which a browser may then keep
for a year. Matching on the file's presence avoids it.

*Measured — Caddy 2.11.7 on macOS, 2026-10-04, one run.*

**`@fastify/static` serves dotfiles unless told not to.** Its `index.js` sets
`opts.dotfiles ??= 'allow'`.

*Sourced: `index.js` of `@fastify/static` 10.1.5, opened 2026-10-04.*

**Cloudflare's Workers static assets apply `_headers` rules to the single-page fallback by the
requested path, and upload dotfiles unless they are listed.** The asset worker's `handleRequest` ends
with `attachCustomHeaders(request, response, configuration, env)`, and the default ignore list holds
only `/.assetsignore`, `/_redirects` and `/_headers`.

> So with an immutable rule on `/assets/*`, a missing asset is answered with the entry document, a
> 200 and a year-long cache header.

*Sourced: `cloudflare/workers-sdk` main, `packages/workers-shared/asset-worker/src/handler.ts` and
`packages/workers-shared/utils/helpers.ts`, opened 2026-10-04. That the matcher uses the requested
path is a research agent's reading of `utils/rules-engine.ts`, not re-opened.*

*Unlike the rest of this file, a claim about a tool can be overtaken by a release shipping the same
week. Re-open the files named above before building on it.*

## Toolchain — Vite's dev server answers any path it does not proxy with the entry document

**With the default `appType: 'spa'`, Vite's dev server answers a path that matches no file and no
proxy key with the entry document and a 200, and its proxy runs before that fallback.** With a proxy
key of `/api/` and nothing listening behind it, `/`, `/nope`, `/hello` and `/apidocs` each returned
`200 text/html`, and `/api/nope` returned `502` from the proxy.

> So an API call the proxy does not cover gets HTML with a 200 in `pnpm dev`, and the client sees a
> parse error rather than a 404. A key of `/api/` does not take `/apidocs`.

*Measured — Vite 8.3.1, one `curl` per path on macOS, 2026-09-26.*

---

## Databases — SQLite is not safe on a network filesystem

**SQLite's maintainers advise against it, and the failure is corruption rather than an error.** From
the locking documentation: "POSIX advisory locking is known to be buggy or even unimplemented on many
NFS implementations (including recent versions of Mac OS X) and that there are reports of locking
problems for network filesystems under Windows. Your best defense is to not use SQLite for files on a
network filesystem."

*Sourced — [sqlite.org/lockingv3.html](https://www.sqlite.org/lockingv3.html), read 2026-09-03.*

**So an embedded store and a network filesystem do not combine.** This rules out Cloud Run's Cloud
Storage FUSE and NFS mounts and AWS Lambda with EFS as homes for one, whatever else they offer, and it
is why [ADR-0021](decisions/0021-the-server-and-its-store-share-a-machine.md) puts the process and the
file on the same machine rather than treating co-location as an implementation detail. A network
block device is a different thing: the machine it is attached to mounts and locks its filesystem
itself, and SQLite's documentation does not mention block devices at all (checked 2026-09-28).

## Databases — SQLite commits wait on a sync

**In WAL mode with full durability, every commit waits for one sync of the WAL file.** "Writers sync
the WAL on every transaction commit if PRAGMA synchronous is set to FULL but omit this sync if PRAGMA
synchronous is set to NORMAL." With NORMAL, "transactions are no longer durable and might rollback
following a power failure or hard reset". In rollback-journal mode at FULL, a commit syncs three
times.

**Reads never sync.** A page already in the operating system's cache is read without touching the
disk.

*Sourced — [wal.html](https://www.sqlite.org/wal.html) read 2026-09-28;
[atomiccommit.html](https://www.sqlite.org/atomiccommit.html) and
[pragma.html](https://www.sqlite.org/pragma.html#pragma_synchronous) read by a research agent the
same day.*

> So whatever a sync costs on the store's disk is paid on every durable commit, and on no read. A disk
> reached over a network adds that network's round trip to every commit. Which synchronous setting the
> store runs with is [what durability settings does the store run with?](questions/what-durability-settings-does-the-store-run-with.md).

*Reasoned — from the two facts above.*

## Law and licensing

**AGPL-3.0's network-use clause generally requires releasing a hosted service's complete source
to any user of that service.**

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
