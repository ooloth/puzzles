---
number: 0014
status: accepted
date: 2026-09-01
---

# 0014 — All play is reachable from the keyboard alone

## Forced by

**[../problem.md](../problem.md) records that the desktop half is keyboard-driven by default**, and
that filling a grid by pointing at each cell is slower than typing. That makes this a requirement of
the product rather than an accommodation, and it is why this record exists now rather than at M9.

**[ADR-0013](0013-every-puzzle-cell-is-a-focusable-labelled-element.md) makes it possible and does
not make it true.** A grid of focusable cells can still require a pointer to enter a digit, toggle a
note, or undo. Focus is the precondition; this is the promise.

**[../questions/README.md](../questions/README.md) chooses the input model at M4** — [how does a
player enter a digit?](../questions/how-does-a-player-enter-a-digit.md) — and the interaction set at
M9. An input model designed for touch and extended to the keyboard afterwards produces keyboard
support for the actions somebody remembered, which is the failure this forecloses.

## Decision

**Every action a player can take while solving is reachable from the keyboard alone, with no
pointer.** Selecting a cell, entering a value, clearing it, toggling a note, undoing, and whatever
else [what interactions must the grid support?](../questions/what-interactions-must-the-grid-support.md)
turns out to include.

This is a promise, and it goes in [../guarantees/accessibility.md](../guarantees/accessibility.md)
where a player can hold us to it. The record here is the decision to make it.

**The binding form is "every action", not "the important actions".** That is the whole content of
the decision. A list of keyboard-reachable actions is a list somebody will fail to extend when the
next action is added; a rule that covers the set is one that has to be broken deliberately. The
practical consequence is that adding a pointer-only interaction is a change to this record rather
than a feature.

**It says nothing about which keys.** Arrow keys against WASD, digits against a mode switch, how
notes are entered — all of that is
[how does a player enter a digit?](../questions/how-does-a-player-enter-a-digit.md) and
[what interactions must the grid support?](../questions/what-interactions-must-the-grid-support.md),
still open. What is settled is that whatever they choose, the keyboard reaches all of it.

**It applies to solving, not to the whole app.** Anything outside the board — a settings page, an
archive listing — is not covered here. That is not a judgement that those may be pointer-only; it is
that this record is about play and does not pretend to more reach than it argued for.

## Rejected

- **Keyboard support for the common actions, pointer for the rest.** The pragmatic version, and the
  one almost every implementation ends up at. It is cheaper at every step and it fails by accretion
  rather than by decision: each individual action that ships pointer-only is defensible, and the
  set is not. Rejected because [../problem.md](../problem.md) makes keyboard-driven desktop play the
  default rather than a fallback, so the cost of the rule is nearly zero at design time and the cost
  of the exception is discovered by a player who cannot finish a puzzle.

- **Decide it at M9, with the rest of the interaction set.** The honest "not yet", and the input
  model is chosen at M4. An interaction designed for touch and extended afterwards is exactly the
  retrofit `../guarantees/accessibility.md` warns is expensive.

- **Make it a standard rather than a promise.** Genuinely arguable: a rule about how interactions
  are built could live in `../standards/` and be checked at review. Rejected because
  `../standards/README.md` says only Must holds unconditionally and that anything true without
  exception belongs in `../guarantees/` — and this is a claim a player could catch us breaking,
  which is that folder's test.

- **Promise it for the whole app rather than for play.** Broader, and it would be the more generous
  promise. Rejected because nothing has been argued about the surfaces outside the board, and a
  promise made without arguing it is the thing `../guarantees/README.md` calls a wish.

## Risk

**The promise is unenforced, and this record does not change that.** Nothing checks it, because
there is no code. `../guarantees/accessibility.md` will say _Enforced by: Nothing. Asserted only._
alongside every other promise in that folder, and the honest reading is that this is a commitment to
build the check rather than a check.

**It constrains M4 and M9 before either is worked.** [How does a player enter a
digit?](../questions/how-does-a-player-enter-a-digit.md) now has an option class ruled out — a
gesture with no keyboard equivalent, drag-select being the obvious candidate. That is real
foreclosure, and drag-select is a genuinely good touch interaction whose keyboard form is not
obvious.

**"Every action" is a rule that will be inconvenient exactly once and then forever.** The first time
a good touch interaction has no natural keyboard form, this record is what stops it shipping. That
is the point, and it is also the cost, and whoever meets it will be right that the specific case is
small.

**It is not an accessibility guarantee.** Keyboard operability is necessary for screen-reader use
and nowhere near sufficient. [Is screen reader support in scope for v1?](../questions/is-screen-reader-support-in-scope-for-v1.md) stays open, and this record should not be
cited as having answered it.

## Revisit when

- **A touch interaction is found whose keyboard form is genuinely worse than the alternative**, and
  the tradeoff is argued rather than assumed. The answer may be to supersede this with a narrower
  promise; it should not be to make a quiet exception.
- **The desktop half stops mattering**, per `../problem.md`. This rests on it, and if desktop play
  is dropped the requirement half of this disappears — leaving only the accessibility half, which is
  a different and unargued case.

## Also update

- [x] `guarantees/accessibility.md` — gains the promise, with its enforcement line reading as
      unenforced, and the scope limited to solving
- [x] Nothing in `constraints.md` — this imports no facts about the world
- [x] Nothing in `problem.md` — the input fact it rests on was added by
      [ADR-0013](0013-every-puzzle-cell-is-a-focusable-labelled-element.md)

Deliberately not decided here: which keys do what, how notes are entered, whether drag-select ships
in some form, whether accessibility is in scope for v1, what a screen reader announces, and whether
anything outside the board is keyboard-reachable.
