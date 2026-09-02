---
opened: 2026-09-02
status: open
resolves_into: decision
---

# How is this tested across browsers and platforms?

## Why it matters

**The failures this project is designed around do not reproduce where development happens.**
[../constraints.md](../constraints.md) is explicit about it twice: the storage failures "do not
reproduce in a desktop browser, so a desktop measurement of them is a measurement of nothing", and a
streaming bug reproduced only on real iOS Safari over a real network while desktop Chromium, curl,
the same phone on a different path and the same browser behind a different proxy were all fine. A
test suite that runs in one headless browser on a laptop is a test suite that cannot see this app's
characteristic bugs.

**Most of what `../constraints.md` records is Safari-specific, and Android is unresearched.** The
eviction clock, the `persist()` membership test, the cookie first-party rules, the fabricated quota
figure, the IndexedDB key defect, the missing background execution — all WebKit. The one entry about
Android says its eviction behaviour is unknown and must not be inferred from Chrome desktop's
numbers. So the platform this app is aimed at hardest is the one with the least written down, and
the coverage question is not symmetric across the matrix.

**It is also unbounded until somebody says what the matrix is.**
[../guarantees/compatibility.md](../guarantees/compatibility.md) is a stub and says so plainly: every
promise in that folder "is implicitly scoped to something, and until that scope is written down each
one quietly claims more than it can deliver." Testing everywhere is not a plan. This question cannot
be answered without that scope, and naming the scope is most of the work.

**The same capability is what lets an agent check a change without the maintainer watching**, which
is the argument for everything else in this milestone.

## What would settle it

Naming the matrix first — which browsers, which OS versions, which device classes — which belongs in
[../guarantees/compatibility.md](../guarantees/compatibility.md) and does not exist. Then, for each
cell, what is actually run there and how often: a full suite, a smoke path, or a manual look before a
release.

The useful sorting question is which failures each rung can see. A headless browser cannot see the
storage evictions. A simulator cannot see the network-path bugs. Only a real device on a real network
can see both, and it is the slowest and least automatable. So the answer is likely a ladder rather
than a single mechanism, and what belongs on each rung is the decision.

## Resolves into

A decision record in [../decisions/](../decisions/), and probably promises in
[../guarantees/compatibility.md](../guarantees/compatibility.md).

## Source

Raised 2026-09-02 by the maintainer, alongside the landing page question.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**This is the price of [ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md).** A native
path would have had two platforms with first-party test tooling; the web has a matrix. That record
already accepts roughly two thirds of `../constraints.md` as the cost of the choice, and this is the
same cost showing up in testing rather than in behaviour.

**It overlaps [how is the app driven on a real device?](how-is-the-app-driven-on-a-real-device.md)
and is not the same question.** That one asks how to drive one device at all. This one asks how many
and which, and what runs where. If the answer to this is "a real device is the only rung that sees
the failures that matter", the two collapse into one.
