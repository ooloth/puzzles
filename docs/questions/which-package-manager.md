---
opened: 2026-08-31
status: answered
resolves_into: decision
---

# Which package manager?

## Why it matters

The smallest decision on the stack list, recorded because it is the one most likely to be made by
typing whatever came to mind, and because two of its failure modes are quiet rather than loud.

## What would settle it

**It survived the runtime.** Two of the candidate runtimes shipped a package manager and would have
answered this by consequence, but [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) chose Node, which ships npm without requiring it. So
this is still a choice, and it is now the first open question in M1's order.

**The field below is not the field.** It holds pnpm, npm and Bun. Bun is out as a package manager for
the same reason it is out as a runtime — adopting its installer means adopting its runtime — and yarn
was never listed at all. Rebuild it from the registry before deciding, or the decision is made over a
shortlist somebody assembled for a different question.

Install speed matters least. What matters is whether the lockfile stays readable to whatever
tooling runs in continuous integration, and whether the trust model has surprises.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, filling in the stack decisions that had no question of their own.

## Options

**Each candidate has an install-script policy, and they do not all default to denying.** pnpm and
Yarn deny by default in the versions you would install; npm denies from 12 but ships 11 with Node,
which does not. So there are two things to compare rather than one: which allowlist shape is least
likely to be got wrong, and what each candidate's default actually is *on the machine as it arrives*.
Nothing here has compared them on either.

*pnpm.* Content-addressed store, strict by default. Install scripts are governed by `allowBuilds`.

*npm.* Most universally understood. **The candidate is npm 12, not the npm that arrives with Node**
— see "Each candidate is scored at its best available version" under **Findings**. npm 12 blocks
dependency install scripts by default and no released Node line bundles it, so taking npm means
installing it on every machine, which is the same class of chore that counts against the others.
Measured under **Findings**.

*Bun.* **Out**, by [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md): its installer is part of its runtime and that runtime is not this
one. Its install-script model is recorded under **Findings** because the comparison of allowlist
designs is still useful, not because it is a candidate.

*yarn.* Missing from this list until 2026-09-19 and unexamined. Its presence here is a marker that the
field needs rebuilding rather than a case for it.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**`trustedDependencies` replaces the default allowlist rather than extending it, and Bun documents
this itself.** Both its lifecycle-scripts page and its install guide say: "Defining
`trustedDependencies` in your `package.json` replaces this default list rather than extending it, so
also list any packages from the default list whose lifecycle scripts you still need." The default list
is `src/install/default-trusted-dependencies.txt` in Bun's own repository and holds **367 entries**, so
trusting one package does untrust several hundred others.

