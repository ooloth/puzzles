---
number: 0049
status: accepted
date: 2026-10-03
---

# 0049 — The Droplet runs Debian 13

## Forced by

- [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md) puts the server on a DigitalOcean
  Droplet, and [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) runs it as
  systemd services with nothing between them and the OS. So the OS is what installs, patches and
  supervises everything beneath the app, and nothing chose it: the spikes used Ubuntu 24.04 as the
  default.
- "Hosting — a DigitalOcean Droplet starts with no swap" in [../constraints.md](../constraints.md):
  what the OS itself uses comes out of the app's 1 GB.
- [ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md):
  the same OS has to run on the maintainer's Mac.
- [../problem.md](../problem.md): "active attention for years after it", from one maintainer.

## Scored against

Derived from the moments the system touches the OS: provisioning a Droplet from cloud-init, a
security patch arriving, a kernel fix and its reboot, installing and upgrading Node, Litestream and
the front, the release's support ending, and the same setup run on the Mac.

1. Security patches, the kernel's included, are applied without a recurring manual step, and most
   kernel fixes need no reboot (property 3 of
   [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md); its property 1 with
   [the player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md),
   since a reboot of the one machine means
   [nobody can start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md)).
2. The same OS image runs on the maintainer's Mac, provisioned by the same cloud-init
   ([ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md);
   property 5 of [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md)).
3. Node, Litestream and the front install from maintained packages that the automatic patching can
   cover (property 3 of [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md)).
4. The release is supported for years without a forced major upgrade ([../problem.md](../problem.md);
   [ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)).
5. The base system leaves most of the 1 GB machine to the app, and uses as little of every resource
   as it can ([../constraints.md](../constraints.md), no swap; the maintainer on 2026-10-03, that
   what the OS consumes is a cost to minimise).
