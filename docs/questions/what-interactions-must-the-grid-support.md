---
opened: 2026-08-30
status: open
resolves_into: decision
---

# What interactions must the grid support?

## Why it matters

Sets what the interface has to do beyond the minimum, which in turn sets what "instant" has to cover
and how capable the client has to be. Three interactions have been asserted as requirements with
nothing corroborating them, and building for the wrong set is expensive at the highest-stakes
surface in the product.

**This does not cover entering a digit at all.** That is
[how does a player enter a digit?](how-does-a-player-enter-a-digit.md), which blocks a much earlier
milestone. What is left here — pencil notes, undo, drag-select, keyboard navigation, live
highlighting — is what makes solving pleasant rather than possible, and every one of them is better
judged against a grid that already works than in the abstract.

## Blocked by

N/A — nothing needs to be answered first.

## What would settle it

Solving puzzles on paper and in existing apps, and noticing which interactions carry the
experience and which are decoration.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Legacy ADR-01 (render with server-driven hypermedia), which asserted three interactions as
requirements.

## Options

Not alternatives — a checklist, where the answer is whichever subset is worth building.

*Pencil notes.* Candidate marks in a cell. Named in [../guarantees/interaction.md](../guarantees/interaction.md)
as needing to be visually distinct from committed entries, which presumes they exist.

*Undo, and how far back.* [Its own question](is-undo-in-scope-and-how-far-back.md), because the
depth interacts with whether state is a snapshot or an event log.

*Drag-select across cells.* Asserted as a requirement by the legacy record below.

*Keyboard navigation.* Asserted there too, and separately an accessibility affordance.

*Live highlighting* of the cells related to the current selection. Asserted there, and the one with
a cost nobody has counted.

## Findings

Legacy ADR-01 states that puzzle grids "need zero-lag drag-select, keyboard nav, live
highlighting". Nothing else in the corpus corroborates any of the three, and no user research
exists anywhere in this project's history. Treat them as the previous author's judgement rather
than as established requirements.

Live highlighting carries a cost nobody costed: highlighting the cells related to the current
selection means recomputing those relationships on every cursor move, which is exactly the
per-input work a latency budget has to accommodate.
