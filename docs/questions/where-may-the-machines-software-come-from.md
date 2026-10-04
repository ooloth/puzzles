---
opened: 2026-10-03
status: open
resolves_into: decision
---

# Where may the machine's software come from?

## Why it matters

Whatever the Droplet installs software from runs that software as root, and whatever updates it
changes the machine without a deploy.
[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
installs every update from the machine's repositories daily, with no rehearsal first. So adding a
source is trusting its publisher with the machine, every day. A source that apt does not update,
such as a binary unpacked by hand, is trusted once and then needs something else to patch it.

[ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) installs Caddy from Caddy's
own repository, hosted by Cloudsmith. No record decided that trusting that repository is acceptable:
[ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) chose the front, and the
source came with it. [What shape is the deployable?](what-shape-is-the-deployable.md) may add
NodeSource's repository the same way, and Litestream, which
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) runs beside
the app, will need a source when the store arrives at M3.

**The question is asked without naming a mechanism.** An earlier wording asked which apt
repositories are allowed. That framing leaves out sources that are not repositories, such as an
upstream binary with a published checksum, and sources inside Debian's archive that are not its
default suites, such as backports. Both are candidates here.

**Environments:** production, and the production-like local run per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
which installs from the same places. The local run is a Debian 13 arm64 VM on the maintainer's Mac;
the Droplet is amd64.

**Until it is answered**, slice 4's setup would install Caddy from Cloudsmith because
[ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) says so, and nothing states
what any further source must meet.

## What would settle it

A rule any source must meet, scored against the properties below, and a verdict for Caddy's source
under that rule. Most properties are answered by reading what each source publishes: its signing,
its architectures, how long it keeps old versions, and what its stable channel promises. Whether
Debian's own Caddy gets security fixes in time is answered by Debian's security tracker. The one
behaviour that needs running is what an upgrade from each source does to requests in flight.

## Properties the answer is scored against

Derived on 2026-10-03 from the moments the machine touches a source: the first install on a new
Droplet and in the local VM; the daily update run at the hour; an upstream security fix being
published; an upstream release that changes behaviour or a major version; a publisher's key or
hosting being compromised; a source that becomes unreachable, rotates or expires its key, moves, or
is abandoned; the machine being rebuilt from nothing; a regression being undone; and the maintainer
adding a new piece of software later.

Ways a bad answer fails, written before the properties. **Safety:** a compromised or careless
publisher runs code as root; a package is installed without its origin being checked; a security
fix never arrives because the source lags upstream or stops publishing; a broken source leaves the
machine unpatched with nobody told; a breaking change arrives unattended; a rebuilt machine or the
local run gets different software from production; an older version is gone when a regression needs
undoing. **Performance:** an upgrade drops requests in flight; an update run uses memory the 1 GB
machine needs. **Experience:** many sources, each with its own key and quirks, to audit for years;
no way to see where a given program came from; every new program reopening this decision.

1. **Every package's origin is checked before it is installed**: apt verifies a signature against a
   key scoped to that source alone, or a binary is checked against a checksum or signature its
   publisher publishes. Safety. Rests on
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md),
   which installs from each source daily as root with no rehearsal.
2. **The machine trusts the fewest publishers its software needs.** Safety. Rests on the maximum
   safety [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)
   states, "a machine with nothing on it that is not needed", and on
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
3. **A security fix for anything on the machine reaches it within the bound [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) sets, about a
   day, with no step by hand.** Scored per source as how long its published fixes trail upstream's,
   and whether any known fix is missing. Safety. Rests on property 3 of
   [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) and
   property 1 of
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
4. **Each source publishes the same version for amd64 and arm64**, so the local VM installs what the
   Droplet installs. Safety. Rests on
   [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
   and property 8 of
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
5. **The daily run does not move a program across a major version.** Safety. Rests on the Risk in
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
   that a regression lands unrehearsed, and on the Risk in
   [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) that Caddy changed
   defaults in a patch release.
6. **The previous version stays installable, so a regression an update brings can be undone.**
   Safety. Rests on property 5 of
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md),
   whose Risk names a downgrade from the package cache or `snapshot.debian.org` as the undo.
