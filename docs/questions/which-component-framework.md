---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Which component framework?

## Why it matters

[What renders the client?](what-renders-the-client.md) proposes a component framework; this
picks which one, and only matters if that resolves that way. It is the dependency the interface
is written against for the life of the project, and the interface is where nearly all the work
happens.

It is also the decision most exposed to familiarity masquerading as reasoning, which the
rendering question records as its own biggest risk. The measurement below exists to catch that.

## Blocked by

[What renders the client?](what-renders-the-client.md), which decides whether a component
framework is used at all, and
[which language do the deployables share?](which-language-do-the-deployables-share.md), which
decides whether the candidate set is the TypeScript field.

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
[what the server does with puzzle state](what-does-the-server-do-with-puzzle-state.md). An
approach that makes it hard to keep that logic out of components is disqualifying regardless of
how the grid feels to use.

**What the same change costs in each** once written, since the interface is expected to be revised
heavily rather than written once.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split out of the rendering question, which proposed the class and deliberately left the member
open.

## Options

The TypeScript field, if
[the language question](which-language-do-the-deployables-share.md) resolves that way. React,
Svelte, Solid, Vue and Preact were the plausible candidates.

Narrowed by the research below to **React, Preact and Svelte**. Solid and Vue are out on their
own merits; Lit was considered and is out. React and Preact are the same programming model, so
the shortlist is really two comparisons rather than three.

## Findings

Two criteria carried over from earlier analysis, both of which apply to any candidate.

**Escaping is the default rather than something opted into**, so the failure mode is a deliberate
opt-out visible in review rather than an omission nobody sees.

**Markup is validated when the code is built rather than when a page is served**, so a mistyped
element is a build error instead of a silently malformed page.

**Framework micro-benchmarks are not a criterion at this scale.** A previous decision leaned on a
10-15% throughput difference between two web frameworks while conceding in the same breath that it
did not matter. Whatever separates these candidates, it will not be that.

The first two are in the portable standards described in [../standards/README.md](../standards/README.md);
they are recorded here because they are properties to test candidates against rather than things
to remember later.

---

Researched 2026-08-31. Four independent investigations, two of which disagreed with each other
in useful ways.

**Render performance is not a criterion, and now there is a number.** Updating a cell in an
81-cell React grid with no memoisation at all measured 0.368ms; memoising so only two cells
re-render measured 0.185ms. The saving is roughly one percent of a frame. This retires the
micro-benchmark point above from a suspicion to a measurement, and it kills two arguments at
once — that a faster framework is worth choosing here, and that React's compiler is needed. It
also means anything sold on rendering speed is selling something this app cannot spend.

**Accessibility does not discriminate between them either.** No ecosystem ships an editable 2D
grid primitive: not React Aria, whose generic grid module is unexported and undocumented and
whose list component would announce a sudoku board as 81 rows of one cell, and not Zag, Kobalte,
Melt, Reka, Ark or Base UI. Every accessible sudoku found in the wild hand-rolled it. The realistic
cost is one to two hundred lines of ordinary TypeScript plus a day of screen-reader testing, and
it is the same work in every candidate. This removes what looked like the strongest reason to
prefer the largest ecosystem.

**Bundle size is a first-visit cost only, which halves its weight rather than removing it.** The
measured React-to-Preact difference is about 45KB brotli, roughly 300ms on a slow-4G profile, paid
once and then never again once the app shell is cached. [../constraints.md](../constraints.md)
establishes that cold-load size matters on a degraded link, so this is real — but it is one
payment against years of use, and it should not outrank anything structural.

**What actually separates them is where reactive state is allowed to live.** Vue and Preact
expose their reactive primitive as a standalone package that runs in plain TypeScript under
Node. Solid's is a runtime function. Svelte's runes are compiler syntax and only exist inside
files the Svelte compiler processes, so the store must be a `.svelte.ts` and testing it needs
the compiler. React has no reactive primitive outside a component at all, and instead requires a
bridge whose contract — an immutable snapshot, stable across calls — is exactly the discipline a
deterministic per-cell merge wants anyway. On the criterion this question weights highest,
React's constraint pushes in the right direction rather than the wrong one.

**Svelte's `$state` proxies cannot be written to IndexedDB directly**, because `structuredClone`
rejects proxies; the documented fix is one `$state.snapshot()` call at the persistence boundary.
Recorded because it lands on this app's hottest path, and qualified because Vue's `reactive()`
has the identical problem — an early draft of this comparison eliminated Svelte for it while
clearing Vue, which was not a defensible reading. A second claim in that draft, that renaming a
symbol from a `.ts` file corrupts `.svelte` files, was a garbled retelling of an editor bug the
maintainer could not reproduce. **Svelte was provisionally eliminated on bad grounds and is
reinstated.** Whether it wins is a separate matter; being wrongly excluded is the kind of error
this question exists to catch.

**Solid is out on timing rather than design.** Solid 2.0 reached release candidate with the API
frozen and a thousand-line migration guide, no codemod and no compatibility shim, driven by one
person who authored over ninety percent of the commits on that branch. Choosing 1.x means
adopting a branch about to become legacy; choosing 2.0 means an RC. Neither suits a project
meant to run for years with little attention.

**Lit is out on tooling decay.** The only thing that type-checks its templates has not been
released since January 2024, and its useful rules are off by default. For a project whose whole
premise is a shared typed module, an unchecked string boundary in the view layer is the wrong
trade.

**Vue has no disqualifier and no advantage here.** Recorded because "nothing is wrong with it" is
a finding, and because absence of a reason to choose something is easy to mistake for absence of
analysis.

**The live differentiator is maintenance concentration, not any technical property.** Preact is
close to a single maintainer — one person authored the large majority of its commits over the
past year, and its founder has not committed to core since mid-2025 — against React now governed
by a foundation with multiple funders. For a solo maintainer on a multi-year horizon this
outweighs the bundle difference above, which is the only measured advantage Preact has. Preact
also carries a long-open defect where a checked input is treated as uncontrolled, which is
precisely the shape of an 81-cell board with locked givens.

**Comparable applications converge on a pattern this question should notice.** Apps with this
app's persistence and sync shape — Excalidraw, tldraw, Actual Budget, Notesnook, Logseq — are
near-unanimously React with Vite, and tldraw notably kept React while replacing the state layer
entirely. Meanwhile the closest surface analogue, the Cracking the Cryptic sudoku client, uses
no framework and no bundler at all. Those are not in conflict: the recurring shape is a framework
for the shell with a purpose-built state layer and direct rendering for the board. It is worth
weighing against
[what renders the client?](what-renders-the-client.md), which is where that option belongs.
