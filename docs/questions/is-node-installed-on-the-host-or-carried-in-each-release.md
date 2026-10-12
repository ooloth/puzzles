---
opened: 2026-09-19
status: open
resolves_into: decision
---

# Is Node installed on the host or carried in each release?

## Why it matters

**The release shape is settled, and how Node is pinned and patched is not.** The server runs on a
DigitalOcean Droplet, per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md), as systemd services
without containers, per
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). A release
is a directory holding the built JavaScript and its `node_modules`. What is left here is whether
Node is installed on the host and patched by its package manager, or carried as an exact binary
inside each release.

**The two ways of carrying Node are not equivalent.** Installed on the host, Node is patched by the
package manager without a deploy, and can change under a running release. Carried inside each
release, it is exact and travels with the code, and each Node patch needs a deploy. Which one holds is
the part that reaches
[what pins the toolchain versions across machines?](what-pins-the-toolchain-versions-across-machines.md).

**It bears on rollback.** Rolling back a release whose Node is inside it restores the old runtime too;
rolling back one that uses the host's Node does not, and
[how is a bad deploy noticed and undone?](how-is-a-bad-deploy-noticed-and-undone.md) at M11 inherits
whichever is chosen.

## What would settle it

The host and the release shape are settled by
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) and
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md). What
settles the rest is what each way of carrying Node costs in the loop that runs most often, which is
deploying a small change. And what each costs the first time, which is not the same and is the one
usually quoted.

## Properties the answer is scored against

...

**Shared with the access questions.** The list in
[what deploys the code?](what-deploys-the-code.md), derived on 2026-10-05 for reaching and
hardening the machine, also applies here: software is installed and patched on the machine.

**Shared with the metrics agent question.** These rows were derived on 2026-10-06 for a program
installed onto the machine from an apt repository and patched by the daily run, and apply to Node if
it comes from the host. They moved here when that question was resolved by
[ADR-0060](../decisions/0060-outbound-traffic-is-alerted-on-by-digitalocean-with-no-metrics-agent-on-the-droplet.md),
which carries them as its properties 7 to 17. The moments only this question has, such as a deploy, a
rollback and a Node security release, are derived when it is worked.

