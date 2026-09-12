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
currently reasons entirely from Safari's behaviour.** Nothing promises how long a player's work
lasts, and that too is silent on which platforms it holds on.

**Android is the larger share of the market and the smaller share of what this repo knows.**
[../constraints.md](../constraints.md) records Chrome for Android at roughly 60% of mobile browsing
worldwide against Safari on iPhone at about 26%, rising above 70% in Africa and Asia. Every
storage-behaviour fact in that file is WebKit-sourced, so the recorded knowledge covers the smaller
population.

*Sourced — [gs.statcounter.com/browser-version-market-share/mobile](https://gs.statcounter.com/browser-version-market-share/mobile),
August 2026 figures read 2026-09-12 by a research agent and not opened here. Mined from the
browser-floor question.*

**Android WebView is unresearched and is a separate mechanism from Chrome.** In-app browsers render
through it, its update path differs from Chrome's, and nothing here or in
[../constraints.md](../constraints.md) covers its storage or eviction behaviour. A player arriving
from a link in another app may be on it.

*Unverified — searched 2026-09-12, nothing established.*
