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

**It is answered together with what sits in front of the app.** The front is not chosen. The spikes
used Caddy, and [what sits in front of the app and terminates TLS?](what-sits-in-front-of-the-app-and-terminates-tls.md)
is where it is chosen. Each constrains the other, since a front is only a candidate if this OS
packages it, and an OS is scored partly on whether it packages the front. So the two are scored side
by side, per step 6 of "Building a milestone's list" in [README.md](README.md), rather than this one
assuming Caddy.

## What would settle it

Scoring each OS DigitalOcean offers against the properties below, from its vendor's documentation.
The one property that needs running, the local image on the Mac, is checked by booting it.

## Properties the answer is scored against

Derived from the moments the system touches the OS: provisioning a Droplet from cloud-init, a
security patch arriving, a kernel fix, a reboot, installing and upgrading Node, Litestream and the
front, the release's support ending, and the same setup run on the Mac.

1. **Security patches, the kernel's included, are applied without a recurring manual step, and most
   kernel fixes need no reboot.** Rests on property 3 of
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md), that
   everything beneath the app is patched without a recurring manual step. The reboot half rests on its
   property 1, a deploy fails no request, read with
   [the player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md):
   a reboot of the one machine is an outage for as long as it takes, and during it
   [nobody can start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md).
2. **The same OS image can run on the maintainer's Mac, provisioned by the same cloud-init**,
   whatever
   [how is the app run locally the way it runs deployed?](how-is-the-app-run-locally-the-way-it-runs-deployed.md)
   settles at M2. Rests on
   [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
   and property 5 of
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). This
   includes the Droplet image itself consuming cloud-init user data on first boot, which DigitalOcean
   documents only for some images, per **Findings**.
3. **Node, Litestream and the front install from maintained packages that the automatic patching can
   cover.** Which front is scored alongside, at
   [what sits in front of the app and terminates TLS?](what-sits-in-front-of-the-app-and-terminates-tls.md). Rests on
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) and its
   property 3, that everything beneath the app is patched without a recurring manual step.
4. **The release is supported for years without a forced major upgrade.** Rests on "active attention
   for years after it" in [../problem.md](../problem.md), and on
   [ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md).
5. **The base system leaves most of the 1 GB machine to the app.** Rests on "Hosting — a
   DigitalOcean Droplet starts with no swap" in [../constraints.md](../constraints.md).
6. **The least for the maintainer to learn and keep in their head.** Rests on property 6 of
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md), the least
   to build, understand and keep working, weighed across years. What the maintainer already knows enters as the
   cost of learning the alternative, never as a merit, per the portable decision-making standard.
7. **It just works: it has a long record of rare bugs and regressions, in the OS and in its updates,
   so keeping it running needs no troubleshooting.** Secondarily, nothing about it asks for the
   maintainer's attention between the major upgrades property 4 allows. What an OS bundles counts
   only where it makes compatibility problems less likely, such as Node, Litestream or the front
   being packaged and tested for it. Rests on the maintainer's statement on 2026-10-02 that this
   matters to them above what the OS bundles, and on "it just works", the aim recorded in
   [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md).

**Checked and found binding on nothing:**

- **systemd.** Every distribution DigitalOcean offers uses systemd as its init system in the
  releases listed under **Source**. *Reasoned — from each distribution's known init system; not
  re-opened per distribution.*
- **Price.** DigitalOcean's Droplet pricing page prices vCPU, memory, disk and transfer, and names no
  image. *Reasoned — from <https://docs.digitalocean.com/products/droplets/details/pricing/>, opened
  by me on 2026-10-02. The page does not state that every image costs the same; it only prices
  nothing by image.*

