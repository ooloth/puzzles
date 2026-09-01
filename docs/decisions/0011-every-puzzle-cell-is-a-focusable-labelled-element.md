---
number: 0011
status: accepted
date: 2026-09-01
---

# 0011 — Every puzzle cell is a focusable, labelled element

## Forced by

**[../problem.md](../problem.md) records that the desktop half is keyboard-driven by default.** That
is a property of how the game is played, not an accommodation. A grid a player cannot reach with the
keyboard fails half the audience described there before accessibility is mentioned at all.

**[../questions/README.md](../questions/README.md) chooses the renderer at M1 and the input model at
M4**, while [is accessibility in scope for v1?](../questions/is-accessibility-in-scope-for-v1.md)
sits at M9. The decision that forecloses it comes five milestones before the question that asks
about it, which is the pattern
[../standards/decisions.md](../standards/decisions.md) names as worth stopping for: a choice that
narrows everything downstream without announcing that it has.

**[../guarantees/accessibility.md](../guarantees/accessibility.md) records that these are expensive
to retrofit once an interaction model exists**, and says plainly that silence is not a decision to
skip it.

## Decision

**Every cell in a puzzle grid is a real element in the document that can take focus and carry a
name, a role and a state. The grid is not painted into a canvas.**

That is the whole decision. It is a constraint on
[what renders the client?](../questions/what-renders-the-client.md) and on nothing else, and it
leaves the rendering technology, the framework and the markup entirely open — every candidate in
that question satisfies this except a canvas.

**What it buys now** is that keyboard operation is possible at all. A player can move focus to a
cell, which is the precondition for doing anything there without a pointer. What a player can
actually *do* from the keyboard is [ADR-0012](0012-all-play-is-reachable-from-the-keyboard-alone.md),
which is a separate decision because a grid of focusable cells can still require a mouse to enter a
digit.

**What it keeps reachable** is assistive technology. A screen reader needs something to attach a
name and a state to, and a painted grid offers nothing. This does not promise that a screen reader
works well — see the risk below, where part of that is not ours to fix. It removes the structural
blocker, which is the part that is ours.

**It does not decide whether accessibility is in scope for v1.** That question stays open with its
findings intact. What this rules out is discovering the answer is yes after the renderer has made it
a rewrite.

## Rejected

- **Render the grid to a canvas.** The strongest rejected option and a real one: total control over
  layout and typography, one draw call instead of eighty-one elements participating in layout and
  paint, no browser inconsistency in how cells size themselves, and a well-trodden path — several
  well-regarded puzzle apps are built this way. Keyboard is even recoverable, by putting a key
  handler on a wrapper element. What is not recoverable is assistive technology: a canvas has
  nothing to attach a name or a state to, so support means building a parallel DOM tree by hand and
  keeping it in sync with the painting. That is a second implementation of the grid, maintained
  forever, and it is a rewrite rather than an addition.

- **Divs with click handlers and no focus management.** Not so much chosen as arrived at, which is
  what makes it the likeliest outcome of not deciding. It produces a grid that looks correct and
  cannot be operated without a pointer. The reason to reject it is present rather than future:
  `../problem.md` says the desktop half is keyboard-driven, so this fails a stated requirement on
  the day it ships.

- **Decide it at M9, where the question already sits.** The honest "not yet", and it is late by five
  milestones. The renderer is chosen at M1 and the input model at M4.

- **Promise full screen-reader support now.** Over-decides, and would be a promise effort alone
  cannot keep. The finding in
  [is accessibility in scope for v1?](../questions/is-accessibility-in-scope-for-v1.md) records open
  WebKit bugs covering exactly the mechanics a puzzle board needs — `aria-selected` not announced on
  `role=gridcell`, column headers not announced while navigating — the oldest from 2022. Correct
  ARIA does not reliably produce correct speech here.

## Risk

**Per-cell elements have a cost this record has not measured.** Eighty-one focusable elements for
sudoku and more for star battle, each participating in layout, paint and the accessibility tree.
[../constraints.md](../constraints.md) says client CPU and memory are not constraints under any
plausible data model and that we must not optimise for them, which is why this is recorded as a risk
rather than a reason to hesitate — but it is reasoned rather than observed, and it constrains
[what renders the client?](../questions/what-renders-the-client.md) before that question is worked.

**This delivers no accessibility.** It removes the structural blocker and nothing else. A player
using a screen reader is no better off until somebody writes the labels, decides what a cell
announces, and tests it against real VoiceOver — and the WebKit gaps above mean some of that is
waiting rather than working.

**It constrains an M1 question from outside it.** [What renders the
client?](../questions/what-renders-the-client.md) now has one candidate class ruled out before it is
argued on its own terms. That is deliberate and it is the second time in this folder; saying so is
what stops it becoming a habit.

## Revisit when

- **The element count is measured and costs something real** on a mid-range phone during active
  solving. `../constraints.md` predicts it will not, and a measurement disagreeing with it is the
  finding.
- **A puzzle type arrives whose board is not a grid of discrete cells.** The decision is written
  about cells because [ADR-0010](0010-the-option-to-add-puzzle-types-is-preserved.md) scopes the
  project to cell-marking puzzles. An edge-marking puzzle would need this argued again.
- **Assistive technology is ruled out of scope permanently**, at which point the canvas option
  returns with only the keyboard requirement against it, and that is satisfiable with a wrapper.

## Also update

- [x] `problem.md` — records that the desktop half is keyboard-driven, which this rests on
- [x] Nothing in `constraints.md` — this imports no facts about the world; the WebKit grid bugs stay
      a finding in the open question until somebody establishes them here
- [x] `guarantees/accessibility.md` — no promise is made by this record; the promise is
      [ADR-0012](0012-all-play-is-reachable-from-the-keyboard-alone.md)'s

Deliberately not decided here: what a cell announces, whether accessibility is in scope for v1, what
renders the client, what markup or roles are used, how focus moves between cells, and what a player
can do once a cell has focus.
