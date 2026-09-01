---
opened: 2026-08-30
status: open
resolves_into: constraint
---

# How does Android evict stored data?

## Why it matters

Entirely unresearched, while the whole durability analysis assumes an iOS-heavy audience — an
assumption with no evidence behind it anywhere in this project's history. If the audience skews
Android, the durability constraints may be very different, and the mitigations we're weighing
may be solving the wrong platform's problem.

## What would settle it

Chrome's and Android's own storage documentation, then confirmation on a real device that the
documented behaviour is the observed one. An afternoon.

## Resolves into

[../constraints.md](../constraints.md), in the client-storage section alongside the Safari
findings.

## Source

The legacy constraints research, which flagged the absence explicitly: "a gap, not a 'no
constraint' conclusion."

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**[Is home-screen install required for durability?](is-home-screen-install-required-for-durability.md)
currently reasons entirely from Safari's behaviour.** Every promise in
[../guarantees/durability.md](../guarantees/durability.md) also fails to state which platforms it
holds on.

...