cloud-init was listed here until 2026-10-02, as provisioned on every image. That claim had no
source, and the one source found names only some images, so it moved into property 2 and
**Findings**.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Found on 2026-09-30 while drafting
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). The spikes
in where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`) used `ubuntu-24-04-x64` by default. DigitalOcean's
image list, read with `doctl compute image list-distribution` that day, offers Ubuntu 22.04, 24.04
and 26.04, Debian 13, Fedora 43 and 44, Rocky Linux and AlmaLinux 8 to 10, and CentOS Stream 9 and
10.

## Options

*Scored in the first pass, 2026-10-02, under **Findings**.*

**Still standing after the second pass:** Ubuntu 24.04, Ubuntu 26.04, Debian 13, and Rocky and
AlmaLinux 9 and 10.

**Out, each on the one property it fails:**

- **Fedora 43 and 44** fail property 4: Fedora 43's support ends 2026-12-09 and Fedora 44's on
  2027-06-02. *Sourced by a research agent from endoflife.date, 2026-10-02.* Reverses only if Fedora
  lengthened its lifecycle.
- **CentOS Stream 9** fails property 4: support ends 2027-05-31. *Same source.*
- **Ubuntu 22.04** fails property 4: standard support ends in May 2027, so a forced major upgrade
  comes within the first year. *Same source.* Reverses if Ubuntu Pro's extended support were counted
  as standard support.
- **Rocky and AlmaLinux 8** fail property 4: active support ended in 2024 and security support ends
  2029-05-31. *Same source.*
- **CentOS Stream 10** fails property 7: it "tracks just ahead of Red Hat Enterprise Linux (RHEL)
  development", so it receives changes before the stable product does. *Sourced —
  <https://www.centos.org/centos-stream/>, opened by me on 2026-10-02.* Reverses only if CentOS Stream
  stopped running ahead of RHEL.
- **Alpine** fails [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md),
  which runs the app as systemd services: Alpine uses OpenRC. **Flatcar and Fedora CoreOS** fail it
  too, being built to run containers with no package manager for the host. *Sourced by a research
  agent, 2026-10-02.*

**Not scored yet:** custom images DigitalOcean can boot, of which NixOS, Arch, openSUSE Leap and
Gentoo use systemd. A research agent reported that custom images lose IPv6 and DigitalOcean's
monitoring agent, which [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)
needs for the traffic alert. That was not opened by me, so none is eliminated on it yet.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**DigitalOcean documents cloud-init only on its Ubuntu and CentOS images.** Its user-data page says
"cloud-init is available on DigitalOcean's latest Ubuntu and CentOS images", and that on an image
without it "the user data is not consumed automatically on first boot." The page may lag the image
list, but nothing found says the other images run cloud-init. So property 2 may separate the
candidates, and for Debian, Fedora, Rocky and AlmaLinux it is unknown rather than a pass.

*Sourced — <https://docs.digitalocean.com/products/droplets/how-to/provide-user-data/>, opened by me
on 2026-10-02.*

**The image list under Source still holds.** DigitalOcean's images page lists the same seventeen
slugs, the three GPU images included, which are not candidates here.

*Sourced — <https://docs.digitalocean.com/products/droplets/details/images/>, opened by me on
2026-10-02. `doctl` could not re-read it, because no DigitalOcean token is held, per
[ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md).*

**Every Droplet fact and script so far is Ubuntu 24.04's.** The spikes created `ubuntu-24-04-x64`
Droplets because it was the default, so choosing another OS means measuring those again: memory with
nothing installed, the package steps, and the deploy.

*Measured, 2026-09-30, in the twelfth pass of the hosting question, read with
`git show ed7f54e:docs/questions/where-does-this-run.md`. Before anything was installed: 961 MB total, about 320 MB used, no swap, kernel
`6.8.0-142-generic`, and `pro status` reporting Livepatch as available.*

**Livepatch is free for up to five machines for personal use, and "is not a replacement for
rebooting".** So on Ubuntu some kernel fixes still need a reboot at a set hour.

*Sourced by a research agent on 2026-09-30, in the ninth pass, same source. Not re-opened.*

**Multipass, the VM the hosting question used for the Mac, takes the same cloud-init user data as
the Droplet**: its `--cloud-init` option accepts "Path or URL to a user-data cloud-init
configuration". Multipass runs Ubuntu images, so for any other OS property 2 needs a different VM,
which is unscored.

*The quote is sourced by a research agent on 2026-09-30, in the ninth pass, same source, not
re-opened. That Multipass runs only Ubuntu images is unverified, no source recorded.*

**A runbook of every setup step is owed once the OS and the front are chosen**, in
[../runbooks/](../runbooks/). It is written then because the spike scripts it draws on assume Ubuntu
24.04. Those scripts, and the steps confirmed while running them, are in the twelfth pass, same
source.

**On Ubuntu, a package repository added by hand is not patched automatically until its origin is
allowed.** "Just adding another package repository to an Ubuntu system WILL NOT make
`unattended-upgrades` consider it for updates!" So property 3 is met for Node, Litestream or the
front from a third-party repository only once that repository's origin is added to the allowed list.

*Quoted in the tenth pass of the hosting question, read with
`git show ed7f54e:docs/questions/where-does-this-run.md`, from a research agent's reading on
2026-09-30. No URL is recorded beside it, and it was not re-opened.*

### First pass 2026-10-02: every DigitalOcean image against properties 1 to 7

*Four research agents read vendor pages on 2026-10-02, each assigned properties rather than
candidates; their full reports were working files and are summarised here. "Opened by me" marks what
the session that wrote this pass fetched itself.*

**dnf can be killed for lack of memory on a 1 GB machine with no swap.** Fedora's own notice says "DNF
operations fail (due to being killed by the kernel's out-of-memory handler) in low-memory
environments, especially systems or containers with 1GB or less of memory and no swap space", for
Fedora 35 to 40. The Droplet has no swap, per [../constraints.md](../constraints.md). An agent found
the same reported on Rocky 9 and AlmaLinux 9 with EPEL, and a Rocky moderator stating "Both Rocky8 and
Rocky9 have a minimum memory requirement of 1.5GB" for cloud images. So on the RHEL family the
automatic patching that property 1 needs may fail on this machine unless swap is added, which
property 5 weighs. Ubuntu and Debian use apt, and no equivalent was searched for.

*Sourced — <https://discussion.fedoraproject.org/t/dnf-operations-use-large-amount-of-ram-and-may-fail-in-low-memory-environments/76389>,
opened by me on 2026-10-02. The Rocky and AlmaLinux reports are a research agent's, not re-opened.*

**Free live kernel patching was found only on Ubuntu.** Canonical: "Livepatch is available free for up
to 5 machines, for personal use, or evaluation purposes", and "Canonical Livepatch is not a
replacement for rebooting." An agent found no free live patching for Rocky, only a third-party feed
with unclear terms for AlmaLinux, and nothing for Debian. Whether a portfolio project counts as
personal use is not stated.

*Sourced — <https://ubuntu.com/security/livepatch>, opened by me on 2026-10-02. The other
distributions are a research agent's reading.*

**Support windows**, from endoflife.date as read by an agent: Ubuntu 24.04 standard support to May
2029, Ubuntu 26.04 to May 2031, Debian 13 security support to August 2028 and LTS to June 2030, Rocky
and AlmaLinux 9 to 2032-05-31 and 10 to 2035-05-31, CentOS Stream 10 to 2030 (one tracker says
January, another May).

*Sourced by a research agent, 2026-10-02, from a secondary aggregator. Not re-opened.*

**Traps found, each a cost of the candidate it names rather than an elimination:**

- **Ubuntu 24.04 and 26.04 restart services after updates by default.** `needrestart`, run by
  `unattended-upgrades`, restarts affected services, which includes the app, Litestream and the
  front. Each such restart is a deploy the switch did not run.
- **Nothing reboots by default.** Neither `unattended-upgrades` nor `dnf-automatic` reboots, so a
  kernel fix Livepatch cannot apply waits until something schedules a reboot.
- **A hand-added repository is outside automatic patching on every candidate.** On Ubuntu and Debian
  its origin must be allowed, and NodeSource's origin is `. nodistro`, so a pattern matching the
  release's codename misses it. On the RHEL family, `dnf-automatic` set to security updates only
  skips NodeSource, nginx.org and the Caddy COPR, because none publishes the metadata it reads.
- **Debian 13's own packages of the front and Node are too old.** Its Caddy is 2.6.2 and its Node is
  20, past its end of life; Caddy's Cloudsmith repository and NodeSource serve current ones.
- **The RHEL family's 10 releases need an x86-64-v3 CPU**, unchecked on DigitalOcean's smallest plan.
- **Ubuntu 26.04 is five months old** and ships Rust rewrites of coreutils and sudo, which bears on
  property 7.
- **DigitalOcean retires an image when standard support ends**, not when extended support does.

*Sourced by research agents, 2026-10-02. Not re-opened by me.*

**What reading could not settle, and only booting can:**

- **Property 2:** whether DigitalOcean's Debian and RHEL-family images run cloud-init on first boot.
  DigitalOcean's page, updated 2026-09-23, still names only Ubuntu and CentOS. No local VM was found
  that boots DigitalOcean's own image: Lima writes its own user data, Multipass's support for other
  distributions on macOS is unconfirmed, and UTM or QEMU with a seed image is likely but untested.
- **Property 5:** no candidate's memory with nothing installed was found from a usable source.
- **Property 7:** no measured rate of regressions exists for any candidate. What was found is each
  distribution's update policy and a handful of incidents, several of them anecdotal.

**The first pass leaves five candidates standing and three cells unknown on every one of them**, so
it is not finished. The next pass zooms into property 7 and resolves properties 2 and 5 by booting
each survivor on a Droplet.

### Second pass 2026-10-03: booting every survivor, and property 7 zoomed

**Booted on DigitalOcean.** One `s-1vcpu-1gb` Droplet in `tor1` per surviving image, created at
01:00 UTC on 2026-10-03 from the `puzzles-experiments` team, given a `#cloud-config` that wrote a file
and ran a command, and deleted at 01:14 UTC. Each was read over SSH. Then each ran a real upgrade
with its package manager, `apt-get upgrade` or `dnf upgrade --refresh`, while the lowest available
memory was sampled every 0.2 seconds. One run per image.

