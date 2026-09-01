# puzzles

A web app for solving grid logic puzzles — Sudoku, Star Battle and others — paired with a pipeline
that generates them.

It is built for playing in the gaps of a day: a commute, a queue, a waiting room. Those are exactly
where connectivity fails, so the app has to keep working with no network and must never lose work in
progress. And a grid puzzle is only worth solving if it has one solution reachable by reasoning
rather than guessing, which is a property the generator has to earn rather than assume.

## Status: no code yet, on purpose

There is nothing to install and nothing to run. The work so far is deciding what to build and in
what order, recorded in `docs/`.

That is not procrastination with a paper trail. An earlier version of this project chose its stack
from the outside in — hosting first, then a database, then a language — and each choice turned out
to rest on an assumption nobody had examined. Unwinding it is why the documentation is shaped the
way it is: every decision names what it derives from, and a decision whose inputs are not settled
gets written as a question instead.

## Reading it

- **`docs/problem.md`** — who this is for, and what would count as success.
- **`docs/questions/README.md`** — every decision still to be made, grouped by the milestone it
  blocks. Start here if you want to know what happens next.
- **`docs/decisions/`** — the choices already made, each with what forced it, what was rejected, and
  the risk being accepted.
- **`docs/README.md`** — everything else: the promises made to players, the constraints the platform
  imposes, and the ways this can fail.

`python3 scripts/check-docs.py` verifies that the documentation is internally consistent.

## Contributing

This is a personal project and not looking for contributions, but the documentation is public
because the process is the interesting part. If you are here for that, `docs/standards/decisions.md`
and `docs/decisions/README.md` describe how choices get made and recorded.
