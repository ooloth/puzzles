<!-- Moved from docs/questions/README.md on 2026-10-12, so that file can stay a short list of what is
     next. Read by whoever builds or audits a milestone's list. -->

# Building and keeping a milestone's list

## Building a milestone's list

Six steps. Each one exists because skipping it produced a list that had to be rebuilt.

1. **Write the milestone's end state in one sentence.**
2. **List the observable slices between nothing and that end state.** Each is one change you can run
   and look at — something true of the system afterwards that was not true before. **Observable does
   not mean a player can see it**: a check that fails on a bad import and a script that reproduces a
   bug are both observable, and M3 is an entire milestone of them. The test is whether you can name
   what you would run and what you would expect to see. Build order, not risk order — the thing that
   renders before the thing that is served, the thing that is served before the thing that is
   deployed. Deploying is the last slice: a hosting choice made before anything exists to host is
   made against an imagined system.
3. **Under each slice, list the questions that must be worked.** What is already settled is not
   listed: the listing of `docs/decisions/` and `docs/constraints.md` already hold it. A question blocks a slice if
   building without it would be **reversed**, not only if the work is impossible. Choosing a package
   manager before the runtime is settled is possible today and wrong tomorrow. The literal blockers
   are few; the reversal risks are what decide the order.

   **One label: Must answer**, whether the answer is a choice or a fact to go and find. A research
   question earns its own entry only where nothing else tracks it — where the question it informs
   records it under **Findings**, that is where it lives.

   **Every entry carries an "or else" clause: which later decision in this slice comes out wrong, and
   what unwinding it costs.** Two costs exist here. A **re-scaffold** is a day. A **migration of live
   player data** is not, and it is the only irreversible thing M1 can create. A question whose wrong
   answer costs a re-scaffold does little work at the front of a slice. A choice whose clause can
   name no silent harm at the current milestone, no cost that grows with the system, and no option
   of an open question that would cost more to reopen than this choice costs to change is not an
   entry at all. It is decided on the spot, per the triage in "When a choice surfaces
   mid-work" in [docs/CLAUDE.md](../../../CLAUDE.md).

   Three things read as clauses and are not: that work cannot start, that the choice might be made
   carelessly, and a restatement of the topic. Each is true of every open question, so none
   distinguishes anything. Where a clause names a mechanism rather than a cost — "whichever is built
   first fixes the other two" — ask "so what?" until it reaches one.

   **If you cannot complete "slice N cannot be built without this because ___", it does not block
   slice N.**

   **Defer.** Every sequencing error in `docs/questions/README.md` has moved a question earlier than it belonged, never
   later. An open question keeps its options and costs nothing. Where it is unclear whether something
   blocks a slice, it does not.

4. **Repeat questions across slices.** Never cross-reference — no "as in slice 1". The
   repetition is what makes step 7 possible and what lets a reader audit one slice without holding
   the others in their head.
5. **Order the questions within a slice** by what has to be answered first. Where two constrain each
   other in both directions they are answered together, and each question file says so under **What
   would settle it**. That is the only place a dependency between questions is written down.

   **Questions that share moments are worked together even where neither constrains the other.** A
   request one serves and another routes, or a deploy one shapes and another carries out, is a
   moment both draw properties from, and worked one at a time each derives only what its own topic
   brings to mind. So the moments are listed once for the group and the property list is derived
   once, and each question's **Properties the answer is scored against** carries a copy of it,
   adding only what is its own. Each still settles in its own record. A candidate is scored under
   every answer an unsettled member could give, and one whose verdict changes makes that member an
   input to be settled first.

   **Grouping is generous and ordering needs evidence.** Including a question in a group that turns
   out not to matter costs nothing. Moving, splitting or reordering questions is a decision, made
   only from scored candidates: a question is coupled to another through a named candidate whose
   verdict changes with its answer, never through a shared topic. The tell that a group was missed
   is one option listed in two question files, and the first move is to split that option into the
   arrangements it covers. On 2026-10-04 "something in front of the Droplet" sat in both the
   file-serving and the domain question. Split, it was a caching proxy, which changed no
   file-serving verdict and stayed with the domain question, and an edge platform hosting the files,
   which was a file-serving candidate. Three rearrangements proposed from topic before that split
   were each withdrawn.
6. **Audit, and expect to move things.** A slice whose questions fall into several unrelated groups
   is several slices. A slice that reads like the milestone restated is bundling. Read every "or else" clause and ask
   whether it names a consequence for *this slice* or merely describes the question; the second is
   the failure this audit is most likely to find, because it reads as a reason. Then read the
   cross-references: a choice that several files each defer to the others is a question, and it is
   usually wider than any of them. Then count how many slices each question blocks: that orders the
   slices, and says nothing about the order inside one.

**Everything a milestone installs is permanent.** A tracer bullet is the real stack doing the
smallest thing it can do — not scaffolding to be replaced two milestones later. Provisional is not a
category: if a choice would be redone shortly after the milestone, it is missing an input or the
milestone is drawn in the wrong place. Placeholder *values* are fine; placeholder *choices* are not.

**Deferring is the default, and it is the point.** An unanswered question is optionality retained,
and everything learned before it must be answered is information the answer would otherwise be made
without. The skill this list is trying to capture is spotting the moment a question can no longer be
put off, and making it as narrow as possible when that moment arrives. Closing a door is clarifying
and irreversible, so the record that closes one says which one.

