This will evolve eventually into a web app, serving logic puzzles (think grid-filling games like sudoku, star battle, etc).

So, two overall concerns: a delightful UI / app for solving puzzles; and a clever pipeline generating puzzles that are a joy to solve. The site will eventually have users whose progress must be reliably saved and restored.

The vision and full stack/architecture/ops decision trail are now recorded in the docs below. Current focus: codebase layout, then starting implementation.

## Key docs

- `docs/vision.md` — why this project exists, priorities, and engineering style
- `docs/decisions/` — one ADR per file, numbered; the reasoning behind every stack/architecture/ops decision made so far
- `docs/failure-modes/` — known risks and how they're mitigated
- `docs/architecture/` — request-flow and generation-pipeline diagrams (not yet populated)

Priorities:

1. Make good decisions about overall scaffold, including tech stack and feedback loops
2. Establish great documentation patterns, with useful docs referenced in lookup tables in the right places
3. Choose the simplest stack that can robustly achieve the project's goals without unnecessarily complicating maintenance for a solo maintainer
