---
opened: 2026-08-30
status: open
resolves_into: constraint
---

# How long does Safari really keep our storage?

## Why it matters

The length of this window sets how many players ever lose progress, and therefore how much of the
case for recovery machinery survives. At thirty days a player who takes a two-week holiday keeps
everything and is not a case to design for. At seven they lose the board and are.

WebKit's source says thirty and Apple's documentation says seven. Until a device settles which
describes the shipped browser, every durability argument rests on a figure taken from source code
rather than from behaviour.

## Blocked by

N/A — nothing needs to be answered first.

## What would settle it

A real-device test is the only thing that would settle it, and it is slow rather than hard: a
site that writes to IndexedDB, then a device left untouched across the candidate windows. WebKit
will not settle it, because the source and the documentation disagree and neither is wrong about
itself.

Failing that, an explicit statement from Apple, which does not currently exist.

## Resolves into

`../constraints.md`, confirming or replacing the thirty-day figure recorded there.

## Source

Split out of "what resets Safari's seven-day storage clock?" on 2026-08-31, when the *what*
half was answered and moved to `../constraints.md`. The *how long* half survived, and got
harder rather than easier.

## Options

N/A — this resolves into a fact, not a choice.

## Findings

**What this decides beyond itself.** [Is home-screen install required for durability?](is-home-screen-install-required-for-durability.md)
and, less directly,
[is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md). Both are
arguments about how often the wipe actually fires.

**The interaction half is answered and recorded in [../constraints.md](../constraints.md).** A
tap, a click, a keystroke the page handles, an autofill, and an authentication all reset the
clock. Scrolling, viewing, timers, and the app writing to storage do not. That was the more
useful half: it establishes that an actively playing player is never at risk, so the whole
question is about the gap between sessions.

**WebKit's source says thirty days for any site arrived at normally.**
`ResourceLoadStatisticsStore.cpp` carries `operatingDatesWindowLong { 30 }` alongside
`operatingDatesWindowShort { 7 }`. The split comes from
[PR #21120](https://github.com/WebKit/WebKit/pull/21120), commit `274398@main`, 2024-02-09, whose
description states that seven days is retained only "when cross-site link decoration is detected and
if link decoration filtering is disabled", and thirty applies otherwise. A player arriving by
bookmark or typed URL never meets that condition. An in-tree layout test asserts thirty.
[../constraints.md](../constraints.md) records thirty.

**Apple's documentation still says seven, and the change was never announced.** The 2019 and 2020
WebKit posts describing a blanket seven-day rule remain published and are what most third-party
writing cites. Anyone checking this against public documentation will find seven and conclude the
thirty-day figure is wrong.

**One contradiction in the source is unresolved.** The commit that introduces the thirty-day window
also states that it does not change current behaviour, which cannot be squared with the layout test
asserting thirty. Reading more source will not settle this.

**What remains open is whether a shipped browser behaves the way trunk describes.** Source is not
behaviour, and no test on a real device has been run. This is the whole of the remaining question.

**The window is counted in days the browser was used, not calendar days.** This is separate from
the length and is not in dispute. Whichever number is right, it stretches further in wall-clock
time than it reads — a player who does not open Safari at all is not spending the budget.

**Thirty is the planning number.** A device test would confirm it, and being wrong costs a player's
progress, which [../guarantees/durability.md](../guarantees/durability.md) promises will not happen.
Until that test runs, any argument whose conclusion changes between a week and a month is worth
stating both ways.
