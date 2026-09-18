---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What builds the client and serves it in development?

**Not cleanly a client-side question, despite the name.** A dev server usually proxies the API as
well, and under some runtimes one tool builds both halves — so an answer here can reach across the
boundary. What serves the client once deployed is
[what serves the client's files in production?](what-serves-the-clients-files-in-production.md).

## Why it matters

[What renders the client?](what-renders-the-client.md) rests primarily on the
inner loop being fast, and this is the component that delivers it. If the loop is slow, the
decision's main justification is not met by whatever implements it.

It is a separate question from which framework, because the two are less coupled than they appear:
most frameworks run under several toolchains, and a toolchain choice can be revisited without
rewriting the interface.

## What would settle it

Measuring the thing the decision was made for: cold start, save-to-visible-result on a warm
server, and how both behave as the project grows past a handful of files. Ecosystem maturity
matters too, since a toolchain that breaks on an ordinary dependency costs more than it saves.

**The field is already narrowed, and the narrowing is a record rather than a finding here.**
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md) requires the
client build to lower syntax to a declared floor and
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
requires that floor to be read from one browserslist config. Whatever is chosen here has to satisfy
both, which disqualifies `bun build` for this job and says nothing about Bun elsewhere.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split out of the rendering question.

## Options

The TypeScript toolchains, since
[ADR-0007](../decisions/0007-that-language-is-typescript.md) settled the language — Vite and Bun being
the obvious two, with a framework's own tooling a third where it has one.

**`bun build` is disqualified for the browser build**, by
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md): it cannot lower
syntax to a declared floor and exposes no setting that would make it. Bun remains a live option for
every other part of the toolchain, and those are separate choices tracked in their own files.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The tooling for generating a precache manifest exists for one toolchain and not the other.**
See [how does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md).

**This field is perishable, and the dates below are load-bearing.** Findings were first gathered
2026-08-31 against Bun 1.4.0. On re-checking 2026-09-04, three of the five recorded against Bun's
bundler had died or weakened, one of them in a release that shipped that same morning. A candidate
list here carries an "as of" date or it misleads.

**Bun's bundler does not down-convert syntax.** Its `target` accepts only `browser`, `bun` or
`node`, and the documentation states: "Bun does not down-convert syntax; if you use recent
ECMAScript syntax, it appears as-is in the bundled code." There is no browserslist option and no
target-browser-version option, so the escape hatch is a separate transform pass. CSS is the
exception and cuts the other way: Bun downlevels it through Lightning CSS to a fixed baseline with
no way to configure or disable that.