- Every package's origin is checked before it is installed, including at creation (property 1 of
  [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
- The machine trusts the fewest publishers its software needs (property 2 of [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
- A security fix reaches the machine within about a day, with no step by hand (property 3 of
  [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md), property 1 of
  [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)).
- No restart a player notices happens outside the chosen hour (property 6 of [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)).
- An update run, with its memory and its lock on the package system, happens only at the chosen
  hour ("Hosting — Debian 13 updates itself on its own clock" in
  [../constraints.md](../constraints.md)).
- One update policy covers every source (property 3 of [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)).
- The daily run does not cross a major version, and the previous version stays installable
  (properties 5 and 6 of [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
- Its publisher is maintained (property 9 of [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md),
  [ADR-0027](../decisions/0027-a-dependencys-stewardship-matters-in-proportion-to-what-replacing-it-costs.md)).
- A rebuilt machine has the same arrangement with no step by hand (property 7 of [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md),
  [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)).
- The production-like local run installs and updates it the same way, on arm64 as on amd64
  ([ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
  property 4 of [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)).
- Nothing it adds opens an inbound port, bypasses the firewall, or fills the disk (property 4 of
  [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md)).

## Resolves into

A decision record in [../decisions/](../decisions/) on how Node is pinned and patched.

## Source

Raised 2026-09-19, promoted out of a scratchpad note in
[README.md](README.md) that observed nothing asked it. The note said to check whether
where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`) already covered it before writing a file; that check
was run and it does not.

It was titled "What shape is the deployable?" until
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) settled the
release's shape, and was renamed on 2026-10-05 to the part left open.

## Options

*Node installed on the host, patched by its package manager.* Debian 13's own Node is past its end
of life, so this means NodeSource's apt repository, held to every item of
[ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)'s
list; see **Findings**. A release is then the built JavaScript and its `node_modules`, and the
runtime version is a property of the machine. Two machines can run the same release on different
Node versions. A patch installs with no deploy, but the running app keeps the old binary until it
restarts, and whether anything restarts it is not established: see **Findings**.

*Node carried as an exact binary inside each release.* The runtime travels with the code, so a
release runs the same everywhere and rolls back with its runtime. Each Node patch needs a deploy, and
each release is larger by the size of the binary.

*Node unpacked from the official tarball onto the host*, as the spikes did, into
`/opt/node-<version>` with `/opt/node` linked to it. Exact and checksummed once.
[ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)
rules out a downloaded binary because nothing patches it after install, which this option has to
answer or fall to.

*Not yet.* Slice 4 installs Node on the Droplet, so it has to be carried one way or the other.

A container image and a single executable were also candidates for the release's shape.
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) settles the
shape as a directory of built JavaScript and its `node_modules`, run by systemd with no container
runtime, so neither is open.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**If Node is installed on the host, NodeSource's repository is held to [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md).** It
would need a key scoped by `signed-by`, the same versions for amd64 and arm64, old versions kept,
and an apt pin to the major line [ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md)
names, which also answers the risk that its origin pattern matches every line. Node carried inside
each release arrives by deploy, and that record does not govern it.

*Reasoned from [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md).*

**NodeSource meets three items of that list, and two are unchecked.** Its `node_26.x` repository
publishes the same versions for amd64 and arm64, 26.0.0 to 26.11.1, and keeps every earlier 26.x
version in its index. Each major line is a separate repository path, such as
`deb.nodesource.com/node_26.x`, so the sources entry already selects the line. All of them share the
origin `. nodistro`, so the origin pattern still matches every line and the apt pin still holds the
major. The package depends on `libatomic1`, `libc6`, `libgcc1`, `libstdc++6`, `python3` and
`ca-certificates`, and not on `libssl`, so it adds `python3` to the machine. Not yet checked: whether
how long after upstream's release a version appears, and how NodeSource is maintained. Its key
worked scoped by `signed-by`: a spike on 2026-10-12 installed `nodejs` from
`deb [signed-by=/usr/share/keyrings/nodesource.gpg]`, with the key from
`deb.nodesource.com/gpgkey/nodesource-repo.gpg.key`, and `unattended-upgrades` upgraded it from that
origin, per the spike recorded in
[ADR-0061](../decisions/0061-a-dpkg-hook-runs-a-script-that-marks-the-machine-for-reboot-when-a-process-runs-replaced-code.md), read with
`git show 9de5746:docs/questions/what-detects-a-process-left-running-on-a-replaced-library.md`.
The running app's process was named `node-MainThread` on 26.10.0.

*Sourced: the `Release` file and both `Packages` indexes of
`deb.nodesource.com/node_26.x/dists/nodistro`, fetched 2026-10-12.*

**Node from NodeSource would add about 40 reboots a year.** Under
[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md),
a replaced `/usr/bin/node` under the running app is a process on replaced code, and its only fix is
a reboot at the hour. `node_26.x` published 17 versions from 2026-05-05 to 2026-10-08. A detector
on its own reboots on about 33 days a year, per
[ADR-0061](../decisions/0061-a-dpkg-hook-runs-a-script-that-marks-the-machine-for-reboot-when-a-process-runs-replaced-code.md),
so Node on the host roughly doubles that. Carried in each release, a Node patch arrives by deploy
and costs no reboot.

*Reasoned, 2026-10-12, from NodeSource's `Packages` index; the rate is an extrapolation from five
months of one line.*

**How Node is pinned and patched is left here.** [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) runs the app as systemd services with no
container. So Node is either installed on the host and patched by the package manager, or carried as
an exact binary inside each release and patched only by deploying. The first keeps Node patched
without a deploy, and changes the runtime under a running release. The second keeps every release
exact, and needs a deploy for each Node patch.

**The spikes installed Node as the official tarball**, unpacked to `/opt/node-<version>-linux-x64`
with `/opt/node` linked to it. The alternative the eleventh pass reasoned about installs Node from
NodeSource's repository for the major line
[ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md) names, patched by
`unattended-upgrades` once that origin is added. That alternative was not run.

*Measured for the tarball, reasoned for NodeSource, 2026-09-30, in the eleventh and twelfth passes of
the hosting question, read with `git show ed7f54e:docs/questions/where-does-this-run.md`.*

**The Droplet measurements ran on Node 24, while
[ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md) names the 26 line.**
Only one memory measurement, on macOS, ran on Node 26. Node 24 also names its process `MainThread`,
not `node`, so a monitor matching on `node` misses it.

*Measured, 2026-09-30, same source.*

**If Node comes from the host's package manager, it is not Debian's.** Debian 13 packages Node 20,
past its end of life, so it would come from NodeSource. Debian's automatic updates leave NodeSource's
repository alone until its origin is allowed, and that origin is `. nodistro`, which a pattern on the
release's codename misses. None of this applies if Node is carried inside each release.

*Sourced by research agents on 2026-10-02, in the first pass of the OS question, read with
`git show 6bf04f6:docs/questions/which-os-does-the-droplet-run.md`. The host is Debian 13, per
[ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md). Re-checked 2026-10-12: trixie carries
`20.19.2+dfsg-1+deb13u2` per the `sources.debian.org` API, Node's `schedule.json` ends v20 on
2026-04-30, and NodeSource's `Release` file names the origin `. nodistro`.*


**Node from the host would be patched daily at the chosen hour.** If Node comes from NodeSource's
repository, [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
adds that repository to the daily updates at the chosen hour. An upgrade replaces Node on disk and
leaves the running app on the old binary until it restarts, because that record forbids restarting
the app's unit outside a deploy. That record reboots the machine for a kernel install or "any process
left running on a replaced library". Whether a replaced Node binary counts, and what would detect it,
is not established: "Debian 13 updates itself on its own clock" in
[../constraints.md](../constraints.md) says only a kernel install marks the machine for a reboot, and
nothing restarts processes on a replaced library unless something like `needrestart` is installed. A pattern on NodeSource's origin, `. nodistro`,
matches every major line it publishes, since all share that codename. Carried inside each release,
Node is untouched by the daily updates and changes only by deploying.

*Reasoned from [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md), 2026-10-03. That NodeSource's package does not depend on `libssl`, so an
OpenSSL update does not reach Node, was read from its `Packages` index by a research agent and is
in `git show cb8e751:docs/questions/when-are-updates-applied-to-the-machine.md`.*

**Node carried inside each release changes only when something deploys, so whether it meets the
one-day bound may turn on what deploys the code.** Properties 3 of
[ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)
and 1 of
[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
ask for a security fix within about a day with no step by hand. A Node release reaches a carried
runtime only through a deploy, and [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) rejected "applying updates with each deploy" because "the
window is unbounded while nothing is deployed", reversing "if deploys run on a daily schedule
regardless of changes". So that candidate's verdict may change with the answer to
[what deploys the code?](what-deploys-the-code.md) at slice 6, which would make that question an
input to this one. Not yet tested against scored candidates.

*Reasoned, 2026-10-07, while working the metrics agent question.*

**Node from an apt repository would be pinned by apt, beside whatever pins it on the other
machines.** [What pins the toolchain versions across machines?](what-pins-the-toolchain-versions-across-machines.md)
at M2 exists to prevent "two mechanisms nobody compared", and counts the Droplet among its machines.
An apt preferences pin on the Droplet and a version file read by the Mac and CI would be two, and
the apt pin holds a major line, not an exact version, so the Mac and the Droplet could run different
patch releases. Whether this changes any candidate's verdict, or only that question's field, is not
yet tested.

*Reasoned, 2026-10-07, from [ADR-0031](../decisions/0031-node-runs-on-the-newest-line-committed-to-lts.md),
[ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)
and that question's "Why it matters".*
