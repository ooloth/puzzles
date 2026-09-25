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

**Nothing narrows it yet.** Where each candidate lets reactive state live does not do it: the
finding dated 2026-09-19 below shows that property shapes the view-state layer and not the shared
rules, so it binds nothing a record requires. So the field is rebuilt from nothing, and the properties
that actually differ between candidates are derived from what the client has to do before any spike
is designed. A spike then measures only those properties, on whatever survives them.

**The analysis is purely technical.** The maintainer's experience in any ecosystem is not an input,
as a cost or otherwise, by the maintainer's own direction. Candidates are scored against the
product's characteristics and the capabilities the client needs, as derived in
[what must the client and the server each be able to do?](what-must-the-client-and-server-be-able-to-do.md)
and the records it cites.

**It was coupled to the HTTP handler, settled at
[ADR-0035](../decisions/0035-the-http-handler-is-fastify.md), and is no longer.** The coupling was that a meta-framework's own server exists only if the renderer is that
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

**Whether each candidate's own runtime runs at the declared floor is unexamined, and it can
eliminate.** The build lowers syntax to the floor under
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md), but it cannot
supply a browser API the floor lacks. A renderer whose runtime calls such an API breaks
[the app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md)
however its syntax is lowered. The floor currently sits at the Safari shipping with iOS 15, per that
guarantee. No candidate has been checked against it.

*Reasoned — from the record and the guarantee named above. No candidate's runtime has been read or
run.*

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

- **Svelte** — 846 commits, 135 authors, 120 publish days. Independent; its creator is employed by
  Vercel to work on it.
- **React** — 817 commits, 101 authors, 28 publish days. React Foundation, under the Linux Foundation
  since 2026-02-24, with eight platinum members. Its repository has moved from `facebook/react` to
  `react/react`.
- **Vue** — 423 commits, 106 authors, 51 publish days. Independent.
- **Preact** — 300 commits, 20 authors, 21 publish days. Community project with no foundation.
- **Solid** — 85 commits, 20 authors, 8 publish days. Individual-led, funded through Open Collective.
- **Lit** — 46 commits, 19 authors, 1 publish day. OpenJS Foundation.

*Measured — `gh api --paginate repos/<owner>/<repo>/commits?since=2025-09-17`, grouped by author, and
the releases API grouped by publish date. Run by a research agent that stated its commands and
reported the tag-versus-date distinction unprompted. I did not run it. Governance lines are that
agent's reading of each project's own announcements except Lit's, which I opened.*

**Versions, read from the npm registry on 2026-09-23.** Three of the six have a new major or minor
in release candidate, so a version claim here decays within the week.

- **Svelte** — `latest` 5.57.1, published 2026-09-18.
- **React** — `latest` 19.3.0 for `react` and `react-dom`, published 2026-09-09.
- **Vue** — `latest` 3.5.43, published 2026-09-17, and `rc` 3.6.0-rc.9, published 2026-09-18.
  `@vue/reactivity` is published standalone at the same versions.
- **Preact** — `latest` 10.29.8, published 2026-08-01, and `rc` 11.0.0-rc.2, published 2026-09-08.
  `@preact/signals-core` is published standalone at 1.14.4.
- **Solid** — `latest` 1.9.15, published 2026-08-17, and `next` 2.0.0-rc.9, published 2026-09-18.
- **Lit** — `latest` 3.3.3, published 2026-05-14, with nothing of any version published since.

*Sourced — `curl -s https://registry.npmjs.org/<package>`, reading `dist-tags` and `time`, run by a
research agent on 2026-09-23. I re-ran it for `svelte`, `vue` and `solid-js` the same day and got the
same values. What Vue 3.6 changes has not been read.*

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

**The time to update one cell is not a criterion.** One input on an 81-cell grid changes a few
elements, which is trivial work under any candidate, so a benchmark sold on it measures something
this app cannot spend. The worst-case paths are a different matter and are criteria, under
**Performance on the worst-case paths** below.

*Reasoned — for the single-cell case only. The device section of
[../constraints.md](../constraints.md) covers data size on a mid-range phone, not CPU on a floor
device. Per-cell update timings for a React grid were
found unsourced, with no method, hardware or run behind them, and were deleted. Any millisecond
figure for rendering this grid is unsourced wherever it turns up.*

**Accessibility does not discriminate between them either.** No ecosystem ships an editable 2D
grid primitive: not React Aria, whose generic grid module is unexported and undocumented and
whose list component would announce a sudoku board as 81 rows of one cell, and not Zag, Kobalte,
Melt, Reka, Ark or Base UI. The grid's accessibility is hand-written work in every candidate. This
removes what looked like the strongest reason to prefer the largest ecosystem.

*Sourced for React Aria and two of the six — `react-aria.adobe.com/Grid` returns 404, so no Grid
primitive is documented; `useGrid` exists only in the undocumented `@react-aria/grid` package, which
adobe/react-spectrum issue 1438 shows going unanswered since 2021; and the documented GridList "displays
data in a single column and enables a user to navigate its contents via directional navigation keys",
which is the 81-rows-of-one-cell shape. Kobalte's and Zag's own component listings were read and
contain no grid. Read 2026-09-17 by a research agent; I did not open them.*

