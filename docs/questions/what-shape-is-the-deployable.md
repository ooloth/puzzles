---
opened: 2026-09-19
status: open
resolves_into: decision
---

# What shape is the deployable?

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

## Resolves into

A decision record in [../decisions/](../decisions/) on how Node is pinned and patched.

## Source

Raised 2026-09-19, promoted out of a scratchpad note in
[README.md](README.md) that observed nothing asked it. The note said to check whether
where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`) already covered it before writing a file; that check
was run and it does not.

## Options

*Node installed on the host, patched by its package manager.* A release is then the built JavaScript
and its `node_modules`, and the runtime version is a property of the machine. Two machines can run
the same release on different Node versions, and a patch reaches the app with no deploy.

*Node carried as an exact binary inside each release.* The runtime travels with the code, so a
release runs the same everywhere and rolls back with its runtime. Each Node patch needs a deploy, and
each release is larger by the size of the binary.

*Not yet.* Slice 4 installs Node on the Droplet, so it has to be carried one way or the other.

A container image and a single executable were also candidates for the release's shape.
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) settles the
shape as a directory of built JavaScript and its `node_modules`, run by systemd with no container
runtime, so neither is open.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**How Node is pinned and patched is left here.** [ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) runs the app as systemd services with no
container. So Node is either installed on the host and patched by the package manager, or carried as
an exact binary inside each release and patched only by deploying. The first keeps Node patched
without a deploy, and changes the runtime under a running release. The second keeps every release
exact, and needs a deploy for each Node patch.

**Node ships a single-executable feature and it is not stable.** The v26 documentation page for
Single executable applications carries "Stability: 1.1 - Active development".

*Sourced — <https://nodejs.org/docs/latest-v26.x/api/single-executable-applications.html>, fetched
and the marker grepped by me on 2026-09-19.*

**Neither of the two questions that need this asks it.** Checked on 2026-09-19 by reading
where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`) and
[what deploys the code?](what-deploys-the-code.md): the first mentions containers only as a
platform capability, the second only inside one pipeline option. Recorded because an absence is
invisible and this one had already been noticed once and not acted on.

*Reasoned — from reading both files.*

**The runtime is Node, so the shape is not an input to the runtime choice.** The scratchpad note
that raised this question observed that Bun and Deno compile to a single executable and Node does
not in the same way. [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md)
settles the runtime, so this question is about how Node reaches the machine.

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
[ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md).*


**When Node from the host would be patched is now settled.** If Node comes from NodeSource's
repository, [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
adds that repository to the daily updates at the chosen hour. An upgrade replaces Node on disk and
leaves the running app on the old binary until the machine reboots at that hour, because that record
forbids restarting the app's unit outside a deploy. A pattern on NodeSource's origin, `. nodistro`,
matches every major line it publishes, since all share that codename. Carried inside each release,
Node is untouched by the daily updates and changes only by deploying.

*Reasoned from [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md), 2026-10-03. That NodeSource's package does not depend on `libssl`, so an
OpenSSL update does not reach Node, was read from its `Packages` index by a research agent and is
in `git show cb8e751:docs/questions/when-are-updates-applied-to-the-machine.md`.*
