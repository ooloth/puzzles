---
opened: 2026-08-30
status: open
---

# What runs the server, and in what language?

**Why it matters** A second language means a second toolchain, dependency ecosystem, CI setup
and context switch — for one maintainer. Sharing puzzle logic between generator, server and
client in a single language removes duplication that otherwise has to be kept in sync by hand.

**Options so far** One language everywhere, or a compiled language for generation.

Note that **performance is not a valid argument here**: generation at these grid sizes isn't
compute-bound (see `constraints.md`). Any case for a second language rests on enjoyment or on
some other benefit, and should say so plainly rather than dressing itself as a speed argument.

**Bearing on this** Puzzle logic — generating, solving, validating — should be pure and
deterministic: no clock, no I/O, and randomness only from an explicit seed. That's what makes a
puzzle reproducible from its seed and testable without a running system. It also sharpens this
question, because a pure module is portable, and one language means the solver and the
validator are the same implementation of the rules rather than two copies that must agree. Two
languages means maintaining that agreement by hand, forever, with no compiler checking it.

**Gates** [how the codebase is laid out](how-is-the-codebase-laid-out.md).

**Settled by** [where puzzle state lives](does-puzzle-state-live-on-the-client-or-the-server.md).
