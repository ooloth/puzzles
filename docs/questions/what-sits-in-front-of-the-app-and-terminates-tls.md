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

...

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
