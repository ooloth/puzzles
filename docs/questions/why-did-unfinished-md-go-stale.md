---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Why did `unfinished.md` go stale, and what would stop it?

## Why it matters

[../unfinished.md](../unfinished.md) calls itself the highest-consequence file in `docs/`, on the
grounds that an agent who misses it "sees two patterns, picks the dead one, and confidently
spreads it". On 2026-08-31 it read *nothing in flight* while three decision records were known to
be flawed and unamended. The file whose only job is to prevent a reader being misled was the file
misleading them.

That is worth analysing rather than just fixing, because the same failure will recur in whichever
file is next to depend on somebody remembering.

## Blocked by

N/A — nothing needs to be answered first.

## What would settle it

Identifying what makes this file different from the ones that stay current, then binding it to a
trigger rather than to memory.

The working hypothesis is that every other doc is updated *because the author is already editing
that area* — a constraint is recorded while researching constraints, a finding while working the
question. `unfinished.md` is the only one whose update is prompted by nothing except a global rule
somebody has to recall at the right moment. Its `update_when` says "the codebase enters or leaves
a state that would mislead someone reading it", which is a condition nobody is watching for,
because noticing it is the same act as fixing it.

A second contributor is worth testing: the file was written for code, and the misleading state
here was in documentation. An agent scanning for half-finished migrations may not recognise a
flawed decision record as the same category.

## Resolves into

A change to [../../CLAUDE.md](../../CLAUDE.md) or to the agent configuration described in
[../standards/README.md](../standards/README.md), depending on whether the fix is specific to this
project or portable.

## Source

Raised 2026-08-31, immediately after the staleness was found by reading the file rather than by
any process catching it.

## Options

*Bind it to the decision workflow.* The moment a record is found flawed, the entry lands in
`unfinished.md` in the same edit, before the fix is scheduled. Makes the trigger an event that
already has someone's attention.

*Bind it to the commit workflow.* A prompt before committing: does this change leave anything in a
state that would mislead the next reader. Catches more, costs something on every commit.

*Make it checkable.* Some mechanical signal — an amendment-pending marker in a record's
frontmatter that a check reconciles against `unfinished.md`. Only works for the cases that have a
marker.

*Accept it and read it first.* Do nothing structural, and make reading it part of orienting. Fails
the same way it just failed, since the file was accurate-looking rather than obviously empty.

## Findings

**The failure was silent in the specific way the file exists to prevent.** *Nothing in flight* is
indistinguishable from a genuinely clean tree. An empty section would have prompted a check; a
confident denial did not.

**It had been correct when written and was never wrong on purpose.** The entries it needed came
into existence gradually, each in a session focused on something else, which is exactly the
pattern that defeats a memory-based trigger.