**Property 2: cloud-init ran on every image.** On all eight, `cloud-init status --long` reported
`done` from `DataSourceConfigDrive`, and both the file and the command's output were present. CentOS
Stream 10 reported `degraded done` over a missing module that nothing used. So DigitalOcean's page
naming only Ubuntu and CentOS is out of date, and property 2's Droplet half passes everywhere. Its
Mac half is unchanged: only Ubuntu has a sourced route, Multipass.

**Property 5: memory.** After the upgrade, with the page cache dropped:

- Debian 13: 188 MB used, 778 MB available, 13 services running.
- Ubuntu 24.04: 234 MB used, 726 MB available, 19 services.
- AlmaLinux 9: 236 MB used, 720 MB available, 18 services.
- AlmaLinux 10: 273 MB used, 680 MB available, 19 services.
- Ubuntu 26.04: 364 MB used, 592 MB available, 20 services.
- Rocky 10: 198 MB used, 564 MB available, 17 services.
- Rocky 9: 232 MB used, 532 MB available, 17 services.

**Rocky reserves 192 MB for a crash kernel.** Its kernel command line carries
`crashkernel=1G-4G:192M,...` and `kdump` is enabled, so a Rocky Droplet starts with about 765 MB rather
than about 960. AlmaLinux 9 and 10 do not reserve it. The reservation can be removed, which is a
setup step the others do not need.

