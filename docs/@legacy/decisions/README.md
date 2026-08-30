A record of the reasoning behind decisions that took some thought or
could have reasonably gone a different way.

## Status as of 2026-08-29

ADR-01 through ADR-23 predate a full first-principles re-evaluation of
this project's environment and constraints (see `docs/context/`,
`docs/invariants/ux.md`, and
`docs/brainstorming/ruthless-rearchitecture-for-mobile-first-offline-ux.md`).
Treat all of them — including ones a prior pass judged likely to "survive" —
as unconfirmed until each is individually reviewed against the current
foundation, not carried forward by assumption.

## Template

```markdown
## Decision

[the actual choice, plainly stated]

## Why

[reasoning, citing specific docs/context/*.md or docs/invariants/*.md entries]

## Risk

[the real cost or weakness being knowingly accepted]

## Rejected

- [Option A] — because [specific reason]
- [Option B] — because [specific reason]

## Revisit when

[the condition(s) under which this decision should be reconsidered]
```

Not adapted from any existing named ADR format — checked against Nygard,
MADR, Tyree & Akerman, arc42, Y-statements, and others; none match this
shape. Designed for what this project's decisions actually need to answer:
what was chosen, why, what it costs, what else was weighed, and when to
reconsider it.

## Rule: cite context, don't restate it

Every ADR's "Why" must cite specific entries from `docs/context/*.md` (e.g. a
heading in `constraints.md`) or `docs/invariants/*.md` (e.g. a UX-id from
`ux.md`) by reference, not restate their content. `docs/context/` and
`docs/invariants/` are written first and are the standing input; ADRs are
downstream of them, not the other way around. If an ADR's reasoning depends
on a fact or invariant that isn't yet written down, add it there first, then
cite it.

## Guidance

- **Rejected** entries need the actual disqualifying reason, not a bare
  label — "considered X" tells a future reader nothing; "considered X,
  rejected because Y" does.
- Before treating an entry as finished, ask what a sharp reader with none of
  this context would immediately push back on — and check that "Why" or
  "Risk" already answers it.
- The first ADR written under this template should be treated as the
  calibration example for depth — later ones should match it, not a written
  description of "enough."
