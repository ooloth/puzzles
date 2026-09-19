---
opened: 2026-09-16
status: open
resolves_into: decision
---

# What format declares the browser floor?

## Why it matters

[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
puts the floor in one declaration read by three consumers and does not say what format that
declaration takes. A shared declaration is only shared if everything that has to read it can, so the
format is what decides whether that shape holds at all.

**The consumers are off-the-shelf tools rather than code written here.** A bundler's lowering target,
a parser run over built output and a linter run over source all exist already, so the format they
read is a property of the field rather than a preference. [../problem.md](../problem.md) ranks clarity
over cleverness because one person maintains this, which prices an adapter per consumer as three more
things to maintain than the shape needs.

**Choosing the format first decides the bundler, which is the wrong way round.** The bundlers split on
which formats they read, so a format chosen before the bundler eliminates bundlers by consequence
rather than on their merits, and through the meta-frameworks it reaches the renderer as well. The
format is the smallest thing in that chain and it was settling the largest.

## What would settle it

**The binding input has landed.** The bundler is Vite, by [ADR-0029](../decisions/0029-the-client-bundler-is-vite.md), and Vite takes an ES
version or a browser-and-version string and does not read a browserslist configuration. So what is
open is no longer which bundler leads; it is which format carries the declaration and what the
adapter between it and Vite costs.

What to weigh: whether each of the three consumers reads the format without an adapter, what an
adapter costs where one is needed, and whether the declaration still names its versions rather than
deriving them at read time, which
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
requires and which a resolving query does not satisfy.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Demoted from an accepted record dated 2026-09-12 that chose a browserslist configuration. Its
disqualifying reason was that browserslist is the format the build tools and both classes of check
read without an adapter, and the field survey found that half the bundler field does not. The record
is recoverable from the commit that deleted it, and its rejections and risks are mined into the
Findings below.

## Options

*A browserslist configuration, naming explicit versions.* Read natively by the webpack lineage and by
both check tools. Its query language also accepts Baseline vocabulary, so it is a superset rather than
a rival of the option below.

*Baseline vocabulary, as a tier or a year.* Read directly by a small set of lint tools. Expressible
inside a browserslist query as well, which makes "browserslist or Baseline" a false choice.

*An ES version alone*, such as `es2017`. The narrowest thing every consumer understands, and it says
nothing about which browsers it corresponds to.

*Whatever format the chosen bundler prefers, duplicated for the checks.* Needs no decision and follows
the tooling.
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
rejects duplication, so this is listed as the option that record already forecloses rather than as a
live one.

*Invent a format and adapt each consumer.* Owes nothing to a third-party dataset and can say things
the others cannot.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The three consumers do not agree on a format, and the disagreement is inside the bundler role.**
Reading a browserslist config natively, per their own documentation: webpack (`target: "browserslist"`),
Rspack (the same option), Rsbuild (its primary mechanism), Parcel (the `browserslist` field in
`package.json`), Next.js and the Angular CLI. Not reading one: Vite core, esbuild, Rollup, Rolldown,
Oxc, Bun and Farm, all of
which take an environment-name-plus-version string such as `chrome58` or an ES-year string such as
`es2020`. The split tracks tool generation rather than quality: the browserslist-native set is the
webpack lineage and the other set is the esbuild and Oxc lineage.

*Sourced — each tool's own documentation, read 2026-09-16. Vite's `build.target` page and Oxc's
lowering page I opened myself and confirmed the word browserslist appears on neither. The webpack,
Rspack, Rsbuild, Parcel, Next and Angular claims are a research agent's and I did not open them.*

**Bun's bundler is not in that comparison at all.** Its `target` selects a runtime category —
`browser`, `bun` or `node` — and resolves export conditions. It is not a syntax level, so there is
nothing for a floor to convert into.
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md) already excludes it
for the separate reason that it does not down-convert syntax at all.

*Sourced — [bun.com/docs/bundler](https://bun.com/docs/bundler), read 2026-09-16 by me.*

**Both checks read a browserslist config, so the format question is really a bundler question.**
`es-check` parses built output against an `ecmaVersion` and, since v9, reads a browserslist config
via `--checkBrowser`. `eslint-plugin-compat` reads browserslist exclusively and offers no other
format. So neither check narrows the field; the bundler is the only consumer that does.

*Sourced — each project's README, read 2026-09-16 by a research agent. I did not open them.*

**Browserslist accepts Baseline queries, which makes the two formats one format.** Since browserslist
4.26.0, released 2025-09-12, the query language accepts `baseline widely available`,
`baseline newly available`, `baseline widely available on YYYY-MM-DD` and year queries such as
`baseline 2022`.

*Sourced — the browserslist README, and the version and date from the package's own release metadata,
read 2026-09-16 by a research agent. The behaviour I confirmed myself by running the queries below.*

**Measured, running browserslist 4.29.0 locally on 2026-09-16.** `baseline 2021` resolves to
`chrome 96, edge 96, firefox 95, safari 15.2-15.3, ios_saf 15.2-15.3`. `baseline 2020` resolves to
`chrome 87, edge 87, firefox 83, safari 14, ios_saf 14.0-14.4`. `baseline widely available` resolves
to `chrome 121, edge 121, firefox 123, safari 17.4, ios_saf 17.4`.

*Measured — `npx browserslist@latest <query>` against browserslist 4.29.0, run once per query in a
scratch directory on 2026-09-16 by me. Nothing was installed into this repository.*

**So a Baseline year target lands inside the Safari 15 family, and the tier does not.** The floor
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
names is the Safari shipping with iOS 15. `baseline 2021` reaches Safari 15.2-15.3, which is inside
that major version but is not the launch build; `baseline widely available` is six major versions
above it. The demoted record rejected Baseline on the tier alone and did not consider the year
targets.

**A resolving query cannot carry this declaration, and the evidence is a live discrepancy.** Vite
documents its `'baseline-widely-available'` default as resolving to
`['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4']`, pinned to 2026-01-01 for that major
release. The same tier queried live resolves six versions higher, as measured above. That is
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)'s
"a line that moves on its own cannot be the scope of a promise" demonstrated rather than argued, and
it applies to any tier query whatever format carries it.

