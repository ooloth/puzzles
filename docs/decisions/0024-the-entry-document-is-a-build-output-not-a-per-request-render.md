---
number: 0024
status: accepted
date: 2026-09-03
---

# 0024 — The entry document is a build output, not a per-request render

## Forced by

**[ADR-0023](0023-a-service-worker-answers-every-navigation-after-the-first.md) puts a document on the
device for every navigation after the first.** That document has to be produced by the build and
carried in the precache, because a precache entry is a URL plus a revision fixed when the bundle is
built. So a document produced at build time exists either way, and per-request rendering is a second
document added beside it rather than an alternative to it.

**[ADR-0004](0004-the-client-holds-and-mutates-puzzle-state.md) puts the board's authority on the
client**, so the content that decides what a player sees is not knowable by a server rendering the
document.

**The portable decision-making standard holds that a decision the next milestone does not need is not
made.** M1 needs a document. It does not need a second one.

**[../problem.md](../problem.md) ranks present need over future-proofing, and clarity over cleverness
because one person maintains this.**

## Decision

**The document a browser receives when someone opens the app is produced when the application is
built, not rendered per request.**

**This constrains document production and nothing else.** A framework does three separable jobs —
build the client bundle, produce the entry document, answer HTTP requests. This record binds only the
second. It does not decide who builds the bundle
([what builds the client and serves it in development?](../questions/what-builds-the-client-and-serves-it-in-development.md))
and it does not decide what answers HTTP
([what handles HTTP requests on the server?](../questions/what-handles-http-requests-on-the-server.md)).

**So the meta-frameworks are not excluded, and the option lists that already assumed they were should
be corrected rather than trusted.** Prerendering the entry document while serving API routes from the
same process is a real configuration — SvelteKit's `adapter-node` with `prerender` on the root layout,
Astro's Node adapter with `output: 'static'`, TanStack Start's `prerender` with server functions. What
this record removes is the argument that would have *forced* one, not the option of choosing one. Next
is the exception worth knowing, because its `output: 'export'` drops route handlers that read the
request, so with Next specifically a prerendered document means a separate API server.

**The option preserved is per-route rendering, added later.** Astro's server islands and Next's partial
prerendering are additive to a prerendered page, and
[does any page need markup a crawler can read?](../questions/does-any-page-need-markup-a-crawler-can-read.md)
at M8 is where that gets asked. Nothing here forecloses it.

## Rejected

- **Render the entry document per request, hydrating to a client application.** The case for it is
  real and no record had made it: it paints the grid one round trip sooner, and it can carry the day's
  puzzle in the same response, which matters because
  [ADR-0012](0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) means a first visit has to
  fetch a puzzle regardless. Per [../constraints.md](../constraints.md) a round trip is around 270ms at
  the 3g floor and 1400–2000ms at the 2g tier, on the network [../problem.md](../problem.md) names as
  the modal case.

  **This option is not disqualified, and saying otherwise would be dishonest.** No single reason
  defeats it. Two weaken it — a static document can start the puzzle fetch from an inline script and
  preload the bundle in parallel, collapsing most of the gap; and the documented fix for the
  hydration flash is an inline script that reads storage before paint, which cannot read IndexedDB
  because IndexedDB is asynchronous. The second is conditional on
  [which client storage mechanism holds a player's work?](../questions/which-client-storage-mechanism.md)
  and so cannot disqualify anything today.

  **It was not chosen because it is not needed.** Given
  [ADR-0023](0023-a-service-worker-answers-every-navigation-after-the-first.md) the build-time
  document exists anyway, so this buys one round trip, at most twice per player, in exchange for a second document and
  a second code path maintained for the life of the product. Nothing in M1 needs that trade, and
  everything learned before it has to be made is information it would otherwise be made without.
  **Reverses if** a measurement shows the first-visit round trip is worth a second document — which
  becomes cheap to run once a renderer and a real puzzle exist, and is not runnable now.

- **Defer it, as [../questions/README.md](../questions/README.md) originally filed it at slice 2.**
  Genuinely cheap, and the right answer for most questions at this stage. Rejected because the option
  lists in [what runs TypeScript outside the browser?](../questions/what-runs-typescript-outside-the-browser.md),
  [what handles HTTP requests on the server?](../questions/what-handles-http-requests-on-the-server.md)
  and [what renders the client?](../questions/what-renders-the-client.md) already exclude the
  meta-framework class without argument, and a meta-framework rendering per request would settle all
  three by consequence. Deferring keeps that exclusion as an unrecorded inference underneath three
  decisions M1 has to take. **Reverses if** those three questions are settled some other way that
  makes the exclusion explicit.

- **Multi-page hypermedia, where every document is produced per request.** htmx, Turbo, Datastar.
  Listed because it is a coherent architecture somebody would raise and its absence from a list is
  indistinguishable from its rejection. Disqualified by
  [ADR-0004](0004-the-client-holds-and-mutates-puzzle-state.md), which puts the board's authority on
  the client — under hypermedia every interaction is a round trip, which
  [input registers without waiting for the network](../guarantees/input-registers-without-waiting-for-the-network.md)
  forbids. **Reverses if**
  [ADR-0004](0004-the-client-holds-and-mutates-puzzle-state.md) is reversed, which would reverse most
  of this folder.

## Risk

**The first visit paints later than it could, and nobody has measured by how much.** The bound is one
round trip, at most twice per player, on the worst network. Worse, no measurement exists to appeal to:
every published comparison of server against client rendering measures a server that has the content,
and for a shell the client must populate from its own storage no study was found. The number this
record trades away is one nobody has established.

**A round trip at the 2g tier is 1.4–2 seconds**, which is not a rounding error on the one moment that
happens to every player and, per [../problem.md](../problem.md), happens again at the installed app's
first launch. This is the cost being knowingly accepted, and it is larger than "static is simpler"
would suggest.

**Familiarity points the other way and is being recorded as a cost, not a reason.** The maintainer's
strength is React with Vite and React with Next. This record does not choose a framework, but it does
mean that if Next is later chosen as the builder, its static export mode drops route handlers and a
separate API server is needed — work the alternative would not have required.

## Revisit when

- **A measurement shows the first-visit round trip matters**, run once a renderer and a real puzzle
  exist. That is the specific disconfirming evidence this record is betting against.
- **Something at the game's own URL needs markup a non-JavaScript client can read.** Link-preview
  crawlers do not run JavaScript, and if a shared board or puzzle URL has to preview correctly, that is
  a per-route need this record permits solving additively — but it is the condition worth watching.
- **[ADR-0023](0023-a-service-worker-answers-every-navigation-after-the-first.md) is reversed**, which
  removes the premise that a build-time document exists anyway and returns this to a genuine
  comparison.

## Also update

- [x] `questions/README.md` — `is-the-entry-document-produced-per-request` is resolved and retired
      from M1 slice 2, and slice 1's entry now says what field it has rather than assuming a narrower
      one
- [x] `questions/what-handles-http-requests-on-the-server.md` — its option list omitted a framework
      that serves API routes alongside a prerendered document, which this record establishes is
      available
- [x] `architecture.md` — the entry document is named as a build output in the browser box
- [x] `constraints.md` — the round-trip figures cited here were already recorded; nothing new imported
- [x] Nothing in `guarantees/` — this promises a player nothing beyond what
      [ADR-0023](0023-a-service-worker-answers-every-navigation-after-the-first.md) already serves

Deliberately not decided here: what renders the client, what builds it, what serves its files in
production, what handles HTTP requests, and whether any route other than the game is ever rendered per
request.
