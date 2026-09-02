---
updated: 2026-09-01
update_when: a promise about who can play, and how, is made
decays: slow
status: active
---

# Accessibility

Who can play, and by what means. Grid puzzles raise real keyboard-navigation and
screen-reader questions — announcing cell position, current value, notes, and constraint
violations — and these are expensive to retrofit once an interaction model exists.

## Every action a player takes while solving is reachable from the keyboard alone

Selecting a cell, entering a value, clearing it, toggling a note, undoing — all of it, with no
pointer. Set by [ADR-0012](../decisions/0012-all-play-is-reachable-from-the-keyboard-alone.md).

The scope is the board. Surfaces outside play — settings, an archive listing — are not covered by
this promise, and that is an absence of argument rather than a decision that they may be
pointer-only.

**Enforced by** Nothing. Asserted only. There is no code, so this is a commitment to build the check
rather than a check.

**If violated** A player on a laptop cannot finish a puzzle, and finds out partway through. Half the
audience in [../problem.md](../problem.md) plays this way by default, so the failure is not an edge
case.

**Bearing on this** [How does a player enter a digit?](../questions/how-does-a-player-enter-a-digit.md)
and [what interactions must the grid support?](../questions/what-interactions-must-the-grid-support.md)
decide what the set of actions is, and this promise covers whatever they produce.
[ADR-0011](../decisions/0011-every-puzzle-cell-is-a-focusable-labelled-element.md) is what makes it
possible: a painted grid has nothing to move focus to.

---

**No promise is made about assistive technology**, and that is not silence.
[ADR-0011](../decisions/0011-every-puzzle-cell-is-a-focusable-labelled-element.md) keeps it
structurally reachable — every cell is an element that can carry a name, a role and a state — without
committing to it. [Is screen reader support in scope for v1?](../questions/is-screen-reader-support-in-scope-for-v1.md)
is where that is decided, and it records open WebKit bugs covering exactly the grid mechanics a
puzzle board needs, so part of the cost there is waiting rather than working.
