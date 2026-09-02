---
opened: 2026-09-02
status: open
resolves_into: decision
---

# Does a player see stats about their play?

## Why it matters

[../problem.md](../problem.md) says a player's record of play is theirs to keep — "what they have
solved, and how they are doing" — and outlives any one device. The first half is a list of finished
puzzles. The second half is a claim that the app tells a player something *about* their play, and
nothing has argued what that is or whether it ships.

It sizes what the server holds. A list of completions is one row per finished puzzle. Anything
derived from how a solve went — time taken, where a player stalled, how often a first guess was
wrong — needs the solve itself recorded rather than its outcome, and that is a different volume of
data and a different privacy exposure.

It is also the one player-facing use of the store that
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) does not
cover. That record preserves the *maintainer's* ability to ask questions of stored play. Showing a
player something about their own play is a separate commitment, and answering it "no" is a
legitimate outcome.

## What would settle it

Deciding whether the app shows a player anything beyond the board and the list of what they have
finished — and if so, what, at the level of "this specific thing on this specific screen" rather
than "some stats".

Two things worth checking rather than assuming. Whether anything here has to be computed at write
time or can be derived on read, because only the first constrains the shape of what is stored. And
whether any of it is wanted for a guest, which is where it meets
[does a guest see anything that accumulates?](does-a-guest-see-anything-that-accumulates.md) — that
question asks whether a guest accumulates anything at all, and this one asks what accumulating
would consist of for anybody.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02, while mining [../problem.md](../problem.md) and every record in
[../decisions/](../decisions/) for product intent that an infrastructure decision could foreclose
without noticing. "How they are doing" was intent with nothing tracking it.

## Options

*Nothing.* The app shows the board and no history. The sentence in `../problem.md` is read as
covering only what a player has solved, and the second half is dropped deliberately rather than
left ambiguous.

*Completions only.* Which puzzles were finished, and when. One row per finished puzzle, derivable
from what is stored anyway, and no new commitment about what is recorded during a solve.

*Derived statistics.* Streaks, solve times, difficulty distribution, and similar. Needs the solve
recorded rather than its outcome, which is more data about a player and a privacy question that
[do privacy regulations apply?](do-privacy-regulations-apply.md) has not researched.

*Not yet.* Nothing is shown, nothing is ruled out, and the store keeps enough that the question
stays answerable — which
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) may already
have secured for free.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The data needed to answer this later may already be preserved.**
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) requires the
store to be queryable rather than opaque, for the maintainer's own feedback loop. If what it keeps
is the solve rather than the outcome, a player-facing view is a read over data that already exists.
That would make this a product question with no storage consequence — which is worth confirming
rather than assuming, because it is the difference between deciding this now and deferring it
safely.

*Reasoned — from what
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) requires, not
from any schema, which does not exist.*

**Nothing is promised.** [../guarantees/](../guarantees/) holds no promise about a player's record
of play, and its durability theme says so explicitly: only the board in progress is covered, and
"a player's record of play" has no promise yet.

**Answering this "no" costs nothing today and closes little.** Nothing is built on it, and the
storage shape that would make it possible is being secured for a different reason.
