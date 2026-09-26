---
opened: 2026-09-26
status: open
resolves_into: decision
---

# How does the client load data from the server?

## Why it matters

M1's third slice is the first time the client asks the server for anything, and whatever it does
becomes the pattern M3 copies for the first puzzle. A puzzle, once on the board, is state a guarantee
covers, which
[ADR-0037](../decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md) keeps out of
the renderer. A loading path built inside a view for "Hello!" would then have to be moved out again
at the point it starts carrying something that matters.

This is client code, so it is the same in every environment. What differs between local runs and
production is only where the request goes, which is
[do the client and the API share an origin?](do-the-client-and-the-api-share-an-origin.md).

## What would settle it

Knowing what loading has to do across the milestones that use it: fetch a puzzle before it is needed
([is a puzzle fetched before it is needed?](is-a-puzzle-fetched-before-it-is-needed.md)), hand content
to the state code under `src/client/state/`, and never make a player wait during normal play, per
[../problem.md](../problem.md). Then which way of loading meets that without being replaced when
M3 arrives.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-26, while drafting M1's third slice as an issue. Its entry claimed [ADR-0037](../decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md) put the
fetch outside the renderer, which [ADR-0037](../decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md) does not say.

## Options

Nothing recorded yet.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**No record settles this.** [ADR-0037](../decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md) moves only state a promise covers out of the renderer, and says
state no promise covers "may live in the renderer". "Hello!" is covered by no promise.
[ADR-0038](../decisions/0038-the-renderer-is-react.md) says a client-only React app on Vite "leaves
routing, data loading and styling to be chosen here".

*Sourced — [ADR-0037](../decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md) and [ADR-0038](../decisions/0038-the-renderer-is-react.md), read 2026-09-26.*
