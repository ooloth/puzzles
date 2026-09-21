---
number: 0027
status: accepted
amended: 2026-09-20
date: 2026-09-17
---

# 27 — a dependency's stewardship matters in proportion to what replacing it costs

## Forced by

The portable decision-making standard already requires options to be weighed by what each forecloses
rather than by which is better today. This record does not restate that. It settles the part that
standard leaves open: what to do with a worry about whether somebody will keep maintaining the thing.

[../problem.md](../problem.md), which states that this project gets active attention for years. Under
that horizon a dependency going bad is work somebody is present for rather than an outage nobody
fixes.

## Decision

**A stewardship fact is weighted by how expensive the position is to reverse.** It is priced, not
banned and not treated as a disqualifier on its own. Where leaving is cheap the worry is worth almost
nothing, because the exit is an afternoon; where leaving is expensive it is worth a great deal,
because being stuck has no cheap answer.

**A record eliminating a candidate on stewardship names the replacement cost that made the concern
binding.** Without that cost beside it, the elimination is taste.

What this changes in practice: the runtime is the least reversible position, since the server, the
generator, the test runner and every script sit on it, so a supply worry is priced highest there; a
router or a helper behind a thin interface is the opposite, and a pre-1.0 version number disqualifies
nothing on its own.

## Enforced by

Nothing in code, and nothing a check can run. It is satisfied by the runtime, renderer, bundler and
package-manager records each naming what replacing their choice would cost. The spike those records
rest on is what turns an estimated cost into an observed one; until it runs, every cost cited is
reasoned rather than measured and says so.

## Rejected

- **Stewardship binds as a checkable test, with named signals and thresholds** — because the signals
  invert. Five were measured across the live field and all five pointed the wrong way: foundation
  governance predicted activity and Lit has the strongest governance of any renderer with one release
  day in twelve months; corporate backing predicted many hands and Rsbuild is 75.5% one human under
  ByteDance; maturity predicted stability and Parcel took 14 commits from four authors in a year;
  youth predicted risk and Bun took 4,610 commits; establishment predicted low concentration and Deno
  is 36.8% one human against Bun's 14.7%. A threshold on an inverting signal is worse than none,
  because it produces a confident ranking.

  Adopting an existing framework does not rescue it. OpenSSF Scorecard is runnable and maintained, and
  measures commit frequency and organisational diversity rather than concentration. Libraries.io
  SourceRank's contributor factor is a headcount. Criticality Score measures how much the ecosystem
  depends on a project, so a neglected but widely-used one scores high. CHAOSS defines Contributor
  Absence Factor correctly and its turnkey implementation is archived. Concentration would have to be
  computed here, and its raw form is confounded by automation accounts.

  **Reverses if** a signal is found that tracks the outcome across a whole field rather than on the
  examples chosen to support it.

  *Measured for the five inversions, with the commands and their caveats recorded in
  [ADR-0030](0030-typescript-outside-the-browser-runs-on-node.md) and under **Findings** in
  [what renders the client?](../questions/what-renders-the-client.md) and
  [what builds the client and serves it in development?](../questions/what-builds-the-client-and-serves-it-in-development.md).
  Sourced for the frameworks — each tool's own documentation and published check list, read by a
  research agent; I did not open them.*

- **Stewardship binds as a judgement recorded per decision, with no fixed threshold** — because it is
  not checkable: two records could reach opposite conclusions from the same facts and nothing would
  show it. **Reverses if** the judgements cluster, at which point the cluster is a threshold and the
  option above applies.

- **Stewardship does not bind at all, and only replacement cost is scored** — because replacement cost
  is identical across candidates for a given position, so alone it cannot separate Andromeda, which has
  never shipped a 1.0 and took 89 commits from seven authors in a year, from Node, which took 3,496
  from 428. Those figures and their method are recorded in
  [ADR-0030](0030-typescript-outside-the-browser-runs-on-node.md).
  **Reverses if** every position becomes cheaply reversible.

- **Not yet** — because three question files were already eliminating candidates on stewardship, so
  deferring does not keep the option open. It moves the elimination to the spike, where it gets made
  on taste and recorded nowhere.

## Risk

**Replacement cost is an estimate made before anything is built.** That swapping a router is an
afternoon and swapping a runtime is not is reasoned from what each position touches, not observed. If
it is wrong it is wrong in the direction that matters: a position believed cheap to leave and actually
expensive would have had its supply risk priced at nearly zero.

**"Concrete work" is a softer bar than a threshold**, and a determined reader can describe almost any
replacement as small. This asks for an argument rather than a measurement until the spike runs.

**One position on the ordering is now established rather than estimated.**
[ADR-0032](0032-the-package-manager-is-pnpm.md) prices leaving the package manager at a lockfile swap
and an edit to every manifest naming a sibling, which is what let it accept a three-week-old
implementation. The runtime's and the renderer's places remain estimates.

## Revisit when

A dependency here stops being maintained and swapping it costs materially more than the record that
chose it estimated. The estimate is what this rests on, and a miss is what shows it cannot carry the
weight.

## Also update

- [x] questions/README.md — removes the two prerequisite entries from M1 slices 1 and 2, and the
      working-notes bullet that tracked them
- [x] problem.md — carries the horizon this record is forced by
- [x] architecture.md — nothing moved; this defines no boundary
- [x] constraints.md — nothing moved; the measurements behind it are evidence about named projects
      rather than limits from browsers, networks or law, so they stay under **Findings** in the
      question files they inform
- [x] glossary.md — nothing moved; "replacement cost" is used in its ordinary sense
- [x] guarantees/ — nothing moved; this promises a player nothing
