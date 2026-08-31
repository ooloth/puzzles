# puzzles

A web app for solving logic puzzles — grid-filling games like Sudoku and Star Battle — eventually
paired with a custom puzzle-generation pipeline.

An earlier plan had intended to use Rust and [Datastar](https://data-star.dev), with the server
rendering HTML directly and pushing updates over server-sent events with no client-side JavaScript
framework or build step. That approach is being reconsidered from first principles, largely to
provide better offline behaviour on mobile. The stack is currently undecided.

See `docs/problem.md` for what this is trying to be, `docs/questions/` for what's still being
pondered, and `docs/README.md` for the rest of the documentation.
