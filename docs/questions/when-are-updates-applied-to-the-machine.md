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

Derived on 2026-10-03 from the moments an update touches the system: a fix is published, by Debian,
by Caddy's own repository, or by NodeSource if Node comes from the host; the package installs on the
running machine; a service restarts because of it; a reboot applies a kernel or C library fix; an
update fails or brings a regression; the machine is rebuilt from scratch; the production-like local
run updates; and the maintainer finds out what changed.

1. A security fix reaches the running system within a bounded time, scored as each option's
   exposure window (property 3 of
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)).
2. Patched on disk is patched in memory: a process using an updated library is restarted, or the
   machine rebooted (property 3 of
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md); Debian 13
   does not install `needrestart`, per the findings below).
3. One policy covers every source: Debian's packages, Caddy's repository, and Node if it comes from
   the host ([ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md),
   [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md)).
4. No step recurs by hand (property 3 of
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)).
5. A regression an update introduces can be traced to that update and undone (the Risk "no frozen
   image" in
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)).
6. Reboots and service restarts land at a time we choose, outside the hours players start sessions
   ("Where a player waits" in [../problem.md](../problem.md);
   [nobody can start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md)).
7. Players can see as few interruptions a year as possible: a reboot of about 18 seconds, and about
   a second of refused connections each time Caddy restarts (item 5 of "What success looks like" in
   [../problem.md](../problem.md); measured in the findings below).
8. The production-like local run updates the same way
   ([ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)).
9. A machine rebuilt from scratch comes up patched (host replacement in
   [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md),
   with property 3 of
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)).
10. Old kernels and the package cache do not fill the disk without bound (property 4 of
    [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)).
11. The maintainer has the least to configure and keep in mind over years ("clarity over
    cleverness" in [../problem.md](../problem.md); property 6 of
    [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)).

**Resources.** Memory may bind: an upgrade runs beside the app on a 1 GB machine with no swap, per
[../constraints.md](../constraints.md), and is measured rather than assumed. Disk binds through
property 10. CPU and network do not: an upgrade is occasional and small beside what the idle
measurements in [ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md) showed.

**Not weighed here:**

- **How long an outage may last** belongs to
  [how much downtime is acceptable?](how-much-downtime-is-acceptable.md) at M16. The answer here
  does not depend on it. A reboot takes about 18 seconds whatever the timing, so the options differ
  only in how many reboots there are, about 16 a year against at most 12, which is a few minutes a
  year either way. Any tolerance above a few minutes a year leaves the verdict unchanged, and a
  tolerance of zero planned outage fails every option, because one machine must reboot. A tolerance
  tighter than a few minutes a year would reopen this.
- **Being alerted when an update fails** belongs to
  [how is the server operated?](how-is-the-server-operated.md) at M11. Property 5 asks only that a
  failure can be traced to its update.

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

*Sourced — NodeSource's `Release` files for `node_24.x` and `node_26.x` at
`deb.nodesource.com/node_<line>.x/dists/nodistro/Release` both read `Origin: . nodistro` and
`Codename: nodistro`, fetched with curl on 2026-10-03. Debian 13's default `50unattended-upgrades`
allows only patterns with `origin=Debian`, per a research agent's reading of
`sources.debian.org/src/unattended-upgrades/trixie/data/50unattended-upgrades.Debian/` on
2026-10-03, not opened by me.*

**What an update costs the running system, measured on Debian 13 and Ubuntu:**

- **A reboot:** about 18 seconds on Debian 13 from `systemctl reboot` until SSH answered, 25 to 31 on
  Ubuntu. *Measured, 2026-10-03, three runs each, fourth pass of the OS question.*
- **The front's package upgrade under load:** Caddy refused connections for about a second each
  time; nginx and Angie upgraded in place, with 0 to 3 failures in about 14,000 requests. *Measured,
  2026-10-03, third pass of
  the front question, read with
  `git show 0b31753:docs/questions/what-sits-in-front-of-the-app-and-terminates-tls.md`.*
- **How often the kernel needs one:** in the year to 2026-10-02 Debian issued 16 security
  advisories for `linux` that name trixie, plus kernel fixes in point releases. *Counted on
  2026-10-03 from the security tracker's `data/DSA/list` on salsa.debian.org: 23 `linux` advisories
  in that window, 16 of them with a `[trixie]` line.*
- **How often Caddy needs one:** six Caddy versions in the year to 2026-10-02 carried security
  fixes: v2.11.1 on 2026-02-23, v2.11.2 on 2026-03-06, v2.11.3 on 2026-05-12, v2.11.4 on 2026-06-03,
  v2.11.5 (patching an advisory published 2026-07-10, with no release listed) and v2.11.6 on
  2026-10-01. That is about every two months, not monthly. *Read from the GitHub API's releases and
  security advisories for `caddyserver/caddy` on 2026-10-03. An earlier count of "roughly monthly",
  for Caddy and nginx, was a research agent's and is replaced by this one. nginx is not the front, so
  its rate is not recounted.*

