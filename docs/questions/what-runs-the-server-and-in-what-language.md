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

**Gates** [how the codebase is laid out](how-is-the-codebase-laid-out.md).

**Settled by** [where puzzle state lives](does-puzzle-state-live-on-the-client-or-the-server.md).
