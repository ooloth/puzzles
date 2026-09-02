---
opened: 2026-09-02
status: open
resolves_into: decision
---

# Do content and puzzle routes share an origin?

## Why it matters

A landing page, and possibly writing about the puzzles or how they are generated, may sit beside the
game. Whether those live at paths under the same host as the game, or on a host of their own,
decides three things that are awkward to change afterwards.

**What a URL a player already has keeps pointing at.** Moving the game from one host to the other
later breaks every link anyone has saved or shared.

**Whether the two can be built and deployed independently.** Separate hosts can use entirely
different tooling and ship on different days. Paths under one host generally cannot, which is a cost
if the content wants a rendering model the game does not.

**Whether the browser treats them as one site.** This is the sharp one.
[../constraints.md](../constraints.md) records that Safari's first-party exemption for a server-set
cookie turns on what the domain resolves to, and that exemption is the whole basis of the recovery
mechanism at M12. Separating hosts adds a second arrangement that has to pass that test, or has to be
established as not needing to.

## What would settle it

Deciding whether writing beside the game is part of the product or an idea being kept alive, and then
whether anything about it wants tooling the game does not. If the content is a handful of pages that
change rarely, paths under one host cost nothing. If it is a publication with its own cadence, the
independence is worth something.

Nothing has to be built to answer it. What has to happen is that
[where does this run?](where-does-this-run.md) and
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md) are not
settled in a way that assumes one host forever without saying so.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02. The assumption in play is that content and puzzle routes share one host — stated
as an assumption rather than a decision, which is the point of tracking it.

## Options

*One host, everything under paths.* Simplest, one deployment, one certificate, one origin for the
cookie test to pass. Couples the content's tooling to the game's.

*Separate hosts.* Independent tooling, independent deploys, and the content can use a rendering model
chosen on its own merits. Two things to operate, and a second arrangement that has to satisfy the
cookie constraint or be shown not to need to.

*One host now, kept separable.* Paths under one host, with the content's routes arranged so that
moving them later is a redirect rather than a rewrite. Costs a little discipline and defers the
choice without foreclosing it.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The cookie constraint applies to the host that sets the cookie, not to every host in the product.**
If the game and its API share an origin and the content sits elsewhere, the content's arrangement is
irrelevant to recovery — it sets no cookie anybody depends on. This makes separation cheaper than it
first appears, and it is worth confirming rather than assuming, since the failure is silent.

**Redirects make the first choice less permanent than it looks.** A URL that moves can be redirected,
so the cost of starting under one host is a redirect rule rather than a broken link — provided the
original host stays alive to serve it.

**M1 settles the origin for the client and the API, not for everything.** That milestone deploys both
halves of the system onto one origin and the choice is permanent, so the host has to satisfy the
server and its store rather than only the client. What stays open here is narrower: whether a third
kind of route — writing, a landing page — joins them on that origin or lives somewhere of its own.
That does not have to be settled to choose the host, provided the host is not chosen on the
assumption that it never will be.
