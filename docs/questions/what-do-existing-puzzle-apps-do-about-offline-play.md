---
opened: 2026-08-30
status: open
resolves_into: problem
---

# What do existing puzzle apps already do about offline play?

## Why it matters

No competitor, review, or user research appears anywhere in this project's history. The problem
is asserted from first principles plus one precedent borrowed from a task manager. If
mainstream puzzle apps already handle tunnels well, the offline work is table stakes rather
than a differentiator — and something else has to carry the product.

## What would settle it

An hour with a few of the popular apps and aeroplane mode.

## Resolves into

`problem.md`.

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

...

## Findings

...
*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A search for published engineering writing on this came back essentially empty**, and that is the
finding rather than a failed search. No official engineering post from NYT Games, LinkedIn Games or
Sudoku.com describes how any of them handles offline play, caching or the commute case.

**Wordle's original design is well-corroborated and obsolete.** Before the NYT acquisition the entire
word list shipped client-side in the JS bundle, with the day's word selected by a date-based index
computed locally — no daily fetch for the puzzle, no server-side answer check. This is documented only
by independent reverse-engineering write-ups rather than by anything NYT published.

**It changed after 2022 and the replacement is undocumented.** Following two incidents where players
received different answers because answers had been baked into pages before an editorial swap, NYT
said it was moving to "a more sustainable, long-term solution". Later teardowns note the client-side
method broke. What today's fetch and cache model actually is could not be established.

**One adjacent fact, about the server side rather than the client.** An NYT engineering account of
moving the Games platform to Google App Engine describes pre-warming load balancers and raising
DynamoDB quotas ahead of the fixed daily release, then scaling back down — engineering for a release
spike, which is a different problem from the one this question asks about.

**Sudoku.com supports offline play** per its app-store listing, in the sense that an already-loaded
puzzle keeps working without connectivity. No evidence was found that it prefetches future days.

> So this question cannot currently be answered from public sources. Answering it would mean observing
> the apps directly — opening one in a browser with the network disabled, or watching what it fetches
> — rather than reading about them. That is a small piece of work and nobody has done it.

*Sourced — a research agent searched for engineering blogs, conference talks and teardowns 2026-09-02
and reported finding nothing official for any of the three. The Wordle teardown claims are
well-corroborated across independent write-ups but are not vendor statements. I did not open the
individual teardowns.*
