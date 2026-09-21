---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How is the codebase laid out?

**The package count is settled and the rest of this is not.**
[ADR-0034](../decisions/0034-the-repository-is-one-package.md) makes the repository one package,
with the client, the server, the generator and the rules as directories under `src/`, and per-area
tsconfigs scoping `lib` and `types`. Three things this file asks are untouched by it: how the rules
module is reached, what lives inside `src/rules/`, and whether the generator is a third deployable
at all. The **Options** and **Findings** below are kept because they hold the evidence that record
cites and the field the remaining questions are chosen from.

## Why it matters

Nothing can be scaffolded until files have somewhere to go, which is what
[ADR-0034](../decisions/0034-the-repository-is-one-package.md) answered. What is left is not needed
to put the first file down, and none of it is needed for M1 at all, because nothing in M1 imports
the rules module: the first slice returns a hard-coded string and the second and third render and
fetch it. Each part becomes real at a different point, so each waits for its own.

**How the rules module is reached** — a named specifier through the manifest's `imports` field, or
a relative path — is decided the first time anything imports it. Measured below to work either way,
so the cost of waiting is nil and the cost of choosing early is a door closed for nothing.

**What lives inside `src/rules/`** — one module for every game or one per game, named by domain or
by technical layer — is decided when there are rules to organise, at M7.

**Whether the generator is a third deployable** is decided at M8 when it exists.

[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) and
[ADR-0007](../decisions/0007-that-language-is-typescript.md) together set the one hard
constraint: the puzzle rules are one implementation, shared as source, reachable by both a browser
and a batch process without a publish step between them. Whatever shape is chosen has to allow that.

## What would settle it

**For how the rules module is reached:** the first import of it. Both forms are measured below to
work under Node, Vite and `tsc`, so nothing remains to establish and the choice is between a stable
specifier and no manifest entry. It is settled by writing that import rather than by further
research.

**For what lives inside `src/rules/`:** having more than one game's rules written, so the question
is whether a second game wants its own module rather than whether it might. M7 is where the first
game's rules run and M15 is where the second arrives.

**For whether the generator is a third deployable:** knowing whether it writes the catalogue
directly or through the server's API, which
[../architecture.md](../architecture.md) records as open.

Being wrong on any of these is cheap. Moving files and rewriting specifiers is a change of
configuration and a find-and-replace, with no data migration and nothing a player sees.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Options ported from legacy ADR-23 (organize by domain concept, not technical layer). The sketch
below was drawn as directories at the repo root before being recorded here.

## Options

**"One package or workspaces?" is not the question, and answering it as posed decides three things
at once.** A layout has to settle what reaches the rules module at run time, what enforces the
boundaries between the four bodies of code, and how type checking is scoped when the client needs
the DOM lib and the server needs `@types/node` and the rules module needs neither. Package count is
the last of those rather than the first, and the options below are arranged by the three properties
instead of by how many manifests there are.

*One package, relative imports.* `src/client/`, `src/server/`, `src/generator/`, `src/rules/`, one
manifest. Nothing to configure. Enforces nothing: any directory can import any other, and
[ADR-0033](../decisions/0033-an-import-of-an-undeclared-dependency-fails.md)'s property reaches only
third-party packages here, because there is one manifest and therefore one set of declared
dependencies. Never meets the type-stripping limit, because nothing is ever under `node_modules`.

*One package, Node subpath imports.* The same tree, with `"imports": {"#rules/*": "./src/rules/*"}`
in the manifest, so every consumer writes `#rules/board.ts` rather than counting `../`. Measured
below to work under Node 26 with type stripping. `null` targets can block a subpath, which is the
only boundary enforcement available without separate manifests, and it is coarse.

*One package, TypeScript project references.* Orthogonal to the two above rather than a rival: it
adds a `tsconfig.json` per area with its own `lib` and `types`, and a solution config referencing
them. It is a compile-time graph only, so it settles type checking and says nothing about what
resolves at run time.

*A pnpm workspace, rules consumed as raw `.ts` source.* A package per deployable plus one for the
rules, whose manifest points `main` and `types` at `./src/index.ts`. Real boundaries the installer
enforces, live source with no build step between editing a rule and running it. This is the shape
that meets the type-stripping limit at packaging time.

*A pnpm workspace, rules compiled to JavaScript before consumers use it.* The same packages, with
the rules package built to `dist/`. Sidesteps the type-stripping limit entirely and puts a build
step between editing a rule and running it. Whether this counts as the publish step
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)
forbids is a reading that record has to settle: it forbids publishing, and a local build is not
that.

