---
opened: 2026-08-30
status: open
resolves_into: constraint
---

# Is Safari's storage window still seven days?

## Why it matters

Seven days is the figure every durability argument in this repo is sized against. If the real
default is now several weeks, the population that loses progress shrinks by a large factor, and
the case for building recovery machinery shrinks with it. If it is still seven, nothing changes.

The difference is not academic: it decides whether a player who takes a two-week holiday is a
normal case we must design for or an outlier we accept losing.

## Blocked by

N/A — nothing needs to be answered first.

## Blocks

[Is home-screen install required for durability?](is-home-screen-install-required-for-durability.md)
and, less directly,
[is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md). Both are
arguments about how often the wipe actually fires.

## What would settle it

A real-device test is the only thing that would settle it, and it is slow rather than hard: a
site that writes to IndexedDB, then a device left untouched across the candidate windows. WebKit
will not settle it, because the source and the documentation disagree and neither is wrong about
itself.

Failing that, an explicit statement from Apple, which does not currently exist.

## Resolves into

`../constraints.md`, replacing or confirming the seven-day figure recorded there.

## Source

Split out of "what resets Safari's seven-day storage clock?" on 2026-08-31, when the *what*
half was answered and moved to `../constraints.md`. The *how long* half survived, and got
harder rather than easier.

## Options

N/A — this resolves into a fact, not a choice.

## Findings

**The interaction half is answered and has moved to [../constraints.md](../constraints.md).** A
tap, a click, a keystroke the page handles, an autofill, and an authentication all reset the
clock. Scrolling, viewing, timers, and the app writing to storage do not. That was the more
useful half: it establishes that an actively playing player is never at risk, so the whole
question is about the gap between sessions.

**The window length is now contested, and the two sources disagree.** WebKit's source carries a
long window of thirty days alongside a short one of seven, with the short one applied only to a
domain reached by a cross-site navigation from a tracker-classified domain carrying unfiltered
link decoration — which is not the shape of anyone arriving at this app. An in-tree layout test
asserts the thirty-day figure directly. The commit introducing it says the seven-day period
"has a negative impact on usability by people who visit sites semi-frequently".

Against that: the change was never announced, WebKit published nothing about it, and the
documentation still says seven. The commit message also claims it does not change current
behaviour, which contradicts the test.

**The provenance is now much stronger, and the planning number has moved to thirty
(2026-08-31).** The constants were read directly in trunk — `operatingDatesWindowLong { 30 }`,
`operatingDatesWindowShort { 7 }` — and the introducing change identified:
[PR #21120](https://github.com/WebKit/WebKit/pull/21120), commit `274398@main`, 2024-02-09. Its
description states the rule in the author's own words: seven days is retained only "when cross-site
link decoration is detected and if link decoration filtering is disabled", and thirty applies
otherwise. That is the piece the earlier reading lacked — not two constants whose relationship had
to be guessed, but the condition, stated by the person who wrote it. A player arriving at this app
by bookmark or typed URL never meets it. `../constraints.md` now records thirty.

**What is still open is narrower, and it is the original bar this file set.** Source is not
behaviour. The unresolved contradiction above — a commit that both changes the window and claims to
change nothing — is exactly what a device test would settle and reading more source will not. The
question is no longer "seven or thirty"; it is "does a shipped browser do what trunk says".

**The window is counted in days the browser was used, not calendar days.** This is separate from
the length and is not in dispute. Whichever number is right, it stretches further in wall-clock
time than it reads — a player who does not open Safari at all is not spending the budget.

**Treat seven as the planning number until a device test says otherwise.** Being wrong in this
direction costs some over-engineering. Being wrong in the other direction costs a player's
progress, which
[../guarantees/durability.md](../guarantees/durability.md) promises will not happen.