7. **A rebuilt machine installs the same software from the same sources with no step by hand.**
   Safety. Rests on
   [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
   and property 9 of
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
8. **A source that stops publishing, or whose key expires, makes the update run fail with an error
   rather than leaving the machine on old versions silently.** Safety. Rests on
   [a security update fails and nobody knows](../failure-modes/a-security-update-fails-and-nobody-knows.md).
   Alerting on that error is deferred, below.
9. **Each publisher is maintained, weighed by what moving off its source would cost.** Safety. Rests
   on [ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md).
10. **An upgrade of the front fails no request in flight.** Performance. Rests on property 5 of
    [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) and property 1 of
    [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). Caddy's
    own package restarts it on upgrade, which [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) measured as about a second of refused
    connections; whether that differs by source is open.
11. **For anything on the machine, the maintainer can see where it came from and what updates it,
    in one place.** Experience. Rests on property 6 of
    [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) and
    property 11 of
    [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
12. **Adding a program later is a check against a written rule, not a new decision.** Experience.
    Rests on property 6 of
    [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md); Node
    and Litestream are the known cases.

**Resources.** None binds on the choice of source. Memory: an update run drew about 114 MB on a
1 GB VM, per [../constraints.md](../constraints.md), and an extra source adds a few kilobytes of
index. Storage: the package cache and old kernels are bounded by property 10 of
[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
Network: an index refresh and an occasional package a day. CPU: an occasional unpack.

**Checked and binding on nothing.** Cost, per
[ADR-0045](../decisions/0045-hosting-costs-about-10-dollars-a-month-with-20-as-the-ceiling.md):
every candidate source is free. The firewall, per property 4 of
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md): installing
from any source opens no inbound port.

**Deferred.** Alerting when an update run fails belongs to
[how is the server operated?](how-is-the-server-operated.md) at M11, which [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) already defers
to. Which source Node comes from waits on
[what shape is the deployable?](what-shape-is-the-deployable.md), and Litestream's on the store at
M3; the rule this question settles applies to both, but neither is scored here.

## Resolves into

A decision record in [../decisions/](../decisions/). If it rules out Caddy's repository,
[ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md)'s source and the sources
[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
lists are revisited with it.

## Source

Raised on 2026-10-03 by a handoff check, which found that
[ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) commits to a package source
no record settled, and that
[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
then installs from it daily. Opened as "Which repositories may the machine install packages from?"
and restated the same day without naming a mechanism, with the maintainer's agreement.

## Options

The decision is a rule, and Caddy is the one program slice 4 installs that Debian's default suites
do not cover well. So each rule is scored by what it gives Caddy. Field enumerated on 2026-10-03.

**Where Caddy can come from:**

- *Debian 13's own package*, from `trixie` and `trixie-security`, updated by the daily run with no
  change to Debian's defaults.
- *Debian's backports*, from `trixie-backports`, updated by the daily run once its origin is allowed.
- *Caddy's apt repository on Cloudsmith*, `stable` channel, updated by the daily run once its origin
  is allowed. A `testing` channel carries betas and release candidates.
- *A release from Caddy's GitHub page*, a tarball or `.deb` checked against its published signature,
  installed by the setup script and updated by nothing unless something is built to do it.
- *A build from Caddy's download page*, a binary compiled on request, optionally with plugins.
- *A build from source*, with Go and optionally `xcaddy`.
- *Not yet.* Slice 4 installs Caddy, so something has to be chosen.

**Rules a competent person might set:**

- *Debian's archive only*, main and security suites. Anything Debian does not ship well is not
  installed.
- *Debian's archive, plus a third-party apt repository only where Debian's own package fails a
  property here, and only one that meets a stated list.* The list would be drawn from the
  properties above.
- *Case by case*, with no written rule.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Caddy's repository names its origin `cloudsmith/caddy/stable`, and NodeSource's names
`. nodistro`.** See "Hosting — Debian 13 updates itself on its own clock" in
[../constraints.md](../constraints.md).

**Debian 13 ships Caddy 2.6.2, patched by Debian's security team, with one known vulnerability
unfixed.** The archive holds `2.6.2-12+deb13u1` in both `trixie` and `trixie-security`. Debian's
security tracker lists DSA-6429-1 for Caddy, with most 2026 CVEs marked fixed in trixie.
CVE-2026-77281 is marked "vulnerable (no DSA)" in trixie and fixed in forky and sid, and
CVE-2026-92700 and CVE-2026-92284 are "undetermined" in every suite.

*Sourced: `qa.debian.org/madison.php?package=caddy` and
`security-tracker.debian.org/tracker/source-package/caddy`, opened by me on 2026-10-03. Re-check
before deciding, since the tracker changes as advisories land.*

**Debian 13's Caddy is not marked for removal.** An earlier finding, carried into
[ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md), said it was. The
autoremoval notice on Debian's package tracker is for `2.11.4-1` in forky, Debian's testing suite,
due 26 October 2026 because of bugs in three Go dependencies. Packages in a stable release are not
autoremoved.

*Sourced: `tracker.debian.org/pkg/caddy` and the madison listing above, opened by me on
2026-10-03. The earlier claim was a research agent's from 2026-10-02 and was not re-opened then.*

**Debian's backports carry a newer Caddy, for amd64 only.** `trixie-backports` holds
`2.11.2-1~bpo13+1`, built for amd64 and no other architecture. Upstream is at 2.11.7. The Droplet is amd64; the local VM is
arm64. Backports are not in the origins Debian 13's automatic updates allow by default, per
"Hosting — Debian 13 updates itself on its own clock" in [../constraints.md](../constraints.md).

*Sourced: the madison listing above, opened by me on 2026-10-03. That backports are outside the
default allowed origins is reasoned from that constraint, which names Debian's archive and security
archive only.*

**If everything on the machine came from Debian's archive, a rejected option in [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) would
reopen.** [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
rejected pinning the machine and the local run to one archive snapshot because Caddy's and
NodeSource's repositories publish no snapshots, and says that rejection reverses if everything comes
from Debian's archive. So an answer here can change what is available to that record.

*Reasoned from [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)'s Rejected section.*

### First pass against the properties, 2026-10-03

**Debian 13's security fixes for Caddy trailed upstream by 68 to 168 days in 2026** (property 3).
Debian's security team uploaded `2.6.2-12+deb13u1` on 10 August 2026, backporting fixes for eight
CVEs. Upstream had fixed five of them in 2.11.1 on 23 February, one in 2.11.3 on 12 May and two in
2.11.4 on 3 June. CVE-2026-77281, fixed upstream in 2.11.4, is marked `<no-dsa> (Minor issue)` for
trixie, so it waits for a point release with no date.

*Sourced: the package's `debian/changelog` at `sources.debian.org`, Caddy's GitHub releases API,
and the CVE-2026-45692 and CVE-2026-77281 pages on Debian's security tracker, opened by me on
2026-10-03. Which upstream version fixed each of the other CVEs is a research agent's reading of the
tracker's descriptions, not re-opened for each.*

**Debian's backports have no security support and lag their own testing suite** (properties 3 and
4). The backports FAQ answers "Is there security support for packages from backports.debian.org?"
with "Unfortunately not. This is done on a best effort basis by the people who track the package".
Its 2.11.2 is missing the fixes in 2.11.3 and 2.11.4. Its arm64 build failed about 122 days ago and
has not been retried.

*Sourced: `backports.debian.org/FAQ/`, opened by me on 2026-10-03. The build failure is a research
agent's reading of `buildd.debian.org` for `trixie-backports`, not re-opened.*

**Caddy's Cloudsmith repository publishes each release within hours of its GitHub release, for both
architectures, and keeps old versions** (properties 3, 4 and 6). The amd64 and arm64 `Packages`
indexes each list 39 versions, ending at 2.11.7. The 2.11.4 arm64 `.deb` was uploaded at
04:38 UTC on 3 June 2026, and the GitHub release was published at 06:52 the same day. A research agent
found the same pattern for 2.11.2, 2.11.3, 2.11.6 and 2.11.7. The upload is made by Caddy's own
release workflow, which verifies a signed tag first.

*Sourced: both `Packages` indexes and Cloudsmith's package API for 2.11.4, opened by me on
2026-10-03. The other upload times and the release workflow are a research agent's reading of
Cloudsmith's API and `.github/workflows/release.yml`, not re-opened. Whether Cloudsmith ever prunes
old versions could not be verified.*

**Caddy's repository is checked by a key scoped to it alone** (property 1). The sources line
Caddy's install page downloads reads
`deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main`.
A research agent read the key as RSA 4096 with no expiry, and two older subkeys that expired in 2024.

*Sourced: `dl.cloudsmith.io/public/caddy/stable/debian.deb.txt`, opened by me on 2026-10-03. The key
details are the agent's `gpg --show-keys` output, not re-run.*

**Nothing stops Caddy's `stable` channel from carrying a Caddy 3** (property 5). Every version in
it is 2.x, and no published policy says what happens at a new major version. Caddy's security
policy supports only the latest 2.x. Patch releases already change behaviour: 2.11.6 lists
"Breaking changes", including a 16 KiB default limit on request headers and new one-minute idle
timeouts. An apt pin on `2.*` would keep the daily run on the 2.x line whatever the channel
publishes.

*Sourced by a research agent from Caddy's `SECURITY.md` and the v2.11.6 release notes, 2026-10-03,
not re-opened. The pin is reasoned from apt's preferences mechanism and not tried.*

**An upgrade from either Debian's package or Caddy's restarts Caddy** (property 10). Caddy's own
`postinstall.sh` runs `deb-systemd-invoke try-restart caddy.service` on upgrade, and a research agent
found that Debian's package copies the same script into its `postinst`. Caddy 2 has no graceful
binary upgrade, per its author on Caddy's forum. So no source passes property 10, and it does not
separate them. [ADR-0050](../decisions/0050-caddy-terminates-tls-in-front-of-the-app.md) already
accepts this restart as a known weakness.

*Sourced: `postinstall.sh` in `caddyserver/dist`, opened by me on 2026-10-03. Debian's copy and the
forum statement are a research agent's reading, not re-opened.*

**A broken source is silent under Debian's daily run, whatever the source** (property 8). In apt's
`apt.systemd.daily`, a failed `apt-get update` only logs "download updated metadata (error)" through
`debug_echo`, and `unattended-upgrade` still runs on the old lists. A hand-installed binary is never
checked at all. So no source passes property 8 by default, and it does not separate them. Meeting it
needs a check of its own, which belongs with alerting at M11.

*Sourced: `debian/apt.systemd.daily` on apt's main branch, opened by me on 2026-10-03. That apt 3.0.3
in Debian 13 has the same flow is assumed from the branch, not checked against the tag.*

**A hand-installed release or build is patched by nothing** (property 3). Caddy's GitHub releases
carry signatures and a checksums file, so the origin can be checked once. After that, a fix waits
until someone or something replaces the binary. The download page and source builds have the same
gap, and a source build also needs Go from somewhere.

*Sourced by research agents from Caddy's install page and GitHub release assets, 2026-10-03, not
re-opened. The signatures were not verified.*

**Scored on 2026-10-03, one source survives for Caddy.** Debian's own package fails property 3.
Backports fail property 4. A GitHub release, a download-page build and a source build each fail
property 3. Caddy's Cloudsmith repository passes properties 1, 3, 4, 6, 7 and 9. Property 5 is open
until the rule says whether a pin is required. Properties 8 and 10 separate no source, and property 2
counts one more publisher against Debian-only. Among the rules, *Debian's archive only* fails
property 3 for Caddy, and *case by case* fails property 12.
