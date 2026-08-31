---
number: 0005
status: accepted
date: 2026-08-31
---

# 0005 — One implementation of the puzzle rules

## Forced by

[../guarantees/puzzles.md](../guarantees/puzzles.md) promises every puzzle has exactly one
solution and is reachable by deduction alone. Two implementations of the rules can disagree about
whether a given board satisfies that, and when they do, **nothing surfaces the disagreement**. The
generator concludes it has produced a sound puzzle; the client concludes the player is looking at
an unsound one; both are behaving correctly by their own lights. A promise that can be broken with
no error anywhere is not one this project can keep by intending to.

[../standards/README.md](../standards/README.md) also points at a portable standard requiring a
value derivable from one source not to be maintained separately alongside it. The rules of sudoku
are that kind of value: there is one right answer to whether a board is legal, and holding two
copies of the definition creates exactly the drift that standard exists to prevent.

## Decision

There is one implementation of the puzzle rules — grid representation, legality, solving, and
uniqueness checking — used by every deployable that needs them.

Two things need them today. The **generator** cannot produce a puzzle without them, and the
**client** needs them to tell a player their move conflicts and to recognise a completed board.
The server does not: [ADR-0003](0003-the-server-validates-puzzle-state-but-does-not-arbitrate-it.md)
keeps it out of gameplay, checking that a payload is a well-formed board rather than a legal
position.

## Rejected

- **Two implementations kept in agreement by differential testing** — the generator's output
  validated by the client's validator. This is a genuine option and the strongest rejected one:
  it frees each deployable to use whatever suits it, and property-based differential testing is a
  real mitigation rather than a hopeful one. Rejected because the mitigation is an obligation with
  no end date, it only protects the cases someone thought to generate, and it has to be built and
  maintained before it protects anything. The cost of avoiding divergence is a mild constraint on
  language choice. The cost of managing it is permanent.

- **No rules on the client at all**, letting the server or the generator hold them alone. Rejected
  because the client cannot then tell a player that a digit conflicts or that a board is finished,
  and both are ordinary things a puzzle interface does. It would also contradict
  [ADR-0002](0002-the-client-holds-and-mutates-puzzle-state.md), which requires the client to work
  with no network at all.

## Risk

**This constrains the language choice, and it is the point rather than a side effect.** Whatever
the rules are written in must run in a browser and in a batch process. That is satisfied by any
JavaScript-family language, and by anything reaching the browser through WebAssembly, so the field
stays wide — but it is genuinely narrower than it would otherwise be, and a language that suits
generation beautifully and cannot reach a browser is now excluded on these grounds rather than on
its merits.

**Sharing an implementation is not free, and how it is shared is undecided.** Sharing by source
means one language everywhere. Sharing a compiled artifact means an interop boundary and, for a
browser, a WebAssembly bundle on the initial load — the one place
[../constraints.md](../constraints.md) says size matters, since a cold load over a degraded link
is already several seconds of round trips before any bytes move. Neither cost is paid yet, and
this decision does not choose between them.

**The server may need the rules later.** ADR-0003 defers position validation with a stated
trigger: the moment anything gated depends on a puzzle genuinely being finished. A language the
server cannot run the rules in is closing that door rather than declining to open it, and the
closing would happen quietly, long before the trigger fires.

**One implementation means one place to be wrong.** Shared code concentrates correctness as well
as effort — a subtle error in uniqueness checking is now wrong in the generator and the client
identically, which removes the accidental cross-check that two implementations would have given.
That is the honest counter to the argument above, and it is why the uniqueness property deserves
testing directly rather than by agreement between components.

## Revisit when

- The client stops needing the rules — if it never gives feedback on a move and never recognises
  completion, the sharing pressure disappears and each deployable is free again.
- Sharing a compiled artifact turns out to cost more on initial load than the divergence risk it
  avoids, measured rather than estimated.

## Also update

- [x] The language question this turned on was answered by [ADR-0006](../decisions/0006-typescript-everywhere-with-the-rules-shared-as-source.md) and
      retired — TypeScript, with the rules shared as source rather than as a compiled artifact
- [ ] Nothing in `constraints.md` — this imports no facts
- [ ] Nothing in `guarantees/` — it makes an existing promise keepable rather than adding one

Deliberately not decided here: which language, and whether the shared implementation is shared as
source or as a compiled module.
