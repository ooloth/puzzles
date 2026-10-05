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

Derived on 2026-10-04 for five questions on the path from the Droplet to the player:
[what serves the client's files in production?](what-serves-the-clients-files-in-production.md),
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md),
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md),
[can a page loaded before a deploy still fetch its files after it?](can-a-page-loaded-before-a-deploy-still-fetch-its-files-after-it.md)
and
[what gives the client's files a validator that changes only with their content?](what-gives-the-clients-files-a-validator-that-changes-only-with-their-content.md).
**This list is copied into each of the five, and a change to it is made in all five in the same
edit.** Properties a question has of its own follow the copy, under **Own to this question**.

The moments are a first visit, meaning the entry document, its assets and the service worker
installing; an installed app's first launch; a first visit to a deep link such as `/puzzle/12`; a
returning visit answered by the service worker; the browser checking the service worker script for
an update; any request under `/api/`; a deploy; the app process crashing or restarting; Caddy
restarting on an upgrade; the machine rebuilt from nothing; the local production-like run; and years
of maintenance. Each candidate is scored twice: with nothing in front of the Droplet (**A**) and with
a proxy in front (**B**). A verdict that differs between A and B makes the domain question an input
to the question being scored, through that candidate.

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

**Added in the second pass, 2026-10-04**

16. *Safety.* While the app process is down or restarting, a first visit still receives the entry
    document and its assets, so the client can say what is wrong rather than the player seeing the
    front's error page. Per
    [nobody can start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md), and the
    waits listed in [../problem.md](../problem.md) under "Where a player waits".
17. *Safety.* A deploy moves the client's files and the API through one gate, or the order between
    the two moves is fixed in the deploy script and tested, per the Risk in
    [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) that
    the deploy script and its bugs are ours.

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

**Own to this question**

18. *Safety.* A cookie the API sets keeps its declared lifetime in Safari, per property 1 of
    [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) and
    the server-set cookie entries in [../constraints.md](../constraints.md). It can separate only B2
    from C and F, because B2 needs the hostname proxied, and whether Safari caps a cookie set there is
    the unproven rule
    [how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md) owns.
    The seven-day observation that rule needs is an input here only if B2 would otherwise win.

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

### Second pass, 2026-10-04

**A local spike served the real client build both ways and recorded what came back.** Caddy 2.11.7
(the release binary for macOS arm64) and `@fastify/static` 10.1.5 under Fastify 5 on Node 24.21.0,
on the maintainer's Mac over plain HTTP on loopback, one run each. The client was this repository's
Vite build, given a stub `sw.js`, a `.env` and a Brotli copy of its one asset, then copied to a second
release directory a second later. Caddy served a symlinked directory with `/api/*` proxied to a port
with nothing listening, `/assets/*` immutable with `precompressed br` and `hide .*`, and everything
else `no-cache` through `try_files {path} /index.html`. Fastify served each release directory on its
own port with `cacheControl: false`, `dotfiles: 'ignore'`, `preCompressed: true`, a `setHeaders`
callback giving `/assets/` the immutable header and everything else `no-cache`, and a not-found
handler that 404s `/api/` and `/assets/` and otherwise sends the entry document with a 200. Not
covered: Debian, Node 26, TLS, Caddy in front of Fastify, and any real network.

| Request | C: Caddy | F: Fastify |
| --- | --- | --- |
| `/` and `/puzzle/12` | 200, `no-cache`, ETag, `Vary: Accept-Encoding` | the same, with a weak ETag |
| a hashed asset | 200, `immutable` | 200, `immutable` |
| the same with `Accept-Encoding: br` | `Content-Encoding: br` | `Content-Encoding: br` |
| `/assets/missing.js` | 404 **carrying `immutable`** | 404 with no `Cache-Control` |
| `/sw.js` | 200, `no-cache` | 200, `no-cache` |
| `/.env` | 404 | 200 with the entry document, not the file |
| `/api/x` | 502 from the proxy | 404 from the handler |
| `If-None-Match` with its own ETag | 304 | 304 |
| the first copy's ETag sent to the second copy | 200 | 200 |
| the app process stopped, then `/` | 200, the entry document | connection refused |

*Measured, as above, 2026-10-04.*

**Caddy's `header` directive reaches its own 404s.** A missing asset under `/assets/` came back 404
with `public, max-age=31536000, immutable`. A 404 is cacheable when it carries an explicit lifetime,
so a browser that asked during a deploy race could keep that 404 for a year under the asset's URL.
Applying the header only to successful responses avoids it; that configuration was not run.

*Measured; the consequence is reasoned from RFC 9111.*

**Both validators failed across two byte-identical copies, as the source predicted.** The ETag
changed with the copy's modification time, so a returning client revalidating against the other
copy got a 200 and the whole document. Property 8 fails for both unless the files are given a fixed
modification time at build, or Caddy reads a content-hash ETag from a sidecar file.

*Measured.*

**With the app process stopped, Caddy still served the entry document and Fastify served nothing.**
Behind Caddy, F would answer a first visit with Caddy's 502. So F fails property 16 unless Caddy
serves a copy of the entry document when the app is down, which is Caddy serving files, so C in part.

*Measured for the two servers alone; Caddy's 502 in front of F is reasoned.*

**C can meet property 12 if a deploy switches the files and their rules in one Caddy reload.** If the
deploy writes a small Caddy snippet naming the new release's directory and its header rules, and
reloads Caddy, the files and the rules change together at the reload rather than at a symlink swap
followed by a config change. That makes the files one gate and the API instance a second, ordered
by the deploy script, which is property 17. Not run.

*Reasoned from Caddy's documented graceful reload.*

**B2, Cloudflare Workers static assets, scored.** Opened by me on 2026-10-04: assets default to
`Cache-Control: public, max-age=0, must-revalidate` with an ETag the docs call "a file hash value",
which meets property 8 without configuration; `_headers` "are not applied to responses generated by
your Worker code", including where `run_worker_first` is configured, and whether that reaches paths
outside its array is not stated; and in `wrangler dev` "static assets are always served from your
local disk", with no page claiming it reproduces production's headers, fallback or compression, so
property 11 is unknown at best. Reported by a research agent and not re-opened: nothing documented
keeps the previous release's assets after a deploy, so property 1 needs each build to carry them; a
missing asset is reported to return the entry document with a 200 and the asset's immutable header;
the paid plan that removes the 429 is $5 a month; whether static assets are compressed, and how an
API call's hop from the edge to the Droplet reuses connections, is undocumented.

**Where the grid stands after two passes.** Each cell is holds, fails, depends on configuration
(dep) or unknown.

| Property | C | F | B2 |
| --- | --- | --- | --- |
| 1 entry document and assets agree across a switch | dep: keep prior assets | dep: keep prior assets | dep: re-upload prior assets |
| 2 per-class headers | holds, with the 404 trap | holds | dep, fallback trap reported |
| 3 `/api/` never answered by files | holds | holds | holds |
| 4 only the build output | holds with `hide` | holds with `dotfiles` | unknown |
| 5 a proxy never holds an old entry document | holds | holds | holds |
| 6 one connection, no added hop | holds | holds | API adds an edge hop |
| 7 no request for a hashed asset | holds | holds | holds with `_headers` |
| 8 validators agree across copies | dep: fixed mtime or sidecar | dep: fixed mtime | holds |
| 9 compressed at build | holds | holds | unknown |
| 10 files near the player | only with B1 | only with B1 | holds |
| 11 local run the same | holds | holds | unknown |
| 12 rules ship with the release | dep: snippet and reload | holds | holds, reported |
| 13 least to configure and keep | Caddyfile only | code with traps | a second platform and hostname |
| 14 rebuilt machine serves again | holds | holds | holds |
| 15 cost | holds | holds | $5 a month added |
| 16 entry document while the app is down | holds | fails | holds |
| 17 one gate, or a tested order | dep: two gates | holds | two deploys |
| 18 a Safari cookie keeps its lifetime | not affected | not affected | unknown |

F fails property 16, measured. Nothing else fails outright, so C and B2 remain, and B2 carries five
unknowns. The Safari observation becomes an input only if B2 survives its unknowns.

### Third pass, 2026-10-04

**F is rejected on property 16**, measured in the second pass and accepted by the maintainer on
2026-10-04. It reverses if Caddy is given a copy of the entry document to serve when the app is
down, which is Caddy serving files.

**C's deploy was run as one Caddy reload, and with the previous assets kept it failed nothing.**
Caddy 2.11.7 on the maintainer's Mac imported a snippet naming the live release's directory and its
header rules. A deploy rewrote the snippet to name the next release and ran `caddy reload`. Four
concurrent clients fetched the entry document and then the asset it named, 5 ms later, for five
seconds, with the reload two seconds in. One run per layout:

| Next release holds | Pages | Entry document failures | Asset failures | Old asset after |
| --- | --- | --- | --- | --- |
| its own asset and the previous one | 2,822 | 0 | 0 | 200 |
| only its own asset | 2,788 | 0 | 4 (404) | 404 |

So property 1 holds for C when each release carries the previous release's assets, and fails in
the gap between a page and its assets when it does not. The files and their rules change together
at the reload, so property 12 holds, and the files are one gate, leaving the order against the API
instance to the deploy script, which is property 17.

*Measured, as above. Not covered: Debian, TLS, the real Fastify app behind `/api/`, and more than
one run.*

**Caddy's 404 trap is fixed by matching on the file's presence.** With `@present file` given the
immutable header and `@missing not file` given `no-store`, a missing asset came back 404 with
`no-store` and a present one 200 with `immutable`. Files given one fixed modification time kept the
same ETag across releases: `sw.js` was `"dfczklz6eww0-14"` in both, and revalidating across the
reload returned 304.

*Measured, same run.*

**One fixed modification time for every release is unsafe for the entry document**, corrected on
2026-10-04 after the run above. Caddy's ETag is the modification time and the size. Vite's hashes
have a fixed length, so a new release's `index.html` usually differs from the last only in an asset
name of the same length, and is the same size. With the same modification time it gets the old ETag,
and a returning browser revalidating it receives a 304 and keeps the old entry document, which names
assets that may be gone. The run checked only `sw.js`, which is why it did not show. So property 2
holds for C with the 404 fix, and property 8 holds only with a validator that changes with content:
a content-hash ETag read from a sidecar file, or a modification time set per release, which keeps
two copies of one release in agreement but changes every file's ETag at each deploy. Caddy's default,
fresh modification times on every copy, is safe and leaves property 8 unmet. Which to use is
[what gives the client's files a validator that changes only with their content?](what-gives-the-clients-files-a-validator-that-changes-only-with-their-content.md).

*Reasoned from `calculateEtag` in Caddy v2.11.7, opened in the first pass, and Vite's fixed-length
hashes. Not observed.*

**B2's unknowns, from Cloudflare's source.** Opened by me on 2026-10-04 in `cloudflare/workers-sdk`
main: the asset worker's `handleRequest` ends with
`return attachCustomHeaders(request, response, configuration, env);`, so `_headers` rules apply to
every response it builds, the single-page fallback included; the default ignore list in
`createAssetsIgnoreFunction` is only `/.assetsignore`, `/_redirects` and `/_headers`, so dotfiles in
the build are uploaded and served unless listed; and miniflare's asset worker is
`export { default, AssetWorkerInner, AssetWorkerOuter } from "@cloudflare/workers-shared/asset-worker"`,
so `wrangler dev` runs the production routing and header code. A research agent's reading of the
same repository, not re-opened: the rule matcher uses the requested path, so a missing
`/assets/x.js` gets the entry document with a 200 and the `/assets/*` immutable header; with
`run_worker_first` as an array, a non-API path with no file gets that fallback whatever
`Sec-Fetch-Mode` says; nothing serves a previous version's assets after a full deploy; no
compression happens in the asset worker, and whether the edge compresses its responses is not
documented; edge-to-origin connection reuse is not documented.

So for B2: property 11 holds, except for compression at the edge; property 4 depends on an
`.assetsignore`; property 1 depends on each build carrying the previous assets, as for C; and
property 2 fails as configured, since keeping a missing asset from being cached as HTML for a year
needs `/assets/*` routed through the Worker, which bills every asset request, or no immutable
header, which gives up property 7. Properties 6, 9 and 18 stay unknown.

**The grid after three passes.**

| Property | C | B2 |
| --- | --- | --- |
| 1 entry document and assets agree across a switch | holds, carrying prior assets | dep: re-upload prior assets |
| 2 per-class headers | holds | fails, or trades 7 or 15 |
| 3 `/api/` never answered by files | holds | holds |
| 4 only the build output | holds | dep: `.assetsignore` |
| 5 a proxy never holds an old entry document | holds | holds |
| 6 one connection, no added hop | holds | API adds an edge hop; reuse unknown |
| 7 no request for a hashed asset | holds | holds, unless 2 is fixed by dropping it |
| 8 validators agree across copies | dep: a content-hash validator, deferred | holds |
| 9 compressed at build | holds | unknown |
| 10 files near the player | with a caching proxy in front | holds |
| 11 local run the same | holds | holds, except edge compression |
| 12 rules ship with the release | holds, one reload | holds |
| 13 least to configure and keep | one Caddyfile and a snippet | a second platform, a Worker and a second hostname |
| 14 rebuilt machine serves again | holds | holds |
| 15 cost | holds | $5 a month added |
| 16 entry document while the app is down | holds | holds |
| 17 one gate, or a tested order | two gates, ordered by the deploy script | two deploys on two platforms |
| 18 a Safari cookie keeps its lifetime | not affected | unknown, owned by the domain question |

**Property 10 is the only row B2 holds that C does not, and C reaches it without B2.** A caching
proxy in front of the Droplet, which stays open with the domain question and changes no verdict of
C's, puts C's hashed assets near the player too, since Cloudflare caches `.js` by extension. So
choosing B2 buys nothing that C plus that proxy could not, and it closes the domain question to
"proxied" before the Safari rule in property 18 is observed.

*Reasoned from the grid and from Cloudflare's default cache behaviour, opened in the first pass.*