*A pnpm workspace, rules exposed through a custom export condition.* Source in development,
compiled output otherwise, selected by a project-defined condition registered in `tsconfig`'s
`customConditions` and passed to Node as `--conditions`. Keeps both of the two above at once, at the
cost of a mechanism every tool has to honour, and at least one current tool does not.

*Not yet.* Put down the single server file M1's first slice needs and leave the shape unchosen.
Available, and it is the option the others are measured against, since the cost of being wrong here
is a file move.

*Separate repositories.* Listed to be dismissed: it puts a publish step between the rules and their
consumers, which
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) forbids.

*A task orchestrator over the top* — Nx, Turborepo, Moon, Rush, Wireit, Bazel. Not a layout, and
scored separately: each adds task caching, affected-package detection and a task graph over whatever
layout is chosen, and `pnpm -r` with `--filter` already covers ordered recursive execution without
one. Nothing in M1 or M2 has named a problem any of them solves.

Within any of those, a second axis. **By domain concept:** folders named for what the code is about
— a player and their progress, one game's rules, storage — so a name answers "where would I find X"
without the reader knowing which technical layer a concept lives in. **By technical layer:** one
`routes/`, `views/`, `models/` spanning every game. And within domain organisation, one shared
module holding every game's rules, or a module per game: a shared module keeps the tree smaller, but
editing one game recompiles the others and nothing but convention stops one game reaching into
another's internals.

### A sketch, drawn outside-in

Deployables at the top, a functional core beneath them, storage as its own concern:

```
apps/
  web-frontend/     the client
  web-backend/      imperative shell over core/
  generator/        puzzle generator workload; imperative shell over core/
core/
  sudoku/           pure domain logic, used by both generation and play
store/              storage, server-side and client-side
scripts/            lint and ops helpers
```

It reads as the architecture rather than as a framework's conventions, and a newcomer can guess
where something lives from the top level alone.

Four things it decides that are open, and it is worth being explicit that a sketch is not an
argument for any of them. It assumes **workspaces** rather than one package. It splits **frontend
from backend** as separate deployables. It puts rules in a **per-game module** (`core/sudoku`)
rather than one shared module, which the second axis above has not settled. And `store/` couples
server-side and client-side storage in one place, which are two different things that may not want the
same home: the server's is a SQLite file
([ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md)) and the client's is
[still open](which-client-storage-mechanism.md).

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The number of consumers of a game's rules is what decides whether a shared interface is worth
having.** A server-rendered design had two, a web binary and a generator, which was too few. A
local-first design has three — generator, client, and possibly a server — across two runtimes. Three
consumers across a runtime boundary is the pressure that produces a shared interface, so this
follows from [ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) and the
runtimes it implies rather than from taste.

**The structural criteria hold whichever option wins**, so they are not inputs to the choice: where
a package boundary is earned, when repetition is acceptable, and domain logic staying free of I/O.
They live in the portable standards described in [../standards/README.md](../standards/README.md).

**pnpm does workspaces, and names a sibling differently from npm.** The glob list lives in
`pnpm-workspace.yaml` rather than the root `package.json`, and a sibling dependency is written
`workspace:*`. It also has catalogs, one declared version of a dependency shared across packages,
which is the thing that stops four manifests drifting apart, and filters expressive enough to select
a package's dependents or only what changed since a git ref. Catalogs shipped in pnpm 9.5.0 and are
declared in `pnpm-workspace.yaml` too.

