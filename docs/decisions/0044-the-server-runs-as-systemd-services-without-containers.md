---
number: 0044
status: accepted
date: 2026-09-30
amended: 2026-10-03
---

# 0044 — The server runs as systemd services, without containers

## Forced by

- [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md) puts the server on one Droplet,
  which brings nothing to run it with. Something has to start the app, restart it when it crashes,
  bring it back after a reboot, and switch it to a new version.
- [ADR-0020](0020-the-stores-engine-is-sqlite.md) and
  [ADR-0030](0030-typescript-outside-the-browser-runs-on-node.md): the server is JavaScript on Node.
  While its SQLite driver is Node's built-in `node:sqlite`, it has no native addon to build for the
  machine's CPU. The driver is still open at
  [which driver reads and writes the store?](../questions/which-driver-reads-and-writes-the-store.md),
  and a driver with an addon would change where releases are built, not this arrangement.
- "Hosting — a DigitalOcean Droplet starts with no swap" in [../constraints.md](../constraints.md):
  about 600 MB is free on a 1 GB Droplet once the app, Caddy and Litestream run, and running out ends
  a process.
- [ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md):
  the production-like run uses the production arrangement.
- The maintainer's aims recorded in where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`): "it
  just works", "it's so easy" and "great price".

## Scored against

Derived from the moments something runs the app on the machine: a deploy, a crash, a reboot, a
patch, a failure being investigated, and the same arrangement run on the Mac. Each line names its
row in the question.

1. A deploy fails no request (row 30 and J1, [the player is never asked to retry or
   reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md)).
2. The arrangement leaves the app and what runs beside it the most of the 1 GB machine
   ([../constraints.md](../constraints.md), no swap).
3. Everything beneath the app is patched without a recurring manual step (rows 14 and 23).
4. Nothing on the machine bypasses its firewall, and nothing fills its disk unbounded (the traps in
   the tenth pass).
5. The arrangement runs on the maintainer's Mac the way it runs deployed (L1,
   [ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)).
6. The least for the maintainer to build, understand and keep working, weighed across years (E1 to
   E3).

**Maximums.** Maximum safety is a machine with nothing on it that is not needed. Maximum performance
is a deploy the player never notices and a machine left to the app. Maximum experience is one
command to deploy and plain processes to debug. Containers trade some of all three for a frozen
image, and this app gains little from one.

## Decision

**The app and Litestream run as systemd services on the Droplet. No container runtime is
installed.**

- **A release.** A directory holding the built JavaScript and its `node_modules`, with pnpm's
  symlinked layout kept as it is ([ADR-0032](0032-the-package-manager-is-pnpm.md)'s Revisit when
  names this host).
- **What systemd supplies.**
  - **Restarts:** `Restart=always`.
  - **Order at boot:** Litestream first.
  - **Memory:** `MemoryMax`, which stands in for the swap the machine lacks.
  - **Sandboxing:** `ProtectSystem=strict`, with write access limited to the store's directory.
  - **Logs:** into journald.
- **Observed on a real Droplet.** It dropped no request and lost no acknowledged write across five
  deploys under load, and it peaked at 373 MB used of 961 MB. Deploys took about 3 seconds. The
  twelfth pass of where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`) has the method. That run
  had Caddy in front and a deploy that switched between two instances, so property 1 holds for this
  arrangement together with the records that settle the front and the switch.

**What this does not settle:**

- **What OS the Droplet runs, and what sits in front of the app and terminates TLS.** Settled since by
  [ADR-0049](0049-the-droplet-runs-debian-13.md) and
  [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md).
- **How a deploy switches between versions.** That is
  [how does a deploy switch between versions?](../questions/how-does-a-deploy-switch-between-versions.md).
- **How Node itself is pinned and patched.** Either the host's package manager patches it, or each
  release carries its own binary. That is [what shape is the
  deployable?](../questions/what-shape-is-the-deployable.md).
- **What triggers a deploy.** That is [what deploys the
  code?](../questions/what-deploys-the-code.md).

## Enforced by

**Nothing yet.** It is true once M1 slice 4 deploys this way. Two rules would make it hold over
time, and neither exists:

- a check that fails when a production dependency has a native addon, so that a release built on
  the Mac is never shipped with a binary compiled for the wrong CPU;
- tests for the deploy script.

## Rejected

- **Kamal: Docker, kamal-proxy and an image per release.** Its case is strong. It is the most
  complete tool of its kind, it supplies the deploy, the proxy and TLS, and it was observed dropping
  nothing on the same Droplet. No single property disqualifies it. It fails property 2, using about
  100 MB more at its peak on a machine with no swap. It also fails property 6, putting Docker and a
  container between the maintainer and every process they debug. The maintainer chose against it on
  those two together on 2026-09-30. **Reverses if** the server moves to a platform that runs images.
- **Dokku.** It fails property 2: it builds on the server and states "1GB of system memory, or add
  swap" as its minimum, which is the whole machine. **Reverses if** the machine grows well past 1
  GB.
- **Coolify, Dokploy and CapRover.** Each fails property 2, stating 1 to 2 GB for itself. **Reverses
  if** a control panel runs in tens of megabytes.
- **PM2's cluster reload.** It fails property 1: it waits for a process to listen, or to say it is
  ready, not for a health check to pass, so a new version is not checked before traffic reaches it.
  It also adds a second supervisor beside systemd. **Reverses if** PM2 gates a reload on an HTTP
  health check.
- **Podman with Quadlet.** It fails property 1: an update restarts the unit, so old and new never
  overlap. **Reverses if** Quadlet gains an overlapping update.
- **NixOS.** It fails property 6: it is by far the most to learn, and it has no zero-downtime deploy
  of its own. **Reverses if** the maintainer comes to know Nix well.
- **Not yet.** Rejected because M1 slice 4 cannot deploy until something runs the app.

The working for each is in the eleventh pass of where does this
run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`).

## Risk

- **The deploy script is ours.** It is small, and its bugs are ours too. It must enable the new
  instance at boot and disable the old, or a reboot brings back whichever was enabled first. It needs
  tests and a rehearsal in a local VM before each change.
- **No frozen image.** The operating system's packages beneath the app change as they are patched. Pinned
  versions and release directories narrow that without removing it.
- **No community recipe** for this exact arrangement, where Kamal has one.

## Revisit when

- A production dependency has a native addon with no prebuilt binary for the server, and building
  releases on Linux proves harder than building an image would be.
- The server moves to a platform that runs images.
- The deploy script grows past something one person can read in a sitting, or causes an outage.

## Also update

- [x] questions/README.md: a **Given** for M1 slices 4 and 6
- [x] questions/what-deploys-the-code.md: deploys target systemd services on the Droplet
- [x] questions/what-shape-is-the-deployable.md: how Node is pinned and patched is left there
- [x] questions/where-does-this-run.md: its open entry lists this as settled
- [x] architecture.md: the server and Litestream run as systemd services, with no containers
- [x] ../CONTRIBUTING.md: nothing yet; the local VM rehearsal arrives with the deploy script
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
