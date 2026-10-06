---
opened: 2026-08-31
status: open
resolves_into: decision
---

# How is the app styled?

## Why it matters

A bespoke puzzle grid built by one person with no designer needs a consistent scale for spacing,
colour and type, and that scale either comes from somewhere or gets invented one value at a time.
The choice also decides whether a build step exists purely for CSS, and how much of the interface
can be changed without touching markup.

## What would settle it

Building the same non-trivial piece of the grid both ways and comparing what each costs to change
afterwards, since the interface is expected to be revised heavily rather than written once.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised while migrating legacy ADR-19, which chose a utility framework.

## Options

*A utility framework.* A consistent design-token scale for spacing, colour and type off the shelf,
without hand-building one. Costs a build step and a discipline: scanners typically detect only
literal class-name strings, so any class assembled at runtime is invisible unless explicitly
listed.

*Hand-written CSS.* Fewer moving parts and no class-detection discipline. Leaves the token system
to be designed and maintained by hand, which is the part a solo maintainer without a designer is
least equipped to do well.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A utility framework adds no Node.js dependency here.** The client has a JavaScript toolchain by
construction, so the choice rests on the two arguments below and on what the framework costs to
change, not on avoiding a toolchain.

**Whether a utility framework suits AI-assisted development is unevidenced.** The legacy decision
held that a utility framework "wins for AI-assisted development specifically, since structured
utility classes are more predictable for an LLM to generate and edit than free-form CSS". Nothing
supports this, and [../problem.md](../problem.md) names the solo maintainer as a stakeholder for
whom that working mode matters. It is testable: make the same interface change both ways and see
which succeeds more reliably.

**A real trap, if a utility framework is chosen.** Scanners detect literal class-name strings by
reading source as text. A class built by concatenation or assembled from a variable is not
detected and its styles are silently absent from the output. The mitigation is discipline —
complete literal strings somewhere in source, or an explicit safelist — which means the failure
mode is a missing style rather than an error.

*Unverified — no source recorded.*
