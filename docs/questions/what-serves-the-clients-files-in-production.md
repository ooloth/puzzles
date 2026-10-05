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
The host is a bare DigitalOcean Droplet per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md), which serves no
files as a platform feature, so something we run on it or in front of it has to.

It is what makes the one origin required by [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) real. The same process can
serve both the client's files and the API, a proxy can route by path to two backends, or a content
delivery network can route between two deployables. Each presents one origin to the browser,
and they differ in who owns caching, and in whether something in front can cache an API response or
strip `Set-Cookie`, per the findings below.

It also decides who owns cache headers.
[../constraints.md](../constraints.md) records that a cached asset is used without a request only
while it is fresh, and that with no explicit expiry the browser may guess one. So without
content-hashed filenames and explicit headers, a browser either revalidates each asset, a round trip
per asset on the weak mobile link this app is designed for, or runs stale files after a deploy.

## What would settle it

Knowing what the client is, a set of files or something a process produces, and then what serves it
on the Droplet or in front of it. A Droplet serves no static assets as a feature, per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md), so this is a
real decision about what runs.

## Properties the answer is scored against

Derived on 2026-10-04 for every question on the path from the Droplet to the player: this one,
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md),
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md) and
[can a page loaded before a deploy still fetch its files after it?](can-a-page-loaded-before-a-deploy-still-fetch-its-files-after-it.md).
The moments are a first visit, meaning the entry document, its assets and the service worker
installing; an installed app's first launch; a first visit to a deep link such as `/puzzle/12`; a
returning visit answered by the service worker; the browser checking the service worker script for
an update; any request under `/api/`; a deploy; the app process crashing or restarting; Caddy
restarting on an upgrade; the machine rebuilt from nothing; the local production-like run; and years
of maintenance. Each candidate is scored twice: with nothing in front of the Droplet (**A**) and with
a proxy in front (**B**). A verdict that differs between A and B makes the domain question an input
to this one.

**Safety**

1. At every instant, a deploy included, the entry document being served names only assets that are
   also being served. A bundle answered with a 404 is a blank screen, and the document is a build
   output per [ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md).
2. Only content-hashed files get a long `max-age`. The entry document and the service worker script
   get an explicit `no-cache`, so no browser assigns them a heuristic freshness lifetime, per
   [../constraints.md](../constraints.md) and [ADR-0029](../decisions/0029-the-client-bundler-is-vite.md).
   A stale service worker serves an old app indefinitely, per the Risk in
   [ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md).
3. No path under `/api/` is answered by the client's files or by the fallback to the entry document,
   and no rule written for the files reaches an API response, in A or B, per
   [ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md) and
   property 3 of [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md).
4. Only the build's output is reachable: no other path on disk, no dotfiles and no directory
   listing. From the portable security standard; no project record covers it.
5. In B, a deploy's new entry document reaches players without waiting out a proxy's cached copy,
   per the Risk in
   [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md).

**Performance**

6. On a first visit, the entry document, its assets and the first API call share one connection,
   per property 3 of
   [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) and
   "Mobile networks — setup cost, not bandwidth" in [../constraints.md](../constraints.md).
7. A returning visit sends no request for an unchanged content-hashed asset, per
   [../constraints.md](../constraints.md).
8. An unchanged entry document revalidates to a 304, with validators that agree across two running
   instances and across deploys that did not change it, per the weak link
   [../problem.md](../problem.md) designs for.
9. Assets are sent compressed, with the compression done when the client is built rather than per
   request. A first visit is the wait
   [ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md)
   accepted, and at the `2g` tier in [../constraints.md](../constraints.md) bytes are part of it.
10. On a first visit, files come from a point near the player. The Droplet is in North America per
    [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md). This can only separate
    A from B.

**Experience**

11. The local production-like run serves the files the same way, with only the hostname and
    certificate differing, per
    [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
    and property 12 of [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md).
12. The cache rule for each class of file lives in one place, and a deploy cannot run new files
    under old rules, per property 6 of
    [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md).
13. The least for the maintainer to configure and understand over years, per property 6 of
    [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) and
    property 13 of [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md).
14. A rebuilt machine serves the files again with no manual step, per
    [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md).
15. Hosting stays near $10 a month and under $20, per
    [ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md).
    It matters mainly for B.

**Resources.** Network binds, as round trips in 6 to 8 and 10, and as first-visit bytes in 9. CPU
does not bind: static bytes at this audience sit far below the capacity in
[../constraints.md](../constraints.md), per the resource note in
[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md). Memory
does not bind: serving files adds little to the app's 373 MB peak on a 961 MB machine, per
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). Storage does
not bind: a release's client is a few MB.

**Checked and binding on nothing:** deploying the two halves on separate schedules. [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) found
that the API tolerates older clients under any arrangement, because the service worker keeps them
running.

**Maximums.** Safety: no player ever loads a mixed or stale release, and no rule for the files ever
touches an API response. Performance: a first visit costs one connection setup and the round trips
for the document and its assets, from the nearest point; a returning visit costs no request for
files. Experience: one configuration, the same locally as in production, with nothing to remember at
deploy time.

