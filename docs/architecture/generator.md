# Generator architecture

The CLI tool that creates puzzle content, run standalone — not part of the running web server (`docs/decisions/04-separate-puzzle-generation-from-serving.md`).

See `docs/decisions/23-organize-by-domain-crate-per-game.md` for the reasoning behind this shape.

## Crate map

```
generator  ──depends on──▶  sudoku, star_battle, ...   (domain: each game's generation logic)
generator  ──depends on──▶  storage                    (infrastructure: SQLite access)
```

`generator` contains each game's CLI entrypoint as a module:

```
generator/src/
├── main.rs         # parses CLI args, owns the DB pool, dispatches per game
├── sudoku.rs        # calls sudoku::generate(), writes results via storage
└── star_battle.rs   # same shape, once built
```

## Generation flow (sketch)

```
$ generator sudoku --count 50
  │
  ▼
generator::sudoku            — CLI glue
  │
  ├─▶ sudoku::generate()       — pure domain logic: fill + remove-while-unique
  ▼
storage::save_puzzle(...)     — persists the generated puzzle as opaque bytes
```

## Deliberately unspecified here

- Sudoku's actual generation algorithm details (difficulty grading, symmetric clue removal) — per `docs/decisions/22-seed-sudoku-puzzles-statically-avoid-agpl-crate.md`, custom generation logic is still to be built; a small static seed set covers pipeline validation until then.
- Star Battle's generation approach entirely — deliberately deferred per `docs/vision.md`.
