---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What renders the client?

## Why it matters

No promise in [../guarantees/](../guarantees/) eliminates any of the options below: all of them
can render an 81-cell grid, hold state locally and work offline. That makes this a weaker
question than the ones above it, and means the rejected options stay genuinely live rather than
formally acknowledged.

This asks both halves at once — framework, minimal library or neither, **and which one**. Nothing
downstream turns on answering the class alone, and scaffolding needs the member, so separating them
would mean deciding the same thing twice.

## Blocked by

The platform half is settled:
[ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md) chose web delivery, so this is a
question about what renders in a browser.

Still [is the client served as static files?](is-the-client-served-as-static-files.md), which
decides whether server rendering is in the field at all.

## What would settle it

Building the same non-trivial piece of the grid two ways — a cell that takes a digit, shows
pencil marks and highlights its peers — and comparing what the state layer looks like when the
board, its persistence and a deterministic merge all have to stay pure and testable with no
browser.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Demoted from ADR-0004 on 2026-08-31, after research contradicted the grounds on which it rejected
its alternatives.

## Options

*Neither — the DOM directly.* No framework and no bundler. SudokuPad does this, and the findings
below record both why that is evidence and why it is weak evidence.

*A minimal library*, for binding state to the DOM without a component model.

*A component framework.* The candidate field, given
[ADR-0005](../decisions/0005-typescript-across-every-deployable.md), was React, Svelte, Solid, Vue
and Preact. The research below narrows it to **React, Preact and Svelte**: Solid and Vue are out on
their own merits, and Lit was considered and is out. React and Preact share a programming model, so
that shortlist is two comparisons rather than three.

*A framework for the shell with direct rendering for the board.* The pattern comparable projects
converge on, and a genuine fourth option rather than a blend of the others.

## Findings

**Comparable applications converge on a pattern ADR-0004 did not consider.** tldraw keeps React
and replaced its state layer wholesale. Excalidraw renders to canvas. Lichess's board component
states its rationale as minimising DOM writes. SudokuPad — Cracking the Cryptic's client, the
closest surface analogue that exists — uses no framework and no bundler at all. The recurring
shape is a framework for the shell with direct rendering for the board.

**That evidence is weaker than it first appears, and both halves should be recorded.** tldraw and
Excalidraw are infinite canvases with thousands of objects; Lichess is optimising animation during
blitz play; SudokuPad is one developer's decade-old codebase. None of them is this app, and none
of their reasons obviously transfers. What survives is that the split is a real option that a
serious project chose, not that it is correct here.

**The surviving argument for a framework is not rendering.** It is the dev server, the state-to-DOM
binding not being hand-maintained, and the ecosystem around the browser APIs this design leans on.
Those are real; they were just not the arguments ADR-0004 made.

**The risk ADR-0004 named about itself still stands.** The maintainer's existing strength in one
ecosystem is a legitimate cost input and never a merit, and this is the decision most likely to be
familiarity wearing a reason's clothes.

Two criteria carried over from earlier analysis, both of which apply to any candidate.

**Escaping is the default rather than something opted into**, so the failure mode is a deliberate
opt-out visible in review rather than an omission nobody sees.

**Markup is validated when the code is built rather than when a page is served**, so a mistyped
element is a build error instead of a silently malformed page.

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
