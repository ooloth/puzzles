---
name: make-next-decision
description: Identify the highest-priority outstanding decision that needs to be made, and make it using a rigorous decision-making process starting from first principles and building from foundational prerequisite decisions (if any) to the final call. TRIGGER whenever the user asks about prioritizing unresolved questions or unmade decisions, or wants to make a technical decision.
---

## Context

A near-term goal for this project is to decide the tech stack for the client, server, generator and
deployment platform(s). But it's critical that we start with foundational questions that should come
first. We don't want to make assumptions that lead to technical decisions we'll need to reverse
later and which may be expensive to undo. And we especially don't want to close any doors we should
ideally leave open.

Each decision we make should make subsequent decisions easier and more definitive and well reasoned.
Think from first principles and stay rooted in the problems this project is trying to solve.

If the user has asked you to help them make a particular decision, but you can see more
foundational or otherwise prerequisite decisions which would ideally be made first, **tell them**.
It is your job to do everything you can to assure decisions build on a solid foundation and do not
build on unaddressed assumptions.

## Best practices

1. When a task calls for spawning parallel subagents, prefer a mid-tier model like sonnet over a
   high-tier model like opus to save tokens
2. Verify all subagent claims, particularly when evidence is lacking; don't simply believe them

## Your task

### 0. Check whether this decision should be made at all — and stop if not

**Do this before anything else, and be willing to end here.** The portable decision-making
standard (invoke the `uphold-standards` skill to load it) holds it as a Must: a decision the next
milestone does not need should not be made yet. The test is not
whether the question _could_ be answered — most could, badly. It is whether reaching the next
observable state in `docs/questions/README.md` requires the answer.

If it does not, **say so, stop and do not make it yet.** Instead, tell the user plainly which
milestone the question actually blocks, name what does block the next one, and recommend working
that instead. Three reasons to give them (if needed):

- **The answer gets better by waiting.** Everything learned between now and when it is needed is
  information this decision would otherwise be made without.
- **It buries the decisions that matter.** Once a record exists, everything after it treats the
  choice as settled — so a decision made before it was required is indistinguishable from one that
  was load-bearing, and the genuinely foundational ones stop standing out.
- **It delays working software.** Every decision made ahead of need is time not spent reaching a
  milestone, and a milestone reached is what turns the next decisions from predictions into
  observations.

Deferring is not deciding provisionally. A deferred question stays open with nothing built on it.
Say that too if needed, since the usual counter-offer is a placeholder answer, and a placeholder is
the thing this is protecting against.

Only continue past this step if the answer genuinely blocks the next milestone, or if the user
directs you to proceed anyway after hearing the above.

### 1. Identify the next most important question to answer

1. Read `docs/decisions/README.md`, then list `docs/decisions/` and read every record whose title
   bears on the question in front of you. Titles state what is now binding rather than what the
   topic was, so the listing is a checklist and filtering it is safe — which is the point, because
   this folder grows without bound and reading all of it will not stay affordable. If a title does
   not tell you whether to open the file, that is a defect: say so, and fix it before deciding
   anything on top of it.
1. **List `docs/guarantees/` and open every promise whose filename bears on the question.** One file
   is one promise, named for the promise, so the listing is the checklist of what is owed to players
   the same way `docs/decisions/` is the checklist of what is binding on implementation. Promises do
   not appear in `docs/decisions/` and they bind just as hard. Two things the listing will not tell
   you, so check them: `rg -l 'kind: non-promise' docs/guarantees/` finds the places a promise is
   deliberately withheld — reasoning that assumes one of those exists is the most common way this
   folder gets misread — and `docs/guarantees/README.md` holds the themes that have no promises yet,
   which is where an absence you should have noticed will be.
1. Invoke the `uphold-standards` skill to load the portable decision-making standard, and read
   `docs/problem.md`, `docs/constraints.md` and `docs/questions/README.md`
1. List `docs/questions/` to familiarize yourself with the set of unmade decisions
1. Deploy as many parallel subagents as needed to answer all your fact-based questions about the
   codebase or external systems and dependencies and verify all claims
1. Identify the most foundational question that should be answered next
1. Identify any prerequisite decisions that should ideally be made before tackling that question
   (if any). If those questions have not been tracked, track them now.
1. **Ask what the next milestone needs that nothing is tracking.** A decision creates questions as
   often as it answers them, and a question nobody has posed is invisible in a folder organised by
   filename. Two passes: read the last few records and ask what each made newly askable or newly
   urgent, then read the next milestone's description and ask what reaching it requires that no file
   in `docs/questions/` covers. Write the missing ones before choosing what to answer — six questions
   in one session came from this, and one of them closed at the second milestone.
1. **Ask what the records have made stale.** For each question in the current and next milestone,
   check its premise against `docs/decisions/`. A question whose conditional a record has answered
   sends a reader to re-open a settled argument.
