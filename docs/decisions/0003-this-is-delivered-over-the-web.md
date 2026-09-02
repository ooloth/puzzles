---
number: 0003
status: accepted
date: 2026-08-31
amended: 2026-09-01
---

# 0003 — This is delivered over the web

## Forced by

Three statements in [../problem.md](../problem.md), in order of weight.

**Phone-first, with secondary desktop use at a different time by the same person.** This is the
statement that decides it. One codebase serves both form factors on the web. No native path does:
the two-application answer means three clients once desktop is counted, and the cross-platform
answer that best preserves the maintainer's existing skill has the weakest desktop story of the
set. Every native option therefore ends with a web build existing anyway, at which point the
question is whether to also carry the native one.

**A small, genuinely public v1 within a few months, found by a few people rather than marketed, by
an audience with no assumed technical sophistication.** A link works. The native path puts three
gates on that timeline which are not engineering work and cannot be worked around by being good at
engineering — see Rejected.

**Clarity over cleverness, because one person maintains this**, and **present need over
future-proofing** ([../problem.md](../problem.md), "What wins when things conflict", items 4 and
5). A second deployable target is a permanent multiplier on every future change, paid by one
person.

The third maintainer purpose — a demonstrable internet-facing full-stack system — is a legitimate
input and is stated here as one rather than smuggled in. It points the same way, but it is not
load-bearing: the first statement above decides this on its own, and `../problem.md`'s own guard
question ("would this be worth building if its demonstration value were zero?") means it should not
be asked to carry weight it does not need to carry.

## Decision

The client is delivered over the web: a URL, a browser, one codebase serving phone and desktop.

This decides the delivery platform and nothing else. What renders the client, what holds a
player's work, whether a server exists, and how the app stays available offline are each their own
question, and this record deliberately does not answer them.

## Rejected

- **One native codebase across iOS and Android (React Native + Expo).** The strongest rejected
  option, and it deserves the space. It costs the least of any native path — TypeScript is the
  actual language, and the feature set this app needs is reachable through Expo modules with no
  native code written. It renders real platform views, so it inherits Apple's and Google's design
  changes instead of chasing them.

  **The disqualifying reason is that it does not remove the web build.**
  [../problem.md](../problem.md) requires desktop as well as phone, and this option has no desktop
  target — so satisfying that statement means shipping a web client anyway, and the native codebase
  becomes an addition to it rather than a replacement for it. That is a second deployable for one
  maintainer, against `../problem.md`'s ranking of clarity over cleverness. This reason stands on
  its own and is the one to argue with.

  *A second reason was recorded and is not evidence. It held that three store gates sit on the
  critical path to a public v1 — Apple Developer Program enrolment delays, Google Play's closed-test
  requirement for newer personal accounts, and App Store guideline 4.3(b) rejections of
  saturated-category puzzle games. The direction is plausible and every specific was unsourced, so
  none of it is in [../constraints.md](../constraints.md) and none of it should be cited. If this
  record is ever reopened, that is what needs establishing first.*

  *Flutter and Kotlin Multiplatform were considered within this option and lose to it on the same
  desktop reasoning. Claims recorded about Flutter's iOS design-language work and its canvas web
  target were also unsourced and are not repeated here.*

- **Two native codebases, Swift and Kotlin.** The only path to the platform's actual ceiling, and
  this app is small enough that reaching a v1 on both is plausible. Rejected because the cost is
  not the learning, it is the permanent doubling of every subsequent change for a solo maintainer
  with no team — and because it fails `../problem.md`'s desktop requirement outright, making it a
  three-client commitment on day one.

- **Both a web client and native clients.** It is the only option that pays both sets of costs, and
  for one maintainer it is the least defensible of the three — against
  [../problem.md](../problem.md)'s "clarity over cleverness" and "present need over
  future-proofing". Nothing about the current stage requires it.

## Risk

**Haptic feedback is impossible on iOS from the web, and this is a real cost against the thing
`../problem.md` ranks first.** Apple shipped the Vibration API and then deliberately removed it in
2017; the live request to restore even a permission-gated version is unassigned with no milestone.
An installed web app makes no difference — it is the same engine. A tap every one to three seconds
is this app's entire interaction, and a tactile response to entering a digit is a large part of
what makes that kind of interface feel considered. **We are knowingly shipping a v1 without it on
iOS.** This is the single largest thing given up here, it is not recoverable by more effort inside
the web platform, and it should not be quietly reframed later as unimportant.

