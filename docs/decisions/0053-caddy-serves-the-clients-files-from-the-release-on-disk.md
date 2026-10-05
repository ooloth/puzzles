---
number: 0053
status: accepted
date: 2026-10-04
amended: 2026-10-05
---

# 0053 — Caddy serves the client's files from the release on disk

## Forced by

- [ADR-0024](0024-the-entry-document-is-a-build-output-not-a-per-request-render.md): the client is a
  set of files, so something has to serve them.
- [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md): the Droplet serves no files as a
  platform feature.
- [ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md) and
  [ADR-0041](0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md): the files and the
  API answer on one hostname, and every path outside `/api/` is the client's.
- [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md): Caddy is already the front, and its
  property 9 kept serving the files open to it.
- [Nobody can start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md), and "Where a
  player waits" in [../problem.md](../problem.md): the first visit is a wait every player meets.
- "A cached asset is used without a request only while it is fresh" in
  [../constraints.md](../constraints.md): headers decide whether a returning visit costs a round trip
  per asset or runs stale files.

## Scored against

Derived from the moments on the path from the Droplet to the player: a first visit, an installed
app's first launch, a deep link, a returning visit answered by the service worker, the service
worker's update check, any `/api/` request, a deploy, the app process crashing, Caddy restarting, the
machine rebuilt, the local production-like run and years of maintenance. Each candidate was scored
with nothing in front of the Droplet and with a proxy in front. The list is shared with the questions
on the deploy switch, the domain, a page's files across a deploy and the files' validator.

1. At every instant, a deploy included, the entry document being served names only assets also
   being served ([ADR-0024](0024-the-entry-document-is-a-build-output-not-a-per-request-render.md)).