*Sourced — [bun.com/docs/bundler](https://bun.com/docs/bundler), re-opened and re-quoted by me on
2026-09-17. The page still carries the sentence verbatim, `target` still accepts only the three
values, and no browser-version or browserslist option has appeared. Bun's CSS baseline is documented
at [bun.com/docs/bundler/css](https://bun.com/docs/bundler/css) as Edge 80+, Firefox 78+, Chrome 80+,
Safari 14+ and Opera 67+, with no option to change it.*

*Corrected 2026-09-17 on the issue numbers. Issue 40361 is open, and it is narrower than "browserslist
integration": its title is "Bun.build has no way to set CSS browser targets, so oklch() is always
downlevelled". Its body does record a browserslist config being set and ignored. Issue 40133 was
closed as a duplicate of it on 2026-09-13, with the maintainer noting both "ask for the same feature:
an option to set the CSS browser targets". Read from the GitHub API 2026-09-17 by a research agent; I
did not open them.*

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
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md) describes. A
`modernTargets` defaults to `'edge>=105, firefox>=106, chrome>=105, safari>=16.4, chromeAndroid>=105,
iOS>=16.4'` and "is passed on to `@babel/preset-env` when collecting polyfills for **modern chunks**",
overriding `build.target` when set. So it governs which polyfills the modern chunks receive rather
than being a second lowering target, which does not change the conclusion above.

*Sourced — the plugin's README at
[github.com/vitejs/vite/tree/main/packages/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy),
read 2026-09-16 by me. The `modernTargets` scope, left open then, was settled on 2026-09-17 by a
research agent reading the same README from the `main` branch; I did not re-open it.*

**The bundlers split on whether they read a browserslist config, and the split does not decide this
question.** Reading one natively, per their own documentation: webpack (`target: "browserslist"`),
Rspack (the same option), Rsbuild (its primary mechanism, defaulting to
`chrome >= 107, edge >= 107, firefox >= 104, safari >= 16` when none is given), Parcel (the
`browserslist` field in `package.json`), Next.js and the Angular CLI. Not reading one: Vite core,
esbuild, Rollup, Rolldown, Bun and Farm.

That split does not disqualify the second group, and nothing here should be read as though it did. The
floor's format is [open](what-format-declares-the-browser-floor.md) and is answered alongside this
question, with the bundler leading, because the bundler's native format is the binding input and both
checks read several formats. So a bundler is scored here on what it can build, and whatever carries
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

*Upgraded 2026-09-17 from "Unverified — no query was recorded that anyone could re-run". The queries
are now recorded.*

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
Issue 40077, open, filed 2026-08-22, includes a report of `toMatchSnapshot()` on a live DOM node
attempting a ~30 GB allocation. An 81-cell grid is exactly this shape.

*Sourced — oven-sh/bun issues 39768 and 40077, re-read 2026-09-17 by a research agent which quoted
39768's comparison table verbatim. I did not open them.*

*Corrected 2026-09-17, twice. **Issue 39768 is no longer open**: it was closed as a duplicate of issue
5540 on 2026-09-13, four days ago. The defect it describes is unchanged and 5540 is where it now
lives, so this is a change in where the problem is tracked rather than a fix. And **issue 40077 is not
about one bug**: it is an omnibus report bundling four separate findings, of which the ~30 GB
allocation is the first. Describing it as the snapshot issue understates its scope.*

*Deleted 2026-09-17: that a React suite "grew past 40 GB and made the machine unresponsive". The
re-check quoted 39768's table and did not carry this figure, and no source for it was recorded. It was
found unsourced.*

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

**Re-checked on 2026-09-17 and unchanged.** Recorded because a result that changed nothing is still a
result, and because this field was already flagged as perishable:

- Bun's worker-bundling gap. Issue 18601 is **still open** with nothing checked off, so it is not
  fixed. Issues 17705 and 29478 were closed as duplicates of it on 2026-08-13, and PR 23279 was closed
  unmerged by `github-actions[bot]` on 2026-02-19 with "Closing this PR because it has been inactive
  for more than 90 days". All four dates match what was recorded.
- Bun's branch coverage. Issue 7100 is still open, and the coverage documentation still shows only
  `% Funcs` and `% Lines`.
- Vite's `build.target`. The word browserslist still does not appear on the option's page.
- Vite's Baseline default. The resolved list `['chrome111', 'edge111', 'firefox114', 'safari16.4',
  'ios16.4']` and its 2026-01-01 pin **are** on the page, which settles a discrepancy recorded in
  [what format declares the browser floor?](what-format-declares-the-browser-floor.md) where my own
  earlier read did not surface them.
- Vite 8's GA on 2026-03-12 and Rolldown 1.0 on 2026-05-07, which is 56 days.
- vitejs/vite issue 23377 is still open. Its "against Vite 8.2.2" detail was not re-checked.
- Cloudflare's acquisition of VoidZero on 2026-06-04, the $1 million ecosystem fund and the MIT
  licences, now also confirmed against
  [blog.cloudflare.com/voidzero-joins-cloudflare](https://blog.cloudflare.com/voidzero-joins-cloudflare/).

*Read 2026-09-17 by a research agent via the GitHub API and each tool's own documentation. I did not
open them. The GitHub code-search ratio recorded above was not re-run and keeps its existing caveat.*
