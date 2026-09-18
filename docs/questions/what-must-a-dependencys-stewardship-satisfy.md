---
opened: 2026-09-17
status: open
resolves_into: decision
---

# What must a dependency's stewardship satisfy?

## Why it matters

[What must the client and the server each be able to do?](what-must-the-client-and-server-be-able-to-do.md)
names this gap and stops at naming it: "Nothing in the repository supports a property about how well
maintained a candidate is, and one is missing." Its rule is that a property without a citation is an
assumption somebody has been carrying, and it left the property out rather than softening it.

**The property is already deciding the M1 field anyway.** Three question files eliminate or downweight
candidates on stewardship, and the runtime field has two survivors that only survive because no
binding property removes them. Both are listed under **Findings**.

**The concrete cost of leaving it open.** By the repo's own rules today, Andromeda at 0.1.14 is as
eligible a runtime as Node. Nobody is going to spike Andromeda. So the elimination will happen during
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md)'s spike, on
taste, unrecorded, and the record that follows will inherit it. That is the failure the property list
was written to prevent, reached by the one route it left open.

## What would settle it

Two things, in order. First, whether stewardship binds at all, which is a choice rather than a
derivation: nothing in [../problem.md](../problem.md), [../constraints.md](../constraints.md),
[../guarantees/](../guarantees/) or [../decisions/](../decisions/) supports it, so it cannot be derived
the way every other property in that list was. Second, if it binds, by what test.

A test has to be checkable from outside the project and stated so that two people applying it to the
same candidate agree. Candidate signals, none of them chosen: authorship concentration over a window,
number of releases in a window, whether a stable major exists, whether the licence can be revoked,
whether a migration with no codemod is on the roadmap. Whichever are used, the threshold is the part
that does the work and the part that is easiest to leave unstated.

**It rests on [what horizon is this built for?](what-horizon-is-this-built-for.md)** and cannot be
argued before it. "Well maintained enough" has no meaning without a duration to be enough for, and that
duration is currently assumed rather than stated in all four places this property is being used.

**A licence test already exists and is not this.** [what must the client and the server each be able to
do?](what-must-the-client-and-server-be-able-to-do.md) carries a sourced property that anything adopted
must "carry a licence that permits use inside a hosted service without obliging us to release our own
source, and that cannot be revoked". That one is derived from
[../constraints.md](../constraints.md) and it is what eliminates Elide. Stewardship is the separate
question of whether the people behind a thing will keep it working, and no document supports it.

## Resolves into

A decision record in [../decisions/](../decisions/), which the runtime, renderer, bundler and package
manager records each cite. It is a decision rather than a property added to the list above because it
cannot be derived from anything already written down: a reasonable person could decide either way on
the same evidence, which is this folder's test for a choice.

Where it resolves against binding, the record says so plainly and the eliminations that rest on it are
reversed in the files that hold them.

## Source

Raised 2026-09-17, from the gap named under "What anything adopted must be able to do" in
[what must the client and the server each be able to do?](what-must-the-client-and-server-be-able-to-do.md),
on finding that the property it declined to write was already in use in three other question files.

## Options

*It binds, as a checkable test.* Name the signals and the thresholds, apply them uniformly, record each
elimination with the number that produced it. Strongest against the failure this question exists to
stop, because a threshold written down is a threshold a later reader can disagree with. Its cost is
that any threshold is arbitrary at the margin, and a candidate failing it by one commit is eliminated
by arithmetic rather than by judgement.

*It binds, as a judgement recorded per decision.* Each record says what about a candidate's stewardship
worried it and why, with the evidence, and no threshold is fixed in advance. Cheaper and more honest
about what is actually being assessed. Its cost is that it is not checkable: two records can reach
opposite conclusions on the same facts and nothing in the folder will show it.

*It does not bind; replaceability is scored instead.* The null option, and the one the standards say to
consider. The argument: the cost of a badly stewarded dependency is bounded by what replacing it costs,
so score that directly and stop trying to predict the future. Under this, Andromeda is eliminated (or
not) on what depending on it would cost to undo, and the same test applies to Node. It would reverse
the Solid, Lit and Preact findings in [what renders the client?](what-renders-the-client.md), all three
of which are stewardship arguments and two of which have now been found wrong on their facts.

*Not yet.* Defer, let each record argue its own grounds, and accept that the folder will not be
consistent. Listed rather than dismissed: this folder's rule is that deferring is the default and that
every sequencing error here has moved a question earlier than it belonged. The case against deferring
is specific rather than general, and it is the Andromeda case in **Why it matters**.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Nothing in the repository supports a stewardship property.** A search of
[../problem.md](../problem.md), [../constraints.md](../constraints.md),
[../guarantees/](../guarantees/) and [../decisions/](../decisions/) for "maintained", "maintenance",
"steward", "bus factor", "abandon" and "governance" returns hits only on "maintainer", which
[../problem.md](../problem.md) uses about the person writing this code and never about a dependency.

*Measured — `rg` over those paths, run in this repository on 2026-09-17 by me.*

**Where the property is already in use, and what each claim is worth after checking.** All four were
verified against their sources on 2026-09-17. Two survive, one is wrong, and one has no threshold
behind it:

- **Solid, eliminated in [what renders the client?](what-renders-the-client.md) on 2.0's timing and
  authorship.** The facts hold, with one number corrected: authorship on the 2.0 branch is 89.8%, not
  "over ninety percent". What has no source is the threshold at which a release-candidate major and a
  concentrated author base disqualify anything.
- **Lit, eliminated in [what renders the client?](what-renders-the-client.md) on tooling decay.** The
  stated disqualifier is wrong. Its template *type-checking* rules are errors by default; only the
  unknown-tag and unknown-attribute *linting* rules need strict mode. The elimination does not stand as
  written. See that file for the correction and its source.
- **Preact, downweighted in [what renders the client?](what-renders-the-client.md) against React on
  maintenance concentration.** The facts hold and are now measured. What has no source is that
  concentration outranks a measured bundle difference, which is the comparison the file actually makes.
- **Andromeda and txiki.js, surviving in
  [what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md).** That file
  states plainly that "the attribute that would separate them from the incumbents is maturity, which
  has no source here". txiki.js has since been eliminated on a binding property instead, so Andromeda
  is the live case.

**A stewardship test would reach further than the toolchain, and the record should say how far.**
Everything installed is a dependency, so a test written for a runtime also applies to a router, a
storage wrapper, a test library and whatever generates a precache manifest. A test scoped to "the big
choices" has to say what makes a choice big, or it is a judgement wearing a test's clothes.

**Replaceability and stewardship are not independent, which weakens the null option slightly.** What
makes a dependency cheap to replace is usually that it is small and that its interface is standard, and
both of those also correlate with there being less to maintain. So scoring replaceability alone may
reach the same answers by a shorter route. Recorded as an argument to test rather than one to rely on:
nothing here has checked whether the correlation holds across the actual M1 field.
