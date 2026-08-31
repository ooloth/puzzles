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

## Blocked by

[Which component framework?](which-component-framework.md) — a rendering approach that ships a build
pipeline anyway changes what a styling toolchain costs.

## Blocks

N/A — nothing waits on this.

## What would settle it

Building the same non-trivial piece of the grid both ways and comparing what each costs to change
afterwards, since the interface is expected to be revised heavily rather than written once.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised while migrating legacy ADR-19, whose central argument no longer holds — see Findings.

## Options

*A utility framework.* A consistent design-token scale for spacing, colour and type off the shelf,
without hand-building one. Costs a build step and a discipline: scanners typically detect only
literal class-name strings, so any class assembled at runtime is invisible unless explicitly
listed.

*Hand-written CSS.* Fewer moving parts and no class-detection discipline. Leaves the token system
to be designed and maintained by hand, which is the part a solo maintainer without a designer is
least equipped to do well.

## Findings

**The previous decision's load-bearing argument has evaporated.** It chose a utility framework
substantially because a standalone binary meant no Node.js dependency anywhere, consistent with a
project that had no JavaScript toolchain at all. A local-first client has a JavaScript toolchain
by construction, so that reason is simply gone and the choice has to be re-argued on what remains.

**One claim in that argument is load-bearing and unevidenced.** It held that a utility framework
"wins for AI-assisted development specifically, since structured utility classes are more
predictable for an LLM to generate and edit than free-form CSS". Nothing supports this, and
[../problem.md](../problem.md) names the solo maintainer as a stakeholder for whom that working
mode matters — so it is one of the two reasons given, not a footnote. It is testable: make the
same interface change both ways and see which succeeds more reliably.

**A real trap, if a utility framework is chosen.** Scanners detect literal class-name strings by
reading source as text. A class built by concatenation or assembled from a variable is not
detected and its styles are silently absent from the output. The mitigation is discipline —
complete literal strings somewhere in source, or an explicit safelist — which means the failure
mode is a missing style rather than an error.
