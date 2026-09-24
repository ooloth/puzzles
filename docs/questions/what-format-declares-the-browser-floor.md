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

**Choosing the format before its readers chooses them, which is the wrong way round.** The tools
split on which formats they read, so a format chosen first eliminates tools by consequence rather
than on their merits. The bundler is now chosen. The two checks are not: the API check could be
`eslint-plugin-compat`, which reads only browserslist, or `eslint-plugin-baseline-js`, which reads
only a Baseline year, and the linter that hosts either is open at M2. So this question is answered
once those are chosen, and until then the build, as the only reader, names the floor's versions in
its own config.

## What would settle it

**One binding input has landed and the others have not.** The bundler is Vite, by
[ADR-0029](../decisions/0029-the-client-bundler-is-vite.md), and Vite takes an ES version or a
browser-and-version string and does not read a browserslist configuration. The syntax check, the API
check and the test matrix are chosen at M2, under [what runs the checks on every
change?](what-runs-the-checks-on-every-change.md) and [how is this tested across browsers and
platforms?](how-is-this-tested-across-browsers-and-platforms.md). This question is answered after
them.

What to weigh: whether each of the three consumers reads the format without an adapter, what an
adapter costs where one is needed, and whether the declaration still names its versions rather than
deriving them at read time, which
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
requires and which a resolving query does not satisfy.

**The readers are wider than the three
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
names, and all of them are in scope here.** Three more may have to know the floor: the fallback in
the entry document, if it detects a browser below the floor rather than being hidden by the bundle;
the cross-browser test matrix at M2, which has to know which versions to run on; and TypeScript's
`lib`, which decides which APIs type-check. The maintainer brought them into scope on 2026-09-23. If
that makes this question hard to settle, that is raised when it happens rather than avoided in
advance.

**Whether the fallback is a reader depends on
[what does a browser below the floor see?](what-does-a-browser-below-the-floor-see.md)** A document
that shows the message by default and has the bundle remove it reads nothing. A document whose own
script tests the browser against the floor reads it. So this question can be answered first, but it
has to price both shapes rather than assume one.

**The answer must not narrow [what renders the client?](what-renders-the-client.md).** That is the
most expensive open question at M1, and a format that only some renderers' build setups can feed
into the lowering target would remove candidates from it by consequence. So each renderer
candidate's path from the declaration to the target it actually lowers to is part of what this
question checks. The known case is Nuxt, whose own lowering setting defaults to `esnext`.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Demoted from an accepted record dated 2026-09-12 that chose a browserslist configuration. Its
disqualifying reason was that browserslist is the format the build tools and both classes of check
read without an adapter, and the field survey found that half the bundler field does not. The record
is recoverable from the commit that deleted it, and its rejections and risks are mined into the
Findings below.

## Options

*Rebuilt from the readers on 2026-09-23; the evidence for each line is under Findings.*

**Out: an ES year alone.** It cannot state a Safari 15 floor. The measured case is under Findings:
ES2022 admits static blocks, which Safari 15 cannot parse, and ES2021 rejects class fields, which it
can.

**Out: a Baseline year.** It can name only the floors its own years produce, and `baseline 2021`
lands on Safari 15.2. The floor's value is configuration under
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md),
so a format that cannot hold 15.0 or 15.4 takes that setting away. **Reverses if** the floor is ever
chosen as a Baseline year on its own merits.

**Still in: a browserslist file of `name >= version` lines, and a project-owned module of engine and
version.** Both reached the build and the checks with identical results. What separates them is
which reader needs an adapter. The file needs one for Vite, where the maintained package is broken
and the working one is stale and drops engines silently. The module needs one for
`eslint-plugin-compat`, which goes through an undocumented setting, and for es-check and stylelint,
which go through documented query options. That comparison assumes those three check tools, and none
of them is chosen yet. If the API check is `eslint-plugin-baseline-js` instead, neither survivor can
feed it without a lossy mapping from versions to a year.

