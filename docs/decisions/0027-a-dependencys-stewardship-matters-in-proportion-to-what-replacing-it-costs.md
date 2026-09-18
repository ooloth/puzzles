---
number: 27
status: accepted
date: 2026-09-17
---

# 27 — a dependency's stewardship matters in proportion to what replacing it costs

## Forced by

[../problem.md](../problem.md), which states that this project gets active attention for years rather
than being shipped and left running. Under that horizon a dependency going bad is work somebody is
present for rather than an outage nobody fixes, so how long a dependency will last matters less than
what being stuck with it would cost.

The portable decision-making standard, which holds that options are weighed by what each forecloses
rather than by which is better today, and that an asymmetry is traced as concrete later work rather
than asserted. Cost of replacement is that work. Predicted longevity is not.

[what must the client and the server each be able to do?](../questions/what-must-the-client-and-server-be-able-to-do.md),
whose licence property already disqualifies anything carrying a revocable licence. That test is
separate from this record and is unaffected by it.

## Decision

**A candidate is scored on what replacing it would cost, stated as concrete work.** Not on how likely
it is to still be maintained later.

**Facts about a candidate's stewardship are inputs to that score, weighted by how expensive the
position is to reverse.** Where a position is cheap to leave, a concern about who maintains the thing
carries almost no weight, because the exit is an afternoon. Where a position is expensive to leave, the
same concern carries real weight, because being stuck has no cheap answer. The concern is priced
rather than banned.

**Where a record eliminates a candidate on stewardship, it names the replacement cost that made the
concern binding.** A stewardship fact with no replacement cost beside it is an elimination on taste.

Two consequences worth stating, because they are what this changes in practice. The runtime is the
least reversible position in the stack, since everything else sits on it, so supply risk there is
priced highest. A router or a helper library sits behind a thin interface, so supply risk there is
priced near zero and a pre-1.0 version number disqualifies nothing on its own.

## Enforced by

Nothing in code, and nothing a check can run. This constrains later records rather than mandating an
artifact, and it is satisfied by the runtime, renderer, bundler and package manager records each naming
what replacing their choice would cost. A record in that set that eliminates a candidate without
naming that cost has not honoured this one.

The spike those records rest on is what turns the estimate into an observation, per the plan in
[../questions/README.md](../questions/README.md). Until it runs, every replacement cost cited is
reasoned rather than measured, and says so.

## Rejected

- **Stewardship binds as a checkable test, with named signals and thresholds** — because the signals
  invert. Five were measured across the live field and all five pointed the wrong way: foundation
  governance predicted activity and Lit has the strongest governance in the renderer field with one
  release day in twelve months; corporate backing predicted many hands and Rsbuild is 75.5% one human
  under ByteDance; maturity predicted stability and Parcel took 14 commits from four authors in a year;
  youth predicted risk and Bun took 4,610 commits; establishment predicted low concentration and Deno
  is 36.8% one human against Bun's 14.7%. A threshold built on a signal that inverts is worse than no
  threshold, because it produces a confident ranking. **Reverses if** a signal is found that tracks
  the outcome across a whole field rather than on the examples chosen to support it.

  Adopting an existing framework rather than inventing thresholds does not rescue this option, because
  none of them measures the signal the eliminations were reaching for. OpenSSF Scorecard is runnable
  as a CLI, a GitHub Action and a hosted API and is actively maintained, and its `Maintained` check
  measures commit frequency while its `Contributors` check measures the organisational diversity of
  recent contributors. Libraries.io SourceRank's contributor factor is a headcount. OpenSSF
  Criticality Score measures how much the ecosystem depends on a project, so a neglected but
  widely-used one scores high. CHAOSS defines Contributor Absence Factor as the smallest number of
  contributors responsible for half of contributions, which is the right definition, and its turnkey
  implementation is archived in favour of an early replacement. Concentration would have to be
  computed here, and the raw form of it is confounded by automation accounts.

  *Sourced — each tool's own documentation, read by a research agent that listed the checks from the
  published check list rather than from summaries. I did not open them.*

- **Stewardship binds as a judgement recorded per decision, with no fixed threshold** — because it is
  not checkable. Two records could reach opposite conclusions from the same facts and nothing in the
  folder would show it, which is the failure the separability test in
  [README.md](README.md) exists to catch. **Reverses if** the judgements turn out to
  cluster, at which point the cluster is the threshold and the first option applies.

- **Stewardship does not bind at all, and only replacement cost is scored** — because replacement cost
  is identical across every candidate for a given position, so on its own it cannot separate a runtime
  at 0.1.14 with seven authors from one with 428. It would leave the least reversible position in the
  stack decided on nothing. **Reverses if** every position becomes cheaply reversible, which would
  mean the runtime had stopped being load-bearing.

- **Not yet** — because three question files are already eliminating candidates on stewardship, so
  deferring does not keep the option open. It moves the elimination to the spike, where it gets made
  on taste and recorded nowhere. Deferring keeps a question open only when nothing is building on the
  answer.

## Risk

**Replacement cost is an estimate, and it is being made before anything is built.** The claim that
swapping a router is an afternoon and swapping a runtime is not is reasoned from what each position
touches, not observed. If it is wrong, it is wrong in the direction that matters: a position believed
cheap to leave and actually expensive would have had its supply risk priced at near zero.

**"Concrete work" is a softer bar than a threshold.** A determined reader can describe almost any
replacement as small. The check on that is the spike, and until it runs this record is asking for an
argument rather than a measurement.

**Pricing a concern rather than banning it keeps the judgement.** This does not remove taste from the
decision; it requires taste to be stated next to a cost. That is an improvement on an unstated
criterion and it is not the same as a test.

## Revisit when

A dependency this project uses stops being maintained and swapping it turns out to cost materially
more than the record that chose it estimated. That is the observable condition: the estimate is what
this record rests on, and a miss is what would show the estimate cannot carry the weight.

Also when the spike has run, since it replaces reasoned replacement costs with observed ones and may
show the ordering across positions is different from the one assumed here.

## Also update

- [x] questions/README.md — removes the two prerequisite entries from M1 slices 1 and 2, and the
      working-notes bullet that tracked them
- [x] problem.md — carries the horizon this record is forced by
- [x] architecture.md — nothing moved; this defines no boundary
- [x] constraints.md — nothing moved; this imports no fact about the world. The measurements behind it
      are evidence about named projects rather than limits from browsers, networks or law, so they
      stay under **Findings** in the question files they inform
- [x] glossary.md — nothing moved; "replacement cost" is used in its ordinary sense
- [x] guarantees/ — nothing moved; this promises a player nothing
