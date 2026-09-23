---
name: next
description: Work out whether the next thing to do is answering a question or building an issue, and say which. TRIGGER at the start of a session, or whenever the user asks what to work on next and you are not already partway through something.
---

## Why this exists

Unanswered questions live in `docs/questions/README.md` and work that is ready lives in the GitHub
tracker, and which is next depends on both. Running `make-next-decision` on a milestone whose next
slice is already unblocked spends a whole skill discovering it should have been building.

**This skill routes and stops.** It names the next thing and waits for the user.

It also skips something on purpose: `CLAUDE.md` and the README both say to read `docs/problem.md`
and `docs/guarantees/` in full before deciding what to work on, and that is for deciding rather than
routing. Say in your report that you skipped them, so it reads as deliberate.

## Your task

1. **Grep the rule, do not read the file to find it.** `grep -n "issue is filed once"
   docs/questions/README.md` and read the section around the hit. That README is roughly 70KB and
   a single read exhausts its token budget partway through, so reading top-down leaves whether you
   see the rule to chance. The rule is the repo's own and it decides everything below.
2. **Read the tracker with `--state all`.** Open issues alone cannot tell you which milestone is
   finished. Invoke `use-gh` first, as `CLAUDE.md` requires before any `gh` call.
3. **Identify the current milestone**, then read that milestone's section of the README — its
   slices, their **Given** bullets and their **Must answer** bullets. In that order: which milestone
   is current depends on the tracker, so reading a section first risks reading the wrong one.
4. **Check you are not resuming.** `git status`, the current branch, and the candidate issue's
   state and comments — `gh issue view N --json state,comments`. Fetch those rather than the body:
   the body is a full task brief with a QA plan, it cannot tell you whether anyone has started, and
   reading it makes stopping harder than it needs to be.
5. **Report.** Three or four lines: the milestone, the slice, the route, and the sentence of
   evidence that decided it.

## Three things a first reading gets wrong

**The prose list above the slices is numbered like the slices and is not them.** A milestone's
narrative can end with its own numbered list of what remains to decide. The slices are the numbered
list whose entries carry **Given** and **Must answer** bullets. Count only those.

**Which milestone is current cannot be read off either source alone.** The docs record no status,
deliberately, and the tracker is shorter than the slice list because issues are filed just-in-time.
Join them on the slice title, which the README names as the join key: a milestone is finished when
every slice in its list has a closed issue, so the current one is the lowest where that is not yet
true.

**Most slices have no issue, and that is the intended state rather than drift.** The README's "read
a missing issue as not workable yet" describes a slice that still has **Must answer** bullets. The
drift case is narrower and is the one to raise: a slice with **no** remaining Must answer and no
issue means one should have been filed and was not. Offer `write-ticket-description`.

## Where each route goes

- **A question** — name the file and hand off to `make-next-decision`, which does the `problem.md`
  and `guarantees/` reading this skill skipped.
- **An issue that exists** — name its number and title. The user decides whether this session
  starts it.
- **A workable slice with no issue** — offer to file it.
- **Anything ambiguous** — two slices both workable, a milestone that looks finished but has an
  unfiled slice — say what is ambiguous rather than picking. Guessing points a whole session at
  the wrong thing, which costs more than asking.
