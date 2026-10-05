---
opened: 2026-10-03
status: open
resolves_into: decision
---

# Can a page loaded before a deploy still fetch its files after it?

## Why it matters

Vite gives every built asset a content-hashed filename, per
[ADR-0029](../decisions/0029-the-client-bundler-is-vite.md), and the entry document names the
assets of the release that built it. A deploy replaces the release. A page holding the old entry
document that asks for one of its assets after the switch asks for a filename the new release does
not have. If the answer is a 404, or the entry document served in its place, the script never runs.

That is the failure
[the app never opens to a blank screen after the first visit](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md)
rules out, and it would be silent: no server error, and a player who sees it simply leaves.

**How often it happens depends on when the page asks.** Today the client loads its assets right
after the entry document, so the window is the few milliseconds between them, overlapping a switch
that took about three seconds in the spikes. It widens in three ways:

- a chunk loaded later in a session, by a dynamic import, is asked for minutes after the entry
  document;
- the service worker [ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md)
  settles answers navigations from a document stored on the device, which can be from any earlier
  release;
- that service worker fetches its precache while it installs, which can straddle a deploy.

**Environments:** production, and the production-like local run per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
where a deploy is rehearsed and this failure can be produced on purpose.

**What it does not cover.** Whether an old client can still talk to a new API is a contract
question, not a file question. Which program serves the files is settled by
[ADR-0053](../decisions/0053-caddy-serves-the-clients-files-from-the-release-on-disk.md), and
how the deploy moves traffic is
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md). Both
decide whether the previous release's files are still reachable after a switch, which is why this
question sits beside them.

## What would settle it

Knowing what a deploy does to the previous release's directory; Caddy serves the files from the
release on disk, per
[ADR-0053](../decisions/0053-caddy-serves-the-clients-files-from-the-release-on-disk.md). Then a deploy in the local run with a page loaded from the old release, asking for an old
asset after the switch, observing what comes back.

## Properties the answer is scored against

Derived on 2026-10-04 for the questions on the path from the Droplet to the player. The question
of what serves the client's files was settled from it by [ADR-0053](../decisions/0053-caddy-serves-the-clients-files-from-the-release-on-disk.md), and five remain:
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md),
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md),
[can a page loaded before a deploy still fetch its files after it?](can-a-page-loaded-before-a-deploy-still-fetch-its-files-after-it.md),
[what gives the client's files a validator that changes only with their content?](what-gives-the-clients-files-a-validator-that-changes-only-with-their-content.md)
and
[which encodings are the client's files precompressed in, and what writes them?](which-encodings-are-the-clients-files-precompressed-in-and-what-writes-them.md).
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

**Own to this question.** None derived yet. They are added when this question is worked.


## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised on 2026-10-03 while ordering M1 slice 4's questions. Neither the file-serving question nor
the switch question said what happens to the previous release's assets, and the maintainer agreed it
gets its own question.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The window is real at M1 even with no service worker, and one previous release closes it.** In a
local spike on 2026-10-04, Caddy switched releases in one reload while four clients fetched the
entry document and then its asset 5 ms later. A release holding only its own asset failed 4 asset
requests of 2,788 pages with 404; one also holding the previous release's asset failed none of 2,822.
So M1 slice 4 carries at least the previous release's assets, per
[ADR-0053](../decisions/0053-caddy-serves-the-clients-files-from-the-release-on-disk.md).
How many releases back is still this question's, and it widens at M9 when the service worker serves
an entry document from any earlier release.

*Measured, one run per layout, on the maintainer's Mac. Not covered: Debian, TLS and a real
network.*
