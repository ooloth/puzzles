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

**That comparison takes two candidates and the framework class holds six**, so something narrows the
field before the spike is worth running. Stewardship does not do it:
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
prices a supply worry by what leaving the position costs, and a renderer swap is cheap enough relative
to the runtime that no candidate here is removed by it.

**What narrows it is where each candidate allows reactive state to live**, recorded under **Findings**
from each project's own documentation. The three shapes are a primitive usable outside a component in
plain TypeScript, compiler syntax that only works in files the compiler processes, and no primitive
outside a component at all. That property is the one this question weights highest, because the board,
its persistence and a deterministic merge all have to stay pure and testable with no browser, and it
is the thing a state layer either survives or does not. It orders the field rather than eliminating
from it: the Findings argue that the most restrictive of the three may push in the right direction
rather than the wrong one, which is exactly the claim a spike is for.

**It was coupled to
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md) and is no
longer.** The coupling was that a meta-framework's own server exists only if the renderer is that
meta-framework, so neither could be settled without deciding part of the other.
[ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md) broke it by
settling that no single tool owns both, which means this question now chooses a renderer and nothing
else.

**One condition still ties them.** That record rejects Nuxt for closing the renderer to Vue, so
choosing Vue here removes its grounds and reopens it. Check that before assuming it holds.

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

*A component framework.* Given
[ADR-0007](../decisions/0007-that-language-is-typescript.md), the field is React, Preact, Vue, Svelte,
Solid and Lit. **Nothing in this class is eliminated**, and the Findings say per candidate why. Two of
the concerns against candidates here are wrong on their facts; the rest are stewardship concerns,
which
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
prices by what leaving the position costs rather than treating as disqualifiers. Vue has no
disqualifier and no advantage, which is a reason to leave it in rather than to narrow it out. React
and Preact share a programming model, so comparing them is one comparison rather than two.

*A meta-framework.* **Out**, by [ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md), which settles that the client build and the HTTP
server are separate tools, and by [ADR-0029](../decisions/0029-the-client-bundler-is-vite.md), which names the bundler. SvelteKit, Astro,
TanStack Start, Nuxt, Next, Remix and the rest of the class each bundle a renderer with a build and a
server, and that bundle is what those records reject. The individual grounds are in the first of
them. **Reverses if** either record does.

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

**The field's activity, over the twelve months to 2026-09-17.** Commits, distinct authors, and the
number of days on which anything was published, which is the honest figure for a monorepo that tags
every package on each release:

- **Svelte** — 846 commits, 135 authors, 120 publish days. Latest stable 5.57.0. Independent; its
  creator is employed by Vercel to work on it.
- **React** — 817 commits, 101 authors, 28 publish days. Latest stable 19.3.0. React Foundation, under
  the Linux Foundation since 2026-02-24, with eight platinum members. Its repository has moved from
  `facebook/react` to `react/react`.
- **Vue** — 423 commits, 106 authors, 51 publish days. Latest stable 3.5.43. Independent.
- **Preact** — 300 commits, 20 authors, 21 publish days. Latest stable 10.29.8, with 11.0.0 in RC.
  Community project with no foundation.
- **Solid** — 85 commits, 20 authors, 8 publish days. Latest stable 1.9.15, with 2.0.0 in RC.
  Individual-led, funded through Open Collective.
- **Lit** — 46 commits, 19 authors, 1 publish day. Latest stable 3.3.3. OpenJS Foundation.

*Measured — `gh api --paginate repos/<owner>/<repo>/commits?since=2025-09-17`, grouped by author, and
the releases API grouped by publish date. Run by a research agent that stated its commands and
reported the tag-versus-date distinction unprompted. I did not run it. Governance lines are that
agent's reading of each project's own announcements except Lit's, which I opened.*

**No surveyed candidate is eliminated by a binding property.** Every profiled candidate renders
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

*tldraw's own framing puts React bindings on top of signals rather than replacing React, so "replaced
its state layer wholesale" overstates it. No source establishes anything about Lichess's board
component or its stated rationale, so any claim about it is unsourced wherever it turns up.*

**That evidence is weaker than it first appears, and both halves should be recorded.** tldraw and
Excalidraw are infinite canvases with thousands of objects, and SudokuPad is one developer's
long-running codebase. Neither shape is this app, and neither one's reasons obviously transfer. What
survives is that the split is a real option that a serious project chose, not that it is correct here.

*A judgement about how far the evidence above reaches, so it carries no tier. The projects and their
architectures are sourced in the finding it comments on. Nothing here establishes SudokuPad's age, so
any figure for it is unsourced wherever it turns up.*

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

*No source converts that size into a load time. Any figure for what it costs in milliseconds on a
named network profile is unsourced wherever it turns up, and producing one needs a bundle of this app,
which does not exist yet.*

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