*Sourced for Vite's pinned list — [vite.dev/config/build-options.html](https://vite.dev/config/build-options.html),
which states that the default "targets the minimum browser versions compatible with Baseline Widely
Available as of a date fixed for each major release (`2026-01-01` for this major). Specifically, it is
`['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4']`." Confirmed on the page by two
readers, 2026-09-16 and 2026-09-17. The list is on the page, so a read that does not surface it has
missed it rather than found the page changed.*

*Measured for the live resolution — by me, with the method given above.*

**An adapter is one package or roughly sixty-five lines, not one per consumer.** `browserslist` exposes
a programmatic API returning an array of `"<name> <version>"` strings. Converting those to the
`name+version` form esbuild, Vite, Oxc and Rolldown accept is what `esbuild-plugin-browserslist` does,
at 4.0.0 published 2026-05-06 with roughly 87,000 weekly downloads, and what `browserslist-to-esbuild`
does in ninety-four lines of which sixty-five are code, at 2.1.1 with no release since 2024-01-08. The
conversion is not a one-liner: it renames `ios_saf` to `ios` and `android` to `chrome`, truncates
version ranges, drops engines the target format does not know, and collapses duplicates to the oldest
surviving version after renaming.

*Sourced — npm registry metadata for both packages and the npm downloads API, plus
`browserslist-to-esbuild`'s `src/index.js` read directly and its line counts and conversion steps
confirmed against the source. Read 2026-09-17 by a research agent. I did not open them.*

*A repository's `pushed_at` is a commit and not a release, and the two get confused for each other in
exactly this kind of listing. `esbuild-plugin-browserslist`'s 4.0.0 published 2026-05-06; its
repository has commits after that. Neither figure changes what the adapter costs, which is what this
finding is for.*

**Every tool in the split above holds its classification against its own documentation.** Four
details that the split alone does not carry:

- **Oxc's omission is deliberate rather than pending.** `oxc-browserslist` removed configuration-file
  support in v3.0.0 "to reduce binary size", so `.browserslistrc` and the `package.json` field are
  unsupported by design and aligned with Vite's approach. That is a stronger claim than "does not read
  one" and it makes the split unlikely to close from this side.
- **Rolldown's omission is pending rather than deliberate.** rolldown/rolldown issue 9152 is an open
  request for browserslist support, recording that Rolldown "currently expects explicit targets such
  as es2020, chrome61, or node18".
- **Next.js reads a browserslist config when one exists but does not default to one**, falling back to
  a fixed `["chrome 111", "edge 111", "firefox 111", "safari 16.4"]`. Angular CLI behaves the same way
  with its own internal default. Neither changes which group they are in.
- **browserslist is now at 4.29.0**, published 2026-09-15, which is the version the measurements below
  were run against. Baseline query support landed in 4.26.0 on 2025-09-12, confirmed
  against the changelog entry "Added Baseline queries" and the registry's release timestamp.
- **es-check is at 9.7.2** and `--checkBrowser` is documented as "Use browserslist configuration to
  determine ES version (default: false)", introduced in v9. `eslint-plugin-compat`'s README
  still documents browserslist as its only configuration format.

*Sourced — each tool's own documentation, README or changelog, plus npm registry metadata and
rolldown/rolldown issue 9152, read 2026-09-17 by a research agent. I did not open them.*

**Mined from the demoted record, and still standing.** The version data behind browserslist is a
third-party dataset with its own release cadence, and naming versions explicitly limits the exposure
to how a named version is interpreted rather than to which versions a query resolves to. Choosing a
format narrows the tool field before the tools are chosen, and the demoted record named that as a risk
reaching the two check roles. It reaches the bundler role as well, which is what this question exists
to stop.

**Mined from the demoted record, and now false.** It held that browserslist "is the format the build
tools and both classes of check read without an adapter". It also held that Baseline "cannot express
this floor" because its vocabulary is "a tier or a year evaluated against a fixed core browser set, so
the only floors it can name are the ones its own promotion rule produces". Both are contradicted by
the findings above: half the bundler field reads no browserslist config, and a Baseline year target
reaches Safari 15.
