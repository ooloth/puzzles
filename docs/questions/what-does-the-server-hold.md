---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What does the server hold?

## Why it matters

A server exists — [ADR-0006](../decisions/0006-what-a-players-work-survives.md) forces one. What it
carries is open, and that is what shapes the database, the hosting, and how much of the system has
to be operated at all.

A browser can hold a puzzle, a player's progress, and the rules. There are four things it cannot
hold: something the player must not be able to change, something reachable from a device they have
not used yet, something that must reach the player while the app is closed, and something that must
reach us when a promise breaks. Naming which of those apply is the whole decision.

[What the server does with puzzle state](what-does-the-server-do-with-puzzle-state.md) specifies how
it validates and merges, which is a different question and downstream of this one — a server cannot
be said to validate something it was never established to hold.

An enumeration here that leaves a candidate out settles the question by omission, and reads as
complete while doing it. The list under Options is the full set, and it is kept full.

## What would settle it

Testing every candidate under Options against the same pair of questions: could the device hold
this instead, and what breaks if the player edits it? Anything that survives is a reason a server
exists. If nothing survives, this is a static site.

The list is worked in one sitting, and a candidate is struck off here rather than being quietly
resolved by whichever other question happens to reach it first. A single surviving candidate
settles that a server exists; the rest then only shape what it does.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31. Working backward from "which database" found that no question established a
server in the first place, though one decision record already describes its behaviour.

## Options

Not alternatives so much as a checklist — the answer is whichever subset applies.

*Nothing.* A static site. Puzzles ship with the app or are fetched as files; progress lives on the
device and its loss is accepted.

*A copy of progress*, so eviction and device changes are survivable.

*An entitlement* — whether this player has paid — which cannot live on the device, because the
device belongs to the person it would be charging.

*The catalogue* — **settled**, by
[ADR-0009](../decisions/0009-puzzle-content-is-served-by-a-runtime.md). Puzzle content is
served by something that can decide whether to serve it, so it is not shipped as static files with
the application. What is still open here is how much of that content the server understands, which
is [does the server understand puzzle content?](does-the-server-understand-puzzle-content.md).

*Usage we need to see*, which is [its own question](what-must-we-know-about-how-the-app-is-used.md)
and which drives whether stored data must be queryable or can stay opaque.

*A message that reaches a closed app.* Web push requires an application server by construction —
there is no serverless form of it. Whether it is wanted depends on
[one puzzle a day or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md), since a
daily rhythm is the only thing here that would justify interrupting anyone.

*Evidence that a promise is being kept.* [../guarantees/observability.md](../guarantees/observability.md)
names the motivating case exactly: lost progress produces no error and no complaint. A device that
has silently dropped a player's work is the last thing that will report it, and a player who
quietly leaves reports nothing either. This is the one candidate whose whole purpose is to observe
the failure of the others.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**What must we know about how the app is used decides what is collected, not whether anything
runs off-device.** [ADR-0008](../decisions/0008-anything-the-server-stores-is-queryable.md)
settles that whatever is stored is queryable, which is the shape of
[which database, if any?](which-database-if-any.md) rather than whether anything runs off-device at
all. Folding [what must we know about how the app is used?](what-must-we-know-about-how-the-app-is-used.md)
into this question would drag the generator's product questions — puzzle quality,
difficulty grading, generation cost — onto the path to a server decision, and none of them belongs
there.

**Puzzle content does not need a server to be *delivered*, and may need one to be *withheld*.**
Generated ahead of time, puzzles can be static files, and a daily rhythm is satisfiable by shipping
a manifest. Being generated ahead of time does not make them static, though — the same puzzles are
equally rows a runtime serves, and which they are is a real fork rather than a consequence.

The deciding input is not delivery. It is that content shipped as static files alongside the app
cannot be withheld from anyone who already has the app, now recorded in
[../constraints.md](../constraints.md). So an archive that might ever be gated cannot be static, and
the catalogue candidate stood or fell with entitlement rather than separately from it. That is what
[ADR-0009](../decisions/0009-puzzle-content-is-served-by-a-runtime.md) decided, and it names
the cost it took on: a runtime on the path to content, and a caching story the static option got
free.

*Sourced — the delivery fact is now in [../constraints.md](../constraints.md), tiered there.*

**Entitlement is the one candidate that cannot be softened.** Progress can be lost, a catalogue
can be stale, usage can go unmeasured — all degrade gracefully. A paid tier enforced on the device
is not enforced. So [is there a paid tier?](is-there-a-paid-tier.md) is the sharpest input here,
and [../problem.md](../problem.md) records that the option must stay open rather than that it is
committed.

**A server can exist without being on the interaction path.**
[ADR-0002](../decisions/0002-the-client-holds-and-mutates-puzzle-state.md) already puts
authoritative state on the client, so anything here is a background copy or a background check.
Establishing that a server exists does not reopen that decision.

**Each candidate loses on its own, so they are judged together.** Every one can be declined for a
reason that is sound in isolation: progress loss is rare enough to accept, a paid tier is
uncommitted, the catalogue can ship with the build, usage can go unmeasured, notifications are a
nice-to-have, and a bug would surface eventually. Declining all of them separately produces a static
site without any record that a server was rejected, because no single one of those choices is about
the server. So a candidate is struck off this list rather than resolved inside whichever other
question reaches it first, and the list is worked once, whole.

**Recovery after eviction covers a narrower population than the rest of this repo assumes.**
Script-writable storage survives thirty days of browser use, and the seven-day figure applies only
to a domain reached by a tracker-originated decorated link — see
[../constraints.md](../constraints.md). A player returning within a month loses nothing, so this
candidate argues for a server on behalf of players who lapse for longer than that. The promise in
[../guarantees/durability.md](../guarantees/durability.md) is unbounded, so a month-long lapse
still breaks it; what shrinks is how many players it happens to.

**Two candidates decide whether the store must be queryable.** A copy of progress, an entitlement,
and the catalogue are each satisfied by something that stores bytes under a key and never reads
inside them. Usage and observability both require asking questions of the data. So
[which database, if any?](which-database-if-any.md) is a non-decision only if both of those lose;
if either survives, blob against queryable is a real fork and that entry needs rewriting.

**Observability does not conflict with the offline guarantee.** That promise bounds what the network
may do to a player — block, delay, interrupt — and reporting to the maintainer does none of those,
because the player never sees it. What the maintainer is told is not governed by a promise about the
player's experience. What remains true is that anything reporting home has to fail invisibly, since
a failed report must not become a visible error.

**No candidate here has been priced.** This list establishes which are live, not what any costs.
[What is the acceptable running cost?](what-is-the-acceptable-running-cost.md) and
[what load should the server handle?](what-load-should-the-server-handle.md) are both open, and a
candidate that survives on merit can still lose on cost.
