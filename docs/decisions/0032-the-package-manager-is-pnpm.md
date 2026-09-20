---
number: 0032
status: accepted
date: 2026-09-19
---

# 32 — the package manager is pnpm

## Forced by

[ADR-0030](0030-typescript-outside-the-browser-runs-on-node.md) chose Node, which ships npm without
requiring it, so this is a choice rather than a consequence of the runtime.

[ADR-0029](0029-the-client-bundler-is-vite.md) puts a bundler and its dependency tree in the
repository, and
[ADR-0005](0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) requires one
TypeScript rules module to be reachable as source by a browser build and a batch process with no
publish step between them. Those two set what this tool has to do.

[../problem.md](../problem.md) ranks clarity over cleverness because one person maintains this, and
states an intent to keep working on this for years rather than to ship it and leave it running.
Together those make the daily loop a criterion rather than a comfort: an install runs many times a
day for years, and a mistake this tool permits today is one somebody meets later.

[ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
prices a supply worry by what replacing the thing would cost, which is what makes the age of the
chosen implementation a cost to state rather than a reason to refuse it.

## Decision

**pnpm.** The version is deliberately not here. It is a value the pin artifact holds, and choosing
that artifact is
[what pins the toolchain versions across machines?](../questions/what-pins-the-toolchain-versions-across-machines.md).

**Nothing in the field was disqualified, and this record is a preference resting on measured
differences rather than a derivation.** npm 12 and Yarn 4 each satisfy every requirement this
project has. A competent maintainer could take either and nothing here would break. The portable
decision-making standard requires a search that found no disqualifier to say so plainly instead of
assembling reasons until one reads as decisive, so that is what this says.

Three measured differences decided it, in this order.

**An import of a dependency the importing package never declared succeeds under npm and fails under
pnpm.** Declaring only `vite` and importing `esbuild`, one of its transitive dependencies, resolves
under npm's hoisted layout and throws `ERR_MODULE_NOT_FOUND` under pnpm's isolated one. This is the
reason that carries the most weight, because it is a difference in *when* a mistake surfaces. Under
npm the undeclared import works until a transitive dependency moves or drops the package, and then
fails in a place unrelated to the change that caused it. Under pnpm it fails as it is written. An
option that fails loudly beats one that fails silently even when it is otherwise better.

**The install is faster by enough to be felt, and that binds on the maintainer rather than on the
product.** Installing vite, typescript and vitest into an empty project: 0.14s warm and 0.11s
relinking under pnpm, against 1.45s and 0.59s under npm. Nothing here is on a request path, so this
constrains no promise to a player; it is paid several times a day for years by the one person doing
the work.

**A cooldown on freshly published versions is on by default in pnpm and off by default in npm.**
pnpm's `minimumReleaseAge` defaults to one day; npm's `min-release-age` defaults to `null`. This is
the mitigation against installing a compromised release in the hours after it is published, and a
default that holds is worth more here than a setting somebody has to remember.

**Every figure above was measured or read by the author of this record**, on macOS arm64 under Node
v26.7.0, against npm 12.0.2, pnpm 12.5.1 and Yarn 4.18.0, each installed into an isolated prefix.
The install timings are one run per candidate with isolated caches, so they carry no variance and
the cold-cache column was discarded as implausible; the warm and relink figures are the ones cited.
The defaults come from
[pnpm's dependency-resolution settings](https://pnpm.io/settings/dependency-resolution) and
[npm's config reference](https://docs.npmjs.com/cli/v12/using-npm/config). The full method, the
results that changed nothing, and the figures taken from a research agent rather than established
here are in [which package manager?](../questions/which-package-manager.md) until it is mined.

## Enforced by

`pnpm-lock.yaml` and a `pnpm-workspace.yaml`, neither of which exists, because no code has been
scaffolded. **Nothing. Asserted only**, until M1's first slice lands.

Two obligations fall out of it and land elsewhere. The concrete version belongs to the pin artifact
named above. And
[ADR-0033](0033-an-import-of-an-undeclared-dependency-fails.md) is what keeps the first of the three
differences above true, because pnpm can be configured to give it up.

## Rejected

- **npm 12** — because an import of an undeclared transitive dependency succeeds under it, measured
  by declaring only `vite` and importing `esbuild`. **This is a reason it lost and not a
  disqualifier**, and the distinction is the honest part of this record: the failure it permits is
  recoverable whenever it happens, and a great many working projects run on npm.

  The strongest case for it, which is real: it is the only candidate needing no second mechanism
  anybody has to learn or explain, its `devEngines.packageManager` refuses to run on a version
  mismatch and names both versions when it does, and its `allow-git` and `allow-remote` both default
  to `none`, which is stricter than pnpm's equivalent because pnpm's governs transitive dependencies
  only. Choosing pnpm gives that last one up until it is configured back.

  **Reverses if** npm ships a strict or isolated linker, at which point the reason above is gone and
  the remaining differences are conveniences.

- **Yarn 4** — because its only documented path onto a bare machine is Corepack, and Node's TSC voted
  to "stop distributing Corepack (i.e. the distribution will no longer contain a `corepack`
  executable) on future (i.e. 25+) release lines of Node.js", which is the line this project runs.
  The alternative Yarn offers is committing its release binary to the repository, which Yarn's own
  documentation no longer recommends. A bootstrap that depends on something being removed on purpose
  is the one property here that gets worse by itself.

  The strongest case for it, which is also real: it is strict about undeclared imports like pnpm and
  its error says why — "this makes the require call ambiguous and unsound" — which is the clearest
  message any of the three produces. Under Plug'n'Play it puts 492 KB on disk where the other two
  put 46 MB. It has catalogs, which npm lacks. Its Plug'n'Play default broke nothing in this
  project's stack when it was run.

  **Reverses if** Yarn documents a bootstrap that does not require Corepack, or if Node resumes
  distributing Corepack.

- **Yarn Classic** — because the 1.x line is frozen and its own repository says it "will only accept
  security fixes", with no release since 2024-03-09. It is not the best available Yarn, and
  comparing candidates at their best is what put Yarn 4 in the field in its place. **Reverses if**
  the line resumes releases.

- **Not yet** — because it is not available. [ADR-0029](0029-the-client-bundler-is-vite.md) puts a
  bundler in the repository and something has to install it before M1's first slice can be built.
  Deferring would mean deferring the milestone.

## Risk

**pnpm 12.0.0 is a rewrite in Rust and stabilised twenty-four days before this record**, with
fourteen stable releases in that window and 181 versions published across the last twelve months
against npm's 35. A young implementation under an old version number is where regressions live, and
this project would be finding some of them. [ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
says to price that by what leaving costs, and leaving costs a lockfile and two manifest edits, so
the price is low. It is accepted knowingly rather than overlooked.

**The manifests stop being portable.** pnpm refuses a plain `"*"` for a workspace sibling and needs
`workspace:*`, which npm rejects outright. Moving to npm later means editing every manifest that
names a sibling, on top of swapping the lockfile.

**The symlinked layout is a documented liability for some deployment targets**, and pnpm names
"deployment to serverless providers that don't support symlinks" as a reason to switch its linker.
[Where does this run?](../questions/where-does-this-run.md) can therefore make this decision
uncomfortable, and the escape hatch costs the strictness that
[ADR-0033](0033-an-import-of-an-undeclared-dependency-fails.md) exists to protect.

**npm's stricter git and URL defaults are given up** until they are configured back, per the
rejection above.

## Revisit when

A pnpm release breaks this project in a way that a stable npm would not have, and the pattern
repeats rather than being a single bad version. That is the observable form of the rewrite risk
above, and it is what would show the price was misjudged rather than merely paid.

Also when [where does this run?](../questions/where-does-this-run.md) selects a host that cannot
deploy a symlinked tree, since the workaround there removes the main reason this record chose pnpm.

## Also update

- [x] questions/README.md — closes [which package manager?](../questions/which-package-manager.md),
      unblocks [how is the codebase laid out?](../questions/how-is-the-codebase-laid-out.md), and
      supplies one of the two inputs
      [what pins the toolchain versions across machines?](../questions/what-pins-the-toolchain-versions-across-machines.md)
      was waiting on
- [x] architecture.md — nothing moved; this defines no boundary between parts of the system
- [x] constraints.md — carries the Node type-stripping limit the spike behind this record found,
      which constrains the layout and the deployable rather than this choice
- [x] glossary.md — nothing moved; no domain term is introduced
- [x] guarantees/ — nothing moved; this promises a player nothing
