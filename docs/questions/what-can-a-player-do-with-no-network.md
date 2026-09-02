---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What can a player do with no network?

## Why it matters

[Play continues through a loss of connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md)
is promised, and everything so far has read that as *the puzzle already open keeps working*.
That is the smallest possible reading. A larger one — finish this puzzle, then browse the archive
and start another, all in a tunnel — is a different product and a different app by orders of
magnitude.

This is the question that sizes client storage. One board with history is kilobytes; a browsable
catalogue is megabytes and needs prefetching, eviction policy, and a rule for what to keep. Every
storage-mechanism argument made so far has quietly assumed the small reading, which is why
`localStorage` looked viable — that was a claim about one board, not about a catalogue.

## What would settle it

Deciding what a player should be able to reach with the network gone, then checking that the
volume it implies is affordable in the storage that survives eviction. The answer has to name
content, not duration.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31. Working backward from "which client storage mechanism" reached this in two
hops, and found it unasked.

## Options

*The open puzzle only.* Whatever is loaded keeps working; anything else needs a network. Smallest
storage, and the weakest reading of a promise already made.

*Today's puzzles.* The daily set is present once fetched. Bounded, predictable, and matches a
daily rhythm.

*A window of recent puzzles.* The last week or month, kept current opportunistically. Covers
someone who finishes on a commute and wants another, without unbounded growth.

*The whole archive.* Everything, always. Contradicts a paid archive if one ever exists, and grows
without limit.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**This decides which client storage mechanism is used and how much content is fetched ahead of
time.** [How does the app stay available offline?](how-does-the-app-itself-stay-available-offline.md)
covers the shell; this covers the content. Also bears on
[how long must offline play survive?](how-long-must-offline-play-survive.md), which asks the same
thing along the time axis rather than the content axis.

**A promise already made may decide this.** [../problem.md](../problem.md) describes play in
tunnels and dead zones as the modal case rather than the edge case. Someone who finishes a puzzle
underground and cannot start another has hit exactly the wall the app exists to remove — which
argues the smallest reading is not enough, and that the honest answer is at least the second
option.

**It interacts with gating.** If an archive is ever behind a paid tier, caching it locally hands
it over. Whatever is cached offline is, in practice, given away — so this question and
[is there a paid tier?](is-there-a-paid-tier.md) constrain each other.
