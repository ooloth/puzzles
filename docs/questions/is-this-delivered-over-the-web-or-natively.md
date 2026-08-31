---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Is this delivered over the web, or natively?

## Why it matters

It is the first decision, and until 2026-08-31 it had never been asked — it was inferred from a
maintainer purpose in [../problem.md](../problem.md) and treated as settled.

Almost everything downstream inherits it. Nearly every entry in [../constraints.md](../constraints.md)
about storage eviction, tracking prevention, background execution and service workers is a
property of browsers, and would simply not exist for a native application. The language question
is web-shaped: one TypeScript codebase across every deployable makes sense on the web and makes
much less sense when the client is Swift or Kotlin. Whether the client boots without a server,
what renders it, what builds it, and what holds a player's work are all downstream.

**The web is the harder platform for this particular application, and that is the thing to argue
about.** An app whose defining promises are *works with no network* and *never loses your work*
is asking for exactly the two things a browser is worst at giving.

## Blocked by

N/A — nothing needs to be answered first. It is the root.

## Blocks

Everything. See the order in [README.md](README.md).

## What would settle it

Naming what each platform costs and buys for *this* app rather than in general, and being
explicit that most of the pain already documented in `../constraints.md` is the price of one of
the answers rather than a fact of the world.

The maintainer purposes in `../problem.md` are a legitimate input here and should be stated as
one, not smuggled in. So should the audience: a public v1 found by a few people.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31 by the maintainer, after it was found sitting in an "already agreed" list on
the strength of an inference rather than an argument.

## Options

*Web.* A URL, a browser, a service worker.

*Native.* One or more platform applications, distributed through a store.

*Both.* A native client plus a web client, or a native shell around a web view.

## Findings

**What native gives that the web does not**, and it is most of this project's difficulty:

- Storage that is not evicted. No seven-or-thirty-day clock, no `persist()` that is really a
  membership test, no home-screen-install path, no separate storage jars. The durability
  promise becomes close to free.
- Background execution. Sync can happen when the app is closed; on iOS the web has none at all.
- Push notifications, which matter for a product built on a daily rhythm.
- Offline as the default rather than an engineering project — no service worker, no precache
  manifest, no stale-build recovery, none of the tooling whose maintainers have all stepped back.
- Lower-level input handling, which is worth something for a grid built around gestures.

**What the web gives back:**

- No install step. A link works. Against an audience deliberately described as small and
  non-technical, and a v1 meant to be found rather than marketed, this is the largest single
  point.
- No store review, no annual fee, no rejection risk, and shipping on our own schedule.
- One codebase across phone and desktop. `../problem.md` requires both — phone-first with
  secondary desktop use by the same person — and native would mean two applications or a
  cross-platform framework that reintroduces much of the web's complexity anyway.
- Addressable content. Puzzles have URLs, which can be shared and linked.
- It is the platform the maintainer purpose in `../problem.md` names.

**The trade, stated plainly.** The web gives up durability-for-free and background execution, and
buys zero-friction reach and one codebase across two form factors. Every hard problem this repo
has documented sits on the giving-up side of that sentence.

**Choosing the web means adopting the constraints file as a cost rather than inheriting it as
weather.** That reframing is most of the value of writing this down: it makes the eviction work,
the service worker work and the recovery-cookie topology trap into things bought deliberately.

**Do not treat "both" as the safe middle.** It is the only option that pays both sets of costs,
and for one maintainer it is the least defensible of the three.