**Deferred, each to the question that owns it.** Whether old assets are still fetchable after a
deploy is
[can a page loaded before a deploy still fetch its files after it?](can-a-page-loaded-before-a-deploy-still-fetch-its-files-after-it.md)
at M9. Security headers are
[does the app send a content security policy, and how strict?](does-the-app-send-a-content-security-policy-and-how-strict.md).
What counts as fast enough is
[what latency budget makes "immediately" checkable?](what-latency-budget-makes-immediately-checkable.md).
Noticing a dead API behind a working client is
[how do we know the deployed app is serving?](how-do-we-know-the-deployed-app-is-serving.md) at M11.
What the precache holds is
[how does the app itself stay available offline?](how-does-the-app-itself-stay-available-offline.md)
at M9.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02, when M1's requirements were listed against the questions blocking them and "a
browser can load the client" turned out to have nothing under it that said what answers the request.

## Options

Rebuilt from an enumeration of the field on 2026-10-04 rather than taken from the earlier list.

*C: Caddy serving the files from disk.* The front serves the client's files itself and passes only
`/api/` to the server, per
[ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md). The
Node process never touches a static byte, and the cache headers are Caddy's configuration.

*F: the Fastify process, with `@fastify/static`.* Each release serves its own copy of the client.
Caddy proxies every path to the app, and the cache headers are the app's code.

*B1: either of those, with a caching proxy in front of the Droplet.* Not a separate way of serving
the files: a proxy caches what C or F sends. It exists only if
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md) answers
"proxied".

*B2: an edge platform hosting the files, with `/api/` routed from the edge to the Droplet.* For
example Cloudflare Workers static assets with `run_worker_first` on `/api/*`. It exists only if the
domain is proxied, since the edge has to answer the hostname.

*Not yet.* Rejected by the slice: slice 4 deploys the client, so something has to serve it.

**Set aside by the enumeration**, each for the reason given. These are a research agent's readings
on 2026-10-04 and were not re-opened:

- A second static server process beside Caddy, such as `sirv`, adds a process and a hop for nothing
  Caddy lacks.
- Node serving files without `@fastify/static` is F with the path-traversal, validator and
  compression handling rewritten by hand.
- DigitalOcean Spaces with its CDN cannot route `/api/` to the Droplet on the same hostname, so it
  breaks [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md).
- GitHub Pages cannot proxy `/api/` or set headers.
- Netlify or Vercel with a rewrite of `/api/` to the Droplet is B2 on another vendor.
- A service worker answering every load after the first is already
  [ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md) and still
  needs a first load served.

Static hosting supplied by the platform is not open: a Droplet offers none, per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md).

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Content-hashed filenames are what make an asset cacheable without a revalidation round trip**, per
[../constraints.md](../constraints.md). That is produced by whatever builds the client, so this
question and the build, which is Vite per
[ADR-0029](../decisions/0029-the-client-bundler-is-vite.md), meet at the filenames.

**The client is a set of files, so this is a real question rather than a collapsed one.**
[ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md)
settles that the entry document is produced by the build. Had it gone the other way, the process
producing the document would already be answering the browser and this would have folded into the
HTTP handler choice, which is Fastify per
[ADR-0035](../decisions/0035-the-http-handler-is-fastify.md). It does not follow that a separate
file host is required — the same process may serve both — only that something has to be chosen to
serve files. What that record leaves for this one is unchanged: Fastify serves static files through
`@fastify/static`, which was measured setting a different `Cache-Control` per asset class and
answering both conditional-request headers with a 304, so the same process remains a live option
here rather than a foregone one.
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

**The front is Caddy, and a configuration giving each class of file its own cache header is valid.**
A configuration that served `/srv/client`, sent `public, max-age=31536000, immutable` for `/assets/*`
and `no-cache` for `/index.html`, and fell back to the entry document for unknown paths, passed
`caddy validate` on Debian 13. So "the front, serving the files from disk" is open with Caddy as that
front, per [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md). Whether it sends
those headers and answers conditional requests was not observed; no file was served.

*Measured that the configuration is valid, 2026-10-03, in the fourth pass of the front question, read
with `git show 0b31753:docs/questions/what-sits-in-front-of-the-app-and-terminates-tls.md`. That it
serves as configured is reasoned from Caddy's documentation, not measured.*


### First pass, 2026-10-04

**Both on-machine candidates validate on modification time and size, so neither gives a 304 across
two instances or across a deploy that rewrote identical bytes.** Caddy's `calculateEtag` is a
strong ETag built from `mtime.UnixNano()` and `Size()`. `@fastify/send` builds
`'W/"' + stat.size.toString(16) + '-' + stat.mtime.getTime().toString(16) + '"'`. Both are fixed by
giving the files a fixed modification time when the release is built. Caddy can also read an ETag
from a sidecar file through `etag_file_extensions`, which a build step could fill with a content
hash; F would need `setHeaders` code to do the same. Property 8 therefore depends on configuration
for both.

