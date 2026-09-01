---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Is accessibility in scope for v1?

## Why it matters

Never mentioned in any prior document. Grid puzzles have real keyboard navigation and
screen-reader design questions, and retrofitting them is expensive. Silence is not a decision.

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

This was weighed during [ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md) and judged
not decisive against web delivery. It is recorded here because it changes the price of this
question's answer, not that decision. Verified against WebKit's issue tracker, 2026-08-31.
