---
number: 0008
status: accepted
date: 2026-09-01
---

# 0008 — A stored puzzle describes its own size, regions and values

## Forced by

**[ADR-0002](0002-launch-with-sudoku-then-star-battle.md) guarantees a second game type arrives.**
Star battle is not a maybe. It is the next thing after sudoku, and it differs from sudoku in every
part of a puzzle's shape: no digits, a variable grid size, and regions whose boundaries are part of
the puzzle rather than derivable from a cell's coordinates.

**The portable decision-making standard says decisions are deferred until leaving
one open would close a door unnoticed, and names this door.** Its example list is "hosting topology
that silently caps a recovery mechanism, **a data shape that assumes one puzzle type**, an absent
identifier that turns a later feature into a migration."

**[../questions/README.md](../questions/README.md) now puts a puzzle in the store at M2.** That is
the moment the shape stops being a paper question. By M5 a player's board is in client storage too,
and
[is the guest record the same shape as the account record?](../questions/is-the-guest-record-the-same-shape-as-the-account-record.md)
records why that is the worst place to discover a migration: it runs once, in somebody's browser,
with no server to retry from.

**[../problem.md](../problem.md) ranks clarity over cleverness and present need over
future-proofing, and rules out anything built because it might be needed someday.** That is a
constraint on this record rather than a reason for it. It is why the decision below settles what a
shape may not assume, and settles nothing about what it should contain.

## Decision

**A stored puzzle carries its own dimensions, its own region map, its own cell vocabulary and its
game type. None of those is inferred from the puzzle being sudoku.**

Concretely, four assumptions are ruled out:

- That a grid is nine by nine, or square, or of any fixed size.
- That a cell holds a digit. Star battle cells hold a mark or nothing, and a cell's set of legal
  values is a property of the game type.
- That regions are derivable from coordinates. Sudoku boxes are; star battle regions are an
  arbitrary partition that has to be stored with the puzzle.
- That a clue is a pre-filled cell. Sudoku's givens are; other grid logic puzzles carry clues that
  belong to a row, a region or the grid as a whole.

**The option this preserves is adding puzzle types**, and it is the rationale rather than the rule.
What binds implementation is the four assumptions above, and they bind whether or not star battle
ever ships.

**This preserves an option; it does not design a schema.** It rules out one of the three candidates
in [what is a puzzle, across game types?](../questions/what-is-a-puzzle-across-game-types.md) — the
sudoku-only model generalised when the second type arrives — and leaves the other two untouched. One
generic model and per-type models behind a shared envelope both satisfy this, and choosing between
them is that question's job at M2 and M6, informed by writing both shapes out rather than by this
record.

**It commits to grid logic puzzles, not to every puzzle.** Sudoku and star battle both mark cells.
Puzzles whose marks live on the edges between cells rather than in the cells themselves — Slitherlink
is the common example — are not covered here, and a shape satisfying this decision may still fail to
hold one. Claiming otherwise would be preserving an option nobody has costed.

## Rejected

- **Model sudoku directly: an eighty-one character string.** The universal sudoku interchange
  format, understood by every library and tool in the space, trivially indexed, diffed and
  transmitted, and the smallest thing that could possibly work. A competent person ships this, and
  many have. Rejected because ADR-0001 already scheduled the game that breaks it, and by then the
  format is in the store, in the generator's output, in every player's browser and in the rules
  module at once. This is not a shape somebody might regret; it is one ADR-0001 guarantees will be
  regretted.

- **A fully generic constraint model** — variables, domains and constraints, with each game type
  expressed as data over a solver. It genuinely fits everything, including the edge-based puzzles
  this record declines to cover. Rejected on `../problem.md`'s ranking: it means building a
  constraint engine before a grid has ever been rendered, and clarity over cleverness is the fourth
  tiebreak in that file precisely because one person maintains this.

- **Decide it when star battle arrives.** The honest "not yet", and the same failure ADR-0008 and
  ADR-0009 both found. What makes it worse here is where the data sits: server rows can be migrated
  by code that runs once under supervision, and client storage cannot.

- **Preserve the option in the code without recording it.** Write the generic shape and let the
  reason live in whoever wrote it. Rejected because the portable decision-making standard
  treats the chain of reasoning as the deliverable, not the code alone, and the pressure to collapse
  it arrives later, from someone reasonably observing that the region map is the same every time and
  the size is always nine — and with no record, that person is right.

## Risk

**Generality is paid at every read site, forever, and star battle may never ship.** A shape that can
express an arbitrary region partition is more awkward for sudoku than an eighty-one character string
in every place that touches it — the generator, the rules, the renderer, the store. If ADR-0001's
sequencing changes, this will have been a tax collected for nothing.

**It is decided with nothing written down and nothing measured.** The representation has never
existed in any form, so the four assumptions above are reasoned from how the two games differ rather
than observed from two implementations. That is exactly what
[what is a puzzle, across game types?](../questions/what-is-a-puzzle-across-game-types.md) says would
settle it, and this record deliberately does not wait for it — because M2 stores a puzzle first.
Writing both shapes may show one of the four assumptions is wrong.

**It can be satisfied on paper and broken in practice.** Nothing here stops a shape that carries a
`size` field which every code path assumes is nine, or a region map every renderer hard-codes past.
The door is held open by the first code that reads a puzzle, not by the shape it reads, and no check
in this repo can tell the difference yet.

**"Fits two" is not "fits three".**
[Which games come after sudoku and star battle?](../questions/which-games-come-after-sudoku-and-star-battle.md)
is open, and a model built against exactly two examples usually fits exactly two.

## Revisit when

- **Star battle is abandoned** and sudoku is the only game there will be. The whole reason
  disappears, and the eighty-one character string becomes the right answer.
- **Both shapes have been written out**, per the question above. If the concrete exercise shows one
  of the four assumptions above is not load-bearing, this is superseded by the real model rather
  than amended.
- **A third game type is chosen** that is not cell-marking, at which point the scope line in the
  decision has to be argued rather than noted.

## Also update

- [x] Nothing in `constraints.md` — this imports no facts about the world
- [x] Nothing in `guarantees/` — this promises a player nothing; what a player is promised about
      puzzle quality is already in `guarantees/puzzles.md` and is unchanged
- [x] `questions/what-is-a-puzzle-across-game-types.md` — one of its three options is ruled out here
- [x] `questions/which-doors-must-stay-open.md` — this door is now held by a record rather than a
      list entry

Deliberately not decided here: what the representation actually is, whether it is one model or one
per type, how it is versioned, what the rules module operates on, how a board in progress is stored
separately from the puzzle, and whether edge-based puzzles are ever supported.
