---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Are there user accounts?

## Why it matters

Progress is currently promised without one. Cross-device resume may be impossible to do well
without one.

## Blocked by

[Is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md),
[Is there a paid tier?](is-there-a-paid-tier.md),
[Do privacy regulations apply?](do-privacy-regulations-apply.md) — each decides something
accounts would have to serve, and a mechanism chosen before its purpose tends to acquire one.

## Blocks

[is there a paid tier](is-there-a-paid-tier.md),
[do privacy regulations apply](do-privacy-regulations-apply.md).

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Options and findings ported from legacy ADR-11 (track progress via anonymous server-side sessions).

## Options

*No accounts.* An opaque identifier issued on first visit, with progress bound to it. Nothing to
build, nothing for a player to do, and no credentials to store or protect. Progress binds to one
browser on one device.

*Accounts from the start.* Solves cross-device continuity and abuse resistance immediately, at
the cost of building signup, recovery and credential storage before anything needs them.

*No accounts, but an anchor that can later claim one.* A stable per-player record exists from the
first visit purely so that a later "claim this progress with an account" upgrade has somewhere to
attach without restructuring what came before. Defers the work without foreclosing it.

## Findings

Deferring accounts was previously judged to cost nothing later, and the reasoning holds
independently of that decision: without accounts there is no abuse resistance — an identifier
anchored in browser storage can be discarded and reissued at will — but the fix for that is
accounts, which is the same fix that would be built anyway. Nothing is foreclosed by waiting.

That argument is contingent on [is there a paid tier?](is-there-a-paid-tier.md) staying answered
no. The moment something is worth gating, abuse resistance stops being free to defer.
