---
opened: 2026-09-24
status: open
resolves_into: decision
---

# Does the floor cover iOS 15 devices that never installed their updates?

## Why it matters

**[The app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md)
can be read two ways, and they put the floor at different Safari versions.** Read as "any device
whose vendor still ships it updates", it covers an iPhone 7 on iOS 15.0 that never installed one,
and the floor is Safari 15.0. Read as "any device running the updates its vendor ships", it covers
that iPhone only on iOS 15.8.x, whose Safari reports itself as 15.6.x, and the floor is Safari 15.6.

**The difference is a set of APIs that candidates and designs already use.** Safari 15.4 added
`Array.prototype.at`, `structuredClone`, `Object.hasOwn`, `BroadcastChannel` and Web Locks, and
15.2 added `navigator.storage.persist()` and the origin private file system. Under a 15.0 floor, the
renderer candidates that call `.at` without a guard break, and so does Svelte's `$state.snapshot` on
a `Date`, per [what renders the client?](what-renders-the-client.md). So does any storage or
cross-tab design built on those APIs, which
[which client storage mechanism holds a player's work?](which-client-storage-mechanism.md) has to be
checked against.

**It is a question about what is promised, not about configuration.**
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
makes the floor's value a setting in one config file, but which devices the guarantee covers is what
that setting has to express, and the guarantee does not say.

## What would settle it

Deciding which reading the guarantee means and writing it into the guarantee's own wording, so the
caveat is in its name if it narrows. Two facts would inform it and neither is known: how many
devices on the iOS 15 branch run a version below 15.8, and what a player on such a device sees when
the app does not run, which
[what does a browser below the floor see?](what-does-a-browser-below-the-floor-see.md) covers.

## Resolves into

A decision record in [../decisions/](../decisions/), and a change to the guarantee's wording if the
promise narrows.

## Source

Raised while checking renderer candidates' runtimes against the floor, when patched iOS 15 devices
turned out to report Safari 15.6.

## Options

*Safari 15.0.* Covers every device on the iOS 15 branch, patched or not. Costs the APIs above, or a
guard or polyfill for each.

*Safari 15.6.* Covers every device running the updates its vendor ships. A device that never updated
is below the floor and is told so, per
[a device too old to run the app is told so rather than shown a blank screen](../guarantees/a-device-too-old-to-run-the-app-is-told-so-rather-than-shown-a-blank-screen.md).

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Apple still ships iOS 15 security updates, most recently iOS 15.8.8 on 2026-05-11**, for the
iPhone 6s, iPhone 7, first-generation iPhone SE, iPad Air 2, fourth-generation iPad mini and
seventh-generation iPod touch.

*Sourced — [Apple security releases](https://support.apple.com/en-us/100100), opened by me
2026-09-24.*

**Safari on iOS 15.8.x reports itself as 15.6.x.** iOS 15.8 sends `Version/15.6.6` and iOS 15.8.4
sends `Version/15.6.7`, so security updates to the branch do not advance Safari's version.

*Sourced — user-agent strings recorded by user-agents.net and useragents.io, seen by me in search
results on 2026-09-24. No Apple source states it, and nobody has checked it on a device.*
