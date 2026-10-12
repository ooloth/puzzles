---
opened: 2026-10-12
status: open
resolves_into: decision
---

# What detects a process left running on a replaced library?

## Why it matters

[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
reboots the machine at the chosen hour for two triggers: a kernel install, or "any process left
running on a replaced library". Debian 13 marks only the first. Per "Debian 13 updates itself on its
own clock" in [../constraints.md](../constraints.md), only a kernel install creates
`/var/run/reboot-required`, and nothing notices a process still using a replaced `libc6` unless
something like `needrestart` is installed. That record's **Enforced by** names the timers and the apt
configuration and nothing that detects the second trigger, so M1 slice 4, which makes that record
true, would otherwise pick a detector by default or build only the first trigger.

Without a detector, a fix to a shared library is on disk within a day and in memory only at the next
kernel reboot, which fails property 1 of that record. The same record forbids restarting a service
for a library, because a restart of the app's unit bypasses the deploy's drain-then-switch, so
whatever detects it feeds the reboot rather than restarting anything.

**Environments:** production, and the production-like local run, which carries the same update
configuration per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
and [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).

## What would settle it

A run on the local Debian 13 VM in which each candidate is shown a process using a replaced library
and a process running a replaced executable, and either reports both to the reboot or does not.

## Properties the answer is scored against

Derived on 2026-10-12, before any option was researched. It is worked with
[is Node installed on the host or carried in each
release?](is-node-installed-on-the-host-or-carried-in-each-release.md), which shares the moment apt
replaces a program under a running process, and with
[at what hour does the machine apply updates and reboot?](at-what-hour-does-the-machine-apply-updates-and-reboot.md),
which shares the reboot.

The moments are: the daily run at the chosen hour replacing a shared library such as `libc6` or
`libstdc++6` that running services use; the same run replacing an executable a running service runs,
such as `/usr/bin/node` if Node comes from NodeSource; the far more common run that replaces nothing
a running process uses; the reboot at the hour that the detector feeds; the boot after it; a deploy
starting a new instance, which loads whatever is on disk then; the maintainer's own shell left open
across a run; the detector itself failing, being updated, or being removed by a package change; the
machine rebuilt from cloud-init; the production-like local run on arm64 carrying the same
configuration; the move to Debian 14 before mid-2030; and the maintainer asking afterwards why the
machine rebooted, or did not.

**Ways a bad answer fails.** *Safety:* a process keeps running replaced code, library or executable,
and nothing notices; a service is restarted directly, bypassing the deploy's drain-then-switch; the
detector fails and the machine looks patched; it adds a package with root that nobody maintains.
*Performance:* the machine reboots when nothing needed it, each reboot an outage of about 18 seconds;
a reboot lands outside the hour; the scan holds memory the app needs. *Experience:* the maintainer
cannot tell why the machine rebooted; the configuration differs between the Droplet and the local
VM, or is lost on a rebuild; it stops working at the move to Debian 14 and nobody notices.

**Safety**

1. A process running a replaced executable is caught, as well as one using a replaced shared
   library. Property 2 of
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md):
   patched on disk is patched in memory. The case that raised it is Node from NodeSource, where an
   upgrade replaces `/usr/bin/node` under the running app; if a candidate fails this row, this
   question and the Node question depend on each other and are worked together.
2. A process using a replaced shared library is caught, whichever service runs it. The second
   reboot trigger in the Decision of
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
3. No service is restarted; what is found feeds the reboot at the hour and nothing else. The
   Decision of [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md),
   because a restart of the app's unit bypasses the drain-then-switch that property 1 of
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) rests on.
4. A fix is in memory within about a day of its install. Property 1 of
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
5. Each run leaves a record on the machine of what it found and what it decided, and a detector that
   fails to run leaves one too. From
   [a security update fails and nobody knows](../failure-modes/a-security-update-fails-and-nobody-knows.md)
   and property 5 of [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
   Being told of it is deferred, below.
6. Whatever it installs comes from Debian 13's archive, or from a repository meeting
   [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md),
   and its publisher is maintained in proportion to what replacing it costs, per
   [ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md).

**Performance**

7. The machine reboots only when a running process is on replaced code. Property 7 of
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md),
   as few interruptions a year as possible, each about 18 seconds per
   [ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md).
8. The reboot it triggers lands at the chosen hour. Property 6 of
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
9. Nothing it runs holds memory the app needs. The machine has no swap, per "Hosting — a
   DigitalOcean Droplet starts with no swap" in [../constraints.md](../constraints.md) and property 2
   of [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md).