**Ubuntu's Livepatch covers only critical and high kernel fixes**, and glibc, OpenSSL, systemd and
microcode updates still need a reboot. Debian 13, the OS per
[ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md), offers no live patching of its own, so
without a third-party service it reboots for every kernel fix.

*Sourced — <https://canonical.com/blog/mythbusting-the-scope-of-livepatch-protection>, opened
2026-10-03, third pass of the OS question. That page shows Livepatch's scope and cannot show what
Debian lacks; that Debian offers none of its own was found by a search on 2026-10-03, with no Debian
page opened.*

**A paid third-party service, TuxCare's KernelCare, may not cover Debian 13.** Its purchase page,
`tuxcare.com/buy/kce/`, lists "Debian 11,12" at "$5 per month, per system". A search summary said
its patch portal offers a "Debian 13" filter, but the portal renders by script and showed nothing
when fetched.

*Sourced for the purchase page by a research agent on 2026-10-03, not opened by me. Debian 13
support is unverified; only the vendor can settle it.*

### First research pass, 2026-10-03

Three research agents, one on Debian's update machinery, one on restarts and undoing an update, one
enumerating the field. What each source showed is below. The two claims marked refuted were the
agents' and were checked by me.

**When Debian 13 installs updates by default.** `apt-daily-upgrade.timer` in apt 3.0.3 runs at
`OnCalendar=*-*-* 6:00` with `RandomizedDelaySec=60m`, so updates install between 06:00 and 07:00
machine time every day. A drop-in can move it, and `Unattended-Upgrade::Update-Days` limits which
weekdays it acts. There is no hour window in `unattended-upgrades` itself.

*Sourced — `sources.debian.org/data/main/a/apt/3.0.3/debian/apt-daily-upgrade.timer`, fetched by me
on 2026-10-03; `Update-Days` from the 2.12 README, read by an agent.*

**A kernel install asks for a reboot, and nothing else does.** Debian 13's `unattended-upgrades`
installs `/etc/kernel/postinst.d/unattended-upgrades`, which touches `/var/run/reboot-required` on
every kernel install. With `Automatic-Reboot "true"`, the reboot runs `shutdown -r` at
`Automatic-Reboot-Time`, default `now`, and only when that file exists. An agent's claim that nothing
on Debian 13 creates the file is refuted. A `libc6` upgrade does not create it, and
`update-notifier-common`, which does on Ubuntu, is not in trixie.

*Sourced — the hook's text at
`sources.debian.org/data/main/u/unattended-upgrades/2.12/kernel/postinst.d/unattended-upgrades` and
its path in `packages.debian.org/trixie/all/unattended-upgrades/filelist`, both opened by me on
2026-10-03. `Automatic-Reboot-Time` read from the 2.12 source by an agent.*

