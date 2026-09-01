---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Does v1 ship generated or seeded puzzles?

## Why it matters

Generation is deferred in the work order but central to what this project is. A seeded launch
set needs its own validation, because nothing generated it.

**This gates puzzle quality, not the stack.** It decides whether the puzzles are good. What the
generator is built with follows from the shared language — see the order in [README.md](README.md).
Nothing on the road to a tech stack waits on this.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Options and findings ported from legacy ADR-22 (seed sudoku puzzles statically).

## Options

*Hand-picked seed set.* No generator needed to launch. But every grid needs verifying, and
while individual grids aren't copyrightable, a publisher's curated collection is.

*Generate before launch.* No seed licensing questions and no separate validation path, but it
moves generator work earlier than the stated priority order puts it.

*A throwaway set, five or ten grids, explicitly not launch content.* Enough to exercise
rendering, progress and deployment end to end, chosen or hand-made without settling anything
about where real content comes from. This is the option the other two obscure: it separates
unblocking the work from deciding the content strategy, which are otherwise forced together by a
choice nobody needs to make yet.

## Findings

**A library's licence is evaluated before its features.** A licence that disqualifies is
disqualifying whichever content strategy wins, so it is the cheapest thing to check and the most
expensive to discover late. One library fails on exactly this, and its
missing features were the second reason rather than the first.
