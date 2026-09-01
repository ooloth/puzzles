---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Why was `problem.md` not read before prioritising, and what would stop it?

## Why it matters

On 2026-08-31 an agent was asked which questions this project should answer first, and produced a
dependency graph, a leverage ranking and three rounds of revision without reading
[../problem.md](../problem.md). That file answers the audience, the product shape, the priority
ranking between competing goals, and at least one question that was simultaneously being analysed
at length as though it were open.

The cost was several rounds of work and a diagram that was structurally upside-down. The cause is
worth naming, because prioritisation is exactly the task where skipping the problem statement is
both easiest and most expensive.

## Blocked by

N/A — nothing needs to be answered first.

## What would settle it

Identifying why the file was not reached, then making reaching it automatic for the class of task
that needs it.

Three candidate causes, all testable:

The routing table in [../README.md](../README.md) describes each doc by *subject*, so
`problem.md` reads as the place to look when the problem changes rather than as required reading
before reasoning about anything else. Nothing marks it as a prerequisite.

The agent's working context came from a summary of an earlier session, which recorded that the
file existed and not what it said. A file known to exist is easy to treat as already accounted
for.

Nothing in the repo distinguishes tasks that require the foundations from tasks that do not.
Editing a decision record does not need `problem.md`; deciding what to work on next cannot be done
without it, and no rule says so.

## Resolves into

A change to [../../CLAUDE.md](../../CLAUDE.md) or to the agent configuration described in
[../standards/README.md](../standards/README.md), depending on whether the fix is specific to this
project or portable.

## Source

Raised 2026-08-31 by the maintainer, after the omission was found by reading the file rather than
by any process catching it.

## Options

*A prerequisite rule.* Foundational or prioritisation work begins by reading `problem.md` and
`guarantees/` in full. Cheap, and it would have prevented this exactly.

*Mark the routing table.* Distinguish the two or three docs that are prerequisites from the ones
that are references, so the table says what to read first rather than only what is where.

*Put the answers where they are used.* If the conclusions in `problem.md` also existed as decision
records, an agent working from `decisions/` would meet them without having to know to look. This
overlaps with the layer of agreements never recorded as decisions.

*Nothing.* Treat it as a one-off. Rejected on the grounds that the same shape — a settled answer
living somewhere nobody was routed to — is what produced the entire re-analysis of cross-device
resume.

## Findings

**The subject-based routing table is the likeliest single cause**, and it is a portable failure
rather than a local one: an index that says what each document is about does not say which ones
have to be read before thinking.

**The information was not hidden.** `problem.md` is listed in the routing table, in `CLAUDE.md`,
and is one of the shortest files in the repo. Everything needed was one click away and clearly
labelled, which is what makes this worth analysing rather than dismissing as carelessness.
