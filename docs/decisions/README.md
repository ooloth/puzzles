---
updated: 2026-08-30
update_when: never — this describes the format, not the decisions
decays: never
---

# Decisions

A record of the reasoning behind choices that took some thought, or could reasonably
have gone a different way.

One file per decision: `NNNN-kebab-title.md`, numbered in the order made.
**Append-only** — a decision that changes is _superseded_ by a new one, never edited.
The record of what we believed at the time is the entire point.

_No decisions recorded yet._

## Before you decide

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
3. **Find three options, and make one of them "not yet."** Two options is a coin toss with
   extra steps. Doing nothing, or the dumbest thing that could work, is the most frequently
   correct and least frequently considered option.
4. **Predict each option's failure.** How does it break, and would we notice? An option that
   fails silently should lose to one that fails loudly, even when it's otherwise better.
5. **Write down what would change your mind — before deciding.** Pre-committing to the
   disconfirming evidence blocks motivated reasoning, and it's what fills in **Revisit when**.

**Decide one thing at a time.** A decision about how processes relate is not a decision about
how modules are organised, and a decision about where something runs is not a decision about
what it stores. Letting the second ride along inside the first is how a choice gets made
without anyone noticing it was made, and without it ever being argued.

**Familiarity is not a reason.** "I already know X" is a legitimate cost input, but it has to
be stated as a cost of adopting Y — never smuggled in as a merit of X.

## Cite, don't restate

Every **Forced by** must reference specific entries in [constraints.md](../constraints.md),
[problem.md](../problem.md) or [guarantees/](../guarantees/) — not repeat their content.
Those files are the standing input; ADRs are downstream of them, never the reverse. If the
reasoning depends on a fact that isn't written down yet, **add it there first, then cite it.**

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