**No package manager was killed for lack of memory**, and the kernel logged no out-of-memory event on
any of them. The lowest available memory during the upgrade was 166 MB on Rocky 9 and 167 MB on
Rocky 10, 345 MB on CentOS Stream 10, about 460 MB on AlmaLinux, and 506 to 635 MB on Ubuntu and
Debian. The app, Litestream and the front were not running, and the spikes measured them at about
200 MB together, so on Rocky that headroom would be gone. The apt runs were lighter than the dnf ones:
`unattended-upgrades` had already applied most updates during boot on Ubuntu and Debian, so they took
24 to 47 seconds against 215 to 471 for dnf, which upgraded the kernel.

**Property 1: automatic updates by default.** Ubuntu 24.04, Ubuntu 26.04 and Debian 13 boot with
`unattended-upgrades` enabled and running, and `APT::Periodic::Unattended-Upgrade "1"`. Every RHEL-family
image boots with only `dnf-makecache.timer`; `dnf-automatic` is not installed. `pro status` on both
Ubuntu Droplets lists Livepatch as available, on kernels `6.8.0-142-generic` and `7.0.0-31-generic`.

**The RHEL family's 10 releases boot on this plan.** Every Droplet's CPU reported `avx2`, `bmi2`, `fma`
and `movbe`, which x86-64-v3 needs.

