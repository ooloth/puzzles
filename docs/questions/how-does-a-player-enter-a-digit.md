---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How does a player enter a digit?

## Why it matters

The minimum path from "a grid is on screen" to "a player can fill it in": choosing a cell, putting a
value in it, and taking one out. Nothing else about the grid is needed to see that working, and
nothing about the grid works at all until it is answered.

It is separated from
[what interactions must the grid support?](what-interactions-must-the-grid-support.md), which covers
notes, undo, drag-select, keyboard navigation and highlighting. Those make solving pleasant; this
makes it possible. Answering them together would mean deciding the pleasant parts with no running
grid to judge them against.

The choice is not obvious on a phone, which is the primary target. A grid of eighty-one cells on a
small screen has no room for a cell to be a text input, and the two established patterns put the
digits in different places.

## Blocked by

N/A — nothing needs to be answered first.

## What would settle it

Building it and using it on a phone. This is a question where a day of solving on a real device
settles more than any amount of comparison, and where the wrong answer is obvious within minutes of
trying it.

Worth doing while it is cheap: the entry model is visible in every screenshot of every competitor,
so the field is easy to survey, and the disagreements between them are the interesting part.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split from [what interactions must the grid support?](what-interactions-must-the-grid-support.md) on
2026-09-01, because the entry path blocks a much earlier milestone than the rest of it.

## Options

*Select a cell, then tap a digit from a pad.* The dominant mobile pattern. One persistent control
strip, no keyboard, and the selection is visible while choosing. Costs vertical space permanently.

*Select a digit, then tap the cells it goes in.* Inverts the order and suits filling several cells
with the same value, which is how some solvers work. Less familiar.

*A cell accepts typed input directly.* Natural with a hardware keyboard and awkward without one,
since it summons the on-screen keyboard over the board.

*Both, by input type* — a digit pad for touch, typing for a keyboard. Likely where this ends up, and
worth stating as a deliberate choice rather than arriving at by accident.

## Findings

**Nothing is recorded yet.** No pattern has been surveyed or tried.