**Old kernels are removed by default.** `unattended-upgrades` 2.12 reads
`Remove-Unused-Kernel-Packages` with a default of `True`. An agent's claim that kernels accumulate,
because the line is commented out of the shipped config, is refuted. The package cache is not
cleaned by default (`AutocleanInterval "0"` in apt's `apt.systemd.daily`), but
`unattended-upgrades` deletes the packages it installed itself (`Keep-Debs-After-Install` false).

*Sourced — line 2542 of `sources.debian.org/data/main/u/unattended-upgrades/2.12/unattended-upgrade`,
fetched by me on 2026-10-03. The cache defaults were read by an agent.*

**An upgraded service restarts itself; the app and what links the old C library do not.**
Debian's packaging restarts a packaged service after its upgrade by default, and Caddy's own
package runs `deb-systemd-invoke try-restart caddy.service` on upgrade. `libc6`'s postinst restarts
a fixed list of Debian services and none of ours. `needrestart` 3.11 is in trixie, and with
`$nrconf{restart} = 'a'` it restarts affected services after each apt run.

*Sourced by an agent on 2026-10-03, from `manpages.debian.org/trixie/debhelper/dh_installsystemd.1`,
`github.com/caddyserver/dist/.../postinstall.sh` on `master`, the `libc.postinst` of glibc
2.41-12+deb13u4, and needrestart 3.11-1's man page and example config. Not opened by me.*

**OpenSSL updates do not reach the app's process.** NodeSource's Node package does not depend on
`libssl`, and Node builds OpenSSL in statically unless configured with `--shared-openssl`. Caddy and
Litestream build with `CGO_ENABLED=0`. So `libc6` and the kernel are what a running process can be
left unpatched on.

*Reasoned by an agent from NodeSource's `Packages` index and the two projects' release configs, on
2026-10-03. Not opened by me.*

**What a failed update leaves to trace it by.** `/var/log/apt/history.log` and `/var/log/dpkg.log`
rotate monthly and keep 12; `/var/log/unattended-upgrades/` keeps 6.

*Sourced by an agent from the trixie logrotate files of apt 3.0.3, dpkg 1.22.22 and
unattended-upgrades 2.12. Not opened by me.*

**Ways to undo an update.** Install the previous version, which needs its package in the local cache
or from `snapshot.debian.org`; or restore a DigitalOcean backup, at 20% of the Droplet's price for
weekly. A restore erases the disk back to the backup, store included, so it is not an undo for one
package on a machine holding the store. Caddy's repository still lists 39 versions back to 2.5.1.

*Sourced by an agent from DigitalOcean's backup pricing and restore pages and Cloudsmith's
`Packages` index, 2026-10-03. Not opened by me.*

**APT 3.0 can pin a machine to a dated snapshot of Debian's archive, security included.** `apt -S
<timestamp>` or `APT::Snapshot` selects the archive as it stood then, for sources with `Snapshot:
enable`, the default. apt maps the `Debian-Security` label to `snapshot.debian.org/archive/debian-security/`.
Caddy's and NodeSource's repositories have no snapshot service, so a pin would not cover them. A
snapshot older than about twelve days needs its `Valid-Until` check ignored, which weakens apt's
protection against being served stale metadata.

*Sourced — the `apt-get(8)` trixie man page, fetched by me on 2026-10-03; the security mapping read
from apt 3.0.3's `apt-pkg/init.cc` by an agent; the `Valid-Until` caveat from snapshot.debian.org,
read by an agent. Not run on a machine.*

**A fresh Droplet probably comes up with the image's packages, not patched.** cloud-init's
`package_upgrade` defaults to false and Debian's `cloud.cfg` does not set it. Whether DigitalOcean's
image does, and whether cloud-init runs user-data on it, was not established.

*Sourced for cloud-init's default by an agent from `docs.cloud-init.io`; DigitalOcean's image
unverified.*

**The field, as enumerated.** Leave Debian's default; as released with an automatic reboot at a set
time; security as released and the rest later; a scheduled window that upgrades and reboots; pinning
production and the local run to one archive snapshot and advancing it deliberately; rebuilding the
Droplet from a freshly patched image; updating with each deploy; adding third-party live kernel
patching; a fleet tool such as Landscape, set aside because it is priced for many Ubuntu machines.
No source was found recommending updates tied to deploys on a single machine.

*Enumerated by an agent on 2026-10-03.*

**Properties an agent suggested the list misses, and where each went.** A way to pause automatic
updates is one command, `systemctl disable apt-daily-upgrade.timer`, under every option, so it
separates nothing. A rollback point before a window is a mechanism for property 5, not a property.
Trust in the update source, apt's check that metadata is current, separates only the snapshot option,
and is scored there under property 1.

### Spike, 2026-10-03

One run of each step below, on a local QEMU VM: Debian 13 `genericcloud` arm64 image, 1 vCPU, 1 GB,
kernel 6.12.111, booted with cloud-init and no package upgrade. A Python HTTP server ran as
`app.service` to stand in for the app. Older libc6, OpenSSL and kernel packages were installed from
`snapshot.debian.org` at 2026-04-15, so that a normal `unattended-upgrade` run had a kernel, libc6
and OpenSSL to upgrade, as a monthly window would. The VM was deleted afterwards. It is arm64 where the
Droplet is amd64, and nothing else but the stand-in was running.

- **A kernel install creates the marker, and the reboot lands when configured.** Installing a kernel
  created `/var/run/reboot-required` naming the kernel package. With `Automatic-Reboot "true"` and
  `Automatic-Reboot-Time` six minutes ahead, the run logged `Reboot scheduled for ... 01:14:00 UTC`
  and the machine rebooted at 01:14:00, back on the new kernel 15 seconds later.
- **`needrestart` set to restart automatically restarts the app directly.** After the OpenSSL and
  libc6 upgrades it ran `systemctl restart app.service ssh.service systemd-journald.service ...`. That
  is a plain restart of the live instance, outside the drain-then-switch deploy that property 1 of
  [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) rests on. It
  also restarted the unit wrapping the upgrade run, which ended that run with an error, though every
  package installed. Set to list only (`$nrconf{restart} = "l"`), the second run restarted nothing
  and the app's process kept its PID.
- **An upgrade run draws about 114 MB.** Running the real `apt-daily-upgrade.service` over libc6,
  OpenSSL and a kernel, `MemAvailable`, sampled every 0.2 seconds, fell from 751 MB to a low of 637
  MB. The service's cgroup `memory.peak` read 449 MB, most of it page cache. Against the 373 MB the
  app, Caddy and Litestream used together on a real Droplet, per
  [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md), that leaves
  about 470 MB. Memory does not bind.
- **A snapshot pin works with the image's `mirror+file` sources, security included, for about six
  days.** `apt-get -S <timestamp> update` fetched both `debian` and `debian-security` from
  `snapshot.debian.org`. Pins 4 days old were accepted. Pins 7 and 49 days old were refused as
  expired, `Release file ... is expired (invalid since 1d 4h ...)`, unless `Check-Valid-Until` was
  turned off.

*Measured, 2026-10-03, one run each, by me.*

### Scoring, first pass, 2026-10-03

Each option as the field enumerated it. It is assumed that a reboot follows any run that leaves a
process on an old library, found with `needrestart -b`, since that is the only way to meet property 2
without restarting the app outside a deploy. Where that assumption applies, the option is scored with
it.

| | 1 window | 2 memory | 3 sources | 4 no manual step | 5 trace, undo | 6 when | 7 how many | 8 local | 9 rebuilt | 10 disk | 11 to keep in mind |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Debian's default | unbounded for the kernel, never rebooted | **fails** | **fails**, Caddy not covered | yes | a day's batch | 06:00 to 07:00 UTC, not chosen | none, by never rebooting | yes | same for all | yes | least |
| As released, at an hour we set | about a day | yes | yes | yes | a day's batch | yes | about 20 reboots and 6 Caddy restarts a year, at that hour | yes | same for all | yes | a timer drop-in, reboot settings, two origin lines |
| Security as released, the rest on a schedule | about a day for security | yes | partly: Caddy's repository has no security label | yes | small batches | yes | about the same as above | yes | same for all | yes | the above plus a second schedule |
| A weekly or monthly window | up to 7 or 30 days | yes | yes | yes | a week's or month's batch | yes | at most 52 or 12 | yes | same for all | yes | the same as as-released |
| A snapshot pin, advanced by hand | as often as advanced | yes | **fails**, no snapshot of Caddy's or NodeSource's repository | **fails**, each advance is by hand | one advance's batch | yes | as advanced | identical sets | same for all | yes | the most |
| Rebuild from a patched image | until the next rebuild | yes | yes | **fails**, a rebuild needs a token [ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md) keeps out of standing use | an image's batch | yes | per rebuild | yes | yes | yes | Packer and images |
| With each deploy | **fails**, unbounded when nothing is deployed | yes | yes | yes | mixed with code | **fails**, whenever a deploy runs | per deploy | yes | same for all | yes | the deploy script grows |

Third-party live kernel patching is not a way of timing updates. It would shorten property 1 for
kernel fixes under any option, and its support for Debian 13 is unverified, above.

**Survivors:** as released at an hour we set, security as released with the rest on a schedule, and
a weekly or monthly window. Properties 9 and 10 separate nothing: a rebuilt machine is upgraded by
its setup under every option, and old kernels are removed by default under every option.

### Second pass, 2026-10-03

**Zoom into property 7.** An interruption players can see is one during the hours they start
sessions. All three survivors put the reboot and the Caddy restart at an hour we choose, so the count
matters only if that hour has players in it, and solving continues through it either way, per
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md). The difference in count,
about 20 a year against 12, is reboots of about 18 seconds at an hour chosen to be quiet. It
separates the survivors by a few minutes a year when few players are starting sessions.

**Zoom into property 1.** For a critical kernel fix, a monthly window leaves the machine exposed for
up to 30 days, or makes the maintainer reboot it by hand between windows, which property 4 forbids
as a recurring step. A weekly window is up to 7 days. As released is about a day.

**Extend: an update fails.** A failed daily run is retried the next day. A failed window waits a
week or a month. Property 5 is the nearest row, and it separates the same way.

**Extend: the Caddy repository under the mixed option.** The repository publishes one stream with
no security label, so the mixed option has to put Caddy in one bucket or the other. Either way it is
one of the other two options for the front, with a second schedule to keep.

**Verdict.** As released, at an hour we set, is the only survivor that meets property 1 at its best
without a manual step. What it gives up against a monthly window is about eight more reboots a year,
each at the chosen hour. That is the tradeoff, and it is a property 7 row that the zoom shows to be
small. Physics does not force it: a reboot of the one machine is needed per kernel fix that is
applied, and applying fewer means waiting longer.