*Unverified for the rest — Melt, Reka, Ark and Base UI were not checked. An estimate of the grid's
accessibility work in lines and days, and a claim that every accessible sudoku in the wild
hand-rolled its grid, were found unsourced and deleted: neither had a method or a recorded search
behind it. Either figure is unsourced wherever it turns up.*

**Bundle size costs a download once and a parse and run on every cold launch.** The React-to-Preact
difference is about 54KB brotli. The download is paid once, because the service worker caches the app
shell, and [../constraints.md](../constraints.md) establishes that cold-load size matters on a
degraded link. The CPU is paid again each time the app starts from nothing, which on a phone includes
every time the system has discarded the page in the background. How much engine code caching reduces
that is unchecked. So this is path 1 under **Performance on the worst-case paths** below, not a
one-time cost.

*Reasoned — the parse and run cost follows from how scripts load. Whether Safari or Chrome cache
compiled code for a service-worker-cached script, and how much that saves, has not been read.*

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
is in release candidate, at the version given under **Versions** above. The migration guide
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

### The field rebuilt from nothing, 2026-09-23

**Three research agents surveyed three classes with fixed candidate lists**: component frameworks,
minimal libraries and standalone signal stores, and no library or a split between shell and board.
Each was given the settled constraints and told that familiarity is not an input. Unless marked
otherwise, what follows is their reading, and most of it came from search results rather than pages
they opened. The claims that would eliminate a candidate were checked by me, and each one says so.

**Candidates in the field.** Component frameworks: React, Preact, Vue (3.5, with 3.6 in RC), Svelte
5, Solid (1.x, with 2.0 in RC), Lit, Qwik used client-only, Inferno, Mithril, Ember, Marko, Ripple.
Minimal libraries: lit-html, uhtml, VanJS, Alpine, petite-vue, Arrow.js, Hyperapp, Crank, RE:DOM,
Sinuous. Signal stores paired with hand-written DOM: `@preact/signals-core`, alien-signals,
`@vue/reactivity`, MobX. No library: the DOM directly, with templates typed through a hand-written
`jsx` factory under TypeScript's `jsxImportSource` or through typed element-builder functions. And
the split, with a framework for the shell and a board module that owns its own subtree.

**Removed, one reason each, agreed by the maintainer 2026-09-23:**

- **Angular** — its published support covers only browsers from the last 30 months under Baseline
  "widely available", which excludes the Safari shipping with iOS 15 and so cannot satisfy
  [the app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md).
  *Sourced — [angular.dev/reference/versions](https://angular.dev/reference/versions), opened by me
  2026-09-23: "The 'widely available' Baseline includes browsers released less than 30 months (2.5
  years)". The agent's other reason, that no Vite plugin exists, is wrong:
  `@analogjs/vite-plugin-angular` is at 2.7.2, published 2026-09-08, per the npm registry read by me
  the same day. It is community-maintained rather than first-party.*
- **Stencil** — it compiles components with its own Rollup-based compiler, and its Vite plugin is
  for consuming Stencil output rather than for building it. That is a second build beside the one
  [ADR-0029](../decisions/0029-the-client-bundler-is-vite.md) settles. *Sourced by an agent from a
  search result; I did not open it.*
- **htm** — a markup syntax that needs a renderer under it, so it is not a candidate on its own.
- **lighterhtml** — nothing published since 4.2.0 on 2021-02-17. *Sourced — npm registry, read by
  me 2026-09-23.*
- **The `signal-polyfill` reference implementation** — it tracks a TC39 proposal at Stage 1 rather
  than shipping as a library. *Sourced by an agent; I did not open it.*

**Not removed, though an agent proposed it:** Qwik, whose resumability needs server-rendered HTML
and so buys nothing here; that loses it the reason to choose it without disqualifying it. Ripple,
which is pre-1.0 at 0.4.7; that is a stewardship concern, which
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
prices rather than treats as a disqualifier. Alpine, whose default build evaluates attribute
expressions with `new Function()` and so needs `unsafe-eval` under a Content Security Policy; that
reason is conditional on
[does the app send a Content Security Policy, and how strict is it?](does-the-app-send-a-content-security-policy-and-how-strict.md).
petite-vue (last publish 2022-01-18), Hyperapp (2022-03-25) and Sinuous (2023-07-01) are stale by
the registry, which the same record also prices rather than eliminates on.

