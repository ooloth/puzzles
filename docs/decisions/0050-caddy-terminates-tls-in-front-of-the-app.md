---
number: 0050
status: accepted
date: 2026-10-03
---

# 0050 — Caddy terminates TLS in front of the app

## Forced by

- [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md) and
  [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md): nothing on a bare
  Droplet answers HTTPS or chooses which instance of the app gets a request, so something on the
  machine has to.
- [ADR-0049](0049-the-droplet-runs-debian-13.md): it runs on Debian 13, and was measured there.
- [ADR-0023](0023-a-service-worker-answers-every-navigation-after-the-first.md): a service worker runs
  only in a secure context, so production is served over HTTPS.
- [ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md) and
  [ADR-0041](0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md): one hostname,
  with every path under `/api/` reaching the server.
- "Hosting — Let's Encrypt certificates are getting shorter" in [../constraints.md](../constraints.md):
  renewal runs about eight times a year per certificate from 2028.
- [Nobody can start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md) if the front
  stops or its certificate lapses.

## Scored against

Derived from the moments the system touches the front: a browser's first HTTPS connection; a
returning player's request after a dropped connection; a request under `/api/` and one for anything
else; an API response that sets a cookie; a deploy; an instance crashing; a certificate issued and
renewed; the front itself patched or reconfigured; the machine rebuilt from nothing; and the same
setup on the Mac.

1. Browsers reach the app over HTTPS with a certificate they trust, issued and renewed with no
   recurring manual step ([ADR-0023](0023-a-service-worker-answers-every-navigation-after-the-first.md); the failure mode above).
2. Every path under `/api/` reaches the server and every other path reaches the client's files, on
   one hostname ([ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md), [ADR-0041](0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md)).
3. Nothing caches an API response or strips `Set-Cookie` unless configured to ([ADR-0041](0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md);
   [../constraints.md](../constraints.md) on server-set cookies and Safari).
4. A deploy fails no request (property 1 of [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md);
   [the player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md)).
5. Patching or reconfiguring the front fails no request in flight (the same, and property 3 of
   [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md)).
6. A connection is set up in the fewest round trips the browser supports, and a dropped one resumes
   cheaply ([../problem.md](../problem.md): phone-first, "dead zones, cell-tower handoff").
7. A rebuilt machine serves HTTPS again with no manual step, within the authority's limits
   ([ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)).