**A milestone's prose holds only what its remaining slices need.** When a question is answered, what
it settled goes in the record and the milestone gains no paragraph saying so. The slice entry goes
when its issue closes, and so does any prose that only that slice needed. A milestone that reads as
an account of what was decided is carrying history the records already hold, and it pushes the
slices still to be built further down a file that is already past what one reading can cover.

## Milestones below the current one stay unplanned

They are a list of questions grouped by the milestone that first needs them, and nothing more.
**Expanding one into slices before it is next is planning against a system that does not
exist yet** — the slices are only knowable once the preceding milestone's decisions have landed, and
a plan built earlier gets rewritten rather than followed. It is the same argument as deferring a
decision: plan it when you know the most, which is as late as possible.

**Adding a question to a future milestone is not expanding it**, and is always welcome. A question
discovered now and parked where it belongs is what `docs/questions/README.md` is for.

When a milestone becomes the next one, run the six steps on it. Not before.

## `docs/questions/README.md` and the issue tracker

**Each slice in `docs/questions/README.md` becomes one GitHub issue when it becomes workable**, not in advance, per
[docs/decisions/0015-the-issue-tracker-is-github-issues.md](../../../docs/decisions/0015-the-issue-tracker-is-github-issues.md)
and
[docs/decisions/0016-a-delivery-slice-is-an-issue-and-its-derivation-stays-in-docs.md](../../../docs/decisions/0016-a-delivery-slice-is-an-issue-and-its-derivation-stays-in-docs.md).
The tracker holds what work exists and what state it is in. `docs/questions/README.md` holds why — what each slice
rests on, what blocks it, and why they are in this order. Why a slice is built the way it is sits in
its issue's comments.

**So the tracker is deliberately shorter than this list, and a slice with no issue is normal.** An
issue is filed once nothing in its entry is still a **Must answer**, because an issue written
earlier would carry a definition of done that the unanswered question is about to change. Read a
missing issue as "not workable yet", not as "not planned" — that file is the plan and the tracker is
the work.

**So nothing here records status.** No checkboxes, no "done", no "in progress". Those change daily,
that file is already the fastest-decaying document in `docs/`, and a stale checkbox in a file whose
value is being trusted is worse than no checkbox.

**The slice title is the join key.** It appears here and in the issue, and nothing checks that the two
still match — `scripts/check-docs.py` cannot see the tracker. If they disagree, the tracker is right
about what work exists and that file is right about why.

**A slice's entry is deleted once its issue closes.** What it rested on is in the records it cited,
and its definition of done is in the issue, so what would be left here is history. The slices that
remain keep their numbers, because records cite slices by number, so a gap at the front of a list
means those slices are finished rather than missing. A milestone is finished when its list is empty.

## Housekeeping

**A question resolves into as many records as it contains decisions** — the separability test in
[docs/decisions/README.md](../../../docs/decisions/README.md). It is deleted once nothing is left in it that a
record has not settled; mine it first, since findings graduate to
[docs/constraints.md](../../../docs/constraints.md) and reasoning belongs in whichever record it argues for.
**Mining happens in the change that lands the record, never later.** A finding a still-open question
will use moves into that question's file then, so no answered file is kept waiting for a later
record to take what it needs.
**Mining moves a claim's tier and source with it**, or the record inherits a bare assertion and the
evidence dies with the file. Where the working is too long to move, cite the commit that deleted it —
`git show <commit>^:<path>` still reads it.
**Promises are written as they fall out of records**, on the decision template's checklist, rather
than committed to in advance.

`scripts/check-docs.py` checks what is fact rather than judgement: links resolve, every question
is referenced at least once from `docs/questions/README.md`, no link points at a heading, no question
file has grown a sequencing section. A question belongs to one milestone, the one that must answer
it, but may be listed under more than one of its slices, so nothing checks for a single appearance.
It does not check the ordering, because a check that passed it would only make a wrong order look
verified.

**[docs/decisions/](../../../docs/decisions/) is the list of what is settled, and it is not repeated here.** Every
record is titled by what it settled, so the listing is the checklist of constraints in force.

<!-- Template for a milestone. Links are shown as backticked pseudo-syntax so the checker does not
     try to resolve them; write them as real markdown links.

## M<N> — <the end state, in a few words>

<One sentence: what exists when this is done, and what deliberately does not.>

1. **<A slice you can run and look at.>**
   - **Must answer:** `[<question-filename>](../../../docs/questions/<question-filename>.md)` — or else <what breaks in this slice>
   - **Must answer:** `[<question-filename>](../../../docs/questions/<question-filename>.md)` — or else <what breaks in this slice>
2. **<The next slice.>**
   - **Must answer:** `[<question-filename>](../../../docs/questions/<question-filename>.md)` — or else <what breaks in this slice>

Questions are always "Must answer", whether the answer is a choice or a fact somebody has to find.
Every one carries an "or else" clause naming what breaks in *this slice* without it, not what the
question is about. Link text is the filename, so the list reads without opening anything.
-->


## Working notes

**A thought that spans several question files may go in a temporary "Working notes" section** at the
end of the current milestone in `docs/questions/README.md`, and nowhere else. A question file holds
one question's working and [docs/constraints.md](../../../docs/constraints.md) holds facts about the
world, so neither holds "here is how these four fit together". Everything in it is provisional and
moves to a record, a constraint or a question file as soon as it has a permanent home, and the
section is deleted when it is empty.
