---
opened: 2026-09-02
status: open
resolves_into: decision
---

# What deploys the code?

## Why it matters

M1 is a *deployed* skeleton, so something has to move a build from a laptop to the running host, and
nothing currently says what. The three questions that sit closest all assume a deploy happens without
asking what performs it: [where does this run?](where-does-this-run.md) prices platforms,
[what runs the checks on every change?](what-runs-the-checks-on-every-change.md) is scoped to what
must hold before a change is committed, and
[how is a bad deploy noticed and undone?](how-is-a-bad-deploy-noticed-and-undone.md) takes the deploy
as a given event and asks what happens around it.

It matters beyond M1 for one reason. Whether checks gate a deploy is decided here, not in the checks
question — a suite that runs on a branch and a deploy triggered by hand are independent, and a solo
maintainer with no reviewer is exactly the case where "I will run them first" and "they ran" come
apart. [ADR-0001](../decisions/0001-decisions-live-in-docs-and-work-lives-in-issues.md) makes the
same argument about intentions needing a mechanism.

The reversal cost is low, which is worth saying plainly: this is not in the class of choices that are
expensive to undo, and it should not be researched as though it were.

## What would settle it

Naming what has to be true at the moment of a deploy — whether anything must be built, whether checks
must have passed, and whether the person deploying has to be at their own machine — and then choosing
the least machinery that delivers it. Most of it falls out of the host, since several candidate
platforms ship their own git integration and adopting it is free.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02, on finding that M1's definition is a deployed skeleton and no question in this
folder covered the mechanism that deploys it.

## Options

*A command run by hand.* The dumbest thing that works, and it works from the first day with no
configuration. Deploys are whatever the maintainer's machine happened to contain, they cannot happen
when that machine is not present, and nothing enforces that checks ran.

*The platform's own git integration.* Push to a branch, the platform builds and deploys. Nothing to
maintain and nothing that could go wrong in a way that is ours, at the cost of a build environment
described by the vendor rather than by us — which bears on
[how is the app run locally the way it runs deployed?](how-is-the-app-run-locally-the-way-it-runs-deployed.md).

*A pipeline we define, triggered by a push or a merge.* The same trigger with the build steps written
down, so the deployed artifact is reproducible and checks can gate it. More configuration, and a
second environment whose drift from the local one is a real failure mode.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A check that does not gate anything is a check nobody runs.**
[What runs the checks on every change?](what-runs-the-checks-on-every-change.md) records that
`scripts/check-docs.py` exists and nothing runs it, and treats that as the shape of the whole
problem rather than an oversight. Whether this question's answer is where that gate lives, or whether
the gate sits earlier at commit time, is the one real interaction between the two.

**This is not the same question as reproducing the deployed environment locally.** They are commonly
answered by one tool and they are separable: a hand-run deploy of a container image built locally
gives strong parity with no pipeline, and a hosted pipeline building from a vendor buildpack gives a
pipeline with weak parity. See
[how is the app run locally the way it runs deployed?](how-is-the-app-run-locally-the-way-it-runs-deployed.md).

**Nothing about M1 requires secrets.** The milestone is a hard-coded response with no database, so
there is nothing to inject and no secret handling to design. That becomes real at M3 and should not
be built before then.

*Reasoned — from M1's definition in [README.md](README.md).*
