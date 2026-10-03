---
opened: 2026-10-02
status: open
resolves_into: decision
---

# What sits in front of the app and terminates TLS?

## Why it matters

The server runs on a DigitalOcean Droplet, per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md), as systemd services, per
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). Nothing on a
bare Droplet answers HTTPS or chooses which instance of the app gets a request. So something we run
on the machine has to: terminate TLS, send each request to the app or to the client's files, and
switch between two instances of the app during a deploy. [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) names this as the next record, and
the record on how a deploy switches between versions follows it.

**Every request a player makes passes through it.** If it stops, or its certificate lapses,
[nobody can start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md), however
healthy the app behind it is.

**Environments:** production, and the production-like local run on the maintainer's Mac that
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
requires. That run does not exist yet; building it is M2's.

**It is answered together with the OS.** A front is only a candidate if the OS packages it, and an OS
is scored partly on whether it packages the front, so this is scored side by side with
[which OS does the Droplet run?](which-os-does-the-droplet-run.md).

**It does not settle who serves the client's files.** That is
[what serves the client's files in production?](what-serves-the-clients-files-in-production.md), where
the front serving them from disk is one option. Property 9 below keeps that option reachable.

## What would settle it

Scoring each candidate against the properties below, from its documentation. TLS and certificate
issuance were never measured in the spikes, so they are observed on a Droplet before the record is
written. The spikes did measure Caddy switching between two instances; that evidence is in the
eleventh and twelfth passes of the hosting question, read with
`git show ed7f54e:docs/questions/where-does-this-run.md`, and in
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md).

## Properties the answer is scored against

Derived on 2026-10-02 from the moments the system touches the front: a browser's first HTTPS
connection to the app's hostname; a returning player's request after the connection was dropped, on
a link that changes cell tower mid-session; a request under `/api/` and a request for anything else;
an API response that sets a cookie; a deploy, when the old instance stops and the new one starts; an
instance crashing; a certificate being issued on a new machine and renewed on a running one; the
front itself being patched or reconfigured; the machine being rebuilt from nothing; and the same
setup run on the Mac.

1. **Browsers reach the app over HTTPS with a certificate they trust, issued and renewed with no
   recurring manual step.** Rests on
   [ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md): a
   service worker runs only in a secure context, which MDN states as "their document is served over
   HTTPS, although browsers also treat `http://localhost` as a secure context". A lapsed certificate
   means [nobody can start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md).
2. **Every path under `/api/` reaches the server, and every other path reaches whatever serves the
   client's files, on one hostname.** Rests on
   [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) and
   [ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md).
3. **Nothing caches an API response or strips `Set-Cookie` unless we configure it to.** Rests on
   [ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md),
   and on [../constraints.md](../constraints.md): a server-set cookie is the only mechanism recorded
   there that carries an identifier across Safari's storage wipe.
4. **A deploy fails no request.** The front sends traffic only to an instance whose health check
   passes, and stops sending to the old one before it stops. Rests on property 1 of
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) and
   [the player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md).
5. **Patching or reconfiguring the front fails no request in flight.** Rests on the same two as
   property 4, and on property 3 of [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md): everything beneath the app is patched without a
   recurring manual step, so the front is patched on a schedule nobody watches.
6. **A connection is set up in the fewest round trips the browser supports, and a dropped one is
   resumed as cheaply as the browser allows.** Rests on [../problem.md](../problem.md): players are
   phone-first in transit, through "dead zones, cell-tower handoff", and the waits listed under
   "Where a player waits" each begin with a request.
7. **A rebuilt machine serves HTTPS again with no manual step**, without exceeding what the
   certificate authority allows. Rests on
   [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md),
   which makes recovery a rebuild of the machine.
8. **The front leaves most of the 1 GB machine to the app.** Rests on "Hosting — a DigitalOcean
   Droplet starts with no swap" in [../constraints.md](../constraints.md), and property 2 of [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md).
