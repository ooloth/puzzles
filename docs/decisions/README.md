---
updated: 2026-08-30
update_when: never — this describes the format, not the decisions
decays: never
---

# Decisions

A record of the reasoning behind choices that took some thought, or could reasonably
have gone a different way.

One file per decision: `NNNN-kebab-title.md`.

**Numbers follow the order decisions derive from each other, not the order they were written.** A
record inserted into the middle of the chain renumbers everything after it, and every link with it.
That churn is a one-time cost each time and it buys something permanent: reading the listing top to
bottom is reading the argument being built, from the product statement forward. Chronology helps
nobody — what a reader needs is which decisions a decision rests on, and the numbers carry that for
free. `scripts/check-docs.py` catches every link a renumber breaks, so the operation is mechanical.

**A decision that changes is superseded by a new record, not edited into a different one.** The
point is that what we believed at the time survives, so a record is never quietly rewritten to look
better than it was, and reasoning that was wrong stays visible.

That is not a rule against touching the file. Correcting a wrong figure, fixing a broken link,
repointing a reference to a renamed file, or rewriting an unclear sentence are all improvements to
the same record and should be made — a record carrying a number we know is wrong is worse than one
that has been edited. The test is whether the reasoning would still read the same to someone who
disagreed with it. Note substantive amendments with an `amended:` date in the frontmatter.

## Before you decide

**Start with a listing of this folder, and open what bears on your question.** That works because
every title states what is now true, so the listing is the checklist of settled constraints on
implementation — the same job [../guarantees/](../guarantees/) does for promises to players. If a
title does not tell you whether to open the file, the title is wrong and fixing it is the first task.

**Read [../guarantees/](../guarantees/) too.** Promises are not decisions and do not live here, but
they bind just as hard. [Play continues through a loss of
connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md) constrains a stack
choice as tightly as anything in this folder and appears nowhere in it.

**Read the portable decision-making standard now, even if you read it earlier in
this session.** A remembered summary produces a record that fits this format and breaks a rule.

## One record, one decision

**A record settles exactly one thing, and its title says what.** The test for whether you have two:
_could a reasonable person have decided the headline one way and the second thing the other way?_ If
yes, that is a second decision and it needs its own record. If no, it follows necessarily — and it is
still recorded, see below.

Two failures this prevents, both of which have happened here:

- **A decision settled inside a record about something else.** [ADR-0003](0003-this-is-delivered-over-the-web.md) mandated a storage interface
  and a JSON server contract in a section outside its own Decision heading, under a title announcing
  it decided the delivery platform and nothing else. Nobody scanning this folder would have found
  either.
- **A record contradicting itself about what it settled.** The durability record demoted on
  2026-09-01 had a Risk section saying it forced a server and a footer saying whether a server exists
  was undecided. A reader checking the footer to see what was open got the wrong answer from the same
  file.

**A consequence is recorded as a decision, not left implicit.** Something that follows necessarily
from an earlier record is still a constraint on implementation, and one that lives only inside
another record's reasoning is invisible to anyone reading the listing. It uses the same template as
everything else. Where it has no genuine alternative, **Rejected** says so and names what rejecting
it would actually mean — usually reversing the parent — rather than inventing an option to fill the
section. [ADR-0010](0010-the-store-needs-a-host-so-this-system-has-a-server.md) is the worked example.

**Do not fear a long listing.** Atomic records multiply, and that is the cost being paid for a folder
whose filenames are load-bearing. A hundred short titles you can scan beats twelve long records you
have to read.

## The title is the takeaway

**A title states what is now binding, not why it was decided.** The motive belongs in **Forced by**
and in the rationale; the title belongs to whoever will have to abide by it and has not read the
file.

This is easy to get backwards, and three records here did. "The option to gate puzzle access is
preserved" names a motive, and nobody looking for how puzzle content is delivered would open it. It
is now "puzzle content is served by a runtime, not shipped with the app" — the same record, titled by
its conclusion. Records that exist to keep a future reachable are especially prone to this, because
the option feels like the point. It is the reason; the constraint is the point.

**A record that preserves an option says so in its Decision section**, so the reason is one line
inside the file rather than a category in the filename.

**Name the record for what a future agent must now abide by.** A title is a claim about the system
that is true after this record and was not before — an invariant facing the architecture, the way
[../guarantees/](../guarantees/) holds the ones facing the player. Not the topic, not the motive, not
the option preserved. If someone scanning `ls docs/decisions/` cannot tell whether this record
constrains their work, rename it.

## Write the Rejected section first

**Before the Decision section, and before you have chosen.** An option you can only argue against
after picking a winner was never evaluated — it was justified against. This is the single change most
likely to improve a record here, because an audit on 2026-09-01 found that every weak reason in this
folder argued for the option that lost, and not one argued for the option that won. Reasoning that is
sloppy in only one direction is not sloppy.

**Each option is evaluated from first principles, without bias.** No claim carried over from an
earlier document without re-establishing it. No assumption stated as a fact. No number without its
source. A rejection is held to the same evidence bar as **Forced by**: it cites
[../constraints.md](../constraints.md), [../guarantees/](../guarantees/),
[../problem.md](../problem.md), or another record.

**Nothing enforces that, and a check that tried was removed.** It looked for a citation anywhere in a
rejected option, and it passed [ADR-0003](0003-this-is-delivered-over-the-web.md) — whose bullets cite `problem.md` for one thing and then make
five specific, checkable, unsourced claims about vendor policies and version numbers. A check that
answers "is there a link" cannot answer "does this support the claim beside it", and reporting clean
on the record that motivated it is worse than not running. `prep-for-codebase-handoff` reads for it
instead.

**One disqualifying reason, named.** Not a stack. If three are listed, say which one would disqualify
the option on its own — and if none would, the option is not disqualified and you have more work to
do. Three individually weak reasons read as one strong case, and nobody asks which is load-bearing.
That is exactly how the durability record demoted on 2026-09-01 foreclosed the only free recovery
mechanism available: two of its three reasons turned on questions that were still open, and the third
was a routine cleanup job described as though it were structural.

**Every rejection says what would have to change for it to reverse.** A rejection with no reversal
condition cannot be checked, and it is permanent by default — a chosen option gets tested by reality,
and a rejected one never does.

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

That is about what a record _settles_, not about what it _considers_, and the two pull in opposite
directions if the difference is missed. A choice made without looking at what it forecloses
elsewhere is narrow in the wrong way: one thing decided, several settled by consequence, none of
them argued. Name what else the choice moves before recording it. Both halves are stated in the
portable decision-making standard.

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

The decision-making rules themselves are portable and live outside this repo, in the shared
engineering standards — not under `standards/` here. A **Forced by** that leans on them names
the standard in prose rather than linking into `standards/`, since there is nothing local to
link to.

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
- [ ] questions/README.md — which questions this settles, re-scopes, or moves to another milestone
- [ ] architecture.md — system boundaries or relationships this decision defines
- [ ] constraints.md — givens this decision imports
- [ ] glossary.md — domain terminology this decision introduces
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
- **The `questions/README.md` box is the one that stops the milestone list going stale.** A record
  almost always changes what some question is asking, or which milestone needs it, or whether it
  still needs asking at all — and nobody notices from inside the record. Two examples left over
  after a day's work: `what-runs-the-server-if-there-is-one` and
  `what-does-the-server-store-if-anything` both carry conditionals that records have since answered.
  Tick the box by saying what moved, or by saying nothing did.
