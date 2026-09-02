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

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split out of the rendering question.

## Options

The TypeScript toolchains, if
[the language question](../decisions/0007-that-language-is-typescript.md) resolves that way — Vite and
Bun being the obvious two, with a framework's own tooling a third where it has one.

Narrowed by the research below to Vite. Bun remains a live option for the parts of the toolchain
that are not the browser build, and those are separate choices.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The tooling for generating a precache manifest exists for one toolchain and not the other.**
See [how does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md).

Researched 2026-08-31, with Bun 1.4.0 released eleven days earlier.

**Bun cannot bundle for a browser target.** Its `--target` accepts only `browser`, `bun` or
`node`, and its documentation states plainly that it does not down-convert syntax. There is no
equivalent of a browserslist or a legacy plugin, so recent syntax reaches whatever device opens
the app, and there is no escape hatch short of running a separate transform pass. This alone
decides the question against it.

*Sourced — Bun's own documentation, as the file states it.*

**It cannot bundle web workers**, and the issue has been open since March 2025 with a community
implementation closed unmerged. A solver or generator on a worker thread is the obvious way to
keep the interface responsive, so this forecloses an architecture we have not decided against.

*Sourced — the Bun issue tracking web worker bundling support, open since March 2025 with an unmerged community implementation, as the file states it.*

**It has no way to control chunking and emits no preload hints.** The option that would do it is
silently accepted and silently ignored. Against
[../constraints.md](../constraints.md)'s finding that a cold load on a degraded link is dominated
by round trips, extra chunk depth costs a serialised round trip each — the one place where size
and shape genuinely matter.

*Unverified — no source recorded.*

**There is no way to generate a precache manifest, and its plugins do not run in production
builds.** Plugin configuration is honoured by the dev server and ignored by the build command, so
a service worker would exist only in production and could never be exercised in development. For
an app whose offline behaviour is a promise, testing that behaviour only after deploying is not
an acceptable loop. The underlying tooling does run under Bun if driven by hand, so this is
buildable — but it is a pipeline we would own and maintain alone.

*Unverified — no source recorded.*

**Almost nobody ships a browser build with it.** A code search found roughly eight hundred
repositories using Vite for every one using Bun's bundler with a component framework, and no
framework has adopted it — Vite's own future is a different bundler again. Every bug in that path
would be ours to find first, which is the opposite of what one maintainer wants.

*Measured — a code search comparing repositories using Vite against repositories using Bun's bundler with a component framework, as the file states it.*

**Its test runner is the wrong instrument for this app specifically.** No watch mode, no branch
coverage at all, and DOM snapshots that are unusable on a grid this size. A failing assertion
against a rendered 81-cell grid measured six seconds and reported as a timeout with the diff
never printed. Branch coverage is exactly what a pure rules module most wants measured.

*Measured — a failing assertion run against a rendered 81-cell grid, as the file states it.*

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

*Unverified — no source recorded.*

**The AI-rewrite story is not the reason to decline Bun, and should not be used as one.** Bun
1.4.0 was a complete rewrite from Zig to Rust, largely machine-generated. The measurable
aftermath does not support alarm: issue volume in the eleven days after release matched the
previous major exactly, from near-identical baselines, while crash reports fell more than
threefold against an install base seven times larger. The failure mode shifted from crashes to
hangs, which is what that kind of port would predict. The reasons above are capability gaps and
hold regardless.

*Measured — issue volume and crash reports in the eleven days after Bun 1.4.0's release, compared against the previous major version, as the file states it.*
