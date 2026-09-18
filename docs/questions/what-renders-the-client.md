---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What renders the client?

## Why it matters

One promise eliminates one class, and the rest of the field survives it. [Input registers without
waiting for the network](../guarantees/input-registers-without-waiting-for-the-network.md), read
alongside [ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md), rules out the
hypermedia class, whose state lives on the server and whose every update crosses the network.
Everything else can render an 81-cell grid, hold state locally and work offline, so the promises do
not separate them and the options below stay genuinely live rather than formally acknowledged.

This asks both halves at once — framework, minimal library or neither, **and which one**. Nothing
downstream turns on answering the class alone, and scaffolding needs the member, so separating them
would mean deciding the same thing twice.

## What would settle it

Building the same non-trivial piece of the grid two ways — a cell that takes a digit, shows
pencil marks and highlights its peers — and comparing what the state layer looks like when the
board, its persistence and a deterministic merge all have to stay pure and testable with no
browser.

**It is answered together with
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md).** One of
the candidate answers there is a meta-framework's
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
and Preact. **Nothing in this class is currently eliminated.** The 2026-08-31 research dropped Solid
on timing and Lit on tooling decay; the 2026-09-17 verification pass found Lit's disqualifier false
and returned it to the field, and found Solid's facts sound but resting on a threshold no document
sets. Both eliminations wait on
[what must a dependency's stewardship satisfy?](what-must-a-dependencys-stewardship-satisfy.md).
**Vue is not dropped**: the findings record that it has no disqualifier and no advantage, which is a
reason to leave it in the field rather than to narrow it out. React and Preact share a programming
model, so comparing them is one comparison rather than two.

*A meta-framework.* SvelteKit, Astro, TanStack Start, Nuxt, Next, Remix and the rest of the class
build the client bundle, produce the entry document and can answer HTTP from one project.
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) binds
how the entry document is produced and says plainly that it does not exclude this class: prerendering
the document while serving API routes from the same process is a supported configuration in several
of them. Choosing one is also choosing the answer to
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md), which is the
coupling described under **What would settle it**. The findings below were gathered against a field
that did not contain this class, so none of their eliminations reach it.

*A framework for the shell with direct rendering for the board.* The pattern comparable projects
converge on, and a genuine fourth option rather than a blend of the others.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The field was rebuilt from registries on 2026-09-16, and it is far larger than five.** The
js-framework-benchmark repository carries 175 implementation folders under `frameworks/keyed` and 66
under `frameworks/non-keyed`. The State of JS 2025 roster names React, Vue, Angular, Preact, Svelte,
Alpine, Lit, Solid, Qwik, Stencil and htmx, with Astro, Ember, Ripple, TanStack Start, Elm, Nuxt,
Remix, Next, Aurelia and jQuery under "other". Thirty-eight distinct base projects were profiled
across the four classes; the rest of the roster is a long tail of single-author entries recorded here
as a tail rather than individually.

*Sourced — the benchmark's own `frameworks/keyed` and `frameworks/non-keyed` directory listings via
the GitHub API, the npm registry search API, GitHub topic search, and the State of JS 2025 roster, all
read 2026-09-16 by a research agent. I did not open them.*

**One binding property eliminates one class, and it is the hypermedia class.** htmx has no
client-side reactive state primitive at all: its own documentation describes it as accessing browser
features from HTML, and it swaps server-returned fragments into the DOM with state living on the
server. That fails
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md), which puts a complete copy
of puzzle state on the client and the rules that validate a move with it, and it fails [input
registers without waiting for the
network](../guarantees/input-registers-without-waiting-for-the-network.md), which forbids the path
from input to paint touching the network. **Reverses if** either the client's authority over state or
that promise is reversed, which would be reversing the architecture rather than adjusting it.

