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

[Does puzzle state live on the client or the server?](does-puzzle-state-live-on-the-client-or-the-server.md)
— a design that needs the network for every interaction has nothing to cache.

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
Safari clears all script-writable storage after seven days without interaction — which reaches
a cached shell as well as saved progress. So "installed once" is not a durable state, and
whatever answers this question has to survive its own cache being deleted.
