---
opened: 2026-09-02
status: open
resolves_into: decision
---

# How does the domain reach the deployment?

## Why it matters

**This is the one piece of deployment plumbing that can foreclose something, and it does it
silently.** [../constraints.md](../constraints.md) records that Safari withdraws the first-party
exemption for a server-set cookie in two cases: the setting server sits behind a CNAME resolving to a
third-party host, or its A/AAAA record resolves to an IP address whose first half does not match the
first half of the IP serving the site. A server-set cookie is the only mechanism recorded there that
carries an identifier across Safari's storage wipe without the player being asked to do anything,
which makes it the whole basis of the recovery mechanism
[is guest recovery worth building?](is-guest-recovery-worth-building.md) turns on.

A reverse proxy in front of the origin is exactly the topology that rule describes. So how the domain
resolves is not cosmetic: it can cap the cookie at seven days, and the failure produces no error and
no log line — the cookie simply expires alongside the storage it was meant to outlive.

The system serves both halves from one origin, per [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md). This question
still bites: one origin does not rescue a cookie that fails the resolution test. Safari records what
it compares against only from a network response to a top-level navigation, and a service worker
answers most navigations, so a hostname that is a CNAME to a provider's domain may cap even a
same-origin API's cookie, per [../constraints.md](../constraints.md). An apex domain on A records has
no CNAME. The host is a DigitalOcean Droplet per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md), which was scored
on letting one hostname resolve to the host's own address. Whether the domain does is still this
question, and the CNAME case is worth observing on a real Safari before it decides anything.

The rest of it is ordinary and still has to be decided: whether the app answers on the apex or a
subdomain, and where the certificate comes from.

## What would settle it

Establishing what Safari actually does with a proxied domain, rather than reasoning from a rule
Apple has not published. The rule as recorded is described by third parties, so the first task is to
find out whether it is real and how it is evaluated. A same-origin deployment behind one proxy is the
case that matters: the cookie-setting server and the site-serving server are then the same host at
the same address, which may satisfy both tests trivially, or may not survive the CNAME clause
depending on what the browser resolves.

This is testable. A deployed skeleton with a server-set cookie, opened on a real iOS device and left
for the window to elapse, answers it directly — and
[../constraints.md](../constraints.md) already records that this class of behaviour does not
reproduce in a desktop browser.

## Properties the answer is scored against

Derived on 2026-10-04 for four questions on the path from the Droplet to the player:
[what serves the client's files in production?](what-serves-the-clients-files-in-production.md),
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md),
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md) and
[can a page loaded before a deploy still fetch its files after it?](can-a-page-loaded-before-a-deploy-still-fetch-its-files-after-it.md).
**This list is copied into each of the four, and a change to it is made in all four in the same
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

Raised 2026-09-02, on finding that no question covered how a browser reaches the deployment at all,
and that a Cloudflare-registered domain puts a candidate proxy directly into the path of the one
mechanism [../constraints.md](../constraints.md) identifies as free recovery.

## Options

*Proxied.* The domain resolves to the proxy's anycast addresses and the proxy forwards to the origin.
Brings TLS, caching and a shield in front of the origin's real address without configuring any of it.
Puts a third party in the path of every request, and is the topology the Safari rule above is
written about.

*DNS-only.* The domain resolves straight to the origin's own address. Nothing sits between the
browser and the server, so the resolution test is whatever the host's own addressing makes it. The
origin then owns TLS — issuance, renewal and the failure when renewal does not happen.

*The Droplet's own IP address, with no domain.* The honest "not yet". It is enough to see M1
running, since a Droplet has a public address and no hostname of its own, per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md). It defers the question
rather than answering it, past the point where a cookie would be set.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The domain is registered with Cloudflare and nothing else is settled by that.** A registrar is not
a host and not a proxy. The host is a DigitalOcean Droplet per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md), and using
Cloudflare's registrar creates no obligation to use their proxy.

*Sourced — stated by the maintainer, 2026-09-02.*

**The rule this question turns on is the weakest-sourced entry in
[../constraints.md](../constraints.md).** That file records the IP-matching clause as described by
third parties rather than by Apple, and notes the behaviour was widely reported in 2023 and is absent
from Apple's release notes. It should not decide a topology until somebody establishes it.

*Sourced — per [../constraints.md](../constraints.md), which carries the caveat itself.*

**A same-origin deployment passes both comparisons when Safari has recorded the host, and may fail
the CNAME one when it has not.** A same-hostname request is compared with the CNAME or address Safari
recorded from the host's own top-level navigation, so it matches itself. With nothing recorded, the
address comparison lets the cookie through and the CNAME comparison caps it.

*Reasoned from source — WebKit trunk read 2026-09-26, per [../constraints.md](../constraints.md). Not
observed in a shipped Safari.*

**Certificate ownership follows from the topology rather than being a separate choice.** A proxy
terminates TLS with its own certificate; a DNS-only arrangement leaves issuance and renewal with the
origin, which on a bare Droplet per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) is work we run
ourselves. That connects this to
[how is the server operated?](how-is-the-server-operated.md), where an expired certificate is an
outage nobody is watching for.