**Solid's timing facts hold, and the elimination they support does not stand on its own.** Solid 2.0
is at `solid-js@2.0.0-rc.8`, published 2026-09-11. The migration guide
is 1033 lines. The only compatibility affordance in the guide is one opt-in line offering "old 'path
argument' ergonomics via storePath", which is an ergonomic rather than a 1.x compatibility layer.

**A codemod exists, and it is thinner than its existence suggests.**
`solidjs-community/solid-migration-assistant` describes itself as a "Safe Solid 1.x to Solid 2
migration codemod", was pushed 2026-09-14, and publishes as `solid-migration-assistant` at 0.2.1,
released 2026-08-13. It sits in the `solidjs-community` organisation rather than in `solidjs`, it is
at 0.2.1 with 5 stars, and the migration guide states that it handles a subset of mechanical changes
while batching semantics, effect and lifecycle changes and the `<For>`/`<Index>` changes remain
manual.
Authorship on the branch carrying 2.0 is **89.8%**: of the 1914
commits `next` is ahead of `main`, ryansolid authored 1718.

So choosing 1.x means adopting a branch about to become legacy and choosing 2.0 means an RC. **That
does not disqualify Solid.**
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
prices a stewardship concern by what leaving the position costs, and what a migration costs here is a
migration guide, a partial codemod and manual work on batching and lifecycle semantics, against a
project that gets active attention. That is work somebody is present for. Solid is in the field.

*Measured — `gh api repos/solidjs/solid/compare/main...next` for the authorship split and
`solid-js@2.0.0-rc.8`'s release metadata, plus a line count of
`documentation/solid-2.0/MIGRATION.md`. Run 2026-09-17 by a research agent, which stated its method.
I did not run it.*

*Sourced for the codemod — `gh api repos/solidjs-community/solid-migration-assistant` and the npm
registry, both run by me on 2026-09-17.*

*Authorship is 89.8% on the 2.0 branch and 78.1% across `main` lifetime, so a figure above ninety
percent is unsourced wherever it turns up. And **a repository-scoped search is not evidence about an
ecosystem**: the codemod sits in `solidjs-community`, so any search of `solidjs/solid` will report it
missing however it is phrased.*

**Lit's elimination does not stand. The disqualifying half of it is wrong.** The tooling-decay half
holds: `lit-analyzer` is at 2.0.3, published 2024-01-09, and nothing has shipped since. The half that
did the work does not. Its README says "Strict mode is disabled as default", and the rules that are
off by default are the *linting* rules for unknown tags, attributes, properties, events, slots and
imports. The *type-checking* rules for binding expressions are errors by default in normal mode:
`no-incompatible-type-binding`, `no-nullable-attribute-binding` and `no-invalid-directive-binding`.

The stated reason for rejecting Lit was "an unchecked string boundary in the view layer", and the
boundary is checked out of the box. **Lit is in the field.**

**Lit also has the strongest governance of any candidate here and the least activity**, which is the
clearest case in this repo that the two are separate signals. It joined the OpenJS Foundation as an
Impact Project on 2025-10-14, with "All of Lit's assets, including code, documentation, websites, and
the Lit brand" transferred out of Google and a Technical Steering Committee of six drawn from Google,
Adobe, Reddit and independents. Over the twelve months to 2026-09-17 it took 46 commits from 19
authors and published on one day, 2026-05-14.

