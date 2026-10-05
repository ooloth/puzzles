---
number: 0052
status: accepted
date: 2026-10-03
amended: 2026-10-05
---

# 0052 — The machine installs from Debian's archive, and only vetted, pinned apt repositories beside it

## Forced by

- [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md): every
  source the machine uses is updated daily as root with no rehearsal, so each source is trusted with
  the machine every day.
- [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md): the front is Caddy, which Debian's
  default suites do not keep current.
- [ADR-0049](0049-the-droplet-runs-debian-13.md): the machine runs Debian 13.
- "Debian 13's Caddy trails upstream's security fixes by months" and "Debian 13 updates itself on its
  own clock" in [../constraints.md](../constraints.md).
- [A security update fails and nobody knows](../failure-modes/a-security-update-fails-and-nobody-knows.md).

## Scored against

Derived from the moments the machine touches a source: the first install on a new Droplet and in the
local VM; the daily update run; an upstream security fix being published; an upstream release that
changes behaviour or a major version; a publisher's key or hosting being compromised; a source that
becomes unreachable, rotates or expires its key, moves, or is abandoned; the machine being rebuilt; a
regression being undone; and a new program being added later.

1. Every package's origin is checked before it is installed, against a key scoped to that source or
   a checksum its publisher publishes ([ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)).
2. The machine trusts the fewest publishers its software needs (the maximum safety in
   [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md)).
3. A security fix reaches the machine within about a day of upstream's, with no step by hand
   (property 3 of [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md),
   property 1 of [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)).
4. Each source publishes the same version for amd64 and arm64, so the local VM matches the Droplet
   ([ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)).
5. The daily run does not move a program across a major version (the Risks in
   [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) and
   [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md)).
6. The previous version stays installable, so a regression can be undone (property 5 of
   [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)).
7. A rebuilt machine installs the same software with no step by hand
   ([ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)).
8. A source that stops publishing makes the update run fail visibly
   ([a security update fails and nobody knows](../failure-modes/a-security-update-fails-and-nobody-knows.md)).
9. Each publisher is maintained, weighed by what moving off it would cost
   ([ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)).
10. An upgrade of the front fails no request in flight (property 5 of
    [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md)).
11. For anything on the machine, the maintainer can see where it came from and what updates it, in
    one place (property 6 of [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md)).
12. Adding a program later is a check against a written rule, not a new decision (property 6 of
    [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md)).

**Resources.** None binds on the choice of source. An update run drew about 114 MB on a 1 GB VM, per
[../constraints.md](../constraints.md), and an extra repository adds a few kilobytes of index. Disk
is bounded by property 10 of
[ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md). Network
and CPU are an index refresh and an occasional package.

**Not binding.** Cost: every candidate source is free, against
[ADR-0045](0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md). The firewall: no
source opens an inbound port.

**Separating nothing.** Property 8 is failed by every source, because Debian's daily run hides a
failed download. Property 10 is failed by every source, because every Caddy package restarts Caddy
on upgrade. Both are in [../constraints.md](../constraints.md).

**Maximums.** Maximum safety is one publisher, Debian, whose fixes arrive the day upstream's do.
Maximum performance is an upgrade nobody's request notices. Maximum experience is one rule and one
place to look. Debian alone comes closest on the first and third, and fails property 3 for Caddy by
months. So one more publisher is accepted where Debian's own package fails, and nowhere else.

## Decision

**Software installed onto the machine comes from Debian 13's main and security suites. A
third-party apt repository is added only for a program whose Debian package fails a property above,
and only if the repository:**

- **is signed, with its key scoped to it alone** by `signed-by` (property 1);
- **publishes upstream's releases within about a day**, so its security fixes meet
  [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)'s bound
  (property 3);
- **publishes the same versions for amd64 and arm64** (property 4);
- **keeps earlier versions installable** (property 6);
- **is run by the program's own project or a maintained publisher**, weighed per
  [ADR-0027](0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)
  (property 9);
- **is pinned, by an apt preferences file, to the program's current major version** (property 5).
  The maintainer chose the pin on 2026-10-03, over leaving packages unpinned;
- **has its origin added to the daily run's allowed origins**, per
  [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).

Nothing else is installed onto the machine by hand: no downloaded binary, no source build, no Debian
backports, since each fails property 3.

**Caddy's repository on Cloudsmith meets it**, pinned to `2.*`, and is the one third-party
repository today. Debian 13's own Caddy is not used. The scoring is in the question this record
resolved, read with `git show 75fc8a5:docs/questions/where-may-the-machines-software-come-from.md`.

**What this does not settle:**

- **What a release carries.** The built app and its `node_modules` arrive by deploy, not by
  installation, and whether a release also carries Node is
  [is Node installed on the host or carried in each release?](../questions/is-node-installed-on-the-host-or-carried-in-each-release.md). If that puts Node
  on the host, NodeSource's repository is held to this rule, pinned to the line
  [ADR-0031](0031-node-runs-on-the-newest-line-committed-to-lts.md) names.