**Experience**

10. The production-like local run, on arm64, carries the same configuration and behaves the same.
    [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
    property 8 of [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
11. A rebuilt machine has it with no step by hand. Property 9 of
    [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md),
    [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md).
12. The maintainer can see in one place why the machine rebooted or did not, and which process
    caused it. Property 11 of
    [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md).
13. The least to configure and keep in mind over years, including the move to Debian 14 before
    mid-2030. Property 11 of
    [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md),
    and what [ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md) commits us to.

14. The machine carries nothing it does not need. Added in the second pass, 2026-10-12, from the
    maximum safety in
    [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) and
    property 2 of
    [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md).

**Resources.** Memory binds, in property 9, and is measured rather than assumed when candidates are
run. CPU does not bind: a scan of a few dozen processes once a day is small beside serving requests,
which is reasoned, not measured. Storage binds only through what property 5 writes, which journald
bounds. Network does not bind: nothing here fetches anything beyond the package itself.

**Checked and binding on nothing.** Cost: every candidate named so far is free, against
[ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md). The
firewall: nothing here listens, against
[ADR-0057](../decisions/0057-ssh-accepts-only-keys-and-a-firewall-on-the-machine-admits-only-ssh-http-and-https.md).

**Owed elsewhere.** A reboot at the hour landing while a deploy is switching instances is a property
of the reboot and the switch, not of what triggers the reboot, and belongs to
[how does a deploy switch between versions?](how-does-a-deploy-switch-between-versions.md).

**Deferred.** Being alerted when the detector fails, or when a reboot it asked for did not happen,
is [how is the server operated?](how-is-the-server-operated.md) at M11, as for a failed update run.
Property 5 keeps the record that alerting would read.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-10-12 while checking the claims in
[is Node installed on the host or carried in each
release?](is-node-installed-on-the-host-or-carried-in-each-release.md), whose host candidate depends
on it. Ordered ahead of that question on the same day, because it is cheaper to undo and the Node
question is an input only through property 1 above. Four mechanisms were named in passing and none
was researched: `needrestart` in list mode, `checkrestart` from `debian-goodies`, a script reading
`/proc/*/maps` for deleted files, and an unconditional daily reboot.

## Options

Enumerated on 2026-10-12 by a research agent asked for every approach, not only the four named in
**Source**.

*needrestart in batch mode, feeding the marker.* Debian 13 ships 3.11-1. `needrestart -b` restarts
nothing and prints `NEEDRESTART-SVC:` and `NEEDRESTART-SESS:` lines for stale processes. A
`DPkg::Post-Invoke` hook turns any such line into `/var/run/reboot-required`, so
`unattended-upgrades` reboots at `Automatic-Reboot-Time`. Strongest case: Debian packages and
maintains the detection, including filters for known false positives. Cost: a Perl stack on a
machine that has none, and a tool run as root that has had root-escalation CVEs.

*checkrestart from `debian-goodies`, feeding the marker the same way.* Python, from Debian 13's
`debian-goodies` 0.88.2. Strongest case: a smaller tool that only reports. Cost: `debian-goodies` is
a bundle that pulls in Perl as well, and its default path without `lsof` finds fewer deleted files by
its own account.

*A script kept in the repository, installed by cloud-init, feeding the marker.* It reads
`/proc/*/exe` and `/proc/*/maps` for ` (deleted)` and writes the marker. Strongest case: no new
package, and the whole rule is a few lines anyone can read. Cost: its filters for false positives
are ours to write and keep.

*Reboot every day at the hour, whatever was installed.* Strongest case: it cannot miss anything,
including what no detector sees. Cost: a reboot of about 18 seconds every day.

*Not yet.* Slice 4 builds [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md),
so something either detects or does not.

**Found and not candidates.** `reboot-notifier` writes the marker for kernel installs only and never
looks at processes. `lsof +L1` lists unlinked open files; whether it shows unlinked mappings was not
established, and it is a weaker form of the script above. `systemctl soft-reboot` and kexec change
how the machine restarts, not what decides that it must, and the reboot itself is settled by
[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
Fedora's `tracer` and `dnf needs-restarting` are not in Debian 13 or read rpm metadata.
`update-notifier-common`, which writes the marker on Ubuntu, is not in Debian 13.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

### First pass, 2026-10-12

**dpkg replaces a file by renaming a new one over it, so a running process sees the old one as
deleted.** dpkg 1.22.22 extracts to `.dpkg-new` and renames it over the final name. The old inode
loses its last link, and per `proc_pid_exe(5)` and `proc_pid_maps(5)` the kernel appends
` (deleted)` to its path in `/proc/PID/exe` and `/proc/PID/maps`. So every candidate that looks for
` (deleted)` catches a replaced library and a replaced executable alike, which is property 1.

*Sourced by a research agent: dpkg's `src/main/archives.c` and the two man7.org pages, 2026-10-12.
Not yet observed here.*

**needrestart checks the executable itself.** Line 538 of the `needrestart` script in 3.11-1 is
`# orphaned binary`, followed by `$restart++ if (defined($exe) && $exe =~ s/ \(deleted\)$//);`,
where `$exe` is read from `/proc/$pid/exe`. It also compares the inode of each executable mapping in
`/proc/PID/maps` with the file on disk, so it catches a file overwritten in place, which the other
candidates do not.

*Sourced: opened by me at `sources.debian.org/data/main/n/needrestart/3.11-1/needrestart`,
2026-10-12. The mapping check was read by a research agent.*

**needrestart in batch mode restarts nothing, and run by `unattended-upgrades` it falls back to
listing.** Its `README.batch.md` says "While needrestart is run in batch mode it will never show any
UI dialogs nor restart anything." Installing it adds an apt hook that runs it after every dpkg run;
its shipped default is interactive, and `$opt_r = 'l' if(!$is_tty && $opt_r eq 'i');` (line 243)
turns that into listing when there is no terminal. `$nrconf{restart} = 'l'` makes that explicit
rather than inferred, which property 3 needs. A person running `apt upgrade` in a terminal would get
its restart dialog unless the setting is explicit.

*Line 243 opened by me, 2026-10-12. The README quote and the hook's contents were read by research
agents from 3.11-1's source.*

**`unattended-upgrades` checks for the marker after dpkg's hooks have run.** In 2.12, `main()` calls
`reboot_if_requested_and_needed()` after `run()`, which commits the upgrade through apt and so runs
`DPkg::Post-Invoke`. That function returns unless `/var/run/reboot-required` exists, then runs
`/sbin/shutdown -r` with `Automatic-Reboot-Time`. So a hook that writes the marker gets a reboot at
the chosen hour with no unit of our own, which bears on properties 8 and 13. On a day nothing is
upgraded, dpkg does not run and neither does the hook, which is correct, since nothing was replaced.

*Sourced: opened by me at `sources.debian.org/data/main/u/unattended-upgrades/2.12/unattended-upgrade`,
2026-10-12. That `run()` reaches apt's `RunScripts("DPkg::Post-Invoke")` was read by a research agent
in apt 3.0.3's `dpkgpm.cc`.*

**Debian 13's `libc6` restarts services itself only across an upstream glibc version, which never
happens within Debian 13.** Its postinst restarts a fixed list of services, `openssh-server` and
`cron` among them, when `DEBIAN_FRONTEND` is noninteractive, but only if `dpkg --compare-versions
"$preversion" lt DEB_VERSION_UPSTREAM`. A security update within Debian 13 moves `2.41-12+deb13uN`
to a later `2.41-...`, which is not less than `2.41`. The move to Debian 14 is a rebuild, per
[ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md), not an upgrade in place. So property 3
is not threatened by `libc6`. Whether another package's postinst restarts a service on upgrade was
not checked; it cannot restart the app's unit, which no package owns.

*Sourced: opened by me at
`sources.debian.org/data/main/g/glibc/2.41-12+deb13u4/debian/debhelper.in/libc.postinst`, lines
27 to 147, 2026-10-12.*

**needrestart and checkrestart are both in Debian 13 main, forky and sid, and are architecture
`all`.** needrestart is 3.11-1 and `debian-goodies` 0.88.2 in all three, so amd64 and arm64 run the
same code, which is property 10. Neither is on Debian's `genericcloud` 13 image. Whether
DigitalOcean's `debian-13-x64` image carries either was not established.

*Sourced by a research agent from `sources.debian.org`'s API and the `genericcloud` image manifests
at `cloud.debian.org`, 2026-10-12.*

**needrestart adds 58 MB of Perl; checkrestart adds 255 kB, or 399 MB if recommended packages are
installed.** On a fresh `genericcloud` 13 VM, `apt-get install needrestart` installs 10 packages and
58.3 MB, Perl and its libraries, with or without recommended packages. `debian-goodies` has no hard
dependencies: with `--no-install-recommends` it installs 1 package of 255 kB, and checkrestart runs on
the image's own `python3`. With recommended packages, apt's default, it installs 126 packages and
399 MB, among them the `exim4` mail server, `cron`, `popularity-contest` and a C compiler. A research
agent had reported Perl and Python as hard dependencies of `debian-goodies`; `apt-cache show` lists
them as recommended only.

*Measured, 2026-10-12, by me, with `apt-get -s` and `apt-get install --assume-no` on a fresh
Debian 13 `genericcloud` arm64 VM, and `apt-cache show debian-goodies`.*

**needrestart had four root-escalation CVEs in 2024, all fixed before Debian 13's version.**
CVE-2024-48990, -48991, -48992 and CVE-2024-11003, found by Qualys, came from its interpreter scan
running Python or Perl with settings a local user controls. Debian's security tracker lists 3.11-1
as fixed. Upstream has not released since 3.11 in April 2025 but commits continue, the latest on
2026-09-29. The interpreter scan can be turned off with `$nrconf{interpscan} = 0`, which also removes
the feature those CVEs were in; a Node process is checked through its executable and mappings, not
the interpreter scan, which covers Java, Perl, Python and Ruby.

*Sourced by a research agent from `security-tracker.debian.org` and the GitHub API, 2026-10-12. Not
opened by me.*

**checkrestart reports deleted files only, and without `lsof` through a weaker path.** Its
`procfilescheck`, used when `lsof` is absent, says of itself "This sometimes finds fewer deleted
files than lsoffilescheck". `lsof` is only recommended by `debian-goodies`. It has no inode
comparison and no separate class for user sessions, and its exit status does not separate "services
stale" from "marker already present".

*Sourced by research agents from `debian-goodies` 0.88.2's source, 2026-10-12. Not opened by me.*

**No published memory figure exists for either tool.** Property 9 is measured in the spike rather
than read.

*Sourced: searched by a research agent, 2026-10-12.*

### Spike, 2026-10-12

One run of each step, on a local QEMU VM: Debian 13 `genericcloud` arm64, 13.7, kernel
6.12.111, 1 vCPU, 1 GB, booted with cloud-init. An `app.service` ran
`/usr/bin/node -e "...listen(3000)"` on NodeSource's 26.10.0, installed from `node_26.x` with its key
scoped by `signed-by` and that origin allowed in `unattended-upgrades`. needrestart 3.11-1, checkrestart
from `debian-goodies` 0.88.2 and a 10-line shell script reading `/proc/*/exe` and `/proc/*/maps` were
installed side by side; `debian-goodies` came with its recommended packages, so `exim4` and `cron`
also ran. A `DPkg::Post-Invoke` hook ran `needrestart -b` and wrote `/var/run/reboot-required` on any
`NEEDRESTART-SVC:` or `NEEDRESTART-SESS:` line. `Automatic-Reboot-Time` was 23:59. The VM was
deleted afterwards. It is arm64 where the Droplet is amd64.

- **Nothing stale, nothing reported.** Before any upgrade, needrestart printed only its kernel lines,
  checkrestart `RESTART_NEEDED: 0`, and the script nothing. That is property 7 on a fresh machine,
  observed once.
- **A real run replaced Node under the app, and every candidate caught it.** `unattended-upgrade`
  upgraded `nodejs` to 26.11.1 together with `liblzma5`, `libpng16-16t64` and `xz-utils`. The app
  kept PID 1194, `/proc/1194/exe` read `/usr/bin/node (deleted)`, and needrestart's own apt hook,
  left at its default, restarted nothing. needrestart reported `NEEDRESTART-SVC: app.service` and
  the `unattended-upgrades` service, checkrestart reported both with `/usr/bin/node (deleted)`, and the
  script reported the app's `node-MainThread` process and the other process's deleted `liblzma`.
  That is properties 1, 2 and 3.
- **The hook's marker became a reboot at the hour, in the same run.** The run logged `Found
  /var/run/reboot-required, rebooting` and `Reboot scheduled for Mon 2026-10-12 23:59:00 UTC`. The
  hook ran six times in that run, once per dpkg call. That is properties 4 and 8.
- **A replaced `libc6` is caught everywhere it is used.** After `apt-get install --reinstall libc6`
  with an SSH session open, all three named every long-running service, among them `app.service`,
  `ssh.service`, `cron.service` and `dbus.service`: twelve units from needrestart, eleven from
  checkrestart, which put `udev` among its unattributed processes, and the same processes from the
  script. needrestart listed the sessions apart, as
  `NEEDRESTART-SESS`.
- **Memory is small for all three.** Peak resident memory of one run, by `/usr/bin/time -f %M`:
  needrestart 15 to 17 MB, checkrestart 14 MB, the script about 2 MB. Against about 470 MB left beside
  the app, Caddy and Litestream per [../constraints.md](../constraints.md), property 9 separates
  nothing.
- **checkrestart prints a Python `DeprecationWarning` for each process it reads**, on Python 3.13, to
  standard error. Harmless, and noise in any log that captures it.

*Measured, 2026-10-12, one run of each step, by me.*

### Scoring, first pass, 2026-10-12

"Hook" means a `DPkg::Post-Invoke` line that runs the detector and writes the marker. Every hook
candidate shares property 5's requirement that the hook fails toward writing the marker and logs to
the journal, so a detector that errors causes a reboot rather than silence; that is glue, the same
for each, and separates none.

| | 1 exe | 2 lib | 3 no restart | 4 a day | 5 record | 6 source | 7 only when needed | 8 hour | 9 memory | 10 local | 11 rebuilt | 12 why | 13 to keep in mind |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| needrestart and hook | yes, observed | yes, observed | yes in batch; its own hook offers restarts to a person running apt in a terminal unless `restart = 'l'` is set | yes | glue | Debian main; four CVEs in 2024, fixed | yes, observed once | yes, observed | 17 MB | same | same | units and sessions | a package, two settings, the hook |
| checkrestart and hook | yes, observed | yes, observed | yes | yes | glue | Debian main | yes, observed once | yes | 14 MB | same | same | units | a package installed without recommends, the hook |
| Script and hook | yes, observed | yes, observed | yes | yes | glue | ours, in the repository | yes, observed once | yes | 2 MB | same | same | process and path | 10 lines and the hook |
| Daily reboot | yes | yes | yes | yes | yes | nothing added | **fails**: about 365 reboots a year against 16 or more | yes | none | same | same | none to see | a timer |

The daily reboot leaves on property 7. Three survive, so the list is not finished.

### Scoring, second pass, 2026-10-12

Properties 6 and 13 pass every survivor, so they are split into the conditions they stand for, and
one property is added from a record the first list did not draw on.

- **6a. What runs as root on every apt run, and how much of it parses what other users control.**
  needrestart is a Perl program whose interpreter scan ran interpreters on user-controlled settings
  in its 2024 CVEs; `$nrconf{interpscan} = 0` turns it off. checkrestart is Python reading `/proc`
  and running `pmap`. The script runs `readlink` and `awk` over `/proc`.
- **6b. Who fixes the detection when it breaks.** Debian, for both packages. Us, for the script; its
  rule rests on dpkg renaming a new file over the old one, which dpkg 1.22.22's source does and the
  spike observed, and on ` (deleted)` in two `/proc` files the kernel documents.
- **13a. A setting that, forgotten, breaks another property.** needrestart: `restart = 'l'`, or
  property 3 is one keypress away for a person at a terminal. checkrestart: `--no-install-recommends`,
  or 126 packages including a mail server arrive. Script: none.
- **13b. A format parsed across releases.** The hook parses needrestart's `NEEDRESTART-SVC:` lines or
  checkrestart's `RESTART_NEEDED:`; a change in Debian 14 breaks the hook silently unless it fails
  toward the marker. The script's output is its own.
- **14. The machine carries nothing it does not need.** The maximum safety stated in
  [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md), "a machine
  with nothing on it that is not needed", and property 2 of
  [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md).
  needrestart adds 58 MB of Perl the machine otherwise lacks. checkrestart adds `debian-goodies`, a
  bundle of about twenty tools of which one is used. The script adds one file.

| | 6a root surface | 6b who fixes it | 13a a setting to remember | 13b a format to parse | 14 nothing unneeded |
|---|---|---|---|---|---|
| needrestart and hook | largest; interpreter scan off by setting | Debian | `restart = 'l'` | yes | **fails**: 58 MB of Perl |
| checkrestart and hook | Python and `pmap` | Debian | `--no-install-recommends` | yes | **fails**: a bundle for one tool |
| Script and hook | `readlink` and `awk` | us | none | no | one file |

One candidate passes property 14. Its cost is 6b: the detection rule is ours to keep, and what keeps
it honest is the same rehearsal in the local VM that
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
already requires, run against a replaced package as this spike did.

