---
opened: 2026-09-18
status: answered
resolves_into: decision
---

# Does one tool build the client and answer HTTP?

**Answered, by [ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md): no single tool owns both the client build and the HTTP request path.**
The question as posed was also the wrong one, because no property in
[what must the client and the server each be able to do?](what-must-the-client-and-server-be-able-to-do.md)
is about how many tools there are, so the list every M1 toolchain choice is scored against could not
score it. This file is kept only until the floor-format record has taken what it needs, then deleted.
Do not work it.

## Why it matters

It decides how many records get written, which nothing else open in M1 does. One answer
collapses [what renders the client?](what-renders-the-client.md),
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md) and
[what builds the client and serves it in development?](what-builds-the-client-and-serves-it-in-development.md)
into a single choice. The other leaves all three standing, each with its own field.

**Answering any of those three first answers this one by consequence**, and that is the failure
this file exists to prevent. Choosing a renderer that is not a meta-framework removes the
meta-framework option from the server question. Choosing a bundler removes it from both. Each of
those is a narrower choice deciding a wider one, and each reads as ordinary progress while it
happens.

It reaches the runtime too, in the other direction. A meta-framework ships adapters for some
runtimes and not others, so an answer here bounds the runtime, and a
runtime settled first bounds which tools remain. Neither bounded the other in the end: the field ran
under all three, and [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) chose Node on other grounds.

**What it does not decide is whether the entry document is produced at build time.**
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md)
already settles that, and states plainly that it excludes neither shape.

## What would settle it

Scoring both shapes against
[what must the client and the server each be able to do?](what-must-the-client-and-server-be-able-to-do.md),
which is the list every M1 toolchain choice is scored against and which no survey of this class
has been run against yet. Four properties in it bear directly on a single tool holding both
halves: resolving an import of the shared rules module from a browser entry point and from a
process outside the browser with no publish step, lowering emitted syntax to a declared floor,
reading that floor from one declaration with three readers, and emitting a manifest naming the
document and every asset it needs.

**The field has not been built and the properties have not been applied to it.** The candidates
under **Options** are carried in from
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md), where
they were surveyed as HTTP handlers rather than as answers to this question, so that list is a
starting point and not the field.

Whether running something is required is open until the reading is done. The reading may settle
it: a shape that cannot satisfy the four properties above is out on the properties, not on a
measurement.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-18. Three question files describe this fork as coupling between them and none of
them asks it. [What renders the client?](what-renders-the-client.md) lists a meta-framework as a
class of answer,
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md) lists a
meta-framework's own server as a candidate, and each defers the choice to the other.

## Options

**This is not the field.** The candidates below were profiled as HTTP handlers under
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md) and have
never been scored against
[what must the client and the server each be able to do?](what-must-the-client-and-server-be-able-to-do.md).
Narrowing from this list means scoring against criteria this question did not set.

*One tool.* A meta-framework builds the client bundle, produces the entry document and answers
HTTP from one project. Carried in from
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md):
SvelteKit, Astro, TanStack Start, Nuxt, React Router, Qwik City and Analog, with Next eliminated
there because a request-reading handler is unsupported under a static export. One toolchain to
configure, one dev server, one build. Its cost is that this answer also chooses the renderer and
the bundler, so the replacement cost of leaving it is the client half rather than one module.

*Separate tools.* A bundler builds the client, a router or the runtime's own server API answers
HTTP, and each is chosen on its own merits and replaced on its own. Its cost is three
configurations and three upgrade paths for one maintainer, against
[../problem.md](../problem.md)'s ranking of clarity over cleverness because one person maintains
this.

*One tool for the build and the document, a separate server.* A middle that is a real
configuration rather than a blend: the meta-framework prerenders and builds, and the API is a
separate deployable. It is what choosing Next would force. Its cost is that it keeps two of the
three configurations while giving up the one thing the first option buys.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Nothing here has been surveyed against the property list.** The candidates under **Options**
were profiled as HTTP handlers, and no claim about any of them as a renderer, a build or a floor
declaration has been established. Treat the list as the previous survey's by-product.