6. The least for the maintainer to learn and keep in their head (property 6 of [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md)).
7. It just works: a long record of rare bugs and regressions in the OS and its updates, so keeping
   it running needs no troubleshooting (the maintainer on 2026-10-02, above what the OS bundles; "it
   just works" in [ADR-0043](0043-the-server-runs-on-a-digitalocean-droplet.md)).

**Resources.** Memory binds, as property 5. CPU and network do not: every candidate used under 1% of
the one vCPU and under 60 KB of traffic in ten idle minutes. Disk does not: the largest image used
2.2 GB of about 24.

**No candidate meets the second half of property 1.** Live kernel patching exists only on Ubuntu,
and covers only critical and high kernel fixes, so every candidate reboots to stay patched, Debian 13
included. That half was therefore scored as how many reboots staying patched takes, and how long each
one lasts.

**Maximums.** Maximum safety is an OS that patches itself and never ships a regression. Maximum
performance is one that takes none of the machine and reboots instantly. Maximum experience is one
with nothing to configure, switch off or remember. No candidate reaches all three; Debian 13 comes
closest on the two the maintainer weighs most, performance and experience, and gives up length of
support, which [ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md) lets a migration path cover.

## Decision

**The Droplet runs Debian 13, from DigitalOcean's `debian-13-x64` image.**

What it was chosen for, all measured on Droplets on 2026-10-03:

- **The most memory left to the app, and the steadiest.** 769 to 784 MB available with the page cache
  dropped, against 701 to 726 MB for Ubuntu 24.04 as shipped.
- **The shortest reboot.** About 18 seconds from `systemctl reboot` until SSH answered, against 25 to
  31 for Ubuntu, which is the length of every kernel reboot's outage.
- **Nothing to switch off.** 13 to 14 services as shipped, none of them unneeded here. It has no
  `needrestart`, so an update applied while the app serves restarts nothing beside the package it
  updates.
- **Security updates for its own packages are applied automatically as shipped**, through
  `unattended-upgrades`, until the question below decides otherwise.
- **The fewest regressions shipped.** Four confirmed by Debian in its first 13.8 months, none of which
  stops a running server, against at least 13 for Ubuntu 24.04 in 29.2 months.

The working is in the question this record resolved, read with
`git show 6bf04f6:docs/questions/which-os-does-the-droplet-run.md`.

**What it commits us to:**

- **Kernel fixes need a reboot.** Debian has no live kernel patching, so the machine is rebooted to
  apply them.
- **A major upgrade by mid-2030.** Debian 13's security support ends August 2028 and its long-term
  support June 2030, per endoflife.date as read by a research agent, so the machine moves to Debian
  14 before then. Under
  [ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md) that is a
  rebuild from cloud-init onto the new release, not an upgrade in place.

**What this does not settle:**

- **Which front runs on it.** That is the next record.
- **How Node is installed and patched**, by the host's package manager or inside each release. That
  is [what shape is the deployable?](../questions/what-shape-is-the-deployable.md).
- **When updates are applied and when the machine reboots**: as released, on a schedule we set, or
  with each deploy. That is [when are updates applied to the machine?](../questions/when-are-updates-applied-to-the-machine.md), in M1 slice 4. Until it is answered, Debian's own
  packages update as shipped, and anything installed from another repository updates only when
  upgraded by hand.

**The choice does not depend on that answer.** Rescored under each way of applying updates on
2026-10-03, Debian 13 leads on every row that does not depend on timing: memory, reboot time,
services, regressions shipped and nothing to switch off. Two rows do depend on it, and both are
Ubuntu's. `needrestart` restarting services costs Ubuntu something only when updates land while the
app serves. Livepatch helps Ubuntu most then too, and under a schedule it helps only with an urgent
kernel fix between windows. Neither row turns the comparison under any of the options.

## Enforced by

**Nothing yet.** It is true once M1 slice 4's setup creates the Droplet from `debian-13-x64`. The
setup script is what names the image, and the production-like local run boots Debian 13's own arm64
cloud image with the same cloud-init.

## Rejected

- **Ubuntu 24.04 LTS.** Its case is real: security support to May 2034 through Ubuntu Pro's free
  tier, Livepatch for critical and high kernel fixes, and the largest community. No single property
  disqualifies it. It is behind on property 5, about 55 MB less memory and reboots half again as long,
  and on property 7, at least 13 regressions shipped including a snapd update that broke
  installation. Its `needrestart`, which restarts services after updates applied while the app
  serves, weighs only if updates are applied that way, which is not yet decided. The
  maintainer chose against it on those two together on 2026-10-03. Its support advantage rests on a
  free tier whose terms count "physical" machines, which a Droplet is not, and which Canonical may
  change. **Reverses if** Debian 13 ships regressions that break servers, or if the maintainer comes
  to weigh support length above resource use.
- **Ubuntu 26.04 LTS.** It fails property 7: one point release in the field and at least 5
  regressions in its first 5.3 months, while its only gain over 24.04 is two more years of support.
  **Reverses once** it has a record comparable to 24.04's.
- **Rocky Linux and AlmaLinux 9 and 10.** They fail property 1: AlmaLinux 9 issued 62 kernel
  advisories in the year to 2026-10-02 against Debian 13's 16, so staying patched takes about three
  times the reboots. They also run SELinux enforcing, ship with automatic updates off, and Rocky
  reserves 192 MB for a crash kernel. **Reverses if** their kernel advisories fell to the Debian
  family's rate.
- **CentOS Stream 10.** It fails property 7: it "tracks just ahead of Red Hat Enterprise Linux (RHEL)
  development", so it receives changes before the stable product. **Reverses if** it stopped running
  ahead of RHEL.
- **Fedora 43 and 44, Ubuntu 22.04, and Rocky and AlmaLinux 8.** Each fails property 4: support ends
  between December 2026 and mid-2027, or active support has already ended. **Reverses** only if their
  support were extended; each has a newer release scored above.
- **Flatcar and Fedora CoreOS.** They fail property 3: they are built to run containers and have no
  package manager for the host, so Node, Litestream and the front cannot be installed and patched as
  packages. **Reverses if** [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) is reversed in favour of containers.
- **Not yet.** Rejected because M1 slice 4 cannot create the Droplet without an image, and changing
  the OS gets more expensive once the store holds data at M3.

Custom images DigitalOcean can boot, such as NixOS, Arch, openSUSE Leap and Gentoo, were found but
not scored. NixOS was already rejected for the arrangement in [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) on what it takes to learn.

## Risk

- **Kernel fixes wait for a reboot.** Without live patching, a critical kernel fix either takes an
  unscheduled reboot of about 18 seconds or waits for the next planned one unpatched. Measured over a
  year with a monthly window, that came to about the same total outage as Ubuntu with Livepatch,
  about 340 seconds; what Debian gives up is earlier patching of the worst kernel bugs.
- **A shorter support window.** Long-term support ends June 2030, against 2034 for Ubuntu 24.04 under
  Ubuntu Pro, so the move to Debian 14 comes sooner.
- **The evidence is one run per measurement.** Memory, reboot time and idle load were each read on one
  Droplet. The regression comparison is uneven: Debian's count is close to complete and Ubuntu's are
  lower bounds.

## Revisit when

- Debian 13 ships an update that breaks a running server, or its rate of confirmed regressions
  overtakes Ubuntu 24.04's.
- A kernel fix forces unscheduled reboots often enough that their outage is noticed.
- Debian 13's support is about to end without Debian 14 having been rehearsed in the local run.

## Also update

- [x] questions/README.md: M1 slice 4 loses its **Must answer** on the OS and gains this record as a
      **Given**
- [x] questions/which-os-does-the-droplet-run.md: mined and deleted in this change
- [x] questions/what-shape-is-the-deployable.md: gains the Node install findings and the NodeSource
      origin trap, which matters only if Node comes from the host's package manager
- [x] questions/when-are-updates-applied-to-the-machine.md: its links to this record's question are
      repointed to git history
- [x] questions/how-does-a-deploy-switch-between-versions.md: gains the reboot time, and points the
      reboot schedule to the question on update timing
- [x] architecture.md: the Droplet runs Debian 13
- [x] constraints.md: nothing new; the measurements are this record's
- [x] ../CONTRIBUTING.md: nothing yet; the local run's VM arrives at M2
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
