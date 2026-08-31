---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How does a second device recognise the same person?

## Why it matters

If cross-device resume is in scope and accounts are not, this needs an answer nobody has
proposed yet. Anything anchored solely in browser-controlled storage is disposable by both the
browser and the user.

## Blocked by

[is cross-device resume in scope](is-cross-device-resume-in-scope-for-v1.md) and
[are there user accounts](are-there-user-accounts.md). If either answer is no, this question
disappears.

## Blocks

N/A — nothing waits on this.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Options and findings ported from legacy ADR-11 (track progress via anonymous server-side sessions).

## Options

*It doesn't.* Identity is bound to one browser, and switching devices or clearing storage loses
progress. Simple and honest, and the position legacy ADR-11 accepted deliberately — though it
contradicts the resume expectation described in [../problem.md](../problem.md).

*A claimable anchor.* A stable per-player record that an account can later attach to, so identity
survives being claimed rather than being replaced by a second one.

## Findings

**An opaque identifier plus a lookup beats a signed stateless token where a lookup is required
anyway.** Self-contained signed tokens exist to avoid a round trip to storage. If progress has to
be fetched regardless, signing and verification add a mechanism that buys nothing — and a
mechanism that adds no capability still has to be built correctly, rotated, and reasoned about.
