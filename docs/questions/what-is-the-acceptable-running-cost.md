---
opened: 2026-08-30
status: open
resolves_into: decision
---

# What is the acceptable running cost, and is it a ceiling or a preference?

## Why it matters

Currently stated as not wanting to lose much money on this, which is a direction rather than a
number. A ceiling changes which platforms qualify; a preference doesn't. The two behave very
differently under a traffic spike.

## What would settle it

...

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**For choosing a host at M1, cost is a tie-breaker and not a ceiling, and free is strongly preferred
for roughly the first year, before real public use.** So cost rules no candidate out in
[where does this run?](where-does-this-run.md). It only separates candidates that no property
separates. This is a statement about the period before public use and does not answer this question,
which stays at M16.

*Sourced — stated by the maintainer, 2026-09-27.*

**A free tier that sleeps is already ruled out, whatever the preference.**
[ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md) forbids scale-to-zero on
the request path, so free counts only where it also stays running.