*Measured, 2026-10-03, as above. One run per image; memory read once after the upgrade.*

**Property 7, zoomed into update policy, regressions shipped, and maturity**, by a research agent on
2026-10-03. Searches were shallow, so the counts are lower bounds, and Ubuntu's are the most findable
because Launchpad tags regressions.

- **Policy within a release.** Debian's stable updates carry security fixes and serious problems only.
  Ubuntu's carry bug and security fixes and also move to newer kernels through its hardware-enablement
  series. The RHEL family keeps one kernel base per major release and backports selected features at
  each minor release.
- **Regressions found, 2023 to 2026.** Two for Ubuntu 24.04, on encrypted boot and network boot. None
  confirmed for Debian 13, Rocky and AlmaLinux 9 and 10, or Ubuntu 26.04. Debian's kernel can still
  ship one: [bug #1057843](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=1057843), "ext4 data
  corruption in 6.1.64-1", reported 2023-12-09 against Debian 12 and fixed in 6.1.66-1, reached the
  archive, where automatic updates could install it.
- **Maturity.** Ubuntu 26.04 was released 2026-04-23 and has had one point release. Debian 13 has had
  seven since 2025-08-09. Rocky and AlmaLinux 9 have had eight, and 10 has had two.
- **Rebuild lag.** Rocky states security updates follow RHEL's within 24 to 48 hours; no independent
  measurement was found, and none for AlmaLinux, which since 2023 aims to be compatible with RHEL
  rather than identical to it.

*The Debian bug was opened by me on 2026-10-03; the rest is a research agent's reading the same day,
not re-opened.*

**What still separates the survivors** is the reboot half of property 1. Only Ubuntu has free live
kernel patching, and only "for personal use", so on Debian, Rocky and AlmaLinux every kernel fix waits
for a reboot. Whether this project counts as personal use is not established.

### Third pass 2026-10-03: reboots, restarts the updates make, and the Mac

**Livepatch covers only the most serious kernel fixes, so every candidate needs scheduled reboots.**
Canonical: "Canonical Livepatch patches kernel vulnerabilities with critical and high Common
Vulnerability Scoring System (CVSS) and Ubuntu Priority ratings", and microcode, glibc, OpenSSL,
systemd and dbus updates still need a reboot. Its notice feed lists 7 Livepatch notices covering
Ubuntu 24.04 since 2025-10-01, and one covering 26.04. So Livepatch lets Ubuntu put off a reboot for
the most serious kernel fixes. It does not remove reboots, which weakens the reboot half of property 1
as a separator.

*Sourced — <https://canonical.com/blog/mythbusting-the-scope-of-livepatch-protection> and
<https://ubuntu.com/security/notices.json?details=LSN-&limit=20&order=newest>, opened by me on
2026-10-03.*

**Livepatch's free tier is limited by machine count, not by kind of use.** Canonical's personal terms
grant a "free subscription to use the Service on up to five physical Ubuntu systems with unlimited
number of VMs or containers", and its FAQ says "Ubuntu Pro is free for personal use. It offers the
full suite of Ubuntu Pro capabilities for you – and any business you own – on up to 5 physical
machines". So paying subscribers would not by themselves end it. Two things are not settled: how a
cloud VM such as a Droplet counts against "physical" systems, and a search summary's report of a
"non-commercial" line on the terms page, which the page as fetched did not show. Canonical may change
the terms.

*Sourced — <https://canonical.com/legal/ubuntu-pro/personal> and
<https://discourse.ubuntu.com/t/ubuntu-pro-faq/34042>, opened by me on 2026-10-03 through a tool that
summarises pages.*

**The RHEL family needs about three times the kernel reboots.** Since 2025-10-01, AlmaLinux issued 62
advisories for its 9 kernel, about one a week. Debian issued 16 security advisories for its trixie
kernel. Debian also ships some kernel fixes in point releases, which are not advisories, so its count
of kernel updates is somewhat higher than 16. A research agent counted 20 kernel notices for Ubuntu
24.04, and 57 and 60 for Rocky 9 and 10. Each new kernel takes effect only after a reboot, and each
reboot of the one machine means
[nobody can start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md) while it lasts.

*Measured, 2026-10-03, from <https://errata.almalinux.org/9/errata.full.json>, counting advisories
that update the `kernel` package, and from the Debian security tracker's `data/DSA/list`, counting
`linux` advisories with a trixie fix. The Ubuntu and Rocky counts are a research agent's, from
their feeds, not re-counted.*

**Ubuntu restarts services after automatic updates; nothing else does.** Ubuntu 24.04 and 26.04 ship
`needrestart` hooked into apt, and their config says "the default restart mode when running as part of
the APT hook is 'a'", meaning automatic. So an update to a library the app, Litestream or the front
uses restarts that service outside any deploy, which property 1 of
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) forbids
unless the restart drains first. Setting `$nrconf{restart} = 'l'` makes it list instead. Debian 13's
image does not install `needrestart`. The RHEL family's images do not install `dnf-automatic`, which
restarts nothing.

