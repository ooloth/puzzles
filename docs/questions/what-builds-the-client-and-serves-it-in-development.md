---
opened: 2026-08-31
status: answered
resolves_into: decision
---

# What builds the client and serves it in development?

**Answered, by [ADR-0029](../decisions/0029-the-client-bundler-is-vite.md): Vite builds the client bundle and serves it in development.** This
file is kept only until the floor-format record has taken what it needs, then deleted. Do not work
it. Its findings about Bun's test runner belong to
[what runs the tests?](what-runs-the-tests.md), which already holds them.

**Not cleanly a client-side question, despite the name.** A dev server usually proxies the API as
well, and under some runtimes one tool builds both halves — so an answer here can reach across the
boundary. What serves the client once deployed is
[what serves the client's files in production?](what-serves-the-clients-files-in-production.md).

## Why it matters

Two of its outputs cannot be added afterwards. A precache manifest naming the document and every
asset it needs is what lets them be installed together, because
[../constraints.md](../constraints.md) records that cache entries evict independently and a surviving
document can reference an evicted bundle. Content-hashed filenames are the other: without them a
browser revalidates every cached asset, at a round trip per load on the link
[../problem.md](../problem.md) names as the modal case. Both fall out of the build or they do not
exist, which is why this sits in M1 while
[how does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md)
at M9 waits on it.

**The inner loop is the maintainer's cost here**, and it is real: this is the component a change is
checked through every day. It is a cost of this choice rather than a justification for another one,
and nothing in the renderer choice at [ADR-0038](../decisions/0038-the-renderer-is-react.md) rests on it.

**How coupled this is to the renderer depends on an answer nobody has given.** Under separate tools
most renderers run under several bundlers, and either can be revisited without rewriting the other.
Under one tool they are the same choice, made once. Which holds is
[does one tool build the client and answer HTTP?](does-one-tool-build-the-client-and-answer-http.md).

## What would settle it

Measuring the thing the decision was made for: cold start, save-to-visible-result on a warm
server, and how both behave as the project grows past a handful of files. Ecosystem maturity
matters too, since a toolchain that breaks on an ordinary dependency costs more than it saves.

**The field is already narrowed, and the narrowing is a record rather than a finding here.**
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md) requires the
client build to lower syntax to a declared floor and
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
requires that floor to be read from one shared declaration, whatever format that declaration turns
out to take — [ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
leaves the format open and it is decided at [what format declares the browser
floor?](what-format-declares-the-browser-floor.md). Whatever is chosen here has to satisfy both,
which disqualifies `bun build` for this job and says nothing about Bun elsewhere.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split out of the rendering question.

## Options

The field the Findings surveyed. It splits on one property — whether the bundler reads a browserslist
configuration natively — and the split is not a ranking. The floor's format is
[open until M2](what-format-declares-the-browser-floor.md), where the check tools that also read it
are chosen, and that file prices an adapter for the second group at one package or roughly
sixty-five lines.

**Most entries below have no case written for them.** The Findings establish the browserslist split
and measure activity; beyond that, only Vite and `bun build` have been examined. A candidate with no
case is in the field and unargued, which is different from one that was weighed and found wanting.

*webpack.* Reads a browserslist configuration through `target: "browserslist"`. OpenJS Foundation
governance. No case written.

*Rspack.* The same option. The most commits and the lowest concentration of the tools measured below.
Its cost is that it is one vendor's team. No further case written.

*Rsbuild.* Browserslist is its primary mechanism rather than one option among several, and it declares
a default floor when none is given. Same team as Rspack. Its cost is measured below: the most
human-concentrated project found anywhere in the M1 field.

*Parcel.* Reads the `browserslist` field in `package.json`. Its cost is measured below and it is the
largest in this class — the quietest project surveyed in any category, in a position that is expensive
to leave because the precache manifest, the lowering target and the dev server all hang off it. Under
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
it needs a reason to be chosen that the rest of the field does not.

*Vite.* Takes an ES version, a browser-and-version string or an array, so it satisfies
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md) and needs an
adapter to read a browserslist declaration for
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md).
The most authors of the tools measured below, and the build every surveyed framework sits on. Its cost
is recorded below: an open defect omitting an imported worker from the build manifest, which is the
machinery a precache manifest reads.

