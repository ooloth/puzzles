---
opened: 2026-09-01
status: open
resolves_into: decision
---

# Does a guest see anything that accumulates?

## Why it matters

**The harm from eviction is a violated expectation, not lost bytes.** A guest who lapses long enough
for the browser to clear their data loses an unfinished board they had probably forgotten, which is
worth almost nothing. A guest who loses a forty-day streak loses something they were counting.
Whether this project has the second problem is decided here, by what a guest is shown, rather than by
anything in the storage layer.

That makes this the input to
[is guest recovery worth building?](is-guest-recovery-worth-building.md). If nothing accumulates
visibly, recovery has almost nothing to recover and the case for building it is weak. If a streak is
on screen, the case is strong and the mechanism has to exist before the streak does.

Guest stats double as the strongest conversion lever and the largest silent-loss risk at once — see
[how long does a guest's work last?](how-long-does-a-guests-work-last.md), where this question's
answer is one of the things that would tip the guest durability bound.

## What would settle it

Listing everything v1 shows a guest, and asking of each whether its value comes from having built up
over time. A board, a timer and a completion message do not accumulate. A streak, a solved count, a
personal best and an archive do.

Then, for anything that does: is it shown because a player wants it, or because it makes signing in
worth doing? Those are different reasons and only the first survives the guard in
[../problem.md](../problem.md) — would this be worth building if its demonstration value were zero.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, while working
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md). The durability record
demoted on 2026-09-01 rejected guest recovery on the grounds that the answer for a guest wanting
durability is an account.
That reasoning does not hold if the first release ships guests only, and tracing why led here: the
size of the problem is set by what a guest is shown, and nobody had asked.

## Options

*Nothing accumulates.* A guest gets the board they are on and today's puzzle. Eviction costs them an
unfinished board after a month of not visiting, which is close to nothing. Cheapest, and it gives up
the conversion lever entirely.

*Accumulating things exist, and are shown only once something can restore them.* A streak appears for
a signed-in player, or for a guest if guest recovery is built. The rule is that a stat becomes
visible when a mechanism can carry it, not before. Keeps the lever without creating the loss.

*Everything is shown to everyone, and the loss is accepted.* Simplest to build and the most generous
to a guest who never lapses. It is also the shape that produces the failure the durability record describes,
silently, to exactly the players least likely to report it.

*Everything is shown to everyone, and the limit is disclosed.* The same, with the guest told what
will not be kept. the durability record deliberately left the disclosure question open, and it is a real tradeoff:
saying nothing makes the loss silent, and saying it on the first visit is a warning before there is
anything to lose.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A board's value decays with absence and a streak's does not.** This is the asymmetry the whole
question turns on. Losing a two-month-old unfinished sudoku costs a player nothing they will notice.
Losing the count of how many days in a row they played costs them the thing they were playing for.

*Reasoned — an inference about what players value from how the two artifacts differ, not an
observation of anyone.*

**The population exposed is narrower than "guests".** The clearing window in
[../constraints.md](../constraints.md) counts days the browser was actually used, not calendar days,
so a guest must go thirty browser-active days without opening this app. Anyone who does that has
churned by any ordinary definition. What accumulating stats create is a bad experience for a
**returning** churned player, which is a smaller group and a more interesting one.

*Sourced — follows from the WebKit behaviour recorded in [../constraints.md](../constraints.md).*

**Gating on an account and gating on a mechanism are different rules, and only one is honest.**
Gating a streak behind signing in says the streak requires identity, which is false — it requires
something that survives. Gating it behind whatever can carry it says what is actually true, and it
lets a guest have a streak the moment guest recovery exists. It also avoids introducing the concept
of an account to a player who has no other reason to meet one.

**A daily rhythm is what makes streaks mean anything.**
[Is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md) is
unanswered and is the product question underneath this one — a streak is meaningless under unlimited
play, and close to automatic under a daily puzzle.
