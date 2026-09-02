---
number: 0015
status: accepted
date: 2026-09-02
---

# 0015 — The issue tracker is GitHub Issues

## Forced by

**[ADR-0001](0001-decisions-live-in-docs-and-work-lives-in-issues.md) deliberately left this open and
named the moment to close it.** Its Decision says "an issue tracker holds work" and its footer says
"which tracker is not settled here… GitHub is the assumption, by inheritance rather than by
argument." Its **Revisit when** names the trigger: "the first implementation work exists. Issues
start then, not before."

**That moment has arrived.** [../questions/README.md](../questions/README.md) now describes M1 as six
delivery slices, each with an observable definition of done. Those are work items, not decisions —
there is no reasoning to preserve once "a server answers one route" is true.

**[../problem.md](../problem.md) names a public demonstration as one of three reasons this exists**:
"a system whose operation is worth describing to someone hiring for it." Where the work log lives is
part of what is being demonstrated.

## Decision

**Work is tracked as GitHub Issues in this repository.**

**One issue per delivery slice**, as those are defined in
[../questions/README.md](../questions/README.md). The title is the slice's observable and the
definition of done is that the observable is true.

**Grouped by GitHub milestone, one per M-number**, created when that milestone becomes the current
one rather than all at once. Creating a milestone commits nothing, but sixteen empty ones read as a
plan and contradict the rule in [../questions/README.md](../questions/README.md) that milestones
below the current one stay unplanned.

**No due dates on milestones.** The field exists and filling it would invent a schedule this project
does not have.

**The slice order is the drag-order of issues within the milestone.** GitHub supports reordering
issues inside a milestone, which expresses the sequence natively with no second copy to drift. Title
prefixes like `M1.1` were considered for this and are not used: they encode the order in a string
that silently lies the moment anything moves.

**Native issue dependencies are not used**, for the reason under Risk. A `blocked` label is used
instead, applied while a slice's questions are still open — so `is:open -label:blocked` means
startable. It is derived from the docs and will drift, so it is a convenience rather than a source of
truth.

**Sub-issues when a slice needs breaking into tasks**, and not before. Milestones already provide the
one grouping level M1 needs.

**Issues carry no reasoning.** An issue that turns out to need a decision stops and points at the
question, per [ADR-0001](0001-decisions-live-in-docs-and-work-lives-in-issues.md).

## Rejected

- **Linear.** A better tracker on the merits — faster, keyboard-driven, real cycles and projects, and
  already in the maintainer's tooling. Rejected because it puts the work log behind a login while the
  repository is public, so the record of how this was built is visible to nobody evaluating it. That
  disqualifies it on its own, independent of any comparison of features. Reverses if the repository
  stops being public, at which point the demonstration argument disappears and Linear wins on merit.

- **`trekker`, the maintainer's local task CLI.** Zero setup, already installed, and used during the
  session that produced this record. Rejected because it is local to one machine: the work does not
  survive that machine and cannot be seen by anyone else. Reverses if the work log stops needing to
  outlive the laptop or be visible to anyone.

- **Not yet — keep tracking work as prose in question files.** The honest "not yet", and correct up
  to now. Rejected because [ADR-0001](0001-decisions-live-in-docs-and-work-lives-in-issues.md)
  already identified what continuing costs: "while `docs/` is still the only tracker, real tasks
  accumulate as prose inside question files, where nothing marks them as unstarted." M1's slices are
  exactly that shape today. Reverses if the slices turn out not to be work items after all.

- **GitHub Projects layered on Issues.** Boards, custom fields, and a view that could hold the
  ordering. Rejected because it is a second surface to maintain before there are enough issues to
  need one — and the ordering it would hold is a whole-system judgement that
  [../questions/README.md](../questions/README.md) already carries with its reasoning attached.
  Reverses when a flat list per milestone stops being readable.

## Risk

**The tracker cannot express what actually blocks a slice.** GitHub does have native issue
dependencies — "blocked by" and "blocking", generally available since 2025-08-21, with API and search
support — but they link issues to issues. This project's blocking edges run from a slice to an
*open question*, and questions are never issues, per
[ADR-0001](0001-decisions-live-in-docs-and-work-lives-in-issues.md). So the one relationship worth
recording is the one the feature cannot hold, and using it slice-to-slice would encode a graph this
project does not have. Anyone working from the tracker alone will find a list that looks ready and
is not.

*Sourced — <https://github.blog/changelog/2025-08-21-dependencies-on-issues/>, read 2026-09-02.*

**Two places to look, permanently.** Accepted because they hold different things, which is
[ADR-0001](0001-decisions-live-in-docs-and-work-lives-in-issues.md)'s argument and has not changed.

**The work log is now tied to one vendor**, along with the code. Moving hosts later means moving the
issue history or losing it.

## Revisit when

- **The repository stops being public.** The reason Linear lost disappears with it.
- **A flat list of issues per milestone stops being readable**, which is the condition that would
  bring GitHub Projects back.
- **Issues start carrying reasoning, or questions start being opened as issues.** That is
  [ADR-0001](0001-decisions-live-in-docs-and-work-lives-in-issues.md)'s own revisit condition and it
  applies here unchanged: it means the boundary needs restating rather than enforcing.

## Also update

- [x] `questions/README.md` — records that slices become issues, and that status lives in the tracker
- [x] `CLAUDE.md` — the workflow, where an agent will meet it rather than having to open this record
- [x] Nothing in `constraints.md` — this imports no fact about the world
- [x] Nothing in `guarantees/` — this promises a player nothing
- [x] Nothing in `glossary.md` — "issue" and "milestone" carry their ordinary meanings

Deliberately not decided here: what an issue template contains, how issues are labelled, and how the
derivation in `questions/README.md` divides against the tracker — that is
[ADR-0016](0016-a-delivery-slice-is-an-issue-and-its-derivation-stays-in-docs.md).