**Foreclosed already: duplication**, by
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md).
**Not yet** is the current state rather than an option. The first build needs a floor, and at M1
it is the only reader, so it names the versions in its own config until the checks arrive.
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
format. So neither of these two check tools narrows the field; the bundler is the only consumer
that does. **This holds for these two tools only**: a Baseline-native API check exists, per the
finding below dated 2026-09-23, and it takes no browserslist.

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
to `chrome 123, edge 123, firefox 124, safari 17.4, ios_saf 17.4`, where the same query on the
same browserslist version gave `chrome 121, firefox 123` on 2026-09-16. Each figure is the lowest
version per engine: every query returns every version from there upwards, plus `and_chr` and
`and_ff`.

*Measured — `npx browserslist@latest <query>` against browserslist 4.29.0, run once per query in a
scratch directory on 2026-09-16 and again on 2026-09-23 by me. The two runs agree on the year
queries and differ only on the tier. Nothing was installed into this repository.*

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

- **Oxc's omission is deliberate rather than pending.** `oxc-browserslist` removed
  configuration-file support in v3.0.0 "to reduce binary size", so `.browserslistrc` and the
  `package.json` field are unsupported by design and aligned with Vite's approach. That is a
  stronger claim than "does not read one" and it makes the split unlikely to close from this side.
- **Rolldown's omission is pending rather than deliberate.** rolldown/rolldown issue 9152 is an open
  request for browserslist support, recording that Rolldown "currently expects explicit targets such
  as es2020, chrome61, or node18".
- **Next.js reads a browserslist config when one exists but does not default to one**, falling back
  to a fixed `["chrome 111", "edge 111", "firefox 111", "safari 16.4"]`. Angular CLI behaves the
  same way with its own internal default. Neither changes which group they are in.
- **browserslist is now at 4.29.0**, published 2026-09-15, which is the version the measurements
  below were run against. Baseline query support landed in 4.26.0 on 2025-09-12, confirmed against
  the changelog entry "Added Baseline queries" and the registry's release timestamp.
- **es-check was at 9.7.2 on 2026-09-17 and is at 9.8.1 on 2026-09-23**, and `--checkBrowser` is
  documented as "Use browserslist configuration to determine ES version (default: false)",
  introduced in v9. `eslint-plugin-compat`'s README still documents browserslist as its only
  configuration format.

*Sourced — each tool's own documentation, README or changelog, plus npm registry metadata and
rolldown/rolldown issue 9152, read 2026-09-17 by a research agent. I did not open them.*

**es-check reaches a little way into the API half.** Its `--checkFeatures` flag, combined with
`--checkBrowser`, also checks ES feature support per target browser rather than parsing syntax only.

*Sourced — its README and npm, read 2026-09-23 by a research agent. I did not open them.*

**Vite's own legacy plugin reads a browserslist config, so the Vite side is not uniformly
browserslist-blind.** `@vitejs/plugin-legacy` (8.2.3) takes `targets` as a browserslist query and,
when `targets` is unset, "will load the browserslist config sources and then fallback to the default
value". It lowers with `@babel/preset-env` into SystemJS chunks loaded by `<script nomodule>`, and
`renderModernChunks: false` makes it "only output the legacy bundles that support all target
browsers". Vite core's `build.target` still does not read browserslist: the build-options page gives
the type as `string | string[]`, transforms with the Oxc Transformer, and accepts "an ES version
(e.g. `es2015`), a browser with version (e.g. `chrome58`), or an array".

