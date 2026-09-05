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

**The strongest finding below is conditional on a matrix nobody has written.** Bun's bundler does not
down-convert syntax, and how much that costs depends entirely on which browsers and versions have to
run this. That is
[which browsers and versions must this support?](which-browsers-and-versions-must-this-support.md),
and it is an input here rather than a consequence.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split out of the rendering question.

## Options

The TypeScript toolchains, since
[ADR-0007](../decisions/0007-that-language-is-typescript.md) settled the language — Vite and Bun being
the obvious two, with a framework's own tooling a third where it has one.

Bun remains a live option for the parts of the toolchain that are not the browser build, and those
are separate choices. Whether it is disqualified for the browser build turns on the syntax finding
below, which is conditional on the browser matrix.

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

*Sourced — [bun.com/docs/bundler](https://bun.com/docs/bundler), read 2026-09-04 by me, against Bun
1.4.1. Browserslist integration is requested and unimplemented in Bun issues 40133 and 40361.*

**How much that costs is not established, because the browser matrix is not written.** This finding
was previously recorded as deciding the question on its own. It cannot, because its consequence —
"recent syntax reaches whatever device opens the app" — has no weight until something says which
devices those are. See
[which browsers and versions must this support?](which-browsers-and-versions-must-this-support.md).

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

**No precache-manifest tooling is built for Bun's bundler.** No `bun-plugin-workbox` equivalent was
found. `workbox-build`'s `injectManifest` and `generateSW` are bundler-agnostic and can be chained
as a post-build step over Bun's output directory, so this is buildable, but it is a pipeline we
would own alone.

*Sourced — an absence established by direct documentation review and search 2026-09-04 by a research
agent, which is weaker than a positive finding. Nothing states that no such tool exists.*

**Almost nobody ships a browser build with it.** GitHub code search returns 1,089,536 hits for
`filename:vite.config.ts` and 855 for `"Bun.build(" language:javascript`, a ratio near 1,274:1;
comparing `"vite" filename:package.json` at 5,169,152 gives 6,047:1. No framework among SvelteKit,
Astro, TanStack Start, Nuxt, React Router, Qwik and SolidStart uses Bun's bundler for browser
builds; the pattern is Bun as runtime or package manager underneath a Vite build. Every bug in that
path would be ours to find first, which is the opposite of what one maintainer wants.

*Measured — GitHub code search hit counts, run 2026-09-04 by a research agent. Hits are files, not
repositories or maintained projects, so these bound an order of magnitude rather than a ratio. The
figure of "roughly eight hundred" previously recorded here has no source and is not reproducible.*

**Its test runner has a watch mode.** `bun test --watch` is documented and works. It reruns the whole
suite on any change rather than only affected tests (issues 4825 and 7546) and does not detect newly
added test files (issue 8342), which is a smaller complaint than the absence previously recorded.

*Sourced — [bun.com/docs/cli/test](https://bun.com/docs/cli/test), read 2026-09-04 by a research
agent. I did not open it.*

**It reports no branch coverage.** Bun's coverage reporter emits "% Funcs" and "% Lines" only, in
`text` and `lcov`. It accepts a `statements` key and does not enforce it. Issue 7100 requesting
statement and branch coverage is open, last active 2026-08-29. Branch coverage is exactly what a
pure rules module most wants measured.

*Sourced — [bun.com/docs/test/coverage](https://bun.com/docs/test/coverage) and oven-sh/bun issue
7100, read 2026-09-04 by a research agent. I did not open them.*

**Its snapshot serialisation fails catastrophically on DOM-shaped values.** Issue 39768, open, filed
2026-08-20 and reproduced on both 1.4.0 and 1.3.14, reports that snapshotting a JSDOM fragment
containing a single `<button>` produced a 146,955-line, 7.5 MB snapshot file, against Jest's 9-line,
4 KB output for the same input; a React suite grew past 40 GB and made the machine unresponsive.
Issue 40077, open, filed 2026-08-22, reports `toMatchSnapshot()` on a live DOM node attempting a
~30 GB allocation and dying with an uncatchable OOM. An 81-cell grid is exactly this shape.

*Sourced — oven-sh/bun issues 39768 and 40077, read 2026-09-04 by a research agent. I did not open
them. These replace an unreproducible anecdote about a six-second timeout that no issue in the
tracker matches.*

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

**The AI-rewrite story is not a reason to decline Bun, and the numbers previously recorded here were
invented.** Bun 1.4.0 was a rewrite from Zig to Rust, and Bun's own account of it is candid: the
port ran as roughly 50 Claude Code workflows over 11 days, the branch was named `claude/phase-a-port`
at 6,755 commits, and the stated motive was memory safety rather than performance. The claim recorded
here that issue volume matched the previous major from near-identical baselines while crash reports
fell more than threefold against a seven-times-larger install base has no source: a search found
nothing publishing those comparisons, official or third-party. What can be established is thinner
and points the other way. One patch release has followed in 15 days, and several regressions against
1.4.0 are open, including issues 39768 and 40077 above.

*Sourced — [bun.com/blog/bun-in-rust](https://bun.com/blog/bun-in-rust), read 2026-09-04 by a
research agent. The deleted statistics were tagged Measured in this file with no method and could
not be found by search; treat any reappearance of them as fabricated.*
