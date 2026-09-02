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

**Do this before anything else, and be willing to end here.** `docs/standards/decisions.md` holds it
as a Must: a decision the next milestone does not need should not be made yet. The test is not
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
1. Read `docs/guarantees/` for the themes that bear on the question. Promises are not decisions and
   do not appear in `docs/decisions/`, and they bind just as hard.
1. Read `docs/standards/decisions.md`, `docs/problem.md`, `docs/constraints.md` and
   `docs/questions/README.md`
1. List `docs/questions/` to familiarize yourself with the set of unmade decisions
1. Deploy as many parallel subagents as needed to answer all your fact-based questions about the
   codebase or external systems and dependencies and verify all claims
1. Identify the most foundational question that should be answered next
1. Identify any prerequisite decisions that should ideally be made before tackling that question
   (if any). If those questions have not been tracked, track them now.
1. Confirm the question that would be most impactful to answer next

### 2. Present the selected question

1. Present your selected question to the user with your rationale, using formatting they can easily
   digest in 30 seconds
1. Ask the user any outstanding questions that should be deferred to their judgment or preferences
1. Discuss the user's feedback and questions
1. Proactively conduct further research if needed, using as many parallel subagents as necessary
1. Offer to research all viable options and wait for the user's approval

### 3. Look before you leap, then settle it by measuring

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
1. Name what a spike would settle and what it would not, using what the research just told you to
   look for. If nothing can be spiked, say so explicitly rather than letting the reading you have
   already done become the answer by default.
1. Run the spike. Record what you ran, on what, how many times, and what you observed — a
   measurement without its method is an assertion with a number in it.
1. Analyze the implications from first principles, with reference to `docs/problem.md`,
   `docs/guarantees/` and any other context clarifying what matters to provide users and the
   maintainer with the intended experience
1. Reason your way to the best answer

**Beware of measuring the wrong thing.** A microbenchmark that does not resemble the real workload
is worse than no number, because it looks like evidence. Check that what you measured is what the
decision turns on, that the environment resembles production, and that the difference is large
enough to matter against everything else in the budget. `docs/constraints.md` describes how to
record what you find.

### 4. Present the decision

1. Present your findings and rationale to the user using formatting they can digest in 30 seconds
1. Discuss the user's feedback and questions
1. Proactively conduct further research if needed, using as many parallel subagents as necessary
1. Offer to draft the ADR and wait for the user's approval

### 5. Document the decision

1. **Re-read `docs/standards/decisions.md` and `docs/decisions/README.md` now**, immediately before
   writing. Not at the start of the session — now. A summary of them held in working memory for an
   hour is what produces a record that satisfies the format and breaks a Must, and the failure is
   invisible because the record looks complete.
1. Author the ADR
1. For any resolved question files, mine any valuable content and then delete them
1. Update all other docs as needed based on the ADR's implications, including `questions/README.md`,
   `docs/problem.md`, `docs/architecture.md`, `docs/constraints.md`, `docs/guarantees/` and
   `docs/failure-modes/`