8. It leaves most of the 1 GB machine to the app ([../constraints.md](../constraints.md), no swap).
9. It can serve the client's files with a cache header per class of file and answers to conditional
   requests, keeping that option open at
   [what serves the client's files in production?](../questions/what-serves-the-clients-files-in-production.md).
10. Nothing it runs is reachable from the internet except HTTP and HTTPS, and nothing it writes
    fills the disk unbounded (property 4 of [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md)).
11. It is installed and patched from a maintained package on the chosen OS (property 3 of [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md)).
12. The same configuration runs on the maintainer's Mac, with only the hostname and certificate
    differing ([ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)).
13. The least for the maintainer to configure, understand and keep working, across years (property 6
    of [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md)).
14. Hosting stays near $10 a month and under $20
    ([ADR-0045](0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md)).

**Resources.** Memory binds as property 8 and does not separate the candidates: Caddy used 47 to 51
MB on a Droplet with about 780 MB available. Network binds as round trips, property 6. CPU does not
bind: with the load generator sharing the one vCPU, Caddy completed about 180 requests a second and
nginx about 360, against a modelled morning peak of 46 in [../constraints.md](../constraints.md).
Storage does not bind beyond property 10.

**Maximums.** Maximum safety is a certificate that never lapses and a front that never drops a
request. Maximum performance is the fewest round trips and none of the machine. Maximum experience is
a front with nothing to configure and nothing to debug. Caddy comes closest to the first and third;
what it gives up is a restart on each package upgrade, and that cost can be moved into an outage that
already exists.

## Decision

**Caddy, installed from its own Debian repository, terminates TLS for the app's hostname and sends
every path under `/api/` to the app.**

The maintainer chose it on 2026-10-03, reading every property in context over years of maintaining
it alone. What decided it:

- **Certificates, the riskiest thing a front does here, are what it does best.** It has issued and
  renewed certificates itself since 2020. If Let's Encrypt fails, "it will try with ZeroSSL; if both
  fail, it will backoff and retry", up to a day between attempts for 30 days. As lifetimes shrink to
  45 days, that matters about eight times a year.
- **The least to configure and keep working.** The whole setup validated in 27 lines. Certificates,
  the redirect from HTTP and HTTP/3 take none of them.
- **Its own health checks can switch between two instances**, as the spikes did with no failed
  request across five deploys on a Droplet.
- **It issues a locally trusted certificate itself** for the production-like run on the Mac.

Measured on Debian 13 on 2026-10-03: a trusted certificate 4 seconds after configuring, the same
certificate served after its state was restored onto a rebuilt machine with no new order, and about
a second of refused connections each time its package was upgraded under load.

The working is in the question this record resolved, read with
`git show 0b31753:docs/questions/what-sits-in-front-of-the-app-and-terminates-tls.md`.

**Its known weakness.** Caddy's package restarts it on every upgrade, which refused connections for
about a second in each of three runs, where nginx upgrades in place. How much that costs depends on
when updates are applied, which is [when are updates applied to the machine?](../questions/when-are-updates-applied-to-the-machine.md), in M1 slice 4. Applied as released, it is about a
second of refused connections per release, roughly monthly in 2026, which the client retries unseen.
Applied on a schedule beside the reboot, or with each deploy, the restart falls inside an outage or a
switch that happens anyway and costs nothing. The maintainer chose on 2026-10-03 to record both as
mitigations of a known weakness against nginx. Until that question is answered, Caddy's repository is
outside Debian's automatic updates, so Caddy is upgraded only by hand.

**What this does not settle:**

- **How a deploy switches between versions**, including whether Caddy's health checks are what
  switch it. That is [how does a deploy switch between versions?](../questions/how-does-a-deploy-switch-between-versions.md).
- **Who serves the client's files.** Caddy can, which keeps that option open at
  [what serves the client's files in production?](../questions/what-serves-the-clients-files-in-production.md).
- **What the domain resolves to**, and whether anything sits in front of the Droplet, which is
  [how does the domain reach the deployment?](../questions/how-does-the-domain-reach-the-deployment.md)
  at slice 5. Until then slice 4 is observed over HTTP on the Droplet's address.
- **Noticing a failed renewal.** Caddy raises no alert of its own;
  [how do we know the deployed app is serving?](../questions/how-do-we-know-the-deployed-app-is-serving.md)
  at M11 owns that.

## Enforced by

**Nothing yet.** It is true once M1 slice 4's setup installs Caddy. Three things must be in its setup
when it is written, because the defaults are wrong here:

- `0rtt off`, since Caddy accepts early data over HTTP/3 by default and a POST that saves progress
  must not be replayable;
- certificate state under `/var/lib/caddy` restored with the machine, so a rebuild does not order a
  new certificate;
- whatever [when are updates applied to the machine?](../questions/when-are-updates-applied-to-the-machine.md) settles for when Caddy is upgraded.

## Rejected

- **nginx with certbot.** Its case is strong: both are long established, nginx upgrades its binary in
  place, uses a few megabytes and about half Caddy's CPU per request, and has by far the most help,
  with 54,455 Stack Overflow questions against Caddy's 367. No single property disqualifies it. It
  is behind on property 13, the one the maintainer weighs most: two programs joined by a deploy hook,
  set up in a particular order, with a longer configuration, a deploy switch written into the deploy
  script because the free edition has no active health checks, no local certificate, and, in Debian
  13's certbot 4.0.0, no second authority and no renewal information. The maintainer chose against
  it on that on 2026-10-03. **Reverses if** Caddy's automatic behaviour causes an outage the
  maintainer has to debug, or if the audience grows to where CPU per request binds, about four times
  the modelled peak.
- **nginx with its own ACME module.** It fails property 1: the module first released on 2025-08-12,
  is at 0.4.1, documents no retry or fallback, and has an open "Segfault after module setup and nginx
  reload" (issue #140) in a design that reloads on every deploy. **Reverses when** the module reaches
  1.0 with that fixed and a documented retry.
- **Angie.** It fails property 13: no Stack Exchange tag, no new forum topics since June 2026, a team
  of about ten, and no renewal information. **Reverses if** its community and ACME support grow to
  nginx's.
- **HAProxy, Traefik and Envoy.** They fail property 9: none serves static files, so choosing one
  closes the front's option for the client's files. **Reverses if** the Node server is chosen to serve
  them.
- **Apache httpd, and Node terminating TLS itself.** They fail property 6: neither has stable HTTP/3.
  **Reverses when** either ships it.
- **freenginx, H2O, River, NGINX Unit and Varnish.** They fail property 11: no Linux packages, no
  release in years, or archived. **Reverses** if one returns to maintained packages.
- **Not yet.** Rejected because M1 slice 4 cannot deploy two instances without something choosing
  between them, and TLS is needed at slice 5.

Fronts off the machine, such as Cloudflare's proxy or tunnel and DigitalOcean's load balancer, were
not scored here; whether anything sits in front of the Droplet is the domain question's at slice 5.

## Risk

- **A restart on every Caddy upgrade**, as above, and no automatic patching of Caddy at all until [when are updates applied to the machine?](../questions/when-are-updates-applied-to-the-machine.md) is answered.
- **Behaviour that is not on the page.** Caddy does a lot that its configuration does not say:
  certificates, the redirect, HTTP/3, directive order, and defaults that change between versions, as
  2.11.6 did with a header limit and idle timeouts in a patch release. `caddy adapt --pretty` prints
  everything it will actually do, and that is the first step when it surprises.
- **A smaller community than nginx's** when something needs looking up.
- **About twice nginx's CPU per request.** It does not bind at the modelled peak, and it is the first
  thing to measure if the audience grows.
- **Stewardship.** Caddy is "a project of ZeroSSL, an HID Global company". Moving to nginx later is a
  rewrite of one short configuration plus the deploy switch, which under
  [ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md) keeps
  this cost small.

## Revisit when

- Caddy's automatic behaviour causes an outage, or an upgrade changes a default that breaks the app.
- A Caddy restart on upgrade is noticed by a player.
- Traffic reaches about four times the modelled morning peak, where CPU per request starts to matter.
- nginx's ACME module reaches 1.0 with renewal retries documented and its reload crash fixed, making
  nginx a single program for this setup too.

## Also update

- [x] questions/README.md: M1 slice 4 loses its **Must answer** on the front and gains this record
      as a **Given**
- [x] questions/what-sits-in-front-of-the-app-and-terminates-tls.md: mined and deleted in this change
- [x] questions/how-does-a-deploy-switch-between-versions.md: the front is Caddy, whose health checks
      can switch; nginx's or Angie's would have needed a rewrite and reload
- [x] questions/what-serves-the-clients-files-in-production.md: the front is Caddy, which can serve
      the files with per-path headers
- [x] questions/how-do-we-know-the-deployed-app-is-serving.md: Caddy raises no alert on a failed
      renewal
- [x] questions/when-are-updates-applied-to-the-machine.md: its links to this record's question are
      repointed to git history
- [x] architecture.md: Caddy in front of the app on the Droplet
- [x] constraints.md: Let's Encrypt's shrinking certificate lifetimes, added first so this record can
      cite it
- [x] ../CONTRIBUTING.md: nothing yet; Caddy is installed by slice 4's setup
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
