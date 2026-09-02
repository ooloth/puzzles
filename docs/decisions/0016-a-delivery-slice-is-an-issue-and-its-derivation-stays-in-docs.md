---
number: 0016
status: accepted
date: 2026-09-02
---

# 0016 — A delivery slice is an issue, and its derivation stays in docs

## Forced by

**[ADR-0015](0015-the-issue-tracker-is-github-issues.md) creates an overlap that
[ADR-0001](0001-decisions-live-in-docs-and-work-lives-in-issues.md) anticipated but did not size.**
That record says milestones live in `questions/README.md` "until there are issues to group", after
which the file "links to it rather than restating it". There are now issues to group, and
`questions/README.md` holds six slices with definitions of done — which is the tracker's shape.

**[../standards/documentation.md](../standards/documentation.md) names the failure**: content that
appears in two places changes in one edit, and the copy a reader finds first wins.

## Decision

**A delivery slice is one issue.** Its title is the slice's observable; its definition of done is
that the observable is true.

**The tracker is authoritative for what work exists and what state it is in.** Status, assignment,
ordering within a milestone, and whether something is done are read there and nowhere else.

**[../questions/README.md](../questions/README.md) is authoritative for the derivation**: what each
slice rests on, which questions block it, and why the slices are in the order they are. None of that
goes in an issue.

**The slice title is the join key, and is duplicated deliberately.** One line in each place. Where
the two disagree, the tracker is right about what work exists and the docs are right about why — so a
drifted title is a documentation bug by definition.

**Neither restates the other's half.** No reasoning in an issue; no status in the docs.

## Rejected

- **Put the derivation in the issue, and let the tracker hold everything.** One place, one habit,
  nothing to keep in step. Rejected because a closed issue is archived while the derivation has to
  stay legible for as long as anything rests on it — the same reason
  [ADR-0001](0001-decisions-live-in-docs-and-work-lives-in-issues.md) rejected issues-for-everything,
  and nothing about that has changed. Reverses if the tracker gains a durable, readable-in-aggregate
  view that survives closing.

- **Drop the slice list from `questions/README.md` once issues exist**, leaving only questions. Zero
  duplication, and the strongest option here — it is what
  [ADR-0001](0001-decisions-live-in-docs-and-work-lives-in-issues.md)'s "links to it rather than
  restating it" reads like on first pass. Rejected because the givens-and-questions tree needs the
  slice as its parent node: without it the file is a list of questions with no statement of what they
  block, which is what it was before the work that made it useful. Reverses if the tree stops being
  the thing that orders the work.

- **Keep status in `questions/README.md` as checkboxes**, so one file answers both what is left and
  why. Rejected because status changes daily and that file's frontmatter already marks it
  `decays: fast` — a checkbox is the single item most certain to be stale, and a stale one in a file
  whose whole value is being trusted is worse than none. Reverses never, while the tracker exists.

## Risk

**The join key can drift, and nothing checks it.** `scripts/check-docs.py` cannot see the tracker, so
a renamed slice or a renamed issue goes unnoticed until someone reads both. The duplication is one
line per slice, which is the smallest surface that keeps both halves usable, but it is not zero.

**A reader who finds only one half gets a confident wrong impression.** The tracker alone looks like
a flat list of independent work; the docs alone look like a plan nobody is executing. This is why
[../CLAUDE.md](../../CLAUDE.md) states the split rather than leaving it to this record.

## Revisit when

- **The slice titles drift more than once.** Twice is a pattern, and it means the join key is the
  wrong one — an issue number in the docs would be uglier and would not drift.
- **A slice stops mapping to one issue**, because slices turn out to need breaking down further. The
  join is one-to-one today and the whole arrangement rests on that.

## Also update

- [x] `questions/README.md` — states the split where the roadmap actually lives
- [x] `CLAUDE.md` — states the split where an agent meets it before opening anything
- [x] Nothing in `constraints.md` — no fact about the world
- [x] Nothing in `guarantees/` — promises a player nothing
- [x] Nothing in `glossary.md` — "slice" is already used in `questions/README.md` and defined there

Deliberately not decided here: what an issue template contains, how issues are labelled, and whether
questions ever become issues — they do not, per
[ADR-0001](0001-decisions-live-in-docs-and-work-lives-in-issues.md).
