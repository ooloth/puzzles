# puzzles

A web app for solving logic puzzles — grid-filling games like Sudoku and Star Battle — eventually paired with our own puzzle-generation pipeline.

Currently pivoting from Rust and [Datastar](https://data-star.dev), where the server renders HTML directly and pushes updates over server-sent events with no client-side JavaScript framework or build step, to a local-first Bun and Vite/React approach to achieve better offline UX. 

See `docs/vision.md` for the project's goals and `docs/decisions/` for the reasoning behind its stack and architecture.
