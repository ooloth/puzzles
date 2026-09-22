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
under `docs/` resolves and that every question is referenced from the milestone list. It is plain Python
with no dependencies, so it presupposes nothing about the runtime and could be wired up before that
is settled — as a commit hook, as a CI step, or both.

That it is not wired up is the point rather than an oversight: a check nobody runs is a check that
does not exist, and this question is where that gets fixed. It is also a useful concrete case for
answering it, since it needs to run on documentation rather than on code and therefore has to work
before anything is installed.


**Two of the checks this has to run are already specified, and they are unequal.**
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
commits to a syntax check over built output and an API check over source, both reading one shared
declaration of the floor. That record leaves the declaration's format open, and it is decided at
[what format declares the browser floor?](what-format-declares-the-browser-floor.md). The syntax check is a parse at a stated level, so it succeeds or fails with no
judgement in between. The API check is static analysis that does not follow an aliased or computed
global, does not read dependencies, and by default ignores usage inside a feature-detection guard. So
whatever runs them must not present their results as equivalent: one is evidence and the other is a
weak signal.

*Sourced — [github.com/yowainwright/es-check](https://github.com/yowainwright/es-check) (9.7.1,
published 2026-09-08) and
[github.com/amilajack/eslint-plugin-compat](https://github.com/amilajack/eslint-plugin-compat) (7.0.2,
published 2026-04-29), read 2026-09-12 by a research agent and not opened here. This field is
perishable and the versions carry the date they were checked.*

**The syntax check runs on built output rather than on source**, which means it cannot be a
pre-commit hook over changed files the way a linter can. It needs a build to have happened, so
whatever answers this question has to accommodate a check whose input is an artifact.

**The documentation checks are not hypothetical.** Manual link and index checks during this
repo's documentation work caught a dangling pointer to a deleted file, an index that had drifted
from its folder, and a rewrite that produced a three-hundred-character line. All three would have
been caught by a script that takes seconds to run.

**If the checker stays Python, a PEP 723 header would pin its interpreter.** `uv run` fetches and
manages the interpreter itself, so the check runs identically on a machine with no Python or the
wrong Python. The header is a comment block, so `python3 scripts/check-docs.py` keeps working
unchanged — it is additive rather than a switch, which is what makes it cheap.

**Its value only lands once something automated runs the check**, which is what this question decides.
A pinned interpreter buys nothing while the only caller is a person typing the command on the machine
where it already works. So this is worth adopting alongside an answer here rather than ahead of one.

**It is downstream of a question that did not exist until now.**
[What language are repo scripts written in?](what-language-are-repo-scripts-written-in.md) asks
whether the checker should be Python at all, and if the answer is TypeScript this option disappears
rather than being rejected. Considering the `uv` version first would be choosing between Pythons in a
repository that has not decided it wants one.

**`actions/setup-node` caches all three package managers, and pnpm has an ordering requirement.**
Its supported `cache` values are npm, yarn and pnpm. For pnpm the setup action that installs it has
to run *before* `actions/setup-node`, because `setup-node`'s cache step shells out to the pnpm
binary. Getting the order wrong is a failing workflow rather than a silent miss, so it is a
first-run annoyance rather than a hazard.

This matters here because [ADR-0032](../decisions/0032-the-package-manager-is-pnpm.md) settled the
package manager on pnpm, and the runner this question chooses is the second of the machines
[what pins the toolchain versions across machines?](what-pins-the-toolchain-versions-across-machines.md)
has to make agree.

*Sourced — the `actions/setup-node` README and pnpm's own action README, read 2026-09-19 by a
research agent. I did not open either.*

**Type-aware linting and a current TypeScript cannot both be installed, and pinning TypeScript is
the cheap way out.** [../constraints.md](../constraints.md) carries the fact. What it means here is
that the type-aware rules are worth more than the newer compiler: 7.x exists to check large
codebases faster, and a few thousand lines will not notice, so pinning TypeScript to 6.x costs this
project nothing it would have used. The alternatives are worse for stated reasons — running 7.x for
the type check and a pinned 6.x for the lint step is two versions to keep in step for no gain here,
linting without type information gives up the rules worth having, and deferring type-aware linting
leaves the check this milestone exists to build half-made.

That makes it a pin with an expiry rather than a standing choice, so whichever record settles this
says what lifts it: `typescript-eslint` accepting a 7.x peer.

**This question also owes a check to an invariant.**
[No package imports what it does not declare](../invariants/no-package-imports-what-it-does-not-declare.md)
is enforced today only by pnpm's default linker, and a single line in `pnpm-workspace.yaml` would
withdraw it with nothing reporting. The check it needs is that a known transitive dependency is
unreachable from a package that has not declared it, and this is where its runner gets decided.
