# Launch with Sudoku, then Star Battle, then expand gradually

Status: Decided

## Context

- Which puzzle type(s) to launch with was flagged repeatedly as an open blocker — it directly determines how demanding the grid-interaction design needs to be (single-cell click/type vs. multi-cell drag-select vs. edge-drawing).
- Personal inspiration: Star Battle, Sudoku, and Blueberry Trio (from circle9puzzle.com), plus krazydad.com and inkwellgames.com as sites whose gradual, ongoing rollout of new grid-based puzzle types is the model to follow.
- Considered: launching with the simplest interaction pattern to validate the whole pipeline first, vs. building the most personally exciting type first regardless of complexity, vs. launching with multiple types at once.

## Decision

- Launch (v1) with Sudoku — single-cell select + type a digit, the simplest interaction pattern in the fully-hypermedia rendering approach (`docs/decisions/01-render-with-datastar-hypermedia.md`).
- Star Battle next, soon after — multi-cell selection/marking, the next step up in interaction complexity, and an already-named favorite.
- Beyond that, expand gradually over time with additional grid-based types (e.g. Blueberry Trio, mechanically close to Star Battle's marker-placement pattern), matching the rollout model of the cited inspiration sites. Specific types and ordering beyond Sudoku → Star Battle are explicitly not decided now.

## Rationale

- Sudoku's interaction simplicity lets the whole pipeline — rendering, session/progress persistence, hosting, SSE delivery — get validated end-to-end before the harder multi-cell drag-select interaction work begins.
- Star Battle as the second type builds on validated infrastructure while tackling the interaction complexity the project will need for most of its future puzzle types anyway.
- Deferring specific ordering beyond that matches the project's stated preference for gradual, as-needed expansion rather than pre-planning a catalog before there's a working v1.

## Tradeoffs accepted

- Launching with the personally-simplest type rather than the most personally exciting one (Star Battle) — accepted deliberately as a sequencing choice, not a demotion of Star Battle's importance to the project.

## Rejected

- **Launching directly with Star Battle or another complex-interaction type**: would tackle the hardest interaction work before the rest of the pipeline (sessions, hosting, SSE) is proven out, risking conflating two kinds of risk at once.
- **Multiple types at launch**: adds scope before the simplest single type has even validated the pipeline.
