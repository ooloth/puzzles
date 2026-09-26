---
opened: 2026-09-25
status: open
resolves_into: decision
---

# How do we learn the browser floor can rise?

## Why it matters

The floor the client build lowers syntax to is the Safari shipping with iOS 15, because
[../constraints.md](../constraints.md) records iOS 15 as the oldest branch Apple still patches.
Nothing notices when that stops being true. Apple does not announce the end of a branch; its
security releases simply stop appearing.

Keeping the floor low never breaks
[the app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md).
Raising it too early does, by stranding patched devices. So a mechanism that raises the floor on a
wrong signal is worse than none. What staying low costs is lowering helpers in every bundle, and
APIs the floor lacks, such as `Array.prototype.at`, staying unusable without a polyfill.

## What would settle it

Knowing how Apple spaces security releases for its older iOS branches, well enough to say how long
without a release means a branch is no longer patched. A scheduled check also needs something to
run it, which is [what runs the checks on every change?](what-runs-the-checks-on-every-change.md)
or a scheduled agent outside the repository.

## Resolves into

A decision record in [../decisions/](../decisions/) naming the mechanism. Whatever it chooses opens
an issue for a person to decide, and never edits the floor itself.

## Source

Raised while scoping issue #4, when Vite's default build target was weighed against the declared
floor. In Vite 8.3.1 that default is `chrome111`, `edge111`, `firefox114`, `safari16.4` and
`ios16.4`, read from `node_modules/vite/dist/node/chunks/node.js` on 2026-09-25.

## Options

*A dated review.* The floor's value carries the date it was last checked against Apple's security
releases, and somebody re-checks on a schedule. Costs nothing to build and holds only while
somebody remembers.

*A scheduled check.* A job reads
[Apple's security releases page](https://support.apple.com/en-us/100100), finds the oldest iOS
branch with a recent release, compares it with the floor in the build config, and opens an issue
when they differ. Needs the threshold above and something to run it.

*Player browser data.* Once the running system reports on itself at M11, the browsers that actually
load the app are known. That says who a higher floor would strand, not what is still patched, so it
informs a raise rather than triggering one.

## Findings

...
