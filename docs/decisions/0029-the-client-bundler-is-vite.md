---
number: 0029
status: accepted
amended: 2026-09-23
date: 2026-09-19
---

# 29 — the client bundler is Vite

## Forced by

[ADR-0028](0028-the-client-build-and-the-http-server-are-separate-tools.md) settles that a bundler
builds the client and something else answers HTTP, so a framework's own tooling is not a candidate
here.

[ADR-0025](0025-the-client-build-lowers-syntax-to-a-declared-floor.md) requires the build to lower
emitted syntax to a declared floor, and
[ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md) requires that
floor to come from one declaration read by three consumers.

[ADR-0023](0023-a-service-worker-answers-every-navigation-after-the-first.md) and
[../constraints.md](../constraints.md) between them require a precache manifest naming the document
and every asset with a revision each, per
[ADR-0028](0028-the-client-build-and-the-http-server-are-separate-tools.md)'s reasoning.

## Decision

**Vite builds the client bundle and serves it in development.** Its `build.target` takes a
browser-and-version string, which satisfies
[ADR-0025](0025-the-client-build-lowers-syntax-to-a-declared-floor.md). It does not read a
browserslist declaration, so if the shared declaration
[ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md) requires is
written in browserslist, Vite reads it through an adapter. What format carries the declaration is
[open until M2](../questions/what-format-declares-the-browser-floor.md).

## Enforced by

`vite.config.ts` sets `build.target` to the floor's named versions, typed so that a keyword does not
compile, and `vite.config.test.ts` fails if the build stops lowering syntax the floor cannot parse.
Two conditions are unmet: the target coming from the shared declaration once M2 adds the checks that
also read it, and the build emitting a precache manifest that contains the entry document. The
second is the one worth checking directly,
because [ADR-0028](0028-the-client-build-and-the-http-server-are-separate-tools.md) rejects three
candidates for failing it and nothing here proves this one succeeds.

## Rejected

- **`bun build`** — it does not down-convert syntax and exposes no setting that would, which
  [ADR-0025](0025-the-client-build-lowers-syntax-to-a-declared-floor.md) requires. Its own
  documentation states: "Bun does not down-convert syntax; if you use recent ECMAScript syntax, it
  appears as-is in the bundled code." This disqualifies it alone. **Reverses if** Bun adds a target
  option that lowers syntax. Bun remains live for every other part of the toolchain.
- **Parcel** — it took 14 commits from four authors over twelve months, in a position that holds the
  precache manifest, the lowering target and the dev server at once.
  [ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
  prices a supply worry by what leaving costs, and leaving this position means rebuilding all three.
  This disqualifies it alone. **Reverses if** its activity recovers to a level where the supply is
  not one person's attention.

**webpack, Rspack and Rsbuild are not disqualified, and this record says so rather than inventing a
reason.** All three read a browserslist configuration natively, which is an advantage over Vite on
[ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md) rather than a
disadvantage, and `workbox-webpack-plugin` covers the manifest for webpack. What decided against them
is the development loop, which
[what builds the client and serves it in development?](../questions/what-builds-the-client-and-serves-it-in-development.md)
names as the maintainer's daily cost of this choice, and that `vite-plugin-pwa` is the reference
integration for the manifest rather than one of several. Neither is a disqualification and neither is
measured here.

So this is a preference between viable options, and it is recorded as one. **Reverses if** the
development loop under Vite turns out worse than under a webpack-lineage tool on this project, or if
the adapter Vite needs for
[ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md) costs more
than the one package or roughly sixty-five lines it is priced at.

**esbuild, Rollup, Rolldown, Oxc and Farm** were established only as not reading a browserslist
configuration. Nothing else about them was checked, so they are unargued rather than rejected, and a
reader should treat this section as covering six candidates rather than eleven.

## Risk

**Vite is the one survivor that would need an adapter if the floor is declared in browserslist**,
where three rejected candidates read it natively. That is a cost taken knowingly, and it is the
clearest place this record could be wrong.

**Vite 8 sits on Rolldown, which reached 1.0 fifty-six days before Vite 8 went generally available.**
The build's foundation is newer than the build. An open defect omits an imported worker from the
build manifest, which is the machinery a precache manifest reads.

**The chosen reason is not measured.** The development loop decided this and no number was produced
for it here.

## Revisit when

The precache manifest cannot be made to contain the entry document, or the shared floor declaration
cannot drive `build.target` through an adapter. Either one removes the reason this was chosen over a
webpack-lineage tool that reads browserslist natively and has a first-party Workbox plugin.

Also when the development loop is first measured on this project rather than assumed.

## Also update

- [x] questions/README.md — the floor format is unblocked by this and moves into the ordered list
- [x] architecture.md — nothing moved; this names no boundary
- [x] constraints.md — nothing moved; the bundler facts are evidence about named projects and stay
      under **Findings** in the question file
- [x] glossary.md — nothing moved
- [x] guarantees/ — nothing moved
