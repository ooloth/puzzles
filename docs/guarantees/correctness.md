---
updated: 2026-08-30
update_when: a promise about puzzle soundness is made, or an enforcement mechanism changes
decays: slow
status: active
---

# Correctness

An individual puzzle is sound. Promises about whether a player can *reach* the solution
comfortably belong in [latency.md](latency.md) and [offline.md](offline.md). Promises about
the *set* of puzzles offered over time — variety, supply, what a difficulty label means — are
[puzzles.md](puzzles.md). The line here is one puzzle versus the set.

## Every puzzle has exactly one solution

No board we serve admits two valid completions. This holds equally for generated puzzles and
for any hand-picked set — where a puzzle came from doesn't change what it owes the player.

**Enforced by** Nothing. Asserted only. No generator, solver, or test exists.

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
