---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What runs the checks on every change?

## Why it matters

The portable standards referenced from [../standards/README.md](../standards/README.md) ask that
the build produce no warnings at the strictest settings, and that mistakes the toolchain could
catch are caught by it. Neither is true of a project where the checks exist but nobody runs them,
and for a solo maintainer with no reviewer, automation is the only thing standing between a
standard and a good intention.

[../verification.md](../verification.md) is currently a stub. Whatever answers this fills it.

## What would settle it

Listing what must hold before a change is committed, then deciding which of those a machine can
assert. Type checking, formatting, linting and the test suite are the obvious four. Two less
obvious ones are worth considering because this repo has already needed them by hand: that no
document links to a file that does not exist, and that the question index matches the folder.

Then where they run — before a commit, on a branch, or both — which is a question about how much
latency is tolerable on each iteration.

## Resolves into

A decision record in [../decisions/](../decisions/), and content in
[../verification.md](../verification.md).

## Source

Raised 2026-08-31, filling in the stack decisions that had no question of their own. The link and
index checks were prompted by having run both manually during documentation work and finding real
breakage each time.

## Options

*A hosted continuous integration service.* GitHub Actions or similar. Runs on every push,
independent of anyone's machine, and adds minutes to the loop.

*Local hooks only.* Fast, and skippable — which for a solo maintainer means eventually skipped.

*Both, with different contents.* Fast checks before a commit, the full suite on a branch. More
configuration, and the arrangement most likely to survive contact with a bad day.

*A task runner as the single entry point*, so the same command runs locally and remotely and the
two cannot drift. Compatible with all of the above and probably a prerequisite rather than an
alternative.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**One check already exists and nothing runs it.** `scripts/check-docs.py` verifies that every link
under `docs/` resolves and that every question appears in exactly one milestone. It is plain Python
with no dependencies, so it presupposes nothing about the runtime and could be wired up before that
is settled — as a commit hook, as a CI step, or both.

That it is not wired up is the point rather than an oversight: a check nobody runs is a check that
does not exist, and this question is where that gets fixed. It is also a useful concrete case for
answering it, since it needs to run on documentation rather than on code and therefore has to work
before anything is installed.


**The documentation checks are not hypothetical.** Manual link and index checks during this
repo's documentation work caught a dangling pointer to a deleted file, an index that had drifted
from its folder, and a rewrite that produced a three-hundred-character line. All three would have
been caught by a script that takes seconds to run.
