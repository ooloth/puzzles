---
number: 0001
status: accepted
date: 2026-08-31
---

# 0001 — Launch with sudoku, then star battle, then expand gradually

## Forced by

[problem.md](../problem.md) ranks the solving experience above puzzle supply and puts interface
work before generator work. Something has to be on screen for a solving experience to exist, so
the first puzzle type is on the critical path to everything the project cares about — and the
choice determines how demanding the interaction design has to be before anything else can be
validated.

## Decision

Launch with sudoku: select a cell, type a digit. Star battle second, once the surrounding
machinery is proven. Types beyond those two are deliberately not chosen now.

## Rejected

- **Star battle first** — it is the more interesting puzzle and the one the maintainer would
  rather build, but its interaction is multi-cell marking across irregular regions. Starting
  there means taking on the hardest interaction work at the same time as the offline
  persistence, caching and update machinery, with no way to tell which one is failing.
- **Several types at launch** — adds scope before a single type has demonstrated that the
  machinery works at all.

## Risk

**Deferring the more exciting puzzle is a risk to the project being finished, not just a
sequencing preference.** [problem.md](../problem.md) states this is a craft project intended to
stay worth doing over about a year, and a solo project that stops being enjoyable stops. The
original framing recorded this as a tradeoff accepted; it is better understood as the main thing
that could go wrong with this decision.

Secondary: sudoku is well-trodden, so a v1 that launches with it alone competes with every other
sudoku app on execution rather than on novelty. That is consistent with the stated priority —
the solving experience is the differentiator, not the catalogue — but it means the interface has
to actually be better, not merely present.

## Revisit when

- The chosen client architecture makes sudoku's interaction not meaningfully simpler than star
  battle's, which would remove the entire basis for the ordering.
- Star battle has not shipped and motivation is flagging. The ordering was chosen to reduce
  risk; if it is producing the risk instead, it has stopped doing its job.

## Also update

- [x] constraints.md — no givens are imported by this decision
- [x] guarantees/ — no new promises; [guarantees/sudoku.md](../guarantees/sudoku.md) becomes the
      place for anything promised about the launch variant specifically
