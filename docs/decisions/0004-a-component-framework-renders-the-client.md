---
number: 0004
status: accepted
date: 2026-08-31
amended: 2026-08-31
---

# 0004 — A component framework renders the client

## Forced by

Less than the previous three, and that is worth saying plainly. **No promise in
[../guarantees/](../guarantees/) eliminates any of the candidates.** All of them can render an
81-cell grid, hold state locally, and work offline. This decision rests on judgement rather than
derivation, which makes it weaker than ADR-0002 and ADR-0003 and means the rejected options remain
genuinely viable.

What does bear on it: [../problem.md](../problem.md) ranks the solving experience above everything
else, so nearly all the work will happen in the interface. And the portable standards now hold
that the edit-to-feedback loop should be measured and protected, because it is paid on every
iteration and degrades gradually enough that nobody notices until it is bad.

[ADR-0002](0002-the-client-holds-and-mutates-puzzle-state.md) and
[ADR-0003](0003-the-server-validates-puzzle-state-but-does-not-arbitrate-it.md) also changed what
this is choosing between. The client owns authoritative state, persists it, and runs a
deterministic merge — so the state layer is the demanding part and rendering is the ordinary part.

## Decision

The client is built with a component framework and a dev server providing hot replacement.

This decides the *class*, not the member. Which framework is a separate question, and so is what
provides the build and dev server, because the two are less coupled than they look.

**It also does not decide a language.** A browser runs JavaScript and WebAssembly, which is
forced; everything above that is a choice. Component frameworks with build steps and dev servers
exist for several languages that compile to either, so nothing here narrows that.

## Rejected

- **No framework — web components or plain DOM.** Attractive for having nothing to keep up with
  and nothing leaking into the merge logic. Rejected because the state-to-DOM binding
  is real, ongoing work with no upside for an interface this stateful, and getting it subtly wrong
  is how a merge produces a board that renders differently from what is stored. It also forgoes
  the dev server, which is the thing most worth having here.
- **A minimal rendering library without a framework's other opinions.** Takes on a build step
  anyway while offering less for the state layer, so it pays most of the cost for part of the
  benefit.

## Risk

**This is the decision most likely to be familiarity wearing a reason's clothes.** The
maintainer's existing strength in one ecosystem is a legitimate input — as a *cost of adopting
something else*, never as a merit of the familiar thing — but it is also exactly what would make a
weak argument feel obvious. The measurement named in the follow-up question exists to catch that, and it should
actually be run rather than assumed.

**A dependency whose lifecycle is not ours**, on a project meant to last years. Mitigated by
keeping merge and puzzle logic in pure modules no framework touches, which ADR-0003 already
requires for other reasons — but only if that separation is maintained rather than declared.

**A build step between source and browser.** That is the cost of the loop that justified the
decision, so it is bought deliberately, but it adds a place where things break that has nothing to
do with the app.

**The inner-loop advantage is asserted, not yet measured.** It is the primary argument and it
rests on a category difference that seems obvious and has not been demonstrated on this codebase,
which does not exist yet.

## Revisit when

- The build step becomes what slows the loop rather than what enables it.
- Merge or puzzle logic starts needing framework idioms to be testable — that would mean the
  separation ADR-0003 relies on has failed, and this decision is implicated.
- The framework's release cadence starts costing more attention than the interface does.

## Also update

- [x] `questions/` — [which component framework](../questions/which-component-framework.md) and
      [what provides the build and dev server](../questions/what-provides-the-build-and-dev-server.md)
      replace the answered part of the rendering question
- [x] [how is the app styled?](../questions/how-is-the-app-styled.md) is unblocked by this
- [ ] Nothing in `constraints.md` or `guarantees/` — this imports no facts and makes no promises
