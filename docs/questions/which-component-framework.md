---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Which component framework?

## Why it matters

[ADR-0004](../decisions/0004-a-component-framework-renders-the-client.md) settled that one is
used; this picks it. It is the dependency the interface is written against for the life of the
project, and the interface is where nearly all the work happens.

It is also the decision most exposed to familiarity masquerading as reasoning, which ADR-0004
records as its own biggest risk. The measurement below exists to catch that.

## Blocked by

N/A — nothing needs to be answered first.

## Blocks

[How is the app styled?](how-is-the-app-styled.md) in part, and
[how is the codebase laid out?](how-is-the-codebase-laid-out.md).

## What would settle it

Building the same non-trivial piece of the grid in the two or three leading candidates: a cell
that takes a digit, shows pencil marks, and highlights its peers when selected. Then comparing
three things that can actually be observed rather than argued about.

**Save-to-visible-result time**, which is paid on every iteration for years.

**What the state layer looks like** when board state, local persistence and a deterministic merge
have to stay pure and testable without a browser — per
[ADR-0003](../decisions/0003-the-server-validates-puzzle-state-but-does-not-arbitrate-it.md). An
approach that makes it hard to keep that logic out of components is disqualifying regardless of
how the grid feels to use.

**What the same change costs in each** once written, since the interface is expected to be revised
heavily rather than written once.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split out of the rendering question by ADR-0004, which decided the class and deliberately left the
member open.

## Options

...

## Findings

Two criteria carried over from earlier analysis, both of which apply to any candidate.

**Escaping is the default rather than something opted into**, so the failure mode is a deliberate
opt-out visible in review rather than an omission nobody sees.

**Markup is validated when the code is built rather than when a page is served**, so a mistyped
element is a build error instead of a silently malformed page.

Both are in the portable standards described in [../standards/README.md](../standards/README.md);
they are recorded here because they are properties to test candidates against rather than things
to remember later.
