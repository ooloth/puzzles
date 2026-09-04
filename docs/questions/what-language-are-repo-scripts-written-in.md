---
opened: 2026-09-03
status: open
resolves_into: decision
---

# What language are repo scripts written in?

**Scoped to scripts that support the repository** — checks, lint helpers, one-off maintenance tasks.
Not the deployables, which are settled by
[ADR-0006](../decisions/0006-one-language-across-every-deployable.md) and
[ADR-0007](../decisions/0007-that-language-is-typescript.md). Not what runs them on every change,
which is [what runs the checks on every change?](what-runs-the-checks-on-every-change.md).

## Why it matters

**No record settles it, and it is easy to believe one does.**
[ADR-0006](../decisions/0006-one-language-across-every-deployable.md) covers "every deployable in this
project" and a check script is not a deployable, so its letter does not reach here. Adopting
TypeScript for scripts by assuming that record covers them would be a real choice resting on an
unrecorded inference, which is the failure the portable decision-making standard names first.

**Its reasoning does reach here, and it argues in the same direction the letter does not.** That
record's stated reason is "a second toolchain for one maintainer, not a technical incompatibility",
and its **Revisit when** names "a deployable that would not add one" as outside its scope. A script in
a second language is exactly the second toolchain the record exists to avoid — so the argument
applies while the rule does not.

**The repository already has the thing that argument warns about.** `scripts/check-docs.py` is
Python. So this question is not hypothetical tidying: it asks whether that was a mistake, an
exception worth keeping, or the start of a pattern.

## What would settle it

Naming what each option costs on the factors below, once M1's runtime is known. It is deliberately at
M2 rather than M1: a script language chosen before
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md) would be
choosing a toolchain before knowing what the repository already has.

The factors that could matter, none of which is obviously decisive yet:

- **What a contributor or agent must install to run a check.** Today `python3 scripts/check-docs.py`
  needs nothing that is not already on a developer machine. A TypeScript script needs whatever M1
  chooses, which is a larger prerequisite before anything is installed.
- **What the continuous integration image already carries.** If M1 lands on Bun or Deno, the natural
  base image is a JavaScript runtime image and Python becomes an extra layer. If it lands on Node, the
  same holds.
- **Whether a script ever wants to share types with the application.** A script that reads the store,
  validates a puzzle, or asserts something about a data shape benefits from importing the real types.
  A script that reads markdown does not, and `check-docs.py` is the second kind.
- **What happens the first time a script wants a dependency.** This is where a single-file script
  stops being free in either language, and it is worth deciding the answer before it happens rather
  than after.
- **Startup cost, since these run on every commit** if
  [what runs the checks on every change?](what-runs-the-checks-on-every-change.md) puts them in a
  hook.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-03, when considering whether `scripts/check-docs.py` should become a `uv` single-file
script and finding that the prior question — what language it should be in at all — was tracked
nowhere. The maintainer's stated presumption is TypeScript, to match the rest of the repository. This
file exists so that presumption is argued rather than assumed, since no record currently carries it.

## Options

*TypeScript, matching the deployables.* One toolchain, one set of habits, one dependency story, and
the option of importing real types where a script wants them. Ties every check to M1's runtime,
including the documentation checks that currently run before anything is installed.

*Python, as today.* Needs no runtime this project chose, which is exactly why the existing checker
could be wired up before the stack was. Keeps a second toolchain that
[ADR-0006](../decisions/0006-one-language-across-every-deployable.md)'s reasoning argues against, and
its cost is invisible until somebody without a working Python tries to run a check.

*Shell.* Worth listing rather than assuming away: for scripts that only orchestrate other commands it
adds no toolchain at all. It stops being reasonable the moment a script needs to parse anything, and
`check-docs.py` parses markdown.

*Whatever each script needs, decided per script.* The honest "not yet", and the state the repository
is in today by default rather than by choice. Cheap until there are five scripts in three languages.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The existing checker deliberately depends on nothing.** Its own docstring records that it "needs no
runtime of its own, so it can be wired up before the stack is chosen". That property is real and is
the strongest argument for the status quo — and it expires the moment M1 lands, because after that the
repository has a runtime and the argument for a second one is weaker.

**A rewrite would not be large.** The script is plain standard library — `os`, `re`, `sys` — with no
dependencies, so this is a question about which toolchain the repository wants rather than about
migration cost.

**One thing to check before deciding, not yet done.** Whether the checks need to run in an environment
where the application's runtime is unavailable — a documentation-only contribution, a pre-commit hook
on a machine mid-setup, an agent working before `install` has been run. If that case is real the
answer changes; if it is not, it is one toolchain against two.