*Sourced — [htmx.org/docs](https://htmx.org/docs/), read 2026-09-16 by a research agent. I did not
open it.*

**No other surveyed candidate is eliminated by a binding property.** Every profiled candidate renders
to real DOM elements rather than a canvas, so
[ADR-0013](../decisions/0013-every-puzzle-cell-is-a-focusable-labelled-element.md) does not separate
them. Keyboard operability is a property of what gets built rather than of the library, so
[ADR-0014](../decisions/0014-all-play-is-reachable-from-the-keyboard-alone.md) does not either. The
attributes that do separate them sharply — commit concentration, months since last release, pre-1.0
status — have no source in this repository, which is recorded under [what must the client and the
server each be able to do?](what-must-the-client-and-server-be-able-to-do.md).

**Where a reactive primitive can live, established from each project's own documentation.** Usable
outside a component as a runtime function: Vue's `ref()`, Preact's signals (shipped separately as
`@preact/signals-core`), Angular's `signal()`, Ember's `@tracked`, Knockout's `ko.observable`, MobX,
Valtio, alien-signals, Alpine's `Alpine.store()` and `Alpine.reactive()`, VanJS's `van.state()`,
Aurelia's `@observable`. Compiler syntax with a file-extension condition: Svelte's `$state`, which
works in `.svelte.js` and `.svelte.ts` files but not plain `.ts`, and only exports state that is not
directly reassigned. Runtime function, scoping rule not established from the page read: Solid's
`createSignal`. Labs-status only: Lit's signals package. Absent from core: React, where `useState` may
only be called at the top level of a component or another Hook. Absent entirely: Mithril, Inferno,
Riot, LWC, Qwik, where the one similarly-named function is marked a deprecated technology preview.

*Sourced — each project's own documentation, read 2026-09-16 by a research agent, which flagged the
Qwik and LWC entries as search synthesis rather than pages it opened. I opened none of them.*


**Comparable applications converge on a pattern the demoted record did not consider.** tldraw keeps
React and drives the editor from a bespoke signals store rather than React state. Excalidraw renders
to canvas. SudokuPad, Cracking the Cryptic's client and the closest surface analogue that exists, uses
no framework and no bundler at all. The recurring shape is a framework for the shell with direct
rendering for the board.

*Sourced — tldraw's repository describes itself as "Build infinite canvas apps in React with the
tldraw SDK" and its own documentation says "the state system is built on a signals architecture where
all data is reactive"; Excalidraw's repository contains real canvas components
(`packages/excalidraw/components/canvases/InteractiveCanvas.tsx`) reached by code search; and a live
SudokuPad puzzle page serves over fifty plain `<script defer src>` tags with no content hashes, no
`type="module"` and no React, webpack, Vite or Rollup fingerprint in the markup. Read 2026-09-17 by a
research agent, which fetched the SudokuPad page directly. I did not open them.*

*Corrected 2026-09-17: "replaced its state layer wholesale" was the repo's paraphrase and is not
tldraw's own framing, which puts React bindings on top of signals rather than replacing React. The
Lichess claim is **deleted**: no source was recorded, none was found, and nothing here established
what its board component's stated rationale is.*

**That evidence is weaker than it first appears, and both halves should be recorded.** tldraw and
Excalidraw are infinite canvases with thousands of objects, and SudokuPad is one developer's
long-running codebase. Neither shape is this app, and neither one's reasons obviously transfer. What
survives is that the split is a real option that a serious project chose, not that it is correct here.

*A judgement about how far the evidence above reaches, so it carries no tier. The projects and their
architectures are sourced in the finding it comments on. **The Lichess example is deleted** along with
the claim above it, and SudokuPad's "decade-old" was an unsourced age that nothing here established.*

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

*Sourced for React Aria and two of the six — `react-aria.adobe.com/Grid` returns 404, so no Grid
primitive is documented; `useGrid` exists only in the undocumented `@react-aria/grid` package, which
adobe/react-spectrum issue 1438 shows going unanswered since 2021; and the documented GridList "displays
data in a single column and enables a user to navigate its contents via directional navigation keys",
which is the 81-rows-of-one-cell shape. Kobalte's and Zag's own component listings were read and
contain no grid. Read 2026-09-17 by a research agent; I did not open them.*

*Unverified for the rest — Melt, Reka, Ark and Base UI were not checked, and neither was the
"one to two hundred lines plus a day" estimate, which has no method behind it and nothing here that
could have produced one. The claim that every accessible sudoku found in the wild hand-rolled it has
no recorded search and cannot be re-run.*

**Bundle size is a first-visit cost only, which halves its weight rather than removing it.** The
React-to-Preact difference is about 54KB brotli, paid once and then never again once the app shell is
cached. [../constraints.md](../constraints.md) establishes that cold-load size matters on a degraded
link, so this is real. It is one payment against the life of the app, and it should not outrank
anything structural.

*Measured — `react@19.3.0` plus `react-dom@19.3.0` against `preact@10.29.8`, each bundled from a
realistic entry point with `esbuild --bundle --minify` and compressed with brotli at quality 11:
59,332 bytes against 4,072 bytes, a difference of 54.0KB brotli and 62.9KB gzip. Run once per
candidate on 2026-09-17 by a research agent, which stated its method after bundlephobia returned an
implausible figure for `react-dom` and pkg-size.dev returned nothing. I did not run it. Nothing was
installed into this repository. A different minifier or entry surface would move this, and the figure
has not been reproduced against a bundle of this app, which does not exist yet.*

*Corrected 2026-09-17: recorded 2026-08-31 as "about 45KB brotli, roughly 300ms on a slow-4G profile",
unsourced. The measurement above is about 20% higher. **The 300ms figure is deleted**: no method, no
network profile and no source, and nothing was run that could have produced it.*

**What actually separates them is where reactive state is allowed to live.** Vue and Preact
expose their reactive primitive as a standalone package that runs in plain TypeScript under
Node. Solid's is a runtime function. Svelte's runes are compiler syntax and only exist inside
files the Svelte compiler processes, so the store must be a `.svelte.ts` and testing it needs
the compiler. React has no reactive primitive outside a component at all, and instead requires a
bridge whose contract — an immutable snapshot, stable across calls — is exactly the discipline a
deterministic per-cell merge wants anyway. On the criterion this question weights highest,
React's constraint pushes in the right direction rather than the wrong one.

*Sourced for the mechanics — React's rules of hooks state "Only call Hooks at the top level" and
"Don't call Hooks from regular JavaScript functions"
([react.dev/reference/rules/rules-of-hooks](https://react.dev/reference/rules/rules-of-hooks)), and
Svelte's `$state` documentation states "You can declare state in `.svelte.js` and `.svelte.ts` files,
but you can only export that state if it's not directly reassigned"
([svelte.dev/docs/svelte/$state](https://svelte.dev/docs/svelte/$state)). Both read 2026-09-17 by a
research agent; I did not open them.*

*The judgement that React's constraint "pushes in the right direction" carries no tier, because there
is nothing to have established. It is the argument this question has to actually make.*

**Svelte's `$state` proxies cannot be written to IndexedDB directly**, because `structuredClone`
rejects proxies; the documented fix is one `$state.snapshot()` call at the persistence boundary.
Recorded because it lands on this app's hottest path. It does not discriminate between candidates,
though: Vue's `reactive()` has the identical problem, and the fix is one call in both.

*Sourced for Svelte — its `$state` documentation names the case: "This is handy when you want to pass
some state to an external library or API that doesn't expect a proxy, such as `structuredClone`",
with `$state.snapshot(counter)` as the one-call fix.*

*Measured for Vue — `structuredClone(reactive({a:1, nested:{b:2}}))` throws `DataCloneError:
#<Object> could not be cloned`, and wrapping it in `toRaw()` succeeds. Run against `vue@3.5.43` on
2026-09-17 by a research agent. Vue's own documentation presents `toRaw()` as a generic escape hatch
and does not mention serialisation, so the behaviour is reproducible and the framing "identical
problem, documented fix" holds only for Svelte.*

**Solid's timing facts hold, with one number corrected, and the elimination they support does not
stand on its own.** Solid 2.0 is at `solid-js@2.0.0-rc.8`, published 2026-09-11. The migration guide
is 1033 lines. No codemod ships: the word appears in `CONTRIBUTING.md` and nowhere else in the
repository. The only compatibility affordance in the guide is one opt-in line offering "old 'path
argument' ergonomics via storePath", which is an ergonomic rather than a 1.x compatibility layer.
Authorship on the branch carrying 2.0 is **89.8%**, not "over ninety percent" as recorded: of the 1914
commits `next` is ahead of `main`, ryansolid authored 1718.

So choosing 1.x means adopting a branch about to become legacy and choosing 2.0 means an RC. **What
is not established is the threshold at which that disqualifies anything**, which is
[what must a dependency's stewardship satisfy?](what-must-a-dependencys-stewardship-satisfy.md), and
the duration the original wording appealed to is
[what horizon is this built for?](what-horizon-is-this-built-for.md). Until those land this is a fact
about Solid rather than a reason against it. **Reverses if** 2.0 reaches a stable release, which on
the RC cadence above is plausible within this project's M1.

*Measured — `gh api repos/solidjs/solid/compare/main...next` for the authorship split and
`solid-js@2.0.0-rc.8`'s release metadata, plus a line count of
`documentation/solid-2.0/MIGRATION.md` and a code search for "codemod" across the repository. Run
2026-09-17 by a research agent, which stated its method. I did not run it.*

*Corrected 2026-09-17: "over ninety percent" was recorded 2026-08-31 with no source. The measured
figure is 89.8% on the 2.0 branch, and 78.1% across `main` lifetime.*

**Lit's elimination does not stand. The disqualifying half of it is wrong.** The tooling-decay half
holds: `lit-analyzer` is at 2.0.3, published 2024-01-09, and nothing has shipped since. The half that
did the work does not. Its README says "Strict mode is disabled as default", and the rules that are
off by default are the *linting* rules for unknown tags, attributes, properties, events, slots and
imports. The *type-checking* rules for binding expressions are errors by default in normal mode:
`no-incompatible-type-binding`, `no-nullable-attribute-binding` and `no-invalid-directive-binding`.

The stated reason for rejecting Lit was "an unchecked string boundary in the view layer", and the
boundary is checked out of the box. An unmaintained checker is a real concern and it is a stewardship
concern, which is
[what must a dependency's stewardship satisfy?](what-must-a-dependencys-stewardship-satisfy.md)
rather than a property of Lit's type story. **Lit returns to the field** pending that question.

*Sourced — [the lit-analyzer rules documentation](https://raw.githubusercontent.com/runem/lit-analyzer/master/docs/readme/rules.md),
opened and quoted by me on 2026-09-17, and the package's npm registry metadata for the release date,
read by a research agent.*

*Corrected 2026-09-17: recorded 2026-08-31 as "its useful rules are off by default", unsourced. That
is true of the linting rules and false of the type-checking rules the argument depended on.*

**Vue has no disqualifier and no advantage here.** Recorded because "nothing is wrong with it" is
a finding, and because absence of a reason to choose something is easy to mistake for absence of
analysis.

**The maintenance-concentration facts hold and are now measured. What outranks what is not
established.** Over the twelve months to 2026-09-17, Preact took 300 commits, of which JoviDeCroock
authored 249, or 83%; the next most frequent contributor authored 11. Jason Miller's most recent
commit to the repository is `2e2b239`, dated 2025-07-24, touching `debug/src/component-stack.js`
rather than core. React is governed by the React Foundation, announced 2025-10-07 and launched under
the Linux Foundation on 2026-02-24 with eight platinum members (Amazon, Callstack, Expo, Huawei, Meta,
Microsoft, Software Mansion, Vercel) and a technical governance layer separate from the funding board.

**What does not follow from any of that is that concentration outranks the bundle difference.** That
comparison is the one this finding actually made, and it needs both
[what must a dependency's stewardship satisfy?](what-must-a-dependencys-stewardship-satisfy.md) and
[what horizon is this built for?](what-horizon-is-this-built-for.md) before it can be argued either
way. The facts are recorded; the ranking is not.

*Measured — `gh api --paginate repos/preactjs/preact/commits?since=2025-09-17` for the authorship
split and the founder's last commit, run 2026-09-17 by a research agent which stated its method.
Sourced for the foundation from
[react.dev/blog/2025/10/07/introducing-the-react-foundation](https://react.dev/blog/2025/10/07/introducing-the-react-foundation).
I did not run the query or open the post.*

**The Preact defect is real but it is not the one recorded, and the difference matters here.**
preactjs/preact issue 1899 has been open since 2019-08-27 and concerns a text `<input value={...}>`
that does not re-render when written the same value, a case where React differs. It is **not** about
the boolean `checked` attribute. A search of the repository for open checkbox and `checked` issues
returns fifteen results, all closed.

That removes the sharp edge of the original claim, which was that the defect is "precisely the shape
of an 81-cell board with locked givens". A board of locked givens is a `readonly` or `disabled` value
input rather than a set of checkboxes, so issue 1899 may still be on the path; what is now clear is
that nobody has checked whether it is.

*Sourced — [preactjs/preact issue 1899](https://github.com/preactjs/preact/issues/1899) and a GitHub
issue search for checkbox and `checked` in the same repository, read 2026-09-17 by a research agent. I
did not open them.*

*Corrected 2026-09-17: recorded 2026-08-31 as a defect "where a checked input is treated as
uncontrolled", unsourced. The open issue is about controlled text inputs; every `checked` issue found
is closed.*

**The React half of that convergence extends past the two drawing apps.** Actual Budget is on React
19.2.7, Notesnook's web app on React 18.3.1, and Logseq on React 19.2.6, all read from the projects'
own `package.json` files. So apps with this app's persistence and sync shape are predominantly React.

*Sourced — each project's `package.json` read via the GitHub API on 2026-09-17 by a research agent. I
did not open them.*

*This repeats the finding above and is kept only for the three projects it adds. **Deleted from it**:
that the set is "near-unanimously React with Vite". Nothing checked which bundler any of them uses,
and Logseq's core is ClojureScript with React only in the UI layer, which the original phrasing hid.*
