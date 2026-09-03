---
opened: 2026-09-02
status: open
resolves_into: decision
---

# Can a player explore past puzzles?

## Why it matters

[../problem.md](../problem.md) says a puzzle from any past day is still where the player left it.
That covers puzzles they have already opened. It does not say whether a player can reach a puzzle
they never saw — yesterday's, or one from six months before they arrived — and those are different
products with different costs.

Part of it is already constrained.
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) settles that
puzzle content is served by something that can decide whether to serve it, and states that it
"settles the catalogue candidate in the server's inventory by consequence" — an archive that might
ever be gated cannot ship as static files. So the delivery shape for an archive is decided. Whether
there is an archive is not.

It also sets storage volume by orders of magnitude, which is why
[what can a player do with no network?](what-can-a-player-do-with-no-network.md) asks the offline
half of the same thing at M6.

## What would settle it

Deciding whether the catalogue a player can reach is one puzzle, the puzzles they have opened, or
everything ever published — and whether that differs for a guest.

It cannot be worked usefully before
[is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md),
because a supply model with no back catalogue leaves nothing to explore.
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) says the same
thing from its own side, under Risk: "If the answer to [one puzzle a day, or unlimited play?] is
one a day with no archive, there is no body of content to gate and the whole option was
theoretical."

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02, while mining [../problem.md](../problem.md) and every record in
[../decisions/](../decisions/) for product intent that an infrastructure decision could foreclose
without noticing. `../problem.md` promises a past day's board is where the player left it, and
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) reasons about an
archive at length, while nothing asked whether one exists.

## Options

*No archive.* Today's puzzle, and nothing else reachable. The simplest product, and the one that
makes [ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md)'s gating
option theoretical, which that record says plainly under Risk.

*Only what the player has opened.* A player returns to boards they started, and cannot reach a day
they missed. This is what `../problem.md`'s sentence literally covers, and it needs no catalogue —
the puzzles are already on the device.

*The full back catalogue.* Any published puzzle, whether or not the player was there. The largest
product and the only one where the archive is a body of content in its own right — which is what
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) preserves the
ability to gate.

*Not yet.* Nothing is built, and
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) has already paid
the cost that keeps the largest option reachable.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The expensive half of this is already bought.**
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) put a runtime on
the path to content specifically so that an archive could be withheld later, and names the ongoing
cost it accepted: "cache headers, content hashing, an invalidation story". That cost is being paid
whether or not an archive is ever built, which means answering this question "yes" is cheaper than
it would otherwise be, and answering it "no" wastes something already spent.

*Sourced — per [ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md).*

**An archive that is fully offline cannot be gated at all.**
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md)'s revisit
conditions name this: if offline scope grows to cover the whole archive, "everything is on the
device anyway, gating buys nothing and the static option's advantages return unopposed". So this
question and [what can a player do with no network?](what-can-a-player-do-with-no-network.md) can
produce a combination that retires a decision already made.

*Sourced — per [ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md).*

**Nothing is promised.** [../guarantees/](../guarantees/) covers only the board in progress. Boards
already finished have no promise, and neither does reaching a puzzle from a day the player missed.

**Browsing an uncached archive is a blocking wait, and one of only two that are not cold.** The
waiting-moment enumeration (2026-09-02, mined into [../problem.md](../problem.md) under "Where a
player waits") found nine blocking moments, seven of which are first contact after a gap. This is one
of the two exceptions: it happens mid-session, with other requests already flowing, so it pays no
wake-up cost. That makes it cheaper than it looks, and it is a point in this option's favour that
nothing had recorded.

*Reasoned — from that enumeration, 2026-09-02.*