2. Only content-hashed files get a long `max-age`; the entry document and `sw.js` get `no-cache`
   ([../constraints.md](../constraints.md);
   [ADR-0023](0023-a-service-worker-answers-every-navigation-after-the-first.md)'s Risk).
3. No `/api/` path is answered by the files, and no rule for the files reaches an API response
   ([ADR-0041](0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md); property 3 of
   [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md)).
4. Only the build's output is reachable (the portable security standard).
5. With a proxy in front, a new entry document is not held back by its cache
   ([ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md)'s Risk).
6. A first visit's document, assets and first API call share one connection (property 3 of
   [ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md);
   [../constraints.md](../constraints.md)).
7. A returning visit sends no request for an unchanged hashed asset
   ([../constraints.md](../constraints.md)).
8. An unchanged entry document revalidates to a 304 across instances and deploys
   ([../problem.md](../problem.md)'s weak link).
9. Assets are compressed when the client is built
   ([ADR-0024](0024-the-entry-document-is-a-build-output-not-a-per-request-render.md)'s Risk;
   [../constraints.md](../constraints.md)).
10. On a first visit, files come from near the player
    ([ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md)).
11. The local production-like run serves the files the same way
    ([ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md);
    property 12 of [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md)).
12. The cache rules ship with the release, so a release never runs under another's rules (property 6
    of [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md)).
13. The least to configure and understand over years (property 6 of
    [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md); property 13 of
    [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md)).
14. A rebuilt machine serves the files with no manual step
    ([ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)).
15. Hosting stays near $10 a month and under $20
    ([ADR-0045](0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md)).
16. While the app process is down, a first visit still receives the entry document
    ([nobody can start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md)).
17. A deploy moves the files and the API through one gate, or two in a tested order
    ([ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md)'s Risk).
18. A cookie the API sets keeps its declared lifetime in Safari (property 1 of
    [ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md);
    [../constraints.md](../constraints.md)).

**Resources.** Network binds, as round trips in 6 to 8 and 10 and as first-visit bytes in 9. CPU and
memory do not: static bytes at this audience sit far below the capacity in
[../constraints.md](../constraints.md), and Caddy used 47 to 51 MB per
[ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md). Storage does not: a release's client is
a few MB, and carrying the previous release's assets doubles a small number.

## Decision

**Caddy serves the client's files from the release's directory on the Droplet, and sends only
`/api/` to the app.**

It holds every property except 8, 9, 10, 12 and 17. Caddy can meet each of them, and how is left to
the question that owns it:

- **Property 8** needs a validator that changes with content. Caddy's default, built from each
  copy's modification time and size, is safe and costs a full response where a 304 would do. One
  fixed modification time for every release is not safe: a new `index.html` differing only in a
  same-length asset name would get the old ETag and a false 304, which is reasoned from Caddy's
  ETag code and not observed. Which validator to use is
  [what gives the client's files a validator that changes only with their content?](../questions/what-gives-the-clients-files-a-validator-that-changes-only-with-their-content.md),
  which waits until after players arrive.
- **Property 9** needs the build to write compressed copies, which Caddy's `precompressed` serves.
  Which encodings, and what writes them, is
  [which encodings are the client's files precompressed in, and what writes them?](../questions/which-encodings-are-the-clients-files-precompressed-in-and-what-writes-them.md).
- **Property 10** is met by a caching proxy in front of the Droplet, which changes no verdict here
  and stays with
  [how does the domain reach the deployment?](../questions/how-does-the-domain-reach-the-deployment.md).
- **Properties 12 and 17** hold if a deploy writes a Caddy snippet naming the new release's
  directory and its header rules and reloads Caddy once, which was measured switching the files with
  no failure, below. Then the rules ship with the release and the files switch through one gate.
  Whether the deploy works that way, and the order between that gate and the app instance's switch,
  is [how does a deploy switch between versions?](../questions/how-does-a-deploy-switch-between-versions.md).

**What the configuration has to say, and the property each part answers:**

- `/assets/*` files that exist get `public, max-age=31536000, immutable`, and a missing one gets
  `no-store`, for properties 2 and 7. `/assets/` is where Vite writes the hashed files. Without the
  match on the file's presence, Caddy's `header` directive put `immutable` on its own 404, which was
  measured.
- Every other path gets `no-cache`, for property 2, and an unknown one falls back to the entry
  document, per [ADR-0041](0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md).
  `/assets/*` is left out of the fallback so a missing asset is a 404 rather than HTML, which was
  observed working, not observed failing.
- `hide .*`, for property 4. A research agent read Caddy's documentation as hiding only its own
  configuration files by default; that was not re-opened or measured.
- `precompressed`, for property 9.

**Each release carries at least the previous release's assets.** A local run switching releases in
one reload under load failed 4 asset requests of 2,788 pages when the next release held only its own
asset, and none of 2,822 when it also held the previous one. How many releases back is
[can a page loaded before a deploy still fetch its files after it?](../questions/can-a-page-loaded-before-a-deploy-still-fetch-its-files-after-it.md)
at M9.

**The evidence.** Two local spikes on 2026-10-04 on the maintainer's Mac, with Caddy 2.11.7, this
repository's Vite build and plain HTTP on loopback, one run each. The method and tables are in the
question this record answers, read with
`git show 6debaf8:docs/questions/what-serves-the-clients-files-in-production.md`. Not covered: Debian, TLS, the real app behind `/api/` and a real
network.

## Enforced by

**Nothing yet.** It is true once M1 slice 4's Caddy configuration and release layout exist. A check
in the production-like run that requests `/`, a deep link, a present and a missing asset, `/sw.js`,
`/.env` and an `/api/` path, and fails on any header or status other than the ones above, would
enforce it, and does not exist.

## Rejected

- **The Fastify process serving the files, with `@fastify/static`.** Its case is real: the cache
  rules are code inside the release, so property 12 holds by construction, and the files and the API
  switch through one gate. It fails property 16: with the app process stopped, Caddy still served
  the entry document and Fastify served nothing, measured on 2026-10-04, so a first visit would get
  the front's 502. **Reverses if** Caddy is given a copy of the entry document to serve when the app
  is down, which is Caddy serving files.
- **An edge platform hosting the files, with `/api/` routed from the edge to the Droplet**, scored
  from Cloudflare Workers static assets' documentation and source. Its case: files near every
  player, a content-hash ETag by default, and a local run that executes the production asset worker.
  It fails property 18: it needs the hostname proxied, so choosing it settles the domain question's
  topology now, while whether Safari caps a cookie on a proxied hostname is unobserved. A caching
  proxy in front of Caddy faces the same unknown, but choosing Caddy does not choose that proxy: it
  leaves it to the domain question, which owns the observation, and property 10, the only row the
  edge platform holds that Caddy does not, is then the proxy's to deliver. **Reverses if** Safari is observed not to cap a cookie on a proxied hostname and
  first-visit distance binds beyond what a caching proxy delivers.
- **Not yet.** M1 slice 4 deploys the client, so something has to serve it.

A second static server beside Caddy, Node serving files without a plugin, DigitalOcean Spaces,
GitHub Pages and Netlify or Vercel with a rewrite were set aside by the enumeration in the question,
each for a reason recorded there and read with
`git show 6debaf8:docs/questions/what-serves-the-clients-files-in-production.md`.

## Risk

- **The cache rules live in Caddy's configuration, apart from the app's code.** A release that adds
  a class of file is served under whatever that configuration says, and a mistake in it is silent:
  the 404 that carried `immutable` produced no error. The check under **Enforced by** is what would
  catch it.
- **First visits come from North America until something sits in front.** That is property 10,
  owned by the domain question.
- **Full responses where a 304 would do**, until the validator question is answered.
- **Caddy restarts on every upgrade**, per [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md),
  and the files are unavailable for that moment along with the API.

## Revisit when

- The front moves to something that cannot serve files, which reverses
  [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md)'s property 9.
- First-visit latency from distant players is measured to bind beyond what a caching proxy delivers.
- Safari is observed not to cap a cookie on a proxied hostname.
- The entry document stops being a build output, which reverses
  [ADR-0024](0024-the-entry-document-is-a-build-output-not-a-per-request-render.md).

## Also update

- [x] questions/README.md: slice 4 loses its **Must answer** on what serves the files and gains this
      record as a **Given**
- [x] questions/what-serves-the-clients-files-in-production.md: worked file committed in `6debaf8`,
      then mined and deleted in this change; the property list's four remaining copies drop it from
      their member list, and its proxy findings moved to
      [how does the domain reach the deployment?](../questions/how-does-the-domain-reach-the-deployment.md)
- [x] questions/how-does-a-deploy-switch-between-versions.md: the files switch in one reload, and the
      order against the app instance is that question's
- [x] questions/can-a-page-loaded-before-a-deploy-still-fetch-its-files-after-it.md: slice 4 carries
      at least the previous release's assets
- [x] questions/what-gives-the-clients-files-a-validator-that-changes-only-with-their-content.md:
      opened, and deferred until after players arrive
- [x] questions/which-encodings-are-the-clients-files-precompressed-in-and-what-writes-them.md:
      opened, and deferred
- [x] [ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md),
      [ADR-0041](0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md) and
      [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md): link this record instead of the
      question, and `../CONTRIBUTING.md` and the local-run question do the same
- [x] constraints.md: Caddy's ETag and its header on 404s, `@fastify/static`'s dotfiles default, and
      Cloudflare's `_headers` on the fallback
- [x] architecture.md: nothing yet; no code serves files until slice 4
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
- [x] ../CONTRIBUTING.md: nothing yet; the production-like run serving the client through Caddy
      arrives with slice 4