*Sourced — the plugin's README,
[github.com/vitejs/vite/blob/main/packages/plugin-legacy/README.md](https://github.com/vitejs/vite/blob/main/packages/plugin-legacy/README.md),
and the source of [vite.dev/config/build-options.html](https://vite.dev/config/build-options.html)
on `main`, both opened by me on 2026-09-23. Version from npm, read by a research agent on the same
date.*

**Lint tools exist that take Baseline vocabulary directly and do not take browserslist.** So the
earlier finding that both checks read browserslist holds only for the tools it named.
`eslint-plugin-baseline-js` (0.7.2, published 2026-09-21, pre-1.0) has a `use-baseline` rule taking
`"widely"`, `"newly"` or a year such as `{ available: 2020 }`. `@eslint/css` (2.0.0) has a
`use-baseline` rule taking the same vocabulary, for CSS. Both are built on the `web-features`
dataset. `eslint-plugin-compat` (7.0.2) still configures targets only through browserslist, with
`settings.browserslistOpts.env` to select an environment and nothing else.

*Sourced — the `eslint-plugin-baseline-js` repository, the `@eslint/css` repository and npm, read
2026-09-23 by a research agent, which I did not open. `eslint-plugin-compat`'s README opened by me
on 2026-09-23.*

**TypeScript's `target` and `lib` take ES-year values only**, from `ES3` to `ESNext`, plus
environment libraries such as `DOM`. Neither accepts a browser version.

*Sourced — [typescriptlang.org/tsconfig](https://www.typescriptlang.org/tsconfig/#target), read
2026-09-23 by a research agent. I did not open it.*

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

### The field rebuilt from the readers, 2026-09-23

**The declaration has at least seven readers, and they take four native formats.** Each reader is
listed with what it reads without an adapter.

- **Build lowering target.** Vite 8.3.0 `build.target`, via Oxc, reads engine-and-version strings
  such as `safari15`, or an ES year.
- **CSS target.** Vite's `build.cssTarget` reads the same strings as `build.target`. When Lightning
  CSS transforms CSS, `css.lightningcss.targets` reads Lightning CSS's own packed-integer object.
- **Syntax check over the bundle.** es-check 9.8.1, acorn, ESLint's `ecmaVersion` and
  `eslint-plugin-es-x` 10.0.1 read an ES year. es-check also derives one from browserslist.
- **API check over source.** `eslint-plugin-compat` 7.0.2 and stylelint's
  `no-unsupported-browser-features` 8.1.2 read browserslist. `eslint-plugin-baseline-js` 0.7.2 and
  `@eslint/css` 2.0.0 read a Baseline year or tier.
- **Cross-browser test matrix.** None of the above. Playwright 1.63.0 runs one current WebKit and
  cannot run Safari 15 at all. BrowserStack, Sauce Labs and LambdaTest capabilities name an OS major
  version and a device.
- **TypeScript `lib`.** TypeScript 7.0.2 reads an ES year plus unversioned groups such as `DOM`.
- **Below-floor fallback.** Written here, if it reads the floor at all, so it reads whatever it is
  written to read.

*Sourced — each tool's README, documentation or source and the npm registry, read 2026-09-23 by a
research agent. I opened Vite's `build-options` page, its `plugins/css.ts` source and
`eslint-plugin-compat`'s README myself. The rest are the agent's.*

**The matrix and `lib` can be fed from no format without a hand-written step.** No converter in the
field targets a cloud grid's capability format, and no browser version maps onto a `lib` setting
without choosing which ES-year bucket to round to. So those two readers cost the same under every
candidate and do not discriminate.

**Lightning CSS is a reader that ignores `build.target` unless it is told otherwise.** With
`css.transformer: 'lightningcss'`, Vite fills `css.lightningcss.targets` from its own Baseline
Widely Available list when nothing is set, not from `build.target`. With the default transformer,
`build.cssTarget` defaults to `build.target`, and Vite converts it internally for Lightning CSS's
minifier. So whichever format is chosen, a build that switches CSS transformer has to set that
target explicitly or it silently lowers CSS to Safari 16.4.

*Sourced — `packages/vite/src/node/plugins/css.ts` on `main`, `resolveCSSOptions` and the minifier
call, and the `build.cssTarget` entry on vite.dev, opened by me 2026-09-23.*

**A floor at Safari 15 needs minor-version precision, because the 15.0 to 15.4 gap is where APIs
land.** `Array.prototype.at`, `Object.hasOwn` and `structuredClone` arrive at Safari 15.4. Class
static blocks and RegExp lookbehind arrive at 16.4. So a format that can only say "15", or only name
a year that lands at 15.2, cannot say which side of 15.4 the floor sits on. Which side it should sit
on is the value, which
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
leaves to configuration. What this question owes is a format able to state either.

*Sourced — `@mdn/browser-compat-data` on `main`, `version_added` for Safari read from the raw JSON
by me on 2026-09-23.*

**An ES year cannot state this floor.** Safari 15 supports part of ES2022: class fields and private
brand checks, but not static blocks. es-check maps a `safari 15` browserslist query to edition 13,
ES2022, and passes a file containing a static block. Rounding down to ES2021 rejects class fields
that Safari 15 parses. Either way the declaration no longer says which browsers it means, and the
syntax check built on it is coarser than the floor.

*Measured — es-check 9.8.1, `npx es-check --checkBrowser --browserslistQuery "safari 15" s.js` on a
file containing `class A { static { f() } }`, run once by me on 2026-09-23 in a scratch directory;
it printed "All files are ES13 compatible". Its Safari table is `lib/constants/versions.js`, read by
a research agent.*

**Oxc fails loudly on a bad target and quietly on two runtime gaps.** Measured on `oxc-transform`
0.151.0 by me, 2026-09-23, one run per case:

- `safari15`, `safari15.0` and `ios15` are accepted. A bare `edge` or an unknown `foobar99` is an
  error, and the output is empty.
- A class static block is lowered for `safari15` and kept for `safari16`, which is correct.
- RegExp lookbehind is rewritten as `new RegExp("(?<=a)b", "")` at `safari15` and at `safari16`.
  That avoids a parse error in the whole file and still throws when that line runs on a Safari below
  16.4.
- A private brand check, `#x in o`, is lowered into `WeakMap` helpers for every Safari target below
  16, though Safari 15.0 supports it. That is extra output rather than broken output. It is open as
  oxc-project/oxc issue 21602.

None of this depends on the format. It is recorded because it limits what any declaration can
deliver through this build.

**The format does not narrow the renderer field.** Every candidate's Vite plugin leaves lowering to
`build.target` and none reads browserslist: `@vitejs/plugin-react` 6.1.1, `@preact/preset-vite`
2.10.6, `@vitejs/plugin-vue` 6.0.9, `@sveltejs/vite-plugin-svelte` 7.3.1 and `vite-plugin-solid`
2.11.14. Lit and direct DOM have no plugin. Nuxt 4.5.2 runs on Vite 8, and its own docs say to
"simply tell vite your desired target which nuxt will respect". Two things reach past
`build.target`, and both concern the renderer rather than the format:

- **Lit with standard decorators needs a Babel pass**, because Oxc does not lower standard
  decorators (oxc-project/oxc issue 9170, open). Babel's `@babel/preset-env` takes browserslist or
  an engine-to-version object, so that pass becomes one more reader.
- **Svelte 5's `$state.snapshot` needs Safari 15.4**, per Svelte's browser-support page. That is an
  API above a 15.0 floor, and a question for the renderer rather than for this file.

*Sourced — plugin READMEs, framework docs and the npm registry, read 2026-09-23 by a research agent.
I did not open them.*

**Converters exist in both directions, so no candidate is stranded.** From browserslist to Vite's
strings: `esbuild-plugin-browserslist` 4.0.0 and `browserslist-to-esbuild` 2.1.1, as above. From
browserslist to an ES year: `browserslist-to-es-version` 1.4.2 (published 2026-05-29). From a
Baseline year to versions: `baseline-browser-mapping` 2.11.25 (published 2026-09-17), whose
`getCompatibleVersions` returns explicit versions per engine. From browserslist to Lightning CSS:
`browserslistToTargets`, exported by `lightningcss` itself. From Vite's strings to browserslist no
package was found. The mapping is a rename per engine, such as `ios15` to `ios_saf >= 15`.

*Sourced — npm registry and each project's README, read 2026-09-23 by a research agent. I did not
open them.*

### A spike over the two surviving formats, 2026-09-23

**What was run.** A scratch Vite 8.3.0 project outside this repository, with one entry document, one
script and one stylesheet. The script holds a class with a private field, a static block and a brand
check, `??` and `??=`, `structuredClone`, `Object.hasOwn`, `Array.prototype.at` and a lookbehind.
The stylesheet holds a range media query, nesting and `inset`. The floor was declared three ways,
each naming Safari 15, iOS 15, Chrome 96, Edge 96 and Firefox 95: a hand-written `build.target`
array as the baseline, a `.browserslistrc` of `name >= version` lines, and a module exporting an
engine-to-version object mapped to Vite's strings in `vite.config.js`. Each was built once, and each
check was run once against each declaration, by me on 2026-09-23. The spike was deleted afterwards.

**The module reaches Vite without an adapter, and the output is byte-identical** to the hand-written
target, compared with `diff -r` over the two `dist` directories.

**The maintained browserslist adapter does not work with Vite 8 as its README shows it.**
`resolveToEsbuildTarget(browserslist(...))` from `esbuild-plugin-browserslist` 4.0.0 returns every
version of every engine, and the build stops with `'chrome150' is already specified`. The failure is
loud. The older `browserslist-to-esbuild` 2.1.1 collapses each engine to its lowest version, returns
`chrome96, edge96, firefox95, ios15, safari15`, and its build is byte-identical to the baseline.

**That older adapter drops an engine it does not map without saying so.** Adding `samsung >= 16` to
the file left its output unchanged, although Oxc accepts a `samsung` target. A misspelled name,
`safarii >= 15`, throws `Unknown browser safarii`. A floor of `safari >= 15.4` converts to
`safari15.4`, so minor versions survive the conversion.

**The API check gives the same result from either declaration.** `eslint-plugin-compat` 7.0.2
reading the file, and the same plugin given the module's versions as browserslist strings, each
reported `structuredClone`, `Object.hasOwn` and the lookbehind as unsupported in Safari 15. Neither
reported `this.#cells.at(-1)`, because the plugin cannot tell the receiver is an array.

**With no declaration at all, the API check falls back silently and misses most of it.** Removing
both declarations left one error, the lookbehind, reported against `op_mini all` and `KaiOS 2.5`,
the browsers in browserslist's defaults. Nothing warned that the floor was missing.

**The module reaches the API check only through a setting the plugin does not document.** The
plugin's source reads `settings.browsers`, `settings.targets` or the rule's first option as a
browserslist query. Its README documents only a browserslist config file, and its changelog records
the ESLint-side targets as behaviour that "might be deprecated in the future". Where both a file and
a setting exist it merges the two lists rather than preferring one.

*Sourced — `src/rules/compat.ts`, `src/helpers.ts`, `README.md` and `CHANGELOG.md` on `main` of
amilajack/eslint-plugin-compat, opened by me on 2026-09-23.*

**The syntax check passed the built bundle from either declaration**, as ES13, because the build had
already lowered the static block. es-check read the file with `--checkBrowser` and the module
through `--browserslistQuery`, which is documented.

**CSS is lowered only when the build minifies.** With `minify: false` the stylesheet came out
unchanged, range query and nesting included, although Safari 15 has neither. With minification on,
Lightning CSS rewrote the range query as `not (max-width:450px)` and flattened the nesting.
Minifying is Vite's production default, so this matters only to a build that turns it off. It holds
under both formats.
