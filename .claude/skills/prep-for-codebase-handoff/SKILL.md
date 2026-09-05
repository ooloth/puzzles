---
name: prep-for-codebase-handoff
description: Check whether a new agent with no context could pick this repo up and know what to do next, and clean up what would mislead them. TRIGGER when the user asks whether the repo is ready for a new session, when the user asks if the codebase and/or its docs are in good shape, before wrapping up a session, or before switching topics.
---

## Why this exists

A session ends with everything in your head and little of it written down. The usual fix is a
handoff message, which the next agent may not receive and which is stale the moment anything
changes. The permanent docs are the handoff. This checks whether they work, and fixes what does not.

Two kinds of problem, and they need opposite methods.

**What confuses a stranger** can only be found by a stranger. You know what the repo means, so you
read what you already believe into every file. That needs a subagent with no context.

**What is stale** is mostly invisible to a stranger, because a stale file reads as current — seeing
otherwise takes knowing what happened elsewhere. That needs you, and it is predictable enough to
scan for directly.

## Your task

### 1. Launch everything at once

Send all of these in a single message so they run together. The cold read takes a few minutes and
the scans are independent of it; waiting for one before starting the others wastes most of the time
this skill costs.

**One subagent for the cold read**, with no briefing beyond the prompt below.

**Subagents for the scans**, each given the specific thing to look for and asked for file and line
references. They are mechanical searches with a judgement call at the end, which is what a mid-tier
model does well.

**Give every agent an explicit, bounded file list, and tell it not to spawn subagents of its own.**
This decides how long the check takes, and it is not obvious: the cost is unbounded scope, not scans
per agent. Bundling several scans into one agent is fine and often better, since they share the
reading. Handing one agent a whole directory is what makes a run slow, because an agent given
"every file in `docs/questions/`" or "every rule against everything it governs" fans out internally
rather than reading.

- **Split a large directory across agents by file list**, not by scan category. Three agents over a
  third of the files each finish in roughly a third of the wall clock of one agent over all of them.
- **Say "read these files yourself; do not spawn subagents."** A nested agent serialises — the parent
  waits on a child that waits on tool calls — and its report reaches you two relays from the source,
  which is also two chances for a claim to lose its hedges.
- **Wall clock is the slowest agent, not the total.** One unbounded agent makes everything else's
  parallelism irrelevant.

The cold read prompt, with the repo path filled in:

> You are a new agent starting work on the repo at `<path>`. You have no prior context. Nobody has
> briefed you.
>
> Read the repo the way you actually would on a first session, starting from whatever entry point
> you would naturally start from. Do not read every file — read what a sensible agent would read to
> orient itself, and stop when you believe you know what to do next.
>
> Then report:
>
> 1. **What is this project?** In two sentences.
> 2. **What would you do next, and why?** Name the exact question or task you would pick up, and say
>    what told you to pick it.
> 3. **How long did it take to get a confident answer to 2?** Which files did you read, in what
>    order? Was anything hard to find?
> 4. **What confused you, contradicted itself, or looked stale?** Name files and lines. This is the
>    most useful part of your report — do not soften it.
> 5. **What did you expect to find and could not?**
> 6. **What would have led you astray if you had trusted it** — a claim, an ordering, or guidance
>    that looks authoritative but appears wrong or out of date?
>
> Be specific and critical. Do not be generous. Do not edit any files.

### 2. Scan for the staleness a stranger cannot see

Each of these is a defect this repo produces. None is detectable by `scripts/check-docs.py`, because
each needs a judgement rather than a lookup.

**The list of scan categories below is intended to grow.** When a check discovers a new failure
category, add it here with what to look for and where to look for it if it cannot be mechanically
detected by a lint script like `check-docs.py` instead.

