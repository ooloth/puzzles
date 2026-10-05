---
opened: 2026-10-02
status: open
resolves_into: decision
---

# How does a deploy switch between versions?

## Why it matters

The app runs as systemd services on one Droplet, per
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). A deploy has
to move traffic from the running version to the new one. Done carelessly, it fails requests already
in flight, which property 1 of that record forbids. [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) names this as the record that follows the
choice of front, since the front is what moves traffic between instances.

**Environments:** production, and the production-like local run on the maintainer's Mac that
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
requires, where the same switch is rehearsed before it touches the Droplet.

**What it does not cover.** What the store needs during a deploy, from M3, is
[how does a deploy avoid disturbing the store?](how-does-a-deploy-avoid-disturbing-the-store.md). What
triggers a deploy and where a release is built is
[what deploys the code?](what-deploys-the-code.md). Noticing and undoing a bad deploy is
[how is a bad deploy noticed and undone?](how-is-a-bad-deploy-noticed-and-undone.md) at M11.

## What would settle it

The front is Caddy, per
[ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md), and its health checks can
carry out the switch, as they did in the spikes. Then a deploy with the real
Fastify server, observed on a Droplet under load, since the spikes ran a minimal server. How many
records the answer resolves into is decided once it is worked.

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

**Own to this question.** None derived yet. They are added when this question is worked.


## Resolves into

One or more decision records in [../decisions/](../decisions/). How many is decided after the
research, by the separability test in [../decisions/README.md](../decisions/README.md).

## Source

Split out on 2026-10-02 from the hosting question, deleted that day and
read with `git show ed7f54e:docs/questions/where-does-this-run.md`. Its open entry asked whether the
switch needs a record or is an implementation detail. [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) already lists it as a record that
follows the front's, and the maintainer agreed on 2026-10-02 that it gets its own question.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**An order that drains the old instance before stopping it failed no request.** Two instances of the
app ran on two ports behind Caddy, which checked `/api/up` on each. A deploy:

1. started the new instance on the idle port;
2. waited for its `/api/up` to answer;
3. signalled the old instance, whose `/api/up` then returned 503, and waited a second while Caddy
   stopped routing to it;
4. stopped the old instance, which finished what it was serving.

Caddy 2.11.4 ran with `lb_policy first`, `health_uri /api/up`, `health_interval 250ms`,
`health_fails 1`, `lb_try_duration 5s` and upstream keep-alive off. In a Linux arm64 container with
20 clients for 40 seconds through five deploys, three runs each failed 0 of about 221,000 requests,
and none took longer than 49ms. On a real `s-1vcpu-1gb` Droplet in `tor1` running Ubuntu 24.04, one
run of five deploys failed 0 of 20,254, the slowest took 219ms, and each deploy took 2.7 to 2.9
seconds.

*Measured, 2026-09-30, in the eleventh and twelfth passes of the hosting question, read with
`git show ed7f54e:docs/questions/where-does-this-run.md`, which holds the scripts. Not measured: TLS,
the real Fastify server, amd64 in the container runs, and a deploy driven from a laptop over the
internet.*

**Stopping the old instance without draining it failed POSTs.** A first version of the same script
failed 39 POSTs with 502 in one run. Requests queued on the old instance's socket were cut after Caddy
had sent them, and Caddy does not retry a POST.

*Measured, 2026-09-30, same source.*

**How long a request is held matters more than whether one fails.** The guarantee that
[the player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md)
forbids asking the player to act, not a request failing, and the client already retries silently
through worse on a train. So a request that fails fast is retried within a second and unseen, while
one held for seconds is a wait at the start of a session. Fly's deploys held some requests about 15
seconds; Kamal's held none longer than 82ms.

*Reasoned from the guarantee, in the ninth pass of the hosting question. The 82ms figure is the
eighth pass's measurement; the 15-second one is reported there as observed in an earlier pass, and
was not re-checked.*

**The app's part is small.** The instance returns 503 from `/api/up` once signalled, which the spike
did in about three lines. A real draining contract for the Fastify server has not been written or
measured.

*Reasoned, from the spike's server. The product's server has no `/api/up` yet.*

**Other tools that switch versions were surveyed and set aside** on 2026-09-30, per an agent's reading
of each project: PM2's reload waits for a process to listen or report ready, not for a health check,
and adds a second supervisor beside systemd; Podman with Quadlet restarts the unit on update, so old
and new never overlap; Kamal and its relatives keep Docker on the server, which [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) rules out.

*Sourced by a research agent on 2026-09-30, in the eleventh pass. Not re-opened.*

**[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)'s Risk applies to whatever script does the switch**: it enables the new instance at boot
and disables the old, or a reboot starts the wrong one. Tests for that script are written with it,
when slice 4 is built.

*From [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md).*

**The front is Caddy, whose free edition has active health checks.** The settings the spikes used
are above. Had the front been nginx or Angie, whose free editions have none, the deploy script would
have rewritten a file naming the live instance and reloaded. A reboot of the Droplet, which takes
about 18 seconds on Debian 13, is not a deploy and is not switched; it happens at the hour
[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) sets for updates. That record also forbids restarting the app's unit
for a replaced library, since the restart would bypass this switch.

*From [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) and
[ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md); the working is read with
`git show 0b31753:docs/questions/what-sits-in-front-of-the-app-and-terminates-tls.md`.*


**If Caddy serves the client's files, a deploy has two things to switch, and the files can switch in
one Caddy reload.** Caddy 2.11.7 on the maintainer's Mac imported a snippet naming the live
release's directory and its header rules. A deploy rewrote the snippet to name the next release and
ran `caddy reload`. Four clients fetched the entry document and then the asset it named, 5 ms later,
for five seconds, with the reload two seconds in. With the next release also holding the previous
release's asset, 2,822 pages failed nothing. With only its own asset, 4 asset requests of 2,788 pages
got 404 in the gap between a page and its asset. So the files are one gate and the app instance is
another, and the order between them is this question's: a new entry document served before the new
API is healthy reaches the old API, and the reverse reaches a new API from an old client, which
[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) already
requires the API to tolerate.

*Measured, 2026-10-04, one run per layout, recorded in
[what serves the client's files in production?](what-serves-the-clients-files-in-production.md).
Not covered: Debian, TLS and the real app behind `/api/`. The order between the two gates is
reasoned.*
