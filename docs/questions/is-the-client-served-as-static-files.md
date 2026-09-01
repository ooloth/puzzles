---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Is the client served as static files?

## Why it matters

This is already implied by things that have been accepted, and is written down nowhere. [ADR-0002](../decisions/0002-the-client-holds-and-mutates-puzzle-state.md)
puts authoritative state on the client, and [../guarantees/offline.md](../guarantees/offline.md)
promises play continues with no network — so the application has to boot from what is already on
the device, with no server round trip in the path. That is a real architectural commitment and
nobody has recorded it.

It is the decision that rules out server rendering and the meta-frameworks built around it. A
framework investigation already concluded against them on evidence, with no record to point at,
which is the shape of a decision made by accident.

It also decides whether a server is needed for *delivery* at all, which is a separate matter from
whether one is needed for [storage](what-does-the-server-hold.md). A static bundle needs a file
host; it does not need a runtime.

## What would settle it

Checking whether anything genuinely requires markup to be produced per request. Personalisation,
search indexing and a marketing surface are the usual reasons, and none of them describes a grid
whose state lives on the device.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, when tracing which decision ruled out meta-frameworks and finding none did.

## Options

*Static files.* The application is a bundle served by any file host; everything happens after it
loads. What the offline guarantee appears to force.

*Server-rendered, hydrating to a client application.* First paint arrives as markup. Faster to
show something, and it puts a server in the path of the first load, which is the load most likely
to happen on a bad connection.

*A mix* — a static application, with separate server-rendered pages for anything that is not the
game.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A static bundle and a rendering server want different hosts.** That bears on
[what renders the client?](what-renders-the-client.md) and everything under it, plus
[where does this run?](where-does-this-run.md).

**Origin topology is a factor here, and it fails silently.** If sessions are carried by a cookie,
Safari caps a server-set cookie back to seven days when it judges the setting server not genuinely
first-party — which is the shape of a static host with its API on another origin, per
[../constraints.md](../constraints.md). Serving the client and its API from one origin avoids the
test entirely. A bearer token in script-writable storage avoids it too, at the cost of living in
storage the browser evicts and being reachable by any script that runs on the page. Neither is
forced; what is forced is that this gets chosen rather than inherited from wherever the two things
happen to be deployed.

*Sourced — per [../constraints.md](../constraints.md).*

**The offline guarantee mostly settles this, but not entirely.** An application can be
server-rendered on first visit and served from a cache afterwards, so the promise survives
technically. What it costs is that the very first visit — before any cache exists, on the network
this app is designed for — depends on a server responding. That is the worst moment to add a
dependency.

**A marketing page is not a reason to reopen it.** Anything outside the game can be a separate
static deploy or a separate server; it does not require the game itself to be rendered remotely.

**The evidence from comparable projects is one-sided.** Across the local-first ecosystem's own
published examples, static single-page applications outnumber meta-framework examples by roughly
twelve to one, and the flagship projects in that space ship as static bundles.

*Sourced — the local-first ecosystem's own published examples.*

**A documented failure mode argues the same way.** Restoring persisted state during hydration is a
known and long-lived source of mismatch bugs, and the sanctioned fix — skipping hydration for that
state — guarantees a flash of empty content on every load. Here that is a blank grid appearing
before the player's board does.

*Unverified — no source recorded.*