1. Confirm the question that would be most impactful to answer next

### 2. Verify what the question files already claim, before relaying any of it

**This is a blocking step. Nothing from a question file may be summarised, presented to the user, or
reasoned from until it has been checked** — not the Findings, not the Options, not the sentence in
**Why it matters** naming a disqualified candidate.

**It is a step rather than a reminder because the reminder exists in three places and has failed
twice.** The portable standard, step 4 below and `constraints.md` all say to treat an inherited claim
as unverified, and question files were still written with invented tiers and later read without a
source being opened. One pass over two of them refuted three of five findings against a single
candidate, including a _Sourced_ claim asserting the opposite of its subject's own announcement.

Do this:

1. **List every claim about the world** in the question files you are about to work: version numbers,
   capabilities, what a tool does or cannot do, adoption, governance, licensing, benchmark figures.
   Include the ones tagged _Sourced_ and _Measured_. Those are the dangerous ones, because a tier is
   what stops a reader checking.
1. **Send them to parallel subagents to verify against today's sources**, bounded by file list, told
   to open the sources themselves and not to spawn subagents. Ask each for a verdict per claim
   (confirmed, refuted, partially confirmed, could not verify), the URL it opened, a direct quote,
   and — where a claim was once true — the version or date it stopped being true.
1. **Open the load-bearing ones yourself.** A claim that disqualifies an option, or that a whole
   argument runs through, is read at its source by you rather than relayed from an agent. Say which
   ones you opened and which you are passing on; silence implies you checked everything.
1. **Check every tier against what could have produced it.** A _Measured_ claim names what was run,
   on what, and when. Ask whether that run could have happened in this repository at all. A
   _Sourced_ claim names a source that would actually show the thing asserted — a source that could
   not have shown it either way is not a source for it.
1. **Ask what the shared attribute is doing.** Where an argument concludes that several candidates
   are equivalent, check whether it runs through an option common to all of them. That option was
   selected for being shared, so an equivalence argument resting on it assumes its own premise. The
   `node:sqlite` argument in `what-runs-typescript-outside-the-browser.md` is the worked example.
1. **Write the corrections into the files before going further**, with provenance saying who opened
   what and when. Delete a claim that has no source rather than softening it, and say in its place
   that it was found unsourced, so it cannot quietly return.

**Report what you deleted, not only what you corrected.** A removed claim is invisible in a way a
changed one is not, and the user cannot overrule a deletion they never saw.

### 3. Present the selected question

1. Present your selected question to the user with your rationale, using formatting they can easily
   digest in 30 seconds
1. Ask the user any outstanding questions that should be deferred to their judgment or preferences
1. Discuss the user's feedback and questions
1. Proactively conduct further research if needed, using as many parallel subagents as necessary
1. Offer to research all viable options and wait for the user's approval

**Say nothing about where the answer is leaning, and do not form a lean to keep to yourself.** At
this point the options have not been researched, so any sense of the likely answer came from a
question file's accumulated content rather than from evidence — which is exactly the thing step 4
exists to test. Naming a favourite here commits you to defending it and turns the research into
confirmation. Flagging which findings are weakly sourced is not the same thing and is worth doing;
saying which side they point to is.

### 4. Look before you leap, then settle it by measuring

**Arrive at the question file as though it were blank.** Whatever Options and Findings you find
there are claims to verify. They are not a head start, not a shortlist you are refining, and not a
position to argue from. Run the investigation you would have run if the file had held nothing but
its title.

This is the most expensive habit to get wrong, because inherited content does not read as
inherited. A question file accumulates over weeks from earlier sessions, legacy documents and
research nobody re-checked, and by the time you arrive it reads as the state of the art on the
subject. Treating it as a starting position means the field was narrowed by whoever wrote first,
the framing was set by whoever framed it first, and your research quietly becomes an exercise in
choosing among their candidates. The three specific failures to watch for:

- **An option that is absent is not an option that was rejected.** A candidate nobody listed looks
  identical to one that was considered and dropped. Rebuild the field yourself before comparing
  anything in it, and include what the file does not mention.
- **A finding is evidence of what somebody believed, not of what is true.** Every Findings section
  in this repo says so in its first line. Check the tier on each one, and treat _Unverified_ and a
  vague source as equivalent to absent — an unsourced claim reads exactly like a sourced one and
  nothing else tells them apart. Step 2 has already checked the claims that were there; this is the
  other half, which is the candidates and framing that were never written down at all. Neither
  substitutes for the other: verifying a shortlist perfectly still leaves it somebody else's
  shortlist.
- **The framing is inherited too, and it is the part nobody checks.** "Which of these three?" may
  be the wrong question, and a file that asks it will never say so. Restate the problem without
  naming a solution before you accept the file's version of it.

