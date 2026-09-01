---
number: 0007
status: accepted
date: 2026-09-01
---

# 0007 — Decisions live in docs, work lives in issues

## Forced by

**Two kinds of thing need tracking and they want opposite shapes.** A decision is read in aggregate:
its value is the chain from what the product is for to the choice, and a reader needs the neighbours
to check it. [../standards/decisions.md](../standards/decisions.md) puts it plainly — the chain is
the deliverable. Work is the opposite. Its value is that exactly one thing is in front of you, and
its neighbours are noise until it is done.

**[../standards/documentation.md](../standards/documentation.md) forbids the obvious mistake.**
Content that appears in two places changes in one edit. Mirroring sixty open questions into an
issue tracker creates sixty pairs that can disagree, and the copy a reader finds first wins.

## Decision

**`docs/decisions/` and `docs/questions/` hold decisions**: what was chosen and why, and what has
yet to be chosen and in what order. They are read as a set, and their order is part of their
meaning.

**GitHub issues hold work**: something to build, with a definition of done and no reasoning to
preserve once it is closed.

The test when it is unclear: **after this is finished, is there reasoning worth keeping?** If yes it
is a decision and it belongs in `docs/`. If the artifact is the whole of it, it is work and it
belongs in an issue.

**Neither restates the other.** A question is not opened as an issue. An issue that turns out to
need a decision stops and points at the question, rather than deciding inside itself.

**Milestones live in [../questions/README.md](../questions/README.md) until there are issues to
group.** Once implementation begins, GitHub Milestones become where issues are grouped and that file
links to them rather than restating them.

## Rejected

- **Issues for everything, including decisions.** One tracker, one habit, nothing to keep in step.
  Rejected because an issue tracker shows one item at a time and hides the ordering that
  `docs/questions/README.md` exists to carry — and because a closed issue is archived, while a
  decision has to stay legible for as long as anything rests on it.

- **Docs for everything, including work.** Also one place, and it is what has happened so far
  because everything so far has been documentation. Rejected because it has no notion of assignment,
  state or done, and because a task with no reasoning attached is pure overhead in a format built to
  carry reasoning.

- **Not yet — keep using documents until it hurts.** The genuine "not yet", and it is correct right
  up to the point where the first implementation work exists. This record exists so that the
  transition is a decision rather than a drift, since the natural failure is opening issues that
  duplicate questions because the boundary was never stated.

## Risk

**The boundary will be wrong in specific cases and the test above will not settle them.** A spike is
the clearest: throwaway work that exists to produce an observation, where the observation is
reasoning worth keeping and the code is not. That one splits — the work is an issue, the finding
goes into the question that prompted it.

**Two trackers is more overhead than one, for one maintainer.** Accepted because they hold different
things, and the cost of the alternative is either losing the order or losing the reasoning.

**A stalled transition leaves work in neither place.** While `docs/` is still the only tracker, real
tasks accumulate as prose inside question files, where nothing marks them as unstarted. The global
convention of persisting an approved approach to a ticket before touching files is what should catch
this, and it only works once there is a tracker to persist to.

## Revisit when

- **The first implementation work exists**, which is the point this record is written for. Issues
  start then, not before.
- **Questions start being opened as issues, or issues start carrying reasoning.** Either means the
  test above is not doing its job and the boundary needs restating rather than enforcing.

## Also update

- [x] Nothing in `constraints.md` — this imports no facts about the world
- [x] Nothing in `guarantees/` — this promises a player nothing

Deliberately not decided here: which tracker, what an issue template contains, and how milestones
are named. The first is GitHub by assumption rather than by argument, and nothing yet depends on it.
