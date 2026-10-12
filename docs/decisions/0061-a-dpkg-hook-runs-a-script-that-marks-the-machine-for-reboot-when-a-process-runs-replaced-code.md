---
number: 0061
status: accepted
date: 2026-10-12
---

# 0061 — A dpkg hook runs a script that marks the machine for reboot when a process runs replaced code

## Forced by

- [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) reboots
  at the chosen hour for "any process left running on a replaced library" and never restarts a
  service for one, and nothing it names detects that case.
- "Hosting — Debian 13 updates itself on its own clock" in [../constraints.md](../constraints.md):
  only a kernel install creates `/var/run/reboot-required`.
- [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md)'s maximum safety, "a
  machine with nothing on it that is not needed".

## Scored against

Derived from the moments apt replaces a program under a running process: the daily run replacing a
library or an executable, the far more common run replacing nothing in use, the reboot at the hour
and the boot after it, a deploy starting a fresh instance, the maintainer's shell open across a run,
the detector failing or being removed, a rebuild from cloud-init, the arm64 local run, the move to
Debian 14, and the maintainer asking why the machine rebooted.

1. A process running a replaced executable is caught
   ([ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
   property 2).
2. A process using a replaced shared library is caught
   ([ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
   Decision).
3. No service is restarted; what is found feeds the reboot
   ([ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
   Decision, [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) property
   1).
4. A fix is in memory within about a day
   ([ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
   property 1).
5. Each run, and a failure to run, leaves a record
   ([a security update fails and nobody knows](../failure-modes/a-security-update-fails-and-nobody-knows.md)).
6. What it installs comes from Debian's archive or meets
   [ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md),
   from a maintained publisher
   ([ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)).
7. The machine reboots as few times a year as possible
   ([ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
   property 7).
8. The reboot lands at the chosen hour
   ([ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
   property 6).
9. Nothing it runs holds memory the app needs (no swap;
   [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) property 2).
10. The arm64 local run behaves the same
    ([ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
    [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
    property 8).
11. A rebuilt machine has it with no step by hand
    ([ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
    property 9,
    [ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)).
12. One place shows why the machine rebooted
    ([ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)
    property 11).
13. The least to configure and keep in mind over years, including Debian 14
    ([ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
    property 11, [ADR-0049](0049-the-droplet-runs-debian-13.md)).
14. The machine carries nothing it does not need
    ([ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) maximum safety,
    [ADR-0052](0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)
    property 2).
15. A detector that stops working is noticed (the portable standard's maximum safety; the failure
    mode above).
16. Replaced code no detector recognises still leaves memory
    ([ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
    property 2).
17. A change that stops the machine booting is found soon after it lands (maximum safety;
    [ADR-0055](0055-a-lockout-is-recovered-on-the-recovery-console-with-a-password-kept-for-it.md)).
18. Extra reboots are a cost the maintainer weighs as negative, stated 2026-10-12.

**Resources.** Memory was measured and does not bind: one run peaked at about 2 MB. CPU does not
bind: one pass over `/proc` took 0.02 seconds. Storage binds only through the journal lines, which
journald bounds. Network does not bind.

**Checked and binding on nothing:** cost and the firewall. **Deferred:** being alerted when the
detector fails, to [how is the server operated?](../questions/how-is-the-server-operated.md) at M11;
whether anything may run longer than a day, to where puzzle generation runs.

## Decision

**A script kept in the repository, installed by cloud-init, lists every process whose executable,
or a mapping with execute permission, is a file that has since been replaced. A `DPkg::Post-Invoke`
hook runs it after every dpkg run. When it lists anything, the hook writes
`/var/run/reboot-required`, so `unattended-upgrades` reboots at `Automatic-Reboot-Time` per
[ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).**

- **What counts as replaced.** A path in `/proc/PID/exe`, or in an executable mapping in
  `/proc/PID/maps`, that ends ` (deleted)`. dpkg replaces a file by renaming a new one over it, so
  the old one is deleted while a process still holds it. Paths under `/tmp`, `/var/tmp`, `/run` and
  `/dev`, and `memfd:` and `SYSV` mappings, are ignored, since no package installs files there. Any
  process counts, sessions included, as
  [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) says
  "any process".
- **It restarts nothing.**
- **Every run logs to the journal under one tag:** each process found, with its PID, name and path,
  and whether the marker was written.
- **If the script fails, the hook writes the marker anyway and logs why**, so a detector that
  errors causes a reboot rather than silence. A detector that runs and is wrong is bounded by
  [ADR-0062](0062-the-machine-reboots-at-the-hour-once-it-has-been-up-14-days.md).
- **The production-like local run carries the same files.**

**Observed** on a local Debian 13 arm64 VM on 2026-10-12, one run of each step:

- A real `unattended-upgrades` run replaced NodeSource's Node and `liblzma5` under a running app.
- The script listed the app's process as `/usr/bin/node (deleted)`, and the hook's marker became
  `Reboot scheduled for ... 23:59:00 UTC` in the same run.
- A reinstalled `libc6` was caught in every service that uses it.
- Nothing was listed on an unchanged machine.

The working, including needrestart and checkrestart run side by side, is read with
`git show 9de5746:docs/questions/what-detects-a-process-left-running-on-a-replaced-library.md`.

**What this does not settle:** rebooting when nothing is detected
([ADR-0062](0062-the-machine-reboots-at-the-hour-once-it-has-been-up-14-days.md)), and how Node is
installed ([is Node installed on the host or carried in each
release?](../questions/is-node-installed-on-the-host-or-carried-in-each-release.md)), which this
catches either way.

## Enforced by

**Nothing yet.** It becomes true once M1 slice 4's cloud-init writes the script and the hook, and
the local VM carries the same. Two checks would keep it true, and neither exists:

- a rehearsal in the local VM that replaces a package under a running process and expects the
  marker;
- a test of the script against a process running a deleted copy of a binary.

## Rejected

- **needrestart in batch mode, feeding the marker.** Its case is strong: Debian maintains the
  detection, it compares inodes as well as ` (deleted)`, and it names units and sessions apart. It
  fails property 14: it adds 58.3 MB of Perl in 10 packages, which the machine otherwise lacks, to
  do what one file does. **Reverses if** the machine gains Perl for another reason, or a replaced
  file appears that only an inode comparison catches.
- **checkrestart from `debian-goodies`, feeding the marker.** Report-only and 255 kB installed
  without recommended packages. It fails property 14: it installs a bundle of about twenty tools to
  use one, and 126 packages including the `exim4` mail server if recommended packages are installed,
  which is apt's default. **Reverses if** checkrestart ships as a package of its own.
- **Reboot every day at the hour, whatever was installed.** Its case is real. It cannot miss
  replaced code, it cannot fail silently, and it tests the boot path daily. It fails property 18:
  about 365 reboots a year against about 33 is a cost the maintainer weighs as negative. **Reverses
  if** a reboot at the hour stops costing anything players see and the maintainer re-weighs it.
- **Not yet.** M1 slice 4 makes
  [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) true,
  so something has to detect its second trigger.

`reboot-notifier`, `lsof +L1`, `systemctl soft-reboot`, kexec and Fedora's `tracer` were found and
are not candidates; the question's Options say why.

## Risk

- **The detection rule is ours.** It rests on dpkg renaming over the old file and on the kernel
  appending ` (deleted)`. If either changes, the script sees nothing and says nothing.
  [ADR-0062](0062-the-machine-reboots-at-the-hour-once-it-has-been-up-14-days.md) bounds that at
  14 days.
- **It misses a file overwritten in place, and changed interpreter scripts.** dpkg does not
  overwrite in place. The only long-running interpreter on the machine is `unattended-upgrades`'
  own Python.
- **About 33 reboot days a year**, from Debian 13's update cadence over 2025-10-12 to 2026-10-12,
  and about 40 more if Node comes from NodeSource.
- **A marker written by a hand-run apt reboots the machine at the next hour.** This is intended.

## Revisit when

- dpkg or the kernel changes how a replaced file appears in `/proc`.
- A process running replaced code is found on the machine that the script did not list.
- The machine gains Perl for another reason.
- A reboot at the hour stops costing anything players see, through a downtime tolerance at M12 or
  puzzles fetched ahead at M9.

## Also update

- [x] questions/README.md: slice 4's Must answer leaves; this record and
      [ADR-0062](0062-the-machine-reboots-at-the-hour-once-it-has-been-up-14-days.md) become Givens
- [x] questions/what-detects-a-process-left-running-on-a-replaced-library.md: mined and deleted
- [x] [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md):
      Risk's reboot count amended; its second trigger links here
- [x] constraints.md: dpkg's rename and ` (deleted)`; `unattended-upgrades` checking the marker
      after dpkg's hooks and on days nothing upgrades; Debian 13's reboot cadence
- [x] failure-modes/a-security-update-fails-and-nobody-knows.md: the detector failing
- [x] architecture.md, guarantees/, glossary.md: nothing
- [x] ../CONTRIBUTING.md: nothing yet; the local VM arrives with the deploy script