**Web content is capped at sixty frames per second on iOS.** The WebKit bugs tracking this have
been open since 2017 and June 2025 respectively, and there is no public API to opt in. This is the
one loss a native shell does not buy back, because `WKWebView` is capped too. It is judged
acceptable because this app's animation is modest and its interaction is tap-driven rather than
drag- or physics-driven, where the difference would be visible.

**VoiceOver support for ARIA grids is actively broken in ways that bear on exactly this widget.**
Open WebKit bugs cover `aria-selected` not being announced on `role=gridcell`, column headers not
being announced during cell navigation, and row headers in `aria-owns` grids. A native grid view
uses first-party accessibility APIs and avoids the bug class structurally. This was weighed and
judged not decisive; [is screen reader support in scope for v1?](../questions/is-screen-reader-support-in-scope-for-v1.md) remains open and inherits this as a finding.

**[../constraints.md](../constraints.md)'s browser sections are the cost of this decision.**
Roughly two thirds of that file — eviction clocks, the `persist()` membership test, the
first-party-cookie topology trap, fabricated quota figures, absent background execution — exists
because of this record and would not exist under any of the rejected options.

**The failure mode worth naming is motivational rather than technical.**
[ADR-0002](0002-launch-with-sudoku-then-star-battle.md) identifies the maintainer losing interest
as the top project risk, and `../problem.md` ranks the solving experience first. The way this
decision goes wrong is not that the web turns out to be technically incapable — it is that the
platform pathology above consumes the interface budget, and the interesting work never starts.

**Deferring native is only safe while it stays cheap to add**, and that cost is worth accepting
knowingly so that "web" is a reversible decision rather than an optimistic one. Wrapping
this web client in a native shell (Capacitor is the healthiest of these, actively released through
2026) recovers haptics, background execution, push, and store presence, while keeping one
TypeScript codebase and the URL. It does not recover 120Hz. Its cost is a few weeks of work plus
the store gates described above, and it carries guideline 4.2 risk that an offline-first game with
bundled assets and local state is well shaped to survive. **Wrapping does not by itself escape the
storage eviction in `../constraints.md`**, though it is widely described as though it does: WebKit
states that tracking prevention is enabled by default in all `WKWebView` applications, and
Capacitor's own documentation warns that mobile operating systems may clear `localStorage`. The
wrap recovers durability only when storage is routed through a native plugin rather than the
webview's own store — which is what makes the storage boundary the thing to protect, not the
wrapper the thing to plan. What keeps that boundary cheap to hold is
[which client storage mechanism holds a player's work?](../questions/which-client-storage-mechanism.md)
and, for the server side of the same recovery path,
[what crosses the client/server boundary?](../questions/what-crosses-the-client-server-boundary.md).
Two more conditions keep this recovery path cheap and neither is decided by this record: a rules
engine that stays a pure module — no DOM, no framework import, no ambient randomness — which is
free here and already required by
[ADR-0005](0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) for unrelated
reasons; and serializable state carrying an explicit schema version, not yet decided anywhere,
which belongs with
[is puzzle state a snapshot or an event log?](../questions/is-puzzle-state-a-snapshot-or-an-event-log.md).

## Revisit when

- **Platform pathology is measurably consuming the interface budget** — service worker behaviour,
  eviction recovery, install prompting and storage failure handling crowding out work on the
  solving experience. This is the trigger that matters, and it is the same risk ADR-0001 already
  names.
- **Tactile feedback becomes load-bearing** for the experience being aimed at, rather than a thing
  that would be nice. The shell above is the response, not a rewrite.
- **WebKit ships unrestricted-refresh-rate web content, or restores a vibration API.** Either would
  retire one of the two accepted risks above; both would retire the case for a shell almost
  entirely.

## Also update

- [x] `constraints.md` — the browser sections are scoped to this decision; haptics and the
      refresh-rate cap added as facts
- [x] `guarantees/` — no promise changes. `durability.md` and `compatibility.md` are written in
      browser vocabulary, which this record makes legitimate rather than presumptuous
- [x] `questions/README.md` — this entry removed from the order, the remainder renumbered

Deliberately not decided here: what renders the client, which storage mechanism holds a player's
work, whether a server exists, how the app stays available offline, and whether install is ever
encouraged. Each is its own question, and each sits below this one in
[../questions/README.md](../questions/README.md).
