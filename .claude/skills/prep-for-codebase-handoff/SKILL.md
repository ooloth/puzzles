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
This is what decides how long the check takes, and it is not obvious. On 2026-09-02 the whole run
took 25 minutes because two agents nested: one was told to scan "every file in `docs/questions/`" —
84 files — and one to check "every rule against everything it governs", and both fanned out
internally rather than reading. They took 22.8 and 14.4 minutes. Meanwhile the agent carrying the
*most* scans and the *most* tool calls finished in 6 minutes, because its scope was 14 decision
records.

So the cost is unbounded scope, not scans per agent. Bundling several scans into one agent is fine
and often better, since they share the reading. What is not fine is handing one agent a whole
directory:

- **Split a large directory across agents by file list**, not by scan category. Three agents over 28
  question files each run in roughly a third of the wall clock of one agent over 84.
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

Each of these has been a real defect in this repo. None is detectable by `scripts/check-docs.py`,
because each needs a judgement rather than a lookup.

**The list of scan categories below is intended to grow.** When a check discovers a new failure
category, add it here with what to look for and where it occurred if it cannot be mechanically
detected by a lint script like `check-docs.py` instead.

- **Questions that are answered but still open.** For each file in `docs/questions/`, check whether
  what it `resolves_into` now exists — a decision record, a line in `constraints.md`, or a change to
  a config file or skill. Where it does, the question is finished and nobody noticed. This is the
  most common one, because a question resolving into something other than an ADR leaves no trace
  when it lands.
- **Decisions contradicted by later ones.** Read `docs/decisions/` newest to oldest and check
  whether any earlier record states something a later one changed. Superseding is fine and is
  recorded; silent contradiction is not.
- **Figures that moved.** Any number appearing in more than one file, where the copies disagree.
  Check each against `docs/constraints.md`, which is the authority.
- **Questions worked but left with placeholders.** A `...` means nobody has looked and is legitimate
  in an untouched question. It is a defect in one with a substantial Findings section, or one sitting
  in an early milestone — the question was worked and a section was skipped. Unchecked `Also update`
  boxes in decision records are the same kind of gap and are caught by `check-docs.py`, so they do
  not need a scan.
- **Guarantees whose enforcement changed.** Anything in `docs/guarantees/` still saying _Enforced
  by: Nothing_ that something now checks, and anything claiming enforcement that no longer exists.
- **Change narrative.** Search for _used to_, _previously_, _no longer_, _has since_, _was changed
  to_, and dates used as change markers. The documentation standard forbids these outside the narrow
  case where a reader lacking the history would do the wrong thing.
- **The file system asserting decisions.** Directory names, stub files and scaffolding read as
  settled. If a directory implies an answer to an open question, that is a decision nobody argued.
- **A doc contradicting a recorded decision.** The reverse direction from the check above: not an
  ADR against a later ADR, but any other file asserting something an ADR already settled. Take each
  record in `docs/decisions/` and search the rest of `docs/`, `CLAUDE.md` and the skills for claims
  it makes false. `unfinished.md` listed the language as an open stack question for a day after
  a record had already chosen TypeScript, in the file the repo itself calls its
  highest-consequence one.
- **A rule violated in the files it governs.** Take each Must in `docs/standards/`, each convention
  stated in an index README, and each claim a README makes about what a script checks, and go and
  look at the files it claims authority over. `questions/README.md` said sequencing lives in that
  file and nowhere else while twenty-one question files carried it under two bold headings, and it
  described a milestone check `check-docs.py` did not implement. The two headings are now caught by
  that script; a paraphrase is not, which is why this stays a scan.
- **An ADR resting on something not yet settled.** For each record, take every **Forced by** input
  and every **Rejected** reason and ask what it grounds in. A rejection reason that depends on an
  open question is the expensive one, because the option stays rejected and the reasoning is never
  revisited. **Check Rejected hardest**, because reality tests the option that was taken and never
  the one that was not, so a rejection's stated reason is the last word on it permanently. The
  durability record demoted on 2026-09-01 foreclosed the only free guest recovery mechanism on three
  costs: two turned on questions still open, and the third was a routine cleanup job described as
  structural. Watch for the signature — when the weak reasoning in a record all argues for the option
  that lost and none of it for the option that won, the section was written to justify rather than to
  evaluate. The portable decision-making standard calls this the failure that does not announce itself.
- **A question whose premise a record has settled.** Read every question filename and its **Why it
  matters** against `docs/decisions/`. A conditional that a record now answers is the clearest
  signal — `what-runs-the-server-if-there-is-one` and `what-does-the-server-store-if-anything` both
  outlived the records that answered "yes" and "something". Also look for Options that a record has
  ruled out and Why-it-matters paragraphs that argue from a decision since superseded. A question
  asking something already answered makes a reader re-open a settled argument.
- **A rejection that reads as researched and is not.** The `check-docs.py` citation check was removed
  because it could not do this: it passed ADR-0003, whose bullets cite `problem.md` for one thing and
  then make five specific, checkable, unsourced claims about vendor policies and version numbers.
  Read each **Rejected** bullet and ask three things. Does the citation support the claim it is
  attached to, or merely sit near it? Are there specific-sounding details — versions, percentages,
  dates, named policies — with no source? And if several reasons are given, is any one of them
  disqualifying alone? Specific detail is the most convincing thing in a bad argument, which is why
  this needs reading rather than matching.
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
