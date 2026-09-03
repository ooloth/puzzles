---
opened: 2026-09-03
status: open
resolves_into: decision
---

# Is a puzzle fetched before it is needed?

## Why it matters

**It is the only thing that would remove the most common wait in the product rather than dressing
it.** [../problem.md](../problem.md) records under "Where a player waits" that opening a puzzle whose
content has never reached the device happens to every active player at least daily, and that it is the
only wait on the list that is not an edge case. Every other answer to that wait — a spinner, a
skeleton, a message — makes it tolerable. Fetching ahead makes it not happen.

**It is also the wait that lands worst.** It is first contact after a gap, so it pays whatever wake-up
cost the infrastructure carries on top of the network cost, and
[../constraints.md](../constraints.md) already puts three to four round trips before payload on a
fresh connection. A commute is exactly where that lands.

**And it is the difference between an offline promise that covers the board and one that covers
tomorrow.** [The board in play continues through a loss of connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md)
protects a puzzle already open. Nothing protects a player who finishes one puzzle in a tunnel and
wants the next.

## What would settle it

Deciding whether content is fetched ahead of the moment it is opened, and how far ahead.

It cannot be answered before there is a rhythm to fetch ahead of — a next puzzle has to be
predictable for prefetching to mean anything, which is
[is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md) and
[can more than one puzzle be published per day?](can-more-than-one-puzzle-be-published-per-day.md).

Three things any answer has to settle:

- **How far ahead.** One puzzle, a week, everything available.
- **When the fetch happens.** On opening the app, on finishing a puzzle, on a schedule, or
  opportunistically while connected.
- **What it costs the device.** Mobile radios are expensive to wake regardless of payload size, per
  [../constraints.md](../constraints.md), so a prefetch that wakes the radio on a schedule is a
  battery decision as much as a latency one.

## Resolves into

A decision record in [../decisions/](../decisions/), and possibly a promise in
[../guarantees/](../guarantees/) — "today's puzzle is on the device before it is opened" is the
strongest claim in this area and the most expensive.

## Source

Raised 2026-09-03 by the maintainer, from a promise candidate offered while enumerating what a player
waits for. It was set aside as a promise because promises are written as they fall out of records
rather than committed to in advance, and because it presumes a daily rhythm that is not settled.

## Options

*Nothing is prefetched.* The default. Every puzzle is fetched when opened, and the wait is designed
for rather than removed.

*The next puzzle is fetched when the current one is opened.* Cheap, and it covers the common case of
finishing one puzzle and wanting the next. Does nothing for a player returning after a gap, which is
the case that pays the wake-up.

*The next puzzle is fetched on any successful connection.* Covers the returning player too. Costs a
radio wake and a decision about how often.

*A window of puzzles is fetched and kept.* Strongest offline story, and it interacts with
[what can a player do with no network?](what-can-a-player-do-with-no-network.md), which sets storage
volume by orders of magnitude, and with
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md), since content on
the device is content that has been handed over and cannot be recalled.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Prefetching hands content over permanently.**
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) says gating governs
"the boundary of what is handed over, never what has been", and [../constraints.md](../constraints.md)
records that what reaches a device cannot be recalled. So how far ahead this fetches is also how much
of the catalogue is given away, which matters only if
[is there a paid tier?](is-there-a-paid-tier.md) answers yes.

*Sourced — per the record and constraint named.*

**No evidence was found that comparable apps do this.** A search for published engineering writing
from NYT Games, LinkedIn Games or Sudoku.com on offline handling came back essentially empty — see
[what do existing puzzle apps do about offline play?](what-do-existing-puzzle-apps-do-about-offline-play.md).
Sudoku.com's offline support appears to mean an already-loaded puzzle keeps working, not that future
days are cached.

> So there is no prevailing practice to follow or reject here, and that file records that answering it
> means observing the apps directly rather than reading about them.

*Sourced — second-hand from a research agent, 2026-09-02.*

**Prefetching also makes a server outage invisible to returning players**, which was not part of the
case for it when this was raised. Everything in [../problem.md](../problem.md) under "Where a player
waits" fails while the server is down, and the most frequent of those moments is exactly the one this
question would remove. A player who already has tomorrow's puzzle does not notice that the machine is
being rebuilt.

> So this is no longer only a latency question. It is also the cheapest available mitigation for the
> downtime bet [ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
> takes, and it competes with recovery speed rather than depending on it.

*Reasoned — 2026-09-03, from the records named.*
