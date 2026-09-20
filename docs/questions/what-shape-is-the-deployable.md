---
opened: 2026-09-19
status: open
resolves_into: decision
---

# What shape is the deployable?

## Why it matters

**Two questions both need an answer to this and neither asks it.**
[Where does this run?](where-does-this-run.md) compares platforms on what they can host, and
[what deploys the code?](what-deploys-the-code.md) compares pipelines on what they can produce. Both
were checked on 2026-09-19 and neither poses the question: the first treats "an ordinary container"
as a property platforms have, the second mentions "a container image built locally" inside one
option. So the shape is being assumed on both sides rather than chosen on either, which is how a
choice gets made without anyone making it.

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

Whether the host chosen at [where does this run?](where-does-this-run.md) prefers or requires one
shape, which is the input that most constrains this, and which is why this is answered alongside
that question rather than before it.

Then what each shape costs in the loop that runs most often, which is deploying a small change. And
what each costs the first time, which is not the same and is the one usually quoted.

## Resolves into

A decision record in [../decisions/](../decisions/), or a finding folded into
[where does this run?](where-does-this-run.md) if the host turns out to determine it.

## Source

Raised 2026-09-19, promoted out of a scratchpad note in
[README.md](README.md) that observed nothing asked it. The note said to check whether
[where does this run?](where-does-this-run.md) already covered it before writing a file; that check
was run and it does not.

## Options

*A directory of files, with the runtime installed on the machine.* Simplest to build and the
smallest artifact. The runtime version is then a property of the machine rather than of the
release, so two machines can run the same code differently.

*A container image.* The runtime travels with the code, so a release is reproducible and rollback is
selecting an older tag. Costs a registry, a build step and image size on every deploy.

*A single executable.* Node documents this as "Single executable applications" at stability
"1.1 - Active development" on the v26 line. One file to copy, nothing installed on the host. The
stability tier is the thing to weigh, and whether the build is worth its complexity for one small
server.

*Not yet.* Available, and probably correct until the host is chosen: the shape is mostly downstream
of where it runs, and choosing first would constrain the host for no reason.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

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

**The runtime no longer varies, which removes one input this question used to have.** The scratchpad
note that raised it observed that Bun and Deno compile to a single executable and Node does not in
the same way, making the shape an input to the runtime choice.
[ADR-0030](../decisions/0030-typescript-outside-the-browser-runs-on-node.md) settled the runtime, so
that coupling is gone and this question is now purely about how Node reaches the machine.
