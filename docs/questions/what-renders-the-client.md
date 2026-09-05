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

## What would settle it

Building the same non-trivial piece of the grid two ways — a cell that takes a digit, shows
pencil marks and highlights its peers — and comparing what the state layer looks like when the
board, its persistence and a deterministic merge all have to stay pure and testable with no
browser.

**It is answered together with
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md), and that
coupling was previously unrecorded here.** One of the candidate answers there is a meta-framework's
own server, which only exists if the renderer is that meta-framework; and picking a renderer that is
not one removes the option from the other side. Neither can be settled alone without deciding part of
the other by accident.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Demoted on 2026-08-31 from a record that chose the client's rendering approach, after research
contradicted the grounds on which it rejected its alternatives. That record was deleted, and the
number it held has since been reused, so it is named here rather than cited.

## Options

*Neither — the DOM directly.* No framework and no bundler. SudokuPad does this, and the findings
below record both why that is evidence and why it is weak evidence.

*A minimal library*, for binding state to the DOM without a component model.

*A component framework.* The candidate field, given
[ADR-0007](../decisions/0007-that-language-is-typescript.md), was React, Svelte, Solid, Vue
and Preact. The research below narrows it to **React, Preact and Svelte**: Solid and Vue are out on
their own merits, and Lit was considered and is out. React and Preact share a programming model, so
that shortlist is two comparisons rather than three.

*A framework for the shell with direct rendering for the board.* The pattern comparable projects
converge on, and a genuine fourth option rather than a blend of the others.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Comparable applications converge on a pattern the demoted record did not consider.** tldraw keeps React
and replaced its state layer wholesale. Excalidraw renders to canvas. Lichess's board component
states its rationale as minimising DOM writes. SudokuPad — Cracking the Cryptic's client, the
closest surface analogue that exists — uses no framework and no bundler at all. The recurring
shape is a framework for the shell with direct rendering for the board.

*Unverified — no source recorded.*

**That evidence is weaker than it first appears, and both halves should be recorded.** tldraw and
Excalidraw are infinite canvases with thousands of objects; Lichess is optimising animation during
blitz play; SudokuPad is one developer's decade-old codebase. None of them is this app, and none
of their reasons obviously transfers. What survives is that the split is a real option that a
serious project chose, not that it is correct here.

*Unverified — no source recorded.*

**The surviving argument for a framework is not rendering.** It is the dev server, the state-to-DOM
binding not being hand-maintained, and the ecosystem around the browser APIs this design leans on.
Those are real; they were just not the arguments the demoted record made.

**The risk the demoted record named about itself still stands.** The maintainer's existing strength in one
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

**Render performance is not a criterion.** The figures recorded here — 0.368ms to update a cell in an
81-cell React grid unmemoised, 0.185ms memoised so only two cells re-render, a saving of roughly one
percent of a frame — were tagged *Measured* with no method, and nothing is installed in this
repository, so no such run happened here.

The conclusion survives without them, which is why it is kept. An 81-cell grid updating one cell is
trivial work against [../constraints.md](../constraints.md)'s finding that client CPU and memory are
not constraints under any plausible data model for this app. So a faster framework buys something
this app cannot spend, and anything sold on rendering speed is selling the wrong thing. That holds by
arithmetic rather than by the numbers above.

*Reasoned — 2026-09-04, from the device constraint. The two figures are **unverified**: no method,
no hardware, no date, and no run in this repository that could have produced them.*

**Accessibility does not discriminate between them either.** No ecosystem ships an editable 2D
grid primitive: not React Aria, whose generic grid module is unexported and undocumented and
whose list component would announce a sudoku board as 81 rows of one cell, and not Zag, Kobalte,
Melt, Reka, Ark or Base UI. Every accessible sudoku found in the wild hand-rolled it. The realistic
cost is one to two hundred lines of ordinary TypeScript plus a day of screen-reader testing, and
it is the same work in every candidate. This removes what looked like the strongest reason to
prefer the largest ecosystem.

*Unverified — no source recorded.*

**Bundle size is a first-visit cost only, which halves its weight rather than removing it.** The
measured React-to-Preact difference is about 45KB brotli, roughly 300ms on a slow-4G profile, paid
once and then never again once the app shell is cached. [../constraints.md](../constraints.md)
establishes that cold-load size matters on a degraded link, so this is real — but it is one
payment against years of use, and it should not outrank anything structural.

*Unverified — no method, no date, and nothing installed here that could have been built and measured.
The direction is uncontroversial and the magnitude is not established. Re-measure it against the
actual bundle before letting it weigh on anything.*

**What actually separates them is where reactive state is allowed to live.** Vue and Preact
expose their reactive primitive as a standalone package that runs in plain TypeScript under
Node. Solid's is a runtime function. Svelte's runes are compiler syntax and only exist inside
files the Svelte compiler processes, so the store must be a `.svelte.ts` and testing it needs
the compiler. React has no reactive primitive outside a component at all, and instead requires a
bridge whose contract — an immutable snapshot, stable across calls — is exactly the discipline a
deterministic per-cell merge wants anyway. On the criterion this question weights highest,
React's constraint pushes in the right direction rather than the wrong one.

*Unverified — no source recorded.*

**Svelte's `$state` proxies cannot be written to IndexedDB directly**, because `structuredClone`
rejects proxies; the documented fix is one `$state.snapshot()` call at the persistence boundary.
Recorded because it lands on this app's hottest path. It does not discriminate between candidates,
though: Vue's `reactive()` has the identical problem, and the fix is one call in both.

*Unverified — no source recorded.*

**Solid is out on timing rather than design.** Solid 2.0 reached release candidate with the API
frozen and a thousand-line migration guide, no codemod and no compatibility shim, driven by one
person who authored over ninety percent of the commits on that branch. Choosing 1.x means
adopting a branch about to become legacy; choosing 2.0 means an RC. Neither suits a project
meant to run for years with little attention.

*Unverified — no source recorded.*

**Lit is out on tooling decay.** The only thing that type-checks its templates has not been
released since January 2024, and its useful rules are off by default. For a project whose whole
premise is a shared typed module, an unchecked string boundary in the view layer is the wrong
trade.

*Unverified — no source recorded.*

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

*Unverified — no source recorded.*

**Comparable applications converge on a pattern this question should notice.** Apps with this
app's persistence and sync shape — Excalidraw, tldraw, Actual Budget, Notesnook, Logseq — are
near-unanimously React with Vite, and tldraw notably kept React while replacing the state layer
entirely. Meanwhile the closest surface analogue, the Cracking the Cryptic sudoku client, uses
no framework and no bundler at all. Those are not in conflict: the recurring shape is a framework
for the shell with a purpose-built state layer and direct rendering for the board.

*Unverified — no source recorded.*