- **An "or else" clause that is not about the architecture.** Every entry in a milestone list in
  `docs/questions/README.md` carries one, and it should name which _later decision in that slice_
  would be taken blind without it, and how the architecture comes out wrong as a result. Three
  substitutes all read as reasons and are not: a practical blocker ("or else nothing can be
  installed" — the work cannot start, which is not the same as the architecture being wrong), a
  comment on how the choice gets made ("or else it is picked by habit" — true of every unanswered
  question, so it distinguishes nothing), and a restatement of the topic ("an input to the shape").
  Then apply the test the list states: if you cannot complete "slice N cannot be built without this
  because \_\_\_", the entry does not belong in slice N. Check the direction of any entry you move:
  the bias runs one way, toward placing a question _earlier_ than it belongs.
- **Questions that are answered but still open.** For each file in `docs/questions/`, check whether
  what it `resolves_into` now exists — a decision record, a line in `constraints.md`, or a change to
  a config file or skill. Where it does, the question is finished and nobody noticed. This is the
  most common one, because a question resolving into something other than an ADR leaves no trace
  when it lands.
- **Decisions contradicted by later ones.** Read `docs/decisions/` newest to oldest and check
  whether any earlier record states something a later one changed. Superseding is fine and is
  recorded; silent contradiction is not.
- **A false claim kept and rebutted rather than replaced.** A file asserts something, and corrects it
  somewhere further down. Both readings are in the file, and the false one is the one a reader meets
  first — so anyone who skims, greps, or stops early takes it away as the answer. The correction only
  works for a reader who gets to the bottom, which is exactly the reader who did not need it.
  Look for a claim in **Why it matters**, an **Options** entry or a cell description that a later
  **Findings** entry contradicts, and for the phrases that signal a layer rather than a fix: _an
  earlier version of this_, _that framing overstated_, _this was carried as though_, _turns out to
  rest on_. The usual shape is an assertion near the top of a question file and its dismantling
  under **Findings** eighty lines below.
  **The fix is to state the true thing where the topic is first raised**, not to add another
  paragraph. Then grep the rest of the repo for the same claim, because one asserted in a question
  file is usually asserted in several other places that nobody has counted.
  Distinguish this from a correction that _quotes_ what it corrects. Naming a false claim inside the
  sentence that refutes it is how a future reader recognises it when they meet it elsewhere, and it
  is not this defect. The defect is asserting it in one place and refuting it in another.
- **Figures that moved.** Any number appearing in more than one file, where the copies disagree.
  Check each against `docs/constraints.md`, which is the authority.
- **Questions about to be decided with sections still empty.** A `...` means nobody has looked, and
  it is legitimate almost everywhere — including in a file with a long Findings section. **Evidence
  parked in a question nobody is working is the system behaving correctly**, not a half-finished job:
  an agent who finds something relevant while working on something else should drop it there and move
  on, and requiring them to fill in Options and What-would-settle-it first would mean the finding
  goes unrecorded instead. Do not report those.
  The narrow defect is a question **in the milestone currently being worked**, at the point where it
  is about to be answered, with the sections that shape an answer still empty. That is a question
  being decided without the thinking it asks for. Unchecked `Also update` boxes in decision records
  are caught by `check-docs.py` and need no scan.
- **Guarantees whose enforcement changed.** Anything in `docs/guarantees/` still saying _Enforced
  by: Nothing_ that something now checks, and anything claiming enforcement that no longer exists.
  The frontmatter `enforced` field should agree with the prose; `rg -l 'enforced: no'
docs/guarantees/` is the backlog and it is only as good as that agreement.
- **A promise cited that was never made.** The withheld promises are stated in prose in
  `docs/guarantees/README.md` — under each theme, and in "Themes holding no promises yet". Read those
  statements and search the rest of `docs/` for text asserting one of them as though it existed.
  There is no frontmatter marking a withheld promise, so this cannot be grepped; a scan that looks
  for one finds nothing and reports clean.
  Demoting a record leaves every citation of it behind, reading exactly as it did when the promise
  was real. Expect them in question files, in `docs/failure-modes/`, and inside multi-paragraph
  arguments resting on the promise as a premise, which are the hardest to spot and the most costly
  to leave.
- **Docs narrating their own edit history.** A document describing how it got here rather than what is
  true now. Search for _used to_, _previously_, _no longer_, _has since_, _was changed to_, dates
  attached to edits rather than to evidence, and strikethrough, which is always this defect. A
  question file's Findings should read as the current best account of what is known, not as a
  changelog of how it was assembled. The test: would a reader who never saw the previous version want
  this sentence? If it only makes sense as a diff against something they cannot see, git history holds
  it better, and the documentation standard forbids it outside the narrow case where a reader lacking
  the history would do the wrong thing.
  **Do not confuse this with provenance, which is required.** A tier tag and the date a claim was
  established stay. A **Source** section stays. A record's `amended:` frontmatter stays. Evidence for
  a _claim_ is provenance; narration of edits to the _document_ is not.
  Expect the highest density immediately after a session that corrected a lot, since an agent
  replacing a false claim tends to leave a note saying it did.
- **A doc contradicting a recorded decision.** The reverse direction from the check above: not an
  ADR against a later ADR, but any other file asserting something an ADR already settled. Take each
  record in `docs/decisions/` and search the rest of `docs/`, `CLAUDE.md` and the skills for claims
  it makes false. Read `unfinished.md` hardest, since it is the file the repo calls its
  highest-consequence one and the one most likely to still list a settled choice as open.
- **A rule violated in the files it governs.** Take each Must in `docs/standards/`, each convention
  stated in an index README, and each claim a README makes about what a script checks, and go and
  look at the files it claims authority over. Two shapes to expect: a rule broken in the files it
  names, and a README describing a check its script does not implement. `check-docs.py` catches a
  violation that takes a fixed form, such as a banned heading, and cannot catch the same rule broken
  as a paraphrase, which is why this stays a scan.
- **An ADR resting on something not yet settled.** For each record, take every **Forced by** input
  and every **Rejected** reason and ask what it grounds in. A rejection reason that depends on an
  open question is the expensive one, because the option stays rejected and the reasoning is never
  revisited. **Check Rejected hardest**, because reality tests the option that was taken and never
  the one that was not, so a rejection's stated reason is the last word on it permanently. Watch for
  a rejection resting on a stack of costs where no single one disqualifies, and for a routine job
  described as structural. Watch for the signature too — when the weak reasoning in a record all
  argues for the option that lost and none of it for the option that won, the section was written to
  justify rather than to evaluate. The portable decision-making standard calls this the failure that
  does not announce itself.
- **A question whose premise a record has settled.** Read every question filename and its **Why it
  matters** against `docs/decisions/`. A conditional in the filename is the clearest signal: _if
  there is one_, _if anything_, _if at all_ — a record answering the conditional leaves the question
  asking something settled. Also look for Options a record has ruled out and Why-it-matters
  paragraphs arguing from a decision since superseded. A question asking something already answered
  makes a reader re-open a settled argument.
- **A rejection that reads as researched and is not.** No script can do this: a check answering "is
  there a citation" cannot answer "does it support the claim beside it", and a record citing one
  source for one bullet while making unsourced claims about vendor policies and version numbers in
  the next will pass it. Read each **Rejected** bullet and ask three things. Does the citation
  support the claim it is attached to, or merely sit near it? Are there specific-sounding details —
  versions, percentages, dates, named policies — with no source? And if several reasons are given, is
  any one of them disqualifying alone? Specific detail is the most convincing thing in a bad
  argument, which is why this needs reading rather than matching.
- **A tier whose source could not have produced the claim.** The tier is what stops a reader
  checking, so a wrong one is worse than none. Ask of each whether its named source could produce
  that specific claim: a _Measured_ tag names a run this repo can actually perform, and a _Sourced_
  tag names a source that would settle the claim either way rather than one that merely sits near it.
  Delete a figure whose source cannot be found rather than downgrading it, and say it was found
  unsourced so it cannot return. Run this hardest on fast-moving subjects, where a finding can go
  stale within days.
- **`unfinished.md` carrying evidence rather than warnings.** Each entry says what will look true
  that is not and what to do today; one that also explains _why_ has absorbed a finding, which then
  lives in two places and goes stale in one. Cut it to a single line naming the inference not to
  draw, plus a link to whichever file argues it.
- **`unfinished.md` entries that are no longer live.** Each entry claims something in the repo will
  mislead a reader today. Check whether it still would. An entry describing a migration that
  finished, or a pattern that no longer exists, trains readers to skim the one file whose whole
  value is being read carefully — and an honestly empty `unfinished.md` is better than a padded one.

Run `python3 scripts/check-docs.py` yourself while the subagents work. It is fast and covers the
things that are facts rather than judgement.

### 3. Verify before believing any of it

Check the claims yourself rather than relaying them. Subagents have less context than you, which is
the point for the cold read and a liability for the scans — they will report things that are
deliberate as though they were defects.

Pay most attention to whatever the cold read found that you did not know about. That is the part of
the repo you have stopped seeing.

### 4. Judge it

The check passes when all of these hold:

- **The cold read picked the right next thing**, for the right reason. A correct guess from a wrong
  signal is a fail — the signal is what the next agent follows.
- **It got there quickly**, from a natural entry point, without being told where to look.
- **Nothing misled it.** Stale figures and orderings that no longer hold are worse than gaps,
  because gaps announce themselves.
- **No question is answered and still open.**
- **The file system agrees with the docs.**
- **What is mid-change is flagged where a reader will meet it**, rather than only being true.

### 5. Report and fix

Lead with anything that would actively mislead. Propose fixes and wait for approval rather than
making them. A gap is ordinary; a confident wrong signal is what to stop for.
