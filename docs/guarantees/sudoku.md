---
updated: 2026-08-30
update_when: a promise that holds only for sudoku is made
decays: slow
status: stub
---

# Sudoku

Promises that hold for sudoku and not for grid logic puzzles generally. Anything true of every
variant belongs in [puzzles.md](puzzles.md) instead — this file exists so variant-specific
claims don't quietly get generalised.

_No promises yet._

Likely candidates: which constraint families are validated (row, column, box, and any variant
rules); a floor on the number of givens, since below a known minimum a 9×9 grid cannot have a
unique solution; what the difficulty tiers mean in terms of the techniques a solve requires.

The third depends on [Is difficulty graded, and does a grade promise anything?](../questions/is-difficulty-graded-and-does-a-grade-promise-anything.md),
and grading is inherently variant-specific — the techniques that make a sudoku hard have no
counterpart in star battle.