*Sourced — [bun.com/docs/pm/lifecycle](https://bun.com/docs/pm/lifecycle) and
[bun.com/guides/install/trusted](https://bun.com/guides/install/trusted) for the quote, and the
default-trusted-dependencies file read directly for the count. Read 2026-09-17 by a research agent. I
did not open them.*

*This is documented behaviour rather than a hidden trap, and the distinction matters for how it is
weighed: Bun states it on the page you would be reading in order to set the field.*

**The lockfile claim is still undocumented, and the evidence for it is user reports.** Nothing on
Bun's lockfile page, its `install` CLI page or its text-lockfile announcement addresses what happens
when a lockfile was written by a different Bun version. What exists is issue reports of hard failures
rather than graceful degradation, including oven-sh/bun 15288, where a `--frozen-lockfile` run against
a lockfile from a different version fails with "error: lockfile had changes, but lockfile is frozen"
and no explanation of why.

*Unverified at its source, and corroborated by issue reports — three Bun documentation pages were
searched on 2026-09-17 by a research agent and none addresses cross-version lockfile compatibility.
Treat the behaviour as reported rather than specified, and note that an unspecified behaviour can
change without a changelog entry.*

**The comparison this file was built on has gone stale, and it is the most consequential finding
here.** The Options above frame Bun as carrying footguns that pnpm and npm do not. Both of the others
have since changed in the same direction:

- **pnpm removed `onlyBuiltDependencies`, `onlyBuiltDependenciesFile`, `neverBuiltDependencies`,
  `ignoredBuiltDependencies` and `ignoreDepScripts` in v11**, replacing all five with a single
  `allowBuilds` map. Current pnpm is 12.4.2, published 2026-09-15. The default is still deny: "Packages
  not listed in `allowBuilds` are disallowed by default and are treated as unreviewed."
- **npm reversed its default in 12.0.0, released 2026-07-08**: "Dependency lifecycle scripts are now
  blocked by default unless allowed by the root package's `allowScripts` policy." Current npm is
  12.0.2.

So all three now deny dependency install scripts by default, through three different mechanisms with
three different configuration shapes. **The question is no longer whether a candidate has a trust
footgun; it is which allowlist shape is least likely to be got wrong**, and nothing here has compared
them on that. Whether an older toolchain is in use is worth checking separately: a machine still on
npm 11 has the old permissive default and nothing announces it.

*Sourced — [pnpm.io/settings/build](https://pnpm.io/settings/build) and
[the npm 12.0.0 release notes](https://github.com/npm/cli/releases/tag/v12.0.0), plus registry metadata
for both current versions, read 2026-09-17 by a research agent. I did not open them.*

**So "neither is disqualifying" still holds, and the reason has changed.** It was that Bun's two
hazards were survivable. It is now that every candidate has an install-script policy to configure and
none of them has been compared on how easy it is to configure correctly.

### Pass of 2026-09-19

**npm's two merits do not arrive together.** npm 12.0.0 blocks dependency lifecycle scripts by
default. It is the npm you would not have by default. **No released Node line bundles npm 12.** The
line
[ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md) selects is 26, and
v26.9.0 ships npm **11.19.1**, which has the old permissive default. So npm's headline case, that it
comes with Node and needs no installing, and npm's safety posture are two different versions of npm.
Taking npm means either accepting the permissive default or installing npm 12 over the bundled one,
and the second is the same class of chore that counts against the others.

The earlier entry gestures at this as an edge case — "a machine still on npm 11 has the old
permissive default and nothing announces it" — and it is not an edge case. It is what every machine
has by default today.

*Measured — the `npm` field per release in <https://nodejs.org/dist/index.json>, parsed by me on
2026-09-19: v26.9.0 → 11.19.1, v24.21.0 → 11.19.0, v22.23.2 → 10.9.8.*

*An earlier version of this entry said "every currently supported Node line bundles npm 11.19.x".
That is false and has been replaced: v22 is supported until 2027-04-30 per Node's `schedule.json`
and ships npm 10.9.8. The part that decides anything survives, because this project runs 26.*

**Corepack was removed in Node v25, and nothing in this file had noticed.** It is how a
`packageManager` field turned into an installed binary, and it was the answer to "how does pnpm or
Yarn get onto this machine" for as long as the question has existed.
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) is what made this
relevant, by choosing the runtime that dropped it. Node's Corepack repository states it "is
distributed with Node.js from version 14.19.0 up to (but not including) 25.0.0", v24's documentation
page carries "Corepack will no longer be distributed starting with Node.js v25", and v26 has no such
page — the URL 404s. It is still installable from the registry.

*Sourced — <https://github.com/nodejs/corepack> README, <https://nodejs.org/docs/latest-v24.x/api/corepack.html>,
and the 404 from <https://nodejs.org/docs/latest-v26.x/api/corepack.html>, all checked by me on
2026-09-19.*

**So how each candidate is delivered is now a property that separates them, and it is scored here
rather than deferred.** It cannot be settled after this question, because how awkward a tool is to
install is part of what ranks it.

- *pnpm* documents three Corepack-free paths — `pnpm self-update`, a standalone script from
  `get.pnpm.io`, and `npx get-pnpm` — and its installation page does not mention Corepack at all.
  It also states "pnpm 12 is a native executable and does not require Node.js after it is installed."
- *Yarn* still opens its install instructions with `npm install -g corepack`, so on a current Node it
  requires installing the thing Node removed before it can install itself.
- *npm* arrives bundled, at a version whose default this project would not want, per the finding
  above.

*Sourced — <https://pnpm.io/installation> and <https://yarnpkg.com/getting-started/install>, read
2026-09-19 by a research agent. I did not open either; the Corepack and bundled-npm claims they sit
beside are ones I did check.*

**What *pins* a package manager version across machines is a different question and is tracked
separately**, at
[what pins the toolchain versions across machines?](what-pins-the-toolchain-versions-across-machines.md).
Corepack's removal is why it needs an owner: it was the mechanism, it is gone, and the same
mechanism has to pin Node too.

**The field still has not been argued, and as of the pass below it has at least been enumerated.**
Yarn Modern is `@yarnpkg/cli` 4.18.0, published 2026-07-29, while the classic `yarn` package sits at
1.22.22 from 2024-03-09.

*Sourced — npm registry metadata, read 2026-09-19 by a research agent, and re-read by me the same
day.*

### Verification pass of 2026-09-19

**Every claim in this file was re-checked. Two were wrong and are corrected in place above**: the
npm-bundling claim overstated its scope, and pnpm's current version had moved. Nothing was deleted,
because nothing here turned out to be unsourced.

**Current versions, read by me from the npm registry on 2026-09-19.** pnpm **12.5.1**, published
2026-09-18 — the earlier entry's 12.4.2 was correct when written on 2026-09-15 and is now two
releases behind, which is this folder's stated decay rate arriving on schedule. npm **12.0.2**,
published 2026-07-29. `@yarnpkg/cli` **4.18.0**, 2026-07-29. `yarn` (classic) **1.22.22**,
2024-03-09. `corepack` **0.36.0**, 2026-08-28, so it is still published as well as still installable.

*Measured — `registry.npmjs.org` metadata for each package, parsed by me on 2026-09-19.*

**Yarn Modern blocks third-party install scripts by default, and the config shape is a boolean plus
a per-package override.** `enableScripts` is documented as: "Define whether to run postinstall
scripts or not. If false (the default), Yarn will not execute the `postinstall` scripts from
third-party packages when installing the project (workspaces will still see their postinstall scripts
evaluated, as they're assumed to be safe if you're running an install within them)." Re-enabling one
package is `dependenciesMeta.<pkg>.built` in `package.json`.

*Sourced — <https://yarnpkg.com/configuration/yarnrc>, opened by me on 2026-09-19.*

**Yarn's only documented bootstrap path is Corepack.** The installation page's first instruction is
`npm install -g corepack`, followed by `yarn init -2`. The other two paths it documents —
`yarn set version stable` and `yarn set version from sources` — are commands run with Yarn already
present, so neither gets Yarn onto a bare machine. The second carries Yarn's own warning that it
"can't leverage Corepack and will need to store the Yarn binary inside the `.yarn/releases` folder".
So on a Node that no longer ships Corepack, adopting Yarn means installing Corepack from the registry
first.

*Sourced — <https://yarnpkg.com/getting-started/install>, opened by me on 2026-09-19.*

**npm 12 runs on Node 26, so upgrading over the bundled npm is available rather than blocked.** Its
`engines` field is `^22.22.2 || ^24.15.0 || >=26.0.0`. What that costs is a step every machine has to
take and nothing enforces, which is the thing to weigh rather than whether it is possible.

*Sourced — `registry.npmjs.org/npm/12.0.2` metadata, read 2026-09-19 by a research agent. I did not
re-open this one.*

**Three candidates this file never listed exist on the registry today, and none of them has been
argued.** Registry facts below are mine; everything about what they are for is not.

- **`vlt`** — 1.1.0, published 2026-09-18, BSD-2-Clause-Patent, first published 2022, 127 versions.
- **`@endevco/aube`** — 2.2.4, published 2026-08-31, MIT, first published 2026-04-18, 66 versions.
  Its own site was reported to show 2.2.17 while the registry shows 2.2.4, which would mean npm is
  not its primary distribution channel. Unverified and worth resolving before it is scored.
- **`@nubjs/nub`** — 0.9.3, published 2026-09-19, MIT, first published 2026-05-27, 200 versions in
  under four months. Pre-1.0.

*Measured for the versions, dates, licences and publication history — `registry.npmjs.org` metadata,
parsed by me on 2026-09-19. Everything else reported about these three — who maintains them, what
they do, whether they support workspaces, their install-script defaults — came from a research agent
and I opened none of it. Treat all of it as unverified until it is.*

**`orogene` was checked and is out.** Its last crates.io release is 0.3.34 from 2023-10-09 and its
README describes a move to closed source with paid licences. A package manager that has not shipped a
public release in three years is not a candidate.

*Sourced — crates.io and the project README, read 2026-09-19 by a research agent. I did not open
either, and nothing turns on it: no reading of these facts puts orogene back in the field.*

**Wrappers are not field members.** `ni` and its forks detect a lockfile and shell out to a real
package manager, so they are a convenience over whatever this question answers rather than an answer
to it.

### Research pass of 2026-09-19

**The field is bounded at four, and the bound was set before the search.** npm 12, pnpm 12, Yarn
Modern 4 and Yarn Classic 1. `vlt`, `aube` and `nub` were enumerated above and excluded at the
maintainer's direction rather than on evidence, so nothing here scores them. The portable standard
asks for the bound to be named in advance; this is it.

#### The criteria, derived rather than inherited

The file's existing framing scores this on install-script trust. **That framing is spent**: all four
now deny third-party install scripts by default or can be set to, so the property no longer
separates anything. What the tool actually has to do here produces a different list — install on
three machines, reach a shared TypeScript module from a browser bundle and a Node script with no
publish step ([ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)),
produce a copyable server artifact, and get itself onto a Node that no longer ships Corepack.

**None of the four binds on CPU, memory, storage or network in any way a player can observe.** This
tool never runs on the request path. It touches those resources only in the developer loop and in
CI, so install time and disk are real costs to the maintainer and nothing else, and they are the
weakest criteria available here rather than the headline ones. Recorded because saying so and
saying nothing look identical in a finished record.

#### pnpm 12 installs package managers, including the other three

**This is the largest single finding of the pass and the file had no idea.** pnpm 12 reads
`packageManager` or `devEngines.packageManager` from `package.json` and, on a mismatch, downloads
and runs the declared version itself. The setting is `pmOnFail`, added in v11, **default
`download`**, with `error`, `warn` and `ignore` as the alternatives. It replaces
`managePackageManagerVersions`, `packageManagerStrict`, `packageManagerStrictVersion` and the
`COREPACK_ENABLE_STRICT` environment variable.

It is not limited to pnpm. Its own documentation says it installs **npm, Yarn Classic, Yarn Berry,
Yarn 6 (`yarnpkg/zpm`) and Bun**, that npm-published ones are "resolved and fetched through the
trusted package-manager registries, and verified against npm's signature for the exact version
before that version is executed", and that "a JavaScript package manager on a machine without
Node.js gets a managed LTS runtime to run on, so none of this requires a Node.js installation of
your own."

*Sourced — <https://pnpm.io/settings/cli> and <https://pnpm.io/package-managers>, both opened by me
on 2026-09-19.*

**What this does to the question is separate pnpm-as-installer from pnpm-as-package-manager**, and
those are two different choices that a decision here could easily settle as one. It also overlaps
[what pins the toolchain versions across machines?](what-pins-the-toolchain-versions-across-machines.md)
heavily enough that the boundary between the two questions needs restating before either is
recorded.

*"Yarn 6 (`yarnpkg/zpm`)" appears on that page and I have no second source for a Yarn 6 existing.
Nothing here turns on it. Flagged so it is not repeated as established.*

#### Delivery on a Corepack-less Node 26

- **npm** arrives with Node and has no separate install path at all. Its own download page documents
  only Node version managers and installers.
- **pnpm** documents `pnpm self-update`, a standalone script from `get.pnpm.io`, `npx get-pnpm`, and
  a Docker variant. Corepack appears nowhere on the page. pnpm 12 is a native executable that needs
  Node only when installed from npm.
- **Yarn Modern**'s only documented bootstrap is `npm install -g corepack`. The `yarnPath` mechanism
  removes the dependency after the first bootstrap, and Yarn's own docs now say "the `yarnPath`
  setting used to be the preferred way to install Yarn within a project, but we now recommend to use
  Corepack in most cases." A committed Yarn 4.18.0 release binary measures 3,784,908 bytes.
- **Yarn Classic** documents `npm install --global yarn@1`, Homebrew, several Linux distro packages,
  and a curl script. It never needed Corepack.

*Sourced — the four projects' own installation pages. I opened Yarn Modern's and pnpm's; npm's,
Yarn Classic's and the binary measurement came from a research agent on 2026-09-19.*

**Node's TSC voted to stop distributing Corepack on 25+ rather than to keep it**, and it is still
published on a monthly cadence at 0.36.0. So depending on it is supported rather than dead, and it
is a step every machine now takes that it did not take before.

*Sourced — <https://github.com/nodejs/TSC/pull/1697> and the npm registry, read 2026-09-19 by a
research agent. I did not open the TSC vote.*

#### Pinning, which is the other question's business but discriminates here

**npm enforces by refusing and cannot self-switch.** `devEngines.packageManager` runs before
`install`, `ci` and `run`, and its `onFail` "can be `warn`, `error`, or `ignore`, and if left
undefined is of the same value as `error`". **npm does not document a top-level `packageManager`
field at all.** So npm can fail a machine running the wrong version but cannot fix it.

*Sourced — <https://docs.npmjs.com/cli/v11/configuring-npm/package-json>, opened by me on
2026-09-19.*

**`mise` can pin all three from a checked-in config**, through a GitHub-release backend independent
of Node and Corepack. **`fnm` cannot**: its package-manager story runs through Corepack and its
`--corepack-enabled` flag is reported broken on Node 25+. The maintainer's machine has both.

*Sourced — <https://mise.jdx.dev/registry.html> and <https://github.com/Schniz/fnm/issues/1469>, read
2026-09-19 by a research agent. I did not open either.*

#### Layout, and what it does to the deployable

**Yarn Modern's default linker is Plug'n'Play**, which produces no `node_modules` at all. Its own
page: "Yarn Plug'n'Play has been the default installation strategy in Yarn since 2019." The other
two linkers, `pnpm` and `node-modules`, are first-class and opt-in.

*Sourced — <https://yarnpkg.com/features/linkers>, opened by me on 2026-09-19.*

- **npm and Yarn Classic** produce a flat hoisted `node_modules`, which copies to another machine
  without thought and offers no protection against phantom dependencies.
- **pnpm** defaults to an isolated symlinked layout over a content-addressed store. Its own docs name
  "deployment to serverless providers that don't support symlinks" as a reason to switch to
  `node-linker: hoisted`, so the layout is documented as a deployment liability in some targets.
- **Producing a single-package deployable** has a first-class answer in pnpm (`pnpm deploy --prod
  --filter`, which copies the package and installs an isolated `node_modules` at the target) and in
  Yarn Modern (`yarn workspaces focus --production`). **npm has none** — its hoisted tree spans the
  whole workspace, so extracting one package is manual. Yarn Classic's `--focus` is documented for
  development speed rather than for building an artifact.

*Sourced — each tool's own CLI docs, read 2026-09-19 by a research agent. I did not open them, and
[what shape is the deployable?](what-shape-is-the-deployable.md) is where this lands rather than
here.*

#### Workspaces, which mostly does not discriminate

All four support workspaces. npm and Yarn use a `workspaces` array in the root `package.json`; pnpm
uses `pnpm-workspace.yaml`. **`workspace:` as a dependency protocol is supported by pnpm and Yarn
Modern and not by npm or Yarn Classic**, which matters only if a sibling is referenced as a
dependency rather than by relative path.

**Consuming the shared module as TypeScript source is not a package-manager feature.** It needs a
resolvable directory entry, which all four create, and then it is TypeScript's `customConditions`
and the bundler's behaviour doing the work. **And under a single-package layout the choice touches
none of this**, which is the connection to
[how is the codebase laid out?](how-is-the-codebase-laid-out.md) and the reason that question's
stated dependency on this one is weaker than it reads.

*Sourced — each tool's workspaces docs and
<https://www.typescriptlang.org/tsconfig/#customConditions>, read 2026-09-19 by a research agent. I
did not open them; the spike below is what settles whether it works here.*

#### Lockfiles and what reads them

All four ship an audit command and all four hit the npm registry's advisory endpoint. GitHub's
dependency graph lists `package-lock.json`, `pnpm-lock.yaml` and `yarn.lock` as supported, and
Dependabot supports npm, pnpm and Yarn through the `npm` ecosystem value. **Cross-version lockfile
behaviour is documented for npm only** — "npm will always attempt to get whatever data it can out of
a lockfile, even if it is not a version that it was designed to support" — and is undocumented for
pnpm and both Yarns.

*Sourced — GitHub's supported-ecosystems pages and each tool's docs, read 2026-09-19 by a research
agent. I did not open them. The agent flagged that GitHub's table tops out at npm v11 and pnpm v10,
which is a gap in GitHub's documentation rather than evidence of unsupported versions.*

#### Yarn Classic is out, and the reason is one thing

**The 1.x line is frozen and accepts security fixes only, and none has shipped since 2024-03-09.**
Its own repository says so: "The 1.x line is frozen - features and bugfixes now happen on
https://github.com/yarnpkg/berry" and "the 1.x codebase is fairly old and will only accept security
fixes." Two and a half years with no release under a stated security-fix-only policy is the
disqualifier, and it stands alone: everything else about Yarn Classic is merely worse rather than
disqualifying.

**Reverses if** the 1.x line resumes releases, which would require the Yarn team to reverse the
freeze rather than merely ship a hotfix.

*Sourced — <https://github.com/yarnpkg/yarn> README and the GitHub releases API, read 2026-09-19 by a
research agent. I did not open them; the registry date of 1.22.22 at 2024-03-09 I did check.*


### Spike of 2026-09-19, comparing each candidate at its best available version

**Each candidate is scored at its best available version, not at the version that happens to be on
the machine.** npm **12.0.2**, pnpm **12.5.1**, Yarn **4.18.0**. This is the maintainer's stated
rule for comparisons and it settles two things at once: the npm being judged is npm 12 rather than
the 11.19.1 that Node 26 bundles, and **Yarn Classic leaves the field without needing its own
argument**, because it is not the best Yarn. The freeze recorded above is why it is not, rather than
a second disqualifier.

**An earlier pass of this spike measured npm 11.19.0 and has been replaced.** It found that the
bundled npm prints a warning naming `allowScripts` while running the script anyway, proven against
an `--ignore-scripts` control. That is a true observation about the npm that arrives with Node and
it is not a finding about npm as a candidate. Recorded here so the claim does not return: it
described the default, not the tool.

**Method.** A throwaway workspace was scaffolded once and copied per candidate: a root package with
`apps/web` (Vite 7.1.5, an ESM TypeScript entry), `apps/generator` (a `.ts` script run directly by
Node), and `core/sudoku` (a package whose `exports` points at `./src/index.ts`, no build step), plus
TypeScript 5.9.2. Each copy was installed, then put through `tsc --noEmit`, `vite build`, and `node
apps/generator/index.ts`. npm 12 and pnpm 12 were installed into scratch prefixes so the machine's
own toolchain was not changed. Run on macOS arm64, Node v26.7.0, one run per candidate. The scaffold
was deleted; these observations are the artifact.

**Install timings are not recorded, because the criterion does not bind.** Nothing here is on a
request path. A number from these runs would read as evidence and be worth nothing.

#### All three satisfy the constraint, and produce the identical artifact

`tsc --noEmit`, `vite build` and `node apps/generator/index.ts` exited 0 under all three, and the
generator printed `GENERATOR good=true bad=false` under each. So the shared module was reached as
source from a Node process and from the browser bundle with no publish step, which is what
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)
requires.

**The three bundles are byte-identical** — same content hash, 891 bytes. **The package manager does
not touch what ships**, which removes the build output from the list of things this decision can be
argued on.

*Measured.*

#### All three block unreviewed install scripts; only pnpm fails the install

Measured against `esbuild@0.25.12`, which Vite pulls in and which has a real `postinstall`, with an
`--ignore-scripts` control to establish what a blocked build looks like on disk.

- **npm 12.0.2 — blocked, exit 0.** "2 packages had install scripts blocked because they are not
  covered by allowScripts", naming `esbuild@0.25.12` and `fsevents@2.3.3`. The binary on disk is
  byte-identical to the control.
- **pnpm 12.5.1 — blocked, exit 1.** `ERR_PNPM_IGNORED_BUILDS`. It also writes an `allowBuilds` stub
  into `pnpm-workspace.yaml` naming the package and the value to set.
- **Yarn 4.18.0 — blocked, exit 0.** `YN0004: esbuild@npm:0.25.12 lists build scripts, but all build
  scripts have been disabled.`

**So no untrusted code runs under any of them, and this property no longer separates the field on
safety.** What is left is whether the install *stops*: pnpm's exit 1 fails a pipeline, and an exit 0
with a warning in it does not. That is a real difference and a much smaller one than "which of these
is safe".

*Measured, with a control.*

#### Two pin mechanisms work without Corepack, and they work differently

- **npm 12 refuses, loudly.** With `devEngines.packageManager` requiring `^12.0.0`, npm 11.19.0
  stops with `EBADDEVENGINES` and prints the version it found against the version required. So the
  "a machine kept the npm it already had" failure is caught rather than silent.
- **pnpm self-corrects.** The same installed binary reports `12.5.1` in an unpinned directory and
  `12.4.2` in one whose `package.json` carries `"packageManager": "pnpm@12.4.2"`. It downloads and
  runs the declared version. No Corepack on its path.
- **Yarn could not be tested here.** The `yarn` on this machine is itself a Corepack shim, so any
  result would have measured Corepack. Its documented mechanisms are Corepack or a committed
  `yarnPath` binary. **Unverified by running.**

*Measured for npm and pnpm; inconclusive for Yarn and marked as such.*

#### Yarn's Plug'n'Play default broke nothing, which was not the expected result

Yarn 4.18.0 produced **no `node_modules` at all**, only `.pnp.cjs` and `.yarn/`. TypeScript, Vite
and Node all worked through it. Recorded because the research predicted friction and the run found
none, and a negative result is a finding.

**One caveat it printed:** `YN0092: ESM support for PnP uses the experimental loader API and is
therefore experimental`. This project is ESM throughout, so that warning is aimed at it rather than
at a corner of it.

*Measured.*

#### No single workspace specifier works across the candidates

`"@puzzles/sudoku": "*"` resolved to the local workspace under npm 12 and under Yarn 4. **pnpm
refused it and went to the registry**, failing with `ERR_PNPM_FETCH_404`; it needs `workspace:*`.
And npm rejects `workspace:` outright. So the manifest is not portable between them, and a layout
written against one has to be edited to move.

*Measured for pnpm's 404 and for `"*"` under npm and Yarn. The npm `EUNSUPPORTEDPROTOCOL` half is
Sourced from <https://github.com/npm/cli/issues/8845> via a research agent and I did not reproduce
it.*

#### `pnpm deploy` produces a copyable artifact, and Node then refuses to run it

`pnpm --filter @puzzles/generator deploy --prod` produced a self-contained directory in 45ms, with
the shared module linked by a **relative** symlink inside the artifact, so it survived being copied
elsewhere.

**It does not run, and the reason is Node rather than pnpm.**
`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`: once the shared module is packed under
`node_modules`, Node will not strip its types. Node documents this as deliberate — "to discourage
package authors from publishing packages written in TypeScript, Node.js refuses to handle TypeScript
files inside folders under a `node_modules` path."

**This is the spike's most consequential finding and it belongs to other questions.** A shared rules
module consumed as raw `.ts` works in a workspace, where the symlink resolves to a path outside
`node_modules`, and stops working the moment anything packs it into `node_modules` to deploy.
Whatever settles [how is the codebase laid out?](how-is-the-codebase-laid-out.md),
[what shape is the deployable?](what-shape-is-the-deployable.md) and
[is server TypeScript transpiled or stripped?](is-server-typescript-transpiled-or-stripped.md) has
to account for it. **It disqualifies no package manager**, because all three would hit it.

*Measured — `pnpm deploy` then `node index.ts` in the artifact and in a copy of it. The Node rule is
Sourced from <https://nodejs.org/docs/latest-v26.x/api/typescript.html>, opened by me on
2026-09-19.*

#### What the redone comparison did to the field

**Scored at their best versions, the three are much closer than the first pass suggested.** All
three block install scripts, pass every functional check, emit an identical artifact, ship an audit
command against the same advisory endpoint, and have their lockfile read by GitHub's dependency
graph. What is left:

- **pnpm** fails the install on an unreviewed script rather than warning, self-corrects a version
  pin from one bootstrap, has a first-class single-package deploy, and needs `workspace:*` in
  manifests.
- **npm 12** must be installed on every machine because no Node line bundles it, catches a version
  mismatch by refusing rather than correcting, and has no first-class way to extract one workspace
  package as a deployable.
- **Yarn 4** bootstraps only through Corepack, which Node's TSC voted to stop distributing, or
  through a 3.8 MB binary committed to the repository that Yarn's own docs no longer recommend. Its
  default linker is a different resolution model that works here and carries an experimental-ESM
  warning.

**None of those is a disqualifier on its own**, which is the finding rather than a gap in the
searching. The portable standard's rule applies: where a bounded search finds no property that
separates the candidates, the decision is made on stated preference and the record says so rather
than dressing the preference as a derivation. The bound was named before this pass: four candidates,
best versions, at the maintainer's direction.

### Comparison pass of 2026-09-19 — the axes beyond the functional ones

**The earlier passes scored the wrong list.** They derived criteria from what the *product* does and
so produced functional requirements plus install-script safety, on which all three tie. What the
system does also includes being maintained by one person for years, which
[../problem.md](../problem.md) states and which makes the daily loop a criterion rather than a
comfort. **Install cost was dismissed in the spike above on the grounds that nothing here is on a
request path. That was the wrong test** — it does not bind on product latency and it binds directly
on maintainer time, several times a day.

Agent ergonomics was raised as an axis and excluded at the maintainer's direction. It is named here
so its absence is deliberate rather than an oversight.

#### Phantom dependencies: npm allows them, the other two do not

Measured by declaring only `vite` and importing `esbuild`, one of its transitive dependencies.

- **npm 12 — the import succeeds.** `esbuild` is hoisted into `node_modules` and resolves.
- **pnpm 12 — fails.** `ERR_MODULE_NOT_FOUND: Cannot find package 'esbuild'`.
- **Yarn 4 — fails, with the clearest message of the three.** "Your application tried to access
  esbuild, but it isn't declared in your dependencies; this makes the require call ambiguous and
  unsound."

**This is a silent-failure difference, which is why it outweighs its size.** Under npm the undeclared
import works until a transitive dependency drops or moves the package, at which point it breaks
somewhere unrelated to the change that caused it. Under the other two it fails at the moment the
import is written. The portable standard ranks an option that fails loudly above one that fails
silently even when the latter is otherwise better.

*Measured.*

#### A failing workspace script: all three fail the build, and the research was wrong

Measured with three packages whose middle one exits 1.

| | order | on failure | exit code |
|---|---|---|---|
| npm 12 | serial, manifest order | **continues**, runs the third | 1 |
| pnpm 12 | parallel, topological | all run, names which failed | 1 |
| Yarn 4 | serial | **stops**, third never runs | 1 |

**A research pass claimed npm "runs all workspace scripts regardless if one script exits with exit
code 1", citing an open npm issue, and read that as npm not failing.** It does fail: exit code 1.
What the issue describes is the absence of a short-circuit, which is real and is not the same thing.
The practical difference is only whether one run shows you every failure or just the first, and
npm and pnpm are on the same side of it.

*Measured, and it corrects a claim this file would otherwise have carried.*

#### Install cost, measured rather than dismissed

Three dev dependencies (vite, typescript, vitest), isolated caches per tool, `--ignore-scripts`
throughout, macOS arm64, Node v26.7.0.

| | cold | warm | relink | `node_modules` | cache/store | lockfile |
|---|---|---|---|---|---|---|
| npm 12 | 5.18s | 1.45s | 0.59s | 46 MB | 141 MB | 1685 lines |
| pnpm 12 | 0.66s | 0.14s | 0.11s | 46 MB | 92 MB | 1027 lines |
| Yarn 4 | 1.04s | 0.79s | 0.33s | **492 KB** | 91 MB | 1588 lines |

**pnpm's cold figure is not trusted and is recorded with that caveat.** 92 MB fetched in 0.66s is
implausible for a genuinely cold cache, so `--store-dir` probably did not isolate a metadata or
content cache elsewhere. The warm and relink columns are consistent with the architectures and are
the ones the daily loop actually pays. One run each; no variance was collected.

**Yarn's 492 KB is not a typo**: under Plug'n'Play there is no `node_modules` tree, only `.pnp.cjs`
and `.yarn/`. Across many repositories on one laptop that difference compounds, as does pnpm's
shared store against npm's per-project extraction.

*Measured.*

#### Supply chain: the defaults split, and neither candidate dominates

- **A cooldown on newly published versions is on by default in pnpm and off by default in npm.**
  pnpm's `minimumReleaseAge` defaults to `1440` minutes, one day, since v11. npm's
  `min-release-age` defaults to `null` — "If set, npm will build the npm tree such that only
  versions that were available more than the given number of days ago will be installed." Yarn is
  reported to default `npmMinimalAgeGate` to 1 day since 4.15.0. This is the mitigation against a
  compromised release being installed within hours of publication.
- **npm is stricter on git and URL dependencies.** `allow-git` and `allow-remote` both default to
  `"none"` in npm 12. pnpm's `blockExoticSubdeps` defaults to `true` but governs **transitive**
  dependencies only, so a direct git dependency still installs under pnpm and does not under npm.
- pnpm additionally re-verifies the whole lockfile against these policies on every install, and
  prints a cached verdict when it skips.

**So the supply-chain axis does not pick a winner.** pnpm defends the fresh-compromised-release
vector by default; npm defends the git-and-tarball vector more strictly by default. Both gaps close
with one configuration line.

*Sourced — <https://pnpm.io/settings/dependency-resolution> and
<https://docs.npmjs.com/cli/v12/using-npm/config>, both opened by me on 2026-09-19. The Yarn default
is from a release note read by a research agent and I did not open it.*

#### Churn, and how old pnpm 12 actually is

| | versions published in the last 12 months |
|---|---|
| pnpm | **181** |
| npm | 35 |
| `@yarnpkg/cli` | 11 |

**pnpm 12.0.0 stable was published 2026-08-26, twenty-four days ago, and is a rewrite of pnpm in
Rust.** Fourteen stable 12.x releases have shipped in those twenty-four days. pnpm's own migration
note says "the commands, flags, settings, and lockfile format of pnpm 11 all carry over", and lists
behaviour changes including `engineStrict` now failing rather than warning and cyclic-dependency
lockfiles breaking cycles at a fixed place.

**Under [ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
this is a cost to price rather than a disqualifier**, and the price is low because the position is
cheap to leave: swapping package manager is a lockfile and two manifest edits. Recorded because
choosing a three-week-old rewrite is a thing to do knowingly.

*Measured — `registry.npmjs.org` metadata for all three, parsed by me on 2026-09-19. The rewrite's
behaviour-change list is Sourced via a research agent from pnpm's 12.0 release notes; I did not open
them.*

#### Monorepo conveniences, and one correction to an earlier assumption

- **Catalogs**, one declared version of a dependency shared across packages, exist in **pnpm and
  Yarn 4** (the latter since 4.10.0). **npm has none.**
- **Filters**: pnpm can select a package's dependents (`...^web`), a glob of directories, and
  packages changed since a git ref (`[origin/main]`). Yarn has `--since` and `--recursive` but no
  dependents-only selector. npm has named workspaces and all workspaces, and nothing else.
- **Script invocation**: pnpm and Yarn allow a bare script name and pass flags through directly;
  npm requires `npm run` and `--` before flags.
- **`actions/setup-node` caches all three.** pnpm requires its own setup action to run *before*
  `setup-node`, because `setup-node`'s cache step shells out to pnpm.
- **Deployment platforms do not favour npm the way I assumed.** Heroku's Node support documents
  `package-lock.json`, `pnpm-lock.yaml` and `yarn.lock` as equal triggers. Railway's builders detect
  the `packageManager` field first and the lockfile second. Render and Fly could not be established.

*Sourced — each tool's own docs plus the platform docs, read 2026-09-19 by a research agent. I did
not open any of these; none of them decides anything on its own, and the platform half is properly
[where does this run?](where-does-this-run.md)'s business.*
