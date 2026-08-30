---
updated: 2026-08-30
update_when: never — this describes the format, not the decisions
decays: never
---

# Decisions

A record of the reasoning behind choices that took some thought, or could reasonably
have gone a different way.

One file per decision: `NNNN-kebab-title.md`, numbered in the order made.
**Append-only** — a decision that changes is *superseded* by a new one, never edited.
The record of what we believed at the time is the entire point.

_No decisions recorded yet._

## Cite, don't restate

Every **Forced by** must reference specific entries in [constraints.md](../constraints.md),
[problem.md](../problem.md) or [guarantees.md](../guarantees.md) — not repeat their content.
Those files are the standing input; ADRs are downstream of them, never the reverse. If the
reasoning depends on a fact that isn't written down yet, **add it there first, then cite it.**

An ADR citing nothing was made on vibes.

## Template

<!-- Template:

---
number: 0001
status: proposed | accepted | superseded by 00NN
date: YYYY-MM-DD
---

# 0001 — <the choice, plainly stated>

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
- [ ] guarantees.md — promises this decision commits us to
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
