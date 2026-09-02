---
updated: 2026-08-30
update_when: an enforcement mechanism changes, or the launch set's provenance is settled
decays: slow
status: active
theme: puzzles
enforced: no
---

# Every puzzle has exactly one solution

No board we serve admits two valid completions. This holds equally for generated puzzles and for any
hand-picked set — where a puzzle came from doesn't change what it owes the player.

**Enforced by** Nothing. Asserted only. No generator, solver, or test exists. The obvious mechanism
when there is one: every puzzle is validated for uniqueness before it is stored or served, so the
generator never trusts its own output.

**If violated** A player finds a second valid answer, or grinds at a board that can't be finished. The
core claim of the product is false, and that kind of trust doesn't return.

**Bearing on this** [Does v1 ship generated or seeded puzzles?](../questions/does-v1-ship-generated-or-seeded-puzzles.md)
decides what has to validate the launch set — a seeded set has nothing generating it, so nothing
checks it either.