Where verification confirms what the file already said, you have lost nothing but the time. Where
it does not, you have found the thing this step exists for.

**Look first.** Research surfaces the candidates, the known traps, and — the part that matters most
— the properties worth observing that you would not have thought of on your own. A spike designed
before the reading measures what you already expected to see, which is the one result that teaches
nothing. Budget the reading in the same spirit as the spike: enough to know what to check, then stop.

**Reading does not reach the answer.** A number you find is a hypothesis about what you will observe
here, on this hardware, under this workload. It is never a finding. Record where each claim came
from, and mark the ones that came from nowhere as unverified — an unsourced number reads exactly
like a sourced one and nothing else tells them apart.

**Then leap.** Most stack questions are answerable by a spike — the smallest throwaway thing that
produces an observation — and a spike beats any amount of reading, which is why the reading exists
to aim it rather than to replace it. Scaffolding a hello world under three runtimes and running the
real loop settles more than a week of comparison. Budget hours, not days, and delete the spike
afterwards; the observation is the artifact.

1. Deploy as many parallel subagents as needed to survey the field without bias. Ask each for the
   candidates, the traps, and the specific properties worth observing. Give every option a fair
   chance and wait to see what comes back.
1. Verify the subagents' claims, especially where evidence is lacking. A claim with a citation that
   nobody opened is not verified, and a number with no method behind it is not a measurement.
1. **Write what you have established into the question file before going further**, per "While a
   question is being worked, its file is where the work goes" in `docs/questions/README.md`. Do it
   at each point the picture changes rather than once at the end — research held only in the
   conversation is lost to a context window, and what gets reconstructed later is the summary rather
   than the sourcing. Record the eliminations and the confirmations too, not just the surprises.
1. Name what a spike would settle and what it would not, using what the research just told you to
   look for. If nothing can be spiked, say so explicitly rather than letting the reading you have
   already done become the answer by default.
1. Run the spike. Record what you ran, on what, how many times, and what you observed — a
   measurement without its method is an assertion with a number in it.
1. Analyze the implications from first principles, with reference to `docs/problem.md`,
   `docs/guarantees/` and any other context clarifying what matters to provide users and the
   maintainer with the intended experience
1. Reason your way to the best answer

**Weigh the options by what each forecloses, not by which is better today.** This is what to do
with a pile of research and no obvious winner, and it is usually the step that produces the answer.
Present merit is the weakest criterion available and the one a comparison reaches for first — the
candidates are generally close on it, and the gap that seems to be there is mostly familiarity.

So run each candidate forward instead. Which product futures does it keep reachable, which does it
close, and what would reopening a closed one actually cost — a route, or a migration? The asymmetry
that falls out is the decision. `docs/problem.md` is what says which futures are worth keeping, so
optionality is judged against it rather than against what would be interesting to build.

**Trace the asymmetry rather than asserting it**, because this is the step where a preference gets
laundered into a derivation. Name the specific later work each direction would require. If the
cheap direction cannot be described as concrete work that is genuinely small, the asymmetry is not
established and the argument is doing no work. Check the load-bearing premise underneath it too —
an asymmetry that holds only if some earlier decision goes a particular way is conditional, and
says so.

**Then look for what the reframing has separated.** Reasoning this way tends to split one question
into a short chain: a promise that has to hold, a consequence that follows from it, and only then a
tool that satisfies it. Record them as a chain of small records rather than one large one. Each
link is checkable on its own, and a later reader can disagree with one without having to unpick all
of them.

**Beware of measuring the wrong thing.** A microbenchmark that does not resemble the real workload
is worse than no number, because it looks like evidence. Check that what you measured is what the
decision turns on, that the environment resembles production, and that the difference is large
enough to matter against everything else in the budget. `docs/constraints.md` describes how to
record what you find.

### 5. Present the decision

1. Present your findings and rationale to the user using formatting they can digest in 30 seconds
1. Discuss the user's feedback and questions
1. Proactively conduct further research if needed, using as many parallel subagents as necessary
1. Offer to draft the ADR and wait for the user's approval

### 6. Document the decision

1. **Re-invoke the `uphold-standards` skill for the portable decision-making standard, and re-read
   `docs/decisions/README.md`, now**, immediately before writing. Not at the start of the session —
   now. A summary of them held in working memory for an hour is what produces a record that
   satisfies the format and breaks a Must, and the failure is invisible because the record looks
   complete.
1. Author the ADR
1. For any resolved question files, mine any valuable content and then delete them
1. Update all other docs as needed based on the ADR's implications, including `questions/README.md`,
   `docs/problem.md`, `docs/architecture.md`, `docs/constraints.md`, `docs/guarantees/` and
   `docs/failure-modes/`
