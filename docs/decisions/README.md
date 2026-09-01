---
updated: 2026-08-30
update_when: never — this describes the format, not the decisions
decays: never
---

# Decisions

A record of the reasoning behind choices that took some thought, or could reasonably
have gone a different way.

One file per decision: `NNNN-kebab-title.md`, numbered in the order made.

**A decision that changes is superseded by a new record, not edited into a different one.** The
point is that what we believed at the time survives, so a record is never quietly rewritten to look
better than it was, and reasoning that was wrong stays visible.

That is not a rule against touching the file. Correcting a wrong figure, fixing a broken link,
repointing a reference to a renamed file, or rewriting an unclear sentence are all improvements to
the same record and should be made — a record carrying a number we know is wrong is worse than one
that has been edited. The test is whether the reasoning would still read the same to someone who
disagreed with it. Note substantive amendments with an `amended:` date in the frontmatter.

## Before you decide

**Read [../standards/decisions.md](../standards/decisions.md) now, even if you read it earlier in
this session.** A remembered summary produces a record that fits this format and breaks a rule.

**Find this decision in [../questions/README.md](../questions/README.md) and check the milestone it
sits in.** That file is this one's sibling: the same decisions, before they are made, grouped by
what they block. A question is ready when everything its milestone entry names as an input is
answered. If anything is not, the record you are about to write will be arbitrary — and it will not
read as arbitrary, which is the whole cost. Write the missing question instead, and work that.

Sequencing lives in that file and nowhere else. Question files do not state what they depend on, so
there is no second copy of the ordering to consult or to disagree with.

If the decision is not in that order at all, add it there first. A decision nobody could see
coming is one nobody checked the prerequisites of.

The same applies in reverse. When a record here turns out to rest on something unsettled, the
entry in [../unfinished.md](../unfinished.md) is written in the same edit that discovers it —
before the fix is scheduled, and whether or not it is ever scheduled. That file is what protects a
reader in the window between finding a record unsound and repairing it, and it only works if
writing to it is bound to this moment rather than to somebody remembering.

A template captures a decision; it doesn't improve one. A coin toss written up in this
format is worse than a scrappy one — the format lends it authority it didn't earn.

**Size the decision first.** How expensive is it to reverse? Cheap-to-reverse decisions
deserve a coin toss: pick one and move. Everything below is for the expensive ones.
Spending equal effort on both is the real waste.

1. **State the problem without naming a solution.** Coin tosses happen because the question
   got framed as "X or Y" instead of "what must be true." A solution-free statement often
   reveals the answer is "neither."
2. **Estimate the magnitudes.** How much data, how often, how large, how fast, how many.
   Most bad technical decisions come from never having done the arithmetic — "this is 40MB
   and 200ms" dissolves most debates before they start. If you can't get within an order of
   magnitude, that _is_ the finding: go measure, then decide.
3. **Ask what would be cheaper to build than to argue about.** Most tool and runtime questions
   are answerable by a spike — the smallest throwaway thing that produces an observation — and
   a spike settles them better than reading, because it measures this project on this hardware
   rather than someone else's. Budget hours, delete it afterwards, and record what you ran
   alongside what you saw. A measurement whose method is not written down is an assertion with
   a number in it. Where nothing can be spiked, say so, so that reading is a choice rather than
   a default.
4. **Find three options, and make one of them "not yet."** Two options is a coin toss with
   extra steps. Doing nothing, or the dumbest thing that could work, is the most frequently
   correct and least frequently considered option.
5. **Predict each option's failure.** How does it break, and would we notice? An option that
   fails silently should lose to one that fails loudly, even when it's otherwise better.
6. **Write down what would change your mind — before deciding.** Pre-committing to the
   disconfirming evidence blocks motivated reasoning, and it's what fills in **Revisit when**.

**Decide one thing at a time — and look at everything while you do.** A decision about how
processes relate is not a decision about how modules are organised, and a decision about where
something runs is not a decision about what it stores. Letting the second ride along inside the
first is how a choice gets made without anyone noticing it was made, and without it ever being
argued.

That is about what a record *settles*, not about what it *considers*, and the two pull in opposite
directions if the difference is missed. A choice made without looking at what it forecloses
elsewhere is narrow in the wrong way: one thing decided, several settled by consequence, none of
them argued. Name what else the choice moves before recording it. Both halves are stated as
standards in [../standards/decisions.md](../standards/decisions.md).

**Familiarity is not a reason.** "I already know X" is a legitimate cost input, but it has to
be stated as a cost of adopting Y — never smuggled in as a merit of X.

## Cite, don't restate

Every **Forced by** must reference specific entries in [constraints.md](../constraints.md),
[problem.md](../problem.md), [guarantees/](../guarantees/) or [standards/](../standards/) — not
repeat their content. Those are the standing inputs; ADRs are downstream of them, never the
reverse. If the reasoning depends on a fact that isn't written down yet, **add it there first,
then cite it.**

Standards belong on that list because they can decide a question, not only shape how the answer
is built — an option that satisfies a standard by construction is preferable to one that
satisfies it only if nobody slips. Their scope lines describe when a file is being edited, so
nothing pulls them into view while a decision is still being made. Go and look.

An ADR citing nothing was made on vibes.

## Template

<!-- Template:

---
number: 01
status: proposed | accepted | superseded by 00NN
date: YYYY-MM-DD
---

# 01 — <the choice, plainly stated>

## Forced by
<the constraint, user need, or ranking that made this necessary — by reference>

## Decision
<what we're doing>

## Rejected
- <Option A> — because <the actual disqualifying reason>
- <Option B> — because <...>

## Risk
<the real cost or weakness being knowingly accepted>

## Revisit when
<the condition that should trigger reconsidering this>

## Also update
- [ ] constraints.md — givens this decision imports
- [ ] guarantees/ — promises this decision commits us to
-->

## Guidance

- **Rejected** entries need the actual disqualifying reason, not a bare label. "Considered
  X" tells a future reader nothing; "considered X, rejected because Y" does.
- **Risk** is the section that keeps an ADR honest rather than a justification. If nothing
  is being knowingly accepted, either the decision was trivial or the risk hasn't been found.
- **Revisit when** should name an observable condition, not a date. It's what lets a future
  reader tell whether circumstances have crossed the line — without it, every ADR reads as
  equally binding forever.
- An unchecked box under **Also update** is visibly unfinished work. `constraints.md` stays
  empty exactly when people skip it.
