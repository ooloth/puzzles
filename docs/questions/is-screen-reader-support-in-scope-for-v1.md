---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Is screen reader support in scope for v1?

## Why it matters

Grid puzzles have real keyboard navigation and screen-reader design questions, and retrofitting
them is expensive. Silence is not a decision.

**Two things have been taken out of this question, and what is left is the harder half.**
[ADR-0013](../decisions/0013-every-puzzle-cell-is-a-focusable-labelled-element.md) settles that
every cell is an element that can carry a name, a role and a state, which removes the structural
blocker without promising anything.
[ADR-0014](../decisions/0014-all-play-is-reachable-from-the-keyboard-alone.md) promises keyboard
operation, on the grounds that [../problem.md](../problem.md) makes the desktop half keyboard-driven
— a product requirement that happens to help here rather than an accessibility decision.

So what remains is assistive technology: what a cell announces, what a screen reader is told about
selection, givens, notes and violations, and whether any of it is promised for v1. That is the part
the WebKit findings below make expensive, and none of it is answered by the two records above.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Finding drawn from legacy ADR-01 (render with server-driven hypermedia).

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

Keyboard navigation was already treated as a grid requirement in legacy ADR-01, well before
accessibility was raised as a question here. Whether it was meant as an accessibility concern or
as a power-user convenience isn't recorded.

**VoiceOver support for ARIA grids is broken in ways specific to this widget, and web delivery is
now committed.** Open WebKit issues cover `aria-selected` not being announced on `role=gridcell`
(276316), column headers not announced while navigating cells (276909), and row headers in
`aria-owns` grids (300131) — the oldest in the cluster dates to 2022 and the newest to October
2025. These are exactly the mechanics a puzzle board needs to convey: which cell is selected, what
row and column it sits in, and whether its value is given or entered. A native grid view uses
first-party accessibility APIs and avoids the class structurally.

> So an answer of "yes, in scope" costs more here than the same answer would on another platform,
> and the extra cost is not effort that buys a fix — some of it is waiting on WebKit. The work is
> testing against real VoiceOver early and designing announcements that survive the gaps, rather
> than assuming correct ARIA produces correct speech.

**This was weighed during [ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md) and
judged not decisive against web delivery.**

*Sourced — WebKit's issue tracker, checked 2026-08-31.*
