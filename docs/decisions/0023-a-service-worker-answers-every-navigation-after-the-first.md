---
number: 0023
status: accepted
amended: 2026-09-04
date: 2026-09-03
---

# 0023 — A service worker answers every navigation after the first

## Forced by

**[The app never opens to a blank screen after the first visit](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md)
is a promise already made**, and it holds with no network. A navigation that reaches the network while
offline has nothing to reach, so keeping the promise means something on the device answers instead.

**[../constraints.md](../constraints.md) records that the HTTP cache sits outside the Storage
Standard**, so no API places a document in it, tests whether one is there, or reports an eviction.

**[../constraints.md](../constraints.md) records that a cache may serve a stale response while
disconnected and is not required to**, and that entries evict independently of one another.

**[ADR-0003](0003-this-is-delivered-over-the-web.md) chose web delivery**, which is what puts all of
the above in scope rather than a native runtime's own storage.

## Decision

**After the first visit, a service worker answers the navigation from a document held on the device.
Not the network, and not the browser's HTTP cache.**

**One thing disqualifies the HTTP cache, and it is not that it fails to work.** It demonstrably serves
a fresh document offline. It is that nothing a page can execute puts a document there, checks that one
is there, or notices when one leaves — so no code can establish that this promise holds, and no check
can verify it afterwards. A promise whose mechanism cannot be inspected is asserted rather than kept.
The eviction and staleness facts above compound that; they are not what decides it.

**The first visit is outside this record**, necessarily. A device that has never reached the app has
no worker registered and nothing cached, so that navigation goes to the network. Per
[../constraints.md](../constraints.md) a home-screen install starts with an empty store, so an
installed app's own first launch is a first visit again — this happens up to twice per player rather
than once. The guarantee already carries both caveats.

Deliberately not decided here: what else is held on the device besides the document, how much of the
app works offline, which toolchain generates the precache manifest, and what caching strategy anything
other than the navigation uses. Those are
[how does the app itself stay available offline?](../questions/how-does-the-app-itself-stay-available-offline.md)
and [what can a player do with no network?](../questions/what-can-a-player-do-with-no-network.md) at
M9. What this record settles is only what answers a navigation, because
[ADR-0024](0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) rests on it and
would otherwise be argued from an inference.

## Rejected

- **The browser's HTTP cache, with a long `max-age` on the document.** The strongest alternative and
  the one most people would reach for: no service worker to register, no manifest to generate, no code
  to get wrong, and it genuinely does serve a fresh document to an offline navigation. Rejected for the
  single reason in the Decision above — it cannot be populated, inspected or verified from the page, so
  it cannot carry a promise. **Reverses if** a specification gives pages a way to place a navigable
  document in the HTTP cache and test for its presence.

- **Leave the whole mechanism to M9 with the rest of the offline story.** The honest "not yet", and
  correct for everything this record deliberately excludes. Rejected only for the narrow claim above,
  because [ADR-0024](0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) is needed
  at M1 and depends on it. Deferring would leave that record resting on an unrecorded assumption about
  what answers a navigation, which is the failure the portable decision-making standard names first.
  **Reverses if**
  [ADR-0024](0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) is superseded and
  nothing else needs this premise early.

  **This is a claim about timing, not about grounds, and the difference matters because the pair can
  read as circular.** What makes the service worker the mechanism is the promise plus the HTTP cache
  facts in [../constraints.md](../constraints.md), and neither mentions
  [ADR-0024](0024-the-entry-document-is-a-build-output-not-a-per-request-render.md). So this record
  stands whether or not that one does. What that record supplies is only the reason this was worth
  settling now rather than at M9 — remove it and the decision is unchanged, while the schedule is not.

- **Make no offline promise for the document.** Reversing
  [the guarantee](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md) rather
  than choosing a mechanism for it, and a real option — the promise is currently enforced by nothing.
  Rejected because [../problem.md](../problem.md) names the interrupted commute as the normal case
  rather than an edge case, and a blank screen there is the failure the promise exists to rule out.
  **Reverses if** that promise is withdrawn.

## Risk

**The promise has a boundary nobody has written down, and this record is what makes it visible.**
[../constraints.md](../constraints.md) records that Safari's tracking-prevention deletion removes
`ServiceWorkerRegistrations` after 30 idle days. The mechanism chosen here is one of the things
deleted, so after that window the app opens to whatever the network gives it — which offline is a
blank screen. The guarantee currently states no such limit, and the guarantees README requires that a
promise is enforced or its limits are written into it.

**A service worker is code that fails quietly and in the wrong direction.** A broken one does not
crash the page; it serves an old application indefinitely to people who have no way to ask for a new
one, and the maintainer has no signal that it is happening. That is a worse failure than the blank
screen this record is preventing, and nothing here mitigates it. It belongs with
[how do we know the deployed app is serving?](../questions/how-do-we-know-the-deployed-app-is-serving.md)
at M11, which already names a static client loading from cache hiding a dead API.

**Nothing enforces any of this yet**, and will not until there is an application. This record fixes
what the mechanism is, not that it exists.

## Revisit when

- **A page gains a way to place a navigable document in browser-guaranteed storage and test for it.**
  That is the one capability whose absence decides this, so its arrival reopens the question rather
  than merely improving the alternative.
- **The offline promise is withdrawn or narrowed** so that a navigation no longer has to be answered
  without the network.
- **Safari's tracking-prevention deletion starts or stops covering service worker registrations.**
  The first would remove the mechanism entirely; the second would remove the boundary in Risk above.

## Also update

- [x] `guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md` — the 30-day Safari
      boundary is written into the promise, per the folder's own rule that limits are stated rather
      than discovered
- [x] `questions/README.md` — the M9 mechanism question is narrowed to what it still decides, and the
      question this record resolves is retired
- [x] `architecture.md` — a service worker now sits in the browser box, between a navigation and the
      network
- [x] `constraints.md` — the HTTP cache facts this record cites were added before it was written, not
      restated inside it
- [x] Nothing new in `guarantees/` — this chooses a mechanism for a promise already made and makes no
      further commitment to a player
