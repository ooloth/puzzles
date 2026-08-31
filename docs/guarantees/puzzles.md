---
updated: 2026-08-30
update_when: a promise about puzzle quality or supply is made, or an enforcement mechanism changes
decays: slow
status: active
---

# Puzzles

What makes a puzzle worth solving, and what a player is offered over time. Promises that hold
only for one variant belong with that variant — [sudoku.md](sudoku.md). Promises about the
program behaving as specified are [correctness.md](correctness.md).

## Every puzzle has exactly one solution

No board we serve admits two valid completions. This holds equally for generated puzzles and
for any hand-picked set — where a puzzle came from doesn't change what it owes the player.

**Enforced by** Nothing. Asserted only. No generator, solver, or test exists. The obvious
mechanism when there is one: every puzzle is validated for uniqueness before it is stored or
served, so the generator never trusts its own output.

**If violated** A player finds a second valid answer, or grinds at a board that can't be
finished. The core claim of the product is false, and that kind of trust doesn't return.

**Bearing on this** [Does v1 ship generated or seeded puzzles?](../questions/does-v1-ship-generated-or-seeded-puzzles.md)
decides what has to validate the launch set — a seeded set has nothing generating it, so
nothing checks it either.

## Every puzzle is solvable by deduction alone

Reaching the solution never requires guessing and backtracking. A player who is stuck is
missing a deduction, not a lucky choice.

**Enforced by** Nothing. Asserted only.

**If violated** The player hits a wall that isn't their fault and can't tell whether they're
stuck or the puzzle is. Uniqueness alone doesn't prevent this — a board can have exactly one
solution and still be reachable only by guessing.

**Bearing on this** [What makes a puzzle a joy to solve?](../questions/what-makes-a-puzzle-a-joy-to-solve.md)
— this is the floor that question sits on, not the goal.
[Is difficulty graded, and does a grade promise anything?](../questions/is-difficulty-graded-and-does-a-grade-promise-anything.md)
would add a second, much harder claim on top of it.

---

Promises about the *set* offered over time — that a player is never served the same puzzle
twice, that a difficulty label means the same thing across puzzles, that the catalogue never
runs dry — belong here too, and none have been made yet. They become real as soon as
generation is on the table.
