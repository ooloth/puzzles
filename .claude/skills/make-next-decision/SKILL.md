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

1. Read `docs/standards/decisions.md`, `docs/product.md`, `docs/constraints.md` and
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

### 3. Research all viable answers

1. Deploy as many parallel subagents as needed to DEEPLY research all viable choices and their
   implications for UX, DX, performance and any other relevant system properties without bias.
   Try hard to give all options a fair chance to win and wait to see what the research says.
1. Verify the subagents' claims, especially where evidence is lacking
1. Analyze the implications from first principles, with reference to `docs/product.md`,
   `docs/guarantees/` and any other context clarifying what matters to provide users and the
   maintainer with the intended experience
1. Reason your way to the best answer

### 4. Present the decision

1. Present your findings and rationale to the user using formatting they can digest in 30 seconds
1. Discuss the user's feedback and questions
1. Proactively conduct further research if needed, using as many parallel subagents as necessary
1. Offer to draft the ADR and wait for the user's approval

### 5. Document the decision

1. Author the ADR
1. For any resolved question files, mine any valuable content and then delete them
1. Update all other docs as needed based on the ADR's implications, including `questions/README.md`,
   `docs/product.md`, `docs/architecture.md`, `docs/constraints.md`, `docs/guarantees/` and
   `docs/failure-modes/`
