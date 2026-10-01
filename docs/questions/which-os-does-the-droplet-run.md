---
opened: 2026-09-30
status: open
resolves_into: decision
---

# Which OS does the Droplet run?

## Why it matters

[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) puts the server on a
DigitalOcean Droplet, and
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) runs it as
systemd services with no container. So the operating system is what everything beneath the app is
installed, patched and supervised by. DigitalOcean offers several, and each record so far was
measured on Ubuntu 24.04 without anyone choosing it.

**What rests on it:**

- how security patches arrive, and whether a kernel fix needs a reboot;
- which package manager carries Node, Litestream and whatever sits in front of the app;
- how long a release is supported before a major upgrade;
- whether the Mac can run the same image locally.

Getting it wrong costs a rebuild of the machine and of the setup scripts. That cost grows once the
store holds data at M3.

**Environments:** production, and the production-like local run on the maintainer's Mac that
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
requires. That run does not exist yet; building it is M2's.

**It is answered together with what sits in front of the app.** The front is not chosen: the spikes
used Caddy, and [where does this run?](where-does-this-run.md) lists a record that Caddy is the front
as owed. Each constrains the other, since a front is only a candidate if this OS packages it, and an OS
is scored partly on whether it packages the front. So the two are scored side by side, per step 6 of
"Building a milestone's list" in [README.md](README.md), rather than this one assuming Caddy.

## What would settle it

Scoring each OS DigitalOcean offers against the properties below, from its vendor's documentation.
The one property that needs running, the local image on the Mac, is checked by booting it.

## Properties the answer is scored against

Derived from the moments the system touches the OS: provisioning a Droplet from cloud-init, a
security patch arriving, a kernel fix, a reboot, installing and upgrading Node, Litestream and the
front, the release's support ending, and the same setup run on the Mac.

1. **Security patches, the kernel's included, are applied without a recurring manual step, and most
   kernel fixes need no reboot.** Rests on property 14 of [where does this run?](where-does-this-run.md), and row 23 of its
   comparison table, read with `git show 11ac964:docs/questions/where-does-this-run.md`, and J1: a reboot is a brief outage.
2. **The same OS image can run on the maintainer's Mac from the same cloud-init**, whatever
   [how is the app run locally the way it runs deployed?](how-is-the-app-run-locally-the-way-it-runs-deployed.md)
   settles at M2. Rests on
   [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
   and L1.
3. **Node, Litestream and the front install from maintained packages that the automatic patching can
   cover.** Which front is scored alongside, as above. Rests on
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) and its
   property 3, that everything beneath the app is patched without a recurring manual step.
4. **The release is supported for years without a forced major upgrade.** Rests on "active attention
   for years after it" in [../problem.md](../problem.md), and on
   [ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md).
5. **The base system leaves most of the 1 GB machine to the app.** Rests on "Hosting — a
   DigitalOcean Droplet starts with no swap" in [../constraints.md](../constraints.md).
6. **The least for the maintainer to learn and keep in their head.** Rests on E3 in
   [where does this run?](where-does-this-run.md). What the maintainer already knows enters as the
   cost of learning the alternative, never as a merit, per the portable decision-making standard.

**Checked and found binding on nothing:**

- **systemd and cloud-init.** Every image DigitalOcean offers runs systemd, and DigitalOcean
  provisions each with cloud-init.
- **Price.** It is the same for every image.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Found on 2026-09-30 while drafting
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). The spikes
in [where does this run?](where-does-this-run.md) used `ubuntu-24-04-x64` by default. DigitalOcean's
image list, read with `doctl compute image list-distribution` that day, offers Ubuntu 22.04, 24.04
and 26.04, Debian 13, Fedora 43 and 44, Rocky Linux and AlmaLinux 8 to 10, and CentOS Stream 9 and
10.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

...
