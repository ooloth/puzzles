---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What provides the build and dev server?

## Why it matters

[What renders the client?](what-renders-the-client.md) rests primarily on the
inner loop being fast, and this is the component that delivers it. If the loop is slow, the
decision's main justification is not met by whatever implements it.

It is a separate question from which framework, because the two are less coupled than they appear:
most frameworks run under several toolchains, and a toolchain choice can be revisited without
rewriting the interface.

## Blocked by

N/A — nothing needs to be answered first, though a framework with a strongly implied toolchain
would narrow it.

## What would settle it

Measuring the thing the decision was made for: cold start, save-to-visible-result on a warm
server, and how both behave as the project grows past a handful of files. Ecosystem maturity
matters too, since a toolchain that breaks on an ordinary dependency costs more than it saves.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split out of the rendering question.

## Options

The TypeScript toolchains, if
[the language question](../decisions/0005-typescript-across-every-deployable.md) resolves that way — Vite and
Bun being the obvious two, with a framework's own tooling a third where it has one.

Narrowed by the research below to Vite. Bun remains a live option for the parts of the toolchain
that are not the browser build, and those are separate choices.

## Findings

**What this decides beyond itself.** [How does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md).
This looked independent and is not: the tooling for generating a precache manifest exists for one
toolchain and not the other, so the offline shell is downstream of this choice rather than beside
it.

Researched 2026-08-31, with Bun 1.4.0 released eleven days earlier.

**Bun cannot bundle for a browser target.** Its `--target` accepts only `browser`, `bun` or
`node`, and its documentation states plainly that it does not down-convert syntax. There is no
equivalent of a browserslist or a legacy plugin, so recent syntax reaches whatever device opens
the app, and there is no escape hatch short of running a separate transform pass. This alone
decides the question against it.

**It cannot bundle web workers**, and the issue has been open since March 2025 with a community
implementation closed unmerged. A solver or generator on a worker thread is the obvious way to
keep the interface responsive, so this forecloses an architecture we have not decided against.

**It has no way to control chunking and emits no preload hints.** The option that would do it is
silently accepted and silently ignored. Against
[../constraints.md](../constraints.md)'s finding that a cold load on a degraded link is dominated
by round trips, extra chunk depth costs a serialised round trip each — the one place where size
and shape genuinely matter.

**There is no way to generate a precache manifest, and its plugins do not run in production
builds.** Plugin configuration is honoured by the dev server and ignored by the build command, so
a service worker would exist only in production and could never be exercised in development. For
an app whose offline behaviour is a promise, testing that behaviour only after deploying is not
an acceptable loop. The underlying tooling does run under Bun if driven by hand, so this is
buildable — but it is a pipeline we would own and maintain alone.

**Almost nobody ships a browser build with it.** A code search found roughly eight hundred
repositories using Vite for every one using Bun's bundler with a component framework, and no
framework has adopted it — Vite's own future is a different bundler again. Every bug in that path
would be ours to find first, which is the opposite of what one maintainer wants.

**Its test runner is the wrong instrument for this app specifically.** No watch mode, no branch
coverage at all, and DOM snapshots that are unusable on a grid this size. A failing assertion
against a rendered 81-cell grid measured six seconds and reported as a timeout with the diff
never printed. Branch coverage is exactly what a pure rules module most wants measured.

**None of this rules Bun out as a package manager, a test runner for non-browser code, or a
server runtime.** Those are separate decisions, each reversible in about one line, and the
research found the runtime genuinely solid. The organising principle is to adopt it only where
backing out is cheap; a browser build with a service-worker pipeline built around it is not.

**Choosing Vite is not choosing a settled thing.** Vite 8 shipped on a bundler that had not yet
reached general availability, eight weeks ahead of it, and open regressions sit specifically in
the build-manifest machinery a precache manifest reads — including one where an imported worker
is missing from the manifest. For an offline-first app a manifest that omits an asset ships a
permanently broken cache to installed players. Its corporate steward is also being acquired. The
licence limits the lock-in; the roadmap is a genuine unknown, and this is the cost side of the
recommendation rather than a reason to reconsider it.

**The AI-rewrite story is not the reason to decline Bun, and should not be used as one.** Bun
1.4.0 was a complete rewrite from Zig to Rust, largely machine-generated. The measurable
aftermath does not support alarm: issue volume in the eleven days after release matched the
previous major exactly, from near-identical baselines, while crash reports fell more than
threefold against an install base seven times larger. The failure mode shifted from crashes to
hangs, which is what that kind of port would predict. The reasons above are capability gaps and
hold regardless.
