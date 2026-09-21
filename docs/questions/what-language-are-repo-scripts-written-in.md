---
opened: 2026-09-03
status: answered
resolves_into: decision
---

# What language are repo scripts written in?

**Scoped to scripts that support the repository** — checks, lint helpers, one-off maintenance tasks.
Not the deployables, which are settled by
[ADR-0006](../decisions/0006-one-language-across-every-deployable.md) and
[ADR-0007](../decisions/0007-that-language-is-typescript.md). Not what runs them on every change,
which is [what runs the checks on every change?](what-runs-the-checks-on-every-change.md).

## Why it matters

**A record settles it, and not the one a reader would expect.**
[ADR-0006](../decisions/0006-one-language-across-every-deployable.md) covers "every deployable in this
project" and a check script is not a deployable, so its letter does not reach here. The record that
does reach here is
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md), which says every repo
script runs on Node.

**That record's reasoning points the same way its letter does not.** [ADR-0006](../decisions/0006-one-language-across-every-deployable.md)'s stated reason is "a second
toolchain for one maintainer, not a technical incompatibility", and its **Revisit when** names "a
deployable that would not add one" as outside its scope. A script in a second language is exactly the
second toolchain that record exists to avoid.

**The repository still contains the thing both arguments rule out.** `scripts/check-docs.py` is
Python. That is now a known violation of a settled record rather than an open question, and it is
work rather than a decision.

## What would settle it

**Settled by [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md)**, whose
Decision reads "the server, the generator and every repo script run on Node. That is the whole of
it." Node runs the language [ADR-0007](../decisions/0007-that-language-is-typescript.md) chose, so
repo scripts are TypeScript and the Python and shell options below are foreclosed.

**What that creates is work rather than a further question.** `scripts/check-docs.py` is Python, so
it is now the one artifact in the repository contradicting a settled record. Rewriting it is an M2
job, tracked against
[what runs the checks on every change?](what-runs-the-checks-on-every-change.md), and
[../unfinished.md](../unfinished.md) carries the warning until it lands.

**The cost the options below name is real and was accepted rather than overlooked.** A Python checker
runs on a bare machine with nothing installed; a TypeScript one cannot run until the toolchain is
installed, which means the documentation checks stop being available before an install. That is a
consequence of [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md), and
whoever rewrites the checker meets it on the day.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-03, when considering whether `scripts/check-docs.py` should become a `uv` single-file
script and finding that the prior question — what language it should be in at all — was tracked
nowhere. The maintainer's stated presumption is TypeScript, to match the rest of the repository. This
file exists so that presumption is argued rather than assumed, since no record currently carries it.

## Options

*TypeScript, matching the deployables.* **Chosen, by consequence of
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md).** One toolchain, one set
of habits, one dependency story, and the option of importing real types where a script wants them.
Ties every check to the runtime, including the documentation checks that currently run before
anything is installed.

*Python, as today.* **Foreclosed.** It needs no runtime this project chose, which is exactly why the
existing checker could be wired up before the stack was, and it keeps the second toolchain
[ADR-0006](../decisions/0006-one-language-across-every-deployable.md)'s reasoning argues against.

*Shell.* **Foreclosed.** For scripts that only orchestrate other commands it adds no toolchain at
all, and it stops being reasonable the moment a script needs to parse anything. `check-docs.py`
parses markdown.

*Whatever each script needs, decided per script.* **Foreclosed**, and it is the state the repository
is in today by default rather than by choice.

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
