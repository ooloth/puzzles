---
opened: 2026-09-26
status: open
resolves_into: decision
---

# How does the client load data from the server?

## Why it matters

M3 is the first time the client fetches content that becomes the board. A puzzle, once on the
board, is state a guarantee covers, which
[ADR-0037](../decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md) keeps out of
the renderer. So whatever loads it has to hand it to the state code rather than hold it in a view.

M1's third slice fetches "Hello!" before this is answered, and does it inside a view, which
[ADR-0037](../decisions/0037-the-renderer-draws-client-state-and-does-not-own-it.md) allows for state
no promise covers. That fetch is not the pattern M3 copies. This question is listed at M3 so that M3
answers it instead.

Its inputs arrive at different milestones: what crosses the boundary at M3, what implements the
client's state at M5, and whether a puzzle is fetched before it is needed at M9. So M3 may settle
only where fetched content enters the client, and leave when it is fetched to M9.

This is client code, so it is the same in every environment. Where the request goes is the client's
own origin, per [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md).

## What would settle it

Knowing what loading has to do across the milestones that use it: fetch a puzzle before it is needed
([is a puzzle fetched before it is needed?](is-a-puzzle-fetched-before-it-is-needed.md)), hand content
to the state code under `src/client/state/`, and never make a player wait during normal play, per
[../problem.md](../problem.md). Then which way of loading meets that without being replaced when
M3 arrives.

## Properties the answer is scored against

...

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
