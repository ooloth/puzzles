---
number: 0006
status: accepted
date: 2026-09-01
---

# 0006 — A player's work survives per persona, and the record is one shape

## Forced by

**[../guarantees/durability.md](../guarantees/durability.md) promises a player's work is still there
when they return, "whatever ended the session", with no bound and no device named.** The same
sentence can be read as "until the tab closes" and as "forever, anywhere". Every decision downstream
has been made against whichever reading was in mind at the time.

**[../problem.md](../problem.md) states that a record of a player's play is theirs to keep, and
outlives any one device.** Nothing in `../guarantees/` covers that. The promise there is written
about grid entries, pencil notes and selection — the board in front of them — while eviction takes
the finished puzzles and the play record along with it.

**[../constraints.md](../constraints.md) records that eviction is all-or-nothing.** Script-writable
storage goes after thirty days of browser use, and it takes the board, every past board, the play
record, any locally-held identifier and the cached shell together. There is no arrangement where the
board is lost and the history survives.

## Decision

Two bounds, by persona, and one shape underneath both.

**A signed-in player's work survives indefinitely, on any device.** The board in progress, every
board they have played, and their play record. This is what
[an account](../questions/are-there-user-accounts.md) is for.

**A guest's work survives in the browser that made it, for as long as that browser keeps it.** No
second device and no recovery once it is gone. Today that means the board they are working on, kept
until they finish it rather than discarded at midnight.

**The guest record and the account record are the same shape.** Signing in promotes what is already
there; it does not convert or translate it. This is the load-bearing half of this decision — the
bounds could be revised later at ordinary cost, and this could not.

Guest storage holds *a player's record that currently contains one board*, not *a board*. If a play
record, streaks or stats are ever shown to a guest, they sit inside the guest bound above and are
promised nothing more. That keeps the option open without it quietly acquiring a promise the tier
cannot keep.

## Rejected

- **One bound for everyone.** Either it is the signed-in bound, which cannot be kept for a player
  with nothing to attach work to, or it is the guest bound, which abandons what `../problem.md` asks
  for. A single bound was the shape of this question until it was rescoped, and it is why the answer
  looked either dishonest or expensive.

- **Guests keep only the current day, with unfinished boards discarded.** Genuinely simpler: a board
  stale in twenty-four hours makes eviction irrelevant to guests entirely, and the thirty-day figure
  stops being load-bearing for that tier. It is also what circle9puzzle and inkwellgames do, so it
  is a known pattern rather than a strawman. Rejected because it contradicts the two things
  `../problem.md` lists first — work is never lost however the session is interrupted, and reopening
  finds the exact board they left — and because being unable to finish yesterday's puzzle is a
  known annoyance in the products that do it. Keeping one unfinished board costs almost nothing.

- **An anonymous server copy for guests, recovered through a server-set cookie.** The cheapest
  recovery available and invisible to the player: local data is wiped, the cookie survives, the
  server returns the state, and nothing is ever said. Rejected because it duplicates what signing in
  provides while carrying three costs that do not go away — rows keyed to tokens nobody will present
  again accumulate indefinitely, data about people who cannot be identified also cannot be deleted
  on request, and the mechanism silently degrades to seven days if the API is not judged
  first-party. Where a guest wants durability, the answer is an account.

- **Deciding only what the guest-only first release needs.** The intended sequence ships guests
  first, and answering this question for that phase would be the cheapest thing to do today.
  Rejected because [which client storage mechanism](../questions/which-client-storage-mechanism.md)
  is the one stack choice with no clean migration path: changing it later means moving every
  existing player's data with code that runs once, in their browser, correctly, with no server to
  retry from. The end state is decided here; the phase decides only what gets built first.

## Risk

**This forces a server, and does so before
[whether a server exists](../questions/what-must-be-true-off-device.md) has been argued.** The
signed-in half cannot be delivered without one. That question is still worked whole against its
whole inventory — a candidate surviving is not the same as the decision being taken — but the
outcome is no longer genuinely open, and pretending otherwise would be theatre.

**A guest can still lose work silently, and this decision accepts that.** It is
[the recorded failure mode](../failure-modes/a-players-progress-vanishes-after-a-month-away.md), and
the mitigation is an account rather than engineering. Whether a guest is ever told the limit is a
product question and is not settled here. Saying nothing means the loss is silent; saying it on the
first visit is a warning before there is anything to lose.

**Guest stats would be the strongest conversion lever and the largest silent-loss risk at once.**
Showing a growing streak is what makes signing in worth doing, and it also creates something worth
keeping in a place that cannot keep it. A board's value decays with absence; a streak's does not.
Nothing here builds them, and the constraint above is what stops them acquiring a promise later by
accident.

**Two bounds are harder to hold than one.** Every promise downstream now has to name which persona
it covers, and a guarantee that quietly generalises will read as true and be false for half the
players. This is a standing cost on `../guarantees/`, not a one-time edit.

## Revisit when

- **The guest tier stops being where new players start.** These bounds assume the first play works
  without an account, which `../problem.md`'s audience — casual, not technically sophisticated,
  found rather than marketed — is what requires.
- **A guest is shown anything that accumulates**, at which point the silent-loss risk above stops
  being hypothetical and the question of telling them the limit has to be answered.
- **A shipped browser is found not to match the thirty-day window in `../constraints.md`**, per
  [how long does Safari really keep our storage?](../questions/how-long-does-safari-really-keep-our-storage.md).
  A much shorter real window makes the guest bound weak enough to reconsider.

## Also update

- [x] `guarantees/durability.md` — rewritten from one unconditional promise into two scoped ones,
      covering the play record as well as the board
- [x] Nothing in `constraints.md` — this imports no new facts about the world

Deliberately not decided here: whether a server exists, which storage mechanism holds any of this,
what identity a signed-in player has, when each phase ships, whether guests are shown stats, whether
a guest is told the limit, and what a guest can reach beyond the board they are working on — which
is [one puzzle a day, or unlimited play?](../questions/is-there-one-puzzle-a-day-or-unlimited-play.md).