**The RHEL family's images run SELinux in enforcing mode; Ubuntu's and Debian's run AppArmor.** A
research agent found that under SELinux a front such as nginx or Caddy is refused a connection to a
local port not labelled for HTTP, such as the app's, until `httpd_can_network_connect` is set, and that
Caddy's RPM ships some policy of its own. No such default refusal was found for AppArmor.

*SELinux and AppArmor modes, `needrestart` and `dnf-automatic` were measured on the local VMs below,
and `needrestart`'s default read from its config there; the SELinux denial and its fix are a research
agent's reading on 2026-10-03, not re-opened.*

**Property 2's Mac half passes for every candidate.** Each candidate's own arm64 cloud image booted
under QEMU 11.1.2 on the maintainer's Apple Silicon Mac, with the same `#cloud-config` as the Droplets
on a NoCloud seed disk, plus the SSH key the Droplets got from DigitalOcean. All seven reported
`status: done` from `DataSourceNoCloud` and wrote both files. So Multipass is not needed, and this
property separates nobody. QEMU was used here only to check this property; what the local run uses
is [how is the app run locally the way it runs deployed?](how-is-the-app-run-locally-the-way-it-runs-deployed.md).

*Measured, 2026-10-03, one boot per image.*

**Finding help, and what employers recognise**, from a research agent on 2026-10-03, not re-opened:
unix.stackexchange.com has 16,089 questions tagged debian and 13,581 tagged ubuntu, against 44 for
rocky-linux and no almalinux tag. Rocky's and AlmaLinux's forums had 18 and 16 new topics in the last
30 days, against 295 on Ubuntu's. A job board's postings for the second quarter of 2026 named Ubuntu
in 5.5%, Debian in 2.1% and RHEL in 2.1%, though most postings named no distribution.

**Ubuntu Pro's free tier extends Ubuntu 24.04's security support to May 2034.** Ubuntu's release
cycle lists standard security maintenance to "May 2029" and Expanded Security Maintenance to "May
2034", covering both the main and universe repositories. That is the same free subscription as
Livepatch, with the same open points about its terms. It puts 24.04 level with or past the RHEL
family's 9 releases (2032), one year short of its 10 releases (2035), and past Debian 13's long-term
support (June 2030).

*Sourced — <https://ubuntu.com/about/release-cycle>, opened by me on 2026-10-03.*

**Where the third pass leaves the field.** The RHEL family's one strength was property 4, support to
2032 and 2035, which Ubuntu 24.04 now roughly matches under Ubuntu Pro. Against it are about three times the reboots on property 1, SELinux denials to set
right on property 7, and far less help to find. Ubuntu 26.04 sits beside 24.04 with less memory free,
one point release in the field, and the same automatic restarts. What separates Ubuntu 24.04 from
Debian 13 is Livepatch and the larger community on Ubuntu's side, against more memory free, no
automatic restarts and a stricter update policy on Debian's.