*Sourced — [lit.dev/blog/2025-10-14-openjs](https://lit.dev/blog/2025-10-14-openjs/), opened and
quoted. Measured for the activity, by the method below.*

*Sourced — [the lit-analyzer rules documentation](https://raw.githubusercontent.com/runem/lit-analyzer/master/docs/readme/rules.md),
opened and quoted by me on 2026-09-17, and the package's npm registry metadata for the release date,
read by a research agent.*

*"Its useful rules are off by default" is true of the linting rules and false of the type-checking
rules, so the distinction is the whole finding and a claim that collapses the two is wrong.*

**Vue has no disqualifier and no advantage here.** Recorded because "nothing is wrong with it" is
a finding, and because absence of a reason to choose something is easy to mistake for absence of
analysis.

**The maintenance-concentration facts hold and are now measured. What outranks what is not
established.** Over the twelve months to 2026-09-17, Preact took 300 commits, of which JoviDeCroock
authored 249, or 83%; the next most frequent contributor authored 11. Jason Miller's most recent
commit to the repository is `2e2b239`, dated 2025-07-24, a `debug` fix rather than a change to core.
React is governed by the React Foundation, announced 2025-10-07 and launched under
the Linux Foundation on 2026-02-24 with eight platinum members (Amazon, Callstack, Expo, Huawei, Meta,
Microsoft, Software Mansion, Vercel) and a technical governance layer separate from the funding board.

**Concentration does not outrank the bundle difference here, and Preact is in the field.**
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
prices a stewardship concern by what leaving costs. React and Preact share a programming model, so
moving between them is the cheapest swap available anywhere in this question, which puts the
concentration concern near the bottom of what it could be worth. The measured 54KB is the input that
survives; the concentration figure is a fact with little weight attached to it.

*Measured — the authorship split is from `gh api --paginate
repos/preactjs/preact/commits?since=2025-09-17`, run 2026-09-17 by a research agent which stated its
method. The founder's last commit is from `gh api
'repos/preactjs/preact/commits?author=developit&per_page=1'`, which I ran on 2026-09-18: `2e2b239`,
2025-07-24, "fix(debug): fix memory leak in VNode owner tracking (#4850)". A `since=2025-09-17` query
cannot return it, because that window opens after the commit, so the unfiltered author query is what
establishes this and any citation of the `since=` query for it is wrong.
Sourced for the foundation from
[react.dev/blog/2025/10/07/introducing-the-react-foundation](https://react.dev/blog/2025/10/07/introducing-the-react-foundation).
I did not run the query or open the post.*

**The Preact defect is real but it is not the one recorded, and the difference matters here.**
preactjs/preact issue 1899 has been open since 2019-08-27 and concerns a text `<input value={...}>`
that does not re-render when written the same value, a case where React differs. It is **not** about
the boolean `checked` attribute. A search of the repository for open checkbox and `checked` issues
returns fifteen results, all closed.

**Whether it lands on this app's path is unchecked.** A board of locked givens is a `readonly` or
`disabled` value input rather than a set of checkboxes, so issue 1899 may or may not be reachable
here, and nobody has tried it.

*Sourced — [preactjs/preact issue 1899](https://github.com/preactjs/preact/issues/1899) and a GitHub
issue search for checkbox and `checked` in the same repository, read 2026-09-17 by a research agent. I
did not open them.*

*The open issue is about controlled text inputs. Every issue found about the boolean `checked`
attribute is closed, so a claim that Preact has an open defect affecting checked inputs is unsourced
wherever it turns up.*

**The React half of that convergence extends past the two drawing apps.** Actual Budget is on React
19.2.7, Notesnook's web app on React 18.3.1, and Logseq on React 19.2.6, all read from the projects'
own `package.json` files. So apps with this app's persistence and sync shape are predominantly React.

*Sourced — each project's `package.json` read via the GitHub API on 2026-09-17 by a research agent. I
did not open them.*

*This repeats the finding above and is kept only for the three projects it adds. Nothing here checked
which bundler any of them uses, so a claim pairing this set with a named bundler is unsourced wherever
it turns up. Logseq's core is ClojureScript with React only in the UI layer.*

### The criterion this file weights highest does not bind, checked 2026-09-19

**Where a renderer allows a reactive primitive to live constrains the state-holding module and not
the domain-logic module.** The restriction was read as reaching the shared puzzle rules, and it does
not. Svelte's `$state` is compiler syntax: it compiles only in `.svelte`, `.svelte.js` and
`.svelte.ts`, and the only file that needs the Svelte compiler in its path is the one that calls it.
A module of pure functions over plain objects that never calls `$state` is an ordinary `.ts` file,
importable unchanged by a browser build, a server process and a batch script run directly under a
bare runtime. Vue's case is looser still: `@vue/reactivity` is published standalone at 3.5.43 and
`ref()`, `reactive()` and `computed()` are ordinary functions needing no component, no app instance
and no bundler. Only `watch()` and `watchEffect()` want an `effectScope()` to avoid leaking, and pure
rules use neither.

**So no renderer here is disadvantaged on sharing the rules**, which is what
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) is
for. The criterion still separates the candidates on how pleasant the *view-state* layer is to write.
It does not separate them on anything a record requires, and it was being treated as though it did.

**What follows is a rule rather than an elimination.** The shared rules module never declares
`$state` and never wraps its inputs in `reactive()` or `ref()`. Where the view layer hands data to
it, it passes `$state.snapshot(x)` under Svelte or `toRaw(x)` under Vue, so the rules only ever see
plain data. Svelte's own docs give the reason: a snapshot is "handy when you want to pass some state
to an external library or API that doesn't expect a proxy, such as `structuredClone`". This is a
candidate invariant rather than a finding, and it holds under every renderer surveyed.

**Reverses if** the board's mutable state cannot be kept separate from the rules that read it, which
would be a design failure rather than a renderer's fault.

*Sourced — [svelte.dev/docs/svelte/$state](https://svelte.dev/docs/svelte/$state) opened and quoted by
me on 2026-09-19, and confirmed that the page places no restriction on a separate plain `.ts` module.
Vue's `effectScope` and `toRaw` references and the `@vue/reactivity` version were read the same day by
a research agent; I did not open them.*
