---
opened: 2026-08-31
status: open
resolves_into: decision
---

# How long must in-progress work survive, and on which devices?

## Why it matters

[../guarantees/durability.md](../guarantees/durability.md) promises in-progress work is never
lost, "however the session is interrupted". It states no bound and names no device. Those two
omissions are the difference between a promise that costs nothing and one that forces a server,
an identity, and a sync protocol.

Bounded at the current session, it is satisfied by writing to the device on every move. Bounded
at "forever, on any device the player picks up", it requires everything this project has been
circling for weeks. The words in the guarantee do not distinguish them, and every decision
downstream has been made against whichever reading was in mind at the time.

## Blocked by

N/A — nothing needs to be answered first. It is a promise to choose, not a fact to find.

## Blocks

Whether a server exists — see [what must be true off-device?](what-must-be-true-off-device.md) —
and therefore hosting, identity, and which database if any. Also
[is home-screen install required for durability?](is-home-screen-install-required-for-durability.md),
[how much unsynced work is acceptable?](how-much-unsynced-work-is-acceptable.md), and
[is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md), which is the
release-timing half of the same subject.

## What would settle it

Stating the promise with a number and a device scope, then checking it against
[../constraints.md](../constraints.md) — because the platform sets a ceiling. Script-writable
storage is deleted after a period of no interaction, so a promise longer than that window cannot
be kept on the device alone, whatever the intent.

The useful form of the answer is a sentence a player could be shown without it being a lie.

## Resolves into

A decision record in [../decisions/](../decisions/), and a rewrite of the guarantee it bounds.

## Source

Raised 2026-08-31. Working backward from "which database" reached it in four hops; it is the
node where the technical chain meets a product promise.

## Options

*The current session.* Survives a backgrounded tab and a crash. Costs a write per move and
nothing else.

*Across sessions on this device, indefinitely.* What a player expects by default. Free until the
browser evicts, and undeliverable past that point without help.

*Across sessions and devices.* Progress follows the player. Requires a copy elsewhere and a way
to know whose it is.

*Across sessions on this device, with silent recovery after eviction.* Local by default, restored
from a server copy when the browser has cleared it, with the player never told anything happened.
Cheaper than full cross-device because the browser still holds the key, and it is the option most
often missed because the debate is framed as local-or-accounts.

## Findings

**The platform ceiling is not a detail.** Safari deletes script-writable storage after a period
without interaction, and an actively playing player never trips it — the exposure is entirely the
gap between sessions. So any promise measured in weeks is really a promise about lapsed players,
and lapsed players are the ones for whom losing progress confirms the decision to drift away.
Recorded in [../constraints.md](../constraints.md).

**Storage failures are not only eviction.** Writes are rejected in ordinary operation for reasons
unrelated to quota or policy, and the error names misreport the cause. A durability promise of any
length requires the write path to be careful, so that work is not avoidable by choosing a short
bound.

**This question is upstream of cross-device, not beside it.**
[Is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md) asks when
progress should follow a player between devices. This asks whether it must at all, and for how
long — which is what makes that one answerable.
