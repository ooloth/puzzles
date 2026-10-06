---
opened: 2026-09-01
status: open
resolves_into: decision
---

# Is the store's backup restorable?

## Why it matters

[Reopening restores the board in progress with notes and selection](../guarantees/reopening-restores-the-board-in-progress-with-notes-and-selection.md)
is the promise that a player's work outlives the session that made it, and that promise is only as
real as the backup behind it. A backup that has never been restored is a belief about what it
contains, not a fact — the failure
mode is a restore that silently produces an empty or corrupt database at the exact moment it is
needed, which is also the worst possible moment to discover that for the first time.

[../problem.md](../problem.md) names the solo maintainer as a stakeholder, and a restore drill that
can be run and checked on demand is what lets this promise be verified — by the maintainer or by an
agent — without waiting for an actual data loss to test it. That makes it a loop worth running
routinely, not just once after the backup is first set up.

## What would settle it

...

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, when a milestone for maintainer tooling was added and the feedback loops nobody
had asked about were enumerated.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The widely repeated "most restores fail" statistic is folklore.** The Gartner figure usually cited
does not trace to any Gartner publication and an analyst has denied it. Real numbers exist only in
vendor-commissioned self-report surveys ranging from 31% to 58%, a spread wide enough to be useless
for planning. Recorded so nobody reaches for a confident number with nothing behind it.

*Sourced — second-hand from a research agent, 2026-09-02.*

**A backup can be correct and unreachable at once.** See the Railway control-plane incident recorded
against where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`):
the backup was not wrong, it was on the far side of the failure. Restorability and reachability are separate properties and this question covers
both.

**This now has two failure modes behind it** rather than being an untested belief on its own:
[the backup turns out not to restore](../failure-modes/the-backup-turns-out-not-to-restore.md) and
[the durable copy stops being written](../failure-modes/the-durable-copy-stops-being-written.md). The
second matters here because a backup faithfully preserves whatever it was given, including nothing.