**Two of the shapes are documented and one is eliminated.** SvelteKit's `adapter-node` with
`prerender` on the root layout, and Astro's `output: 'static'` with `export const prerender =
false` per API endpoint, both serve API routes alongside a prerendered document. TanStack Start's
`prerender` with server functions is the same shape and is a release candidate rather than a
stable release. Next is eliminated: under `output: 'export'` its own guide states "If you need to
read dynamic values from the incoming request, you cannot use a static export", and its
Unsupported Features list names "Route Handlers that rely on Request". **Reverses if** Next
supports request-reading handlers under a static export.

*Sourced — Astro's configuration, on-demand-rendering and endpoints guides and TanStack Start's
overview, read 2026-09-17 by a research agent, recorded in
[what handles HTTP requests on the server?](what-handles-http-requests-on-the-server.md). Next's
static export guide was opened and quoted there on 2026-09-17 against the page's stated version
16.3.5.*

**Every surveyed framework builds on Vite, so a meta-framework inherits Vite's floor behaviour.**
SvelteKit, Astro, TanStack Start, Nuxt, React Router, Qwik and SolidStart all sit on a Vite
build. Vite's `build.target` takes an ES version, a browser-and-version string or an array, and
the word browserslist does not appear on its documentation. So the first option does not escape
the adapter
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
needs, and that adapter is priced at one package or roughly sixty-five lines in
[what format declares the browser floor?](what-format-declares-the-browser-floor.md). Whether
each framework exposes `build.target` at all is unchecked.

*Sourced — [vite.dev/config/build-options.html](https://vite.dev/config/build-options.html),
opened by me on 2026-09-18. The framework-to-Vite pairing is recorded in
[what builds the client and serves it in development?](what-builds-the-client-and-serves-it-in-development.md)
from a GitHub code search run 2026-09-04 by a research agent; I did not run it.*

**The replacement cost of this position is not established, and two files order it differently.**
The runtime question held
that "the runtime is the least reversible position in the stack", which
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) went on to contradict.
[What renders the client?](what-renders-the-client.md) holds that "a renderer swap is cheap
enough relative to the runtime that no candidate here is removed by it", while
[README.md](README.md) records the renderer as the largest re-scaffold M1 can create. Those
cannot all hold.
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
prices every stewardship concern by exactly this ordering, and its own reversal condition names
the gap: the ordering "assumed here" may turn out different once something has been run. Nothing
has been run.

*Unverified — no source recorded for the ordering in any of the three files.*

**The property list cannot score this question, and that is a defect in the question rather than in
the list.** [What must the client and the server each be able to do?](what-must-the-client-and-server-be-able-to-do.md)
holds eight toolchain properties: emit the entry document as a build output, put content in it the
bundle does not deliver, lower emitted syntax to a declared floor, read that floor from one
declaration with three readers, emit content-hashed filenames, emit a manifest, resolve the shared
rules import from a browser entry point and a process outside the browser with no publish step, and
build two deployables. None of them says anything about how many tools do the work. So the thing this
file asks is not a property the system has, and **What would settle it** above proposes scoring
against a list that has nothing to score.

**The coupling this file was opened for is real; the framing is what fails.** Adopting SvelteKit is
adopting Svelte and Vite and SvelteKit's server in one act, and three question files each deferring to
the others is the failure the portable decision-making standard names. What follows from that is that
the renderer, the HTTP handler and the build are worked as one field of candidate toolchains, where a
bundled framework and an assembled set are both points in the field, scored against the same
properties. How many records fall out is then decided by the separability test in
[../decisions/README.md](../decisions/README.md) when the records are written, rather than announced
in advance.

**Whether this file is mined and deleted, or rewritten as the toolchain question, is undecided.** It
is recorded here so that a reader does not work the question as posed.

**The lowering-target check was run on 2026-09-19 and removed nobody.** All seven meta-frameworks
listed under **Options** build on Vite, and SvelteKit, Astro and React Router are plain Vite projects
with a plugin added, so `build.target` is set the ordinary way. The unchecked claim recorded above —
whether each framework exposes it at all — is now checked for those three and found not to
discriminate. A report that Nuxt cannot set it does not hold: the evidence was nuxt/nuxt#20065, filed
and closed as not planned within four hours on 2023-04-04 against Nuxt 3, and Nuxt is now 4.5.2 on
Vite 8 with an `esbuild.options.target` option. The full result, including the caveat that Nuxt
remains unverified rather than cleared, is in
[what builds the client and serves it in development?](what-builds-the-client-and-serves-it-in-development.md).

*Sourced — nuxt/nuxt#20065 and Nuxt's current configuration reference opened by me on 2026-09-19; the
Vite peer dependencies and `build.target` reference read the same day by a research agent I did not
follow to source.*

**What does discriminate is the precache manifest, and it removes three candidates from the "one
tool" option.** TanStack Start, React Router in SPA mode and Qwik City cannot today produce a precache
manifest naming the entry document, which
[ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md) and
[the app never opens to a blank screen after the first visit](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md)
between them require. The issue numbers, their states and their reversal conditions are recorded in
[what builds the client and serves it in development?](what-builds-the-client-and-serves-it-in-development.md)
rather than duplicated here.
