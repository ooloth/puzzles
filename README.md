# puzzles

A web app for solving logic puzzles — grid-filling games like Sudoku and Star Battle — eventually paired with our own puzzle-generation pipeline.

Built with Rust and [Datastar](https://data-star.dev) rather than a typical React/SPA frontend: the server renders HTML directly and pushes updates over server-sent events, with no client-side JavaScript framework or build step. Partly a deliberate exploration of the hypermedia approach to frontend development as an alternative to the client-heavy SPA model.

See `docs/vision.md` for the project's goals and `docs/decisions/` for the reasoning behind its stack and architecture.
