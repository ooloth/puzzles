---
opened: 2026-09-23
status: open
resolves_into: decision
---

# How is the questions index kept readable in one pass?

## Why it matters

[README.md](README.md) holds the order every question is worked in and the rule for when a slice
gets an issue, and [../README.md](../README.md) sends a new reader straight to it. It is 941 lines
and about 73KB. An agent reading it cold had a plain read refused as too large, and a second read
stopped at line 788, before the section saying when an issue is filed. The agent believed it had
read the governing document and had not. The file grows with every milestone that gets planned, so
this gets worse without anyone deciding it should.

## What would settle it

A structure where the file an agent is sent to fits in one read, and a check that fails when it
stops fitting. The check matters more than the split: a split with nothing enforcing it drifts back.

## Resolves into

A decision record in [../decisions/](../decisions/), and a size check in `scripts/check-docs.py` or
whatever replaces it.

## Source

Raised 2026-09-23 by a handoff check, whose cold-read agent was truncated partway through the file.

## Options

*One file per milestone.* The index keeps the milestone list and links out. Each milestone's file is
small, and the one being worked is the only one a session needs.

*Move the conventions out.* The sections on building a milestone's list, the tracker, housekeeping and
what goes in a question file are about a third of the file and change rarely. They could live in
their own file, leaving the ordering.

*A size cap alone.* `check-docs.py` fails above a line or byte count, and the split is chosen when
the cap is first hit.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The truncation is measured.** A cold-read subagent on 2026-09-23 reported "Output too large
(72.9KB)" from `cat` and a `Read` cut off at 788 of 941 lines. The `/next` skill already works around
this by grepping for the filing rule instead of reading the file.