*esbuild, Rollup, Rolldown, Oxc and Farm.* Established only as not reading a browserslist
configuration. Nothing else about any of them has been checked — not what each can lower to, not
activity, not governance.

*`bun build`.* **Disqualified for the browser build** by
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md): it does not
down-convert syntax and exposes no setting that would. Bun remains live for every other part of the
toolchain, tracked in its own files.

*A framework's own tooling.* Next.js and the Angular CLI read a browserslist configuration. Choosing
one of these is choosing more than a bundler, which is
[does one tool build the client and answer HTTP?](does-one-tool-build-the-client-and-answer-http.md).

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The tooling for generating a precache manifest exists for one toolchain and not the other.**
See [how does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md).

**This field is perishable, and the dates below are load-bearing.** A claim about a bundler can be
overtaken by a release that ships the same week, and a batch of five can lose three in one re-check.
So every finding here carries the date it was checked, a candidate list is re-checked rather than
trusted, and an undated claim about a tool is treated as unverified whatever it says.

**Bun's bundler does not down-convert syntax.** Its `target` accepts only `browser`, `bun` or
`node`, and the documentation states: "Bun does not down-convert syntax; if you use recent
ECMAScript syntax, it appears as-is in the bundled code." There is no browserslist option and no
target-browser-version option, so the escape hatch is a separate transform pass. CSS is the
exception and cuts the other way: Bun downlevels it through Lightning CSS to a fixed baseline with
no way to configure or disable that.

