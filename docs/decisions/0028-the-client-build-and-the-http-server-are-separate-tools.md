---
number: 0028
status: accepted
date: 2026-09-19
---

# 28 — the client build and the HTTP server are separate tools

## Forced by

[ADR-0023](0023-a-service-worker-answers-every-navigation-after-the-first.md) puts a service worker
on every navigation after the first, and
[the app never opens to a blank screen after the first visit](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md)
is the promise resting on it. [../constraints.md](../constraints.md) records that cache entries evict
independently of one another, so a surviving document can reference an evicted bundle. Installing the
document and its assets together needs a manifest naming all of them with a revision each, and that
is a build output or it does not exist.

[../problem.md](../problem.md) rules out designing for scale now and rules out, separately, a
decision that makes growing into it expensive. Nothing in it or in any record requires the renderer
or the runtime to be closed, and each is its own open question.

[ADR-0024](0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) does not force this.
It states plainly that it excludes neither shape.

## Decision

**No single tool owns both the client build and the HTTP request path.** A bundler builds the client
and emits the entry document; a separately chosen server answers HTTP. Each is replaced on its own.

This preserves two options deliberately. The renderer stays an open choice, which a bundled framework
would close. So does the runtime, which
[ADR-0030](0030-typescript-outside-the-browser-runs-on-node.md) went on to decide on its own merits.

## Enforced by

Nothing in code. It is satisfied by
[ADR-0029](0029-the-client-bundler-is-vite.md) naming a bundler that is not also a server, and by the
runtime and HTTP-handler records being written as separate decisions rather than as consequences of
this one. Where a later record settles both halves at once, this one has been reversed rather than
applied.

## Rejected

Each entry names the one reason that disqualifies it alone. The first three fail the manifest
requirement above; the last three do not, and fail for their own reasons.

- **TanStack Start** — its production build does not run the precache integration at all, so no
  manifest is produced. TanStack/router#4988 is open and labelled `needs-upstream-fix`.
  **Reverses if** that issue closes with a working integration, or if a hand-written `injectManifest`
  step against the build output is accepted as the answer.
- **React Router in SPA mode** — it writes the entry document after the integration has collected the
  file list, so the document cannot enter the precache manifest. remix-run/react-router#14268 was
  closed and redirected to vite-pwa/vite-plugin-pwa#809, open since 2024-12-27.
  **Reverses if** #809 ships.
- **Qwik City** — its integration has not published since April 2024 and vite-pwa#884 is open, so
  there is no maintained path to a manifest. **Reverses if** an integration ships.
- **SvelteKit** — the precache logic is written by hand from three lists that carry no revision per
  file, and SvelteKit's own documented example omits the prerendered pathnames, which is where the
  entry document lives. A manifest missing the document is the blank screen
  [../constraints.md](../constraints.md) describes, and it is invisible until an asset evicts.
  **Reverses if** SvelteKit emits a revisioned manifest that includes the prerendered document.
- **Nuxt** — it closes the renderer to Vue, and nothing requires that to be closed.
  **Reverses if** [what renders the client?](../questions/what-renders-the-client.md) independently
  chooses Vue, at which point this rejection has no grounds left and this record is reopened rather
  than cited. That record checks this condition before assuming this one still holds.
- **Astro** — its own documentation states it is "the web framework for building content-driven
  websites like blogs, marketing, and e-commerce", and names this application's shape as what other
  frameworks exist for: "logged-in admin dashboards, inboxes, social networks, todo lists". A single
  interactive surface reaches it through `client:only`, which "skips HTML server rendering", so the
  framework delivers none of what it is for. **Reverses if** this product grows enough static,
  indexable content that the content half becomes the larger problem.
- **Not yet** — because slices 1 and 2 of M1 both rest on it, and building either against an
  unchosen shape means discarding whichever half turns out to belong to the other tool.

## Risk

**Three configurations instead of one, for one maintainer.** [../problem.md](../problem.md) ranks
clarity over cleverness precisely because one person maintains this, and a bundler, a server and a
dev-server proxy are three surfaces where one would have done. The bet is that they are three small
surfaces and that each can be replaced without the others, which a bundled framework does not offer.

**The dev server does not proxy the API for free.** A meta-framework gives one process serving both
halves; here that is configured.

**The three manifest rejections are a snapshot of upstream bugs.** They are dated, they carry issue
numbers, and two of them are somebody else's to fix. A rejection that turns on an open ticket is the
kind most likely to go stale quietly.

## Revisit when

A meta-framework emits a revisioned precache manifest including the prerendered entry document,
**and** the renderer or runtime it implies has been chosen independently on its own merits, so that
adopting it would close nothing that is still open.

Also when [what renders the client?](../questions/what-renders-the-client.md) chooses Vue, which
removes the grounds for the Nuxt rejection above.

## Also update

- [x] questions/README.md — the order already reflects this; the renderer entry carries the Nuxt
      reversal condition
- [x] architecture.md — nothing moved; this names no boundary that
      [ADR-0010](0010-the-store-needs-a-host-so-this-system-has-a-server.md) did not already draw
- [x] constraints.md — nothing moved; the eviction and manifest facts are already there and are cited
      rather than restated
- [x] glossary.md — nothing moved
- [x] guarantees/ — nothing moved; this promises a player nothing it did not already owe them
