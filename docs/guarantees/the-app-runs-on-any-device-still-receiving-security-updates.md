---
updated: 2026-09-24
update_when: the declared floor moves, or a vendor changes what it patches
decays: slow
status: active
theme: compatibility
enforced: no
---

# The app runs on any device still receiving security updates

A phone or computer whose vendor is still shipping it security fixes can open this app and play it.
Not a subset of its features, not a degraded mode: the app.

**This promise is the scope every other promise in this folder is read against.** Durability, offline
play and latency are all claims about a device that can run the app at all, and until this file
existed each of them was scoped to nothing. Where another promise holds only on a narrower set than
this one, that promise says so in its own name.

**The line is declared in one configuration file rather than here**, per
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md),
so that the build, the checks and this promise cannot disagree about where it sits. That config is
the answer to "which devices"; this file deliberately does not restate it, because a second copy is
how the two come apart. It currently sits at the Safari shipping with iOS 15 and the equivalent
versions of the other engines, which is the oldest branch Apple still patches per
[../constraints.md](../constraints.md).

**The line moves, and moving it up is a withdrawal.** A vendor retiring a branch narrows what this
promise covers. That is expected and is not a violation, but it is a change to what players are owed
rather than a configuration detail, and the record that moves it says so.

**Enforced by** Nothing yet, and the two halves will never be enforced equally.
[ADR-0025](../decisions/0025-the-client-build-lowers-syntax-to-a-declared-floor.md) and
[ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md)
fix what the mechanism will be — the build lowers to the declared floor, one check parses the emitted
bundle at that floor, another checks source for APIs the floor lacks — but no build and no check
exists. When they do, the syntax half is a parse that succeeds or fails, and the API half is static
analysis that misses aliased globals, dependencies and anything inside a feature-detection guard. So
a green check will never be sufficient evidence for this promise.

**If violated** A player opens the app and it does not work, with nothing to act on and no way to
tell that their device is the reason. They are, per [../problem.md](../problem.md), someone with no
assumed technical sophistication, so the failure is indistinguishable from the app being broken. And
because [../constraints.md](../constraints.md) records that a syntax error runs none of the script,
the most likely form of the violation shows nothing at all.

**Bearing on this** [Does the floor cover iOS 15 devices that never installed their updates?](../questions/does-the-floor-cover-ios-15-devices-that-never-installed-their-updates.md)
decides whether this promise covers a device that stopped installing updates, which sets the floor
at Safari 15.0 or 15.6. [How is this tested across browsers and platforms?](../questions/how-is-this-tested-across-browsers-and-platforms.md)
at M2 is what would give this promise observation rather than compatibility data, and until it lands
this rests on what a database says a browser supports rather than on anyone having run the app there.
[../constraints.md](../constraints.md) records a bug that reproduced only on real iOS Safari over a
real network, which is the shape of what a data-only check cannot catch.