**Svelte's runtime clears the floor and one of its APIs does not.** Its core supports Safari 14,
and `$state.snapshot`, the documented way to hand reactive state to `structuredClone` and so to
IndexedDB, needs Safari 15.4. So under Svelte the persistence boundary needs another way to produce
plain data at the floor.
*Sourced — [svelte.dev/docs/svelte/browser-support](https://svelte.dev/docs/svelte/browser-support),
opened by me 2026-09-23: Safari 14 baseline, and "`$state.snapshot`: Chrome/Edge 98, Firefox 94,
Safari 15.4".*

**Vue 3 needs ES2016 and a native `Proxy`**, which the floor has. Solid needs a native `Proxy`. Lit
ships ES2021 with native custom elements and shadow DOM. React, Preact and the minimal libraries do
not state a floor. *Sourced by agents; Vue's FAQ was opened by an agent, the rest are search
results.*

**Two browser facts constrain every option, whatever renders it.** Customized built-in elements
(`is=`) are not supported in Safari and will not be, and `ElementInternals` arrives at Safari 16.4.
ARIA ID references such as `aria-activedescendant` do not cross a shadow root, so a grid whose cells
sit in separate shadow roots cannot label or point at them. Lit and Stencil default to shadow DOM,
and Lit can render into light DOM instead.
*Sourced — MDN's `is` attribute page and caniuse's `ElementInternals` form entry, and
[Nolan Lawson on shadow DOM and ARIA](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/),
all opened by an agent 2026-09-23. I did not open them.*

**The split has weaker precedent than the finding above records.** One agent reports that tldraw
renders shapes through React and Excalidraw renders to canvas end to end, so neither splits
ownership at a shell/board seam, and that lichess's board and its shell both use snabbdom, one
renderer throughout. The clearest example of the split it found is an editor such as Monaco embedded
in React, and the evidence there is about the seam's cost: lifecycle races where effect cleanup
disposes an editor the wrapper still holds. *Search results only; nobody opened these pages. It
contradicts the tldraw reading above, and neither has been settled.*

**Escaping is not a differentiator.** Every candidate whose docs were found escapes by default and
opts out through a named unsafe API. Angular additionally sanitises. Escaping was not found stated
for Inferno, Stencil, Ripple, Marko or Crank.

**Properties the survey found that do differ, not yet weighed or agreed as criteria:**

- Whether the runtime and the APIs used run at the floor.
- Whether it builds as a plugin inside Vite or brings a compiler of its own.
- How markup is type-checked: by plain `tsc` through JSX, by a separate checker (`vue-tsc`,
  `svelte-check`, Glint, `@marko/type-check`), by a lint tool with no release since 2024
  (`lit-analyzer`), or not at all (tagged-template and attribute-string libraries).
- Whether state is a proxy that must be unwrapped before every IndexedDB write (Vue, Svelte, Solid's
  stores, MobX) or plain data already (React, Preact signals, Lit, Mithril).
- Whether DOM element identity, and so focus, survives an update to the grid.
- Whether a major version is in release candidate now (Vue, Preact, Solid, and Mithril's 3.0 in
  `next`).
- Whether shadow DOM is the default.
- First-visit bundle size.

### Performance on the worst-case paths, agreed as criteria 2026-09-23

**Five client paths are criteria, measured as far as the available devices allow.** Each is a place
where a floor device under worst-case conditions could expose a cost that a different renderer would
have avoided. The device section of [../constraints.md](../constraints.md) leaves them open rather
than settled.

1. **Cold launch.** Parsing, compiling and running the renderer and the app on every start from
   nothing, on the path that restores the board a player left.
2. **Background eviction.** The resident heap while the page is hidden, which bears on how often the
   system discards it and so how often path 1 is paid in full.
3. **High-frequency input.** Work and allocation per event while a drag crosses cells at 60 to 120
   events a second, and the collection pauses that allocation causes.
4. **Bulk updates.** One action changing hundreds of elements: filling every candidate note, noting
   across a multi-cell selection, or highlighting peers and conflicts across the board.
5. **Larger grids.** The same paths on grids up to 30 by 30, before notes, because this choice has
   to serve the games after sudoku.

**Three further paths are recorded and are not criteria.** The per-change write to IndexedDB is
already a criterion, as whether state must be unwrapped before each write; its worst case, a
whole-store snapshot that grows with session length, turns on
[is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md). The
flush when the page is hidden has the same shape with less time to finish. A long archive list
depends on [can a player explore past puzzles?](can-a-player-explore-past-puzzles.md), and
virtualisation serves it under any candidate.

*Reasoned — from what a renderer spends CPU and memory on, and from
[the app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md).
Whether drag-selection exists is open in
[what interactions must the grid support?](what-interactions-must-the-grid-support.md), and the grid
sizes after sudoku in [which games come after sudoku and star battle?](which-games-come-after-sudoku-and-star-battle.md).
No floor-class device is available here, and nothing has been measured.*

### Reading the worst-case paths and the floor, 2026-09-24

**A patched iOS 15 device runs iOS 15.8.8, whose Safari reports itself as 15.6.x.** Apple shipped
iOS 15.8.8 on 2026-05-11 for the iPhone 6s, iPhone 7 and first-generation iPhone SE, and iOS 16.7.16
the same day for the iPhone 8 and X. Security updates to iOS 15 keep Safari's version at 15.6.x. So
every device that is actually receiving updates on the iOS 15 branch has the APIs Safari added at
15.4, and a floor of 15.0 is stricter than
[the app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md)
needs, unless the promise is read as covering devices that never installed the updates. Which reading
the promise means has not been decided.
*Sourced — [Apple security releases](https://support.apple.com/en-us/100100), opened by me
2026-09-24. The Safari version is from user-agent strings recorded by user-agents.net and
useragents.io for iOS 15.8 (`Version/15.6.6`) and 15.8.4 (`Version/15.6.7`), seen by me in search
results; no Apple source states it.*

**Five candidates ship an unguarded call to an API Safari 15.0 lacks.** The published tarballs of 28
packages were scanned for APIs and syntax added after Safari 15.0.

- **Marko 6.3.53** calls `Array.prototype.at` (15.4) in the branch-adoption loop of its browser
  runtime, which is not something the app opts into.
- **uhtml 5.0.9** calls `String.prototype.at` (15.4) while parsing each distinct template.
- **ember-source 7.3.0** calls `.at` (15.4) in Glimmer's rendering internals, and ships 26 class
  static blocks, which are syntax Safari added at 16.4.
- **Vue 3.5.43**, through `@vue/reactivity`, and **Alpine 3.17.4**, a fork of it, define proxy
  handlers for `toSorted`, `toReversed` and `toSpliced` (16.0). They only run if app code calls those
  methods on a reactive array.
- **Ripple 0.4.7** calls `Array.fromAsync` (16.4), only from a helper the app would have to call.
- **Svelte 5.57.1** calls `structuredClone` (15.4) without a guard only when `$state.snapshot` meets a
  `Date`.

The other 20 packages had no hits: React, React DOM, Preact, Lit, lit-html, Qwik, Inferno, Mithril,
MobX, Hyperapp, Crank, RE:DOM, Sinuous, Solid, VanJS and its extension, Arrow.js, alien-signals,
`@preact/signals-core`, and petite-vue apart from one `new Function`. Alpine evaluates every directive
through `new Function`, and Ember's runtime template compiler does too.
*Measured — `npm pack` of each package's `latest`, extracted to a scratch directory, and scanned with
`grep -E` over the shipped browser files, run by a research agent 2026-09-23, with its method stated.
I re-ran the grep for Marko and uhtml and saw the same lines. A grep finds candidate code paths and
does not prove they run.*

**js-framework-benchmark gives relative costs, on desktop Chrome only.** The snapshot tagged
`chrome152`, commit `21d7204d` of 2026-09-01, is one desktop machine running Chrome, with 4× CPU
throttling on partial update, select and swap and none on the create benchmarks. It has no Safari
numbers and no longer measures script bootup. Figures here are ratios to its vanilla implementation.

- **Cold launch (path 1).** React ships 51.4KB brotli against 2.5KB for vanilla, with first paint at
  221ms against 53ms. Ember ships 38.4KB and Qwik 30.6KB. Solid, lit-html, Marko, VanJS, Hyperapp,
  RE:DOM and Sinuous ship under 5KB.
- **Resident memory (path 2).** Ember holds 5.37MB when ready, 9.4× vanilla. After five
  create-and-clear cycles Qwik holds 14.4× and Alpine 2.5×; most others sit between 1.1× and 2×.
- **Bulk updates (paths 4 and 5).** Swapping rows costs React 8.2× and Alpine 2.3×, and selecting a
  row costs Alpine 12.8×, Preact with hooks 5.0× and Mithril 4.6×. Qwik runs at about 3.7× across the
  board. Solid, Svelte, Vue Vapor, Marko, Ripple, Inferno and Sinuous stay within 1.3× on every CPU
  benchmark.

*Sourced — `webdriver-ts-results/src/results.ts` at that commit, extracted by a research agent
through the GitHub API on 2026-09-23. I checked React's record in the extracted data against the
agent's figures and they match. Desktop Chrome ratios are hypotheses about a phone running WebKit,
not observations of one.*

**V8 compiles scripts eagerly into its code cache only when they are classic scripts cached during
the service worker's install.** A module script loses that cache and falls back to the normal one,
which compiles lazily and caches on later loads. Vite emits module scripts, so under Chrome the cold
launch pays the ordinary path. Whether Safari persists compiled bytecode for page scripts at all is
not documented anywhere found.
*Sourced — [v8.dev/blog/code-caching-for-devs](https://v8.dev/blog/code-caching-for-devs), opened by
me 2026-09-24: "If the page ends up loading it as an ES module instead then the code cache will be
discarded and replaced with a 'normal' code cache." The Safari half is a research agent's report of
finding nothing.*

**Neither platform publishes when it discards a backgrounded page.** WebKit's memory-pressure
handler releases memory in stages, and iOS kills the page's process under memory pressure with no
published threshold. `document.wasDiscarded` exists only in Chrome. So path 2 can only be observed
on a device.
*Sourced by a research agent from WebKit's `MemoryPressureHandler.cpp` and caniuse, both opened by
it on 2026-09-23. I did not open them.*

**Low-end Android runs single-threaded code roughly 9× slower than a current iPhone.** Alex Russell
puts low-end Android at 9× slower and mid-tier at 3.5× by Geekbench 6 single-core, and says budget
device CPUs have not meaningfully improved since 2022.
*Sourced — "The Performance Inequality Gap, 2026" on infrequently.org, opened by a research agent
2026-09-23. Per-device Geekbench figures it gave for the iPhone 7, the Galaxy A06 and M-series Macs
came from search snippets, because the Geekbench pages refused the fetch, so they are not recorded
here.*

### The field narrowed, and how it is measured, agreed 2026-09-24

**Eight more candidates are removed, one reason each, agreed by the maintainer.**

- **Markup is not checked when the code is built**, which the criterion carried above requires: Lit
  and lit-html, whose only checker is `lit-analyzer` with no release since 2024-01-09; uhtml;
  Arrow.js; Alpine; and petite-vue.
- **It does not build inside Vite without Babel or a custom transformer wired by hand**, against
  [ADR-0029](../decisions/0029-the-client-bundler-is-vite.md): Inferno, Sinuous, and MobX's JSX
  renderer. MobX as a state store paired with another renderer stays in.
- **Its cost on the benchmarks sits far outside the field**: Qwik, at 14.4× vanilla's memory after
  five create-and-clear cycles and about 3.7× on every CPU benchmark; and Ember, at 9.4× vanilla's
  memory when ready. Both figures are desktop Chrome, and a gap that size is judged unlikely to
  close on a phone rather than shown not to.

**Still in the field:** React, Preact, Vue (3.5, and 3.6 with Vapor), Svelte, Solid, Mithril,
Crank, VanJS, RE:DOM, Hyperapp, Marko, Ripple, a signal store with hand-written DOM, the DOM directly,
and the split.

**No floor-class device is available, so the worst-case paths are estimated rather than observed.**
Each finalist's work on each path is counted on the maintainer's Mac: DOM mutations per action,
objects allocated per pointer event, heap retained after load, and bytes shipped with the time to
evaluate them. Those counts vary little by machine. Time on a floor device is then estimated by
scaling with a published slowdown ratio. Two limits come with it: the ratios describe Chrome's
engine while the iPhone floor runs Safari's, and background eviction cannot be estimated at all.
So the record that settles this question names a measurement on a floor device as the condition
that reopens it, and that measurement happens before M4, while a renderer swap still costs little.
The maintainer intends to buy floor-class devices later.

### The update-model spike, designed 2026-09-24

**The spike measures update models rather than libraries**, because DOM mutations and allocations per
action are set mostly by how a renderer updates the DOM. Five builds of one board: React and Preact
for the virtual DOM that re-renders and diffs, two because the benchmark shows them far apart; Vue
3.5 for proxy-tracked reactivity over a virtual DOM; Solid for fine-grained updates; and the DOM
directly with hand-written updates. Each holds state the way its own documentation shows. It lives
outside the repository and is deleted afterwards.

**The board** is an N-by-N grid at N = 9 and N = 30, with 3-by-3 boxes at 9 and 6-by-5 boxes at 30.
Every cell is a focusable element carrying a label, showing a value or nine note slots. Selecting a
cell highlights its row, column and box, marks conflicting values, and marks cells with the same
digit. Dragging a pressed pointer adds cells to the selection. A digit key sets the value in the
selection. One control fills every empty cell's candidate notes. Each change hands a plain copy of
the board to `structuredClone`, standing in for the write to IndexedDB, so unwrapping reactive state
is part of the cost.

**What is measured, per build and size, in production builds.**

- **Path 1, cold launch:** JavaScript shipped, brotli-compressed; script time and time from
  navigation to the first rendered board, in Chromium and WebKit, both unthrottled.
- **Path 2, resident memory:** JS heap in use after a forced collection, once loaded and again after
  a scripted session. Chromium only, as WebKit exposes no equivalent to scripts.
- **Path 3, high-frequency input:** a drag across a row of cells. Time per pointer event to the next
  frame, and bytes allocated per event. Collection pauses are not counted.
- **Path 4, bulk updates:** filling every candidate, and moving the selection, which re-highlights
  peers. Time to the next frame and DOM mutation records per action.
- **Path 5, larger grids:** all of the above at N = 30.

**Method.** Playwright drives Chromium and WebKit on the maintainer's Mac. Each measurement runs at
least ten times and reports the median and the spread. Allocation is read from Chromium's sampling
heap profiler with collected objects included, and mutations from a `MutationObserver` on the board.
Frame time is measured from the input event to a timer queued inside the next animation frame.

### What the update-model spike measured, 2026-09-24

**Five builds reached an identical board, and two needed a fix first.** After a scripted session
every cell's classes, text and `tabindex` matched the hand-written build in Chromium and WebKit at
both sizes. React's first build did not match in WebKit at N = 30: its drag handler computed the
next selection from the state captured at the last render, and React defers rendering for
`pointerenter`, so a second event arriving before the render overwrote the first and a cell was
dropped from the selection. The fix react.dev teaches is an updater function, and a handler then
cannot see the state it queued, so the write for every change moved into an effect that runs after
React commits. Solid's first build passed the store itself into the shared pure functions, and
filling candidates at N = 30 then took 217.6ms of CPU against 14.4ms once the store was unwrapped
first, which is the rule recorded above that the rules only ever see plain data.

**CPU work per action, Chromium on an Apple M2, unthrottled, median of ten.** Script, style and
layout time per input event, from Chromium's performance metrics.

- **Moving the selection, which re-highlights every peer (paths 3 and 4), at N = 30:** Vue 0.7ms,
  Preact 1.2ms, hand-written 1.6ms, Solid 7.1ms, React 8.3ms. At N = 9 every build is under 1.1ms.
- **One drag step at N = 30:** Vue 0.7ms, Preact 1.2ms, hand-written 1.7ms, Solid 6.9ms, React
  7.9ms. At N = 9 React is 1.9ms and Solid 1.3ms, the rest under 0.5ms.
- **Filling every candidate at N = 30:** Vue 7.6ms, Preact 7.9ms, hand-written 13.0ms, Solid 14.4ms,
  React 25.0ms. This includes the candidate calculation itself, which is the same code in every
  build.

**Allocation per drag step at N = 30**: hand-written 322KB, Solid 874KB, React 1,029KB, Vue
2,635KB, Preact 3,239KB. At 60 steps a second Preact and Vue would allocate 150 to 200MB a second.
How often that forces a collection pause was not measured.

**Preact wrote every text node on every render**: 6,204 mutation records per drag step at N = 30
against 86 for the others, almost all `characterData` writes of an unchanged value. It did not show
up as CPU in Chromium. Why Preact does it with this JSX was not diagnosed.

**JS heap after a forced collection, Chromium, at N = 30**: hand-written 1.4MB loaded and 2.1MB
after a session, Preact 3.4 and 4.2, Vue 3.5 and 4.5, React 3.6 and 6.1, Solid 7.4 and 8.1.

**Cold launch (path 1).** JavaScript shipped, brotli-compressed: hand-written 1.8KB, Preact 6.5KB,
Solid 7.8KB, Vue 22.8KB, React 58.3KB. Time from navigation to the first rendered board at N = 30
was 29ms hand-written, 38ms Vue, 41ms Solid, 52ms React and 55ms Preact in Chromium, and 52 to 75ms
in WebKit in the same order apart from Preact.

**Frame latency did not discriminate.** Time from an input event to the frame after the board
changed sat within one frame of 16.7ms for every build in both engines, except Preact's drag at
N = 30 in Chromium, which landed a frame later at 33ms. Playwright paces events by protocol round
trip, so this measured frame alignment rather than work.

**What this spike measured is first-pass code, not each model's floor.** Each build was written as
its renderer's documentation shows, without memoising cell components. React has `React.memo` and
Solid has `createSelector`, both documented for exactly this shape of update where one selection
change touches every cell's highlight, and neither was used. So the gap above is the cost of the
first version a practitioner writes, and whether React and Solid close it with those tools is
unmeasured. Vue and Preact reached their numbers with no such tool.

*Measured — throwaway builds with Vite 8.3.0, React 19.3.0, Preact 10.29.8, Vue 3.5.43 and Solid
1.9.15, all targeting `safari15`, driven by Playwright 1.63.0 in its Chromium and WebKit 26.6 on an
Apple M2 running macOS 26.6.2 and Node 26.7.0, ten runs per build, size and engine, run by me
2026-09-24. Allocation is the sum of Chromium's sampling heap profile at a 256-byte interval with
collected objects included. Ratios to a floor device are not applied here; the only ratios on
record are hypotheses about a different engine.*

### The second round: the documented fixes, Svelte and Vue Vapor, 2026-09-24

**Memoising halves React's cost and a selector cuts Solid's by 60%, and neither reaches Vue.** React
with `React.memo` and stable props re-rendered 52 of 900 cells on a selection move, and Solid with
`createSelector` keyed on row, column and box re-ran 60 cell computations rather than 900. CPU per
selection move at N = 30 in Chromium on the M2, median of ten:

- Vue Vapor 0.6ms and Vue 0.7ms, with nothing memoised.
- Preact 1.2ms and hand-written 1.6ms.
- Solid with `createSelector` 2.8ms, Svelte 3.1ms, React with `React.memo` 3.6ms.
- Solid 7.2ms and React 8.3ms as first written.

A drag step ranks the same way. Filling every candidate at N = 30 costs Vue, Vapor and Preact about
7.7ms, hand-written and Solid about 14ms, React 25ms and Svelte 28ms.

**Allocation and heap pull the other way.** Per drag step at N = 30: hand-written 322KB, Solid with
a selector 373KB, React memoised 415KB, Svelte 487KB, Vapor 1,401KB, Vue 2,635KB, Preact 3,239KB.
JS heap after load at N = 30: hand-written 1.4MB, Preact 3.4MB, Vue 3.5MB, React 3.6MB, Vapor 6.5MB,
Solid 7.4 to 8.1MB, Svelte 9.0MB.

**JavaScript shipped, brotli**: hand-written 1.8KB, Preact 6.5KB, Solid 7.8 to 8.1KB, Svelte 15.6KB,
Vapor 18.8KB, Vue 22.8KB, React 58.3KB.

*Measured — the same harness, builds and machine as the first round, plus Svelte 5.57.1 and Vue
3.6.0-rc.9 in Vapor mode, ten runs each, run by me 2026-09-24. Every build matched the hand-written
board in both engines at both sizes. The Vapor bundle contains no virtual DOM helpers
(`createVNode`, `openBlock`), checked by me with grep.*

**Neither single-file-component checker runs on the TypeScript this repository uses.** The
repository pins TypeScript 7.0.2. `vue-tsc` 3.3.11, its latest, exits with
`ERR_PACKAGE_PATH_NOT_EXPORTED` because it loads `typescript/lib/tsc`, which TypeScript 7 no longer
exports. `svelte-check` 4.7.6 declares `typescript: ^5.0.0 || ^6.0.0` and refuses to start unless
TypeScript 6 is installed alongside 7 and a `--tsgo` flag is passed. JSX checked by plain `tsc`,
which React, Preact and Solid use, runs on TypeScript 7. So Vue or Svelte means markup is unchecked,
or TypeScript 6 runs beside 7, until the checkers catch up.
*Measured — both tools run by me 2026-09-24 against TypeScript 7.0.2. The reason, that TypeScript
7.0 ships without the programmatic compiler API these checkers depend on and that 7.1 plans one, is
from search results naming vuejs/language-tools issue 5381 and discussion 6121, which I did not open.
A community checker, `vue-tsgo` at 0.3.0, claims TypeScript 7 support and was not tried. Which
TypeScript line the repository runs is not settled by any record.*

### How the criteria are weighed, agreed 2026-09-24

**Four criteria disqualify, and each removal names the one it fails:** running at the floor without
an unguarded call to an API the floor lacks, building as a plugin inside Vite, registering every
input under fast events, and keeping focus on the same cell through a grid update.

**Markup checked at build is not a disqualifier while a checker cannot run on TypeScript 7.** It is
kept as a tie-breaker, and it counts against Vue, Vapor and Svelte only between candidates otherwise
level.

**Drag-select matters and very large grids do not.** Star battle needs drag-select, so path 3 is
weighed. A 30 by 30 grid is unlikely in a game that has to be playable on a phone, so path 5 is
weighed at 15 by 15 rather than 30 by 30.

**The discipline a renderer needs to stay fast counts a little**, under clarity over cleverness in
[../problem.md](../problem.md): memoisation and stable props in React, selectors and unwrapping in
Solid.

**The comparison is also held against what matters over years, not only these criteria.** Why React
is the default choice, what breaking changes each candidate has put its users through, and what the
product will need from a renderer's ecosystem later are part of the weighing, because this choice is
meant to last.

### The third round: every candidate built, at realistic sizes, 2026-09-24

**No disqualifier removes a candidate, apart from Marko if the floor is Safari 15.0.** All eighteen
builds reached the identical board after a fast drag, and all kept focus on the same element through
a digit, a clear and a fill, in Chromium and WebKit at N = 9 and N = 15.
*Measured — the same harness, with a focus check added: focus an empty cell, then enter a digit,
clear it, and fill candidates, checking after each that the focused element is the same object and
still attached. The clear is a synthetic `keydown` because Playwright's WebKit treats a real
Backspace outside an input as navigating back. Run by me 2026-09-24.*

**At N = 15 the cost of a drag step separates three groups.** Chromium on the M2, script, style and
layout per event, median of ten:

- **Under 1ms:** Vue 0.3ms, Vapor 0.3ms, Preact 0.4ms, the hand-written build 0.7ms, Marko 0.9ms.
- **1.5 to 3.5ms:** Ripple 1.5ms, Solid with `createSelector` 1.6ms, the signal store 1.6ms, Svelte
  1.8ms, React with `React.memo` 1.9ms, React with React Compiler 2.1ms, Solid 2.7ms, React as first
  written 3.2ms.
- **About 4 to 10ms:** Hyperapp 3.8ms, VanJS 4.1ms, RE:DOM 4.9ms, Mithril 5.0ms, Crank 9.9ms.

The minimal libraries sit in the slowest group because each build re-derives every cell on every
change, which is what their documentation shows. Heap after load is 1.2 to 3.3MB for every build at
N = 15, so it does not separate them.

**React Compiler reaches hand-memoised React with no hand-written memoisation.** The compiled build
costs 2.1ms per drag step against 1.9ms for `React.memo` and 3.2ms uncompiled, and its bundle carries
the compiler's memo-cache sentinel. It is enabled through `@rolldown/plugin-babel` with
`reactCompilerPreset`, as `@vitejs/plugin-react` 6.1.1 documents. Its own announcement recommends
pinning an exact compiler version, because a later version may change how memoisation is applied.
*Measured by me as above. Sourced —
[react.dev/blog/2025/10/07/react-compiler-1](https://react.dev/blog/2025/10/07/react-compiler-1),
opened by me 2026-09-24: "React Compiler 1.0 is available today", and "we recommend pinning the
compiler to an exact version".*

**JavaScript shipped, brotli:** hand-written 1.8KB, signal store 3.1KB, Hyperapp 3.2KB, VanJS 3.4KB,
RE:DOM 3.7KB, Marko 5.0KB, Preact 6.5KB, Solid 7.9KB, Mithril 9.8KB, Ripple 11.2KB, Crank 12.4KB,
Svelte 15.6KB, Vapor 18.9KB, Vue 22.8KB, React 58.4KB and 59.0KB with the compiler.

**Markup type checking differs by more than TypeScript 7.** Plain `tsc` checks JSX in React, Preact
and Solid. VanJS, RE:DOM and Hyperapp build elements with typed function calls, so `tsc` covers
them. Crank's JSX types declare every element as `any`, and Mithril's attribute type has an `any`
index signature, so neither checks element attributes at all, and that does not change with a
TypeScript release. Marko and Ripple each need their own checker, and neither was tried.
*Sourced — each build's report of what `tsc` covered, from the agents that built them on
2026-09-24. I did not open the type declarations.*

### What matters over years, researched 2026-09-24

**Measured performance at realistic sizes barely separates the mainstream candidates**, so the
comparison turns on what a renderer costs to live with. React leads usage by a wide margin: 132.7
million weekly npm downloads against 24.3 million for Preact, 12.0 million for Vue, 4.2 million for
Svelte and 3.6 million for Solid. It does not lead satisfaction. Solid has had the highest
satisfaction in State of JS for five years running.
*Sourced — the npm downloads API for 2026-09-15 to 2026-09-21, queried by me 2026-09-24. Solid's
satisfaction is stated on the State of JS 2025 front-end frameworks page, opened by me the same day;
per-framework satisfaction percentages were not in its text and are not recorded here.*

**Breaking changes differ, and one candidate has a rewrite pending now.** React removed APIs in 19
that had been deprecated for years, after a release whose only purpose was to warn about them. Vue 2
to 3 changed the global API and Vue 2 reached end of life on 2023-12-31. Svelte 5 replaced implicit
reactivity with runes while old syntax keeps working per file. Solid 2.0, in release candidate now,
rewrites reactivity so that a signal write is not read back immediately. Preact 10 has run since
2019, with 11 in release candidate. Mithril has stayed on 2.x.
*Sourced by a research agent from each project's migration guides and release notes, mostly search
results it did not open. The version states were checked by me against the npm registry.*

**Backing:** React has been governed by the React Foundation under the Linux Foundation since
2026-02-24. Vue's creator is funded through sponsorships and his company. Svelte's and Solid's
creators are each employed by one company to work on them. Preact's funding is spread across small
sponsors, and 83% of its commits in the last year came from one person. The minimal libraries each
have one maintainer.
*Sourced by a research agent; the React Foundation date is in the Findings above.*

**Ecosystem for what the product will need beyond the board**, meaning drag gestures, animation,
accessible dialogs and menus, charts for a stats screen, internationalisation, a Testing Library
variant and devtools: React, Vue, Svelte and Solid each have a maintained option for every one.
Preact borrows most of React's through `preact/compat`. The minimal libraries have almost none, so
each of those would be built by hand.
*Sourced by a research agent, existence only, mostly from search results.*

**AI coding assistants:** no published evaluation measures code-generation quality for most of these
candidates. The cross-framework ones found cover React, Vue, Angular and Svelte, and report React
and Vue compiling more reliably than Angular. Svelte ships an MCP server that corrects "common
generative AI pitfalls". That models write the most dependable code for React follows from the
volume of it they were trained on, and is reasoned rather than measured.
*Sourced — Svelte's AI overview page, opened by me 2026-09-24. The evaluations are arXiv papers a
research agent saw only as search results.*

### React, Vue and Svelte against the offline, local-first architecture, 2026-09-24

**React's documentation recommends starting with a framework, and building on Vite without one is a
documented path for apps whose constraints frameworks do not serve.** Its recommended frameworks are
Next.js, React Router and Expo, and all of them "support client-side rendering (CSR), single-page
apps (SPA), and static-site generation (SSG)" deployable without a server. React Server Components
ship with those frameworks and "do not require a server". So client-only React is supported and is
not React's recommended path; this app, with a build-output entry document and no framework per
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) and
[ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md), takes the
"build from scratch" path, which leaves routing and data loading to be chosen here.
*Sourced — [react.dev/learn/creating-a-react-app](https://react.dev/learn/creating-a-react-app) and
[the Create React App sunset post](https://react.dev/blog/2025/02/14/sunsetting-create-react-app),
both opened by me 2026-09-24.*

**Vue's documentation presents exactly this app's shape as its default**: `npm create vue@latest`
scaffolds a single-page app on Vite, and "the general recommendation is to use a framework only if
you need SSR". **Svelte's recommends SvelteKit**, and describes plain Vite with
`vite-plugin-svelte` as the alternative, mainly for single-page apps, that will usually need a
routing library chosen separately.
*Sourced — [vuejs.org/guide/quick-start](https://vuejs.org/guide/quick-start) and
[svelte.dev/docs/svelte/getting-started](https://svelte.dev/docs/svelte/getting-started), both
opened by me 2026-09-24.*

**The service worker does not separate them.** `vite-plugin-pwa` ships a registration module for each
of React, Vue and Svelte (`virtual:pwa-register/react`, `/vue`, `/svelte`), and precaching is a
property of the build rather than of the renderer.
*Sourced by a research agent from the plugin's framework docs, opened by it 2026-09-24.*

**Each has a documented way to subscribe a view to state held outside it.** React has
`useSyncExternalStore`, "a React Hook that lets you subscribe to an external store", which expects an
immutable snapshot, the shape this app's board already takes. Vue has `customRef` and `shallowRef`,
and Svelte 5 has the store contract and `createSubscriber` in `svelte/reactivity`. So a board held in
a plain TypeScript module that owns mutation, the write to storage and sync can sit under any of
them, and the renderer is then a view over it.
*Sourced by a research agent from react.dev, vuejs.org and svelte.dev reference pages it opened
2026-09-24; the React quotation is from its report.*

**Local-first libraries serve React best, then Svelte, then Vue.** Of the sync and offline stores
surveyed, Dexie, ElectricSQL, Automerge, Replicache and Zero ship first-party React bindings and none
for Vue or Svelte. TinyBase and LiveStore add first-party Svelte. RxDB and PowerSync add first-party
Vue. Only InstantDB ships all three. Zero has community bindings for Vue and Svelte. This matters
only if the client adopts such a library; a store written here needs one small adapter in any of the
three.
*Sourced — the npm registry, read by a research agent 2026-09-24; I checked `@instantdb/vue`,
`@instantdb/svelte`, `@powersync/vue`, `@livestore/svelte`, the community ownership of `zero-vue` and
`zero-svelte`, and the absence of `dexie-vue` myself the same day.*
