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

**The candidates are not equivalent to a host.** A directory of files plus a runtime installed on
the machine, a container image, and a single executable are three different things to build, to
ship, to roll back and to reproduce. They differ in what the platform must support, in how large
the artifact is, in how long a deploy takes, and in whether the runtime version travels with the
code or is a property of the machine — which is the part that reaches
[what pins the toolchain versions across machines?](what-pins-the-toolchain-versions-across-machines.md).

**It bears on rollback, which nothing else here covers yet.** Rolling back to an image is a
different operation from rolling back to a commit and reinstalling, and
[how is a bad deploy noticed and undone?](how-is-a-bad-deploy-noticed-and-undone.md) at M11 inherits
whatever is chosen.

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
[where does this run?](where-does-this-run.md) already covered it before writing a file; that check
was run and it does not.

## Options

*A directory of files, with the runtime installed on the machine.* Simplest to build and the
smallest artifact. The runtime version is then a property of the machine rather than of the
release, so two machines can run the same code differently.
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) settles this
shape, and the runtime installed on the machine is one of the two ways of carrying Node left here.

*A container image.* The runtime travels with the code, so a release is reproducible and rollback is
selecting an older tag. Costs a registry, a build step and image size on every deploy. This does
not apply on the Droplet, which runs no container runtime, per
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md).

*A single executable.* Node documents this as "Single executable applications" at stability
"1.1 - Active development" on the v26 line. One file to copy, nothing installed on the host. The
stability tier is the thing to weigh, and whether the build is worth its complexity for one small
server. This is not the release shape that
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) settles, a
directory with its `node_modules`.

*Not yet.* The shape is mostly downstream of where it runs, and
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) and
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) settle both,
so deferring now covers only how Node is pinned and patched.

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
[where does this run?](where-does-this-run.md) and
[what deploys the code?](what-deploys-the-code.md): the first mentions containers only as a
platform capability, the second only inside one pipeline option. Recorded because an absence is
invisible and this one had already been noticed once and not acted on.

*Reasoned — from reading both files.*

**The runtime is Node, so the shape is not an input to the runtime choice.** The scratchpad note
that raised this question observed that Bun and Deno compile to a single executable and Node does
not in the same way. [ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md)
settles the runtime, so this question is about how Node reaches the machine.
