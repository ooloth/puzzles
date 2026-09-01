---
updated: 2026-08-31
update_when: a decision turns out to have rested on something unsettled, or the order is revised
decays: slow
status: active
---

# Decisions

Decisions here are correct when each one derives from something already settled, and the chain
from what the product is for to any technical choice contains no invented link. **The chain is
the deliverable.** A stack assembled from individually sound choices made in the wrong order is
the failure this project is organised against, and unwinding one is why much of `docs/` exists.

The format of a record and the procedure for writing one live in
[../decisions/README.md](../decisions/README.md). This file is about which decision is made, and
when.

## Must

**A decision's inputs are settled before it is made.**
Each input is a fact in [../constraints.md](../constraints.md), a promise in
[../guarantees/](../guarantees/), a statement in [../problem.md](../problem.md), or an earlier
decision. An input that is an inference is an undecided question, and it is decided first. This
is the failure that does not announce itself: a derivation from an unchosen premise stays
invisible precisely because the reasoning built on top of it is sound, so it reads as reasoned for
months and is found by accident.

**A decision's rejected options are ones somebody would have chosen.**
Not plausible alternatives assembled to fill a section — options a competent person weighing this
would actually have picked. Where none exists, there was no decision: there was a description of
the problem, and descriptions belong in `../problem.md` or a question. A template with a Rejected
heading will accept invented alternatives, and the format then lends authority the reasoning never
earned.

**The order decisions are made in is the order they depend on each other.**
Speed and familiarity do not move a decision earlier. How much a decision unblocks is different:
among decisions that do not derive from one another, the one unblocking the most is taken first,
because reaching the decisions that need making is the point of having an order at all. What is
forbidden is moving a decision ahead of something it derives from, whatever it would unblock.
[../questions/README.md](../questions/README.md) holds the order and each entry names what it
derives from, so the sequence is checkable rather than asserted. An out-of-order answer is not
wrong-looking — it is arbitrary and reads as considered, which is what makes the cost fall on
whoever inherits it.

**Every step between a decision and the product statement is named.**
A tool, a library, a runtime, a storage mechanism — each is the last step in a chain, never the
first. You find the chain by starting at the choice in front of you and asking what it rests on,
then asking the same of each answer, until every branch ends in something written down: a fact in
[../constraints.md](../constraints.md), a promise in [../guarantees/](../guarantees/), a statement
in [../problem.md](../problem.md), or a decision already recorded. Working the chain out afterwards
does not do the same job — one reconstructed after choosing contains only the steps its author
already believed in, which is why it always looks complete. Tracing "which database" backward runs
five steps and had a gap at nearly every one. Tracing "which language" runs four and ends at a
product question nobody had asked.

**A decision is narrow in what it settles and wide in what it considers.**
Deciding one thing at a time is not deciding it in isolation. A runtime chosen without looking at
what it does to the database and the hosting is one decision made and two foreclosed, and the
foreclosure is silent — nothing about deploying a hello world announces that a database class has
just been chosen. Before recording a choice, name what else it moves, and check that the things it
moves are ones we would still choose. The failure has two shapes that look like opposites: bundling
several decisions into one record so that none of them is argued, and settling one narrowly while
quietly settling others by consequence. Both are avoided by the same habit, which is to decide the
small thing while looking at the whole system.

**Decisions are sequenced so that a milestone is reached in a state worth keeping.**
Dependency order is the mechanism; the target is an observable state whose choices would not be
revisited. A decision taken in order to reach a milestone, which one would expect to redo shortly
after, has been made too early — it is either missing an input or the milestone is drawn in the
wrong place. **Provisional is not a category here.** If a choice would be redone, either it waits
for what it is missing, or what it is missing joins the milestone. This is what stops a sequence
optimising for arriving somewhere quickly at the cost of arriving somewhere that has to be
dismantled.

**A decision that the next milestone does not need is not made.**
The test is not whether a question could be answered — most could, badly. It is whether reaching the
next observable state requires the answer. Deciding early costs the information that would have
arrived by the time it was needed, and it costs something worse: once a record exists, everything
after it treats the choice as settled, so a decision made before it was required is indistinguishable
from one that was load-bearing. That is how a queue of genuinely foundational decisions gets buried
among decisions that were merely available.

**Deferring is not deciding provisionally**, and the difference is the whole of it. A deferred
question stays open, visibly, and nothing is built on it. A provisional decision is built on
immediately and re-argued later, by which point something depends on it. Where a milestone appears
to need a provisional answer, the milestone is drawn in the wrong place — see the standard above.

**A prerequisite found while tracing is decided before the decision that surfaced it.**
Stop the decision in front of you and go and make the prerequisite first. Not note it and carry
on. Not make the current one provisionally. Not make it and plan to revisit. The prerequisite is
usually the less interesting of the two, which is exactly why writing it down and continuing feels
like progress — but a decision made on top of an open prerequisite is a guess carrying a record's
authority, and nobody reading it later can tell the difference. Where the trace surfaces several
prerequisites, they are made in the order they depend on each other, and the decision that started
it waits for all of them.

## Should

**A decision whose inputs can be measured is measured rather than argued.**
Where the smallest throwaway thing that produces an observation would settle a question, that is
what settles it, and the record cites the observation rather than a comparison of descriptions. This
holds most strongly for tool, runtime and library choices, where published numbers describe someone
else's workload on someone else's hardware and the only figure that binds is the one from here. The
exception is where a spike would cost more than being wrong — say so, and read instead.

A measurement is only better than an argument when it measures the thing the decision turns on. A
benchmark that does not resemble the real workload is worse than no number, because it carries the
authority of evidence without the substance. What makes one usable is recorded in
[../constraints.md](../constraints.md).

**Decisions are deferred until leaving one open would close a door unnoticed.**
Most choices that feel urgent are reversible in an afternoon and cost nothing to postpone. The few
worth stopping for are the ones that narrow everything downstream without announcing that they
have — hosting topology that silently caps a recovery mechanism, a data shape that assumes one
puzzle type, an absent identifier that turns a later feature into a migration. Optionality is
preserved cheaply and early or not at all, and
[../questions/which-doors-must-stay-open.md](../questions/which-doors-must-stay-open.md) names
which doors are being held.

## Consider

**A decision found to rest on something unsettled is demoted rather than annotated.**
A caveat added to a record still leaves it in the folder that holds settled things, where the next
reader cites the conclusion and misses the qualification. Moving it back to a question keeps the
reasoning — as options and findings — without keeping the standing. Nothing is lost by demoting: the
options and findings survive the move, and only the authority goes.

## In scope

- `docs/decisions/`
- The order in `docs/questions/README.md`
- Any choice of tool, library, runtime, platform, or data shape, whether or not it gets a record

## Out of scope

- Choices inside an already-decided area — naming, file layout, formatting
- Reversible experiments that nothing else depends on yet
