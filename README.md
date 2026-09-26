# Puzzles ✏️

A web app for solving grid-based logic puzzles like Sudoku and Star Battle, plus a pipeline for
generating them.

The goal is a delightful puzzle-solving UI that rivals the UX of any current alternative, 💅 while
supporting uninterrupted puzzling with or without internet connectivity. 📱 The puzzles themselves
will be tuned to match the techniques a human would actually use to solve them. 🤖🙅

**Current status:** M1 in progress: a server answers one route and a browser shows "Hello!"
rendered by the client, both locally.

## 🛠️ Running it

The commands for running, testing and checking it are in [`CONTRIBUTING.md`](CONTRIBUTING.md).

## 📖 Docs

While this is currently a personal project and not seeking contributions, feel free to follow along
with the system's evolving design and implementation choices, which are all documented:

- ⭐ [`docs/problem.md`](docs/problem.md) — who this is for, and what success will look like
- 👍 [`docs/guarantees/`](docs/guarantees/) — the promises made to players
- 🧱 [`docs/invariants/`](docs/invariants/) — what holds without exception, and what checks it; the
  sibling of the promises above, for the things a player would never see break but the system would
- 🤔 [`docs/questions/README.md`](docs/questions/README.md) — the queue of decisions needing to be made, grouped by the
  milestone each unblocks (start here if you want to know what's coming next)
- 🧭 [`docs/decisions/`](docs/decisions/) — the choices that have already been made, with their rationale,
  including why each was necessary, what options were rejected, and what trade-offs were accepted
- 🗺️ [`docs/architecture.md`](docs/architecture.md) — what talks to what, and how much of the system is
  still undecided (it's most of it)
- 📚 [`docs/README.md`](docs/README.md) — everything else: the constraints the platform imposes, the standards
  the project aims to uphold, and the known ways the system can fail, etc.
