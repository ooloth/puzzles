---
name: next
description: Work out whether the next thing to do is answering a question or building an issue, and say which. TRIGGER at the start of a session, or whenever the user asks what to work on next and you are not already partway through something.
---

## Why this exists

Unanswered questions live in `docs/questions/README.md` and work that is ready lives in the GitHub
tracker, and which is next depends on both. Running `make-next-decision` on a milestone whose next
slice is already unblocked spends a whole skill discovering it should have been building.

**This skill routes and stops.** It names the next thing and waits for the user.

## Your task

1. **Read "Start here" in `docs/questions/README.md`.** It holds the rule for when a slice gets an
   issue and which milestone is current, the traps in reading both, and what reading routing can
   skip. All of it decides everything below.
2. **Read the tracker with `--state all`.** Open issues alone cannot tell you which milestone is
   finished. Invoke `use-gh` first, as the user's global `CLAUDE.md` requires before any `gh` call.
3. **Rank what the tracker holds** by the order in `CLAUDE.md`: bugs first, then the current
   milestone, then maintenance, then later milestones. An open bug is the route, whatever the
   milestones say. Each issue's kind label, `bug`, `feature` or `maintenance`, says which rank it
   has. An issue with no kind label is reported as needing one rather than guessed at.
4. **Identify the current milestone**, then read that milestone's section of the README — its
   slices and their **Must answer** bullets. In that order: which milestone
   is current depends on the tracker, so reading a section first risks reading the wrong one.
   Maintenance comes after the current milestone's route, so name it only when that milestone has
   nothing workable, or as a second line in the report.
5. **Check you are not resuming.** `git status`, the current branch, and the candidate issue's
   state and comments — `gh issue view N --json state,comments`. Fetch those rather than the body:
   the body is a full task brief, it cannot tell you whether anyone has started, and
   reading it makes stopping harder than it needs to be.
6. **Report.** Three or four lines: the milestone, the slice, the route, and the sentence of
   evidence that decided it.

## Where each route goes

- **A question** — name the slice's open questions and hand off to `make-next-decision`, which
  picks among them and does the `problem.md` and `guarantees/` reading this skill skipped.
- **An issue that exists** — name its number and title. The user decides whether this session
  starts it.
- **A workable slice with no issue** — offer to file it with `write-ticket-description`, and say
  that drafting it is the last check described in "Start here".
- **Anything ambiguous** — two slices both workable, a milestone that looks finished but has an
  unfiled slice — say what is ambiguous rather than picking. Guessing points a whole session at
  the wrong thing, which costs more than asking.
