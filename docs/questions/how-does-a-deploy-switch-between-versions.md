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

The front's choice first, at
[what sits in front of the app and terminates TLS?](what-sits-in-front-of-the-app-and-terminates-tls.md),
since the switch is carried out partly by the front's health checks. Then a deploy with the real
Fastify server, observed on a Droplet under load, since the spikes ran a minimal server. How many
records the answer resolves into is decided once it is worked.

## Properties the answer is scored against

...

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
