---
opened: 2026-08-31
status: open
resolves_into: decision
---

# How does the app itself stay available offline?

## Why it matters

[../guarantees/offline.md](../guarantees/offline.md) promises play continues through a total
loss of connectivity. Every discussion of that promise so far has been about *data* — where
progress lives and how it survives. None has been about the app: if the shell isn't already on
the device, opening it with no network gives a player nothing to play with, and the promise is
false no matter where state lives.

It also decides what "already on the device" covers. The interface is one thing; the puzzles a
player might start next are another.

## Blocked by

[ADR-0002](../decisions/0002-the-client-holds-and-mutates-puzzle-state.md)
— a design that needs the network for every interaction has nothing to cache. Also
[what provides the build and dev server?](what-provides-the-build-and-dev-server.md), because
the list of files to precache is produced by the build and only one candidate toolchain can
produce it.

## Blocks

N/A — nothing waits on this, but the offline guarantee has no enforcement path until it is
answered.

## What would settle it

Deciding what must be present before a player goes offline, then choosing a mechanism that puts
it there and keeps it current without a player noticing either happening.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised while migrating legacy ADR-20, which considered only how a server hands assets to a
browser and never how a browser keeps them.

## Options

...

## Findings

Caching an app shell and updating it are opposed problems, and any mechanism has to answer both.
A cache that never updates strands players on an old version indefinitely; one that revalidates
eagerly reintroduces the network dependency it was meant to remove. The update strategy is the
hard half, not the caching.

The previous design's asset thinking assumed the browser would ask a server each time. Without
content-hashed filenames a browser revalidates cached assets with conditional requests rather
than skipping them (see [../constraints.md](../constraints.md)) — cheap on a desk, expensive on
a weak mobile link, and useless with no link at all.

Two constraints already recorded bear directly on this. Browser storage is evictable, and
Safari clears all script-writable storage after thirty days without interaction — which reaches
a cached shell as well as saved progress. So "installed once" is not a durable state, and
whatever answers this question has to survive its own cache being deleted.

---

Researched 2026-08-31, as a by-product of the toolchain investigation. Two investigations reached
the following independently.

**Every option here has a maintenance problem, so the choice is which one to own rather than
which to avoid.** The dominant plugin for this job was declared frozen by its own author in May
2026 — maintenance mode, critical fixes only, to be formally marked obsolete — and the successor
packages he named did not exist on the registry three and a half months later. The library
underneath it has been in custodial maintenance since its lead left in 2022, with a maintainer
statement that there are no plans for a next version and a period in 2024 when its bug backlog
was formally abandoned. The better-engineered fork is one person with a fraction of the adoption.
There is no healthy option to pick.

**That argues for owning the service worker and using tooling only to inject the file list.**
The generated-service-worker mode makes the dependency structural; the inject mode makes it a
build step producing a list of filenames, which is the most replaceable part of the chain and
the part least likely to break in a way we cannot fix. The service worker itself is then ours,
portable, and testable.

**A full precache genuinely solves the stale-chunk failure rather than mitigating it.** An app
that loads code on demand can permanently fail an interaction when a deploy removes the chunk it
asks for — the browser caches the failed module resolution and retrying the import cannot
recover. The usual objection to precaching everything is wasted bandwidth, which does not apply
at this app's size. If every chunk is already in the cache, a deleted file on the server is
irrelevant.

**Skipping the waiting phase converts an online-only failure into an offline one.** Activating a
new service worker immediately, then clearing the previous cache, leaves an already-open page
asking for files that are in neither the cache nor the server. Prompting the player to reload is
the current consensus, and switching between the two after launch is documented as painful — so
this is a decision to make before the first deploy rather than after.

**A broken service worker recovers at the speed of its own update check.** The kill switch is a
known pattern and it works, but practitioners describe waiting days for clients to pick it up,
and a worker that caches its own script can be unreachable indefinitely. Whatever we ship, the
recovery path needs rehearsing against a real installed app before launch rather than being
assumed.
