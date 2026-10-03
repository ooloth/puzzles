---
opened: 2026-10-03
status: open
resolves_into: decision
---

# When are updates applied to the machine?

## Why it matters

Everything beneath the app has to be patched without a recurring manual step, per property 3 of
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). That
property says patching must not wait on someone remembering. It does not say when patches land, and
that is a choice others build on:

- **How Node is carried.** [What shape is the deployable?](what-shape-is-the-deployable.md) asks
  whether Node comes from the host's package manager, patched without a deploy, or inside each
  release, patched only by deploying. That is this question asked of Node alone, so it is answered
  here first.
- **The front's restart.** The front restarts on each package upgrade, refusing connections for
  about a second. Whether that costs anything depends on when the upgrade runs.
- **Reboots.** Kernel fixes take effect only after a reboot, and each reboot of the one machine is an
  outage during which [nobody can start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md).
- **Deploys.** If updates move with each deploy, they become part of
  [what deploys the code?](what-deploys-the-code.md).

**The candidates, named here only so the question is clear, not scored:** as released; on a schedule
we set, such as a monthly window that applies everything and then reboots; with each deploy; or a
mix, such as security fixes as released and the rest on a schedule.

**Environments:** production, and the production-like local run that
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
requires, which has to update the same way to show the same behaviour.

**Until it is answered**, Debian's own packages update as shipped, through `unattended-upgrades`, and
anything installed from another repository, the front and possibly Node, updates only when upgraded
by hand.

## What would settle it

Properties derived from the moments an update touches the running system, then each way of timing
updates scored against them. The measurements already taken on Droplets, below, cover most of what
running can show.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Split out on 2026-10-03 from [how is the server operated?](how-is-the-server-operated.md), which
listed "unattended security updates" in its scope, at the maintainer's request. It surfaced while
drafting the records for the OS and the front: both drafts had assumed updates are applied as
released, and the maintainer asked why patching was not on a timeline of our own. It sits in M1 slice
4 because [what shape is the deployable?](what-shape-is-the-deployable.md) cannot be answered
without it.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**What each OS does by default.** On DigitalOcean's images, Debian 13, Ubuntu 24.04 and Ubuntu 26.04
boot with `unattended-upgrades` enabled and `APT::Periodic::Unattended-Upgrade "1"`; the RHEL family's
images do not install `dnf-automatic`. Nothing reboots by default on any of them. Ubuntu runs
`needrestart` after apt, in automatic mode, so it restarts services whose libraries changed; Debian 13
does not install it.

*Measured, 2026-10-03, on Droplets and on local VMs of each image, in the second and third passes of
the OS question, read with
`git show 6bf04f6:docs/questions/which-os-does-the-droplet-run.md`.*

**A repository added by hand is outside automatic updates until its origin is allowed.** That covers
the front from its vendor and Node from NodeSource. NodeSource's origin is `. nodistro`, so a pattern
on the release's codename misses it.

*Sourced by research agents on 2026-10-02, in the first pass of the OS question; not re-opened.*

**What an update costs the running system, measured on Debian 13 and Ubuntu:**

- **A reboot:** about 18 seconds on Debian 13 from `systemctl reboot` until SSH answered, 25 to 31 on
  Ubuntu. *Measured, 2026-10-03, three runs each, fourth pass of the OS question.*
- **The front's package upgrade under load:** Caddy refused connections for about a second each
  time; nginx and Angie upgraded in place, with 0 to 3 failures in about 14,000 requests. *Measured,
  2026-10-03, third pass of
  the front question, read with
  `git show 0b31753:docs/questions/what-sits-in-front-of-the-app-and-terminates-tls.md`.*
- **How often:** in the year to 2026-10-02 Debian 13 issued 16 kernel security advisories, plus kernel
  fixes in point releases. Caddy and nginx each shipped security fixes roughly monthly in 2026.
  *Measured from Debian's tracker, third pass of the OS question; the front counts are a research
  agent's.*

**Live kernel patching covers only critical and high kernel fixes**, on Ubuntu only, and glibc,
OpenSSL, systemd and microcode updates still need a reboot. Debian 13, the OS per
[ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md), has no live patching at all, so it
reboots for every kernel fix, and the question is only when.

*Sourced — <https://canonical.com/blog/mythbusting-the-scope-of-livepatch-protection>, opened
2026-10-03, third pass of the OS question.*
