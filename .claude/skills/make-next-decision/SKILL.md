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

### 1. Identify the next most important question to answer

1. Read `docs/standards/decisions.md`, `docs/problem.md`, `docs/constraints.md` and
   `docs/questions/README.md`
1. List `docs/decisions/` and `docs/questions/` to familiarize yourself with the sets of made and
   unmade decisions
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

### 3. Settle it by measuring where you can, and research the rest

**Ask first what could be built instead of argued.** Most stack questions are answerable by a spike
— the smallest throwaway thing that produces an observation — and a spike beats any amount of
reading because it measures this project on this hardware rather than someone else's. Scaffolding a
hello world under three runtimes and running the real loop settles more than a week of comparison.
Budget hours, not days, and delete the spike afterwards.

**Research is for finding out what to check, not for reaching the answer.** Its job is to surface
the candidates, the known traps, and the properties worth measuring. Treat a number you read as a
hypothesis about what you will observe, not as a finding.

1. Name what a spike would settle, and what it would not. Anything left over is what research is
   for. If nothing can be spiked, say so explicitly rather than defaulting to reading.
1. Run the spike. Record what you ran, on what, and what you observed — a measurement without its
   method is an assertion.
1. Deploy as many parallel subagents as needed to research whatever the spike cannot reach, without
   bias. Give every option a fair chance and wait to see what comes back.
1. Verify the subagents' claims, especially where evidence is lacking. A claim with a citation that
   nobody opened is not verified, and a number with no method behind it is not a measurement.
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

1. Author the ADR
1. For any resolved question files, mine any valuable content and then delete them
1. Update all other docs as needed based on the ADR's implications, including `questions/README.md`,
   `docs/problem.md`, `docs/architecture.md`, `docs/constraints.md`, `docs/guarantees/` and
   `docs/failure-modes/`