*Sourced: `modules/caddyhttp/fileserver/staticfiles.go` at tag v2.11.7 and `lib/send.js` on
`fastify/send` main, both opened by me on 2026-10-04. The sidecar option is a research agent's
reading of the same file, not re-opened.*

**`@fastify/static` serves dotfiles unless told not to.** Its `index.js` sets
`opts.dotfiles ??= 'allow'`, so a `.env` inside the served directory would be served. Caddy hides
nothing by default either beyond its own config files, and needs `hide .*`. Property 4 depends on
configuration for both.

*Sourced: `index.js` of `@fastify/static` 10.1.5, opened by me on 2026-10-04. Caddy's `hide` default
is a research agent's reading of its docs, not re-opened.*

**Each has a trap where the long cache header lands on the wrong response.** In Caddy, `try_files`
turns a missing `/assets/x.js` into the entry document with a 200, and that response carries the
`/assets/*` immutable header, so the HTML is cached for a year under the asset's URL. It is avoided by
leaving `/assets/*` out of the fallback so it 404s. In `@fastify/static`, `maxAge` and `immutable` set
at registration apply to every file under the root, `sw.js` and the fallback included, and
`maxAge: 0` gives `max-age=0` rather than `no-cache`. Property 2 depends on configuration for both.

*Sourced by a research agent on 2026-10-04 from Caddy's directive-order documentation and
`@fastify/static`'s README and `index.js`. Not re-opened, and not observed: no server was run.*

**Neither keeps the entry document and its assets consistent across a switch by itself.** Caddy
resolves the served path with `os.Stat` and `os.Open` on every request and caches nothing, so
swapping a symlink with `rename(2)` gives each request the old tree or the new one. But a page that
fetched the old entry document just before the swap asks for old assets just after it, and the same
happens with F when Caddy's `lb_policy first` sends the document and an asset to different instances
during the overlap. So property 1 holds for either only if the served tree keeps the previous
release's assets across the switch. That is a requirement on the deploy layout, shared with
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md), and how
long they are kept stays with
[can a page loaded before a deploy still fetch its files after it?](can-a-page-loaded-before-a-deploy-still-fetch-its-files-after-it.md).

*Caddy's per-request resolution is a research agent's reading of `staticfiles.go` and its `OsFS`,
2026-10-04, not re-opened. The F half is reasoned from Caddy's `reverse_proxy` documentation.*

**Where the cache rules live separates the two.** Under F the rules are code inside the release, so a
release is never served under another release's rules. Under C they are in the Caddyfile outside the
release, so a release that adds a class of file is served under whatever the Caddyfile says until it
is changed, which is property 12.

*Reasoned.*

**Precompressed files are served by both.** Caddy's `file_server { precompressed br zstd gzip }`
falls back to the raw file and sets `Vary: Accept-Encoding`. `@fastify/static`'s `preCompressed`
supports `br`, `gzip` and `deflate`, with no `zstd`. `vite-plugin-compression2` 2.5.3, published
2026-03-21, emits the files.

*Sourced: `supportedEncodings` in `@fastify/static`'s `index.js`, opened by me. The rest is a research
agent's reading of Caddy's `caddyfile.go` and the npm registry, not re-opened.*

**Cloudflare's proxy does not cache HTML or JSON by default**, so in B1 a deploy's entry document
reaches players at once and `/api/` responses are not cached unless a path ends in a cached
extension. Its docs: "The Cloudflare CDN does not cache HTML or JSON by default."

*Sourced: `developers.cloudflare.com/cache/concepts/default-cache-behavior/`, opened by me
2026-10-04.*

**B2 on Cloudflare's free plan answers `/api/` with 429 once the daily request limit is passed.** Its
docs: "If you exceed your free tier request limits, these requests will receive a 429 (Too Many
Requests) response instead of falling back to static asset serving." The free limit is 100,000
requests a day, and the paid plan that lifts it is $5 a month. A Worker also cannot `fetch()` a route
on its own zone, so the Droplet would need a second hostname for the Worker to reach.

*Sourced: `developers.cloudflare.com/workers/static-assets/billing-and-limitations/` and
`.../workers/configuration/routing/routes/`, opened by me 2026-10-04. The limit and price are a
research agent's reading of the Workers limits and pricing pages, not re-opened.*

**Cloudflare moves free-plan traffic away from a busy data centre first**, so property 10 is weaker
for its free plan than its city count suggests.

*Sourced by a research agent from Cloudflare's "Meet Traffic Manager" post, 2026-10-04. Not
re-opened.*

**Scored in both topologies, C against F comes out the same.** No verdict on properties 1 to 15
changes between A and B for C or F, because a proxy in front caches whatever either sends. B2 exists
only in B. So the domain question is an input to this one only through B2.

*Reasoned from the verdicts above.*