*Sourced — [pnpm.io/workspaces](https://pnpm.io/workspaces),
[pnpm.io/catalogs](https://pnpm.io/catalogs) and [pnpm.io/filtering](https://pnpm.io/filtering), read
2026-09-20 against pnpm 12.5.1 by a research agent. I did not open them.*

**A plain `"*"` for a sibling does not reliably fail, and that is worse than the failure recorded
here before.** pnpm's own documentation describes registry fallback rather than refusal: "if `bar`
has `"foo": "2.0.0"` in dependencies and `foo@2.0.0` is not in the workspace, `foo@2.0.0` will be
installed from the registry." The `ERR_PNPM_FETCH_404` measured on 2026-09-19 is what that fallback
does when the sibling's name happens to be unpublished. Give a package a name that does exist on npm
and the same manifest installs a stranger's code with no error at all. `workspace:*` is what turns
this into a refusal, because pnpm then "will refuse to resolve to anything other than a local
workspace package".

*Sourced — [pnpm.io/workspaces](https://pnpm.io/workspaces), read 2026-09-20 by a research agent; I
did not open it. The 404 itself stands as Measured on 2026-09-19.*

**The 2026-09-19 measurements here do not name the pnpm version they ran under, and the gap is not
academic.** On this machine `pnpm` is a Corepack shim resolving to 7.27.0, while the current release
is 12.5.1, and the majors in between changed things a new workspace meets on its first day: pnpm 10
stopped running dependencies' lifecycle scripts by default, and pnpm 11 moved settings out of
`.npmrc` into `pnpm-workspace.yaml`, which is the file
[ADR-0033](../decisions/0033-an-import-of-an-undeclared-dependency-fails.md) names as where
`node-linker` is left absent. Any spike run against this question states its pnpm version and
confirms it is not 7.

*Measured — `pnpm --version` reporting 7.27.0, `npm view pnpm version` reporting 12.5.1, and
`npm ls -g` showing `corepack@0.35.0` under Node v26.7.0. Run by me on 2026-09-20. The pnpm 10 and 11
behaviour changes are Sourced from pnpm's release notes by a research agent; I did not open them.*

**Node will not strip types under `node_modules`, and that is the finding this question turns on.**
[../constraints.md](../constraints.md) records it. A shared rules module exporting `.ts` source
works as a workspace sibling, because the symlink resolves to a path outside `node_modules`, and
fails the moment anything packs it inside one to build a deployable. **So the sketch's assumption of
workspaces is not free**: it buys real boundaries and it puts the rules module one packaging step
away from being unrunnable. A single package with relative imports never meets the limit at all.

That does not settle the question in favour of one package. It says the comparison is between real
boundaries plus a packaging constraint, and no boundaries plus no constraint — which is a sharper
trade than "configuration versus none", and it is the same trade
[what shape is the deployable?](what-shape-is-the-deployable.md) has to make.

**Both halves of that limit reproduce here.** A `.ts` file whose real path is under `node_modules`
throws `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`. The same package reached through a
`node_modules` symlink whose target lies outside resolves and runs. So a workspace is fine in
development and the limit is entirely about what a packaging step does.

*Measured — a scratch directory with three cases, a real path under `node_modules`, a path outside
it, and a symlink from `node_modules` to a sibling source directory, run on Node v26.7.0 by me on
2026-09-20. Nothing was installed into this repository.*

**`pnpm deploy` is a packaging step that does exactly the thing the limit forbids.** Its
documentation: "All dependencies of the deployed package, including dependencies from the workspace,
are installed inside an isolated `node_modules` directory at the target directory." No documented
setting puts a workspace sibling anywhere else; `injectWorkspacePackages` and
`dependenciesMeta.injected` choose between a hardlink and a symlink *within* `node_modules` rather
than deciding whether it is there. So under workspaces, a rules module shipped as `.ts` source and a
`pnpm deploy` artifact cannot both hold. Four ways out, and the layout only forecloses the last:
compile the module before it ships, build the deployable by copying the workspace tree rather than by
installing it, keep the module out of the package graph, or use one package. That is an input shared
with [what shape is the deployable?](what-shape-is-the-deployable.md) and
[is server TypeScript transpiled or stripped?](is-server-typescript-transpiled-or-stripped.md).

*Sourced — [pnpm.io/cli/deploy](https://pnpm.io/cli/deploy),
[pnpm.io/workspaces](https://pnpm.io/workspaces) and [pnpm.io/package_json](https://pnpm.io/package_json),
read 2026-09-20 by a research agent. I did not open them. The docs do not say whether the sibling
lands as a copy or a hardlink, and pnpm/pnpm#12176 reports a hardlink; either way the path is under
`node_modules`, which is what the limit turns on. Unmeasured against pnpm 12.5.1.*

**Running one script across every package differs between the tools, and not by enough to matter
here.** All of npm, pnpm and Yarn exit non-zero when one package's script fails. npm runs them
serially and continues past a failure, Yarn stops at the first, pnpm runs them in parallel in
dependency order and reports each. Recorded so nobody re-runs the comparison: it discriminates
nothing, and the tool is settled regardless.

*Measured on 2026-09-19 with three packages whose middle one exits 1.*

### Pass of 2026-09-20: the field was rebuilt and three things separate it

**A Node subpath import resolves to TypeScript source and is stripped, which makes a single package
with named internal specifiers a real option rather than a hypothetical one.** With
`"imports": {"#rules/*": "./src/rules/*"}` in the manifest, `import "#rules/board.ts"` runs from any
directory depth. The extension is mandatory: `#rules/board` fails with `ERR_MODULE_NOT_FOUND`, which
matches Node's rule that "file extensions are mandatory in `import` statements". `import.meta.resolve`
reports the real source path, so nothing is copied and `node_modules` is never involved. This is the
option the earlier field did not contain, and it removes the relative-path objection that was the
main practical case against one package.

*Measured — a scratch package with `src/rules/`, `src/server/` and `src/deep/nested/`, run on Node
v26.7.0 by me on 2026-09-20. Nothing was installed into this repository. The extension rule is also
Sourced from [nodejs.org/api/typescript.html](https://nodejs.org/api/typescript.html), read the same
day by a research agent; I did not open it.*

**One `tsconfig.json` cannot type-check this codebase correctly, whatever the package count.**
`lib` and `types` are set once per config and there is no per-directory scoping, so a single config
either shows `document` to the server, or `process` to the client, or is wrong for the rules module
which should see neither. **So "one package means one configuration file" is false**, and the
comparison is between shapes that all need several tsconfigs, differing only in whether package
manifests sit beside them.

*Sourced — TypeScript's `lib` and `types` reference pages, read 2026-09-20 by a research agent. I did
not open them.*

**TypeScript project references are a compile-time graph and nothing else.** `composite: true`
requires `declaration`, requires every implementation file to be matched by `include` or `files`,
and is built with `tsc --build`. They work inside one package with no separate manifests, since the
mechanism is tsconfig files rather than packages. They do not affect what resolves at run time, so
whichever shape is chosen still needs relative paths, subpath imports or a bundler alias underneath
them.

*Sourced — the TypeScript handbook's Project References page, read 2026-09-20 by a research agent. I
did not open it.*

**TypeScript 7 has shipped, it is what a fresh install gets, and the type-aware lint ecosystem has
not caught up.** `typescript@7.0.2` is npm's `latest`. Its root export is `./lib/version.cjs` alone,
with the compiler surface under `./unstable/*` subpaths, so the programmatic API earlier tooling was
built on is not there. `typescript-eslint@8.70.0` declares a peer range of
`typescript >=4.8.4 <6.1.0`, so it does not install against it. **This binds more than this
question** — it reaches
[what runs the checks on every change?](what-runs-the-checks-on-every-change.md),
[what runs the tests?](what-runs-the-tests.md) and
[is server TypeScript transpiled or stripped?](is-server-typescript-transpiled-or-stripped.md), and
it likely belongs in [../constraints.md](../constraints.md) rather than here. It decays fast in one
direction only: the lint side gets fixed, the API stabilises, and this entry stops being true
without anything announcing it.

*Measured — `npm view typescript dist-tags`, `npm view typescript@7.0.2 exports` and
`npm view typescript-eslint@8.70.0 peerDependencies`, run by me on 2026-09-20. The GA date of
2026-07-08 and the Go-native port's history are a research agent's, from the TypeScript devblog; I
did not open it.*

**The workspace shapes carry a failure the single-package shapes cannot have.** A sibling reached
through a `node_modules` symlink can resolve a shared dependency to a different physical copy than
its consumer does, producing two module instances of one module in one process. It bites anything
holding module-level state, which for this system would be a cache or a configured client rather
than a pure rules function. The documented mitigations are Vite's `resolve.dedupe`,
`optimizeDeps.include`, or switching the sibling to a hard-linked injected dependency. Recorded as a
cost of the workspace shapes, not as a disqualifier: nothing in the rules module holds state today.

*Sourced — vitejs/vite#12743 and vitejs/vite-plugin-react#33, read 2026-09-20 by a research agent. I
did not open them. Unmeasured here.*

**Go-to-definition lands on source in every shape except one.** With relative imports or subpath
imports, resolution reaches the `.ts` file directly and there is no declaration file in the way.
With a workspace sibling whose manifest points at built output, it lands on the `.d.ts` unless
`declarationMap` is on, or the editor's separate "Go to Source Definition" command is used, which
TypeScript documents as heuristic. A workspace sibling pointing `main` and `types` at `./src/index.ts`
behaves like the single-package shapes.

*Sourced — TypeScript's `declarationMap` reference and the 4.7 release notes, read 2026-09-20 by a
research agent. I did not open them.*

**No task orchestrator has a problem to solve here yet.** Nx 23.2.1, Turborepo 2.11.2, Moon 2.5.5,
Rush 5.179.0, Wireit 0.14.13 and Bazel 9.2.0 all add task caching, a task graph and
affected-package detection over whatever layout is chosen. `pnpm -r` with `--filter` already runs
scripts recursively in dependency order and selects what changed since a git ref. Three of them run
a background daemon by default and two send anonymous telemetry by default. Recorded so the
comparison is not redone: none of them is a layout, and choosing one is a separate decision nothing
currently needs.

*Sourced — each project's own documentation and npm registry metadata, read 2026-09-20 by a research
agent. I did not open them. Moon's and Rush's telemetry defaults the agent could not establish.*

### The spike of 2026-09-20: both shapes were built and run

**Method.** Two scratch repositories outside this one, each with a rules module, a Node server
importing it, and a Vite client importing it, on Node v26.7.0, pnpm 12.5.1, Vite 8.3.0 and
TypeScript 7.0.2. Shape A is one package with `"imports": {"#rules/board": "./src/rules/board.ts"}`.
Shape B is a pnpm workspace with `@puzzles/rules` whose `main`, `types` and `exports` all point at
`./src/index.ts`, depended on as `workspace:*`. Each was checked on the same five things. Both
scratch repositories were deleted afterwards. Run by me.

**Everything the records require works in both shapes.** Node executed the server against the shared
rules source in both. Vite built the client against the same source in both, with the rules code
inlined into the output chunk. Three tsconfigs per shape, one per area with its own `lib` and
`types`, type-checked clean in both.
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) is
satisfied either way, so it separates nothing.

**[ADR-0033](../decisions/0033-an-import-of-an-undeclared-dependency-fails.md) is satisfied in both,
which was not obvious.** An undeclared transitive dependency, `lightningcss` by way of Vite, failed
to resolve in the single package exactly as it did in the workspace. pnpm's isolated linker delivers
that property from one manifest, so the choice does not put that record at risk.

*Measured — `require.resolve` of a transitive dependency from each shape's root, 2026-09-20.*

**What does separate them is the boundary between the client, the server and the generator, and it
is narrower than "workspaces enforce boundaries".** Made the client import a server module that
imports `node:http`, in both shapes:

- In the workspace, both halves refuse. `tsc` reports TS2307, and `vite build` fails outright with
  a resolution error.
- In the single package, `tsc` reports TS2591 and refuses, because the client's config carries
  `types: []`. But `vite build` **succeeds**, emitting only a warning that `node:http` "has been
  externalized for browser compatibility".

So the single package is not unguarded, it is guarded by the type check alone, and the build will
ship a broken bundle past a warning if nothing runs that check. Nothing runs any check in this
repository today, which is
[what runs the checks on every change?](what-runs-the-checks-on-every-change.md) at M2.

*Measured — 2026-09-20, both shapes, the same offending import.*

**The packaging hazard is real, and it is worse than a broken artifact: the deploy reports
success.** `pnpm --filter @puzzles/server deploy out` completed in 48ms with no warning. The rules
module landed at a real path under `out/node_modules/.pnpm/...`, and running the deployed server
threw `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` at its first import. This is the constraint in
[../constraints.md](../constraints.md) reproduced through the actual tool rather than argued, and it
applies to the workspace shapes only. The single package cannot meet it.

*Measured — pnpm 12.5.1 and Node v26.7.0, 2026-09-20.*

**Subpath imports carry one trap worth writing down, because two of the three fixes do not work.**
With `rewriteRelativeImportExtensions` on, a specifier of `#rules/board.ts` fails type checking with
TS2877, "this import uses a '.ts' extension to resolve to an input TypeScript file, but will not be
rewritten during emit because it is not a relative path". Adding `allowImportingTsExtensions` does
not silence it. What works is putting the extension in the target rather than the specifier:
`"#rules/board": "./src/rules/board.ts"`, imported as `#rules/board`. Node resolves it, Vite bundles
it, and all three configs check clean.

*Measured — 2026-09-20, TypeScript 7.0.2 and Node v26.7.0.*

**Reversal was traced rather than assumed, and it is symmetric.** Going either direction is adding
or deleting three manifests and a `pnpm-workspace.yaml`, plus rewriting import specifiers between
`#rules/...` and `@puzzles/rules` at every import site. At M1 that is a handful of sites. Neither
direction forecloses the other, so optionality between these two does not decide it.

**What the spike did not settle.** Which shape is better to live in over years, which no measurement
reaches. Whether the generator is a third deployable at all. And what a container image or a copied
tree does with the rules module, which belongs to
[what shape is the deployable?](what-shape-is-the-deployable.md) rather than here, and which is the
one thing that could make the workspace hazard moot.