*Sourced — [bun.com/docs/bundler](https://bun.com/docs/bundler), opened and quoted by me on
2026-09-17. The page carries the sentence verbatim, `target` accepts only the three values, and it
documents no browser-version or browserslist option. Bun's CSS baseline is documented
at [bun.com/docs/bundler/css](https://bun.com/docs/bundler/css) as Edge 80+, Firefox 78+, Chrome 80+,
Safari 14+ and Opera 67+, with no option to change it.*

*Sourced for the issues — Bun issue 40361 is open, and it is narrower than a general browserslist
request: its title is "Bun.build has no way to set CSS browser targets, so oklch() is always
downlevelled", though its body does record a browserslist config being set and ignored. Issue 40133 is
closed as a duplicate of it, the maintainer noting that both "ask for the same feature: an option to
set the CSS browser targets". Read from the GitHub API 2026-09-17 by a research agent; I did not open
them.*

**Vite's bundler does not read a browserslist config either, and that is the same disqualifier.** Its
`build.target` accepts `'baseline-widely-available'` (the default), `'esnext'`, an ES version such as
`es2015`, a browser-and-version string such as `chrome58`, or an array of those. The word browserslist
does not appear on the option's documentation page. The transform is performed by Oxc Transformer
against an Oxc target option.

*Sourced — [vite.dev/config/build-options.html](https://vite.dev/config/build-options.html), read
2026-09-16 by me.*

**`@vitejs/plugin-legacy` reads browserslist but does a different job.** Its `targets` option defaults
to `'last 2 versions and not dead, > 0.3%, Firefox ESR'` and, when unset, "will load the browserslist
config sources and then fallback to the default value". That value "is passed on to
`@babel/preset-env` when rendering **legacy chunks**", and the plugin generates "a corresponding
legacy chunk for every chunk in the final bundle". So it emits a second bundle beside the modern one
rather than lowering one bundle to a declared floor, which is not the shape
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md) describes.

**`modernTargets` is a polyfill selector rather than a second lowering target.** It defaults to `'edge>=105, firefox>=106, chrome>=105, safari>=16.4, chromeAndroid>=105,
iOS>=16.4'` and "is passed on to `@babel/preset-env` when collecting polyfills for **modern chunks**",
overriding `build.target` when set. So it governs which polyfills the modern chunks receive rather
than being a second lowering target, which does not change the conclusion above.

*Sourced — the plugin's README at
[github.com/vitejs/vite/tree/main/packages/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy),
read 2026-09-16 by me. The `modernTargets` quotes are from the same README on the `main` branch,
read 2026-09-17 by a research agent; I did not open that one.*

**The bundlers split on whether they read a browserslist config, and the split does not decide this
question.** Reading one natively, per their own documentation: webpack (`target: "browserslist"`),
Rspack (the same option), Rsbuild (its primary mechanism, defaulting to
`chrome >= 107, edge >= 107, firefox >= 104, safari >= 16` when none is given), Parcel (the
`browserslist` field in `package.json`), Next.js and the Angular CLI. Not reading one: Vite core,
esbuild, Rollup, Rolldown, Oxc, Bun and Farm.

That split does not disqualify the second group, and nothing here should be read as though it did. The
floor's format is [open until M2](what-format-declares-the-browser-floor.md), where the check tools
that also read it are chosen. So a bundler is scored here on what it can build, and whatever carries
the floor follows from that rather than constraining it.

*Sourced — each tool's own documentation, read 2026-09-16 by a research agent, except Vite's and the
legacy plugin's which I opened myself. The webpack, Rspack, Rsbuild and Parcel quotes are the agent's
and I did not open them.*

**That finding now disqualifies `bun build` here, and the reason is a record rather than this file.**
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md) requires the
build to lower to a declared floor, which this cannot do. The CSS half cuts the same way for a
different reason: Bun downlevels CSS to a fixed baseline with no way to configure it, so the one
thing it does lower is the one thing
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
cannot point at a shared config.

**It cannot bundle web workers.** Issue 18601, "support bundling workers in bun build and dev
server", was opened 2025-03-28 and is open, with issues 17705 and 29478 merged into it 2026-08-13. A
community implementation, PR 23279, was closed unmerged by a stale bot on 2026-02-19. A solver or
generator on a worker thread is the obvious way to keep the interface responsive, so this forecloses
an architecture we have not decided against.

*Sourced — oven-sh/bun issue 18601 and PR 23279, states and dates read from the GitHub API
2026-09-04 by a research agent. I did not open them.*

**Chunking control and preload hints now exist.** `minChunkSize` folds small side-effect-free chunks
into chunks loaded by more entrypoints, defaulting to 0 with the docs suggesting 16 KiB for browser
targets. `modulePreload` is enabled by default and writes `<link rel="modulepreload">` for chunks
under `--splitting` with `--target browser`. Both shipped in Bun 1.4.1.

*Sourced — [bun.com/docs/bundler](https://bun.com/docs/bundler) and
[bun.com/blog/bun-v1.4.1](https://bun.com/blog/bun-v1.4.1), both read 2026-09-04 by me. Bun 1.4.1
released 2026-09-04; Bun 1.4.0 released 2026-08-20.*

**Plugins do run in production builds, through the API rather than the CLI.** `Bun.build()` accepts
a `plugins` array and honours it in production builds including `--compile`. What the `bun build`
CLI does not do is read plugin configuration out of `bunfig.toml` the way the dev server does. So
the gap is an entry-point inconsistency rather than plugins being absent from production.

*Sourced — oven-sh/bun issue 20619, including a maintainer comment "bun build CLI does not yet
support plugins", read 2026-09-04 by a research agent. I did not open it.*

**No precache-manifest tooling is built for Bun's bundler.** No `bun-plugin-workbox` equivalent
exists on npm. `workbox-build`'s `injectManifest` and `generateSW` are bundler-agnostic and can be
chained as a post-build step over Bun's output directory, so this is buildable, but it is a pipeline
we would own alone.

*Sourced as an absence, with re-runnable queries — four searches against the npm registry search API
on 2026-09-17 returned no Bun-targeting precache or service-worker plugin, only webpack, Rspack and
Parcel tooling: `registry.npmjs.org/-/v1/search?text=bun-plugin-workbox&size=10`,
`?text=bun%20precache&size=10`, `?text=bun%20workbox&size=20` and
`?text=bun-plugin%20service-worker&size=20`. Run by a research agent; I did not run them. This is what
npm's search surfaces and does not rule out an unindexed package.*


**Almost nobody ships a browser build with it.** GitHub code search returns 1,089,536 hits for
`filename:vite.config.ts` and 855 for `"Bun.build(" language:javascript`, a ratio near 1,274:1;
comparing `"vite" filename:package.json` at 5,169,152 gives 6,047:1. No framework among SvelteKit,
Astro, TanStack Start, Nuxt, React Router, Qwik and SolidStart uses Bun's bundler for browser
builds; the pattern is Bun as runtime or package manager underneath a Vite build. Every bug in that
path would be ours to find first, which is the opposite of what one maintainer wants.

*Measured — GitHub code search hit counts, run 2026-09-04 by a research agent. Hits are files, not
repositories or maintained projects, so these bound an order of magnitude rather than a ratio. No
published source states a precise ratio; treat any bare figure for it as unsourced.*

**Its test runner has a watch mode.** `bun test --watch` is documented and works. It reruns the whole
suite on any change rather than only affected tests (issues 4825 and 7546) and does not detect newly
added test files (issue 8342).

*Sourced — [bun.com/docs/cli/test](https://bun.com/docs/cli/test), read 2026-09-04 by a research
agent. I did not open it.*

**It reports no branch coverage.** Bun's coverage reporter emits "% Funcs" and "% Lines" only, in
`text` and `lcov`. It accepts a `statements` key and does not enforce it. Issue 7100 requesting
statement and branch coverage is open, last active 2026-08-29. Branch coverage is exactly what a
pure rules module most wants measured.

*Sourced — [bun.com/docs/test/coverage](https://bun.com/docs/test/coverage) and oven-sh/bun issue
7100, read 2026-09-04 by a research agent. I did not open them.*

**Its snapshot serialisation fails catastrophically on DOM-shaped values.** Issue 39768, filed
2026-08-20, reports that snapshotting a JSDOM fragment containing a single `<button>` produced a
146,955-line, 7.5 MB snapshot file, against Jest 30.3.0's 9-line, 4 KB output for the same input.
Issue 40077, open, includes a report of `toMatchSnapshot()` on a live DOM node attempting a ~30 GB
allocation. An 81-cell grid is exactly this shape.

**Two things about those issues that a reader will otherwise get wrong.** Issue 39768 is closed as a
duplicate of issue 5540, which moves where the defect is tracked rather than fixing it, so 5540 is the
issue to watch. And 40077 is an omnibus report bundling four separate findings, of which the ~30 GB
allocation is one, so it is not a snapshot issue and its state says nothing about snapshots alone.

**The quantified reports cover single nodes, and no source quantifies a whole suite.** Any figure for
what a full test run costs under this defect is unsourced wherever it turns up.

*Sourced — oven-sh/bun issues 39768 and 40077, read 2026-09-17 by a research agent that quoted
39768's comparison table verbatim. I did not open them.*

**None of this rules Bun out as a package manager, a test runner for non-browser code, or a
server runtime.** Those are separate decisions, each reversible in about one line, and the
research found the runtime genuinely solid. The organising principle is to adopt it only where
backing out is cheap; a browser build with a service-worker pipeline built around it is not.

**Choosing Vite is not choosing a settled thing.** Vite 8 reached general availability 2026-03-12 on
a bundler that had not: Rolldown reached 1.0 on 2026-05-07, 56 days later, and Vite 8's own
announcement notes Rolldown progressed from beta to release candidate during Vite 8's beta. An open
regression sits in exactly the machinery a precache manifest reads: issue 23377, "Imported worker
missing from Vite build manifest", filed 2026-08-26 against Vite 8.2.2 and still open. For an
offline-first app a manifest that omits an asset ships a permanently broken cache to installed
players.

*Sourced — [vite.dev/blog/announcing-vite8](https://vite.dev/blog/announcing-vite8),
[voidzero.dev/posts/announcing-rolldown-1-0](https://voidzero.dev/posts/announcing-rolldown-1-0) and
vitejs/vite issue 23377, read 2026-09-04 by a research agent. I did not open them.*

**Vite's steward has been acquired, and the terms are public.** Cloudflare acquired VoidZero on
2026-06-04. Evan You leads the team as founder and CEO inside Cloudflare's Emerging Technology and
Incubation organisation, and Cloudflare committed $1 million to an independent Vite ecosystem fund
for maintainers unaffiliated with either company. The licences stay MIT. This is a completed
acquisition rather than a pending one, which makes the roadmap risk assessable rather than open.

*Sourced — [Cloudflare's press
release](https://www.cloudflare.com/press/press-releases/2026/cloudflare-acquires-voidzero-to-build-the-future-of-the-ai-native-web/),
read 2026-09-04 by me.*

**The AI-rewrite story is not a reason to decline Bun.** Bun 1.4.0 was a rewrite from Zig to Rust,
and Bun's own account of it is candid: the port ran as roughly 50 Claude Code workflows over 11 days,
the branch was named `claude/phase-a-port` at 6,755 commits, and the stated motive was memory safety
rather than performance. What can be established about the aftermath is thin. One patch release
followed in 15 days, and several regressions against 1.4.0 are open, including issues 39768 and 40077
above. The capability gaps above hold regardless of how the rewrite was done.

*Sourced — [bun.com/blog/bun-in-rust](https://bun.com/blog/bun-in-rust), read 2026-09-04 by a
research agent. No source, official or third-party, publishes comparative post-release stability
statistics for 1.4.0; treat any figure claiming issue volume or crash rates against a prior major as
unsourced.*

**The build field's activity, over the twelve months to 2026-09-17**, and what it is worth here.
Commits, distinct authors, the share held by the most prolific human, and the latest release:

- **Rspack** — 2,614 commits, 101 authors, top human 17.3%, v2.2.6 on 2026-09-17. ByteDance's web
  infrastructure team.
- **Rsbuild** — 2,102 commits, 50 authors, top human **75.5%**, v2.2.8 on 2026-09-18. Same team.
- **webpack** — 1,498 commits, 51 authors, top human 54.9%, v5.111.1 on 2026-09-18. OpenJS Foundation.
- **Vite** — 1,250 commits, 210 authors, top human 42.9%, v8.3.0 on 2026-09-10. Steward VoidZero
  acquired by Cloudflare on 2026-06-04.
- **Parcel** — **14 commits, 4 authors**, top human 71.4%, v2.16.4 on 2026-02-02. Individual-led.

**Parcel is the quietest project surveyed in any category**, and a build pipeline is more expensive to
leave than a router because the precache manifest, the lowering target and the dev server all hang off
it. Under
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
that combination is where a supply concern carries real weight, so Parcel needs a reason to be chosen
that the rest of the field does not.

**Corporate backing did not predict many hands, and foundation governance did not predict activity.**
Rsbuild is the most human-concentrated project found anywhere in the M1 field and it is corporate
backed. That is why this list is recorded as facts rather than as a ranking.

*Measured — commit and author counts from `gh api --paginate
repos/<owner>/<repo>/commits?since=2025-09-17`, grouped by author, run by a research agent that
sampled the top author's commits to confirm they were not a bot; Parcel's I re-ran myself and
confirmed at 14. Release versions and dates are from `gh api repos/<owner>/<repo>/releases/latest`,
run by me on 2026-09-18, and it is the source for Rspack, Rsbuild, webpack and Parcel as listed
above. Vite's is the exception: that
call returns `create-vite@9.2.1`, because the repository tags every package on each release, so a
package-scoped lookup is what would confirm v8.3.0 and nothing here has run one.*

**Confirmed against source, and worth recording because a result that changes nothing is still a
result in a field this perishable:

- Bun's worker-bundling gap. Issue 18601 is **still open** with nothing checked off, so it is not
  fixed. Issues 17705 and 29478 were closed as duplicates of it on 2026-08-13, and PR 23279 was closed
  unmerged by `github-actions[bot]` on 2026-02-19 with "Closing this PR because it has been inactive
  for more than 90 days".
- Bun's branch coverage. Issue 7100 is still open, and the coverage documentation still shows only
  `% Funcs` and `% Lines`.
- Vite's `build.target`. The word browserslist still does not appear on the option's page.
- Vite's Baseline default. The resolved list `['chrome111', 'edge111', 'firefox114', 'safari16.4',
  'ios16.4']` and its 2026-01-01 pin **are** on the page. A read of that page that does not surface
  them has missed them rather than found the page changed.
- Vite 8's GA on 2026-03-12 and Rolldown 1.0 on 2026-05-07, which is 56 days.
- vitejs/vite issue 23377 is still open. Its "against Vite 8.2.2" detail was not re-checked.
- Cloudflare's acquisition of VoidZero on 2026-06-04, the $1 million ecosystem fund and the MIT
  licences, now also confirmed against
  [blog.cloudflare.com/voidzero-joins-cloudflare](https://blog.cloudflare.com/voidzero-joins-cloudflare/).

*Read 2026-09-17 by a research agent via the GitHub API and each tool's own documentation. I did not
open them. The GitHub code-search ratio recorded above was not re-run and keeps its existing caveat.*

### The precache manifest separates this field, and it is the only property found that does

**Every meta-framework surveyed can set the syntax lowering target, so [ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md) removes none of them.**
All seven build on Vite. SvelteKit, Astro and React Router are plain Vite projects with a plugin
added, so `build.target` is set the ordinary way. TanStack Start, Qwik and Analog show the same
architecture and no contrary evidence was found. This was expected to be a cut and it is not one.

*Sourced — the seven frameworks' Vite peer dependencies from the npm registry, and Vite's
`build.target` reference, read 2026-09-19 by a research agent. I did not open them.*

**A claim that Nuxt cannot set the target does not hold, and the evidence behind it was three years
old.** nuxt/nuxt#20065, "Expose Vite build.target option", was created at 2023-04-04T05:07:01Z and
closed as not planned at 2023-04-04T09:11:16Z, four hours later, against Nuxt 3. Nuxt is now 4.5.2 on
Vite 8. Its
current configuration reference does say "Please note that not all vite options are supported in
Nuxt", and it exposes `esbuild.options.target`, defaulting to `esnext`. **Whether that lowers the
client bundle to a named floor is unverified**, so Nuxt is unresolved here rather than eliminated.
**Reverses if** someone sets `esbuild.options.target` to a floor and inspects the emitted bundle.

*Sourced — nuxt/nuxt#20065 state and timestamps read via `gh issue view` and
[nuxt.com/docs/4.x/api/nuxt-config](https://nuxt.com/docs/4.x/api/nuxt-config), both opened by me on
2026-09-19.*

**Three candidates cannot produce a precache manifest naming the entry document today.**
[ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md) puts a
service worker on every navigation after the first, and
[the app never opens to a blank screen after the first visit](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md)
is what rests on it. The manifest is a build output, so a toolchain that cannot emit one is a
toolchain where that promise rests on a workaround.

- **TanStack Start.** TanStack/router#4988, "vite-plugin-pwa incompatible with tanstack start
  production builds", is open and labelled `needs-upstream-fix`, filed 2025-08-17. The plugin's build
  steps do not run.
- **React Router 7 in SPA mode.** remix-run/react-router#14268, "SPA Mode not compatible with PWA",
  was closed on 2025-09-01 and redirected to vite-pwa/vite-plugin-pwa#809, which has been open since
  2024-12-27. React Router writes `index.html` after the plugin has globbed, so the entry document
  cannot enter the precache list.
- **Qwik City.** `@qwikdev/pwa` has not published past 0.0.4 since April 2024 and vite-pwa#884
  remains open. Qwik also pins Vite at `>=5 <8`, which is the only candidate excluded from Vite 8.

**Reverses if** any of the three upstream issues closes with a working integration, or if a
hand-written `injectManifest` post-build step is accepted as the answer, which is possible for all
three since `workbox-build` operates on a directory of built files rather than on a bundler.

*Sourced — the four issue states and timestamps read by me via `gh issue view` on 2026-09-19. The
`@qwikdev/pwa` and vite-pwa#884 figures and the Vite pin are a research agent's and I did not open
them.*

**SvelteKit does not fail this, but it hands over three lists rather than a manifest.** Its built-in
`$service-worker` exports `build` ("An array of URL strings representing the files generated by
Vite"), `files` (the static directory), `prerendered` ("An array of pathnames corresponding to
prerendered pages and endpoints") and a single global `version`. There is no per-file revision, and
the documentation does not say whether the prerendered entry document appears in `build` or only in
`prerendered`. Revisioning comes only from Vite's content hashes in the filenames. So the precache
logic is written here rather than generated.

*Sourced — [svelte.dev/docs/kit/$service-worker](https://svelte.dev/docs/kit/$service-worker),
opened and quoted by me on 2026-09-19.*

**Plain Vite and the two remaining meta-frameworks have maintained integrations.**
`vite-plugin-pwa` is at 1.3.0, published 2026-05-05, and runs `workbox-build` against Vite's output.
`@vite-pwa/astro` is at 1.2.0 from 2025-11-27 and `@vite-pwa/nuxt` at 1.1.1 from 2026-02-06; both are
published by the community `vite-pwa` organisation rather than by either framework's core team, and
Nuxt's module directory lists its one as official anyway. `workbox-build` is at 7.4.1, published
2026-05-04, not archived, and its README states Chrome's Aurora team now owns it.

*Sourced — npm registry and GitHub metadata read 2026-09-19 by a research agent. I did not open
them, and the first-party-versus-community distinction is the agent's reading of each package's
publishing organisation.*

**So the discriminating property in this field is the precache manifest rather than the build
target, which is the reverse of what was expected.** Everything on the lowering side turned out to be
reachable everywhere. Nothing else surveyed separates the candidates on a record already in force.

### Astro's fit, and what the field costs under each runtime, checked 2026-09-19

**Astro's own documentation positions it for the shape this app is not.** Its "Why Astro" page opens
"Astro is the web framework for building content-driven websites like blogs, marketing, and
e-commerce", and names the contrasting case directly: most modern frameworks "were designed for
building web applications. These frameworks excel at building more complex, application-like
experiences in the browser: logged-in admin dashboards, inboxes, social networks, todo lists". A
single grid mutated on every keystroke is that second shape. The same page does say Astro has
"sensibly scale[d] up to performant, powerful, dynamic web applications", so it does not rule itself
out.

Two mechanics follow from the islands model. Sharing state between islands is not native: Astro's own
recipe says "Astro recommends a different solution for shared client-side storage: Nano Stores",
a third-party package. And a whole-page interactive surface reaches Astro through `client:only`, which
"skips HTML server rendering, and renders only on the client" — which is Astro serving static files
for that route and delivering none of what the framework is for.

**This is a fit judgement and not a property, and it is recorded as one.** No record in
[../decisions/](../decisions/) is violated by choosing Astro. What the evidence supports is ranking it
last among the survivors, not eliminating it.

*Sourced — [docs.astro.build/en/concepts/why-astro](https://docs.astro.build/en/concepts/why-astro/)
opened and quoted by me on 2026-09-19. The islands recipe and the `client:only` reference were read
the same day by a research agent; I did not open them.*

**The Vite-based field runs under Bun and Deno, less smoothly than under Node, and is not Node-only.**
Bun's own guide states "Vite works with Bun with no extra configuration" and documents
`bunx --bun vite` for dev and build. Deno ships a first-party Vite tutorial driving it through
`deno task`. So the runtime is not settled by consequence here, which is what this check was for.

What is real is friction, and three open issues carry it: denoland/deno#35942, open since 2026-07-10,
reports that Rolldown's vendored `signal-exit` kills "every Vite 8 dev server" under
`deno run --watch`, and Vite 8 is the current major; denoland/deno#26414, "Instructions for Deno +
vite is broken", has been open since 2024-10-19; oven-sh/bun#29368, open since 2026-04-16, reports Bun
workspaces breaking the Vite dev server.

Adapters diverge more than the build does. SvelteKit ships no official Bun or Deno adapter and its
adapters page names only cloudflare, netlify, node, static and vercel. Astro's Deno adapter is
maintained by the Deno team and its docs say so; Astro has no official Bun adapter and the most
visible community one last published in 2023. Nuxt reaches both through built-in Nitro presets.

**So adapter coverage discriminates nothing here.** Node is the runtime
([ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md)), and every survivor
ships an official Node adapter. The divergence recorded above is about runtimes this project cannot
choose, and it is kept only so nobody re-runs the comparison.

*Sourced — the three issue numbers, titles, states and creation dates read by me with `gh issue view`
on 2026-09-19. Bun's and Deno's Vite guides, SvelteKit's adapters page, Astro's Deno adapter page and
the adapter version dates were read the same day by a research agent; I did not open them.*
