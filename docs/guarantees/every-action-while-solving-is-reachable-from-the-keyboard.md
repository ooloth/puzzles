---
updated: 2026-09-01
update_when: the set of solving actions changes, or an enforcement mechanism changes
decays: slow
status: active
theme: accessibility
enforced: no
---

# Every action a player takes while solving is reachable from the keyboard alone

Selecting a cell, entering a value, clearing it, toggling a note, undoing — all of it, with no
pointer. Set by [ADR-0014](../decisions/0014-all-play-is-reachable-from-the-keyboard-alone.md).

The scope is the board. Surfaces outside play — settings, an archive listing — are not covered by this
promise, and that is an absence of argument rather than a decision that they may be pointer-only.

**Enforced by** Nothing. Asserted only. There is no code, so this is a commitment to build the check
rather than a check.

**If violated** A player on a laptop cannot finish a puzzle, and finds out partway through. Half the
audience in [../problem.md](../problem.md) plays this way by default, so the failure is not an edge
case.

**Bearing on this** [How does a player enter a digit?](../questions/how-does-a-player-enter-a-digit.md)
and [what interactions must the grid support?](../questions/what-interactions-must-the-grid-support.md)
decide what the set of actions is, and this promise covers whatever they produce.
[ADR-0013](../decisions/0013-every-puzzle-cell-is-a-focusable-labelled-element.md) is what makes it
possible: a painted grid has nothing to move focus to.
