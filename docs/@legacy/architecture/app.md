# App architecture

The web server: renders HTML server-side via Datastar hypermedia (`docs/decisions/01-render-with-datastar-hypermedia.md`), serves each game's puzzles, tracks anonymous player progress (`docs/decisions/11-track-progress-via-anonymous-server-side-sessions.md`).

See `docs/decisions/23-organize-by-domain-crate-per-game.md` for the reasoning behind this shape.

## Crate map

```
app  ──depends on──▶  sudoku, star_battle, ...   (domain: each game's rules)
app  ──depends on──▶  player                     (domain: session + progress concept)
app  ──depends on──▶  storage                    (infrastructure: SQLite access)
```

`app` itself contains each game's web-facing code as a module, not a separate crate:

```
app/src/
├── main.rs         # builds the Axum Router, owns the DB pool
├── session.rs       # reads/sets the session cookie (see the player crate for what a session IS)
├── sudoku/
│   ├── routes.rs    # Axum handlers for /sudoku/*
│   └── views.rs     # hypertext views: full pages + SSE fragment patches
└── star_battle/
    └── ...           # same shape, once built
```

## Request flow (sketch)

```
Browser
  │  GET /sudoku/:id
  ▼
app::sudoku::routes         — loads the puzzle + player progress
  │
  ├─▶ storage::load_progress(session_id, puzzle_id)
  ├─▶ sudoku::grid             (validates/represents the loaded state)
  ▼
app::sudoku::views           — renders HTML via hypertext
  │
  ▼
Browser (Datastar hydrates, drives further interaction over SSE)
```

## Deliberately unspecified here

- The exact `storage` API shape (function signatures, serialization format for puzzle content) — implementation detail for a `/design` pass.
- The grid-interaction design in Datastar's expression/signal system — still an open discussion.
- The known SSE-through-Fly's-proxy risk and its required mitigations — see `docs/failure-modes/01-sse-delivery-through-flys-proxy.md`.
