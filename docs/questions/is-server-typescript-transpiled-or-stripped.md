---
opened: 2026-09-19
status: open
resolves_into: decision
---

# Is server TypeScript transpiled or stripped?

## Why it matters

[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) chose Node and says
nothing about this, deliberately. Node strips types natively and strips **only erasable syntax**, so
enums, `namespace` with runtime code, parameter properties, import aliases and `.tsx` do not run
under it, and it reads no `tsconfig.json`, so path aliases do not resolve either. A transpiler in
front — `tsx`, `@swc-node`, `esbuild` — restores all of it.

**This is about one half of the codebase, not both.**
[ADR-0029](../decisions/0029-the-client-bundler-is-vite.md) already put a transpiler in this project:
Vite transforms TypeScript for the client. So "no transpiler" was never true of the whole system, and
what is open is the server, the generator and the repo scripts.

**It reaches the shared rules module.**
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)
requires one implementation imported by a browser build and by a process outside the browser with no
publish step. Under stripping, that module has to stay inside the erasable subset, because the batch
script executes the source directly. Under a transpiler it does not. So this question decides a real
constraint on the most-shared code in the repo.

**The runtime offers no middle any more.** `--experimental-transform-types` was Node's own way to
run enums and namespaces without a separate tool, and it was removed in v26. On the version line
[which Node version line does this track?](which-node-version-line-does-this-track.md) is likely to
land on, the choice is stripping or a real transpiler, with nothing in between.

## What would settle it

Whether this codebase wants any construct Node cannot strip. No record or promise needs one today,
and the libraries in play — a bundler, a router, a SQLite driver — impose none. That is a statement
about now rather than a prediction, which is what makes the asymmetry below worth more than the
forecast.

**The directions cost differently, and that is the substance of this question.** Starting with
stripping and adding a transpiler later is a dependency and a change to how scripts are invoked.
Starting with a transpiler and removing it later means finding and rewriting whatever constructs
needed it, which is unbounded because nothing marks them. The reversible direction is stripping,
and an answer that takes the irreversible one should say what it is buying.

What to weigh beyond that: whether a transpiler in the path costs anything in the daily loop, since
`node --watch` restarts on every change and a loader runs on every restart; whether debugging
survives, since stripping needs no source maps and a transpiler does; and whether type checking
differs, which it does not, because `tsc --noEmit` is the answer either way.

## Resolves into

A decision record in [../decisions/](../decisions/), and possibly an
[invariant](../invariants/) if the answer constrains what the shared rules module may contain.

## Source

Raised 2026-09-19. An audit of
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) found that its Decision
section settled this by implication — "no transpiler sits between the source and the runtime" — while
its Rejected section never rested on it and nobody had argued it. That record was amended to remove
the claim and this file is where it goes instead.

## Options

*Node's own stripping, with nothing in front.* No dependency, no loader, no source maps needed
because stripping preserves line numbers. Costs the erasable subset, and `erasableSyntaxOnly` in
`tsconfig.json` turns that from a discipline into a compile error.

*A transpiler in the path.* `tsx` or `@swc-node/register` run ahead of Node and restore the full
language, including `tsconfig` path aliases. Costs a dependency on the server's run path, a loader on
every restart, and source maps that have to be right for debugging to work.

*A build step producing JavaScript.* Node runs the output rather than the source. Costs a build to
keep in sync and a second artifact to reason about, and it is the shape
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) is
most wary of, since a stale build is a second implementation of the rules.

*Not yet.* Available, and cheaper than it looks: nothing needs deciding until the first TypeScript
file that would use a non-erasable construct. The cost of deferring is that the constructs spread
before anyone notices, which is the thing `erasableSyntaxOnly` prevents for free under the first
option.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Node's type stripping is stable and its limits are documented.** The page carries
"Stability: 2 - Stable", records that stripping is on by default from v22.18.0 and v23.6.0, states
that "Node.js ignores `tsconfig.json` files and therefore features that depend on settings within
`tsconfig.json`, such as paths... are intentionally unsupported", that decorators "are not
transformed and will result in a parser error", that ".tsx files are unsupported", and that
`--experimental-transform-types` was removed in v26. It recommends `noEmit`, `target: esnext`,
`module: nodenext`, `rewriteRelativeImportExtensions`, `erasableSyntaxOnly` and
`verbatimModuleSyntax` against TypeScript 5.8 or newer.

*Sourced — [nodejs.org/api/typescript.html](https://nodejs.org/api/typescript.html), opened and
quoted by me on 2026-09-19.*

**Stripping preserves line numbers, so no source maps are involved.** Types are replaced with
whitespace rather than transformed, which is why the documentation says source maps are unnecessary
for correct stack traces. A transpiler reintroduces the source-map layer and the class of debugging
bugs that comes with it.

*Sourced — the same page, same reading.*

**A workspace package is not affected by the `node_modules` restriction.** Node refuses to strip
TypeScript under a `node_modules` path, which reads as a threat to a shared rules module, and is not
one: a workspace package is symlinked and Node resolves the symlink to its real path. Measured by
building an npm workspace and running it under Node v26.7.0, where the bare-specifier import
succeeded and a genuine non-symlinked `.ts` file under `node_modules` failed with
`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`. So this question is not forced either way by
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)'s
no-publish-step requirement.

*Measured — by me on 2026-09-19, on Apple M2, macOS 26.6.2, Node v26.7.0.*

**`tsx` is the maintained alternative and is not the only one.** It is actively released and covers
what stripping does not, including `.tsx` and tsconfig `paths`. `@swc-node/register` is the
swc-based equivalent. `ts-node` is described across secondary sources as directing new projects to
Node's native support.

*Sourced — npm registry metadata, read 2026-09-19 by a research agent. I did not open it, and the
`ts-node` characterisation is secondary reporting rather than a maintainer statement.*