9. **It can serve the client's files from disk with a cache header per class of file and an answer
   to a conditional request**, so the front stays an option at
   [what serves the client's files in production?](what-serves-the-clients-files-in-production.md).
   Rests on [../constraints.md](../constraints.md): without content-hashed filenames a browser
   revalidates every cached asset.
10. **Nothing it runs is reachable from the internet except HTTP and HTTPS, and nothing it writes
    fills the disk unbounded.** Rests on property 4 of [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). An administration interface
    listening only on the machine passes.
11. **It is installed and patched from a maintained package on the chosen OS.** Rests on property 3
    of [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). Scored jointly with property 3 of
    [which OS does the Droplet run?](which-os-does-the-droplet-run.md).
12. **The same configuration runs on the maintainer's Mac**, with only the hostname and the
    certificate differing. Rests on
    [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
    and property 5 of [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md).
13. **The least for the maintainer to configure, understand and keep working, across years.** Rests
    on property 6 of [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). What the maintainer already knows enters as the cost of learning the
    alternative, never as a merit, per the portable decision-making standard.
14. **Together with everything else, hosting stays near $10 a month and under $20.** Rests on
    [ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md).
    Software run on the Droplet adds nothing to its cost.

**Resources.** Memory binds, as property 8. Network binds as round trips, which is property 6, not
as bandwidth: at the launch size in [../problem.md](../problem.md) the bytes are small. CPU does not
bind, because TLS handshakes at a small launch audience are a negligible load on one vCPU; this is
reasoned, not measured. Storage binds only as unbounded logs, which is property 10, since certificate
state is a few files.

**Checked and found binding on nothing:**

None found. Price is property 14 rather than here, because a front run off the machine would add
a cost.

**Deferred, with the question that owns each:**

- **Noticing that a certificate is about to lapse or the front has stopped.** Owned by
  [how do we know the deployed app is serving?](how-do-we-know-the-deployed-app-is-serving.md) at
  M11. A front that renews automatically still fails silently if renewal breaks, so that question
  inherits this one's choice.
- **Which security headers the front sends.** Owned by
  [does the app send a content security policy, and how strict?](does-the-app-send-a-content-security-policy-and-how-strict.md)
  at M16.
- **What the front records about each request.** Owned by
  [how is a slow request diagnosed after the fact?](how-is-a-slow-request-diagnosed-after-the-fact.md)
  at M11.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split out on 2026-10-02 from the hosting question, deleted that day and
read with `git show ed7f54e:docs/questions/where-does-this-run.md`. Its open entry listed
"Record: Caddy is the front" as owed. That entry named the answer before any property was written,
so the choice moved here to be derived first. The spikes in that file used Caddy 2.11.4 throughout.

## Options

*Scored in the first pass, 2026-10-02, under **Findings**.*

**Leading after the fourth pass: Caddy**, with nginx still standing, either with its ACME module or
with certbot, both on Debian 13, which leads
[which OS does the Droplet run?](which-os-does-the-droplet-run.md). The maintainer agreed on
2026-10-03 that Caddy leading matches how they weigh the properties read in context. The final
comparison is Caddy against nginx with certbot, and weighs both ways of patching Caddy described in
the fifth pass.

**Caddy is not eliminated on property 5's measurement alone.** Its package upgrade refused
connections for about a second, which the third pass measured. The maintainer decided on 2026-10-03
that the spike measured only a few of the fourteen properties and is not to be read row by row: each
candidate is scored on the whole experience of maintaining it for years, with every finding read in
context. Two things also bear on that row. A request refused for a second is retried by the client
unseen, per the finding on hold length in
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md), so
property 5 as written may be stricter than the guarantee it serves. And a design where Caddy is
upgraded only in the monthly maintenance window, beside the reboot, would put its restart inside an
outage that happens anyway. Both are scored in the fourth pass.

**Out, each on the one property it fails:**

- **Angie** fails property 13: of the three it is the hardest to keep working alone, with no Stack
  Exchange tag, no new forum topics since June 2026, a team of about ten, and no support yet for
  renewal information. *Fourth pass, 2026-10-03.* Agreed by the maintainer on 2026-10-03. Reverses if
  its community and its ACME support grew to nginx's or Caddy's.
- **HAProxy, Traefik and Envoy** fail property 9: none serves static files from disk, so choosing one
  closes the front's option at
  [what serves the client's files in production?](what-serves-the-clients-files-in-production.md).
  Reverses if that question chooses the Node server for the files. *Sourced by a research agent,
  2026-10-02.*
- **Apache httpd** fails property 6: it has no HTTP/3. *Same source.*
- **H2O** fails property 11: it has no tagged release since 2019. *Same source.*
- **The Node process terminating TLS itself** fails property 6: Node's QUIC is experimental, behind
  `--experimental-quic`. Reverses once Node ships stable HTTP/3. *Sourced by a research agent from a
  search summary; Node's page returned 404.*
- **freenginx** fails property 11: it publishes source and Windows binaries only, with no Linux
  package repository. *Sourced by a research agent, 2026-10-03.* Reverses if it publishes packages.
- **River, NGINX Unit and Varnish** fail property 11: River's last release is from August 2024 and
  says "no expectation of stability", Unit is archived, and Varnish's open-source edition is archived
  and has no TLS. *Same source.*

**Not scored here:** fronts off the machine, which are Cloudflare's proxy or tunnel and
DigitalOcean's load balancer, the last at $12 a month. Whether anything sits between the browser and
the Droplet is [how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md)
at slice 5.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Service workers run only in a secure context.** MDN: "Service workers are only available in secure
contexts: this means that their document is served over HTTPS, although browsers also treat
`http://localhost` as a secure context, to facilitate local development." So property 1 binds in
production, and the local run on `localhost` is exempt from it.

*Sourced — <https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API>, opened by me on
2026-10-02.*

**Caddy switched between two instances on its health checks and used about 50 MB.** On a real
`s-1vcpu-1gb` Droplet running Ubuntu 24.04, Caddy 2.11.4 from its apt repository used 47 to 51 MB
resident while a deploy switched between two app instances with no failed request. In a Linux
container it used about 56 MB. Its configuration and the deploy order are in
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md).

*Measured, 2026-09-30, in the eleventh and twelfth passes of the hosting question, read with
`git show ed7f54e:docs/questions/where-does-this-run.md`. Not measured: TLS and certificate issuance, which those runs left out by serving HTTP only.
This is one candidate measured, not a comparison.*

**Caddy's apt repository is hosted on Cloudsmith** and needed `debian-keyring`,
`debian-archive-keyring` and `apt-transport-https` on Ubuntu 24.04.

*Measured, 2026-09-30, twelfth pass, same source.*

**A certificate authority cannot issue for a VM on the Mac**, so the local run loads a local
certificate where production gets a public one. That is the one difference property 12 allows.

*Reasoned, ninth pass of the hosting question, same source.*

### First pass 2026-10-02: the field against properties 1 to 14

*Two research agents scored the field by property, and a third enumerated it, on 2026-10-02. "Opened
by me" marks what the session that wrote this pass fetched itself.*

**Caddy restarts when its package is upgraded.** Its Debian post-install script runs
`deb-systemd-invoke try-restart caddy.service` whenever an older version was installed, and its unit
sets `TimeoutStopSec=5s`. A restart closes the listener, so connections arriving during it are
refused, and a request still running after five seconds is cut. So Caddy is partial on property 5.

*Sourced — <https://raw.githubusercontent.com/caddyserver/dist/master/scripts/postinstall.sh> and
<https://raw.githubusercontent.com/caddyserver/dist/master/init/caddy.service>, opened by me on
2026-10-02.*

**nginx's own package upgrades its binary in place.** Its Debian post-install runs
`/etc/init.d/nginx upgrade`, which starts the new binary beside the old and retires the old once the
new one serves. So nginx passes property 5 when installed from nginx.org.

*Sourced — <https://raw.githubusercontent.com/nginx/pkg-oss/master/debian/debian/nginx.postinst>,
opened by me on 2026-10-02. That the upgrade drops nothing is reasoned from how the binary upgrade
works, not measured.*

**nginx's open-source edition has no active health checks.** Its docs: "Dynamically configurable
group with periodic health checks is available as part of our commercial subscription." It detects a
failed upstream only passively, after a request to it fails. So property 4 holds for nginx only if
the deploy script itself takes the old instance out of the upstream list and reloads, rather than
waiting for a health check. An agent found that waiting is slow on the others too by default: Caddy
and Traefik check every 30 seconds, HAProxy every 2 seconds with three failures. The spikes set
Caddy's interval to 250ms.

*Sourced — <https://nginx.org/en/docs/http/ngx_http_upstream_module.html>, opened by me on 2026-10-02.
The other intervals are a research agent's reading.*

**Caddy turns on 0-RTT for HTTP/3 by default.** Its docs: "By default, 0-RTT (early data) is enabled
for QUIC listeners (i.e. HTTP/3)". Early data can be replayed, so a POST that saves progress must
not be accepted as early data unless it is idempotent. nginx leaves it off by default, per an agent.
This is a setting either way, so it moves no verdict, and it is recorded so that whichever is chosen
sets it deliberately.

*Sourced — <https://caddyserver.com/docs/caddyfile/options>, opened by me on 2026-10-02.*

**HTTP/3 helps returning visitors only.** A browser learns that a site offers HTTP/3 from a header on
an earlier response, so a first visit pays the TCP and TLS 1.3 handshake whatever the front supports.
Caddy serves HTTP/3 by default; nginx's HTTP/3 module calls itself experimental.

*Sourced by a research agent, 2026-10-02. Not re-opened.*

**Rebuilding the machine repeatedly can exhaust Let's Encrypt's limit.** It allows 5 certificates for
the same set of names in 7 days, so a rebuild that does not restore its certificate state is a fresh
order each time. Caddy and Apache's mod_md fall back to a second certificate authority on their own;
nginx with certbot does not. Property 7 holds for any candidate whose certificate state is restored
with the machine.

*Sourced by a research agent, 2026-10-02. Not re-opened.*

**Caddy and nginx differ elsewhere, without either failing:**

- **Property 1:** Caddy issues and renews certificates itself. nginx needs its native ACME module,
  which an agent found is new and did not establish the retry behaviour of, or certbot on a timer.
- **Property 8:** an agent found idle figures of 2 to 8 MB for nginx and 15 to 59 MB for Caddy from
  indirect sources; the spikes measured Caddy at 47 to 51 MB on a Droplet. Both leave most of the
  machine.
- **Property 10:** Caddy listens for its administration API on `localhost:2019` by default, which
  passes property 10 because it is local only.

*Sourced by research agents, 2026-10-02, except the spike figure, which is Measured, 2026-09-30.*

**Let's Encrypt issues certificates for bare IP addresses since 2026-01-15.** "These certificates are
valid for 160 hours, just over six days", and "IP address certificates must be short-lived
certificates." So TLS could be observed on a Droplet's address without a hostname. Which clients
support it was not established.

*Sourced — <https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability/>, opened by me on
2026-10-02.*

**The first pass leaves two candidates standing, with two forks unscored**, so it is not finished.
Neither Caddy nor nginx fails a property. Caddy is partial on property 5 and nginx on properties 1
and 4. The next pass scores Angie and freenginx, zooms into properties 1, 4 and 5, and observes
what reading cannot: issuance and renewal on a real certificate, and a package upgrade under load.

### Second pass 2026-10-03: the two forks of nginx

*A research agent scored Angie and freenginx on 2026-10-03; not re-opened by me.*

- **Angie** has ACME built in since 1.11.0, with crash and DNS-challenge fixes since. Its docs do not
  say whether a valid certificate keeps being served when renewal fails, and a reload skips its
  two-hour wait after an error, so repeated reloads during a failure can reach the authority's
  limits. Its active health checks are in its paid edition only, as with nginx. It has official
  packages for Ubuntu 24.04 and 26.04, Debian 13, and the RHEL family's 9 and 10 rebuilds. What its
  package does on upgrade is unknown, since the scripts are not public. It is made by Web Server LLC,
  which sells the paid edition; 1.12.2 shipped 2026-09-17.
- **freenginx** has no ACME and no Linux packages, which is its elimination under **Options**. It is
  maintained by a very small team and ships about monthly.

### Third pass 2026-10-03: the three survivors measured on Debian 13

**The run.** Each front was installed from its own Debian 13 repository, one version back, on a fresh
`s-1vcpu-1gb` Droplet in `tor1` from the `puzzles-experiments` team, with
`spike.pencilpuzzles.app` pointed at it by a DNS-only A record with a 60-second TTL. A small Python
server on `127.0.0.1:3000` stood in for the app, answering GET and POST, identical for all three. Each
front sent `/api/` to it and served every other path from `/var/www/spike`, per
[ADR-0041](../decisions/0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md). The
three ran one after another between about 03:05 and 03:36 UTC on 2026-10-03, with three certificate
orders in all against Let's Encrypt's limit of five a week for one name. The scripts were deleted with
the Droplets; this records what they did.

**Property 1: each issued a trusted certificate within seconds of being configured.** Measured from
the reload until `curl` from the maintainer's Mac accepted the certificate: Caddy 2.11.4 in 4
seconds, nginx 1.30.4 with `nginx-module-acme` 0.4.1 in 7 seconds, Angie 1.12.1 in 6 seconds, each
from Let's Encrypt. nginx and Angie each logged a failed attempt over IPv6, which these Droplets do not
have, and then succeeded over IPv4. nginx's package installs without starting the service, so it
needed `systemctl enable --now nginx`.

**Property 5: a package upgrade under load.** Eight threads alternated GET and POST over TLS for 40
seconds, and 10 seconds in the package was upgraded with `apt-get install`. Before each run it was
downgraded again outside the load. A 20-second control run with no upgrade failed nothing on all
three.

- **Caddy 2.11.4 to 2.11.6:** 33, 44 and 191 failed requests, nearly all `ConnectionRefusedError`,
  out of about 7,100 each. Its package restarts the service, as its post-install script reads.
- **nginx 1.30.4 to 1.30.5:** 0, 3 and 1 failed requests out of about 14,000, each a keep-alive
  connection closed as a request was sent. The slowest request was about 1.06 seconds.
- **Angie 1.12.1 to 1.12.2:** 0, 0 and 0 failed requests out of about 14,000; slowest about 1.06
  seconds. Its installed post-install script runs `service angie upgrade`, a binary upgrade like
  nginx's, and installs an override for `needrestart`.

Three runs each cannot separate nginx's 4 failures from Angie's 0: both upgrade the binary in place,
and nginx's failures are the race any server has when it closes a keep-alive connection. Caddy's
failures are of another kind and size.

**Property 7: restoring certificate state onto a rebuilt machine issued nothing new.** For each front,
its state directory was copied off the first Droplet, which was then deleted; a fresh Droplet got the
current package, the restored directory and the same configuration, and DNS was pointed at it. Each
served the same certificate serial as before and placed no new order. The directories are
`/var/lib/caddy/.local/share/caddy`, the `state_path` set for nginx's issuer, here
`/var/cache/nginx/acme-letsencrypt`, and `/var/lib/angie/acme`. Each holds the ACME account key and
the certificate's private key, so it is a secret wherever it is copied.

*Measured, 2026-10-03, one issuance, three upgrade runs and one restore per front.*

**Where the third pass leaves the field.** nginx and Angie are the same server at heart and passed
every measured row alike. What separates them is read rather than measured: nginx's ACME module is at
0.4.1, Angie's ACME has shipped since 1.11; nginx calls its HTTP/3 experimental, Angie's is reported
stable; and nginx is maintained by F5, while Angie is made by Web Server LLC, which sells a paid
edition. Their configuration is close enough that moving from one to the other is a rewrite of a few
directives, which under
[ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
lowers how much stewardship should weigh.

### Fourth pass 2026-10-03: maintaining each one for years

*The maintainer asked on 2026-10-03 for each candidate to be scored on the whole experience of
maintaining a system that chose it, as a solo maintainer who values simplicity and stability, with
every finding read in context rather than row by row. So this pass follows the moments a maintainer
meets over years: setting it up, certificates renewing as their lifetimes shrink, deploys, security
patches, version upgrades, something breaking, and the project itself changing.*

**Setting it up: the full configuration for this setup, validated.** Each config sends `/api/` to two
app instances, serves the client's files with a long cache for hashed assets and revalidation for the
entry document, obtains its certificate, redirects HTTP, and serves HTTP/3. Each passed its own check
on Debian 13 in a local VM: `caddy validate` for Caddy 2.11.6, `nginx -t` for nginx 1.30.5 with
`nginx-module-acme` 0.4.1, and `angie -t` for Angie 1.12.2.

- **Caddy:** 27 non-blank lines, with 0-RTT turned off. Certificates, the HTTP redirect and HTTP/3
  need no lines. Switching between the two instances is its own health check, so the deploy script
  only starts and stops them.
- **nginx:** 41 lines, plus a `load_module` line added to `nginx.conf`, a separate file naming the
  live instance, and `systemctl enable --now nginx`, since its package does not start it. The deploy
  script rewrites that file and reloads, because the free edition has no active health checks. Each
  location repeated the `Alt-Svc` header, because "These directives are inherited from the previous
  configuration level if and only if there are no `add_header` directives defined on the current
  level"; `add_header_inherit merge`, added in 1.29.3, would remove the repetition.
- **Angie:** 35 lines, plus the same file naming the live instance and the same reload in the deploy
  script.

*Measured, 2026-10-03, one validation each in a Debian 13 arm64 VM under QEMU; the header rule
sourced from <https://nginx.org/en/docs/http/ngx_http_headers_module.html>, opened by me that day.*

**Certificates over years, as lifetimes shrink.** Let's Encrypt will issue 64-day certificates by
default from 2027-02-10 and 45-day ones from 2028-02-16, and recommends that clients use ACME
Renewal Information. So renewal runs about eight times a year per certificate, and a renewal that
fails silently leaves [nobody able to start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md)
once the certificate expires.

- **Caddy** has issued certificates itself since version 2 in 2020. When Let's Encrypt fails "it will
  try with ZeroSSL; if both fail, it will backoff and retry", with a "Maximum of 1 day between
  attempts" for "up to 30 days". An agent found it supports renewal information. It has no built-in
  alert on a failed renewal.
- **nginx's ACME module** first released on 2025-08-12 and is at 0.4.1, released 2026-05-01. Its
  README calls it stable and usable. It supports renewal information since 0.4.0. An agent found no
  documented retry schedule, fallback authority or alert. Its issue #140, "Segfault after module
  setup and nginx reload", opened 2026-02-25, is still open, and under this design every deploy
  reloads nginx.
- **Angie's ACME** shipped in 1.5.0 in 2024. It renews a fixed 30 days before expiry, retries after
  two hours, and reports its state through a status endpoint that a monitor can read. An agent found
  it does not support renewal information yet; its issue #167 is open.

*Let's Encrypt's timeline from <https://letsencrypt.org/2025/12/02/from-90-to-45/>, Caddy's behaviour
from <https://caddyserver.com/docs/automatic-https>, and nginx's releases and issue #140 from GitHub's
API, all opened by me on 2026-10-03. Angie's, and the renewal-information support, are a research
agent's reading that day, not re-opened.*

**Security patches.** All three come from the vendor's own repository on Debian 13, since Debian's own
Caddy is 2.6.2 and its nginx has no ACME module. Debian's automatic updates cover only Debian's
repositories by default, so each needs its repository added before anything patches it. An agent
counted, from each vendor's advisories for 2024 to 2026: nginx 30 CVEs, 21 of them in 2026, with 7
stable releases carrying security fixes between March and September 2026; Caddy 17 advisories, all
in 2026, over 6 releases; Angie 12 releases with security fixes, mostly nginx's, ported within about
two days. So each is patched roughly monthly in 2026. Read beside the OS's reboots, Caddy's restart
on each patch is about a second of refused connections, which the client retries unseen, against 12
to 19 reboots a year of about 18 seconds each on Debian 13. And the restart can be moved into the
monthly reboot window, at the cost of a security fix waiting up to a month.

**Upgrades that change behaviour.** An agent found, from the changelogs: Caddy 2.8.0 removed or renamed
directives in 2024, and 2.11.6, a patch release, added a 16 KiB header limit and one-minute idle
timeouts by default; nginx 1.29.7, which became stable 1.30, turned on keep-alive to upstreams and
HTTP/1.1 to them by default; Angie 1.10.0 and 1.11.0 each needed regression fixes. None of these would
break the configs above as far as was checked, but each is a release whose notes need reading.

**When something breaks: finding help.** Stack Overflow has 54,455 questions tagged nginx and 367
tagged caddy, and no Stack Exchange site has an angie tag. Caddy's forum had at least 18 new topics in
the last month, nginx's at least 11, and Angie's none since June 2026. *A research agent's figures,
2026-10-03, not re-opened.*

**The project itself.** nginx is owned by F5; its long-time lead left in 2024 to fork it as freenginx
over F5's handling of security, and four people made about 80% of its commits in the last year. Caddy
is "a project of ZeroSSL, an HID Global company", Apache-2.0, with 129 commit authors in the last year.
Angie is made by Web Server LLC, based in Russia, with a team of about ten; no sanctions listing was
found on the US list, and the EU and UK lists were not checked. *A research agent's reading,
2026-10-03, not re-opened.*

**Running it on the Mac.** Caddy issues a locally trusted certificate itself with `tls internal`;
nginx and Angie need an outside tool such as mkcert. *A research agent's reading, 2026-10-03.*

**Memory.** Caddy used 47 to 51 MB in the spikes; nginx's own figures are a few megabytes. With about
780 MB available on Debian 13 before the app, neither binds.

**Where the fourth pass leaves the field.** Read in context, Caddy is ahead on what a solo maintainer
lives with most: the shortest configuration, certificates handled by the most mature implementation
with a second authority to fall back on, the deploy switch built in, and a local certificate built
in. Its costs are about a second of refused connections per patch, which the client absorbs and the
reboot window can swallow, about 45 MB more memory, which does not bind, and a smaller community than
nginx's. nginx is ahead on in-place upgrades, memory and help, but the part of it this setup leans on
hardest, its ACME module, is a year old, documents no retry or fallback, and has an open crash on
reload in the design that reloads on every deploy. Angie matches nginx on upgrades but has the least
help, the smallest team and no renewal information. nginx with certbot in place of its module was a
first-pass survivor and was not measured or configured here.

### Fifth pass 2026-10-03: nginx with certbot, and the two ways of patching Caddy

**nginx with certbot in place of its ACME module.** certbot is the long-standing ACME client, and
Debian 13 packages it, so it is patched by Debian's automatic updates as shipped, unlike the fronts
themselves. Debian 13 ships certbot 4.0.0. From that version "Certificates now renew with 1/3rd of
lifetime left", so it keeps pace with 45-day certificates. Support for renewal information came in
4.1.0, released 2025-06-10, so Debian 13's certbot does not have it. Debian's `certbot.timer` runs
`certbot -q renew` twice a day, so a failed renewal is retried twice daily until it succeeds or the
certificate expires; certbot has no second authority to fall back on and raises no alert by itself. A
deploy hook reloads nginx after each renewal, and nginx's reload is graceful.

*Sourced — Debian's package versions from <https://sources.debian.org/api/src/python-certbot/>,
certbot's changelog from <https://raw.githubusercontent.com/certbot/certbot/main/certbot/CHANGELOG.md>,
and the timer and service units from Debian's 4.0.0-2+deb13u1 source, all opened by me on
2026-10-03.*

What this changes for nginx, reasoned from the above and the fourth pass:

- **It removes nginx's weakest point.** The certificate path no longer rests on a year-old module
  with an open crash on reload.
- **It adds a second program and a hook.** Setting it up needs an order: nginx answers the challenge
  on port 80 first, certbot obtains the certificate, and only then can the HTTPS server, which names
  the certificate's files, be enabled. On a rebuilt machine `/etc/letsencrypt` is restored with its
  links intact. On the Mac it still needs a tool such as mkcert.
- **Everything else in the fourth pass about nginx stands:** in-place upgrades, little memory, the
  most help, and a deploy switch that the deploy script carries out by rewriting a file and
  reloading, since the free edition has no active health checks.

**Two ways of patching Caddy**, both kept for the final comparison at the maintainer's request on
2026-10-03, and left to the decision record:

- **Patch as released.** Add Caddy's repository to the automatic updates, and accept about a second
  of refused connections each time, roughly monthly in 2026, which the client retries unseen.
- **Patch in the monthly window.** Upgrade Caddy only just before the monthly reboot, so its restart
  falls inside an outage that happens anyway. A Caddy security fix then waits up to a month, unless
  one is applied at once by hand.

**The comparison left: Caddy against nginx with certbot.** Caddy is one program with certificates, a
second authority, the deploy switch and a local certificate built in, at the cost of a restart per
patch and a smaller community. nginx with certbot is two programs joined by a hook, each long
established, with in-place upgrades and the most help, at the cost of a longer configuration, a
setup order to get right, a deploy switch written into the deploy script, and no fallback authority
or renewal information in Debian 13's certbot.

