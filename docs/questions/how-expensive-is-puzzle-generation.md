---
opened: 2026-08-30
status: open
resolves_into: constraint
---

# How expensive is puzzle generation?

## Why it matters

A claim that generation is cheap was carrying the argument that performance is irrelevant to
the language choice. It was never measured — see Findings — and the language decision currently
leans on it. Cost also decides whether puzzles can be generated on demand or must be produced
ahead of time, which shapes the whole content pipeline.

**This does not gate the language, despite the Blocks list below.** The concern was that
CPU-heavy generation might rule out a language that also runs in a browser.
[../problem.md](../problem.md) already settles it: the interactive path outranks batch throughput,
generation is separable and can be slow, and it never competes with a player mid-puzzle. A slow
generator is an accepted cost rather than a reason to add a second language, so
[which language the deployables share](../decisions/0005-typescript-across-every-deployable.md) can be decided
without this. What it does gate is whether puzzles are produced on demand or ahead of time, and the
shape of the content pipeline.

## What would settle it

Writing a generator for one variant in one language and timing it: fill, then clue removal with
a uniqueness check per candidate. Then the same with difficulty targeting, which is where the
cost is most likely to hide.

## Resolves into

[../constraints.md](../constraints.md).

## Source

The provenance audit of `constraints.md`, 2026-08-30. The claim this question replaces had been
imported from a brainstorming document and recorded as an established fact.

## Options

N/A — this resolves into a fact, not a choice.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

The legacy analysis asserted that "backtracking + uniqueness verification runs in milliseconds
on a JIT'd runtime (V8/JSC); plenty of production sudoku generators run this in-browser in plain
JS". No benchmark, no named generator, no measurement on any runtime. The document it appears in
says of itself: "Do not treat anything here as settled — it's the reasoning trail, not the
destination." It had been imported into `constraints.md` as an established fact; it has been
removed.

*Unverified — no source recorded.*

Three parts of the claim are separately unestablished. **Star battle** has a different constraint
structure, and the claim generalises across variants on no basis. **Difficulty targeting** means
generating until a puzzle lands in a target band, discarding the rest — a multiplier nobody
costed. **Technique-hierarchy grading** — naked singles, hidden pairs, X-wing — is more expensive
than uniqueness checking and is proposed in the same passage that calls generation cheap.

What is plausible: for 9×9 sudoku, generation is roughly one solver run per clue removal, so
order tens to hundreds of milliseconds per puzzle rather than seconds. "Milliseconds" understates
it. Nothing here is measured.

*Unverified — no source recorded.*

Two arguments in that passage don't depend on speed and survive regardless of the answer: a
second language means two implementations of the puzzle rules, and generation is batch work
nobody waits on. The second is itself an assumption rather than a decision — see
[are puzzles generated ahead of time or on demand](are-puzzles-generated-ahead-of-time-or-on-demand.md)
— so it can't carry weight until it's settled.

The opposite claim is on record and is equally unmeasured. Legacy ADR-02 expected generation to
be "CPU-bound: backtracking search, uniqueness verification", and made that the primary reason
for choosing a compiled backend. Neither side of this question has ever been measured; two
expectations pointing in opposite directions is what makes it a question rather than a settled
fact.

ADR-02 also claimed "grid/answer validation logic may also be perf-sensitive", which the
generation argument never addressed. It is ambiguous in a way worth resolving: validating a
player's entry against the rules is roughly 27 checks on a 9×9 grid and trivial, but if
"validation" means the solver behind hints or difficulty grading, the cost is a different order
entirely. The ADR doesn't say which it meant.

*Unverified — no source recorded.*

The CPU-bound expectation appears in more than one legacy ADR, but not independently. ADR-04
repeats ADR-02's premise rather than establishing it, and the compute-ceiling concern in the
hosting decision leans on the same assumption again. Several ADRs agreeing is not corroboration
when they all inherited the claim from one place.

Another unmeasured expectation, from the same family: building a sudoku generator in-house was
described as "a small, contained effort" because the algorithm is well understood, while star
battle was said to lack a single known algorithm. The asymmetry is plausible and neither half was
measured — and difficulty grading plus symmetric clue removal, both named as things a generator
should do, are exactly the parts that are not simple backtracking.
