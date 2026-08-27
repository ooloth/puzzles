# Vision

## Why this exists

- Primarily a craft project: enjoy building something well-made over the next ~year.
- Real (not just theoretical) chance it becomes a main side project if it takes off — but that's upside, not the current mandate.
- An app with borrowed puzzles + amazing UX = success. An app with great generated puzzles + meh UX = failure.

## What "done" looks like at launch

- Small, genuinely public v1 within a few months.
- Open to the internet; expect to be found by a few people, not many.
- Whether launch content is sourced from others or fully self-generated is genuinely undecided, not just "sourcing clears the minimum bar." Sourcing might get real feedback faster; self-generating everything before launch is also on the table. Decide this later, once UI work is further along — not now.
- UI/solving-experience work comes before generator work regardless of which way that decision goes.

## Priority order

1. Solving UX — the harder, more important problem right now. Aiming for world-class, polished.
2. Puzzle generation — deliberately deferred. Enjoyable future challenge, not urgent.
3. Scale — not designing for it yet. Revisit if/when the project actually grows.

## Engineering style

- Rust, "Easy Mode": owned data, liberal `.clone()`, avoid lifetimes/generics/trait gymnastics.
- This is a deliberate simplicity choice, not a naive one — optimize for solo-maintainer clarity over cleverness.
- Add infrastructure/complexity because the app requires it now, not because it might someday.

## State & progress

- Leaning toward server-owned state (per Datastar's philosophy) over client-local state, from v1.
- Not yet decided whether that requires real user accounts at launch — anonymous server-side sessions now, with accounts as a possible future pro-tier gate, is on the table.
- Take small, careful, reversible steps here rather than settling the whole model upfront.

## Ops

- Genuinely undecided — want tradeoffs laid out before committing.
- Dislike Kubernetes-grade complexity.
- Fine with lightweight scripting, especially if GitOps-automatable.

