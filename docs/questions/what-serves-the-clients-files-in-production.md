---
opened: 2026-09-02
status: open
resolves_into: decision
---

# What serves the client's files in production?

**Production only.** What serves them while developing is Vite's dev server, per
[ADR-0029](../decisions/0029-the-client-bundler-is-vite.md).
They are the same job in two environments, and the gap between them is
[how is the app run locally the way it runs deployed?](how-is-the-app-run-locally-the-way-it-runs-deployed.md).

## Why it matters

Something has to answer the browser when it asks for the client, and nothing currently says what.
[ADR-0035](../decisions/0035-the-http-handler-is-fastify.md) settles the layer answering API requests
and says nothing about static assets.
[Where does this run?](where-does-this-run.md) picks a host, not what the host serves with.

It is what makes the one origin required by [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) real. The same process can
serve both the client's files and the API, a proxy can route by path to two backends, or a platform or
content delivery network can route between two deployables. Each presents one origin to the browser,
and they differ in who owns caching, and in whether something in front can cache an API response or
strip `Set-Cookie`, per the findings below.

It also decides who owns cache headers.
[../constraints.md](../constraints.md) records that without content-hashed filenames a browser
revalidates every cached asset with a conditional request — cheap on a desktop, a round trip per
asset on a weak mobile link, which is the link this app is designed for.

## What would settle it

Knowing what the client is — a set of files, or something a process produces — and then what the
chosen host offers. Several hosts serve static assets as a feature, which makes this fall out rather
than be chosen; others do not, and then it is a real decision about what runs.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02, when M1's requirements were listed against the questions blocking them and "a
browser can load the client" turned out to have nothing under it that said what answers the request.

## Options

*The same process that answers the API.* One deployable, one origin by construction, no routing to
arrange. The process spends work on bytes that never change, and cache headers are ours to get right.

*A content delivery network in front, the API behind.* Assets served close to the player and cached
properly with little effort. Introduces the question of whether the browser still sees one origin.

*Whatever the host provides.* Several platforms serve static assets as a feature of deploying. Least
work, and it makes the arrangement the platform's rather than ours to reason about.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Content-hashed filenames are what make an asset cacheable without a revalidation round trip**, per
[../constraints.md](../constraints.md). That is produced by whatever builds the client, so this
question and the build, which is Vite per
[ADR-0029](../decisions/0029-the-client-bundler-is-vite.md), meet at the filenames.

**The client is a set of files, so this is a real question rather than a collapsed one.**
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md) settles
that the entry document is produced by the build. Had it gone the other way, the process producing the
document would already be answering the browser and this would have folded into the HTTP handler
choice, since settled at [ADR-0035](../decisions/0035-the-http-handler-is-fastify.md). It does not
follow that a separate file host is required — the same process may serve both — only that something
has to be chosen to serve files. What that record leaves for this one is unchanged: Fastify serves
static files through `@fastify/static`, which was measured setting a different `Cache-Control` per
asset class and answering both conditional-request headers with a 304, so the same process remains a
live option here rather than a foregone one.
*Measured — with `@fastify/static` 10.1.4 in the HTTP handler spike on 2026-09-21, recorded in the
question file deleted by commit `dff3fd0`; `git show
dff3fd0^:docs/questions/what-handles-http-requests-on-the-server.md` reads it.*

**Something in front of the server can cache an API response or strip `Set-Cookie`.** Cloudflare's
cache-behaviour documentation describes configurations where it removes `Set-Cookie` and caches the
response, and Vercel caches external rewrites that return cache headers by default for projects
created on or after 2026-04-06. A rule written for the files and applied to the whole origin reaches
the API too.

*Sourced — Cloudflare `developers.cloudflare.com/cache/concepts/cache-behavior/` and Vercel
`vercel.com/docs/rewrites`, read by a research agent 2026-09-26. Not re-opened.*

**CloudFront caches `Set-Cookie` with the object once a cache behaviour forwards cookies, and replays
it on every cache hit.** AWS's cookie documentation says that where cookies are forwarded and "the
origin response includes Set-Cookie headers, CloudFront returns them to the viewer... CloudFront also
caches the Set-Cookie headers with the object... and sends those Set-Cookie headers to viewers on all
cache hits." Its fix is an origin response carrying `Cache-Control: no-cache="Set-Cookie"`.
Cloudflare's default leans the other way: it does not cache HTML or JSON unless told to. So which way
a CDN in front fails with an API response is per vendor, and cannot be assumed from "a CDN".

*Sourced by a research agent 2026-09-26 from the CloudFront developer guide's
[cookie caching page](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Cookies.html)
and Cloudflare's [default cache behaviour](https://developers.cloudflare.com/cache/about/default-cache-behavior/).
Not re-opened.*

**Cloudflare Pages falls back to the entry document for a path nothing else matches.** Its routing
docs say an unmatched request "will fall back to a static asset if there is one. Otherwise, the
Function will fall back to the default routing behavior for Pages' static assets", and with no
top-level `404.html` Pages treats the project as a single-page app. Under
[ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md) that
arrangement has to send all of `/api/` to the server, or an unknown API path gets the entry document
with a 200.

*Sourced by a research agent 2026-09-26 from [Pages Functions routing](https://developers.cloudflare.com/pages/functions/routing/)
and [serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/). Not
re-opened.*