- **The source of any replication process the store's backup adds**, when
  [how is the store backed up?](../questions/how-is-the-store-backed-up.md) is answered. It is held to this rule there.
- **Noticing a failed update run, or a pin left on a major version upstream no longer supports.**
  Both are [how is the server operated?](../questions/how-is-the-server-operated.md) at M11, and
  the second is
  [a pinned package outlives its supported major version](../failure-modes/a-pinned-package-outlives-its-supported-major-version.md).

## Enforced by

**Nothing yet.** It is true once M1 slice 4's setup writes the sources, keys, pin and allowed
origins, and the local VM carries the same files. Nothing checks that the machine still matches. A
rehearsal in the local VM that lists every apt source and fails on one outside Debian's archive
lacking `signed-by`, a pin or an allowed origin would, and does not exist.

## Rejected

- **Debian's archive only.** Its case is strong: one publisher, Debian's security team, and the
  snapshot pin [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
  rejected would reopen. It fails property 3: Debian 13's Caddy security fixes in 2026 arrived 68 to
  168 days after upstream's, and one is deferred to a point release. **Reverses if** Debian's
  security fixes for the programs on the machine arrive within days of upstream's, or the front
  moves to a program Debian keeps current.
- **Debian's backports for Caddy.** Current within a few releases and inside Debian's archive. It
  fails property 4: built for amd64 only, so the arm64 local VM cannot match. It has no security
  support either. **Reverses if** backports build for arm64 and gain security support.
- **A release downloaded from Caddy's GitHub page**, checked against its signature. Exact and
  verified once. It fails property 3: nothing patches it after install. **Reverses if** deploys
  come to run daily and carry the front with them.
- **A build from Caddy's download page, or from source.** For plugins, which nothing here needs. It
  fails property 3 the same way. **Reverses if** a needed plugin exists only that way.
- **Case by case, with no written rule.** It fails property 12: Node, and any replication process
  the backup adds, would each reopen this. **Reverses if** the programs on the machine grow too varied for one rule to fit.
- **Third-party repositories unpinned.** Its case is real: when a new major version ships and the
  old line stops getting fixes, an unpinned machine keeps getting them, and fails loudly if the new
  version breaks it. It fails property 5: a new major version installs on the Droplet at the update
  hour without ever running in the local VM. **Reverses if** something rehearses each update in the
  local VM before the Droplet takes it.
- **Not yet.** Slice 4 installs Caddy, so a source is chosen either way.

## Risk

- **A pinned line stops receiving fixes, silently.** Caddy supports only its latest 2.x, so after a
  Caddy 3 ships the pinned machine eventually gets no fixes, and nothing reports it until M11's
  mechanism exists. That is
  [a pinned package outlives its supported major version](../failure-modes/a-pinned-package-outlives-its-supported-major-version.md).
- **One more publisher with root.** Caddy's project and Cloudsmith, whose open-source hosting can be
  withdrawn. Moving off it is a change of source for one package.
- **A broken repository is hidden by the daily run**, per [../constraints.md](../constraints.md),
  until M11 alerts on it.
- **Old versions are kept by Cloudsmith's choice.** Its indexes hold 39 versions today, and no
  retention policy was found. If it prunes them, undoing a regression needs a `.deb` kept elsewhere.
- **Patch releases still change behaviour.** The pin stops major versions only; Caddy's 2.11.6
  changed defaults within 2.x.

## Revisit when

- A pinned program releases a new major version.
- Debian's security fixes for Caddy start arriving within days of upstream's.
- Caddy's repository stops publishing for arm64, moves host, or is withdrawn.
- A program is needed that no Debian package or qualifying repository provides.

## Also update

- [x] questions/README.md: slice 4 loses its **Must answer** on the software's source and gains this
      record as a **Given**
- [x] questions/where-may-the-machines-software-come-from.md: mined and deleted in this change
- [x] questions/is-node-installed-on-the-host-or-carried-in-each-release.md: NodeSource is held to this rule if Node is on the
      host
- [x] questions/how-is-the-store-backed-up.md: any replication process it adds is held to this rule
- [x] questions/how-is-the-server-operated.md: noticing a stale pin and a hidden repository failure
- [x] [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md) and
      [ADR-0051](0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md): link
      this record
- [x] constraints.md: Caddy's sources, backports' security support, and the daily run hiding a failed
      download
- [x] failure-modes/: a pinned package outlives its supported major version; a security update fails
      and nobody knows gains the hidden repository failure
- [x] architecture.md: nothing; no boundary changes
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
- [x] ../CONTRIBUTING.md: nothing yet; the local VM arrives with the deploy script
